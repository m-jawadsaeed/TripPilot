"""URL configuration for TripPilot app."""
from django.urls import path
from apps.trip.views import TripPlanningView, HealthCheckView

urlpatterns = [
    path("trip/", TripPlanningView.as_view(), name="trip-planning"),
    path("health/", HealthCheckView.as_view(), name="health-check"),
]
