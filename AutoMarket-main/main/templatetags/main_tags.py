import json

from django.core import serializers
from django import template

register = template.Library()


@register.filter(name="make_range")
def make_range(n):
    return range(n)


@register.filter(name="model_obj_to_json")
def model_obj_to_json(o):
    qs_json = serializers.serialize('json', [o])
    obj_json = json.dumps(json.loads(qs_json)[0])
    return obj_json


@register.filter(name="text_clear")
def text_clear(s: str):
    return s.replace(u'\xa0', ' ')
