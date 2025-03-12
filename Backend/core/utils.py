from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
import jwt  # Make sure PyJWT is installed: pip install PyJWT
from backend.settings import EMAIL_HOST_USER
from backend.settings import SECRET_KEY
def send_verification_email(user):
    token = jwt.encode({'id': user.id}, SECRET_KEY, algorithm='HS256').decode('utf-8')
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    
    verification_link = f"http://localhost:8000/api/verify-email/{uid}/{token}/"

    subject = 'Verify Your Email'
    message = f'Please click the link to verify your email: {verification_link}'
    
    send_mail(
        subject,
        message,
        EMAIL_HOST_USER,
        [user.email],
        fail_silently=False
    )