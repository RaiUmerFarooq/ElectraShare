from django.urls import reverse
from core.models import Post, FriendRequest
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings  # Import settings once
import jwt


User = get_user_model()


class UserRegistrationTestCase(APITestCase):
    def test_registration_and_verification(self):
        registration_data = {
            'username': 'testuser2',
            'email': 'test2@example.com',
            'contactNo': '03034534523',
            'userRole': 'producer',
            'password': 'testpassword',
        }
        response = self.client.post(reverse('register'), registration_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_registration_missing_username(self):
        registration_data = {
            'email': 'test2@example.com',
            'contactNo': '03034534523',
            'userRole': 'producer',
            'password': 'testpassword',
        }
        response = self.client.post(reverse('register'), registration_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_BAD_REQUEST)

    def test_registration_invalid_email(self):
        registration_data = {
            'username': 'testuser2',
            'email': 'invalid-email',
            'contactNo': '03034534523',
            'userRole': 'producer',
            'password': 'testpassword',
        }
        response = self.client.post(reverse('register'), registration_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registration_duplicate_username(self):
        # First registration
        registration_data = {
            'username': 'testuser2',
            'email': 'test2@example.com',
            'contactNo': '03034534523',
            'userRole': 'producer',
            'password': 'testpassword',
        }
        self.client.post(reverse('register'), registration_data, format='json')
        
        # Second registration with the same username
        response = self.client.post(reverse('register'), registration_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class UserLoginTestCase(APITestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword',
            email='test@example.com',
            contactNo='1234567890',
            userRole='producer'
        )
        self.user.is_active = True
        self.user.save()

    def test_login(self):
        login_data = {
            'username': 'testuser',
            'password': 'testpassword',
        }
        response = self.client.post(reverse('login'), login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


    def test_login_incorrect_password(self):
        login_data = {
            'username': 'testuser',
            'password': 'wrongpassword',
        }
        response = self.client.post(reverse('login'), login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_non_existent_user(self):
        login_data = {
            'username': 'nonexistentuser',
            'password': 'testpassword',
        }
        response = self.client.post(reverse('login'), login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_login_inactive_user(self):
        # Create an inactive user
        inactive_user = User.objects.create_user(
            username='inactiveuser',
            password='testpassword',
            email='inactive@example.com',
            contactNo='1234567890',
            userRole='producer'
        )
        inactive_user.is_active = False
        inactive_user.save()
        
        login_data = {
            'username': 'inactiveuser',
            'password': 'testpassword',
        }
        response = self.client.post(reverse('login'), login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class ProfileViewTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword',
            email='test@example.com',
            contactNo='1234567890',
            userRole='producer'
        )
        self.user.is_active = True
        self.user.save()
        self.client.force_authenticate(user=self.user)

    def test_get_profile(self):
        response = self.client.get(reverse('user-profile'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')

class AddPostTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword',
            email='test@example.com',
            contactNo='1234567890',
            userRole='producer'
        )
        self.user.is_active = True
        self.user.save()
        self.client.force_authenticate(user=self.user)

    def test_create_post(self):
        post_data = {
            'title': 'Test Post',
            'price': '10.50',
            'kilowatts': '5.0',
            'start_time': '09:00',
            'end_time': '17:00'
        }
        response = self.client.post(reverse('Add-post'), post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Post.objects.count(), 1)

    def test_create_post_missing_fields(self):
        post_data = {
            'title': 'Test Post',
            'price': '10.50'
        }
        response = self.client.post(reverse('Add-post'), post_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class VerifyEmailViewTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword',
            email='test@example.com',
            contactNo='1234567890',
            userRole='producer'
        )
        self.user.is_active = False
        self.user.save()

    def test_email_verification(self):
        # Generate verification token
        token = jwt.encode({'id': self.user.id}, settings.SECRET_KEY, algorithm='HS256')
        uid = urlsafe_base64_encode(force_bytes(self.user.id))
        
        response = self.client.get(reverse('verify-email', args=[uid, token]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)

    def test_email_verification_invalid_token(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.id))
        response = self.client.get(reverse('verify-email', args=[uid, 'invalid-token']))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class FindProducerViewTestCase(APITestCase):
    def setUp(self):
        self.producer = User.objects.create_user(
            username='producer',
            password='testpassword',
            email='producer@example.com',
            contactNo='1234567890',
            userRole='producer'
        )
        self.producer.is_active = True
        self.producer.save()

        self.consumer = User.objects.create_user(
            username='consumer',
            password='testpassword',
            email='consumer@example.com',
            contactNo='1234567890',
            userRole='consumer'
        )
        self.consumer.is_active = True
        self.consumer.save()
        self.client.force_authenticate(user=self.consumer)

    def test_find_producer(self):
        response = self.client.post(reverse('Find-producer'), {'username': 'producer'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'producer')

    def test_find_producer_not_found(self):
        response = self.client.post(reverse('Find-producer'), {'username': 'nonexistent'})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class FriendRequestTestCase(APITestCase):
    def setUp(self):
        self.producer = User.objects.create_user(
            username='producer',
            password='testpassword',
            email='producer@example.com',
            contactNo='1234567890',
            userRole='producer'
        )
        self.producer.is_active = True
        self.producer.save()

        self.consumer = User.objects.create_user(
            username='consumer',
            password='testpassword',
            email='consumer@example.com',
            contactNo='1234567890',
            userRole='consumer'
        )
        self.consumer.is_active = True
        self.consumer.save()
        self.client.force_authenticate(user=self.consumer)

    def test_send_friend_request(self):
        response = self.client.post(reverse('send-friend-request'), {'producer_id': self.producer.id})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FriendRequest.objects.count(), 1)

    def test_manage_friend_request(self):
        # First send a request
        self.client.post(reverse('send-friend-request'), {'producer_id': self.producer.id})
        request = FriendRequest.objects.first()
        
        # Test accepting the request
        self.client.force_authenticate(user=self.producer)
        response = self.client.post(reverse('manage-friend-request', args=[request.id]), {'action': 'accept'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        request.refresh_from_db()
        self.assertEqual(request.status, 'accepted')

    def test_list_friend_requests(self):
        # Send a request first
        self.client.post(reverse('send-friend-request'), {'producer_id': self.producer.id})
        
        # Test listing requests as consumer
        response = self.client.get(reverse('list-friend-requests'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        # Test listing requests as producer
        self.client.force_authenticate(user=self.producer)
        response = self.client.get(reverse('list-friend-requests'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

class EditProfileViewTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword',
            email='test@example.com',
            contactNo='1234567890',
            userRole='producer'
        )
        self.user.is_active = True
        self.user.save()
        self.client.force_authenticate(user=self.user)

    def test_edit_profile(self):
        update_data = {
            'username': 'newusername',
            'contactNo': '0987654321'
        }
        response = self.client.put(reverse('edit-profile'), update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, 'newusername')
        self.assertEqual(self.user.contactNo, '0987654321')

class ShowProducerPostsViewTestCase(APITestCase):
    def setUp(self):
        self.producer = User.objects.create_user(
            username='producer',
            password='testpassword',
            email='producer@example.com',
            contactNo='1234567890',
            userRole='producer'
        )
        self.producer.is_active = True
        self.producer.save()

        self.consumer = User.objects.create_user(
            username='consumer',
            password='testpassword',
            email='consumer@example.com',
            contactNo='1234567890',
            userRole='consumer'
        )
        self.consumer.is_active = True
        self.consumer.save()
        
        # Create a friend request
        FriendRequest.objects.create(
            from_user=self.consumer,
            to_user=self.producer,
            status='accepted'
        )
        
        # Create some posts
        Post.objects.create(
            user=self.producer,
            title='Test Post 1',
            price=10.50,
            kilowatts=5.0,
            start_time='09:00',
            end_time='17:00'
        )
        self.client.force_authenticate(user=self.consumer)

    def test_show_producer_posts(self):
        response = self.client.get(reverse('show-producer-posts'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Test Post 1')
