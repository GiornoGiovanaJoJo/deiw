from django.urls import path, reverse_lazy
from django.contrib.auth import views as auth_views
from . import views, adminka_views, cabinet_views

app_name = 'main'

urlpatterns = [
    path('', views.home, name='home'),
    path('privacy/', views.privacy_page, name='privacy'),
    path('terms/', views.terms_page, name='terms'),
    path('dbimg/<str:model_name>/<int:pk>/', views.serve_db_image, name='serve_db_image'),
    
    # API формы: категории, подкатегории, вопросы, отправка заявки/поддержки
    path('api/request-categories/', views.api_request_categories, name='api_request_categories'),
    path('api/request-subcategories/', views.api_request_subcategories, name='api_request_subcategories'),
    path('api/request-questions/', views.api_request_questions, name='api_request_questions'),
    path('api/submit-support/', views.api_submit_support, name='api_submit_support'),
    path('api/submit-request/', views.api_submit_request, name='api_submit_request'),
    
    # Админка /adminka
    path('adminka/login/', adminka_views.adminka_login, name='adminka_login'),
    path('register/', adminka_views.register_view, name='register'),
    path('adminka/logout/', adminka_views.adminka_logout, name='adminka_logout'),
    path('adminka/', adminka_views.adminka_dashboard, name='adminka_dashboard'),
    path('adminka/profile/', adminka_views.adminka_profile, name='adminka_profile'),
    
    # Проекты
    path('adminka/projects/', adminka_views.adminka_projects, name='adminka_projects'),
    path('adminka/projects/add/', adminka_views.adminka_project_add, name='adminka_project_add'),
    path('adminka/projects/<int:pk>/', adminka_views.adminka_project_view, name='adminka_project_view'),
    path('adminka/projects/<int:pk>/edit/', adminka_views.adminka_project_edit, name='adminka_project_edit'),
    path('adminka/projects/<int:pk>/delete/', adminka_views.adminka_project_delete, name='adminka_project_delete'),
    
    # Заявки (с сайта)
    path('adminka/requests/', adminka_views.adminka_requests, name='adminka_requests'),
    path('adminka/requests/<int:pk>/edit/', adminka_views.adminka_request_edit, name='adminka_request_edit'),
    path('adminka/requests/<int:pk>/delete/', adminka_views.adminka_request_delete, name='adminka_request_delete'),
    
    # Поддержка
    path('adminka/support/', adminka_views.adminka_support, name='adminka_support'),
    path('adminka/support/<int:pk>/edit/', adminka_views.adminka_support_edit, name='adminka_support_edit'),
    path('adminka/support/<int:pk>/delete/', adminka_views.adminka_support_delete, name='adminka_support_delete'),
    
    # Категории
    path('adminka/categories/', adminka_views.adminka_categories, name='adminka_categories'),
    path('adminka/categories/<int:pk>/delete/', adminka_views.adminka_category_delete, name='adminka_category_delete'),
    
    # Личный кабинет пользователя (не staff)
    path('cabinet/', cabinet_views.cabinet_dashboard, name='cabinet_dashboard'),
    path('cabinet/orders/', cabinet_views.cabinet_orders, name='cabinet_orders'),
    path('cabinet/orders/<int:pk>/', cabinet_views.cabinet_order_detail, name='cabinet_order_detail'),
    path('cabinet/requests/', cabinet_views.cabinet_requests, name='cabinet_requests'),
    path('cabinet/requests/<int:pk>/', cabinet_views.cabinet_request_detail, name='cabinet_request_detail'),
    path('cabinet/requests/<int:pk>/edit/', cabinet_views.cabinet_request_edit, name='cabinet_request_edit'),
    path('cabinet/profile/', cabinet_views.cabinet_profile, name='cabinet_profile'),
    path('cabinet/support/', cabinet_views.cabinet_support, name='cabinet_support'),
    path('cabinet/analytics/', cabinet_views.cabinet_analytics, name='cabinet_analytics'),
    path('cabinet/requests/<int:pk>/delete/', cabinet_views.cabinet_request_delete, name='cabinet_request_delete'),
    path('cabinet/export/pdf/', cabinet_views.cabinet_export_pdf, name='cabinet_export_pdf'),
    path('cabinet/export/excel/', cabinet_views.cabinet_export_excel, name='cabinet_export_excel'),
    # Восстановление пароля (Django auth views)
    path('password-reset/', auth_views.PasswordResetView.as_view(template_name='cabinet/password_reset_form.html', email_template_name='cabinet/password_reset_email.html', success_url=reverse_lazy('main:password_reset_done'), extra_email_context={'site_name': 'Empire Premium'}), name='password_reset'),
    path('password-reset/done/', auth_views.PasswordResetDoneView.as_view(template_name='cabinet/password_reset_done.html'), name='password_reset_done'),
    path('password-reset-confirm/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(template_name='cabinet/password_reset_confirm.html', success_url=reverse_lazy('main:password_reset_complete')), name='password_reset_confirm'),
    path('password-reset/complete/', auth_views.PasswordResetCompleteView.as_view(template_name='cabinet/password_reset_complete.html'), name='password_reset_complete'),
]
