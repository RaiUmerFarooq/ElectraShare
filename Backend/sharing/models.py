# sharing/models.py
from django.db import models
from django.contrib.auth import get_user_model
from core.models import FriendRequest

User = get_user_model()

class SharingRelationship(models.Model):
    producer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sharing_as_producer')
    consumer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sharing_as_consumer')
    is_sharing = models.BooleanField(default=False)  # Tracks if sharing is active
    friend_request = models.OneToOneField(FriendRequest, on_delete=models.CASCADE, related_name='sharing_relationship', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('producer', 'consumer')  # Ensure one-to-one mapping per pair

    def __str__(self):
        return f"{self.producer.username} sharing with {self.consumer.username} (Sharing: {self.is_sharing})"