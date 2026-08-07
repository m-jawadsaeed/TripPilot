"""API views for TripPilot application."""
import logging
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle
from apps.trip.serializers import TripRequestSerializer
from apps.trip.services.scheduler import plan_trip
from apps.trip.utils.constants import ROUTING_API_URL, GEOCODING_API_URL

logger = logging.getLogger(__name__)


class HealthCheckView(APIView):

    def get(self, request) -> Response:
        checks = {"osrm": "unknown", "nominatim": "unknown"}

        try:
            r = requests.get(
                f"{ROUTING_API_URL}/-96.7970,32.7767;-96.7970,32.7767",
                params={"overview": "false"},
                timeout=3,
            )
            checks["osrm"] = "ok" if r.status_code == 200 else "error"
        except Exception:
            checks["osrm"] = "unreachable"

        try:
            r = requests.get(
                GEOCODING_API_URL,
                params={"q": "Dallas", "format": "json", "limit": 1},
                headers={"User-Agent": "TripPilot/1.0 (health-check)"},
                timeout=3,
            )
            checks["nominatim"] = "ok" if r.status_code == 200 else "error"
        except Exception:
            checks["nominatim"] = "unreachable"

        return Response(
            {
                "status": "ok",
                "checks": checks,
            },
            status=status.HTTP_200_OK,
        )


class TripPlanningView(APIView):

    throttle_classes = [AnonRateThrottle]
    throttle_scope = 'trip'

    def post(self, request) -> Response:
        logger.info("Trip planning request received from %s", request.META.get('REMOTE_ADDR', 'unknown'))

        serializer = TripRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "message": "Invalid input data.",
                    "errors": [
                        {"field": field, "message": msg}
                        for field, messages in serializer.errors.items()
                        for msg in (messages if isinstance(messages, list) else [messages])
                    ],
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data

        try:
            result = plan_trip(
                current_location=data["current_location"],
                pickup_location=data["pickup_location"],
                dropoff_location=data["dropoff_location"],
                current_cycle_used=data["current_cycle_used"],
            )

            logger.info("Trip planning completed successfully")
            return Response(result.to_dict(), status=status.HTTP_200_OK)

        except ValueError as e:
            logger.warning("Trip planning validation error: %s", str(e))
            return Response(
                {
                    "success": False,
                    "message": str(e),
                    "errors": [{"field": "route", "message": str(e)}],
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except ConnectionError as e:
            logger.error("External API error: %s", str(e))
            return Response(
                {
                    "success": False,
                    "message": "External service unavailable. Please try again later.",
                    "errors": [{"field": "api", "message": str(e)}],
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        except Exception as e:
            logger.error("Unexpected error in trip planning: %s", str(e), exc_info=True)
            return Response(
                {
                    "success": False,
                    "message": "An unexpected error occurred. Please try again.",
                    "errors": [{"field": "server", "message": "Internal server error"}],
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
