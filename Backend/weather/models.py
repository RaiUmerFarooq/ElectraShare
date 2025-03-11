from django.db import models

class Weather(models.Model):
    city = models.CharField(max_length=255)
    datetime = models.DateTimeField()
    temp = models.FloatField()
    humidity = models.FloatField()
    precip = models.FloatField(default=0.0)
    windspeed = models.FloatField()
    winddir = models.FloatField()
    cloudcover = models.FloatField()
    solarenergy = models.FloatField(default=0.0)

    class Meta:
        unique_together = ('city', 'datetime')  # This enforces uniqueness

    def __str__(self):
        return f"{self.city} - {self.datetime}"