from django.urls import path
from .views import StoreSolarReadingView, FetchSolarPowerView, GetTotalProductionView

urlpatterns = [
    path('store-reading/', StoreSolarReadingView.as_view(), name='store-solar-reading'),
    path('fetch-power/', FetchSolarPowerView.as_view(), name='fetch-solar-power'),
    path('get-total-production/', GetTotalProductionView.as_view(), name='get-total-production'),
]