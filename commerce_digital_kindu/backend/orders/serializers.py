from rest_framework import serializers
from authentication.serializers import UserSerializer
from .models import Order, OrderItem
from shops.models import MerchantProfile, Product
from shops.serializers import MerchantProfileSerializer, ProductSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    product_details = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_details', 'quantity', 'unit_price']
        read_only_fields = ['id', 'unit_price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    buyer = serializers.PrimaryKeyRelatedField(read_only=True)
    buyer_details = UserSerializer(source='buyer', read_only=True)
    shop = serializers.PrimaryKeyRelatedField(queryset=MerchantProfile.objects.all())
    shop_details = MerchantProfileSerializer(source='shop', read_only=True)
    delivery_person = serializers.PrimaryKeyRelatedField(read_only=True)
    delivery_person_details = UserSerializer(source='delivery_person', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'buyer',
            'buyer_details',
            'shop',
            'shop_details',
            'delivery_type',
            'address',
            'status',
            'total_amount',
            'is_paid_cash',
            'delivery_person',
            'delivery_person_details',
            'created_at',
            'items',
        ]
        read_only_fields = ['id', 'status', 'total_amount', 'created_at', 'delivery_person']

    def validate(self, attrs):
        if attrs['delivery_type'] == 'delivery' and not attrs.get('address'):
            raise serializers.ValidationError({'address': 'L’adresse est requise pour la livraison à domicile.'})
        if attrs['shop'] and not attrs['shop'].is_active:
            raise serializers.ValidationError({'shop': 'La boutique sélectionnée est inactive.'})
        return attrs

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        validated_data['buyer'] = self.context['request'].user
        shop = validated_data['shop']
        order = Order.objects.create(**validated_data)
        total = 0
        for item_data in items_data:
            product = item_data['product']
            quantity = item_data['quantity']
            if product.shop != shop:
                raise serializers.ValidationError('Tous les produits de la commande doivent appartenir à la même boutique.')
            if product.stock < quantity:
                raise serializers.ValidationError(f"Stock insuffisant pour {product.name}.")
            product.stock -= quantity
            product.save()
            OrderItem.objects.create(order=order, product=product, quantity=quantity, unit_price=product.price)
            total += product.price * quantity
        order.total_amount = total
        order.save()
        return order
