from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions

from .models import MerchantProfile, Product, ProductImage
from .permissions import IsAuthenticatedOrReadOnly, IsShopOwnerOrAdmin
from .serializers import MerchantProfileSerializer, ProductSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied

class MerchantProfileListCreateView(generics.ListCreateAPIView):
    queryset = MerchantProfile.objects.filter(is_active=True)
    serializer_class = MerchantProfileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class MerchantProfileRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = MerchantProfile.objects.all()
    serializer_class = MerchantProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsShopOwnerOrAdmin]

class MerchantProfileMeView(generics.RetrieveAPIView):
    serializer_class = MerchantProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return MerchantProfile.objects.get(owner=self.request.user)

class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        query = self.request.query_params.get('q')
        shop_id = self.request.query_params.get('shop')
        queryset = Product.objects.all()

        if shop_id:
            queryset = queryset.filter(shop__id=shop_id)
            is_owner = MerchantProfile.objects.filter(id=shop_id, owner=self.request.user).exists()
            if not self.request.user.is_authenticated or not (
                self.request.user.role == 'admin' or is_owner
            ):
                queryset = queryset.filter(shop__is_active=True)
        else:
            queryset = queryset.filter(shop__is_active=True)

        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(shop__name__icontains=query)
            )
        return queryset

    def perform_create(self, serializer):
        shop = serializer.validated_data.get('shop')
        if shop.owner != self.request.user and self.request.user.role != 'admin':
            raise PermissionDenied('Vous ne pouvez pas ajouter de produit à cette boutique.')
        product = serializer.save()
        for photo in self.request.FILES.getlist('photos'):
            ProductImage.objects.create(product=product, photo=photo)

class ShopProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        shop_id = self.kwargs['shop_id']
        queryset = Product.objects.filter(shop_id=shop_id)
        if self.request.user.is_authenticated and (
            self.request.user.role == 'admin' or MerchantProfile.objects.filter(id=shop_id, owner=self.request.user).exists()
        ):
            return queryset
        return queryset.filter(shop__is_active=True)

    def perform_create(self, serializer):
        shop = get_object_or_404(MerchantProfile, id=self.kwargs['shop_id'])
        if shop.owner != self.request.user and self.request.user.role != 'admin':
            raise PermissionDenied('Vous ne pouvez pas ajouter de produit à cette boutique.')
        product = serializer.save(shop=shop)
        for photo in self.request.FILES.getlist('photos'):
            ProductImage.objects.create(product=product, photo=photo)

class ProductRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsShopOwnerOrAdmin]

    def perform_update(self, serializer):
        product = serializer.save()
        for photo in self.request.FILES.getlist('photos'):
            ProductImage.objects.create(product=product, photo=photo)


class ProductImageDestroyView(generics.DestroyAPIView):
    queryset = ProductImage.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        obj = self.get_object()
        owner = obj.product.shop.owner
        if request.user != owner and request.user.role != 'admin':
            raise PermissionDenied('Vous ne pouvez pas supprimer cette image.')
        # delete the object and its file
        obj.photo.delete(save=False)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
