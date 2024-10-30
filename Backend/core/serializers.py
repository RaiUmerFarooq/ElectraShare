# serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    contactNo = serializers.CharField(write_only=True)  # Defined as write-only to avoid saving directly
    userRole = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'contactNo', 'userRole', 'password']

    def create(self, validated_data):

        contact_no = validated_data.pop('contactNo', None)
        user_role = validated_data.pop('userRole', None)
        # Hash the password and create the user
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        # Authenticate the user
        user = authenticate(username=data['username'], password=data['password'])
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Invalid credentials")
