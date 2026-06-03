from django.urls import path
from main import views

app_name = 'main'

urlpatterns = [
    path('product/<int:pk>/', views.product, name='product'),
    path('login-store/', views.login_store, name='login-store'),
    path('profile/', views.profile, name='profile'),
    path('address/delete/<int:pk>/', views.address_delete, name='address-delete'),
    path('address/create/', views.address_create, name='address-create'),
    path('order/create/', views.order_create, name='order-create'),
    path('orders/', views.order_list, name='orders'),
    path('cart/', views.cart, name='cart'),
    path('help/', views.send_feedback, name='help'),
    path('about/', views.about, name='about'),
    path('signup/', views.signup, name='signup'),
    path('logout-store/', views.logot_store, name='logout-store'),
    path('', views.store, name='home')
]
