from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

# Custom user manager
class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None):
        if not email:
            raise ValueError("Users must have an email address")
        if not username:
            raise ValueError("Users must have a username")
        
        user = self.model(
            username=username,
            email=self.normalize_email(email),
        )
        user.set_password(password)  # Hash the password
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None):
        user = self.create_user(username, email, password)
        user.is_active = True
        user.save(using=self._db)
        return user

class User(AbstractBaseUser):
    id = models.AutoField(primary_key=True)  # Automatically increments as an integer
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(unique=True)
    contactNo = models.CharField(max_length=11, null=True)
    userRole = models.TextField(default="", max_length=8)
    password = models.CharField(max_length=128)
    is_active = models.BooleanField(default=False)  # inherited from AbstractBaseUser

    # Define the unique identifier for authentication
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    objects = UserManager()  # Attach custom user manager

    def __str__(self):
        return f"{self.username} ({self.userRole})"
    
    def save(self, *args, **kwargs):
        """
        Override save to ensure password hashing is handled if needed.
        """
        if self._state.adding and not self.password.startswith("pbkdf2_sha256$"):  # Check if it's hashed
            self.set_password(self.password)  # Hash the password
        super().save(*args, **kwargs)
