from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator
from django.http import HttpResponse
from .models import SiteSettings, HeroCarouselImage, Service, Project, DesignSettings

_MODEL_MAP = {
    'sitesettings': (SiteSettings, 'logo_data', 'logo_type'),
    'herocarouselimage': (HeroCarouselImage, 'image_data', 'image_type'),
    'service': (Service, 'image_data', 'image_type'),
    'project': (Project, 'image_data', 'image_type'),
}


def home(request):
    settings = SiteSettings.get_settings()
    design_settings = DesignSettings.get_settings()
    hero_images = list(HeroCarouselImage.objects.all()[:10])
    services = list(Service.objects.all())
    projects_qs = Project.objects.all()
    paginator = Paginator(projects_qs, 3)
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)

    context = {
        'site_settings': settings,
        'design_settings': design_settings,
        'hero_carousel_images': hero_images,
        'services': services,
        'page_obj': page_obj,
        'projects': page_obj.object_list,
    }
    return render(request, 'index.html', context)


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
