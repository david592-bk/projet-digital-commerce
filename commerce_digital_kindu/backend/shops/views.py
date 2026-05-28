from django.db.models import Q
from rest_framework import generics, permissions

from .models import MerchantProfile, Product
from .permissions import IsMerchantOrReadOnly, IsShopOwnerOrAdmin
from .serializers import MerchantProfileSerializer, ProductSerializer

class MerchantProfileListCreateView(generics.ListCreateAPIView):
    queryset = MerchantProfile.objects.filter(is_active=True)
    serializer_class = MerchantProfileSerializer
    permission_classes = [IsMerchantOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class MerchantProfileRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = MerchantProfile.objects.all()
    serializer_class = MerchantProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsShopOwnerOrAdmin]

class MerchantProfileMeView(generics.RetrieveAPIView):
    serializer_class = MerchantProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return MerchantProfile.objects.get(owner=self.request.user)

class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsMerchantOrReadOnly]

    def get_queryset(self):
        query = self.request.query_params.get('q')
        shop_id = self.request.query_params.get('shop')
        queryset = Product.objects.filter(shop__is_active=True)

        if shop_id:
            queryset = queryset.filter(shop__id=shop_id)
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
            raise permissions.PermissionDenied('Vous ne pouvez pas ajouter de produit à cette boutique.')
        serializer.save()

class ProductRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsMerchantOrReadOnly]
