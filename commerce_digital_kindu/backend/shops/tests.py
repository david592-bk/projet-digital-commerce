from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import MerchantProfile, Product

User = get_user_model()

class ShopAndProductAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='shopowner',
            email='owner@example.com',
            password='password123',
        )
        self.other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='password123',
        )
        self.shop_data = {
            'name': 'Ma Boutique',
            'description': 'Boutique de test',
            'address': '1 Rue Principale',
            'opening_hours': '8h-18h',
            'is_active': True,
        }
        self.product_data = {
            'name': 'Produit Test',
            'item_type': 'product',
            'category': 'autre',
            'description': 'Description du produit',
            'price': '1500.00',
            'currency': 'XAF',
            'stock': 12,
            'is_featured': False,
        }

    def test_create_shop_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/shops/', self.shop_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], self.shop_data['name'])
        self.assertEqual(response.data['owner'], self.user.id)

    def test_create_shop_unauthenticated(self):
        response = self.client.post('/api/shops/', self.shop_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_shop_me_without_shop_returns_404(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/shops/me/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_list_shops(self):
        MerchantProfile.objects.create(owner=self.user, **self.shop_data)
        response = self.client.get('/api/shops/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_retrieve_shop_detail(self):
        shop = MerchantProfile.objects.create(owner=self.user, **self.shop_data)
        response = self.client.get(f'/api/shops/{shop.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.shop_data['name'])

    def test_create_product_in_shop_by_owner(self):
        shop = MerchantProfile.objects.create(owner=self.user, **self.shop_data)
        self.client.force_authenticate(user=self.user)
        response = self.client.post(f'/api/shops/{shop.id}/products/', self.product_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], self.product_data['name'])
        self.assertEqual(response.data['shop'], shop.id)

    def test_create_product_in_shop_by_non_owner(self):
        shop = MerchantProfile.objects.create(owner=self.user, **self.shop_data)
        self.client.force_authenticate(user=self.other_user)
        response = self.client.post(f'/api/shops/{shop.id}/products/', self.product_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_shop_products(self):
        shop = MerchantProfile.objects.create(owner=self.user, **self.shop_data)
        Product.objects.create(shop=shop, **self.product_data)
        response = self.client.get(f'/api/shops/{shop.id}/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['shop'], shop.id)

    def test_update_product_by_owner(self):
        shop = MerchantProfile.objects.create(owner=self.user, **self.shop_data)
        product = Product.objects.create(shop=shop, **self.product_data)
        self.client.force_authenticate(user=self.user)
        response = self.client.patch(f'/api/shops/products/{product.id}/', {'name': 'Produit Modifié'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Produit Modifié')

    def test_delete_product_by_owner(self):
        shop = MerchantProfile.objects.create(owner=self.user, **self.shop_data)
        product = Product.objects.create(shop=shop, **self.product_data)
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(f'/api/shops/products/{product.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(id=product.id).exists())
