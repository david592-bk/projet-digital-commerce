from django.conf import settings
from django.db import models

class MerchantProfile(models.Model):
    owner = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='merchant_profile')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    address = models.CharField(max_length=255)
    opening_hours = models.CharField(max_length=255, blank=True)
    logo = models.ImageField(upload_to='shop_logos/', blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    ITEM_TYPE_CHOICES = [
        ('product', 'Produit'),
        ('service', 'Service'),
    ]
    CATEGORY_CHOICES = [
        ('aliment', 'Aliment'),
        ('vetement', 'Vêtement'),
        ('nettoyage', 'Produit de nettoyage'),
        ('beaute', 'Beauté'),
        ('autre', 'Autre'),
    ]

    shop = models.ForeignKey(MerchantProfile, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    item_type = models.CharField(max_length=10, choices=ITEM_TYPE_CHOICES, default='product')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='autre')
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, choices=[('XAF', 'Franc CFA'), ('USD', 'Dollar')], default='XAF')
    stock = models.PositiveIntegerField(default=0)
    photo = models.ImageField(upload_to='product_photos/', blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.shop.name})"

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    photo = models.ImageField(upload_to='product_photos/', blank=True, null=True)

    def __str__(self):
        return f"Image for {self.product.name}"
