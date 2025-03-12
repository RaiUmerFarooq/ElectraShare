import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
import requests
from datetime import datetime, timedelta
from weather.models import Weather  # Import the Weather model from the weather app

# Set up logging
logger = logging.getLogger(__name__)

class PredictView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):  # Accept JSON body
        try:
            # Step 1: Get city from request body
            data = request.data
            logger.info(f"Received request data: {data}")
            if not isinstance(data, dict) or 'city' not in data:
                logger.error("Invalid request data: City not provided or invalid format")
                return Response(
                    {"message": "City name must be provided in the request body."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            city = data['city'].lower()  # Use lowercase city as per required format (e.g., "lahore")
            logger.info(f"Processed city: {city}")

            # Step 2: Fetch all weather data from the weather_weather table for the specified city
            weather_records = Weather.objects.filter(city__icontains=city).order_by('-datetime')  # Case-insensitive match, all records
            logger.info(f"Queried weather records for {city}: {list(weather_records.values())}")

            if not weather_records.exists():
                logger.error(f"No weather data found for {city}")
                return Response(
                    {"message": f"No weather data available for {city} in the database."},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Step 3: Prepare weather_data with all records and duplicate if less than 7
            weather_data = []
            record_count = weather_records.count()
            logger.info(f"Found {record_count} records for {city}")

            if record_count >= 7:
                # Use all available records (up to 7 if more exist)
                for record in weather_records[:7]:
                    weather_data.append({
                        "datetime": record.datetime.strftime("%Y-%m-%dT12:00:00"),
                        "temp": float(record.temp),
                        "humidity": float(record.humidity),
                        "precip": float(record.precip),
                        "windspeed": float(record.windspeed),
                        "winddir": float(record.winddir),
                        "cloudcover": float(record.cloudcover),
                        "solarenergy": float(record.solarenergy)
                    })
            else:
                # Use all available records and duplicate the latest to reach 7
                for record in weather_records:
                    weather_data.append({
                        "datetime": record.datetime.strftime("%Y-%m-%dT12:00:00"),
                        "temp": float(record.temp),
                        "humidity": float(record.humidity),
                        "precip": float(record.precip),
                        "windspeed": float(record.windspeed),
                        "winddir": float(record.winddir),
                        "cloudcover": float(record.cloudcover),
                        "solarenergy": float(record.solarenergy)
                    })

                latest_record = weather_records[0]
                base_date = latest_record.datetime.replace(hour=12, minute=0, second=0, microsecond=0)
                remaining_slots = 7 - record_count
                logger.info(f"Duplicating latest record {remaining_slots} times to reach 7 days")
                for i in range(remaining_slots):
                    new_date = base_date - timedelta(days=remaining_slots - 1 - i)  # Adjust dates backward
                    new_entry = {
                        "datetime": new_date.strftime("%Y-%m-%dT12:00:00"),
                        "temp": float(latest_record.temp),
                        "humidity": float(latest_record.humidity),
                        "precip": float(latest_record.precip),
                        "windspeed": float(latest_record.windspeed),
                        "winddir": float(latest_record.winddir),
                        "cloudcover": float(latest_record.cloudcover),
                        "solarenergy": float(latest_record.solarenergy)
                    }
                    weather_data.append(new_entry)

            logger.info(f"Prepared weather_data: {weather_data}")

            # Step 4: Generate solar data for 7 days (matching the example format)
            solar_data = [
                {
                    "date": "2025-03-05",
                    "ghi_pyr": 200.5,
                    "humidity": 40.0,
                    "h_wind_spd": 3.2,
                    "wind_spd": 5.5,
                    "barometric_sensor": 1013.2,
                    "solar_production_kW": 50.0,
                    "dni": 700.1,
                    "dhi": 100.2,
                    "air_temperature": 30.0,
                    "wind_from_dir": 180.0
                },
                {
                    "date": "2025-03-06",
                    "ghi_pyr": 210.3,
                    "humidity": 38.5,
                    "h_wind_spd": 3.5,
                    "wind_spd": 5.8,
                    "barometric_sensor": 1012.8,
                    "solar_production_kW": 52.1,
                    "dni": 710.4,
                    "dhi": 105.3,
                    "air_temperature": 31.2,
                    "wind_from_dir": 185.0
                },
                {
                    "date": "2025-03-07",
                    "ghi_pyr": 205.7,
                    "humidity": 39.2,
                    "h_wind_spd": 3.3,
                    "wind_spd": 5.6,
                    "barometric_sensor": 1013.5,
                    "solar_production_kW": 51.3,
                    "dni": 695.8,
                    "dhi": 98.7,
                    "air_temperature": 29.8,
                    "wind_from_dir": 178.0
                },
                {
                    "date": "2025-03-08",
                    "ghi_pyr": 215.0,
                    "humidity": 37.8,
                    "h_wind_spd": 3.7,
                    "wind_spd": 6.0,
                    "barometric_sensor": 1012.3,
                    "solar_production_kW": 53.5,
                    "dni": 720.0,
                    "dhi": 110.0,
                    "air_temperature": 31.5,
                    "wind_from_dir": 190.0
                },
                {
                    "date": "2025-03-09",
                    "ghi_pyr": 198.4,
                    "humidity": 41.2,
                    "h_wind_spd": 3.0,
                    "wind_spd": 5.2,
                    "barometric_sensor": 1014.0,
                    "solar_production_kW": 49.5,
                    "dni": 685.3,
                    "dhi": 95.4,
                    "air_temperature": 28.7,
                    "wind_from_dir": 175.0
                },
                {
                    "date": "2025-03-10",
                    "ghi_pyr": 220.1,
                    "humidity": 36.5,
                    "h_wind_spd": 3.9,
                    "wind_spd": 6.3,
                    "barometric_sensor": 1011.9,
                    "solar_production_kW": 54.8,
                    "dni": 730.5,
                    "dhi": 115.2,
                    "air_temperature": 32.0,
                    "wind_from_dir": 195.0
                },
                {
                    "date": "2025-03-11",
                    "ghi_pyr": 208.9,
                    "humidity": 39.8,
                    "h_wind_spd": 3.4,
                    "wind_spd": 5.7,
                    "barometric_sensor": 1013.8,
                    "solar_production_kW": 51.9,
                    "dni": 705.7,
                    "dhi": 102.5,
                    "air_temperature": 30.5,
                    "wind_from_dir": 182.0
                }
            ]
            logger.info(f"Prepared solar_data: {solar_data}")

            # Step 5: Prepare payload for the prediction API
            payload = {
                "city": city,  # Use lowercase city as per required format
                "solar_data": solar_data,
                "weather_data": weather_data
            }
            logger.info(f"Prepared payload: {payload}")

            # Step 6: Call the prediction API
            prediction_api_url = "https://raiumer-electrashare-api.hf.space/predict"
            logger.info(f"Sending request to {prediction_api_url}")
            response = requests.post(prediction_api_url, json=payload)
            logger.info(f"Prediction API response status: {response.status_code}, content: {response.text}")

            if response.status_code != 200:
                logger.error(f"Prediction API failed with status {response.status_code}: {response.text}")
                return Response(
                    {"message": "Failed to fetch predictions from the prediction API."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            prediction_data = response.json()
            logger.info(f"Received prediction_data: {prediction_data}")

            # Ensure the response matches the expected format
            if "predictions" not in prediction_data or "timesteps" not in prediction_data:
                logger.error("Invalid response format from prediction API")
                return Response(
                    {"message": "Invalid response format from prediction API."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Step 7: Return the prediction data to the frontend
            logger.info("Returning successful response to frontend")
            return Response(prediction_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"An error occurred during prediction: {str(e)}", exc_info=True)
            return Response(
                {"message": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )