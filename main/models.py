from django.db import models
from django.urls import reverse


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
        if not self.pk:
            if HeroCarouselImage.objects.count() >= 10:
                raise ValueError('Максимум 10 изображений в карусели Hero.')
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
    accent_purple = models.CharField('Акцентный фиолетовый цвет', max_length=7, default='#695EF9', help_text='HEX формат')
    bg_light = models.CharField('Светлый фон', max_length=7, default='#F8FAFC', help_text='HEX формат')
    bg_lavender = models.CharField('Лавандовый фон', max_length=7, default='#F0EFFF', help_text='HEX формат')
    white = models.CharField('Белый цвет', max_length=7, default='#FFFFFF', help_text='HEX формат')
    text_dark = models.CharField('Темный текст', max_length=7, default='#0A0D12', help_text='HEX формат')
    text_body = models.CharField('Цвет основного текста', max_length=7, default='#0A0D12', help_text='HEX формат')
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
    border_radius = models.PositiveIntegerField('Радиус скругления (px)', default=8)
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