from django.urls import path
from .views import (
    MerchantProfileListCreateView,
    MerchantProfileMeView,
    MerchantProfileRetrieveUpdateView,
    ProductListCreateView,
    ProductRetrieveUpdateDestroyView,
)

urlpatterns = [
    path('', MerchantProfileListCreateView.as_view(), name='merchant-list-create'),
    path('me/', MerchantProfileMeView.as_view(), name='merchant-me'),
    path('<int:pk>/', MerchantProfileRetrieveUpdateView.as_view(), name='merchant-detail'),
    path('products/', ProductListCreateView.as_view(), name='product-list-create'),
    path('products/<int:pk>/', ProductRetrieveUpdateDestroyView.as_view(), name='product-detail'),
]
