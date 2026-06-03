import json
import requests
from django.contrib.auth import logout, login, authenticate
from django.db.models import Count, Q
from django.shortcuts import render, redirect
from django.core.paginator import Paginator, EmptyPage
from main import models
from main.forms import RegisterForm, AddressForm, OrderForm, FeedbackForm
from django.conf import settings


def store(request):
    products = models.Product.objects.all()
    base_properties = (
        models.ProductProperty.objects
        .values('base_property_id', 'base_property__name_ru', 'value')
        .annotate(p_count=Count('value'))
        .order_by('base_property_id')
    )
    ordering = ''

    if 'category' in request.GET and request.GET['category']:
        products = products.filter(category_id=request.GET['category'])
        base_properties = base_properties.filter(product__category_id=request.GET['category'])

    selected_properties = {}
    for k, v in request.GET.lists():
        if 'property' in k:
            products = products.filter(productproperty__value__in=v)
            selected_properties[k] = v

    if 'ordering' in request.GET and request.GET['ordering']:
        ordering = request.GET['ordering']
        products = products.order_by(request.GET['ordering'], 'id')
    else:
        products = products.order_by('id')

    search = ''
    if 'search' in request.GET and request.GET['search']:
        search = request.GET['search'].strip()
        products = products.filter(
            Q(name__icontains=search) |
            Q(category__name__icontains=search) |
            Q(maker__name__icontains=search)
        )

    paginated_products = Paginator(products, 24)
    current_page = 1
    if 'page' in request.GET and request.GET['page'] and request.GET['page'].isdigit():
        current_page = int(request.GET['page'])
    try:
        products = paginated_products.page(current_page)
    except EmptyPage:
        products = []

    context = {
        'products': products,
        'categories': models.Category.objects.filter(root_category__isnull=True).order_by('id').select_related('root_category'),
        'baseProperties': base_properties,
        'selectedProperties': selected_properties,
        'ordering': ordering,
        'search': search,
        'currentPage': current_page,
        'totalPages': paginated_products.num_pages,
        'currentCategoryId': int(request.GET['category']) if 'category' in request.GET and request.GET['category'] else '',
        'currentRootCategoryId': int(request.GET['rootCategory']) if 'rootCategory' in request.GET and request.GET['rootCategory'] else '',
        'currentSubCategoryId': int(request.GET['subCategory']) if 'subCategory' in request.GET and request.GET['subCategory'] else '',
    }
    return render(request, 'main/store.html', context)


def product(request, pk):
    try:
        product_obj = models.Product.objects.get(pk=pk)
    except models.Product.DoesNotExist:
        return redirect('/')
    images = product_obj.productimage_set.all()
    preview_pk = images[0].pk if images.count() > 0 else 0
    recommendations = (
        models.Product.objects
        .filter(category_id=product_obj.category.pk, price__lte=product_obj.price + product_obj.price / 2)
        .exclude(pk=product_obj.pk)
        .order_by('id')[:15]
    )
    return render(request, 'main/product.html', context={
        'product': product_obj,
        'images': images,
        'preview_pk': preview_pk,
        'recommendations': recommendations,
    })


def profile(request):
    if request.user.is_anonymous:
        return redirect('/')
    return render(request, template_name='main/profile.html', context={})


def cart(request):
    return render(request, template_name='main/cart.html', context={})


def address_create(request):
    if request.user.is_anonymous or not request.POST:
        return redirect('/')
    redirect_path = '/profile/' if 'redirect_path' in request.POST and request.POST['redirect_path'] == '/profile/' else '/cart/'
    form = AddressForm(request.POST)
    form.create_address(request.user)
    return redirect(redirect_path)


def order_list(request):
    if request.user.is_anonymous:
        return redirect('/')
    orders = models.Order.objects.all().order_by('-created_at')
    return render(request, template_name='main/orders.html', context={'orders': orders})


def order_create(request):
    if request.user.is_anonymous or not request.POST:
        return redirect('/')
    form = OrderForm(request.POST)
    order = form.create_order(request.user)

    BOT_TOKEN = getattr(settings, 'BOT_TOKEN', '')
    CHAT_ID = getattr(settings, 'CHAT_ID', '')

    if order and BOT_TOKEN and CHAT_ID:
        products_list = order.orderproduct_set.values_list('product__name', 'quantity')
        products_str = '\n'.join([f'{name} x{qty} шт.' for name, qty in products_list])
        message = (
            f'<b>Новый заказ</b>\n'
            f'<b>Пользователь</b>: #{request.user.pk} {request.user.username}\n'
            f'<b>Телефон</b>: {order.phone}\n'
            f'<b>Адрес</b>: {order.address.get_address_str()}\n'
            f'<b>Сумма</b>: {round(order.get_total(), 2)} руб.\n'
            f'<b>Товары</b>:\n{products_str}\n\n'
            f'<b>Комментарий</b>: {order.comment}'
        )
        try:
            requests.post(
                url=f'https://api.telegram.org/bot{BOT_TOKEN}/sendMessage',
                data={'chat_id': CHAT_ID, 'text': message, 'parse_mode': 'html'},
                timeout=5,
            )
        except Exception:
            pass  # не роняем сайт если Telegram недоступен

    return redirect('/orders/')


def send_feedback(request):
    response = {}
    if request.POST:
        form = FeedbackForm(request.POST)
        feedback = form.create_feedback()
        response = form.errors.as_data()

        BOT_TOKEN = getattr(settings, 'BOT_TOKEN', '')
        CHAT_ID = getattr(settings, 'CHAT_ID', '')

        if feedback and BOT_TOKEN and CHAT_ID:
            message = (
                f'<b>Новое обращение</b>\n'
                f'<b>Имя</b>: {feedback.name}\n'
                f'<b>Телефон</b>: {feedback.phone}\n'
                f'<b>Email</b>: {feedback.email}\n'
                f'<b>Сообщение</b>: {feedback.comment}'
            )
            try:
                requests.post(
                    url=f'https://api.telegram.org/bot{BOT_TOKEN}/sendMessage',
                    data={'chat_id': CHAT_ID, 'text': message, 'parse_mode': 'html'},
                    timeout=5,
                )
            except Exception:
                pass

    return render(request, 'main/help.html', {'message': response})


def about(request):
    return render(request, 'main/about.html', {})


def address_delete(request, pk):
    if request.user.is_anonymous:
        return redirect('/')
    try:
        address = models.Address.objects.get(pk=pk, user_id=request.user.pk)
        address.delete()
    except models.Address.DoesNotExist:
        pass
    return redirect('/profile/')


def login_store(request):
    if request.user.is_authenticated:
        return redirect('/')
    if request.POST and 'username' in request.POST and 'password' in request.POST:
        user = authenticate(username=request.POST['username'], password=request.POST['password'])
        if user and user.is_authenticated:
            login(request, user)
            return redirect('/')
        return render(request, 'main/login.html', context={'error': 'Неверный логин или пароль.'})
    return render(request, 'main/login.html', context={'error': ''})


def signup(request):
    if request.user.is_authenticated:
        return redirect('/')
    if request.POST:
        form = RegisterForm(request.POST)
        user = form.create_user()
        if user.is_authenticated:
            login(request, user)
            return redirect('/')
        return render(request, 'main/signup.html', context={'errors': form.errors.as_data()})
    return render(request, 'main/signup.html', context={})


def logot_store(request):
    if request.user.is_anonymous:
        return redirect('/')
    logout(request)
    return redirect('/')
