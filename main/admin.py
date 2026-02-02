from django.contrib import admin
from django.utils.safestring import mark_safe
from django.urls import reverse
from .models import (
    SiteSettings, HeroCarouselImage, Service, Project,
    DesignSettings, ElementSettings,
    Category, AdminProject, ContactRequest,
    RequestCategory, RequestSubcategory, RequestQuestion, Request,
)
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
    list_filter = ['is_active', 'selector_type', 'position']
    search_fields = ['element_name', 'css_selector']
    ordering = ['order', 'element_name']
    list_per_page = 25
    save_on_top = True
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('element_name', 'html_tag', 'selector_type', 'css_selector', 'order', 'is_active'),
            'description': '💡 <strong>Совет:</strong> Выберите HTML тег из списка для быстрой настройки, или укажите CSS селектор вручную (например: .hero__title, #hero-title, h1, p, span, header, footer и т.д.)',
        }),
        ('Шрифт', {
            'fields': (
                ('font_size', 'font_size_min', 'font_size_max'),
                ('font_weight', 'line_height', 'letter_spacing'),
            ),
            'description': '💡 <strong>Совет:</strong> Используйте font_size_min и font_size_max вместе с font_size для создания адаптивных размеров через clamp().',
        }),
        ('Отступы (Margin)', {
            'fields': (
                ('margin_top', 'margin_bottom'),
                ('margin_left', 'margin_right'),
            ),
            'classes': ('collapse',),
            'description': '💡 <strong>Совет:</strong> Отрицательные значения допустимы для margin (например, -10px).',
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
            'description': '💡 <strong>Совет:</strong> Используйте HEX формат (например: #FFD700, #0A0D12).',
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
            if len(css) > 150:
                css_preview = css[:150] + '...'
            else:
                css_preview = css
            return mark_safe(
                f'<code style="font-size: 11px; background: #f0f0f0; padding: 4px 8px; border-radius: 4px; display: block; max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="{css}">{css_preview}</code>'
            )
        return mark_safe('<span style="color: #999;">—</span>')
    preview_css.short_description = 'CSS стили'
    
    def get_queryset(self, request):
        """Оптимизация запросов."""
        qs = super().get_queryset(request)
        return qs.select_related()
    
    def changelist_view(self, request, extra_context=None):
        """Добавляем статистику в контекст."""
        extra_context = extra_context or {}
        extra_context['total_elements'] = ElementSettings.objects.count()
        extra_context['active_elements'] = ElementSettings.objects.filter(is_active=True).count()
        return super().changelist_view(request, extra_context)


# ========== АДМИНКА ДЛЯ /adminka МОДЕЛЕЙ ==========

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name_de', 'name_en', 'name', 'created_at']
    search_fields = ['name', 'name_en', 'name_de']
    list_filter = ['created_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Названия на разных языках', {
            'fields': ('name', 'name_en', 'name_de'),
            'description': 'Укажите название категории на разных языках',
        }),
    )


@admin.register(AdminProject)
class AdminProjectAdmin(admin.ModelAdmin):
    list_display = ['project_code', 'name', 'category', 'status', 'year', 'created_at']
    list_filter = ['status', 'category', 'year', 'created_at']
    search_fields = ['project_code', 'name', 'description']
    list_editable = ['status']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('project_code', 'name', 'description', 'category', 'status'),
        }),
        ('Детали проекта', {
            'fields': ('year', 'type', 'size', 'color', 'end_date'),
            'classes': ('collapse',),
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # При редактировании
            return ['created_at', 'updated_at']
        return []


@admin.register(ContactRequest)
class ContactRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'email', 'phone', 'reason', 'status', 'created_at', 'has_admin_response']
    list_filter = ['status', 'reason', 'created_at']
    search_fields = ['name', 'email', 'phone', 'message']
    list_editable = ['status']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Информация о клиенте', {
            'fields': ('name', 'email', 'phone'),
        }),
        ('Заявка', {
            'fields': ('reason', 'message', 'status', 'created_at'),
        }),
        ('Ответ администратора', {
            'fields': ('message_admin', 'admin_id'),
            'classes': ('collapse',),
        }),
    )
    
    def has_admin_response(self, obj):
        """Показывает, есть ли ответ администратора."""
        if obj.message_admin:
            return mark_safe('<span style="color: green;">✓</span>')
        return mark_safe('<span style="color: #ccc;">—</span>')
    has_admin_response.short_description = 'Ответ'
    
    def save_model(self, request, obj, form, change):
        """Автоматически сохраняем ID администратора при ответе."""
        if obj.message_admin and not obj.admin_id:
            obj.admin_id = request.user.id
        super().save_model(request, obj, form, change)


# ---------- Заявки с сайта: категории, подкатегории, вопросы, заявки ----------

class RequestQuestionInline(admin.TabularInline):
    model = RequestQuestion
    extra = 0
    ordering = ['order', 'question_text']


class RequestSubcategoryInline(admin.TabularInline):
    model = RequestSubcategory
    extra = 0
    ordering = ['order', 'name']
    show_change_link = True


@admin.register(RequestCategory)
class RequestCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'order', 'created_at']
    list_editable = ['order']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [RequestSubcategoryInline]
    ordering = ['order', 'name']


@admin.register(RequestSubcategory)
class RequestSubcategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'slug', 'order', 'created_at']
    list_filter = ['category']
    list_editable = ['order']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [RequestQuestionInline]
    ordering = ['order', 'name']


@admin.register(RequestQuestion)
class RequestQuestionAdmin(admin.ModelAdmin):
    list_display = ['question_text', 'subcategory', 'field_name', 'order', 'created_at']
    list_filter = ['subcategory__category']
    list_editable = ['order']
    ordering = ['order', 'question_text']


@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'email', 'phone', 'category', 'subcategory', 'status', 'created_at']
    list_filter = ['status', 'category', 'created_at']
    search_fields = ['name', 'email', 'phone', 'message']
    list_editable = ['status']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at']
    fieldsets = (
        ('Клиент', {'fields': ('name', 'email', 'phone', 'message')}),
        ('Категория', {'fields': ('category', 'subcategory')}),
        ('Ответы на вопросы', {'fields': ('extra_answers',), 'classes': ('collapse',)}),
        ('Статус', {'fields': ('status', 'created_at')}),
        ('Ответ администратора', {'fields': ('message_admin', 'admin_id'), 'classes': ('collapse',)}),
    )