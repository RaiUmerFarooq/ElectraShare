# payments/urls.py
from django.urls import path
from .views import ProcessStripePaymentView,ListAllProducerPostsView

app_name = 'payments'  # Namespace for the app

urlpatterns = [
    path('stripe/payment/', ProcessStripePaymentView.as_view(), name='stripe-payment'),
    path('list-all-producer-posts/', ListAllProducerPostsView.as_view(), name='list-all-producer-posts'),
]