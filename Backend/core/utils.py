# utils.py

from django.core.mail import send_mail
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
import jwt  # Make sure to install PyJWT for encoding tokens

def send_verification_email(user):
    # Generate a token
    token = jwt.encode({'user_id': user.id}, 'your-secret-key', algorithm='HS256')
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    
    verification_link = f"http://your-frontend-url/verify-email/{uid}/{token}/"

    subject = 'Verify Your Email'
    message = f'Please click the link to verify your email: {verification_link}'
    send_mail(subject, message, 'your-email@example.com', [user.email])
