from django.urls import path
from . import views

app_name = 'main'

urlpatterns = [
    path('', views.home, name='home'),
    path('dbimg/<str:model_name>/<int:pk>/', views.serve_db_image, name='serve_db_image'),
]
