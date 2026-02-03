from django.conf import settings
from django.db import models
from django.urls import reverse

# Константы (KISS: единственное место для лимитов)
HERO_CAROUSEL_MAX_IMAGES = 10


def _image_url(model_name, pk):
    if not pk:
        return None
    return reverse('main:serve_db_image', kwargs={'model_name': model_name, 'pk': pk})


class SiteSettings(models.Model):
    """Единственная запись: логотип сайта в шапке. Фото хранится в SQLite."""
    logo_data = models.BinaryField('Файл логотипа', null=True, blank=True)
    logo_type = models.CharField('MIME-тип', max_length=100, blank=True)
    logo_name = models.CharField('Имя файла', max_length=255, blank=True)

    class Meta:
        verbose_name = 'Настройки сайта'
        verbose_name_plural = 'Настройки сайта'

    def __str__(self):
        return 'Настройки сайта'

    @classmethod
    def get_settings(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def get_logo_url(self):
        return _image_url('sitesettings', self.pk) if self.logo_data else None


class HeroCarouselImage(models.Model):
    """Изображения карусели в блоке hero. Максимум 10. Фото в SQLite."""
    image_data = models.BinaryField('Файл изображения', null=True, blank=True)
    image_type = models.CharField('MIME-тип', max_length=100, blank=True)
    image_name = models.CharField('Имя файла', max_length=255, blank=True)
    order = models.PositiveSmallIntegerField('Порядок', default=0)
    alt = models.CharField('Подпись (alt)', max_length=255, blank=True)

    class Meta:
        verbose_name = 'Изображение карусели Hero'
        verbose_name_plural = 'Карусель Hero'
        ordering = ['order']

    def __str__(self):
        return self.alt or f'Слайд {self.order}'

    def save(self, *args, **kwargs):
        if not self.pk and HeroCarouselImage.objects.count() >= HERO_CAROUSEL_MAX_IMAGES:
            raise ValueError(f'Максимум {HERO_CAROUSEL_MAX_IMAGES} изображений в карусели Hero.')
        super().save(*args, **kwargs)

    def get_image_url(self):
        return _image_url('herocarouselimage', self.pk) if self.image_data else None


class Service(models.Model):
    """Услуга: фото (в SQLite), заголовок, описание."""
    title = models.CharField('Заголовок', max_length=255)
    description = models.TextField('Описание')
    image_data = models.BinaryField('Файл фото', null=True, blank=True)
    image_type = models.CharField('MIME-тип', max_length=100, blank=True)
    image_name = models.CharField('Имя файла', max_length=255, blank=True)
    order = models.PositiveSmallIntegerField('Порядок', default=0)

    class Meta:
        verbose_name = 'Услуга'
        verbose_name_plural = 'Услуги'
        ordering = ['order']

    def __str__(self):
        return self.title

    def get_image_url(self):
        return _image_url('service', self.pk) if self.image_data else None


class Project(models.Model):
    """Проект: фото (в SQLite), заголовок, описание, ссылка, адрес."""
    title = models.CharField('Заголовок', max_length=255)
    description = models.TextField('Описание')
    image_data = models.BinaryField('Файл фото', null=True, blank=True)
    image_type = models.CharField('MIME-тип', max_length=100, blank=True)
    image_name = models.CharField('Имя файла', max_length=255, blank=True)
    link = models.URLField('Ссылка «Подробнее»', blank=True)
    address = models.CharField('Адрес', max_length=255, blank=True)
    order = models.PositiveSmallIntegerField('Порядок', default=0)

    class Meta:
        verbose_name = 'Проект'
        verbose_name_plural = 'Проекты'
        ordering = ['order']

    def __str__(self):
        return self.title

    def get_image_url(self):
        return _image_url('project', self.pk) if self.image_data else None


class DesignSettings(models.Model):
    """Настройки дизайна: шрифты, цвета, размеры элементов."""
    
    # Цвета
    primary_gold = models.CharField('Основной золотой цвет', max_length=7, default='#D4AF37', help_text='HEX формат, например: #D4AF37')
    primary_dark = models.CharField('Основной темный цвет', max_length=7, default='#1A1A1A', help_text='HEX формат')
    secondary_blue = models.CharField('Вторичный синий цвет', max_length=7, default='#0A2540', help_text='HEX формат')
    accent_purple = models.CharField('Акцентный фиолетовый цвет', max_length=7, default='#7C3AED', help_text='HEX формат')
    bg_light = models.CharField('Светлый фон', max_length=7, default='#F8FAFC', help_text='HEX формат')
    bg_lavender = models.CharField('Лавандовый фон', max_length=7, default='#F0EFFF', help_text='HEX формат')
    white = models.CharField('Белый цвет', max_length=7, default='#FFFFFF', help_text='HEX формат')
    text_dark = models.CharField('Темный текст', max_length=7, default='#0F172A', help_text='HEX формат')
    text_body = models.CharField('Цвет основного текста', max_length=7, default='#0F172A', help_text='HEX формат')
    text_light = models.CharField('Светлый текст', max_length=7, default='#64748B', help_text='HEX формат')
    text_muted = models.CharField('Приглушенный текст', max_length=7, default='#A4A7AE', help_text='HEX формат')
    
    # Шрифты
    font_primary = models.CharField('Основной шрифт', max_length=100, default='Inter, sans-serif', help_text='Например: Inter, sans-serif или Arial, sans-serif')
    font_heading = models.CharField('Шрифт заголовков', max_length=100, default='Inter, sans-serif', help_text='Например: DejaVu Sans, sans-serif')
    
    # Размеры шрифтов
    heading_xl = models.PositiveIntegerField('Размер заголовка XL (px)', default=44)
    heading_xl_lh = models.PositiveIntegerField('Высота строки заголовка XL (px)', default=52)
    heading_lg = models.PositiveIntegerField('Размер заголовка LG (px)', default=24)
    heading_lg_lh = models.PositiveIntegerField('Высота строки заголовка LG (px)', default=28)
    body_lg = models.PositiveIntegerField('Размер текста LG (px)', default=18)
    body_lg_lh = models.PositiveIntegerField('Высота строки текста LG (px)', default=24)
    body = models.PositiveIntegerField('Размер основного текста (px)', default=16)
    body_lh = models.PositiveIntegerField('Высота строки основного текста (px)', default=22)
    body_sm = models.PositiveIntegerField('Размер малого текста (px)', default=14)
    body_sm_lh = models.PositiveIntegerField('Высота строки малого текста (px)', default=20)
    
    # Отступы
    spacing_xs = models.PositiveIntegerField('Отступ XS (px)', default=8)
    spacing_sm = models.PositiveIntegerField('Отступ SM (px)', default=16)
    spacing_md = models.PositiveIntegerField('Отступ MD (px)', default=24)
    spacing_lg = models.PositiveIntegerField('Отступ LG (px)', default=40)
    spacing_xl = models.PositiveIntegerField('Отступ XL (px)', default=64)
    
    # Размеры элементов
    header_height = models.PositiveIntegerField('Высота шапки (px)', default=72)
    button_min_height = models.PositiveIntegerField('Минимальная высота кнопки (px)', default=44)
    button_padding_h = models.PositiveIntegerField('Горизонтальный отступ кнопки (px)', default=24)
    button_padding_v = models.PositiveIntegerField('Вертикальный отступ кнопки (px)', default=12)
    border_radius = models.PositiveIntegerField('Радиус скругления (px)', default=12)
    border_radius_lg = models.PositiveIntegerField('Большой радиус скругления (px)', default=20)
    
    # Тени
    shadow_sm = models.CharField('Маленькая тень', max_length=100, default='0 2px 8px rgba(0,0,0,0.06)', help_text='CSS значение box-shadow')
    shadow_md = models.CharField('Средняя тень', max_length=100, default='0 8px 24px rgba(0,0,0,0.1)', help_text='CSS значение box-shadow')
    shadow_lg = models.CharField('Большая тень', max_length=100, default='0 16px 92px -4px rgba(27, 30, 27, 0.10)', help_text='CSS значение box-shadow')
    
    class Meta:
        verbose_name = 'Настройка для Полины'
        verbose_name_plural = 'Настройка для Полины'
    
    def __str__(self):
        return 'Настройки дизайна'
    
    @classmethod
    def get_settings(cls):
        """Получить единственную запись настроек или создать по умолчанию."""
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class ElementSettings(models.Model):
    """Индивидуальные настройки для каждого элемента на странице."""
    
    SELECTOR_TYPE_CHOICES = [
        ('tag', 'HTML тег (h1, p, span, header, footer и т.д.)'),
        ('class', 'CSS класс (.hero__title)'),
        ('id', 'CSS ID (#hero-title)'),
        ('custom', 'Произвольный селектор'),
    ]
    
    # Основная информация
    element_name = models.CharField('Название элемента', max_length=255, blank=True, default='', 
                                   help_text='Например: Заголовок Hero, Подзаголовок Hero, Все параграфы')
    selector_type = models.CharField('Тип селектора', max_length=20, choices=SELECTOR_TYPE_CHOICES, default='class', 
                                    help_text='Выберите тип элемента для редактирования')
    css_selector = models.CharField('CSS селектор', max_length=255, unique=True, blank=False,
                                   help_text='Например: h1, p, span, .hero__title, #hero-title, header, footer, section')
    
    # Размеры шрифта
    font_size = models.PositiveIntegerField('Размер шрифта (px)', null=True, blank=True, help_text='Текущий размер. Оставьте пустым для значения по умолчанию.')
    font_size_min = models.PositiveIntegerField('Минимальный размер (px)', null=True, blank=True, help_text='Для clamp() или min()')
    font_size_max = models.PositiveIntegerField('Максимальный размер (px)', null=True, blank=True, help_text='Для clamp() или max()')
    font_weight = models.CharField('Толщина шрифта', max_length=50, blank=True, default='', help_text='Например: 400, 600, 700, bold')
    line_height = models.PositiveIntegerField('Высота строки (px)', null=True, blank=True)
    letter_spacing = models.CharField('Межбуквенное расстояние', max_length=20, blank=True, default='', help_text='Например: 0.02em, 2px')
    
    # Отступы (margin)
    margin_top = models.IntegerField('Отступ сверху (px)', null=True, blank=True, help_text='Отрицательные значения допустимы')
    margin_bottom = models.IntegerField('Отступ снизу (px)', null=True, blank=True)
    margin_left = models.IntegerField('Отступ слева (px)', null=True, blank=True)
    margin_right = models.IntegerField('Отступ справа (px)', null=True, blank=True)
    
    # Внутренние отступы (padding)
    padding_top = models.PositiveIntegerField('Внутренний отступ сверху (px)', null=True, blank=True)
    padding_bottom = models.PositiveIntegerField('Внутренний отступ снизу (px)', null=True, blank=True)
    padding_left = models.PositiveIntegerField('Внутренний отступ слева (px)', null=True, blank=True)
    padding_right = models.PositiveIntegerField('Внутренний отступ справа (px)', null=True, blank=True)
    
    # Позиционирование
    position = models.CharField('Позиционирование', max_length=20, blank=True, default='', 
                               choices=[('', 'По умолчанию'), ('relative', 'Relative'), ('absolute', 'Absolute'), 
                                       ('fixed', 'Fixed'), ('sticky', 'Sticky')],
                               help_text='CSS position')
    top = models.IntegerField('Сверху (px)', null=True, blank=True, help_text='Для position: absolute/fixed')
    left = models.IntegerField('Слева (px)', null=True, blank=True)
    right = models.IntegerField('Справа (px)', null=True, blank=True)
    bottom = models.IntegerField('Снизу (px)', null=True, blank=True)
    z_index = models.IntegerField('Z-index', null=True, blank=True, default=None)
    
    # Дополнительные свойства
    width = models.CharField('Ширина', max_length=50, blank=True, default='', help_text='Например: 100%, 500px, auto')
    max_width = models.CharField('Максимальная ширина', max_length=50, blank=True, default='', help_text='Например: 800px, 100%')
    min_width = models.CharField('Минимальная ширина', max_length=50, blank=True, default='')
    height = models.CharField('Высота', max_length=50, blank=True, default='', help_text='Например: 100px, auto')
    max_height = models.CharField('Максимальная высота', max_length=50, blank=True, default='')
    min_height = models.CharField('Минимальная высота', max_length=50, blank=True, default='')
    
    # Цвета
    color = models.CharField('Цвет текста', max_length=7, blank=True, default='', help_text='HEX формат, например: #000000')
    background_color = models.CharField('Цвет фона', max_length=7, blank=True, default='', help_text='HEX формат')
    
    # Выравнивание
    text_align = models.CharField('Выравнивание текста', max_length=20, blank=True, default='',
                                 choices=[('', 'По умолчанию'), ('left', 'Слева'), ('center', 'По центру'), 
                                         ('right', 'Справа'), ('justify', 'По ширине')])
    
    # Дополнительные CSS свойства (для продвинутых настроек)
    custom_css = models.TextField('Дополнительный CSS', blank=True, default='', 
                                 help_text='Любые дополнительные CSS свойства. Например: transform: scale(1.1);')
    
    # Порядок отображения в админке
    order = models.PositiveSmallIntegerField('Порядок', default=0, help_text='Для сортировки в админке')
    is_active = models.BooleanField('Активно', default=True, help_text='Применить эти настройки')
    
    class Meta:
        verbose_name = 'Настройка элемента'
        verbose_name_plural = 'Настройки элементов'
        ordering = ['order', 'element_name']
    
    def __str__(self):
        name = self.element_name if self.element_name else 'Без названия'
        return f'{name} ({self.css_selector})'
    
    def _box_sides_css(self, top, right, bottom, left, prop_name):
        """Формирует CSS для margin/padding (top right bottom left)."""
        parts = [
            f'{top}px' if top is not None else '0',
            f'{right}px' if right is not None else '0',
            f'{bottom}px' if bottom is not None else '0',
            f'{left}px' if left is not None else '0',
        ]
        return f'{prop_name}: {" ".join(parts)};'

    def get_css_style(self):
        """Генерирует CSS стили для этого элемента."""
        if not self.is_active:
            return ''
        styles = []

        # Размеры шрифта
        if self.font_size_min and self.font_size_max and self.font_size:
            styles.append(f'font-size: clamp({self.font_size_min}px, 5vw, {self.font_size_max}px);')
        elif self.font_size:
            styles.append(f'font-size: {self.font_size}px;')
        elif self.font_size_min:
            styles.append(f'font-size: min({self.font_size_min}px, 5vw);')
        elif self.font_size_max:
            styles.append(f'font-size: max({self.font_size_max}px, 5vw);')

        if self.font_weight:
            styles.append(f'font-weight: {self.font_weight};')
        if self.line_height:
            styles.append(f'line-height: {self.line_height}px;')
        if self.letter_spacing:
            styles.append(f'letter-spacing: {self.letter_spacing};')

        if any(x is not None for x in (self.margin_top, self.margin_right, self.margin_bottom, self.margin_left)):
            styles.append(self._box_sides_css(
                self.margin_top, self.margin_right, self.margin_bottom, self.margin_left, 'margin'
            ))
        if any(x is not None for x in (self.padding_top, self.padding_right, self.padding_bottom, self.padding_left)):
            styles.append(self._box_sides_css(
                self.padding_top, self.padding_right, self.padding_bottom, self.padding_left, 'padding'
            ))

        # Позиционирование
        if self.position:
            styles.append(f'position: {self.position};')
        if self.top is not None:
            styles.append(f'top: {self.top}px;')
        if self.left is not None:
            styles.append(f'left: {self.left}px;')
        if self.right is not None:
            styles.append(f'right: {self.right}px;')
        if self.bottom is not None:
            styles.append(f'bottom: {self.bottom}px;')
        if self.z_index is not None:
            styles.append(f'z-index: {self.z_index};')
        
        # Размеры
        if self.width:
            styles.append(f'width: {self.width};')
        if self.max_width:
            styles.append(f'max-width: {self.max_width};')
        if self.min_width:
            styles.append(f'min-width: {self.min_width};')
        if self.height:
            styles.append(f'height: {self.height};')
        if self.max_height:
            styles.append(f'max-height: {self.max_height};')
        if self.min_height:
            styles.append(f'min-height: {self.min_height};')
        
        # Цвета
        if self.color:
            styles.append(f'color: {self.color};')
        if self.background_color:
            styles.append(f'background-color: {self.background_color};')
        
        # Выравнивание
        if self.text_align:
            styles.append(f'text-align: {self.text_align};')
        
        # Дополнительный CSS
        if self.custom_css:
            styles.append(self.custom_css)
        
        return ' '.join(styles)


# ========== МОДЕЛИ ДЛЯ АДМИНКИ /adminka ==========

class Category(models.Model):
    """Категории проектов"""
    name = models.CharField('Название (RU)', max_length=100, blank=True)
    name_en = models.CharField('Название (EN)', max_length=100, blank=True)
    name_de = models.CharField('Название (DE)', max_length=100, blank=True)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'
        db_table = 'categories'
    
    def __str__(self):
        return self.name_de or self.name_en or self.name or f'Категория #{self.pk}'


class AdminProject(models.Model):
    """Проекты для админки"""
    STATUS_CHOICES = [
        ('planned', 'Запланирован'),
        ('in_progress', 'В работе'),
        ('completed', 'Завершен'),
    ]
    
    project_code = models.CharField('Код проекта', max_length=50, unique=True)
    name = models.CharField('Название', max_length=255)
    description = models.TextField('Описание', blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Категория')
    status = models.CharField('Статус', max_length=20, choices=STATUS_CHOICES, default='planned')
    year = models.IntegerField('Год', null=True, blank=True)
    type = models.CharField('Тип', max_length=100, blank=True)
    size = models.CharField('Размер', max_length=100, blank=True)
    color = models.CharField('Цвет', max_length=50, blank=True)
    end_date = models.DateField('Дата окончания', null=True, blank=True)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)
    
    class Meta:
        verbose_name = 'Проект (админка)'
        verbose_name_plural = 'Проекты (админка)'
        db_table = 'projects'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f'{self.project_code} - {self.name}'


class ContactRequest(models.Model):
    """Сообщения в поддержку (вкладка «Поддержка» на сайте)."""
    REASON_CHOICES = [
        ('support', 'Поддержка'),
        ('project', 'Проект'),
        ('consult', 'Консультация'),
        ('other', 'Другое'),
    ]
    STATUS_CHOICES = [
        ('new', 'Новая'),
        ('in_progress', 'В процессе'),
        ('closed', 'Закрыта'),
    ]
    name = models.CharField('Имя', max_length=100)
    phone = models.CharField('Телефон', max_length=20)
    email = models.EmailField('Email', max_length=100)
    reason = models.CharField('Причина', max_length=20, choices=REASON_CHOICES, default='support', blank=True)
    message = models.TextField('Сообщение', blank=True)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    status = models.CharField('Статус', max_length=20, choices=STATUS_CHOICES, default='new')
    message_admin = models.TextField('Ответ администратора', blank=True)
    admin_id = models.IntegerField('ID администратора', null=True, blank=True)

    class Meta:
        verbose_name = 'Сообщение в поддержку'
        verbose_name_plural = 'Поддержка'
        db_table = 'contact_requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f'{self.name} - {self.email} ({self.get_status_display()})'


# ---------- Заявки (вкладка «Заявка»): категория → подкатегория → вопросы ----------

class RequestCategory(models.Model):
    """Категория заявки (например: Строительство, IT)."""
    name = models.CharField('Название (RU)', max_length=100)
    name_en = models.CharField('Название (EN)', max_length=100, blank=True)
    name_de = models.CharField('Название (DE)', max_length=100, blank=True)
    slug = models.SlugField('Код', max_length=50, unique=True, help_text='например: it, bau')
    order = models.PositiveSmallIntegerField('Порядок', default=0)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)

    class Meta:
        verbose_name = 'Категория заявки'
        verbose_name_plural = 'Категории заявок'
        db_table = 'request_categories'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name_de or self.name_en or self.name


