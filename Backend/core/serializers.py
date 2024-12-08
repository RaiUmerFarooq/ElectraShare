from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
import jwt
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
            contactNo=contact_no,
            userRole=user_role
            
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        # Authenticate the user using both username and password
        user = authenticate(username=data['username'], password=data['password'])
        
        if user is not None and user.is_active:
            return user  # Successful authentication
        raise serializers.ValidationError("Invalid credentials")

#, password=data['password']

class ProfileEditSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)  # Optional profile image

    class Meta:
        model = User
        fields = ['username', 'contactNo', 'image']  # Fields that can be updated

    def update(self, instance, validated_data):
        # Update the instance with the validated data
        instance.username = validated_data.get('username', instance.username)
        instance.contactNo = validated_data.get('contactNo', instance.contactNo)
        instance.image = validated_data.get('image', instance.image)
        instance.save()
        return instance