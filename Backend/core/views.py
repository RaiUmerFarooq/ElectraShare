# Create your views here.

from django.shortcuts import render
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode  # Importing the required function
from django.utils.encoding import force_bytes, force_str  # Importing force_str
import jwt
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer
from django.contrib.auth.models import User
from .utils import *



class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = False  # Deactivate user until email is verified
            user.save()

            # Send verification email
            send_verification_email(user)

            # Generate JWT tokens for the new user (optional, if you want to provide tokens immediately)
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
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)

            # Verify the token
            payload = jwt.decode(token, 'your-secret-key', algorithms=['HS256'])
            if payload['user_id'] != user.id:
                return Response({"message": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)

            # Activate the user account
            user.is_active = True
            user.save()
            return Response({"message": "Email verified successfully. You can now log in."}, status=status.HTTP_200_OK)

        except (User.DoesNotExist, ValueError, jwt.ExpiredSignatureError):
            return Response({"message": "Invalid verification link."}, status=status.HTTP_400_BAD_REQUEST)
