"""Serializers for TripPilot API."""
from rest_framework import serializers


class TripRequestSerializer(serializers.Serializer):
    """Serializer for trip planning request."""
    current_location = serializers.CharField(max_length=500, required=True)
    pickup_location = serializers.CharField(max_length=500, required=True)
    dropoff_location = serializers.CharField(max_length=500, required=True)
    current_cycle_used = serializers.FloatField(required=True)

    def validate_current_location(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Current location cannot be empty.")
        if len(value) < 2:
            raise serializers.ValidationError("Current location must be at least 2 characters.")
        return value

    def validate_pickup_location(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Pickup location cannot be empty.")
        if len(value) < 2:
            raise serializers.ValidationError("Pickup location must be at least 2 characters.")
        return value

    def validate_dropoff_location(self, value: str) -> str:
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Dropoff location cannot be empty.")
        if len(value) < 2:
            raise serializers.ValidationError("Dropoff location must be at least 2 characters.")
        return value

    def validate_current_cycle_used(self, value: float) -> float:
        if value < 0:
            raise serializers.ValidationError("Cycle hours cannot be negative.")
        if value > 70:
            raise serializers.ValidationError("Cycle hours cannot exceed 70.")
        return value

    def validate(self, data: dict) -> dict:
        if data["pickup_location"].lower() == data["dropoff_location"].lower():
            raise serializers.ValidationError({
                "dropoff_location": "Pickup and dropoff locations cannot be the same."
            })
        return data
