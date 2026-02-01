# -*- coding: utf-8 -*-
from django import forms
from .models import SiteSettings, HeroCarouselImage, Service, Project


def set_image_from_upload(instance, field_data, field_type, field_name, uploaded_file):
    """Заполняет поля изображения на instance из загруженного файла (без save)."""
    if not uploaded_file:
        return
    raw = uploaded_file.read()
    if not raw:
        return
    setattr(instance, field_data, raw)
    content_type = getattr(uploaded_file, 'content_type', None) or 'application/octet-stream'
    if 'image' not in content_type:
        content_type = 'image/jpeg'
    setattr(instance, field_type, content_type)
    setattr(instance, field_name, (getattr(uploaded_file, 'name', '') or '')[:255])


class SiteSettingsForm(forms.ModelForm):
    logo = forms.ImageField(
        label='Логотип',
        required=False,
        help_text='Загрузите изображение. Хранится в SQLite.',
    )

    class Meta:
        model = SiteSettings
        fields = []

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['logo'].widget.attrs.update({'accept': 'image/*'})

    def save(self, commit=True):
        instance = super().save(commit=False)
        f = self.files.get('logo')
        if f:
            set_image_from_upload(instance, 'logo_data', 'logo_type', 'logo_name', f)
        if commit:
            instance.save()
        return instance


class HeroCarouselImageForm(forms.ModelForm):
    image = forms.ImageField(
        label='Изображение',
        required=False,
        help_text='Хранится в SQLite.',
    )

    class Meta:
        model = HeroCarouselImage
        fields = ['order', 'alt']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['image'].widget.attrs.update({'accept': 'image/*'})

    def save(self, commit=True):
        instance = super().save(commit=False)
        f = self.files.get('image')
        if f:
            set_image_from_upload(instance, 'image_data', 'image_type', 'image_name', f)
        if commit:
            instance.save()
        return instance


class ServiceForm(forms.ModelForm):
    image = forms.ImageField(
        label='Фото',
        required=False,
        help_text='Хранится в SQLite.',
    )

    class Meta:
        model = Service
        fields = ['title', 'description', 'order']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['image'].widget.attrs.update({'accept': 'image/*'})

    def save(self, commit=True):
        instance = super().save(commit=False)
        f = self.files.get('image')
        if f:
            set_image_from_upload(instance, 'image_data', 'image_type', 'image_name', f)
        if commit:
            instance.save()
        return instance


class ProjectForm(forms.ModelForm):
    image = forms.ImageField(
        label='Фото',
        required=False,
        help_text='Хранится в SQLite.',
    )

    class Meta:
        model = Project
        fields = ['title', 'description', 'link', 'address', 'order']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['image'].widget.attrs.update({'accept': 'image/*'})

    def save(self, commit=True):
        instance = super().save(commit=False)
        f = self.files.get('image')
        if f:
            set_image_from_upload(instance, 'image_data', 'image_type', 'image_name', f)
        if commit:
            instance.save()
        return instance
