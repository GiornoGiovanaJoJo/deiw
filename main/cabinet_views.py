"""
Личный кабинет пользователя (не staff): Заказы, Заявки, Управление профилем, Поддержка, Аналитика.
"""
from functools import wraps
from datetime import datetime, date
from decimal import Decimal
from django.shortcuts import render, redirect, get_object_or_404, HttpResponse
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import login
from django.db.models import Q, Count
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET
from django.views.decorators.csrf import ensure_csrf_cookie
import json

from .models import (
    Request, RequestStage, UserProfile, ContactRequest,
    RequestCategory, RequestSubcategory, RequestQuestion,
)
from .forms import AvatarUploadForm, CabinetProfileForm, CabinetRequestEditForm


def _user_requests(user, date_from=None, date_to=None, status=None, category_id=None, search=None):
    """Заявки пользователя: по user_id или по email, с опциональными фильтрами."""
    qs = Request.objects.filter(
        Q(user=user) | Q(email=user.email)
    ).select_related('category', 'subcategory').order_by('-created_at')
    if date_from:
        qs = qs.filter(created_at__date__gte=date_from)
    if date_to:
        qs = qs.filter(created_at__date__lte=date_to)
    if status:
        qs = qs.filter(status=status)
    if category_id:
        qs = qs.filter(category_id=category_id)
    if search:
        search_clean = search.strip().replace(' ', '')
        if search_clean.isdigit():
            qs = qs.filter(pk=int(search_clean))
        else:
            qs = qs.filter(Q(name__icontains=search) | Q(email__icontains=search))
    return qs


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
    """Список заявок пользователя с фильтрами по дате, статусу, категории и поиску по номеру."""
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    status = request.GET.get('status', '').strip() or None
    category_id = request.GET.get('category', '').strip() or None
    search = request.GET.get('search', '').strip() or None
    if category_id and category_id.isdigit():
        category_id = int(category_id)
    else:
        category_id = None
    if date_from:
        try:
            date_from = datetime.strptime(date_from, '%Y-%m-%d').date()
        except ValueError:
            date_from = None
    if date_to:
        try:
            date_to = datetime.strptime(date_to, '%Y-%m-%d').date()
        except ValueError:
            date_to = None
    requests_list = _user_requests(
        request.user,
        date_from=date_from,
        date_to=date_to,
        status=status,
        category_id=category_id,
        search=search,
    )
    categories = list(set(r.category for r in requests_list if r.category_id))
    all_categories = RequestCategory.objects.all()
    status_sections = [
        ('new', 'Новая'),
        ('in_progress', 'В обработке'),
        ('approved', 'Одобрена'),
        ('rejected', 'Отклонена'),
        ('closed', 'Закрыта'),
    ]
    return render(request, 'cabinet/requests.html', {
        'user_requests': requests_list,
        'categories': categories,
        'all_categories': all_categories,
        'date_from': date_from,
        'date_to': date_to,
        'filter_status': status,
        'filter_category': category_id,
        'filter_search': search,
        'status_sections': status_sections,
    })


