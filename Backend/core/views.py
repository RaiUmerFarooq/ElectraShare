from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework.response import Response
from .serializers import RegisterSerializer, LoginSerializer, ProfileEditSerializer
from .utils import send_verification_email, decode_uid, verify_jwt_token, get_user_or_404
from .models import Post, FriendRequest
from payments.models import StripePayment
from .views_base import BaseAPIView
from django.db.models import Q
import logging

logger = logging.getLogger(__name__)

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
                "message": "Registration successful. Please check your email to verify your account.",
                "refresh": str(refresh),
                "access": str(refresh.access_token),
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
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "status": user.userRole,
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(APIView):
    def get(self, request, uidb64, token):
        uid = decode_uid(uidb64)
        if not uid:
            return Response({"message": "Invalid user ID."}, status=status.HTTP_404_NOT_FOUND)

        user = get_user_or_404(id=uid)
        payload = verify_jwt_token(token, settings.SECRET_KEY)
        if not payload or int(payload.get("id", -1)) != user.id:
            return Response({"message": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = True
        user.save()
        return Response({"message": "Email verified successfully. You can now log in."}, status=status.HTTP_200_OK)

class ProfileView(BaseAPIView):
    def get(self, request):
        user = request.user
        serializer = ProfileEditSerializer(user)  # Updated to use ProfileEditSerializer
        return Response(serializer.data, status=status.HTTP_200_OK)

class AddPost(BaseAPIView):
    def post(self, request):
        try:
            data = request.data
            required_fields = ["title", "price", "kilowatts", "start_time", "end_time"]
            if not all(data.get(field) for field in required_fields):
                return Response({"message": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                price = float(data["price"])
                kilowatts = float(data["kilowatts"])
            except ValueError:
                return Response({"message": "Price and kilowatts must be valid numbers."}, status=status.HTTP_400_BAD_REQUEST)

            post = Post.objects.create(
                user=request.user,
                title=data["title"],
                price=price,
                kilowatts=kilowatts,
                start_time=data["start_time"],
                end_time=data["end_time"],
            )
            return Response({"message": "Post created successfully.", "post_id": post.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return self.handle_exception(e)

class FindProducerView(BaseAPIView):
   

    def post(self, request):
        search_query = request.data.get('username')

        if not search_query:
            return Response(
                {"message": "Please provide a username to search for a producer."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = get_user_or_404(userRole='producer', username=search_query)
            if not user:
                return Response(
                    {"message": "Producer not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

            connection_status = "not connected"
            # Check only requests where the current user is from_user and the searched user is to_user
            user_request = FriendRequest.objects.filter(
                from_user=request.user,
                to_user=user,
                status__in=["pending", "accepted", "rejected"]
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

class SendFriendRequestView(BaseAPIView):
    def post(self, request):
        producer_id = request.data.get("producer_id")
        try:
            if request.user.userRole != "consumer":
                return Response({"message": "Only consumers can send friend requests."}, status=status.HTTP_403_FORBIDDEN)

            producer = get_user_or_404(id=producer_id, userRole="producer")
            if FriendRequest.objects.filter(from_user=request.user, to_user=producer).exists():
                return Response({"message": "A friend request to this producer already exists."}, status=status.HTTP_400_BAD_REQUEST)

            FriendRequest.objects.create(from_user=request.user, to_user=producer)
            return Response({"message": "Friend request sent successfully."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return self.handle_exception(e)

class ManageFriendRequestView(BaseAPIView):
    def post(self, request, request_id):
        action = request.data.get("action")
        try:
            if request.user.userRole != "producer":
                return Response({"message": "Only producers can manage friend requests."}, status=status.HTTP_403_FORBIDDEN)

            friend_request = get_object_or_404(
                FriendRequest,
                id=request_id,
                to_user=request.user,
                status='pending'
            )
            if action not in ["accept", "reject"]:
                return Response({"message": "Invalid action. Use 'accept' or 'reject'."}, status=status.HTTP_400_BAD_REQUEST)

            friend_request.status = action + "ed"
            friend_request.save()
            return Response({"message": f"Friend request {friend_request.status}."}, status=status.HTTP_200_OK)
        except Exception as e:
            return self.handle_exception(e)

class ListFriendRequestsView(BaseAPIView):
    def get(self, request):
        try:
            if request.user.userRole == "producer":
                requests = FriendRequest.objects.filter(to_user=request.user)
            else:
                requests = FriendRequest.objects.filter(from_user=request.user)

            requests_data = [
                {
                    "id": req.id,
                    "from_user": req.from_user.username,
                    "to_user": req.to_user.username,
                    "status": req.status,
                    "created_at": req.created_at,
                }
                for req in requests
            ]
            return Response(requests_data, status=status.HTTP_200_OK)
        except Exception as e:
            return self.handle_exception(e)

class EditProfileView(BaseAPIView):
    def put(self, request):
        try:
            user = request.user
            
            if 'image' in request.FILES:
                image_file = request.FILES['image']
                binary_data = image_file.read()
                logger.info(f"Received image from frontend for user {user.username}. Binary data (first 100 bytes): {binary_data[:100]}")
                image_file.seek(0)
            
            serializer = ProfileEditSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                logger.info(f"Profile updated successfully for user: {user.username}")
                logger.debug(f"Response data: {serializer.data}")
                return Response(
                    {"message": "Profile updated successfully", "data": serializer.data},
                    status=status.HTTP_200_OK
                )
            logger.warning(f"Validation errors for user {user.username}: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error updating profile for user {request.user.username}: {str(e)}")
            return self.handle_exception(e, "Failed to update profile due to an unexpected error.")

class ShowProducerPostsView(BaseAPIView):
    def get(self, request):
        try:
            if request.user.userRole != "consumer":
                return Response({"message": "Only consumers can view producer posts."}, status=status.HTTP_403_FORBIDDEN)

            producers = [req.to_user for req in FriendRequest.objects.filter(from_user=request.user, status="accepted")]
            posts = Post.objects.filter(user__in=producers).exclude(id__in=StripePayment.objects.values_list("post_id", flat=True))
            posts_data = [
                {
                    "id": post.id,
                    "title": post.title,
                    "price": post.price,
                    "kilowatts": post.kilowatts,
                    "start_time": post.start_time,
                    "end_time": post.end_time,
                    "created_at": post.created_at,
                    "producer": post.user.username,
                }
                for post in posts
            ]
            return Response(posts_data, status=status.HTTP_200_OK)
        except Exception as e:
            return self.handle_exception(e)

class ListAcceptedProducersView(BaseAPIView):
    def get(self, request):
        try:
            if request.user.userRole != "consumer":
                return Response({"message": "Only consumers can view accepted producers."}, status=status.HTTP_403_FORBIDDEN)

            producers = [req.to_user for req in FriendRequest.objects.filter(from_user=request.user, status="accepted")]
            producers_data = [
                {
                    "id": producer.id,
                    "username": producer.username,
                    "email": producer.email,
                    "description": getattr(producer, "description", "No description provided."),
                }
                for producer in producers
            ]
            return Response(producers_data, status=status.HTTP_200_OK)
        except Exception as e:
            return self.handle_exception(e)