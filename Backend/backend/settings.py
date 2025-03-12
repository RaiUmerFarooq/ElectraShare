from pathlib import Path
from decouple import config  # For environment variables
import os
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'
BASE_DIR = Path(__file__).resolve().parent.parent

# Security and Secret Key
SECRET_KEY = config('DJANGO_SECRET_KEY', default='django-insecure-_1rtxpri(@l+^ziv$qb07u)205yfyl6yq#++2muiaiyuoq=4_l')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='*', cast=lambda v: [s.strip() for s in v.split(',')])

# Application Definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'core',  # Custom app for user model and core logic
    'payments',
    'weather',
    'prediction',
    'rest_framework',
    'rest_framework.authtoken',
    'rest_auth',
    'allauth',  # For authentication
    'allauth.account',
    'allauth.socialaccount',
]

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

# Simple JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='electrasharee@gmail.com')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='bypy dsoj zqos hjgi')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='electrasharee@gmail.com')  # Updated to match EMAIL_HOST_USER

# Middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# URL Configuration
ROOT_URLCONF = 'backend.urls'

# Template Configuration
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],  # Correct path for project-level templates
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# Stripe Configuration
STRIPE_SECRET_KEY = config('STRIPE_SECRET_KEY', default='sk_test_51PsVavGFxGSFALoa45q69uIUCnZMLe9IYc8wnrcb9sz3ymIFXNJmFUuaBIJn5U2AKCWlKFGqCFs6ZzKpodEeVzzy00DOkF7aYR')
STRIPE_PUBLISHABLE_KEY = config('STRIPE_PUBLISHABLE_KEY', default='pk_test_51PsVavGFxGSFALoaoxetGEh95HNTP8pusS8VzRS2bQ8GDh5Pa3yXhsqXAgZVSoumrIUXwuOFDJ56KLMPwvz3GOTQ00RbxD5gXM')

# Database Configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'electrashare_db',
        'USER': 'electrashare',
        'PASSWORD': config('DB_PASSWORD', default='1234'),
        'HOST': 'localhost',
        'PORT': '3306',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'"
        }
    }
}

# Custom User Model
AUTH_USER_MODEL = 'core.User'

# Password Validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static and Media Files
STATIC_URL = 'static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Weather API Configuration
WEATHER_API_KEY = config('WEATHER_API_KEY', default='5MUZU3NHYW45N9ACWN46YKYGP')

# CORS Configuration
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='http://localhost:8081', cast=lambda v: [s.strip() for s in v.split(',')])
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True

# Default Auto Field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Celery Configuration
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

# Weather Cities
WEATHER_CITIES = [
    'Lahore',
    'Karachi',
    'Islamabad',
    'New York',
    'London',
    'Tokyo',
    'Sydney',
    'Paris',
    'Dubai',
    'Toronto',
    'Mumbai',
    'Beijing',
    'Cape Town',
    'Sao Paulo',
    'Moscow',
]

# Celery Beat Schedule
CELERY_BEAT_SCHEDULE = {
    'fetch-weather-every-hour': {
        'task': 'weather.tasks.fetch_weather_for_all_cities',
        'schedule': 3600.0,  # Run every hour (3600 seconds)
    },
}