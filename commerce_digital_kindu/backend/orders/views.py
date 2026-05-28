from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import Order
from .permissions import IsOrderParticipant
from .serializers import OrderSerializer

class OrderListCreateView(generics.ListCreateAPIView):
    queryset = Order.objects.all().select_related('buyer', 'shop', 'delivery_person')
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'merchant':
            return Order.objects.filter(shop__owner=user)
        if user.role == 'delivery':
            return Order.objects.filter(delivery_person=user) | Order.objects.filter(status='pending')
        return Order.objects.filter(buyer=user)

    def perform_create(self, serializer):
        serializer.save()

class OrderDetailView(generics.RetrieveUpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrderParticipant]

    def patch(self, request, *args, **kwargs):
        order = self.get_object()
        status_value = request.data.get('status')

        if status_value == 'in_transit' and request.user.role == 'delivery':
            if order.delivery_person is None:
                order.delivery_person = request.user
            order.status = 'in_transit'
            order.save()
            return Response(self.get_serializer(order).data)

        if status_value == 'completed' and request.user.role == 'delivery':
            order.delivery_person = request.user
            order.status = 'completed'
            order.is_paid_cash = True
            order.save()
            return Response(self.get_serializer(order).data)

        return self.partial_update(request, *args, **kwargs)
