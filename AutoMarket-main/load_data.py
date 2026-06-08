import shutil
import os


import requests

from store.wsgi import *
from store import settings
from main import models

images_path = settings.BASE_DIR / 'main/static/main/imgs/'

categories = requests.get('https://emex.ru/api/home/tree')
categories_data = categories.json() if categories.status_code == 200 else []
current_category = 1
max_categories = len(categories_data)
for category in categories_data:
    print('_____________')
    print(f'Категория: {current_category} из {max_categories}')
    current_category += 1
    if not 'children' in category:
        continue
    root_category = models.Category.objects.create(name=category['title'])

    sub_current_category = 1
    max_sub_categories = len(category['children'])
    for child in category['children']:
        print(f'Подкатегория: {sub_current_category} из {max_sub_categories}')
        sub_current_category += 1
        category_obj = models.Category.objects.create(name=child['title'], root_category=root_category)
        if 'children' in child:
            child_category = 1
            max_child_categories = len(child['children'])
            for sub_c in child['children']:
                print(f'Подкатегория2: {child_category} из {max_child_categories}')
                child_category += 1
                sub_c_obj = models.Category.objects.create(name=sub_c['title'], root_category=category_obj)
                payload = {
                    "categoryUrl": sub_c["id"],
                    "take": 50
                }
                products = requests.post('https://emex.ru/api/catalogs/products', json=payload,
                                         headers={'Content-Type': 'application/json'})
                products_data = products.json() if products.status_code == 200 else {'items': []}

                current_product = 1
                max_products = len(products_data['items'])
                for product in products_data['items']:
                    print(f'Товар: {current_product} из {max_products}')
                    current_product += 1
                    maker_obj = models.Maker.objects.filter(name=product['makeName'])
                    if len(maker_obj) == 0:
                        maker_obj = models.Maker.objects.create(name=product['makeName'])
                    else:
                        maker_obj = maker_obj[0]
                    try:
                        product_obj = models.Product.objects.create(
                            maker=maker_obj,
                            category=sub_c_obj,
                            name=product['productName'],
                            quantity_value=product['quantity']['value'],
                            quantity_units=product['quantity']['units'],
                            price=product['price']['value'],
                            description=product['description']
                        )
                    except KeyError:
                        continue

                    for property_k, property_v in product['properties'].items():
                        base_property = models.BaseProperty.objects.get_or_create(
                            name=property_k,
                            defaults={
                                'name_ru': property_v['caption'],
                                'units': property_v['units'] if property_v['units'] else ''
                            }
                        )
                        models.ProductProperty.objects.create(
                            product=product_obj,
                            base_property=base_property[0],
                            value=property_v['value'],
                        )

                    for image in product['previewImageUrls']:
                        image_obj = models.ProductImage.objects.create(
                            product=product_obj,
                        )
                        file_name = f'{image_obj.product.pk}-{image_obj.pk}.jpeg'
                        if os.path.isfile(images_path / file_name):
                            image_obj.name = file_name
                            image_obj.save()
                        else:
                            try:
                                r = requests.get(image, stream=True)
                                if r.status_code == 200:
                                    with open(images_path / file_name, 'wb') as f:
                                        r.raw.decode_content = True
                                        shutil.copyfileobj(r.raw, f)
                                    image_obj.name = file_name
                                    image_obj.save()
                                else:
                                    image_obj.delete()
                            except requests.exceptions.ConnectionError:
                                image_obj.delete()
        else:
            payload = {
                "categoryUrl": child["id"],
                "take": 50
            }
            products = requests.post('https://emex.ru/api/catalogs/products', json=payload, headers={'Content-Type': 'application/json'})
            products_data = products.json() if products.status_code == 200 else {'items': []}

            current_product = 1
            max_products = len(products_data['items'])
            for product in products_data['items']:
                print(f'Товар: {current_product} из {max_products}')
                current_product += 1
                maker_obj = models.Maker.objects.filter(name=product['makeName'])
                if len(maker_obj) == 0:
                    maker_obj = models.Maker.objects.create(name=product['makeName'])
                else:
                    maker_obj = maker_obj[0]
                try:
                    product_obj = models.Product.objects.create(
                        maker=maker_obj,
                        category=category_obj,
                        name=product['productName'],
                        quantity_value=product['quantity']['value'],
                        quantity_units=product['quantity']['units'],
                        price=product['price']['value'],
                        description=product['description']
                    )
                except KeyError:
                    continue

                for property_k, property_v in product['properties'].items():
                    base_property = models.BaseProperty.objects.get_or_create(
                        name=property_k,
                        defaults={
                            'name_ru': property_v['caption'],
                            'units': property_v['units'] if property_v['units'] else ''
                        }
                    )
                    models.ProductProperty.objects.create(
                        product=product_obj,
                        base_property=base_property[0],
                        value=property_v['value'],
                    )

                for image in product['previewImageUrls']:
                    image_obj = models.ProductImage.objects.create(
                        product=product_obj,
                    )
                    file_name = f'{image_obj.product.pk}-{image_obj.pk}.jpeg'
                    if os.path.isfile(images_path / file_name):
                        image_obj.name = file_name
                        image_obj.save()
                    else:
                        try:
                            r = requests.get(image, stream=True)
                            if r.status_code == 200:
                                with open(images_path / file_name, 'wb') as f:
                                    r.raw.decode_content = True
                                    shutil.copyfileobj(r.raw, f)
                                image_obj.name = file_name
                                image_obj.save()
                            else:
                                image_obj.delete()
                        except requests.exceptions.ConnectionError:
                            image_obj.delete()
