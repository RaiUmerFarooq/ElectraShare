from .settings import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}
SECRET_KEY = 'django-insecure-_1rtxpri(@l+^ziv$qb07u)205yfyl6yq#++2muiaiyuoq=4_l'