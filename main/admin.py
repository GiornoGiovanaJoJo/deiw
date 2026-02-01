from django.contrib import admin
from django.utils.safestring import mark_safe
from django.urls import reverse
from .models import SiteSettings, HeroCarouselImage, Service, Project, DesignSettings, ElementSettings
from .forms import SiteSettingsForm, HeroCarouselImageForm, ServiceForm, ProjectForm, DesignSettingsForm, ElementSettingsForm


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


@admin.register(ElementSettings)
class ElementSettingsAdmin(admin.ModelAdmin):
    form = ElementSettingsForm
    list_display = ['element_name', 'selector_type', 'css_selector', 'order', 'is_active', 'preview_css']
    list_editable = ['order', 'is_active']
    list_filter = ['is_active', 'position', 'selector_type']
    search_fields = ['element_name', 'css_selector']
    ordering = ['order', 'element_name']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('element_name', 'html_tag', 'selector_type', 'css_selector', 'order', 'is_active'),
            'description': 'Выберите HTML тег из списка для быстрой настройки, или укажите CSS селектор вручную (например: .hero__title, #hero-title, h1, p, span, header, footer и т.д.)',
        }),
        ('Шрифт', {
            'fields': (
                ('font_size', 'font_size_min', 'font_size_max'),
                ('font_weight', 'line_height', 'letter_spacing'),
            ),
        }),
        ('Отступы (Margin)', {
            'fields': (
                ('margin_top', 'margin_bottom'),
                ('margin_left', 'margin_right'),
            ),
            'classes': ('collapse',),
        }),
        ('Внутренние отступы (Padding)', {
            'fields': (
                ('padding_top', 'padding_bottom'),
                ('padding_left', 'padding_right'),
            ),
            'classes': ('collapse',),
        }),
        ('Позиционирование', {
            'fields': (
                'position',
                ('top', 'left'),
                ('right', 'bottom'),
                'z_index',
            ),
            'classes': ('collapse',),
        }),
        ('Размеры', {
            'fields': (
                ('width', 'max_width', 'min_width'),
                ('height', 'max_height', 'min_height'),
            ),
            'classes': ('collapse',),
        }),
        ('Цвета', {
            'fields': ('color', 'background_color'),
        }),
        ('Выравнивание', {
            'fields': ('text_align',),
        }),
        ('Дополнительный CSS', {
            'fields': ('custom_css',),
            'description': 'Любые дополнительные CSS свойства. Например: transform: scale(1.1); border-radius: 10px;',
        }),
    )
    
    def preview_css(self, obj):
        """Показывает предпросмотр CSS стилей."""
        if obj.is_active and obj.get_css_style():
            css = obj.get_css_style()
            if len(css) > 100:
                css = css[:100] + '...'
            return mark_safe(f'<code style="font-size: 11px; background: #f0f0f0; padding: 2px 4px; border-radius: 3px;">{css}</code>')
        return '—'
    preview_css.short_description = 'CSS стили'
