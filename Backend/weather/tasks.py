from celery import shared_task
import requests
from backend.settings import WEATHER_API_KEY, WEATHER_CITIES
from .models import Weather
from datetime import datetime, date

@shared_task
def fetch_weather_for_all_cities():
    current_date = date.today().strftime('%Y-%m-%d')
    all_results = []

    for city in WEATHER_CITIES:
        url = f"https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/{city}/{current_date}/{current_date}?key={WEATHER_API_KEY}&unitGroup=us&contentType=json"

        try:
            response = requests.get(url)
            response.raise_for_status()
            weather_data = response.json()

            stored_records = []
            for day_data in weather_data['days']:
                weather_record, created = Weather.objects.get_or_create(
                    city=weather_data['resolvedAddress'],
                    datetime=datetime.strptime(day_data['datetime'], '%Y-%m-%d'),
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
                stored_records.append({
                    'city': weather_record.city,
                    'datetime': weather_record.datetime.strftime('%Y-%m-%d'),
                    'temp': weather_record.temp,
                    'humidity': weather_record.humidity,
                    'precip': weather_record.precip,
                    'windspeed': weather_record.windspeed,
                    'winddir': weather_record.winddir,
                    'cloudcover': weather_record.cloudcover,
                    'solarenergy': weather_record.solarenergy,
                })

            all_results.append({
                'city': city,
                'status': 'success',
                'data': stored_records
            })

        except requests.exceptions.RequestException as e:
            all_results.append({
                'city': city,
                'status': 'error',
                'message': f"Error fetching weather data: {str(e)}"
            })
        except Exception as e:
            all_results.append({
                'city': city,
                'status': 'error',
                'message': f"Unexpected error: {str(e)}"
            })

    return all_results