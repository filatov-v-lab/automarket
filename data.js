// ── Mock data ──────────────────────────────────────────────────────────────────

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

const PRODUCTS = [
  { pk: 1,  name: 'Свечи зажигания NGK BKR6E-11 (4 шт.)',           maker: 'NGK',      price: 890,   qty: 150, units: 'компл.', cat: 111, img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Spark_plug.jpg/640px-Spark_plug.jpg',         desc: 'Стандартные свечи зажигания NGK BKR6E-11 для большинства бензиновых двигателей. Надёжный ресурс — до 30 000 км.', props: [['Тип','Стандартные'],['Электрод','Никелевый'],['Зазор','1,1 мм']] },
  { pk: 2,  name: 'Тормозные колодки Bosch BP300 (перед.)',           maker: 'Bosch',    price: 2450,  qty: 60,  units: 'компл.', cat: 21,  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Brake_pad.jpg/640px-Brake_pad.jpg',         desc: 'Передние тормозные колодки Bosch для автомобилей малого и среднего класса. Датчик износа в комплекте.', props: [['Ось','Передняя'],['Материал','Полуметаллические'],['Датчик износа','Да']] },
  { pk: 3,  name: 'Масляный фильтр Mann W712/75',                    maker: 'Mann',     price: 420,   qty: 200, units: 'шт.',    cat: 131, img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Oil_filter_for_a_car.jpg/640px-Oil_filter_for_a_car.jpg',           desc: 'Высококачественный масляный фильтр Mann-Filter для большинства автомобилей VAG группы. Антидренажный клапан.', props: [['Тип','Навёртной'],['Высота','76 мм'],['Диаметр резьбы','M20x1.5']] },
  { pk: 4,  name: 'Воздушный фильтр FRAM CA10174',                   maker: 'FRAM',     price: 650,   qty: 80,  units: 'шт.',    cat: 13,  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Air_filter.jpg/640px-Air_filter.jpg',        desc: 'Воздушный фильтр FRAM для защиты двигателя от пыли и грязи. Сухой тип, лёгкая замена.', props: [['Форма','Панельный'],['Тип','Сухой'],['Ресурс','15 000 км']] },
  { pk: 5,  name: 'Ремень ГРМ Gates T43169',                         maker: 'Gates',    price: 1890,  qty: 40,  units: 'шт.',    cat: 13,  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Timing_belt.jpg/640px-Timing_belt.jpg',        desc: 'Высокопрочный зубчатый ремень ГРМ Gates для двигателей 1.4–2.0 л серии TSI/TFSI.', props: [['Ширина','25 мм'],['Зубьев','152'],['Материал','Неопрен']] },
  { pk: 6,  name: 'Генератор Valeo 437493',                          maker: 'Valeo',    price: 14900, qty: 8,   units: 'шт.',    cat: 13,  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Car_Alternator.jpg/640px-Car_Alternator.jpg',        desc: 'Восстановленный генератор Valeo для автомобилей Volkswagen, Audi, Škoda, SEAT. Ток зарядки 120 А.', props: [['Напряжение','14 В'],['Ток','120 А'],['Состояние','Восстановленный']] },
  { pk: 7,  name: 'Радиатор охлаждения Nissens 60789',               maker: 'Nissens',  price: 6800,  qty: 15,  units: 'шт.',    cat: 121, img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Radiator_1.jpg/640px-Radiator_1.jpg',       desc: 'Радиатор системы охлаждения Nissens для Ford Focus II / Mondeo III. Алюминиевый сердечник.', props: [['Материал','Алюминий/пластик'],['Ширина','670 мм'],['Высота','380 мм']] },
  { pk: 8,  name: 'Амортизатор Sachs 313 428 (зад., 1 шт.)',         maker: 'Sachs',    price: 3200,  qty: 30,  units: 'шт.',    cat: 31,  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Shock_absorber.jpg/640px-Shock_absorber.jpg',        desc: 'Задний амортизатор Sachs для Opel Astra H. Газомасляный тип, двухтрубная конструкция.', props: [['Тип','Газомасляный'],['Ось','Задняя'],['Длина (мин.)','340 мм']] },
  { pk: 9,  name: 'Аккумулятор Bosch S5 008 (77 Ач)',               maker: 'Bosch',    price: 8950,  qty: 22,  units: 'шт.',    cat: 41,  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Car_battery.jpg/640px-Car_battery.jpg',        desc: 'Стартерный аккумулятор Bosch Silver 77 Ач. Подходит для автомобилей с системой Start&Stop.', props: [['Ёмкость','77 Ач'],['Пусковой ток','780 А'],['Полярность','Прямая']] },
  { pk: 10, name: 'Лампа H7 Philips X-tremeVision +130% (2 шт.)',   maker: 'Philips',  price: 1650,  qty: 95,  units: 'компл.', cat: 42,  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Halogen_bulb_H7.jpg/640px-Halogen_bulb_H7.jpg',          desc: 'Галогенные лампы ближнего/дальнего света Philips H7 с увеличенным световым потоком +130%.', props: [['Цоколь','H7'],['Мощность','55 Вт'],['Световой поток','+130%']] },
  { pk: 11, name: 'Щётки стеклоочистителя Bosch Aerotwin 650/400',  maker: 'Bosch',    price: 1380,  qty: 70,  units: 'компл.', cat: 52,  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Windshield_wiper.jpg/640px-Windshield_wiper.jpg',       desc: 'Бескаркасные щётки стеклоочистителя Bosch Aerotwin. Равномерное прижатие по всей длине.', props: [['Тип','Бескаркасные'],['Размер водителя','650 мм'],['Размер пассажира','400 мм']] },
  { pk: 12, name: 'Термостат Wahler 4140.80D',                       maker: 'Wahler',   price: 740,   qty: 45,  units: 'шт.',    cat: 122, img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Car_thermostat.jpg/640px-Car_thermostat.jpg',          desc: 'Термостат Wahler для двигателей 2.0 TDI VAG. Температура открытия 80°C.', props: [['Температура открытия','80°C'],['Тип','С корпусом'],['Диаметр патрубка','40 мм']] },
  { pk: 13, name: 'Топливный насос Pierburg 7.02240.51.0',           maker: 'Pierburg', price: 5600,  qty: 12,  units: 'шт.',    cat: 13,  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Fuel_pump.jpg/640px-Fuel_pump.jpg',      desc: 'Электрический топливный насос Pierburg для Renault/Nissan. Давление 3,5 бар.', props: [['Давление','3,5 бар'],['Производительность','130 л/ч'],['Напряжение','12 В']] },
  { pk: 14, name: 'Тормозной диск Brembo 08.A438.11 (1 шт.)',       maker: 'Brembo',   price: 2900,  qty: 28,  units: 'шт.',    cat: 22,  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Brake_rotor.jpg/640px-Brake_rotor.jpg',        desc: 'Вентилируемый тормозной диск Brembo для BMW 3-й серии E90/E92. Увеличенный ресурс.', props: [['Диаметр','325 мм'],['Толщина','25 мм'],['Тип','Вентилируемый']] },
  { pk: 15, name: 'Пружина подвески Lesjöfors 4244793 (1 шт.)',      maker: 'Lesjöfors', price: 2100, qty: 18,  units: 'шт.',    cat: 32,  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Coil_spring.jpg/640px-Coil_spring.jpg',    desc: 'Задняя пружина подвески Lesjöfors для Mercedes-Benz C-Class W204. Оцинкованная.', props: [['Ось','Задняя'],['Покрытие','Оцинкование'],['Жёсткость','Стандарт']] },
  { pk: 16, name: 'Катушка зажигания Delphi GN10570',                maker: 'Delphi',   price: 3100,  qty: 35,  units: 'шт.',    cat: 112, img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Ignition_coil.jpg/640px-Ignition_coil.jpg',       desc: 'Катушка зажигания Delphi индивидуального типа для Opel/Vauxhall. Первичное сопротивление 0,5 Ом.', props: [['Тип','Индивидуальная'],['Первичное R','0,5 Ом'],['Вторичное R','5,4 кОм']] },
];

// ── Cart helpers ────────────────────────────────────────────────────────────────
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
  setQty(pk, qty) {
    const c = this.get().map(i => i.pk === pk ? { ...i, qty } : i);
    this.save(c);
  },
  clear() { this.save([]); },
  count() { return this.get().reduce((s, i) => s + i.qty, 0); },
  total() { return this.get().reduce((s, i) => s + i.price * i.qty, 0); }
};

// ── Auth ────────────────────────────────────────────────────────────────────────
const Auth = {
  // Demo users stored in localStorage
  getUsers() { try { return JSON.parse(localStorage.getItem('users')) || []; } catch { return []; } },
  saveUsers(u) { localStorage.setItem('users', JSON.stringify(u)); },
  getCurrent() { try { return JSON.parse(localStorage.getItem('currentUser')) || null; } catch { return null; } },
  login(username, password) {
    const user = this.getUsers().find(u => u.username === username && u.password === password);
    if (user) { localStorage.setItem('currentUser', JSON.stringify(user)); return true; }
    return false;
  },
  register(data) {
    const users = this.getUsers();
    if (users.find(u => u.username === data.username)) return 'Такой логин уже занят.';
    if (users.find(u => u.email === data.email)) return 'Этот email уже зарегистрирован.';
    users.push(data);
    this.saveUsers(users);
    localStorage.setItem('currentUser', JSON.stringify(data));
    return null; // null = success
  },
  logout() { localStorage.removeItem('currentUser'); }
};

// ── Navbar renderer ─────────────────────────────────────────────────────────────
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

// ── Badge update ────────────────────────────────────────────────────────────────
function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  
  badge.style.display = Cart.count() > 0 ? 'inline-block' : 'none';
}

// Scripts loaded at end of <body> — DOM already ready, call directly
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { updateCartBadge(); renderNavAuth(); });
} else {
  updateCartBadge();
  renderNavAuth();
}
