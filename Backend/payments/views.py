from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
import stripe
from django.conf import settings
from decimal import Decimal
import logging
from .models import StripePayment
from core.models import Post

# Set up logging
logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY

class ProcessStripePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Print incoming request data for debugging
            print("Incoming request data:", request.data)

            # Get payment details
            amount_pkr = request.data.get('amount')  # PKR amount from request
            post_id = request.data.get('post_id')

            # Validate input
            if not amount_pkr or float(amount_pkr) <= 0:
                print("Invalid amount received:", amount_pkr)
                return Response(
                    {"message": "Valid positive amount required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get the post
            post = get_object_or_404(Post, id=post_id)
            print(f"Processing payment for Post ID: {post_id}, User ID: {request.user.id}")

            # Manual conversion rate (replace with actual rate or API call)
            EXCHANGE_RATE = Decimal('280.0')  # 1 USD = 280 PKR (example; update as needed)
            print(f"Using exchange rate: {EXCHANGE_RATE}")

            # Convert PKR to USD
            amount_usd = Decimal(amount_pkr) / EXCHANGE_RATE
            print(f"Converted amount in USD: {amount_usd}")

            # Convert to cents for Stripe (USD)
            amount_in_cents = int(amount_usd * 100)
            print(f"Amount in cents (for Stripe): {amount_in_cents}")

            # Create Stripe payment intent in USD
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_in_cents,
                currency='usd',
                payment_method_types=['card'],
                metadata={
                    'original_amount_pkr': str(amount_pkr),
                    'exchange_rate': str(EXCHANGE_RATE),
                    'post_id': post.id,
                    'user_id': request.user.id
                }
            )

            # Store payment details with initial status as 'pending' (will be updated on confirmation)
            payment = StripePayment.objects.create(
                user=request.user,
                post=post,
                post_creator=post.user,
                stripe_payment_intent_id=payment_intent.id,
                amount_pkr=amount_pkr,
                amount_usd=amount_usd,
                exchange_rate=EXCHANGE_RATE,
                currency='usd',
                status='pending'  # Initial status, updated by client or webhook
            )

            # Return the client secret for the frontend to confirm the payment
            return Response({
                "message": "Payment intent created. Please confirm payment on the client side.",
                "client_secret": payment_intent.client_secret,
                "converted_amount": float(amount_usd),
                "currency": "usd",
                "payment_id": payment.id,
                "status": payment.status  # Return initial status (pending)
            }, status=status.HTTP_201_CREATED)

        except stripe.error.CardError as e:
            logger.error(f"Stripe Card Error: {e.user_message}")
            print(f"Stripe Card Error: {e.user_message}")
            return Response(
                {"message": f"Payment failed: {e.user_message}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        except stripe.error.StripeError as e:
            logger.error(f"Stripe API Error: {str(e)}")
            print(f"Stripe API Error: {str(e)}")
            return Response(
                {"message": "Payment processing failed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            logger.error(f"Unexpected Error: {str(e)}")
            print(f"Unexpected Error: {str(e)}")
            return Response(
                {"message": "Payment processing failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )