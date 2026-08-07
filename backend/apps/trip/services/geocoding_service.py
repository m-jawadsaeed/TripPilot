"""Geocoding service using OpenStreetMap Nominatim API."""
import time
import logging
from typing import Any
import requests
from apps.trip.utils.constants import (
    GEOCODING_API_URL,
    REQUEST_TIMEOUT,
    MAX_RETRIES,
    RETRY_DELAY,
)

logger = logging.getLogger(__name__)


class GeocodingResult:

    def __init__(
        self,
        latitude: float,
        longitude: float,
        display_name: str
    ) -> None:
        self.latitude = latitude
        self.longitude = longitude
        self.display_name = display_name

    def to_dict(self) -> dict[str, Any]:
        return {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "display_name": self.display_name,
        }


def geocode_address(address: str) -> GeocodingResult:
    params = {
        "q": address,
        "format": "json",
        "limit": 1,
        "addressdetails": 1,
    }
    headers = {
        "User-Agent": "TripPilot/1.0 (trip-planner-assessment)"
    }

    last_error: Exception | None = None
    for attempt in range(MAX_RETRIES):
        try:
            logger.info("Geocoding address: %s (attempt %d)", address, attempt + 1)
            response = requests.get(
                GEOCODING_API_URL,
                params=params,
                headers=headers,
                timeout=REQUEST_TIMEOUT,
            )
            response.raise_for_status()
            results = response.json()

            if not results:
                raise ValueError(f"Could not find location: {address}")

            result = results[0]
            return GeocodingResult(
                latitude=float(result["lat"]),
                longitude=float(result["lon"]),
                display_name=result.get("display_name", address),
            )

        except requests.exceptions.Timeout as e:
            last_error = e
            logger.warning("Geocoding timeout for '%s' (attempt %d)", address, attempt + 1)
        except requests.exceptions.ConnectionError as e:
            last_error = e
            logger.warning("Geocoding connection error for '%s' (attempt %d)", address, attempt + 1)
        except ValueError:
            raise
        except Exception as e:
            last_error = e
            logger.error("Unexpected error geocoding '%s': %s", address, str(e))

        if attempt < MAX_RETRIES - 1:
            time.sleep(RETRY_DELAY * (attempt + 1))

    if isinstance(last_error, (requests.exceptions.Timeout, requests.exceptions.ConnectionError)):
        raise ConnectionError(
            f"Geocoding service unavailable. Please try again later."
        )
    raise ValueError(f"Could not geocode address: {address}")


def geocode_multiple(addresses: list[str]) -> list[GeocodingResult]:
    results: list[GeocodingResult] = []
    for address in addresses:
        result = geocode_address(address)
        results.append(result)
        time.sleep(1.1)
    return results
