from django.contrib.auth.models import User, AnonymousUser
from django.contrib.auth.forms import UserCreationForm
from django.db.utils import IntegrityError
from django.forms import ModelForm, Form, CharField, IntegerField
from main import models


class RegisterForm(UserCreationForm):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password1', 'password2']

    def create_user(self):
        if not self.is_valid():
            return AnonymousUser()
        user = User.objects.create_user(
            username=self.data['username'],
            email=self.data['email'],
            password=self.data['password1'],
            first_name=self.data['first_name'],
            last_name=self.data['last_name'],
        )
        return user


class AddressForm(ModelForm):
    class Meta:
        model = models.Address
        fields = [
            'city',
            'street',
            'house',
            'entrance',
            'comment',
        ]

    def create_address(self, user):
        if user.is_anonymous or not self.is_valid():
            return False
        try:
            models.Address.objects.create(
                user=user,
                city=self.data['city'],
                street=self.data['street'],
                house=self.data['house'],
                entrance=self.data['entrance'],
                comment=self.data['comment'],
            )
        except IntegrityError:
            return False
        return True


class OrderForm(Form):
    address = IntegerField()
    phone = CharField(strip=True)
    comment = CharField(strip=True, required=False)

    def create_order(self, user):
        if user.is_anonymous or not self.is_valid():
            return False
        order = models.Order.objects.create(
            user=user,
            address_id=self.data['address'],
            phone=self.data['phone'],
            comment=self.data['comment'],
        )
        for k, v in self.data.items():
            if 'product' in k and v.isdigit() and k.replace('product', '').isdigit():
                models.OrderProduct.objects.create(
                    product_id=k.replace('product', ''),
                    quantity=v,
                    order=order
                )
        return order


class FeedbackForm(ModelForm):
    class Meta:
        model = models.Feedback
        fields = [
            "email",
            "phone",
            "name",
            "comment",
        ]

    def create_feedback(self):
        if not self.is_valid():
            return False
        return models.Feedback.objects.create(
            email=self.data['email'],
            phone=self.data['phone'],
            name=self.data['name'],
            comment=self.data['comment'],
        )
