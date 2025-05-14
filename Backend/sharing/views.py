from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import SharingRelationship
from .serializers import SharingRelationshipSerializer
from django.contrib.auth import get_user_model
from core.models import FriendRequest
User = get_user_model()

# API 1: List all friend connections from producer side with sharing status
class ProducerConnectionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            if user.userRole != 'producer':
                return Response({"error": "Only producers can access this endpoint"}, status=status.HTTP_403_FORBIDDEN)

            # Get all friend requests where the user is the 'to_user' and status is 'accepted'
            accepted_requests = FriendRequest.objects.filter(to_user=user, status='accepted')

            # Get corresponding sharing relationships
            sharing_relationships = []
            for request in accepted_requests:
                relationship = SharingRelationship.objects.filter(producer=user, consumer=request.from_user).first()
                if relationship:
                    sharing_relationships.append(relationship)

            serializer = SharingRelationshipSerializer(sharing_relationships, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# API 2: Update sharing status from producer side
class UpdateSharingStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            if user.userRole != 'producer':
                return Response({"error": "Only producers can update sharing status"}, status=status.HTTP_403_FORBIDDEN)

            consumer_username = request.data.get('consumer_username')  # Accept consumer_username
            is_sharing = request.data.get('is_sharing', False)

            if not consumer_username:
                return Response({"error": "consumer_username is required"}, status=status.HTTP_400_BAD_REQUEST)

            # Find the consumer by username and get the ID
            try:
                consumer = User.objects.get(username=consumer_username)
                consumer_id = consumer.id  # Retrieve the consumer_id internally
            except User.DoesNotExist:
                return Response({"error": "Consumer with this username not found"}, status=status.HTTP_404_NOT_FOUND)

            if not FriendRequest.objects.filter(to_user=user, from_user=consumer, status='accepted').exists():
                return Response({"error": "No accepted friend connection with this consumer"}, status=status.HTTP_400_BAD_REQUEST)

            relationship, created = SharingRelationship.objects.get_or_create(producer=user, consumer=consumer)
            relationship.is_sharing = is_sharing
            relationship.save()

            serializer = SharingRelationshipSerializer(relationship)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# API 3: List all shared connections from consumer side
class ConsumerSharedConnectionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            if user.userRole != 'consumer':
                return Response({"error": "Only consumers can access this endpoint"}, status=status.HTTP_403_FORBIDDEN)

            # Get all sharing relationships where the user is the consumer and is_sharing is True
            shared_relationships = SharingRelationship.objects.filter(from_user=user, is_sharing=True)

            serializer = SharingRelationshipSerializer(shared_relationships, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)