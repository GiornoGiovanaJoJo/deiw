from django.contrib import admin
from django.utils.safestring import mark_safe
from django.urls import reverse
from .models import SiteSettings, HeroCarouselImage, Service, Project, DesignSettings
from .forms import SiteSettingsForm, HeroCarouselImageForm, ServiceForm, ProjectForm, DesignSettingsForm


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


@admin.register(DesignSettings)
class DesignSettingsAdmin(admin.ModelAdmin):
    form = DesignSettingsForm
    list_display = ['__str__']
    
    fieldsets = (
        ('Цвета', {
            'fields': (
                ('primary_gold', 'primary_dark', 'secondary_blue'),
                ('accent_purple', 'bg_light', 'bg_lavender'),
                ('white', 'text_dark', 'text_body'),
                ('text_light', 'text_muted'),
            ),
            'classes': ('wide',),
        }),
        ('Шрифты', {
            'fields': ('font_primary', 'font_heading'),
        }),
        ('Размеры шрифтов', {
            'fields': (
                ('heading_xl', 'heading_xl_lh'),
                ('heading_lg', 'heading_lg_lh'),
                ('body_lg', 'body_lg_lh'),
                ('body', 'body_lh'),
                ('body_sm', 'body_sm_lh'),
            ),
        }),
        ('Отступы', {
            'fields': (
                ('spacing_xs', 'spacing_sm', 'spacing_md'),
                ('spacing_lg', 'spacing_xl'),
            ),
        }),
        ('Размеры элементов', {
            'fields': (
                ('header_height', 'button_min_height'),
                ('button_padding_h', 'button_padding_v'),
                ('border_radius', 'border_radius_lg'),
            ),
        }),
        ('Тени', {
            'fields': ('shadow_sm', 'shadow_md', 'shadow_lg'),
        }),
    )
    
    def has_add_permission(self, request):
        return not DesignSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        return False
