"""
Личный кабинет пользователя (не staff): Заказы, Заявки, Управление профилем, Поддержка.
"""
from functools import wraps
from django.shortcuts import render, redirect, get_object_or_404
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import login
from django.db.models import Q

from .models import Request, RequestStage, UserProfile, ContactRequest
from .forms import AvatarUploadForm, CabinetProfileForm


def _user_requests(user):
    """Заявки пользователя: по user_id или по email."""
    return Request.objects.filter(
        Q(user=user) | Q(email=user.email)
    ).select_related('category', 'subcategory').order_by('-created_at')


def _user_support(user):
    """Обращения в поддержку пользователя (по email)."""
    return ContactRequest.objects.filter(email=user.email).order_by('-created_at')


def cabinet_required(redirect_to='main:adminka_dashboard'):
    """Декоратор: после login_required редирект staff в админку."""
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if request.user.is_staff:
                return redirect(redirect_to)
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator


@login_required(login_url=settings.LOGIN_URL)
@cabinet_required()
def cabinet_dashboard(request):
    """Главная кабинета — редирект на Заявки."""
    return redirect('main:cabinet_requests')


@login_required(login_url=settings.LOGIN_URL)
@cabinet_required()
def cabinet_requests(request):
    """Список заявок пользователя."""
    requests_list = _user_requests(request.user)
    categories = list(set(r.category for r in requests_list if r.category_id))
    return render(request, 'cabinet/requests.html', {
        'user_requests': requests_list,
        'categories': categories,
    })


@login_required(login_url=settings.LOGIN_URL)
@cabinet_required()
def cabinet_orders(request):
    """Список заказов (те же заявки, вид «Заказы» с фильтрами)."""
    requests_list = _user_requests(request.user)
    categories = list(set(r.category for r in requests_list if r.category_id))
    return render(request, 'cabinet/orders.html', {
        'user_requests': requests_list,
        'categories': categories,
    })


@login_required(login_url=settings.LOGIN_URL)
@cabinet_required()
def cabinet_request_detail(request, pk):
    """Детальная страница заявки: блок «Заявка» + «История заявки»."""
    req = get_object_or_404(Request, pk=pk)
    if req.user_id != request.user.id and req.email != request.user.email:
        return redirect('main:cabinet_requests')
    stages = req.stages.filter(stage_type='history').order_by('order', 'created_at')
    if not stages.exists():
        for i, (title, desc) in enumerate([
            ('Обработка заявки', 'Описание'),
            ('Заявка принята в работу', 'Описание'),
            ('Подбор специалистов', 'Описание'),
            ('Начало работы', 'Описание'),
        ]):
            RequestStage.objects.create(request=req, stage_type='history', order=i, title=title, description=desc)
        stages = req.stages.filter(stage_type='history').order_by('order', 'created_at')
    return render(request, 'cabinet/request_detail.html', {'req_obj': req, 'stages': stages})


@login_required(login_url=settings.LOGIN_URL)
@cabinet_required()
def cabinet_order_detail(request, pk):
    """Детальная страница заказа: блок «Заказ» + «Этапы проекта»."""
    req = get_object_or_404(Request, pk=pk)
    if req.user_id != request.user.id and req.email != request.user.email:
        return redirect('main:cabinet_orders')
    stages = req.stages.filter(stage_type='project').order_by('order', 'created_at')
    if not stages.exists():
        for i in range(4):
            RequestStage.objects.create(
                request=req, stage_type='project', order=i,
                title=f'Этап {i + 1}', description='Название этапа'
            )
        stages = req.stages.filter(stage_type='project').order_by('order', 'created_at')
    return render(request, 'cabinet/order_detail.html', {'req_obj': req, 'stages': stages})


@login_required(login_url=settings.LOGIN_URL)
@cabinet_required('main:adminka_profile')
def cabinet_profile(request):
    """Управление профилем: имя, телефон, почта, аватар, смена пароля. Валидация через формы."""
    user = request.user
    profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'user_type': 'client'})
    profile_form = CabinetProfileForm(
        initial={
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'phone': profile.phone or '',
        }
    )
    if request.method == 'POST':
        action = request.POST.get('action', 'profile')
        if action == 'avatar':
            form = AvatarUploadForm(request.POST, request.FILES)
            if form.is_valid():
                if profile.avatar:
                    profile.avatar.delete(save=False)
                profile.avatar = form.cleaned_data['avatar']
                profile.save()
                messages.success(request, 'Фото обновлено.')
            else:
                for _field, errors in form.errors.items():
                    for err in errors:
                        messages.error(request, err)
            return redirect('main:cabinet_profile')
        if action == 'profile':
            profile_form = CabinetProfileForm(request.POST)
            if profile_form.is_valid():
                cd = profile_form.cleaned_data
                user.first_name = (cd.get('first_name') or '').strip()
                user.last_name = (cd.get('last_name') or '').strip()
                if cd.get('email') and '@' in cd['email']:
                    user.email = cd['email'].strip()
                user.save()
                profile.phone = (cd.get('phone') or '').strip()
                profile.save()
                messages.success(request, 'Данные сохранены.')
                return redirect('main:cabinet_profile')
            # невалидная форма — рендерим с ошибками
        if action == 'password':
            old = request.POST.get('old_password', '')
            new1 = request.POST.get('new_password1', '')
            new2 = request.POST.get('new_password2', '')
            if not user.check_password(old):
                messages.error(request, 'Неверный текущий пароль.')
            elif not new1 or len(new1) < 8:
                messages.error(request, 'Новый пароль не менее 8 символов.')
            elif new1 != new2:
                messages.error(request, 'Пароли не совпадают.')
            else:
                user.set_password(new1)
                user.save()
                login(request, user)
                messages.success(request, 'Пароль изменён.')
                return redirect('main:cabinet_profile')
    return render(request, 'cabinet/profile.html', {
        'profile_user': user,
        'profile': profile,
        'profile_form': profile_form,
    })


@login_required(login_url=settings.LOGIN_URL)
@cabinet_required('main:adminka_support')
def cabinet_support(request):
    """Обращения в поддержку пользователя."""
    support_list = _user_support(request.user)
    return render(request, 'cabinet/support.html', {'support_requests': support_list})
