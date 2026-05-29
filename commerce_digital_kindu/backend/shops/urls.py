from django.urls import path
from .views import (
    MerchantProfileListCreateView,
    MerchantProfileMeView,
    MerchantProfileRetrieveUpdateView,
    ProductListCreateView,
    ProductRetrieveUpdateDestroyView,
    ProductImageDestroyView,
    ShopProductListCreateView,
)

urlpatterns = [
    path('', MerchantProfileListCreateView.as_view(), name='merchant-list-create'),
    path('me/', MerchantProfileMeView.as_view(), name='merchant-me'),
    path('products/', ProductListCreateView.as_view(), name='product-list-create'),
    path('<int:shop_id>/products/', ShopProductListCreateView.as_view(), name='shop-product-list-create'),
    path('products/<int:pk>/', ProductRetrieveUpdateDestroyView.as_view(), name='product-detail'),
    path('products/images/<int:pk>/', ProductImageDestroyView.as_view(), name='product-image-detail'),
    path('<int:pk>/', MerchantProfileRetrieveUpdateView.as_view(), name='merchant-detail'),
]
