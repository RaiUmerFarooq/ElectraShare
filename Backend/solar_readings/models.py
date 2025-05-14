from django.db import models
from django.conf import settings

class SolarReading(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # Reference the custom User model from core
        on_delete=models.CASCADE,
        related_name='solar_readings'
    )
    power_watts = models.DecimalField(max_digits=10, decimal_places=2)  # Power in watts
    weather = models.CharField(max_length=20)  # Weather condition (e.g., sunny, cloudy)
    timestamp = models.DateTimeField()  # Time of the reading

    def __str__(self):
        return f"Solar Reading for {self.user.username} at {self.timestamp}: {self.power_watts}W ({self.weather})"