from django.db import models
from django.contrib.auth.models import AbstractBaseUser


# Create your models here.


class User(AbstractBaseUser):
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(unique=True)
    contact = models.CharField(max_length=11, null=True)
    role = models.CharField(max_length=8)
    password = models.CharField(max_length=128)  # inherited from AbstractBaseUser

    # Define the unique identifier for authentication
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return f"{self.username} ({self.role})"
    
    def save(self, *args, **kwargs):
        """
        Override save to ensure password hashing is handled if needed.
        """
        if self._state.adding and not self.password.startswith("pbkdf2_sha256$"):  # Check if it's hashed
            self.set_password(self.password)  # hash the password
        super().save(*args, **kwargs)