class RequestSubcategory(models.Model):
    """Подкатегория заявки (например для IT: Регистрация, IT-профиль)."""
    category = models.ForeignKey(RequestCategory, on_delete=models.CASCADE, related_name='subcategories')
    name = models.CharField('Название (RU)', max_length=100)
    name_en = models.CharField('Название (EN)', max_length=100, blank=True)
    name_de = models.CharField('Название (DE)', max_length=100, blank=True)
    slug = models.SlugField('Код', max_length=50, help_text='например: registration, it_profile')
    order = models.PositiveSmallIntegerField('Порядок', default=0)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)

    class Meta:
        verbose_name = 'Подкатегория заявки'
        verbose_name_plural = 'Подкатегории заявок'
        db_table = 'request_subcategories'
        ordering = ['order', 'name']
        unique_together = [['category', 'slug']]

    def __str__(self):
        return f'{self.category} / {self.name_de or self.name_en or self.name}'


class RequestQuestion(models.Model):
    """Вопрос для подкатегории заявки (динамические поля)."""
    subcategory = models.ForeignKey(RequestSubcategory, on_delete=models.CASCADE, related_name='questions')
    question_text = models.CharField('Текст вопроса', max_length=255)
    question_text_en = models.CharField('Текст (EN)', max_length=255, blank=True)
    question_text_de = models.CharField('Текст (DE)', max_length=255, blank=True)
    field_name = models.SlugField('Имя поля', max_length=50, help_text='например: company_name')
    order = models.PositiveSmallIntegerField('Порядок', default=0)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)

    class Meta:
        verbose_name = 'Вопрос заявки'
        verbose_name_plural = 'Вопросы заявок'
        db_table = 'request_questions'
        ordering = ['order', 'question_text']

    def __str__(self):
        return self.question_text


