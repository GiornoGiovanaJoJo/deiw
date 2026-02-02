from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator
from django.http import HttpResponse, JsonResponse
from django.utils import translation
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST
from .models import (
    SiteSettings, HeroCarouselImage, Service, Project, DesignSettings, ElementSettings,
    RequestCategory, RequestSubcategory, RequestQuestion, Request, ContactRequest,
)

_MODEL_MAP = {
    'sitesettings': (SiteSettings, 'logo_data', 'logo_type'),
    'herocarouselimage': (HeroCarouselImage, 'image_data', 'image_type'),
    'service': (Service, 'image_data', 'image_type'),
    'project': (Project, 'image_data', 'image_type'),
}


@ensure_csrf_cookie
def home(request):
    settings = SiteSettings.get_settings()
    design_settings = DesignSettings.get_settings()
    element_settings = ElementSettings.objects.filter(is_active=True).order_by('order', 'element_name')
    hero_images = list(HeroCarouselImage.objects.all()[:10])
    services = list(Service.objects.all())
    projects_qs = Project.objects.all()
    paginator = Paginator(projects_qs, 3)
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)

    context = {
        'site_settings': settings,
        'design_settings': design_settings,
        'element_settings': element_settings,
        'hero_carousel_images': hero_images,
        'services': services,
        'page_obj': page_obj,
        'projects': page_obj.object_list,
        'LANGUAGE_CODE': translation.get_language(),
    }
    return render(request, 'index.html', context)


def privacy_page(request):
    """Страница «Политика конфиденциальности»."""
    return render(request, 'privacy.html', {'LANGUAGE_CODE': translation.get_language()})


def terms_page(request):
    """Страница «Условия использования»."""
    return render(request, 'terms.html', {'LANGUAGE_CODE': translation.get_language()})


def serve_db_image(request, model_name, pk):
    """Отдаёт изображение из SQLite (поля *_data, *_type)."""
    key = model_name.lower()
    if key not in _MODEL_MAP:
        return HttpResponse(status=404)
    model_cls, data_attr, type_attr = _MODEL_MAP[key]
    obj = get_object_or_404(model_cls, pk=pk)
    data = getattr(obj, data_attr, None)
    content_type = getattr(obj, type_attr, None) or 'application/octet-stream'
    if not data:
        return HttpResponse(status=404)
    return HttpResponse(data, content_type=content_type)


# ---------- API для формы: категории, подкатегории, вопросы, отправка заявки/поддержки ----------

def _lang_name(obj, prefix='name'):
    """Имя с учётом языка: name_de, name_en, name."""
    lang = translation.get_language() or 'ru'
    if lang.startswith('de'):
        return getattr(obj, f'{prefix}_de', None) or getattr(obj, prefix, '')
    if lang.startswith('en'):
        return getattr(obj, f'{prefix}_en', None) or getattr(obj, prefix, '')
    return getattr(obj, prefix, '')


@require_GET
def api_request_categories(request):
    """Список категорий заявок для формы."""
    categories = RequestCategory.objects.all()
    data = [
        {'id': c.pk, 'name': _lang_name(c), 'slug': c.slug}
        for c in categories
    ]
    return JsonResponse({'categories': data})


@require_GET
def api_request_subcategories(request):
    """Подкатегории по category_id."""
    category_id = request.GET.get('category_id')
    if not category_id:
        return JsonResponse({'subcategories': []})
    subcategories = RequestSubcategory.objects.filter(category_id=category_id)
    data = [
        {'id': s.pk, 'name': _lang_name(s), 'slug': s.slug, 'category_id': s.category_id}
        for s in subcategories
    ]
    return JsonResponse({'subcategories': data})


@require_GET
def api_request_questions(request):
    """Вопросы по subcategory_id."""
    subcategory_id = request.GET.get('subcategory_id')
    if not subcategory_id:
        return JsonResponse({'questions': []})
    questions = RequestQuestion.objects.filter(subcategory_id=subcategory_id)
    data = [
        {
            'id': q.pk,
            'text': _lang_name(q, 'question_text'),
            'field_name': q.field_name,
        }
        for q in questions
    ]
    return JsonResponse({'questions': data})


@require_POST
def api_submit_support(request):
    """Отправка сообщения в поддержку (вкладка «Поддержка»)."""
    name = (request.POST.get('name') or '').strip()
    phone = (request.POST.get('phone') or '').strip()
    email = (request.POST.get('email') or '').strip()
    message = (request.POST.get('message') or '').strip()
    if not name or not phone or not email:
        return JsonResponse({'success': False, 'error': 'Заполните имя, телефон и email.'}, status=400)
    if '@' not in email:
        return JsonResponse({'success': False, 'error': 'Некорректный email.'}, status=400)
    ContactRequest.objects.create(
        name=name, phone=phone, email=email, message=message, reason='support',
    )
    return JsonResponse({'success': True, 'message': 'Сообщение отправлено.'})


@require_POST
def api_submit_request(request):
    """Отправка заявки (вкладка «Заявка»): категория, подкатегория, ответы на вопросы."""
    name = (request.POST.get('name') or '').strip()
    phone = (request.POST.get('phone') or '').strip()
    email = (request.POST.get('email') or '').strip()
    message = (request.POST.get('message') or '').strip()
    category_id = request.POST.get('category_id')
    subcategory_id = request.POST.get('subcategory_id') or None
    extra_answers = {}
    for key, value in request.POST.items():
        if key.startswith('extra_') and value:
            extra_answers[key.replace('extra_', '', 1)] = value
    if not name or not phone or not email:
        return JsonResponse({'success': False, 'error': 'Заполните имя, телефон и email.'}, status=400)
    if '@' not in email:
        return JsonResponse({'success': False, 'error': 'Некорректный email.'}, status=400)
    category = None
    if category_id:
        try:
            category = RequestCategory.objects.get(pk=category_id)
        except RequestCategory.DoesNotExist:
            pass
    subcategory = None
    if subcategory_id:
        try:
            subcategory = RequestSubcategory.objects.get(pk=subcategory_id)
        except RequestSubcategory.DoesNotExist:
            pass
    Request.objects.create(
        name=name, phone=phone, email=email, message=message,
        category=category, subcategory=subcategory, extra_answers=extra_answers,
    )
    return JsonResponse({'success': True, 'message': 'Заявка отправлена.'})
