"""
Views для кастомной админки /adminka
"""
from django.conf import settings
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import ensure_csrf_cookie
from django.contrib.auth.models import User

from .models import AdminProject, Category, ContactRequest, Request, UserProfile
from .forms import RegisterForm, AdminProjectForm, CategoryForm


def is_staff_user(user):
    """Проверка, что пользователь - администратор"""
    return user.is_authenticated and user.is_staff


@ensure_csrf_cookie
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
        
        if user is not None:
            login(request, user)
            if user.is_staff:
                return redirect('main:adminka_dashboard')
            return redirect('main:cabinet_requests')
        else:
            messages.error(request, 'Неверный email или пароль')
    
    return render(request, 'adminka/login.html')


def _make_username_from_email(email):
    """Уникальный username из email (Django требует уникальный username)."""
    base = email.lower().replace('@', '_').replace('.', '_')[:30]
    username = base
    n = 0
    while User.objects.filter(username=username).exists():
        n += 1
        suffix = str(n)
        username = (base[: 30 - len(suffix)] + suffix) if len(base) + len(suffix) > 30 else base + suffix
    return username


@ensure_csrf_cookie
def register_view(request):
    """Регистрация: клиент, работник или компания. Валидация через RegisterForm."""
    if request.user.is_authenticated:
        return redirect('main:home')

    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            cleaned = form.cleaned_data
            email = cleaned['email'].strip().lower()
            full_name = cleaned['full_name'].strip()
            parts = full_name.split(None, 1)
            first_name = parts[0] if parts else full_name
            last_name = parts[1] if len(parts) > 1 else ''
            username = _make_username_from_email(email)
            user = User.objects.create_user(
                username=username,
                email=email,
                password=cleaned['password1'],
                first_name=first_name,
                last_name=last_name,
                is_staff=False,
                is_active=True,
            )
            UserProfile.objects.create(
                user=user,
                user_type=cleaned['user_type'],
                company_name=(cleaned.get('company_name') or '').strip(),
                phone=(cleaned.get('phone') or '').strip(),
            )
            messages.success(request, 'Регистрация прошла успешно. Войдите в систему.')
            return redirect('main:adminka_login')
    else:
        form = RegisterForm(initial={'user_type': 'client'})

    return render(request, 'adminka/register.html', {'form': form})


@login_required(login_url=settings.LOGIN_URL)
@user_passes_test(is_staff_user, login_url=settings.LOGIN_URL)
def adminka_logout(request):
    """Выход из админки"""
    logout(request)
    messages.success(request, 'Вы успешно вышли из системы')
    return redirect('main:adminka_login')


@login_required(login_url=settings.LOGIN_URL)
@user_passes_test(is_staff_user, login_url=settings.LOGIN_URL)
def adminka_profile(request):
    """Профиль администратора: данные и смена пароля."""
    user = request.user
    user_profile, created = UserProfile.objects.get_or_create(user=user)

    if request.method == 'POST':
        action = request.POST.get('action', '')
        if action == 'profile':
            user.first_name = (request.POST.get('first_name') or '').strip()
            user.last_name = (request.POST.get('last_name') or '').strip()
            email = (request.POST.get('email') or '').strip()
            if email and '@' in email:
                user.email = email
            user.save()

            # Обновление профиля
            user_profile.phone = (request.POST.get('phone') or '').strip()
            user_profile.company_name = (request.POST.get('company_name') or '').strip()
            
            # Сохранение аватара (SQLite)
            avatar_file = request.FILES.get('avatar')
            if avatar_file:
                user_profile.avatar_data = avatar_file.read()
                user_profile.avatar_name = avatar_file.name
                user_profile.avatar_type = avatar_file.content_type
            
            user_profile.save()

            messages.success(request, 'Данные профиля обновлены')
            return redirect('main:adminka_profile')
        if action == 'password':
            old = request.POST.get('old_password', '')
            new1 = request.POST.get('new_password1', '')
            new2 = request.POST.get('new_password2', '')
            if not user.check_password(old):
                messages.error(request, 'Неверный текущий пароль')
            elif not new1 or len(new1) < 8:
                messages.error(request, 'Новый пароль должен быть не менее 8 символов')
            elif new1 != new2:
                messages.error(request, 'Пароли не совпадают')
            else:
                user.set_password(new1)
                user.save()
                login(request, user)  # перелогинить после смены пароля
                messages.success(request, 'Пароль успешно изменён')
                return redirect('main:adminka_profile')
    context = {
        'admin_name': user.get_full_name() or user.username,
        'profile_user': user,
        'user_profile': user_profile,
    }
    return render(request, 'adminka/profile.html', context)


