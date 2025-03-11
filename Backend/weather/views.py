from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
import requests
from backend.settings import WEATHER_API_KEY
from .models import Weather
from datetime import datetime, date

@api_view(['GET'])
def get_weather(request, city):
    """
    Fetch and store weather data for a specific city from the Visual Crossing API,
    then return the latest record.
    """
    # Use the 'today' endpoint for current day weather data
    url = f"https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/{city}/today?key={WEATHER_API_KEY}&unitGroup=us&include=days&contentType=json"

    try:
        # Fetch data from the API
        response = requests.get(url)
        response.raise_for_status()
        weather_data = response.json()

        # Extract the 'days' data (should contain one day for 'today')
        if not weather_data.get('days') or len(weather_data['days']) == 0:
            return Response({"status": "error", "message": "No weather data available for today"}, status=404)

        day_data = weather_data['days'][0]  # Take the first (and only) day
        resolved_city = weather_data['resolvedAddress']
        weather_datetime = datetime.strptime(day_data['datetime'], '%Y-%m-%d')

        # Update or create the weather record to avoid duplicate entry errors
        weather_record, created = Weather.objects.update_or_create(
            city=resolved_city,
            datetime=weather_datetime,
            defaults={
                'temp': day_data['temp'],
                'humidity': day_data['humidity'],
                'precip': day_data.get('precip', 0.0),
                'windspeed': day_data['windspeed'],
                'winddir': day_data['winddir'],
                'cloudcover': day_data['cloudcover'],
                'solarenergy': day_data.get('solarenergy', 0.0),
            }
        )

        # Prepare the response data
        serialized_data = {
            'city': weather_record.city,
            'datetime': weather_record.datetime.strftime('%Y-%m-%d'),
            'temp': weather_record.temp,
            'humidity': weather_record.humidity,
            'precip': weather_record.precip,
            'windspeed': weather_record.windspeed,
            'winddir': weather_record.winddir,
            'cloudcover': weather_record.cloudcover,
            'solarenergy': weather_record.solarenergy,
        }

        return Response({"status": "success", "data": [serialized_data]})

    except requests.exceptions.RequestException as e:
        return Response({"status": "error", "message": f"Error fetching weather data: {str(e)}"}, status=500)
    except Exception as e:
        return Response({"status": "error", "message": f"Unexpected error: {str(e)}"}, status=500)