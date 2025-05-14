# sharing/urls.py
from django.urls import path
from .views import ProducerConnectionsView, UpdateSharingStatusView, ConsumerSharedConnectionsView

urlpatterns = [
    path('producer/connections/', ProducerConnectionsView.as_view(), name='producer-connections'),
    path('producer/update-sharing/', UpdateSharingStatusView.as_view(), name='update-sharing'),
    path('consumer/shared-connections/', ConsumerSharedConnectionsView.as_view(), name='consumer-shared-connections'),
]