@login_required(login_url=settings.LOGIN_URL)
@user_passes_test(is_staff_user, login_url=settings.LOGIN_URL)
def adminka_dashboard(request):
    """Главная страница админки"""
    # Статистика
    total_projects = AdminProject.objects.count()
    completed_projects = AdminProject.objects.filter(status='completed').count()
    in_progress_projects = AdminProject.objects.filter(status='in_progress').count()
    new_support = ContactRequest.objects.filter(status='new').count()
    new_applications = Request.objects.filter(status='new').count()
    
    # Последние заявки (Request) и сообщения в поддержку (ContactRequest)
    recent_applications = Request.objects.select_related('category').order_by('-created_at')[:5]
    recent_support = ContactRequest.objects.order_by('-created_at')[:5]
    
    context = {
        'admin_name': request.user.get_full_name() or request.user.username,
        'stats': {
            'total_projects': total_projects,
            'completed_projects': completed_projects,
            'in_progress_projects': in_progress_projects,
            'new_support': new_support,
            'new_applications': new_applications,
        },
        'recent_applications': recent_applications,
        'recent_support': recent_support,
    }
    return render(request, 'adminka/dashboard.html', context)


@login_required(login_url=settings.LOGIN_URL)
@user_passes_test(is_staff_user, login_url=settings.LOGIN_URL)
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


@login_required(login_url=settings.LOGIN_URL)
@user_passes_test(is_staff_user, login_url=settings.LOGIN_URL)
def adminka_project_add(request):
    """Добавление проекта."""
    form = AdminProjectForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        project = form.save()
        messages.success(request, f'Проект "{project.name}" успешно создан')
        return redirect('main:adminka_projects')
    context = {
        'admin_name': request.user.get_full_name() or request.user.username,
        'form': form,
        'categories': Category.objects.all(),
    }
    return render(request, 'adminka/project_add.html', context)


@login_required(login_url=settings.LOGIN_URL)
@user_passes_test(is_staff_user, login_url=settings.LOGIN_URL)
def adminka_project_edit(request, pk):
    """Редактирование проекта."""
    project = get_object_or_404(AdminProject, pk=pk)
    form = AdminProjectForm(request.POST or None, instance=project)
    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(request, f'Проект "{project.name}" успешно обновлен')
        return redirect('main:adminka_projects')
    context = {
        'admin_name': request.user.get_full_name() or request.user.username,
        'project': project,
        'form': form,
        'categories': Category.objects.all(),
    }
    return render(request, 'adminka/project_edit.html', context)


@login_required(login_url=settings.LOGIN_URL)
@user_passes_test(is_staff_user, login_url=settings.LOGIN_URL)
def adminka_project_view(request, pk):
    """Просмотр проекта"""
    project = get_object_or_404(AdminProject, pk=pk)
    context = {
        'admin_name': request.user.get_full_name() or request.user.username,
        'project': project,
    }
    return render(request, 'adminka/project_view.html', context)


