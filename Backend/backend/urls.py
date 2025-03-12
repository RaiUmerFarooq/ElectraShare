from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls', namespace='core')),
    path('api/payments/', include('payments.urls', namespace='payments')),
    path('api/weather/', include('weather.urls', namespace='weather')),
    path('api/prediction/', include('prediction.urls')),
]

# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)