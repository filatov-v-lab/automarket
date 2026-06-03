from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class Category(models.Model):
    name = models.CharField(max_length=128, null=True, blank=True, verbose_name='Наименование')
    root_category = models.ForeignKey("self", on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Корневая категория')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')

    def __str__(self):
        root_category = f'{self.root_category} >> ' if self.root_category else ''
        return f'{root_category}{self.pk} - {self.name}'

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'


# Create your models here.
class Maker(models.Model):
    name = models.CharField(max_length=128, null=True, blank=True, verbose_name='Наименование', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')

    def __str__(self):
        return f'{self.pk} - {self.name}'

    class Meta:
        verbose_name = 'Производитель'
        verbose_name_plural = 'Производители'


class Product(models.Model):
    maker = models.ForeignKey(Maker, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Производитель')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Категория')
    name = models.CharField(max_length=256, null=True, blank=True, verbose_name='Наименование', db_index=True)
    quantity_value = models.DecimalField(decimal_places=2, max_digits=12, null=True, blank=True, verbose_name='Количество')
    quantity_units = models.CharField(max_length=64, null=True, blank=True, verbose_name='Количество (ед. изм.)')
    price = models.DecimalField(decimal_places=2, max_digits=12, null=True, blank=True, verbose_name='Цена', db_index=True)
    description = models.TextField(null=True, blank=True, verbose_name='Описание')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')

    def __str__(self):
        return f'{self.pk} - {self.name}'

    def get_images(self):
        return self.productimage_set.all()

    def get_preview(self):
        return self.productimage_set.first()

    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'


class BaseProperty(models.Model):
    name = models.CharField(max_length=256, unique=True, null=True, blank=True, verbose_name='Наименование (en)', db_index=True)
    name_ru = models.CharField(max_length=256, null=True, blank=True, verbose_name='Наименование (ru)', db_index=True)
    units = models.CharField(max_length=256, null=True, blank=True, verbose_name='Ед. изм.')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')

    def __str__(self):
        return f'{self.pk} - {self.name} ({self.name_ru})'

    class Meta:
        verbose_name = 'Характеристика'
        verbose_name_plural = 'Характеристики'


class ProductProperty(models.Model):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Товар')
    base_property = models.ForeignKey(BaseProperty, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Характеристика')
    value = models.CharField(max_length=256, null=True, blank=True, verbose_name='Значение')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')

    def __str__(self):
        return f'{self.pk} - {self.product} ({self.base_property})'

    class Meta:
        verbose_name = 'Характеристика товара'
        verbose_name_plural = 'Характеристики товаров'


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Товар')
    name = models.CharField(max_length=256, null=True, blank=True, verbose_name='Наименование')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')

    def __str__(self):
        return f'{self.pk} - {self.name}'

    class Meta:
        verbose_name = 'Картинка товара'
        verbose_name_plural = 'Картинки товаров'


class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Пользователь')
    city = models.CharField(max_length=256, null=False, blank=False, verbose_name='Город')
    street = models.CharField(max_length=256, null=False, blank=False, verbose_name='Улица')
    house = models.CharField(max_length=256, null=False, blank=False, verbose_name='Дом')
    entrance = models.CharField(max_length=256, null=True, blank=True, verbose_name='Подъезд')
    comment = models.TextField(null=True, blank=True, verbose_name='Комментарий')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')

    def __str__(self):
        return f'{self.pk} - {self.user.username} {self.city} {self.street} {self.house}'

    def get_address_str(self):
        entrance = f', {self.entrance}' if self.entrance else ''
        return f'г. {self.city}, {self.street}, {self.house}{entrance}'

    class Meta:
        unique_together = ('user', 'city', 'street', 'house', 'entrance')
        verbose_name = 'Адрес'
        verbose_name_plural = 'Адреса'


class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Пользователь')
    address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Адрес')
    phone = models.CharField(max_length=256, null=False, blank=False, verbose_name='Телефон')
    comment = models.TextField(null=True, blank=True, verbose_name='Комментарий')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')

    def __str__(self):
        return f'{self.pk} - {self.user.username} -> {self.address}'

    def get_total(self):
        products = self.orderproduct_set.values('quantity', 'product__price')
        total = sum([p['quantity'] * p['product__price'] for p in products])
        return total

    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'


class OrderProduct(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, verbose_name='Заказ')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name='Товар')
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=1, null=False, blank=False, verbose_name='Количество')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')

    def __str__(self):
        return f'{self.pk} - {self.order} -> {self.product}'

    class Meta:
        verbose_name = 'Товар заказа'
        verbose_name_plural = 'Товары заказов'


class Feedback(models.Model):
    email = models.EmailField(max_length=126, null=False, blank=False, verbose_name='Email')
    phone = models.CharField(max_length=126, null=False, blank=False, verbose_name='Телефон')
    name = models.CharField(max_length=256, null=False, blank=False, verbose_name='Имя')
    comment = models.TextField(null=True, blank=True, verbose_name='Обращение')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Создано')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Обновлено')

    def __str__(self):
        return f'{self.pk} - {self.email} -> {self.phone}'

    class Meta:
        verbose_name = 'Обращение'
        verbose_name_plural = 'Обращения'
