import jwt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, authentication, permissions
from django.conf import settings
from .models import SolarReading
from .serializers import SolarReadingSerializer
import requests
from django.db.models import Sum
import logging

# Set up logging
logger = logging.getLogger(__name__)

class StoreSolarReadingView(APIView):
    def post(self, request):
        serializer = SolarReadingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FetchSolarPowerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            # Extract token from Authorization header
            auth_header = request.headers.get('Authorization', None)
            if not auth_header or not auth_header.startswith('Bearer '):
                return Response({"error": "Token is missing or invalid"}, status=status.HTTP_401_UNAUTHORIZED)

            token = auth_header.split(' ')[1]  # Extract the token (remove 'Bearer ')
            # Decode the token to get user info
            decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = decoded_token.get('user_id')  # Adjust based on your token payload

            if not user_id:
                return Response({"error": "User ID not found in token"}, status=status.HTTP_400_BAD_REQUEST)

            # Call the FastAPI endpoint with the user_id
            fastapi_url = f"http://10.54.13.218:9090/power?user_id={user_id}"
            response = requests.get(fastapi_url)
            response.raise_for_status()

            # Return the FastAPI response to the frontend
            return Response(response.json(), status=status.HTTP_200_OK)

        except jwt.ExpiredSignatureError:
            logger.error("Token has expired")
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            logger.error("Invalid token")
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
        except requests.RequestException as e:
            return Response(
                {"error": f"Failed to fetch power data: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Updated API to get total solar production for a user
class GetTotalProductionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Extract token from Authorization header
            auth_header = request.headers.get('Authorization', None)
            if not auth_header or not auth_header.startswith('Bearer '):
                return Response({"error": "Token is missing or invalid"}, status=status.HTTP_401_UNAUTHORIZED)

            token = auth_header.split(' ')[1]  # Extract the token (remove 'Bearer ')
            # Decode the token to get user info
            decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = decoded_token.get('user_id')  # Adjust based on your token payload

            if not user_id:
                return Response({"error": "User ID not found in token"}, status=status.HTTP_400_BAD_REQUEST)

            # Calculate total production by summing power_watts for the user
            total_production = SolarReading.objects.filter(user_id=user_id).aggregate(
                total=Sum('power_watts')
            )['total'] or 0  # Default to 0 if no readings

            logger.info(f"Total production for user {user_id}: {total_production} watts")
            return Response(
                {"total_production": float(total_production) if total_production else 0},
                status=status.HTTP_200_OK
            )

        except jwt.ExpiredSignatureError:
            logger.error("Token has expired")
            return Response({"error": "Token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            logger.error("Invalid token")
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            logger.error(f"Error calculating total production: {str(e)}")
            return Response(
                {"error": f"Failed to calculate total production: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )