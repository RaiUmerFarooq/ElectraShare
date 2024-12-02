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
from rest_framework.permissions import IsAuthenticated

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
                'status':user.userRole,
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
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def get(self, request):
        """
        Get the profile details of the authenticated user.
        Requires a valid JWT token.
        """
        user = request.user  # The user will be automatically set by JWTAuthentication

        # Get the user profile data (username, email, etc.)
        user_data = {
            'username': user.username,
            'email': user.email,
            'status':user.userRole,
        }

        return Response(user_data, status=status.HTTP_200_OK)
    
class AddPost(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def post(self, request):
        """
        Allow an authenticated user to create a new post.
        Requires a valid JWT token.
        """
        try:
            # Extract data from the request
            title = request.data.get('title')
            price = request.data.get('price')
            kilowatts = request.data.get('kilowatts')
            start_time = request.data.get('start_time')
            end_time = request.data.get('end_time')

            # Validate required fields
            if not all([title, price, kilowatts, start_time, end_time]):
                return Response(
                    {"message": "All fields are required."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Ensure numerical fields are valid
            try:
                price = float(price)
                kilowatts = float(kilowatts)
            except ValueError:
                return Response(
                    {"message": "Price and kilowatts must be valid numbers."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Save the post
            post = Post.objects.create(
                user=request.user,  # Set the authenticated user as the post owner
                title=title,
                price=price,
                kilowatts=kilowatts,
                start_time=start_time,
                end_time=end_time,
            )

            return Response(
                {
                    "message": "Post created successfully.",
                    "post_id": post.id,  # Return the created post ID
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            print(f"An error occurred while creating the post: {str(e)}")
            return Response(
                {"message": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
class FindProducerView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def post(self, request):
        """
        Find a producer by their username or ID sent in the request body.
        Returns the producer's username and email in JSON format.
        """
        # Extract the search parameters (e.g., username or ID) from the request body
        search_query = request.data.get('username')  # Search by username


        if not search_query :
            return Response(
                {"message": "Please provide a username or ID to search for a producer."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Find the producer by username or ID
            if search_query:
                user = User.objects.filter(userRole='producer', username=search_query).first()
            if not user:
                return Response(
                    {"message": "Producer not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Return the producer's details
            producer_data = {
                "id":user.id,
                "username": user.username,
                "email": user.email
            }
            return Response(producer_data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"An error occurred while finding the producer: {str(e)}")
            return Response(
                {"message": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
