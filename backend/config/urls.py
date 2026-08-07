"""URL configuration for TripPilot project."""
import logging
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

logger = logging.getLogger(__name__)


def log_404(request, exception=None):
    """Log 404 requests for analytics."""
    logger.warning("404 Not Found: %s %s from %s",
                    request.method, request.path,
                    request.META.get('REMOTE_ADDR', 'unknown'))
    return JsonResponse(
        {"success": False, "message": "Not found"},
        status=404
    )


handler404 = 'config.urls.log_404'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.trip.urls')),
]