class Request(models.Model):
    """Заявка с сайта: категория, подкатегория, ответы на вопросы."""
    STATUS_CHOICES = [
        ('new', 'Новая'),
        ('in_progress', 'В обработке'),
        ('approved', 'Одобрена'),
        ('rejected', 'Отклонена'),
        ('closed', 'Закрыта'),  # для обратной совместимости
    ]
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cabinet_requests',
        verbose_name='Пользователь',
    )
    name = models.CharField('Имя', max_length=100)
    phone = models.CharField('Телефон', max_length=20)
    email = models.EmailField('Email', max_length=100)
    message = models.TextField('Сообщение', blank=True)
    category = models.ForeignKey(RequestCategory, on_delete=models.SET_NULL, null=True, related_name='requests')
    subcategory = models.ForeignKey(RequestSubcategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='requests')
    extra_answers = models.JSONField('Ответы на вопросы', default=dict, blank=True, help_text='JSON: поле -> ответ')
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    status = models.CharField('Статус', max_length=20, choices=STATUS_CHOICES, default='new')
    amount = models.DecimalField('Сумма', max_digits=12, decimal_places=2, null=True, blank=True, help_text='Для аналитики')
    message_admin = models.TextField('Ответ администратора', blank=True)
    admin_id = models.IntegerField('ID администратора', null=True, blank=True)

    class Meta:
        verbose_name = 'Заявка'
        verbose_name_plural = 'Заявки'
        db_table = 'requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['category', 'status']),
        ]

    def __str__(self):
        cat = self.category_id and self.category or '-'
        return f'{self.name} - {self.email} ({cat})'

    def display_number(self):
        """Номер заявки для отображения (например 001 100 0001)."""
        return f'{self.pk:09d}'[:9]


