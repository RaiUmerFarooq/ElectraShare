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
from django.views.decorators.csrf import csrf_exempt

# Set up logging
logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY

class ProcessStripePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            print("Incoming request data:", request.data)

            # Extract and validate required fields
            amount_pkr = request.data.get('amount')
            post_id = request.data.get('post_id')
            payment_method_id = request.data.get('payment_method_id')

            # Validate required fields
            if not amount_pkr or float(amount_pkr) <= 0:
                print("Invalid amount received:", amount_pkr)
                return Response(
                    {"message": "Valid positive amount required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not post_id:
                print("Post ID is missing")
                return Response(
                    {"message": "Post ID is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not payment_method_id:
                print("Payment method ID is missing")
                return Response(
                    {"message": "Payment method ID is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Fetch the post
            post = get_object_or_404(Post, id=post_id)
            print(f"Processing payment for Post ID: {post_id}, User ID: {request.user.id}")

            # Convert PKR to USD using a fixed exchange rate
            EXCHANGE_RATE = Decimal('280.0')  # Update with real-time rate if possible
            print(f"Using exchange rate: {EXCHANGE_RATE}")

            amount_usd = Decimal(amount_pkr) / EXCHANGE_RATE
            print(f"Converted amount in USD: {amount_usd}")

            amount_in_cents = int(amount_usd * 100)
            print(f"Amount in cents (for Stripe): {amount_in_cents}")

            # Create a Payment Intent with automatic payment methods configured
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_in_cents,
                currency='usd',
                payment_method=payment_method_id,
                confirm=True,  # Confirm immediately
                automatic_payment_methods={
                    'enabled': True,
                    'allow_redirects': 'never'  # Disable redirect-based payment methods
                },
                metadata={
                    'original_amount_pkr': str(amount_pkr),
                    'exchange_rate': str(EXCHANGE_RATE),
                    'post_id': post.id,
                    'user_id': request.user.id
                }
            )

            # Store the payment details in the database
            payment = StripePayment.objects.create(
                user=request.user,
                post=post,
                post_creator=post.user,
                stripe_payment_intent_id=payment_intent.id,
                amount_pkr=amount_pkr,
                amount_usd=amount_usd,
                exchange_rate=EXCHANGE_RATE,
                currency='usd',
                status=payment_intent.status
            )

            # Return the payment details to the frontend
            return Response({
                "message": "Payment intent created and confirmed.",
                "client_secret": payment_intent.client_secret,
                "converted_amount": float(amount_usd),
                "currency": "usd",
                "payment_id": payment.id,
                "status": payment_intent.status
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

# Webhook to handle Stripe events
@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        return Response({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError as e:
        return Response({'error': 'Invalid signature'}, status=400)

    # Handle payment_intent.succeeded event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        stripe_payment = StripePayment.objects.get(stripe_payment_intent_id=payment_intent['id'])
        stripe_payment.status = 'succeeded'
        stripe_payment.save()
        print(f"Payment succeeded for intent: {payment_intent['id']}")

    return Response({'status': 'success'}, status=200)