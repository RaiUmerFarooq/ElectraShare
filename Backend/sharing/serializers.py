# sharing/serializers.py
from rest_framework import serializers
from .models import SharingRelationship
from django.contrib.auth import get_user_model

User = get_user_model()

class SharingRelationshipSerializer(serializers.ModelSerializer):
    producer_username = serializers.CharField(source='producer.username', read_only=True)
    consumer_username = serializers.CharField(source='consumer.username', read_only=True)

    class Meta:
        model = SharingRelationship
        fields = ['producer_username', 'consumer_username', 'is_sharing']