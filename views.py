from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q

from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer
from restaurants.models import Restaurant, Table

User = get_user_model()

class IsRestaurantManagerForBooking(permissions.BasePermission):
    """
    Custom permission for restaurant managers to access their restaurant's bookings
    """
    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and (
            request.user.role == User.RESTAURANT_MANAGER and 
            obj.table.restaurant.manager == request.user
        )

class IsBookingOwner(permissions.BasePermission):
    """
    Custom permission for users to access only their own bookings
    """
    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and obj.user == request.user

class BookingCreateView(generics.CreateAPIView):
    """
    API endpoint to create a new booking
    """
    serializer_class = BookingCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        
        # Return the full booking details
        response_serializer = BookingSerializer(booking)
        headers = self.get_success_headers(response_serializer.data)
        
        # In a real app, we would send confirmation email or SMS here
        # self.send_confirmation_email(booking)
        # self.send_confirmation_sms(booking)
        
        return Response(
            response_serializer.data, 
            status=status.HTTP_201_CREATED, 
            headers=headers
        )

class UserBookingsListView(generics.ListAPIView):
    """
    API endpoint to list bookings for the current user
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)

class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint to retrieve, update or cancel a booking
    """
    serializer_class = BookingSerializer
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            self.permission_classes = [permissions.IsAuthenticated, IsBookingOwner]
        else:
            self.permission_classes = [permissions.IsAuthenticated, 
                                      permissions.OR(IsBookingOwner, IsRestaurantManagerForBooking)]
        return super().get_permissions()
    
    def get_queryset(self):
        user = self.request.user
        
        # Filter based on user role
        if user.role == User.ADMIN:
            # Admins can see all bookings
            return Booking.objects.all()
        elif user.role == User.RESTAURANT_MANAGER:
            # Restaurant managers see bookings for their restaurants
            return Booking.objects.filter(table__restaurant__manager=user)
        else:
            # Regular customers see only their own bookings
            return Booking.objects.filter(user=user)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Only allow updating status to 'cancelled' for regular users
        if request.user.role == User.CUSTOMER and 'status' in request.data:
            if request.data['status'] != 'cancelled':
                return Response(
                    {"error": "You can only cancel a booking, not change its status to anything else."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)

class RestaurantBookingsView(generics.ListAPIView):
    """
    API endpoint to list bookings for a restaurant
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        restaurant_id = self.kwargs.get('restaurant_id')
        
        if user.role == User.ADMIN:
            # Admins can see all bookings for any restaurant
            return Booking.objects.filter(table__restaurant_id=restaurant_id)
        elif user.role == User.RESTAURANT_MANAGER:
            # Restaurant managers can only see bookings for their own restaurants
            return Booking.objects.filter(
                table__restaurant_id=restaurant_id,
                table__restaurant__manager=user
            )
        else:
            # Regular users can only see their own bookings for this restaurant
            return Booking.objects.filter(
                table__restaurant_id=restaurant_id,
                user=user
            )

class CancelBookingView(APIView):
    """
    API endpoint to cancel a booking
    """
    permission_classes = [permissions.IsAuthenticated, IsBookingOwner]
    
    def patch(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk, user=request.user)
        
        if booking.status == 'cancelled':
            return Response(
                {"error": "This booking is already cancelled"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'cancelled'
        booking.save()
        
        serializer = BookingSerializer(booking)
        return Response(serializer.data)

class TodayBookingsView(generics.ListAPIView):
    """
    API endpoint to list bookings for today for restaurant managers
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        today = timezone.now().date()
        
        if user.role == User.ADMIN:
            # Admins can see all bookings for today
            return Booking.objects.filter(date=today)
        elif user.role == User.RESTAURANT_MANAGER:
            # Restaurant managers see bookings for their restaurants
            return Booking.objects.filter(
                date=today,
                table__restaurant__manager=user
            )
        else:
            # Regular customers see only their own bookings for today
            return Booking.objects.filter(
                date=today,
                user=user
            )
