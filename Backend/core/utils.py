from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
import jwt
from backend.settings import EMAIL_HOST_USER, SECRET_KEY
from rest_framework.response import Response
from rest_framework import status

User = get_user_model()

# Existing utility functions
def decode_uid(uidb64):
    try:
        return force_str(urlsafe_base64_decode(uidb64))
    except ValueError:
        return None

def verify_jwt_token(token, secret_key):
    try:
        return jwt.decode(token, secret_key, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.DecodeError:
        return None

def get_user_or_404(**kwargs):
    return get_object_or_404(User, **kwargs)

def handle_exception(e, message="An unexpected error occurred."):
    print(f"Error: {str(e)}")
    return Response({"message": message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Updated send_verification_email function
def send_verification_email(user):
    """
    Send a verification email to the user with a JWT token and encoded UID.
    
    Args:
        user: The User instance to send the email to.
    
    Raises:
        Exception: If email sending fails.
    """
    # Generate token and UID
    token = generate_jwt_token(user)
    uid = encode_uid(user.pk)

    # Build verification link
    verification_link = f"http://localhost:8000/api/verify-email/{uid}/{token}/"

    # Get display name with fallback
    display_name = get_display_name(user)

    # Email context
    company_name = "ElectraShare"
    context = {
        "user_name": display_name,
        "verification_link": verification_link,
        "company_name": company_name,
    }

    # Prepare email content
    subject = f"Verify Your Email Address - Welcome to {company_name}"
    from_email = f"{company_name} <{EMAIL_HOST_USER}>"
    to_email = [user.email]
    html_content = render_to_string("emails/verification_email.html", context)
    text_content = generate_text_content(context)

    # Send email
    send_email(subject, text_content, from_email, to_email, html_content)

# Helper functions for send_verification_email
def generate_jwt_token(user):
    """Generate a JWT token for the user."""
    return jwt.encode({"id": user.id}, SECRET_KEY, algorithm="HS256").decode("utf-8")

def encode_uid(user_id):
    """Encode the user ID into a URL-safe base64 string."""
    return urlsafe_base64_encode(force_bytes(user_id))

def get_display_name(user):
    """Get the user's display name with fallback to username."""
    try:
        return user.get_full_name() or user.username
    except AttributeError:
        return user.username

def generate_text_content(context):
    """Generate plain text content for the email."""
    return f"""
    Hello {context['user_name']},
    
    Please verify your email address by clicking the link below:
    {context['verification_link']}
    
    If you didn't create an account with {context['company_name']}, please ignore this email.
    
    Regards,
    The {context['company_name']} Team
    """

def send_email(subject, text_content, from_email, to_email, html_content):
    """Send an email with both text and HTML content."""
    email = EmailMultiAlternatives(subject, text_content, from_email, to_email)
    email.attach_alternative(html_content, "text/html")
    try:
        email.send(fail_silently=False)
    except Exception as e:
        print(f"Failed to send verification email: {str(e)}")
        raise