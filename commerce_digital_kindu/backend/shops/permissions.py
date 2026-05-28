from rest_framework import permissions

class IsMerchantOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role in ['merchant', 'admin']

class IsShopOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        owner = getattr(obj, 'owner', None)
        if owner is None and hasattr(obj, 'shop'):
            owner = obj.shop.owner
        return request.user == owner or request.user.role == 'admin'
