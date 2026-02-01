from django.urls import path
from . import views, adminka_views

app_name = 'main'

urlpatterns = [
    path('', views.home, name='home'),
    path('dbimg/<str:model_name>/<int:pk>/', views.serve_db_image, name='serve_db_image'),
    
    # Админка /adminka
    path('adminka/login/', adminka_views.adminka_login, name='adminka_login'),
    path('adminka/logout/', adminka_views.adminka_logout, name='adminka_logout'),
    path('adminka/', adminka_views.adminka_dashboard, name='adminka_dashboard'),
    
    # Проекты
    path('adminka/projects/', adminka_views.adminka_projects, name='adminka_projects'),
    path('adminka/projects/add/', adminka_views.adminka_project_add, name='adminka_project_add'),
    path('adminka/projects/<int:pk>/', adminka_views.adminka_project_view, name='adminka_project_view'),
    path('adminka/projects/<int:pk>/edit/', adminka_views.adminka_project_edit, name='adminka_project_edit'),
    path('adminka/projects/<int:pk>/delete/', adminka_views.adminka_project_delete, name='adminka_project_delete'),
    
    # Поддержка
    path('adminka/support/', adminka_views.adminka_support, name='adminka_support'),
    path('adminka/support/<int:pk>/edit/', adminka_views.adminka_support_edit, name='adminka_support_edit'),
    path('adminka/support/<int:pk>/delete/', adminka_views.adminka_support_delete, name='adminka_support_delete'),
    
    # Категории
    path('adminka/categories/', adminka_views.adminka_categories, name='adminka_categories'),
    path('adminka/categories/<int:pk>/delete/', adminka_views.adminka_category_delete, name='adminka_category_delete'),
]
