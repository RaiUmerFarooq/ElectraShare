from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

class UserRegistrationTestCase(APITestCase):
    def test_registration_and_verification(self):
        registration_data = {
            'username': 'testuser2',
            'email': 'test2@example.com',
            'contactNo': '03034534523',
            'userRole': 'Producer',
            'password': 'testpassword',

        }
        response = self.client.post(reverse('register'), registration_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

class UserLoginTestCase(APITestCase):
    def test_login(self):
        login_data = {
            'username': 'testuser',
            'password': 'testpassword',
        }
        response = self.client.post(reverse('login'), login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
