
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


DO $$ BEGIN CREATE TYPE "Role" AS ENUM ('BUYER','ADMIN'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "OrderStatus" AS ENUM ('NEW','PROCESSING','SHIPPED','COMPLETED','CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "DeliveryMethod" AS ENUM ('COURIER','PICKUP'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "CouponType" AS ENUM ('PERCENT','FIXED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;


CREATE TABLE IF NOT EXISTS "Category" (
  "id"          TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "name"        TEXT         NOT NULL,
  "slug"        TEXT         NOT NULL,
  "description" TEXT         NOT NULL DEFAULT '',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Category_pkey"     PRIMARY KEY ("id"),
  CONSTRAINT "Category_name_key" UNIQUE ("name"),
  CONSTRAINT "Category_slug_key" UNIQUE ("slug")
);

CREATE TABLE IF NOT EXISTS "Product" (
  "id"          TEXT          NOT NULL DEFAULT gen_random_uuid()::text,
  "pk"          SERIAL,
  "name"        TEXT          NOT NULL,
  "description" TEXT          NOT NULL DEFAULT '',
  "maker"       TEXT          NOT NULL DEFAULT '',
  "price"       DECIMAL(10,2) NOT NULL,
  "stock"       INTEGER       NOT NULL DEFAULT 0,
  "units"       TEXT          NOT NULL DEFAULT 'шт.',
  "img"         TEXT          NOT NULL DEFAULT '',
  "catId"       INTEGER       NOT NULL DEFAULT 0,
  "props"       JSONB         NOT NULL DEFAULT '[]',
  "isActive"    BOOLEAN       NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "categoryId"  TEXT          NOT NULL,
  CONSTRAINT "Product_pkey"   PRIMARY KEY ("id"),
  CONSTRAINT "Product_pk_key" UNIQUE ("pk"),
  CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
);

CREATE TABLE IF NOT EXISTS "User" (
  "id"            TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
  "name"          TEXT         NOT NULL,
  "email"         TEXT         NOT NULL,
  "passwordHash"  TEXT         NOT NULL,
  "role"          "Role"       NOT NULL DEFAULT 'BUYER',
  "phone"         TEXT         NOT NULL DEFAULT '',
  "city"          TEXT         NOT NULL DEFAULT '',
  "street"        TEXT         NOT NULL DEFAULT '',
  "zip"           TEXT         NOT NULL DEFAULT '',
  "loginAttempts" INTEGER      NOT NULL DEFAULT 0,
  "lockUntil"     TIMESTAMP(3),
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey"      PRIMARY KEY ("id"),
  CONSTRAINT "User_email_key" UNIQUE ("email")
);

CREATE TABLE IF NOT EXISTS "Order" (
  "id"             TEXT            NOT NULL DEFAULT gen_random_uuid()::text,
  "totalPrice"     DECIMAL(10,2)   NOT NULL,
  "status"         "OrderStatus"   NOT NULL DEFAULT 'NEW',
  "deliveryCity"   TEXT            NOT NULL,
  "deliveryStreet" TEXT            NOT NULL,
  "deliveryZip"    TEXT            NOT NULL,
  "deliveryMethod" "DeliveryMethod" NOT NULL,
  "contactPhone"   TEXT            NOT NULL,
  "createdAt"      TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId"         TEXT            NOT NULL,
  CONSTRAINT "Order_pkey"      PRIMARY KEY ("id"),
  CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id")
);

CREATE TABLE IF NOT EXISTS "OrderItem" (
  "id"        TEXT          NOT NULL DEFAULT gen_random_uuid()::text,
  "name"      TEXT          NOT NULL,
  "price"     DECIMAL(10,2) NOT NULL,
  "quantity"  INTEGER       NOT NULL,
  "orderId"   TEXT          NOT NULL,
  "productId" TEXT          NOT NULL,
  CONSTRAINT "OrderItem_pkey"           PRIMARY KEY ("id"),
  CONSTRAINT "OrderItem_orderId_fkey"   FOREIGN KEY ("orderId")   REFERENCES "Order"("id")   ON DELETE CASCADE,
  CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id")
);

CREATE TABLE IF NOT EXISTS "CartItem" (
  "id"        TEXT    NOT NULL DEFAULT gen_random_uuid()::text,
  "quantity"  INTEGER NOT NULL,
  "userId"    TEXT    NOT NULL,
  "productId" TEXT    NOT NULL,
  CONSTRAINT "CartItem_pkey"                PRIMARY KEY ("id"),
  CONSTRAINT "CartItem_userId_productId_key" UNIQUE ("userId","productId"),
  CONSTRAINT "CartItem_userId_fkey"    FOREIGN KEY ("userId")    REFERENCES "User"("id")    ON DELETE CASCADE,
  CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id")
);

CREATE TABLE IF NOT EXISTS "Coupon" (
  "id"         TEXT          NOT NULL DEFAULT gen_random_uuid()::text,
  "code"       TEXT          NOT NULL,
  "type"       "CouponType"  NOT NULL,
  "value"      DECIMAL(10,2) NOT NULL,
  "expiresAt"  TIMESTAMP(3),
  "usageLimit" INTEGER,
  "usedCount"  INTEGER       NOT NULL DEFAULT 0,
  "isActive"   BOOLEAN       NOT NULL DEFAULT true,
  "createdAt"  TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Coupon_pkey"     PRIMARY KEY ("id"),
  CONSTRAINT "Coupon_code_key" UNIQUE ("code")
);

CREATE TABLE IF NOT EXISTS "WishlistItem" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId"    TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  CONSTRAINT "WishlistItem_pkey"                 PRIMARY KEY ("id"),
  CONSTRAINT "WishlistItem_userId_productId_key"  UNIQUE ("userId","productId"),
  CONSTRAINT "WishlistItem_userId_fkey"    FOREIGN KEY ("userId")    REFERENCES "User"("id")    ON DELETE CASCADE,
  CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id")
);

-- Индексы
CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "Order_userId_idx"        ON "Order"("userId");
CREATE INDEX IF NOT EXISTS "Order_status_idx"        ON "Order"("status");



INSERT INTO "Category" ("id","name","slug","description","createdAt") VALUES
  ('b032b149-44c7-42a3-a9df-19dd0c224f21','Двигатели','engines','','2026-06-23T20:08:53.849Z'),
  ('cf0a045b-f09f-42dd-82ef-e2f3053146cb','Кузов','body','','2026-06-23T20:08:53.849Z'),
  ('88042951-a88b-4f18-a12b-7b38e6d39cd1','Подвеска','suspension','','2026-06-23T20:08:53.849Z'),
  ('a29b1347-b21c-40c2-9fe9-3252ed957a6a','Тормоза','brakes','','2026-06-23T20:08:53.849Z'),
  ('fc69cd29-34b4-4b72-9bc0-fcadd3d64d3b','Электрика','electrics','','2026-06-23T20:08:53.849Z')
ON CONFLICT DO NOTHING;


INSERT INTO "Product" ("id","pk","name","description","maker","price","stock","units","img","catId","props","isActive","categoryId") VALUES
  ('28ef58d5-74e6-4c71-9f80-2bb843cb18aa',1,'Свечи зажигания NGK BKR6E-11 (4 шт.)','Стандартные свечи зажигания NGK BKR6E-11. Ресурс до 30 000 км.','NGK',890,150,'компл.','https://placehold.co/280x180/fff3cd/6c4a00?text=NGK+BKR6E',111,'[{"value":["Тип","Стандартные"],"Count":2},{"value":["Электрод","Никелевый"],"Count":2},{"value":["Зазор","1,1 мм"],"Count":2}]',true,'b032b149-44c7-42a3-a9df-19dd0c224f21'),
  ('c734c788-ce60-4d7d-b525-58eb9107d719',2,'Тормозные колодки Bosch BP300 (перед.)','Передние тормозные колодки Bosch. Датчик износа в комплекте.','Bosch',2450,60,'компл.','https://placehold.co/280x180/ffd6d6/6c0000?text=Bosch+BP300',21,'[{"value":["Ось","Передняя"],"Count":2},{"value":["Материал","Полуметаллические"],"Count":2},{"value":["Датчик износа","Да"],"Count":2}]',true,'a29b1347-b21c-40c2-9fe9-3252ed957a6a'),
  ('ba7c9df2-75e3-4f50-ba8d-5766519d4b5f',3,'Масляный фильтр Mann W712/75','Масляный фильтр Mann-Filter для автомобилей VAG. Антидренажный клапан.','Mann',420,200,'шт.','https://placehold.co/280x180/d6f5d6/004d00?text=Mann+W712',131,'[{"value":["Тип","Навёртной"],"Count":2},{"value":["Высота","76 мм"],"Count":2},{"value":["Диаметр резьбы","M20x1.5"],"Count":2}]',true,'b032b149-44c7-42a3-a9df-19dd0c224f21'),
  ('25aa66fa-c1a9-49c2-b5ea-71e7c1dbc244',4,'Воздушный фильтр FRAM CA10174','Воздушный фильтр FRAM. Сухой тип, лёгкая замена.','FRAM',650,80,'шт.','https://placehold.co/280x180/d6eaff/003366?text=FRAM+CA10174',13,'[{"value":["Форма","Панельный"],"Count":2},{"value":["Тип","Сухой"],"Count":2},{"value":["Ресурс","15 000 км"],"Count":2}]',true,'b032b149-44c7-42a3-a9df-19dd0c224f21'),
  ('adba04ba-5c9e-40ac-830d-3e48b2dfff09',5,'Ремень ГРМ Gates T43169','Зубчатый ремень ГРМ Gates для двигателей 1.4–2.0 л серии TSI/TFSI.','Gates',1890,40,'шт.','https://placehold.co/280x180/e8d5ff/330066?text=Gates+T43169',13,'[{"value":["Ширина","25 мм"],"Count":2},{"value":["Зубьев","152"],"Count":2},{"value":["Материал","Неопрен"],"Count":2}]',true,'b032b149-44c7-42a3-a9df-19dd0c224f21'),
  ('a1726b94-93d1-4743-b35f-f16b3e6c9b37',6,'Генератор Valeo 437493','Восстановленный генератор Valeo для VW, Audi, Škoda. Ток зарядки 120 А.','Valeo',14900,8,'шт.','https://placehold.co/280x180/ffe8d6/663300?text=Valeo+437493',13,'[{"value":["Напряжение","14 В"],"Count":2},{"value":["Ток","120 А"],"Count":2},{"value":["Состояние","Восстановленный"],"Count":2}]',true,'b032b149-44c7-42a3-a9df-19dd0c224f21'),
  ('6638610e-33e3-4259-8de9-60a27df14416',7,'Радиатор охлаждения Nissens 60789','Радиатор Nissens для Ford Focus II / Mondeo III. Алюминиевый сердечник.','Nissens',6800,15,'шт.','https://placehold.co/280x180/d6f0ff/003355?text=Nissens+60789',121,'[{"value":["Материал","Алюминий/пластик"],"Count":2},{"value":["Ширина","670 мм"],"Count":2},{"value":["Высота","380 мм"],"Count":2}]',true,'b032b149-44c7-42a3-a9df-19dd0c224f21'),
  ('d4f9667a-418f-4716-ae59-88b5cec0c509',8,'Амортизатор Sachs 313 428 (зад., 1 шт.)','Задний амортизатор Sachs для Opel Astra H. Газомасляный тип.','Sachs',3200,30,'шт.','https://placehold.co/280x180/f5f5d6/555500?text=Sachs+313428',31,'[{"value":["Тип","Газомасляный"],"Count":2},{"value":["Ось","Задняя"],"Count":2},{"value":["Длина (мин.)","340 мм"],"Count":2}]',true,'88042951-a88b-4f18-a12b-7b38e6d39cd1'),
  ('c30942be-12bd-4d92-ba20-5806c7052198',9,'Аккумулятор Bosch S5 008 (77 Ач)','Аккумулятор Bosch Silver 77 Ач. Для авто с системой Start&Stop.','Bosch',8950,22,'шт.','https://placehold.co/280x180/d6d6ff/000066?text=Bosch+S5+77Ah',41,'[{"value":["Ёмкость","77 Ач"],"Count":2},{"value":["Пусковой ток","780 А"],"Count":2},{"value":["Полярность","Прямая"],"Count":2}]',true,'fc69cd29-34b4-4b72-9bc0-fcadd3d64d3b'),
  ('51a39af2-d221-4faa-a256-f2a8fb2ae0cf',10,'Лампа H7 Philips X-tremeVision +130% (2 шт.)','Галогенные лампы Philips H7 с увеличенным световым потоком +130%.','Philips',1650,95,'компл.','https://placehold.co/280x180/fffbd6/665500?text=Philips+H7',42,'[{"value":["Цоколь","H7"],"Count":2},{"value":["Мощность","55 Вт"],"Count":2},{"value":["Световой поток","+130%"],"Count":2}]',true,'fc69cd29-34b4-4b72-9bc0-fcadd3d64d3b'),
  ('d76d2944-1513-4d57-96bf-848348506a47',11,'Щётки стеклоочистителя Bosch Aerotwin 650/400','Бескаркасные щётки Bosch Aerotwin. Равномерное прижатие по всей длине.','Bosch',1380,70,'компл.','https://placehold.co/280x180/d6fff5/004433?text=Bosch+Aerotwin',52,'[{"value":["Тип","Бескаркасные"],"Count":2},{"value":["Размер водителя","650 мм"],"Count":2},{"value":["Размер пассажира","400 мм"],"Count":2}]',true,'cf0a045b-f09f-42dd-82ef-e2f3053146cb'),
  ('241e3fb7-2dfb-412d-ad3f-c08dfbe2d88f',12,'Термостат Wahler 4140.80D','Термостат Wahler для двигателей 2.0 TDI VAG. Температура открытия 80°C.','Wahler',740,45,'шт.','https://placehold.co/280x180/ffd6f0/660044?text=Wahler+4140',122,'[{"value":["Температура открытия","80°C"],"Count":2},{"value":["Тип","С корпусом"],"Count":2},{"value":["Диаметр патрубка","40 мм"],"Count":2}]',true,'b032b149-44c7-42a3-a9df-19dd0c224f21'),
  ('018b702a-5e40-4403-9bd9-f56c76c85613',13,'Топливный насос Pierburg 7.02240.51.0','Электрический топливный насос Pierburg для Renault/Nissan. Давление 3,5 бар.','Pierburg',5600,12,'шт.','https://placehold.co/280x180/f0ffd6/336600?text=Pierburg+Fuel',13,'[{"value":["Давление","3,5 бар"],"Count":2},{"value":["Производительность","130 л/ч"],"Count":2},{"value":["Напряжение","12 В"],"Count":2}]',true,'b032b149-44c7-42a3-a9df-19dd0c224f21'),
  ('2396ab90-a620-480a-8007-e1b7be7a3486',14,'Тормозной диск Brembo 08.A438.11 (1 шт.)','Вентилируемый тормозной диск Brembo для BMW 3-й серии E90/E92.','Brembo',2900,28,'шт.','https://placehold.co/280x180/ffd6d6/550000?text=Brembo+Disc',22,'[{"value":["Диаметр","325 мм"],"Count":2},{"value":["Толщина","25 мм"],"Count":2},{"value":["Тип","Вентилируемый"],"Count":2}]',true,'a29b1347-b21c-40c2-9fe9-3252ed957a6a'),
  ('333387cd-5036-49db-93f0-255d68feb76e',15,'Пружина подвески Lesjöfors 4244793 (1 шт.)','Задняя пружина Lesjöfors для Mercedes-Benz C-Class W204. Оцинкованная.','Lesjöfors',2100,18,'шт.','https://placehold.co/280x180/eee/555?text=Lesjofors+Spring',32,'[{"value":["Ось","Задняя"],"Count":2},{"value":["Покрытие","Оцинкование"],"Count":2},{"value":["Жёсткость","Стандарт"],"Count":2}]',true,'88042951-a88b-4f18-a12b-7b38e6d39cd1'),
  ('f1beac75-692a-47de-b380-facdc8a76f5b',16,'Катушка зажигания Delphi GN10570','Катушка зажигания Delphi для Opel/Vauxhall. Первичное сопротивление 0,5 Ом.','Delphi',3100,35,'шт.','https://placehold.co/280x180/fff0d6/664400?text=Delphi+GN10570',112,'[{"value":["Тип","Индивидуальная"],"Count":2},{"value":["Первичное R","0,5 Ом"],"Count":2},{"value":["Вторичное R","5,4 кОм"],"Count":2}]',true,'b032b149-44c7-42a3-a9df-19dd0c224f21')
ON CONFLICT DO NOTHING;

SELECT setval('"Product_pk_seq"', (SELECT MAX(pk) FROM "Product"));


INSERT INTO "User" ("id","name","email","passwordHash","role") VALUES
  (gen_random_uuid()::text, 'admin',           'admin@automarket.ru',  '\\\',  'ADMIN')
ON CONFLICT DO NOTHING;


INSERT INTO "Coupon" ("id","code","type","value","isActive") VALUES
  (gen_random_uuid()::text, 'SALE10', 'PERCENT', 10.00, true)
ON CONFLICT DO NOTHING;

