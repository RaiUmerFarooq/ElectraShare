from django.shortcuts import render, get_object_or_404
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
import jwt
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer
from .utils import send_verification_email
from .models import *

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = False  # Deactivate user until email is verified
            user.save()

            # Send verification email
            send_verification_email(user)

            # Generate JWT tokens for the new user (optional)
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': "Registration successful. Please check your email to verify your account.",
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(APIView):
    def get(self, request, uidb64, token):
        try:
            # Decode the user ID from the base64 URL-safe string
            uid = force_str(urlsafe_base64_decode(uidb64))
            print(f'Decoded UID: {uid}')
            
            # Convert the UID to a bigint/int64
            
            
            # Fetch the user or return a 404 error
            user = get_object_or_404(User, id=uid)
            print(f'User found: {user}')
            
            # Verify the token
            payload = jwt.decode(token, 'your-secret-key', algorithms=['HS256'])
            print(f'Decoded JWT payload: {payload}')
            
            # Convert payload ID to bigint for comparison
            if int(payload['id']) != user.id:
                print("Token user ID does not match the database user ID.")
                return Response({"message": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

            # Activate the user account
            user.is_active = True
            user.save()
            print(f'User {user.username} activated successfully.')

            return Response({"message": "Email verified successfully. You can now log in."}, status=status.HTTP_200_OK)

        except jwt.ExpiredSignatureError:
            print("Verification link has expired.")
            return Response({"message": "Verification link has expired."}, status=status.HTTP_400_BAD_REQUEST)
        except jwt.DecodeError:
            print("Invalid verification link.")
            return Response({"message": "Invalid verification link."}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            print("Invalid user ID during verification.")
            return Response({"message": "Invalid user ID."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"An unexpected error occurred during email verification: {str(e)}")
            return Response({"message": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
