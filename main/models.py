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
