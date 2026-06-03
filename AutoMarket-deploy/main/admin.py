from django.contrib import admin
from main import models


# Register your models here.
@admin.register(models.Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "root_category",
        "id",
    ]
    search_fields = ["name"]


@admin.register(models.Maker)
class MakerAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "id",
    ]
    search_fields = ["name"]


class ProductPropertyInline(admin.TabularInline):
    model = models.ProductProperty


class ProductImageInline(admin.TabularInline):
    model = models.ProductImage


@admin.register(models.Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "category",
        "quantity_value",
        "quantity_units",
        "price",
        "id",
    ]
    inlines = [ProductPropertyInline, ProductImageInline]
    search_fields = ["name"]
    list_filter = ['category']


@admin.register(models.ProductProperty)
class ProductPropertyAdmin(admin.ModelAdmin):
    list_display = [
        "product",
        "base_property",
        "value",
        "id",
    ]
    search_fields = ["base_property"]


@admin.register(models.BaseProperty)
class BasePropertyAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "name_ru",
        "id",
    ]
    search_fields = ["name", 'name_ru']


@admin.register(models.ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = [
        "product",
        "id",
    ]
    search_fields = ["name"]


@admin.register(models.Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "city",
        'street',
        'house',
        'entrance',
        "id",
    ]
    search_fields = ["user"]


class OrderProductInline(admin.TabularInline):
    model = models.OrderProduct


@admin.register(models.Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "address",
        "phone",
        "id",
    ]
    inlines = [OrderProductInline]
    search_fields = ["user"]


@admin.register(models.OrderProduct)
class OrderProductAdmin(admin.ModelAdmin):
    list_display = [
        "order",
        "product",
        "id",
    ]
    search_fields = ["order"]


@admin.register(models.Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "email",
        "phone",
        "comment",
        "id",
    ]
    search_fields = ["email", "phone"]
