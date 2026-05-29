from rest_framework import serializers
from .models import MerchantProfile, Product, ProductImage

class ProductImageSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'photo_url']
        read_only_fields = ['id', 'photo_url']

    def get_photo_url(self, obj):
        request = self.context.get('request')
        if obj.photo:
            return request.build_absolute_uri(obj.photo.url) if request else obj.photo.url
        return ''

class ProductSerializer(serializers.ModelSerializer):
    shop = serializers.PrimaryKeyRelatedField(queryset=MerchantProfile.objects.all(), required=False)
    shop_name = serializers.CharField(source='shop.name', read_only=True)
    photo_url = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'shop', 'shop_name', 'name', 'item_type', 'category', 'description', 'price', 'currency', 'stock', 'photo', 'photo_url', 'images', 'is_featured', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'photo_url', 'images']

    def get_photo_url(self, obj):
        request = self.context.get('request')
        if obj.photo:
            return request.build_absolute_uri(obj.photo.url) if request else obj.photo.url
        first_image = obj.images.first()
        if first_image and first_image.photo:
            return request.build_absolute_uri(first_image.photo.url) if request else first_image.photo.url
        return ''

class MerchantProfileSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = MerchantProfile
        fields = ['id', 'owner', 'name', 'description', 'address', 'opening_hours', 'logo', 'logo_url', 'is_active', 'products']
        read_only_fields = ['id', 'owner', 'logo_url']

    def get_logo_url(self, obj):
        request = self.context.get('request')
        if obj.logo:
            return request.build_absolute_uri(obj.logo.url) if request else obj.logo.url
        return ''
