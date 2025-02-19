from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.conf import settings
# Custom user manager
class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, contactNo=None, userRole='consumer'):
        if not email:
            raise ValueError("Users must have an email address")
        if not username:
            raise ValueError("Users must have a username")
        if userRole not in ['consumer', 'producer']:
            raise ValueError("userRole must be either 'consumer' or 'producer'")
        
        user = self.model(
            username=username,
            email=self.normalize_email(email),
            contactNo=contactNo,
            userRole=userRole
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
    userRole = models.CharField(max_length=8, choices=[('consumer', 'Consumer'), ('producer', 'Producer')], default='consumer')

    password = models.CharField(max_length=128)
    image = models.ImageField(upload_to='profile_images/', blank=True, null=True)  # New field for profile image
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

class Post(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # Reference the custom User model
        on_delete=models.CASCADE,
        related_name="posts"
    )
    title = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    kilowatts = models.DecimalField(max_digits=10, decimal_places=2)
    start_time = models.TimeField()
    end_time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} by {self.user.username}"

class FriendRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected')
    )
    
    from_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='sent_requests',
        on_delete=models.CASCADE
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='received_requests',
        on_delete=models.CASCADE
    )
    status = models.CharField(max_length=8, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('from_user', 'to_user')

    def __str__(self):
        return f"Friend request from {self.from_user} to {self.to_user} ({self.status})"
