# payments/urls.py
from django.urls import path
from .views import ProcessStripePaymentView

app_name = 'payments'  # Namespace for the app

urlpatterns = [
    path('stripe/payment/', ProcessStripePaymentView.as_view(), name='stripe-payment'),
]