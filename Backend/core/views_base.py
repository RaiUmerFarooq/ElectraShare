from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .utils import handle_exception

class BaseAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def handle_exception(self, e, message="An unexpected error occurred."):
        return handle_exception(e, message)