from rest_framework import permissions

class IsAuthenticatedOrReadOnly(permissions.BasePermission):
    message = 'Vous devez être connecté pour effectuer cette action.'

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)

class IsShopOwnerOrAdmin(permissions.BasePermission):
    message = 'Vous ne pouvez pas modifier cette ressource. Vous devez en être le propriétaire ou un administrateur.'

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        owner = getattr(obj, 'owner', None)
        if owner is None and hasattr(obj, 'shop'):
            owner = obj.shop.owner
        return request.user == owner or request.user.role == 'admin'
