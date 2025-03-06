# payments/models.py
from django.db import models
from django.contrib.auth import get_user_model
from core.models import Post  # Import Post from the core app

User = get_user_model()

class StripePayment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stripe_payments')  # User making the payment
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='payments')  # Post related to the payment
    post_creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_payments')  # User who created the post
    stripe_payment_intent_id = models.CharField(max_length=255, unique=True)  # Stripe payment intent ID
    
    amount_pkr = models.DecimalField(max_digits=10, decimal_places=2)  # Amount in Pakistani Rupees (PKR)
    amount_usd = models.DecimalField(max_digits=10, decimal_places=2)  # Converted amount in USD
    exchange_rate = models.DecimalField(max_digits=10, decimal_places=4)  # Exchange rate used for conversion
    
    currency = models.CharField(max_length=10, default='pkr')  # Currency (e.g., PKR)
    status = models.CharField(max_length=50, default='pending')  # Increase max_length
    date = models.DateField(auto_now_add=True)  # Date of payment
    time = models.TimeField(auto_now_add=True)  # Time of payment

    def __str__(self):
        return f"Payment {self.stripe_payment_intent_id} for Post {self.post.title} by {self.user.username}"
