from django.urls import path
from . import views
app_name="weather"
urlpatterns = [
    path('<str:city>/', views.get_weather, name='get_weather'),
]