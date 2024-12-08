from django.urls import path
from .views import *
from django.conf.urls.static import static


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('verify-email/<str:uidb64>/<str:token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('users/profile/', ProfileView.as_view(), name='user-profile'),
    path("post/",AddPost.as_view(),name="Add-post"),
    path("users/find/",FindProducerView.as_view(),name="Find-producer"),
    path('friend-request/send/', SendFriendRequestView.as_view(), name='send-friend-request'),
    path('friend-request/manage/<int:request_id>/', ManageFriendRequestView.as_view(), name='manage-friend-request'),
    path('friend-requests/', ListFriendRequestsView.as_view(), name='list-friend-requests'),
    path('edit-profile/', EditProfileView.as_view(), name='edit-profile'),
    path('show-producer-posts/', ShowProducerPostsView.as_view(), name='show-producer-posts'),

]   +static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
