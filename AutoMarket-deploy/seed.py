import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from main.models import Category, Product

# очистка (чтобы не дублировалось)
Product.objects.all().delete()
Category.objects.all().delete()

categories = [
    "Шины",
    "Двигатель",
    "Тормозная система",
    "Подвеска",
    "Электрика"
]

created_categories = []

for cat_name in categories:
    cat = Category.objects.create(name=cat_name)
    created_categories.append(cat)

products = [
    "Шина Michelin X-Ice",
    "Шина Bridgestone Blizzak",
    "Масляный фильтр Bosch",
    "Свеча зажигания NGK",
    "Тормозные колодки Brembo",
    "Амортизатор KYB",
    "Аккумулятор Varta",
    "Генератор Valeo",
    "Стартер Bosch",
    "Радиатор охлаждения"
]

for i in range(50):
    Product.objects.create(
        name=random.choice(products),
        price=random.randint(1000, 20000),
        category=random.choice(created_categories)
    )

print("✅ База заполнена демо-товарами")