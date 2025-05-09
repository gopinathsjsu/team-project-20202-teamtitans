from django.urls import path
from .views import (
    BookingCreateView,
    UserBookingsListView,
    BookingDetailView,
    RestaurantBookingsView,
    CancelBookingView,
    TodayBookingsView
)

urlpatterns = [
    path('create/', BookingCreateView.as_view(), name='booking-create'),
    path('my-bookings/', UserBookingsListView.as_view(), name='my-bookings'),
    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('restaurant/<int:restaurant_id>/', RestaurantBookingsView.as_view(), name='restaurant-bookings'),
    path('cancel/<int:pk>/', CancelBookingView.as_view(), name='cancel-booking'),
    path('today/', TodayBookingsView.as_view(), name='today-bookings'),
]
