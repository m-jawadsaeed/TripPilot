"""Helper utilities for TripPilot application."""
import logging
from typing import Any
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc: Exception, context: dict[str, Any]) -> Response:
    response = exception_handler(exc, context)

    if response is not None:
        if response.status_code >= 500:
            logger.error("Server error: %s | context: %s", str(exc), context.get('view', ''))
        elif response.status_code >= 400:
            logger.warning("Client error %d: %s", response.status_code, str(exc))
        return response

    logger.error("Unhandled exception: %s", str(exc), exc_info=True)

    return Response(
        {
            "success": False,
            "message": "An unexpected error occurred. Please try again.",
            "errors": [
                {
                    "field": "server",
                    "message": "Internal server error"
                }
            ]
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
