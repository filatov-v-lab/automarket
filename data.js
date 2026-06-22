// ── Конфигурация API ────────────────────────────────────────────────────────────
const API = '/api';

// ── Категории (иерархия хранится здесь, т.к. фронтенд рендерит дерево) ─────────
const CATEGORIES = [
  { id: 1, name: 'Двигатель', subs: [
    { id: 11, name: 'Система зажигания', items: [
      { id: 111, name: 'Свечи зажигания' },
      { id: 112, name: 'Катушки зажигания' }
    ]},
    { id: 12, name: 'Система охлаждения', items: [
      { id: 121, name: 'Радиаторы' },
      { id: 122, name: 'Термостаты' }
    ]},
    { id: 13, name: 'Система смазки', items: [
      { id: 131, name: 'Масляные фильтры' },
      { id: 132, name: 'Масляные насосы' }
    ]}
  ]},
  { id: 2, name: 'Тормозная система', subs: [
    { id: 21, name: 'Тормозные колодки', items: [] },
    { id: 22, name: 'Тормозные диски', items: [] }
  ]},
  { id: 3, name: 'Подвеска', subs: [
    { id: 31, name: 'Амортизаторы', items: [] },
    { id: 32, name: 'Пружины подвески', items: [] }
  ]},
  { id: 4, name: 'Электрооборудование', subs: [
    { id: 41, name: 'Аккумуляторы', items: [] },
    { id: 42, name: 'Освещение', items: [] }
  ]},
  { id: 5, name: 'Кузов и интерьер', subs: [
    { id: 51, name: 'Зеркала', items: [] },
    { id: 52, name: 'Щётки стеклоочистителя', items: [] }
  ]}
];

// ── Товары: загружаются с API ────────────────────────────────────────────────────
let PRODUCTS = [];

// Преобразуем поля API в формат, который ожидает фронтенд
function adaptProduct(p) {
  return {
    pk: p.pk,
    name: p.name,
    maker: p.maker || '',
    price: Number(p.price),
    qty: p.stock,
    units: p.units || 'шт.',
    cat: p.catId,
    img: p.img || '',
    desc: p.description || '',
    props: Array.isArray(p.props) ? p.props : [],
  };
}

// dataReady — Promise, который резолвится когда PRODUCTS загружены
// Страницы вызывают: dataReady.then(() => renderAll())
const dataReady = fetch(`${API}/products?limit=200`)
  .then(r => r.json())
  .then(res => {
    PRODUCTS = (res.data?.items || []).map(adaptProduct);
  })
  .catch(() => {
    console.warn('Не удалось загрузить товары с API — данные пустые');
  });

// ── Cart (localStorage, работает для гостей) ────────────────────────────────────
const Cart = {
  get() { try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; } },
  save(c) { localStorage.setItem('cart', JSON.stringify(c)); },
  add(pk, qty = 1) {
    const c = this.get().filter(i => i.pk !== pk);
    const p = PRODUCTS.find(p => p.pk === pk);
    if (p) c.push({ pk, qty, name: p.name, price: p.price, img: p.img, units: p.units, maxQty: p.qty });
    this.save(c);
  },
  remove(pk) { this.save(this.get().filter(i => i.pk !== pk)); },
  setQty(pk, qty) { this.save(this.get().map(i => i.pk === pk ? { ...i, qty } : i)); },
  clear() { this.save([]); },
  count() { return this.get().reduce((s, i) => s + i.qty, 0); },
  total() { return this.get().reduce((s, i) => s + i.price * i.qty, 0); }
};

// ── Auth (JWT через API) ─────────────────────────────────────────────────────────
const Auth = {
  getToken() { return localStorage.getItem('token'); },
  getCurrent() { try { return JSON.parse(localStorage.getItem('currentUser')) || null; } catch { return null; } },

  async login(emailOrUsername, password) {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrUsername, password }),
      });
      const data = await res.json();
      if (!res.ok) return false;
      localStorage.setItem('token', data.data.token);
      // Сохраняем в том же формате что ожидает renderNavAuth
      localStorage.setItem('currentUser', JSON.stringify({
        username: data.data.user.name,
        firstName: data.data.user.name,
        email: data.data.user.email,
        role: data.data.user.role,
      }));
      return true;
    } catch { return false; }
  },

  async register(userData) {
    try {
      const name = [userData.firstName, userData.lastName].filter(Boolean).join(' ') || userData.username;
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: userData.email, password: userData.password }),
      });
      const data = await res.json();
      if (!res.ok) return data.message || 'Ошибка регистрации';
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('currentUser', JSON.stringify({
        username: data.data.user.name,
        firstName: name,
        email: data.data.user.email,
        role: data.data.user.role,
      }));
      return null; // null = успех
    } catch { return 'Ошибка соединения с сервером'; }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }
};

// ── Navbar ───────────────────────────────────────────────────────────────────────
function renderNavAuth() {
  const el = document.getElementById('nav-auth');
  if (!el) return;
  const user = Auth.getCurrent();
  if (user) {
    el.className = 'nav-item dropdown';
    el.innerHTML = `
      <button class="nav-link dropdown-toggle px-2" role="button" data-bs-toggle="dropdown" aria-expanded="false">
        <i class="bi bi-person-fill"></i> ${user.firstName || user.username}
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><span class="dropdown-item-text text-body-secondary small">@${user.username}</span></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="#" onclick="doLogout()"><i class="bi bi-box-arrow-right me-2"></i>Выйти</a></li>
      </ul>`;
  } else {
    el.className = 'nav-item';
    el.innerHTML = `<a class="nav-link" href="signin.html"><i class="bi bi-person"></i> Войти</a>`;
  }
}

function doLogout() {
  Auth.logout();
  location.href = 'index.html';
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  badge.style.display = Cart.count() > 0 ? 'inline-block' : 'none';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { updateCartBadge(); renderNavAuth(); });
} else {
  updateCartBadge();
  renderNavAuth();
}
