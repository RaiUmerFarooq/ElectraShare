from rest_framework import serializers
from .models import SolarReading

class SolarReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolarReading
        fields = ['user', 'power_watts', 'weather', 'timestamp']