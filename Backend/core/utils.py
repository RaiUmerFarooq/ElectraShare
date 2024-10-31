from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
import jwt  # Make sure PyJWT is installed: pip install PyJWT

def send_verification_email(user):
    # Generate a JWT token for the user ID
    token = jwt.encode({'id': user.id}, 'your-secret-key', algorithm='HS256').decode('utf-8')  # Decode to string
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    
    # Construct the verification link
    verification_link = f"http://localhost:8000/api/verify-email/{uid}/{token}/"  # Ensure this matches your URL configuration

    # Email subject and message
    subject = 'Verify Your Email'
    message = f'Please click the link to verify your email: {verification_link}'
    
    # Send the email to the user's email address
    send_mail(
        subject,
        message,
        'raifarooq7860786@gmail.com',  # From email
        [user.email],                   # To email
        fail_silently=False
    )