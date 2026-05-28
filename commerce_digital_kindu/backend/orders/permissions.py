from rest_framework import permissions

class IsOrderParticipant(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return obj.buyer == request.user or obj.shop.owner == request.user or obj.delivery_person == request.user or request.user.role == 'admin'
        if request.user.role == 'delivery':
            return obj.delivery_person == request.user or obj.delivery_person is None
        return obj.buyer == request.user or obj.shop.owner == request.user or request.user.role == 'admin'