class RequestStage(models.Model):
    """Этап/история заявки: «История заявки» или «Этапы проекта»."""
    STAGE_TYPE_CHOICES = [
        ('history', 'История заявки'),
        ('project', 'Этапы проекта'),
    ]
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name='stages')
    title = models.CharField('Название', max_length=255)
    description = models.TextField('Описание', blank=True)
    order = models.PositiveSmallIntegerField('Порядок', default=0)
    stage_type = models.CharField(
        'Тип',
        max_length=20,
        choices=STAGE_TYPE_CHOICES,
        default='history',
    )
    created_at = models.DateTimeField('Дата', auto_now_add=True)

    class Meta:
        verbose_name = 'Этап заявки'
        verbose_name_plural = 'Этапы заявок'
        db_table = 'request_stages'
        ordering = ['order', 'created_at']

    def __str__(self):
        return f'{self.request_id} — {self.title}'


class UserProfile(models.Model):
    """Профиль пользователя сайта: тип (клиент/компания) и название компании."""
    USER_TYPE_CHOICES = [
        ('client', 'Клиент'),
        ('company', 'Компания'),
        ('worker', 'Работник'),
    ]
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='site_profile',
        verbose_name='Пользователь',
    )
    user_type = models.CharField(
        'Тип',
        max_length=20,
        choices=USER_TYPE_CHOICES,
        default='client',
    )
    company_name = models.CharField('Название компании', max_length=255, blank=True)
    phone = models.CharField('Телефон', max_length=20, blank=True)
    avatar_data = models.BinaryField('Файл аватара', null=True, blank=True)
    avatar_type = models.CharField('MIME-тип', max_length=100, blank=True)
    avatar_name = models.CharField('Имя файла', max_length=255, blank=True)
    created_at = models.DateTimeField('Дата регистрации', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)

    class Meta:
        verbose_name = 'Профиль пользователя'
        verbose_name_plural = 'Профили пользователей'
        db_table = 'user_profiles'

    def __str__(self):
        return f'{self.user.get_full_name() or self.user.email} ({self.get_user_type_display()})'

    def get_avatar_url(self):
        if self.avatar_data:
            return reverse('main:serve_db_image', args=['userprofile', self.pk])
        return None


class UserTwoFA(models.Model):
    """2FA: SMS или Telegram (заготовка, отправка кодов — внешние сервисы)."""
    METHOD_CHOICES = [
        ('sms', 'SMS'),
        ('telegram', 'Telegram'),
    ]
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='two_fa',
        verbose_name='Пользователь',
    )
    method = models.CharField('Метод', max_length=20, choices=METHOD_CHOICES, default='sms')
    phone_or_username = models.CharField('Телефон или @username', max_length=100, blank=True)
    is_enabled = models.BooleanField('Включено', default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = '2FA пользователя'
        verbose_name_plural = '2FA пользователей'
        db_table = 'user_two_fa'

    def __str__(self):
        return f'{self.user.email} ({self.get_method_display()})'