@login_required(login_url=settings.LOGIN_URL)
@cabinet_required()
def cabinet_orders(request):
    """Список заказов (те же заявки, вид «Заказы» с фильтрами)."""
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    status = request.GET.get('status', '').strip() or None
    if date_from:
        try:
            date_from = datetime.strptime(date_from, '%Y-%m-%d').date()
        except ValueError:
            date_from = None
    if date_to:
        try:
            date_to = datetime.strptime(date_to, '%Y-%m-%d').date()
        except ValueError:
            date_to = None
    requests_list = _user_requests(request.user, date_from=date_from, date_to=date_to, status=status)
    categories = list(set(r.category for r in requests_list if r.category_id))
    return render(request, 'cabinet/orders.html', {
        'user_requests': requests_list,
        'categories': categories,
        'date_from': date_from,
        'date_to': date_to,
        'filter_status': status,
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


@login_required(login_url=settings.LOGIN_URL)
@cabinet_required()
def cabinet_request_edit(request, pk):
    """Редактирование заявки пользователем: имя, телефон, email, сообщение."""
    req = get_object_or_404(Request, pk=pk)
    if req.user_id != request.user.id and req.email != request.user.email:
        return redirect('main:cabinet_requests')
    form = CabinetRequestEditForm(
        initial={
            'name': req.name,
            'phone': req.phone,
            'email': req.email,
            'message': req.message or '',
        }
    )
    if request.method == 'POST':
        form = CabinetRequestEditForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
            req.name = cd['name']
            req.phone = cd['phone']
            req.email = cd['email']
            req.message = (cd.get('message') or '').strip()
            req.save()
            messages.success(request, 'Заявка обновлена.')
            return redirect('main:cabinet_request_detail', pk=pk)
    return render(request, 'cabinet/request_edit.html', {'req_obj': req, 'form': form})


@login_required(login_url=settings.LOGIN_URL)
@cabinet_required()
@require_POST
def cabinet_request_delete(request, pk):
    """Удаление заявки пользователя (только своя)."""
    req = get_object_or_404(Request, pk=pk)
    if req.user_id != request.user.id and req.email != request.user.email:
        return JsonResponse({'success': False, 'error': 'Нет доступа'}, status=403)
    req.delete()
    return JsonResponse({'success': True, 'message': 'Заявка удалена'})


@login_required(login_url=settings.LOGIN_URL)
@cabinet_required()
def cabinet_analytics(request):
    """История и аналитика: таблица, графики (Chart.js), экспорт."""
    user = request.user
    qs = Request.objects.filter(Q(user=user) | Q(email=user.email)).select_related('category').order_by('-created_at')
    history = []
    for r in qs:
        history.append({
            'id': r.pk,
            'created_at': r.created_at.strftime('%d.%m.%Y') if r.created_at else '',
            'amount': float(r.amount) if r.amount is not None else None,
            'status': r.status,
            'status_display': r.get_status_display(),
            'display_number': r.display_number(),
        })
    by_status = list(qs.values('status').annotate(count=Count('id')))
    months_qs = qs.dates('created_at', 'month', order='ASC')
    by_month = []
    for d in months_qs:
        year, month = d.year, d.month
        approved_count = qs.filter(created_at__year=year, created_at__month=month, status='approved').count()
        by_month.append({'month': d.strftime('%Y-%m'), 'label': d.strftime('%b %Y'), 'count': approved_count})
    return render(request, 'cabinet/analytics.html', {
        'history': history,
        'by_status': by_status,
        'by_month': by_month,
        'by_status_json': json.dumps(list(by_status)),
        'by_month_json': json.dumps(by_month),
        'user_requests': qs,
    })


@login_required(login_url=settings.LOGIN_URL)
@cabinet_required()
@require_GET
def cabinet_export_pdf(request):
    """Экспорт истории заявок в PDF."""
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
        from reportlab.lib.styles import getSampleStyleSheet
        from io import BytesIO
    except ImportError:
        return HttpResponse('Модуль reportlab не установлен', status=500)
    user = request.user
    qs = Request.objects.filter(Q(user=user) | Q(email=user.email)).select_related('category').order_by('-created_at')
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    data = [['Дата', 'Номер', 'Статус', 'Сумма']]
    for r in qs:
        data.append([
            r.created_at.strftime('%d.%m.%Y') if r.created_at else '',
            r.display_number(),
            r.get_status_display(),
            str(r.amount) if r.amount is not None else '—',
        ])
    t = Table(data)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6c63ff')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    doc.build([t])
    buffer.seek(0)
    response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename="cabinet_requests.pdf"'
    return response


@login_required(login_url=settings.LOGIN_URL)
@cabinet_required()
@require_GET
def cabinet_export_excel(request):
    """Экспорт истории заявок в Excel."""
    try:
        from openpyxl import Workbook
        from openpyxl.styles import Font, Alignment
        from io import BytesIO
    except ImportError:
        return HttpResponse('Модуль openpyxl не установлен', status=500)
    user = request.user
    qs = Request.objects.filter(Q(user=user) | Q(email=user.email)).select_related('category').order_by('-created_at')
    wb = Workbook()
    ws = wb.active
    ws.title = 'Заявки'
    ws.append(['Дата', 'Номер', 'Категория', 'Статус', 'Сумма'])
    for r in qs:
        ws.append([
            r.created_at.strftime('%d.%m.%Y') if r.created_at else '',
            r.display_number(),
            str(r.category) if r.category else '—',
            r.get_status_display(),
            float(r.amount) if r.amount is not None else '',
        ])
    for cell in ws[1]:
        cell.font = Font(bold=True)
        cell.alignment = Alignment(horizontal='center')
    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    response = HttpResponse(buffer.getvalue(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename="cabinet_requests.xlsx"'
    return response
