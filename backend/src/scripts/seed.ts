import 'dotenv/config';
import { prisma } from '../config/db';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('Seeding database...');

  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  // Сбрасываем счётчик pk чтобы товары всегда начинались с 1
  await prisma.$executeRaw`ALTER SEQUENCE "Product_pk_seq" RESTART WITH 1`;
  console.log('Tables cleared');

  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Двигатели', slug: 'engines' } }),
    prisma.category.create({ data: { name: 'Тормоза', slug: 'brakes' } }),
    prisma.category.create({ data: { name: 'Подвеска', slug: 'suspension' } }),
    prisma.category.create({ data: { name: 'Электрика', slug: 'electrics' } }),
    prisma.category.create({ data: { name: 'Кузов', slug: 'body' } }),
  ]);
  const [engines, brakes, suspension, electrics, body] = categories;
  console.log('Categories:', categories.length);

  // Данные полностью соответствуют data.js на фронтенде (catId = числовой id из data.js)
  await prisma.product.createMany({
    data: [
      { name: 'Свечи зажигания NGK BKR6E-11 (4 шт.)', maker: 'NGK', price: 890, stock: 150, units: 'компл.', catId: 111, categoryId: engines.id,
        img: 'https://placehold.co/280x180/fff3cd/6c4a00?text=NGK+BKR6E',
        description: 'Стандартные свечи зажигания NGK BKR6E-11. Ресурс до 30 000 км.',
        props: [['Тип','Стандартные'],['Электрод','Никелевый'],['Зазор','1,1 мм']] },

      { name: 'Тормозные колодки Bosch BP300 (перед.)', maker: 'Bosch', price: 2450, stock: 60, units: 'компл.', catId: 21, categoryId: brakes.id,
        img: 'https://placehold.co/280x180/ffd6d6/6c0000?text=Bosch+BP300',
        description: 'Передние тормозные колодки Bosch. Датчик износа в комплекте.',
        props: [['Ось','Передняя'],['Материал','Полуметаллические'],['Датчик износа','Да']] },

      { name: 'Масляный фильтр Mann W712/75', maker: 'Mann', price: 420, stock: 200, units: 'шт.', catId: 131, categoryId: engines.id,
        img: 'https://placehold.co/280x180/d6f5d6/004d00?text=Mann+W712',
        description: 'Масляный фильтр Mann-Filter для автомобилей VAG. Антидренажный клапан.',
        props: [['Тип','Навёртной'],['Высота','76 мм'],['Диаметр резьбы','M20x1.5']] },

      { name: 'Воздушный фильтр FRAM CA10174', maker: 'FRAM', price: 650, stock: 80, units: 'шт.', catId: 13, categoryId: engines.id,
        img: 'https://placehold.co/280x180/d6eaff/003366?text=FRAM+CA10174',
        description: 'Воздушный фильтр FRAM. Сухой тип, лёгкая замена.',
        props: [['Форма','Панельный'],['Тип','Сухой'],['Ресурс','15 000 км']] },

      { name: 'Ремень ГРМ Gates T43169', maker: 'Gates', price: 1890, stock: 40, units: 'шт.', catId: 13, categoryId: engines.id,
        img: 'https://placehold.co/280x180/e8d5ff/330066?text=Gates+T43169',
        description: 'Зубчатый ремень ГРМ Gates для двигателей 1.4–2.0 л серии TSI/TFSI.',
        props: [['Ширина','25 мм'],['Зубьев','152'],['Материал','Неопрен']] },

      { name: 'Генератор Valeo 437493', maker: 'Valeo', price: 14900, stock: 8, units: 'шт.', catId: 13, categoryId: engines.id,
        img: 'https://placehold.co/280x180/ffe8d6/663300?text=Valeo+437493',
        description: 'Восстановленный генератор Valeo для VW, Audi, Škoda. Ток зарядки 120 А.',
        props: [['Напряжение','14 В'],['Ток','120 А'],['Состояние','Восстановленный']] },

      { name: 'Радиатор охлаждения Nissens 60789', maker: 'Nissens', price: 6800, stock: 15, units: 'шт.', catId: 121, categoryId: engines.id,
        img: 'https://placehold.co/280x180/d6f0ff/003355?text=Nissens+60789',
        description: 'Радиатор Nissens для Ford Focus II / Mondeo III. Алюминиевый сердечник.',
        props: [['Материал','Алюминий/пластик'],['Ширина','670 мм'],['Высота','380 мм']] },

      { name: 'Амортизатор Sachs 313 428 (зад., 1 шт.)', maker: 'Sachs', price: 3200, stock: 30, units: 'шт.', catId: 31, categoryId: suspension.id,
        img: 'https://placehold.co/280x180/f5f5d6/555500?text=Sachs+313428',
        description: 'Задний амортизатор Sachs для Opel Astra H. Газомасляный тип.',
        props: [['Тип','Газомасляный'],['Ось','Задняя'],['Длина (мин.)','340 мм']] },

      { name: 'Аккумулятор Bosch S5 008 (77 Ач)', maker: 'Bosch', price: 8950, stock: 22, units: 'шт.', catId: 41, categoryId: electrics.id,
        img: 'https://placehold.co/280x180/d6d6ff/000066?text=Bosch+S5+77Ah',
        description: 'Аккумулятор Bosch Silver 77 Ач. Для авто с системой Start&Stop.',
        props: [['Ёмкость','77 Ач'],['Пусковой ток','780 А'],['Полярность','Прямая']] },

      { name: 'Лампа H7 Philips X-tremeVision +130% (2 шт.)', maker: 'Philips', price: 1650, stock: 95, units: 'компл.', catId: 42, categoryId: electrics.id,
        img: 'https://placehold.co/280x180/fffbd6/665500?text=Philips+H7',
        description: 'Галогенные лампы Philips H7 с увеличенным световым потоком +130%.',
        props: [['Цоколь','H7'],['Мощность','55 Вт'],['Световой поток','+130%']] },

      { name: 'Щётки стеклоочистителя Bosch Aerotwin 650/400', maker: 'Bosch', price: 1380, stock: 70, units: 'компл.', catId: 52, categoryId: body.id,
        img: 'https://placehold.co/280x180/d6fff5/004433?text=Bosch+Aerotwin',
        description: 'Бескаркасные щётки Bosch Aerotwin. Равномерное прижатие по всей длине.',
        props: [['Тип','Бескаркасные'],['Размер водителя','650 мм'],['Размер пассажира','400 мм']] },

      { name: 'Термостат Wahler 4140.80D', maker: 'Wahler', price: 740, stock: 45, units: 'шт.', catId: 122, categoryId: engines.id,
        img: 'https://placehold.co/280x180/ffd6f0/660044?text=Wahler+4140',
        description: 'Термостат Wahler для двигателей 2.0 TDI VAG. Температура открытия 80°C.',
        props: [['Температура открытия','80°C'],['Тип','С корпусом'],['Диаметр патрубка','40 мм']] },

      { name: 'Топливный насос Pierburg 7.02240.51.0', maker: 'Pierburg', price: 5600, stock: 12, units: 'шт.', catId: 13, categoryId: engines.id,
        img: 'https://placehold.co/280x180/f0ffd6/336600?text=Pierburg+Fuel',
        description: 'Электрический топливный насос Pierburg для Renault/Nissan. Давление 3,5 бар.',
        props: [['Давление','3,5 бар'],['Производительность','130 л/ч'],['Напряжение','12 В']] },

      { name: 'Тормозной диск Brembo 08.A438.11 (1 шт.)', maker: 'Brembo', price: 2900, stock: 28, units: 'шт.', catId: 22, categoryId: brakes.id,
        img: 'https://placehold.co/280x180/ffd6d6/550000?text=Brembo+Disc',
        description: 'Вентилируемый тормозной диск Brembo для BMW 3-й серии E90/E92.',
        props: [['Диаметр','325 мм'],['Толщина','25 мм'],['Тип','Вентилируемый']] },

      { name: 'Пружина подвески Lesjöfors 4244793 (1 шт.)', maker: 'Lesjöfors', price: 2100, stock: 18, units: 'шт.', catId: 32, categoryId: suspension.id,
        img: 'https://placehold.co/280x180/eee/555?text=Lesjofors+Spring',
        description: 'Задняя пружина Lesjöfors для Mercedes-Benz C-Class W204. Оцинкованная.',
        props: [['Ось','Задняя'],['Покрытие','Оцинкование'],['Жёсткость','Стандарт']] },

      { name: 'Катушка зажигания Delphi GN10570', maker: 'Delphi', price: 3100, stock: 35, units: 'шт.', catId: 112, categoryId: engines.id,
        img: 'https://placehold.co/280x180/fff0d6/664400?text=Delphi+GN10570',
        description: 'Катушка зажигания Delphi для Opel/Vauxhall. Первичное сопротивление 0,5 Ом.',
        props: [['Тип','Индивидуальная'],['Первичное R','0,5 Ом'],['Вторичное R','5,4 кОм']] },
    ],
  });
  console.log('Products: 16');

  await prisma.user.createMany({
    data: [
      { name: 'Администратор', email: 'admin@automarket.ru', passwordHash: await bcrypt.hash('admin1234', 10), role: 'ADMIN' },
      { name: 'Иван Покупатель', email: 'buyer@automarket.ru', passwordHash: await bcrypt.hash('buyer1234', 10), role: 'BUYER' },
    ],
  });
  console.log('Users: admin@automarket.ru / admin1234, buyer@automarket.ru / buyer1234');

  await prisma.coupon.create({ data: { code: 'SALE10', type: 'PERCENT', value: 10 } });
  console.log('Coupon: SALE10 (скидка 10%)');

  await prisma.$disconnect();
  console.log('Done!');
}

seed().catch((err) => { console.error(err); process.exit(1); });
