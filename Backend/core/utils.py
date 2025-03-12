from django.core.mail import EmailMultiAlternatives
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.template.loader import render_to_string
import jwt
from backend.settings import EMAIL_HOST_USER, SECRET_KEY

def send_verification_email(user):
    # Generate token and UID
    token = jwt.encode({'id': user.id}, SECRET_KEY, algorithm='HS256').decode('utf-8')
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    
    verification_link = f"http://localhost:8000/api/verify-email/{uid}/{token}/"
    
    # Determine user display name
    # Try to get full name, fall back to username if not available
    try:
        display_name = user.get_full_name() or user.username
    except AttributeError:
        display_name = user.username  # Fallback to username if get_full_name doesn't exist

    # Email context
    context = {
        'user_name': display_name,
        'verification_link': verification_link,
        'company_name': 'ElectraShare',  # Updated to match your project name
    }
    
    # Render HTML content
    html_content = render_to_string('emails/verification_email.html', context)
    text_content = f'''
    Hello {context['user_name']},
    
    Please verify your email address by clicking the link below:
    {verification_link}
    
    If you didn't create an account with {context['company_name']}, please ignore this email.
    
    Regards,
    The {context['company_name']} Team
    '''

    # Email settings
    subject = f'Verify Your Email Address - Welcome to {context["company_name"]}'
    from_email = f'{context["company_name"]} <{EMAIL_HOST_USER}>'
    to_email = [user.email]

    # Create email
    email = EmailMultiAlternatives(
        subject,
        text_content,
        from_email,
        to_email
    )
    email.attach_alternative(html_content, "text/html")
    
    # Send email
    try:
        email.send(fail_silently=False)
    except Exception as e:
        print(f"Failed to send verification email: {str(e)}")
        raise