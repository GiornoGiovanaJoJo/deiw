from django.contrib import admin
from django.utils.safestring import mark_safe
from django.urls import reverse
from .models import SiteSettings, HeroCarouselImage, Service, Project
from .forms import SiteSettingsForm, HeroCarouselImageForm, ServiceForm, ProjectForm


class MultipartFormAdminMixin:
    """Гарантирует enctype="multipart/form-data" для сохранения загружаемых файлов."""

    def changeform_view(self, request, object_id=None, form_url='', extra_context=None):
        extra_context = dict(extra_context or {})
        extra_context['has_file_field'] = True
        return super().changeform_view(request, object_id, form_url, extra_context)


def _db_image_url(obj, model_name):
    url = reverse('main:serve_db_image', kwargs={'model_name': model_name, 'pk': obj.pk})
    return url


@admin.register(SiteSettings)
class SiteSettingsAdmin(MultipartFormAdminMixin, admin.ModelAdmin):
    form = SiteSettingsForm
    list_display = ['__str__']
    fields = ['logo']

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(HeroCarouselImage)
class HeroCarouselImageAdmin(MultipartFormAdminMixin, admin.ModelAdmin):
    form = HeroCarouselImageForm
    list_display = ['order', 'preview', 'alt']
    list_display_links = ['alt']
    list_editable = ['order']
    ordering = ['order']

    def preview(self, obj):
        if obj.image_data and obj.pk:
            url = _db_image_url(obj, 'herocarouselimage')
            return mark_safe(
                f'<img src="{url}" style="max-height: 60px; max-width: 120px; object-fit: contain;" />'
            )
        return '—'

    preview.short_description = 'Превью'

    def has_add_permission(self, request):
        return HeroCarouselImage.objects.count() < 10


@admin.register(Service)
class ServiceAdmin(MultipartFormAdminMixin, admin.ModelAdmin):
    form = ServiceForm
    list_display = ['title', 'order', 'preview']
    list_editable = ['order']
    ordering = ['order']

    def preview(self, obj):
        if obj.image_data and obj.pk:
            url = _db_image_url(obj, 'service')
            return mark_safe(
                f'<img src="{url}" style="max-height: 40px; max-width: 80px; object-fit: contain;" />'
            )
        return '—'

    preview.short_description = 'Фото'


@admin.register(Project)
class ProjectAdmin(MultipartFormAdminMixin, admin.ModelAdmin):
    form = ProjectForm
    list_display = ['title', 'address', 'order', 'preview']
    list_editable = ['order']
    ordering = ['order']

    def preview(self, obj):
        if obj.image_data and obj.pk:
            url = _db_image_url(obj, 'project')
            return mark_safe(
                f'<img src="{url}" style="max-height: 40px; max-width: 80px; object-fit: contain;" />'
            )
        return '—'

    preview.short_description = 'Фото'
