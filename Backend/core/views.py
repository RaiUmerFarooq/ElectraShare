from django.shortcuts import get_object_or_404
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
import jwt
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer
from .utils import send_verification_email
from .models import *
from .serializers import *
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.contrib.auth import get_user_model
from datetime import time
from payments.models import StripePayment  # Import the StripePayment model

User = get_user_model()

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = False
            user.save()

            send_verification_email(user)

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
                'status': user.userRole,
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(APIView):
    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            print(f'Decoded UID: {uid}')
            user = get_object_or_404(User, id=uid)
            print(f'User found: {user}')
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            print(f'Decoded JWT payload: {payload}')
            if int(payload['id']) != user.id:
                print("Token user ID does not match the database user ID.")
                return Response({"message": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
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
            return Response({"message": "Invalid user ID."}, status=status.HTTP_404_BAD_REQUEST)
        except Exception as e:
            print(f"An unexpected error occurred during email verification: {str(e)}")
            return Response({"message": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_data = {
            'username': user.username,
            'email': user.email,
            'status': user.userRole,
        }
        return Response(user_data, status=status.HTTP_200_OK)

class AddPost(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            title = request.data.get('title')
            price = request.data.get('price')
            kilowatts = request.data.get('kilowatts')
            start_time = request.data.get('start_time')
            end_time = request.data.get('end_time')

            if not all([title, price, kilowatts, start_time, end_time]):
                return Response(
                    {"message": "All fields are required."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                price = float(price)
                kilowatts = float(kilowatts)
            except ValueError:
                return Response(
                    {"message": "Price and kilowatts must be valid numbers."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            post = Post.objects.create(
                user=request.user,
                title=title,
                price=price,
                kilowatts=kilowatts,
                start_time=start_time,
                end_time=end_time,
            )

            return Response(
                {
                    "message": "Post created successfully.",
                    "post_id": post.id,
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
    permission_classes = [IsAuthenticated]

    def post(self, request):
        search_query = request.data.get('username')

        if not search_query:
            return Response(
                {"message": "Please provide a username to search for a producer."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.filter(userRole='producer', username=search_query).first()
            if not user:
                return Response(
                    {"message": "Producer not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

            connection_status = "not connected"
            user_request = FriendRequest.objects.filter(
                (Q(from_user=user) | Q(to_user=user)),
                (Q(status="pending") | Q(status="accepted") | Q(status="rejected"))
            ).first()

            if user_request:
                connection_status = user_request.status
            else:
                connection_status = "not connected"

            producer_data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "description": getattr(user, "description", "No description provided."),
                "status": connection_status
            }

            return Response(producer_data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"An error occurred while finding the producer: {str(e)}")
            return Response(
                {"message": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SendFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        producer_id = request.data.get('producer_id')
        
        try:
            if request.user.userRole != 'consumer':
                return Response(
                    {"message": "Only consumers can send friend requests."},
                    status=status.HTTP_403_FORBIDDEN
                )

            producer = get_object_or_404(User, id=producer_id, userRole='producer')
            
            existing_request = FriendRequest.objects.filter(
                from_user=request.user,
                to_user=producer
            ).first()
            
            if existing_request:
                return Response(
                    {"message": f"A friend request to this producer is already {existing_request.status}."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            FriendRequest.objects.create(
                from_user=request.user,
                to_user=producer
            )

            return Response(
                {"message": "Friend request sent successfully."},
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {"message": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ManageFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):
        action = request.data.get('action')
        
        try:
            if request.user.userRole != 'producer':
                return Response(
                    {"message": "Only producers can manage friend requests."},
                    status=status.HTTP_403_FORBIDDEN
                )

            friend_request = get_object_or_404(
                FriendRequest,
                id=request_id,
                to_user=request.user,
                status='pending'
            )

            if action == 'accept':
                friend_request.status = 'accepted'
                message = "Friend request accepted."
            elif action == 'reject':
                friend_request.status = 'rejected'
                message = "Friend request rejected."
            else:
                return Response(
                    {"message": "Invalid action. Use 'accept' or 'reject'."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            friend_request.save()
            return Response({"message": message}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"message": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ListFriendRequestsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            if request.user.userRole == 'producer':
                requests = FriendRequest.objects.filter(to_user=request.user)
            else:
                requests = FriendRequest.objects.filter(from_user=request.user)

            requests_data = [{
                'id': req.id,
                'from_user': req.from_user.username,
                'to_user': req.to_user.username,
                'status': req.status,
                'created_at': req.created_at
            } for req in requests]

            return Response(requests_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"message": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class EditProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        serializer = ProfileEditSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Profile updated successfully",
                "data": serializer.data,
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ShowProducerPostsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Ensure the user is a consumer
            if request.user.userRole != 'consumer':
                return Response(
                    {"message": "Only consumers can view producer posts."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get all accepted friend requests for the consumer
            accepted_requests = FriendRequest.objects.filter(
                from_user=request.user,
                status='accepted'
            )

            # Extract the producers from the accepted friend requests
            producers = [req.to_user for req in accepted_requests]

            # Get posts made by these producers that have no corresponding StripePayment
            posts = Post.objects.filter(
                user__in=producers
            ).exclude(
                id__in=StripePayment.objects.values_list('post_id', flat=True)
            )

            # Serialize the posts
            posts_data = [{
                'id': post.id,
                'title': post.title,
                'price': post.price,
                'kilowatts': post.kilowatts,
                'start_time': post.start_time,
                'end_time': post.end_time,
                'created_at': post.created_at,
                'producer': post.user.username
            } for post in posts]

            return Response(posts_data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"An error occurred while showing posts: {str(e)}")
            return Response(
                {"message": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ListAcceptedProducersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            if request.user.userRole != 'consumer':
                return Response(
                    {"message": "Only consumers can view accepted producers."},
                    status=status.HTTP_403_FORBIDDEN
                )

            accepted_requests = FriendRequest.objects.filter(
                from_user=request.user,
                status='accepted'
            )

            producers = [req.to_user for req in accepted_requests]

            producers_data = [{
                'id': producer.id,
                'username': producer.username,
                'email': producer.email,
                'description': getattr(producer, "description", "No description provided."),
            } for producer in producers]

            return Response(producers_data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"An error occurred while listing accepted producers: {str(e)}")
            return Response(
                {"message": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )