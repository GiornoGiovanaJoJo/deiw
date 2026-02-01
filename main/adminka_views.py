"""
Views для кастомной админки /adminka
"""
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.http import JsonResponse, HttpResponseForbidden
from django.db.models import Q, Count
from django.views.decorators.http import require_POST
from .models import AdminProject, Category, ContactRequest
from django.contrib.auth.models import User


def is_staff_user(user):
    """Проверка, что пользователь - администратор"""
    return user.is_authenticated and user.is_staff


def adminka_login(request):
    """Страница входа в админку"""
    if request.user.is_authenticated and request.user.is_staff:
        return redirect('main:adminka_dashboard')
    
    if request.method == 'POST':
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password', '')
        
        # Пытаемся найти пользователя по email
        try:
            user_obj = User.objects.get(email=email)
            username = user_obj.username
        except User.DoesNotExist:
            username = email
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None and user.is_staff:
            login(request, user)
            return redirect('main:adminka_dashboard')
        else:
            messages.error(request, 'Неверный email или пароль, либо у вас нет прав администратора')
    
    return render(request, 'adminka/login.html')


@login_required(login_url='/adminka/login/')
@user_passes_test(is_staff_user, login_url='/adminka/login/')
def adminka_logout(request):
    """Выход из админки"""
    logout(request)
    messages.success(request, 'Вы успешно вышли из системы')
    return redirect('main:adminka_login')


@login_required(login_url='/adminka/login/')
@user_passes_test(is_staff_user, login_url='/adminka/login/')
def adminka_dashboard(request):
    """Главная страница админки"""
    # Статистика
    total_projects = AdminProject.objects.count()
    completed_projects = AdminProject.objects.filter(status='completed').count()
    in_progress_projects = AdminProject.objects.filter(status='in_progress').count()
    new_requests = ContactRequest.objects.filter(status='new').count()
    
    # Последние заявки
    recent_requests = ContactRequest.objects.order_by('-created_at')[:5]
    
    context = {
        'admin_name': request.user.get_full_name() or request.user.username,
        'stats': {
            'total_projects': total_projects,
            'completed_projects': completed_projects,
            'in_progress_projects': in_progress_projects,
            'new_requests': new_requests,
        },
        'recent_requests': recent_requests,
    }
    return render(request, 'adminka/dashboard.html', context)


@login_required(login_url='/adminka/login/')
@user_passes_test(is_staff_user, login_url='/adminka/login/')
def adminka_projects(request):
    """Список проектов"""
    projects = AdminProject.objects.select_related('category').order_by('-created_at')
    
    # Статистика
    stats = {
        'total': projects.count(),
        'completed': projects.filter(status='completed').count(),
        'in_progress': projects.filter(status='in_progress').count(),
        'planned': projects.filter(status='planned').count(),
    }
    
    context = {
        'admin_name': request.user.get_full_name() or request.user.username,
        'projects': projects,
        'stats': stats,
    }
    return render(request, 'adminka/projects.html', context)


@login_required(login_url='/adminka/login/')
@user_passes_test(is_staff_user, login_url='/adminka/login/')
def adminka_project_add(request):
    """Добавление проекта"""
    if request.method == 'POST':
        try:
            project = AdminProject.objects.create(
                project_code=request.POST.get('project_code'),
                name=request.POST.get('name'),
                description=request.POST.get('description', ''),
                category_id=request.POST.get('category') or None,
                status=request.POST.get('status', 'planned'),
                year=request.POST.get('year') or None,
                type=request.POST.get('type', ''),
                size=request.POST.get('size', ''),
                color=request.POST.get('color', ''),
                end_date=request.POST.get('end_date') or None,
            )
            messages.success(request, f'Проект "{project.name}" успешно создан')
            return redirect('main:adminka_projects')
        except Exception as e:
            messages.error(request, f'Ошибка при создании проекта: {str(e)}')
    
    categories = Category.objects.all()
    context = {
        'admin_name': request.user.get_full_name() or request.user.username,
        'categories': categories,
    }
    return render(request, 'adminka/project_add.html', context)


@login_required(login_url='/adminka/login/')
@user_passes_test(is_staff_user, login_url='/adminka/login/')
def adminka_project_edit(request, pk):
    """Редактирование проекта"""
    project = get_object_or_404(AdminProject, pk=pk)
    
    if request.method == 'POST':
        try:
            project.project_code = request.POST.get('project_code')
            project.name = request.POST.get('name')
            project.description = request.POST.get('description', '')
            project.category_id = request.POST.get('category') or None
            project.status = request.POST.get('status', 'planned')
            project.year = request.POST.get('year') or None
            project.type = request.POST.get('type', '')
            project.size = request.POST.get('size', '')
            project.color = request.POST.get('color', '')
            project.end_date = request.POST.get('end_date') or None
            project.save()
            messages.success(request, f'Проект "{project.name}" успешно обновлен')
            return redirect('main:adminka_projects')
        except Exception as e:
            messages.error(request, f'Ошибка при обновлении проекта: {str(e)}')
    
    categories = Category.objects.all()
    context = {
        'admin_name': request.user.get_full_name() or request.user.username,
        'project': project,
        'categories': categories,
    }
    return render(request, 'adminka/project_edit.html', context)


@login_required(login_url='/adminka/login/')
@user_passes_test(is_staff_user, login_url='/adminka/login/')
def adminka_project_view(request, pk):
    """Просмотр проекта"""
    project = get_object_or_404(AdminProject, pk=pk)
    context = {
        'admin_name': request.user.get_full_name() or request.user.username,
        'project': project,
    }
    return render(request, 'adminka/project_view.html', context)


@login_required(login_url='/adminka/login/')
@user_passes_test(is_staff_user, login_url='/adminka/login/')
@require_POST
def adminka_project_delete(request, pk):
    """Удаление проекта (AJAX)"""
    try:
        project = get_object_or_404(AdminProject, pk=pk)
        project_name = project.name
        project.delete()
        return JsonResponse({'success': True, 'message': f'Проект "{project_name}" удален'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)


@login_required(login_url='/adminka/login/')
@user_passes_test(is_staff_user, login_url='/adminka/login/')
def adminka_support(request):
    """Список заявок в поддержку"""
    requests_list = ContactRequest.objects.order_by('-created_at')
    
    context = {
        'admin_name': request.user.get_full_name() or request.user.username,
        'requests': requests_list,
    }
    return render(request, 'adminka/support.html', context)


@login_required(login_url='/adminka/login/')
@user_passes_test(is_staff_user, login_url='/adminka/login/')
def adminka_support_edit(request, pk):
    """Редактирование заявки"""
    contact_request = get_object_or_404(ContactRequest, pk=pk)
    
    if request.method == 'POST':
        try:
            contact_request.status = request.POST.get('status', 'new')
            contact_request.message_admin = request.POST.get('message_admin', '')
            contact_request.admin_id = request.user.id
            contact_request.save()
            messages.success(request, 'Заявка успешно обновлена')
            return redirect('main:adminka_support')
        except Exception as e:
            messages.error(request, f'Ошибка при обновлении заявки: {str(e)}')
    
    context = {
        'admin_name': request.user.get_full_name() or request.user.username,
        'request': contact_request,
    }
    return render(request, 'adminka/support_edit.html', context)


@login_required(login_url='/adminka/login/')
@user_passes_test(is_staff_user, login_url='/adminka/login/')
@require_POST
def adminka_support_delete(request, pk):
    """Удаление заявки (AJAX)"""
    try:
        contact_request = get_object_or_404(ContactRequest, pk=pk)
        contact_request.delete()
        return JsonResponse({'success': True, 'message': 'Заявка удалена'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)


@login_required(login_url='/adminka/login/')
@user_passes_test(is_staff_user, login_url='/adminka/login/')
def adminka_categories(request):
    """Список категорий"""
    categories = Category.objects.order_by('-created_at')
    
    if request.method == 'POST':
        try:
            Category.objects.create(
                name=request.POST.get('name', ''),
                name_en=request.POST.get('name_en', ''),
                name_de=request.POST.get('name_de', ''),
            )
            messages.success(request, 'Категория успешно создана')
            return redirect('main:adminka_categories')
        except Exception as e:
            messages.error(request, f'Ошибка при создании категории: {str(e)}')
    
    context = {
        'admin_name': request.user.get_full_name() or request.user.username,
        'categories': categories,
    }
    return render(request, 'adminka/categories.html', context)


@login_required(login_url='/adminka/login/')
@user_passes_test(is_staff_user, login_url='/adminka/login/')
@require_POST
def adminka_category_delete(request, pk):
    """Удаление категории (AJAX)"""
    try:
        category = get_object_or_404(Category, pk=pk)
        category.delete()
        return JsonResponse({'success': True, 'message': 'Категория удалена'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)