@login_required(login_url=settings.LOGIN_URL)
@user_passes_test(is_staff_user, login_url=settings.LOGIN_URL)
@require_POST
def adminka_project_delete(request, pk):
    """Удаление проекта (AJAX)."""
    project = get_object_or_404(AdminProject, pk=pk)
    project_name = project.name
    project.delete()
    return JsonResponse({'success': True, 'message': f'Проект "{project_name}" удален'})


@login_required(login_url=settings.LOGIN_URL)
@user_passes_test(is_staff_user, login_url=settings.LOGIN_URL)
def adminka_support(request):
    """Список заявок в поддержку"""
    requests_list = ContactRequest.objects.order_by('-created_at')
    
    context = {
        'admin_name': request.user.get_full_name() or request.user.username,
        'requests': requests_list,
    }
    return render(request, 'adminka/support.html', context)


@login_required(login_url=settings.LOGIN_URL)
@user_passes_test(is_staff_user, login_url=settings.LOGIN_URL)
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
        'support_request': contact_request,
    }
    return render(request, 'adminka/support_edit.html', context)


@login_required(login_url=settings.LOGIN_URL)
@user_passes_test(is_staff_user, login_url=settings.LOGIN_URL)
@require_POST
def adminka_support_delete(request, pk):
    """Удаление заявки (AJAX)."""
    contact_request = get_object_or_404(ContactRequest, pk=pk)
    contact_request.delete()
    return JsonResponse({'success': True, 'message': 'Заявка удалена'})


# ---------- Заявки (таблица заявок с сайта) ----------

@login_required(login_url=settings.LOGIN_URL)
@user_passes_test(is_staff_user, login_url=settings.LOGIN_URL)
def adminka_requests(request):
    """Список заявок с сайта (вкладка «Заявка»)."""
    requests_list = Request.objects.select_related('category', 'subcategory').order_by('-created_at')
    context = {
        'admin_name': request.user.get_full_name() or request.user.username,
        'requests': requests_list,
    }
    return render(request, 'adminka/requests.html', context)


@login_required(login_url=settings.LOGIN_URL)
@user_passes_test(is_staff_user, login_url=settings.LOGIN_URL)
def adminka_request_edit(request, pk):
    """Редактирование заявки."""
    req = get_object_or_404(Request, pk=pk)
    if request.method == 'POST':
        try:
            req.status = request.POST.get('status', 'new')
            req.message_admin = request.POST.get('message_admin', '')
            req.admin_id = request.user.id
            req.save()
            messages.success(request, 'Заявка обновлена')
            return redirect('main:adminka_requests')
        except Exception as e:
            messages.error(request, str(e))
    context = {
        'admin_name': request.user.get_full_name() or request.user.username,
        'req_obj': req,
    }
    return render(request, 'adminka/request_edit.html', context)


@login_required(login_url=settings.LOGIN_URL)
@user_passes_test(is_staff_user, login_url=settings.LOGIN_URL)
@require_POST
def adminka_request_delete(request, pk):
    """Удаление заявки (AJAX)."""
    req = get_object_or_404(Request, pk=pk)
    req.delete()
    return JsonResponse({'success': True, 'message': 'Заявка удалена'})


@login_required(login_url=settings.LOGIN_URL)
@user_passes_test(is_staff_user, login_url=settings.LOGIN_URL)
def adminka_categories(request):
    """Список категорий."""
    categories = Category.objects.order_by('-created_at')
    form = CategoryForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(request, 'Категория успешно создана')
        return redirect('main:adminka_categories')
    context = {
        'admin_name': request.user.get_full_name() or request.user.username,
        'categories': categories,
        'form': form,
    }
    return render(request, 'adminka/categories.html', context)


@login_required(login_url=settings.LOGIN_URL)
@user_passes_test(is_staff_user, login_url=settings.LOGIN_URL)
@require_POST
def adminka_category_delete(request, pk):
    """Удаление категории (AJAX)."""
    category = get_object_or_404(Category, pk=pk)
    category.delete()
    return JsonResponse({'success': True, 'message': 'Категория удалена'})
