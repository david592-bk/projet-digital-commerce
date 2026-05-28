from django.conf import settings
from django.db import models
from shops.models import Product

class Order(models.Model):
    DELIVERY_TYPES = [
        ('pickup', 'Retrait / Réservation'),
        ('delivery', 'Livraison à domicile'),
    ]
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('ready', 'Prêt'),
        ('in_transit', 'En cours de livraison'),
        ('completed', 'Livré'),
        ('cancelled', 'Annulé'),
    ]

    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    shop = models.ForeignKey('shops.MerchantProfile', on_delete=models.CASCADE, related_name='orders')
    delivery_type = models.CharField(max_length=16, choices=DELIVERY_TYPES, default='pickup')
    address = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=24, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_paid_cash = models.BooleanField(default=False)
    delivery_person = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='deliveries')

    def __str__(self):
        return f"Commande #{self.pk} - {self.buyer.username} ({self.status})"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        self.unit_price = self.product.price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"
