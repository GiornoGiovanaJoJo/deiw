# -*- coding: utf-8 -*-
from django import forms
from .models import SiteSettings, HeroCarouselImage, Service, Project, DesignSettings


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


class DesignSettingsForm(forms.ModelForm):
    """Форма для редактирования настроек дизайна."""
    
    class Meta:
        model = DesignSettings
        fields = '__all__'
        widgets = {
            'primary_gold': forms.TextInput(attrs={'type': 'color', 'style': 'width: 100px; height: 40px;'}),
            'primary_dark': forms.TextInput(attrs={'type': 'color', 'style': 'width: 100px; height: 40px;'}),
            'secondary_blue': forms.TextInput(attrs={'type': 'color', 'style': 'width: 100px; height: 40px;'}),
            'accent_purple': forms.TextInput(attrs={'type': 'color', 'style': 'width: 100px; height: 40px;'}),
            'bg_light': forms.TextInput(attrs={'type': 'color', 'style': 'width: 100px; height: 40px;'}),
            'bg_lavender': forms.TextInput(attrs={'type': 'color', 'style': 'width: 100px; height: 40px;'}),
            'white': forms.TextInput(attrs={'type': 'color', 'style': 'width: 100px; height: 40px;'}),
            'text_dark': forms.TextInput(attrs={'type': 'color', 'style': 'width: 100px; height: 40px;'}),
            'text_body': forms.TextInput(attrs={'type': 'color', 'style': 'width: 100px; height: 40px;'}),
            'text_light': forms.TextInput(attrs={'type': 'color', 'style': 'width: 100px; height: 40px;'}),
            'text_muted': forms.TextInput(attrs={'type': 'color', 'style': 'width: 100px; height: 40px;'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Группируем поля по категориям для лучшей организации
        for field_name in ['primary_gold', 'primary_dark', 'secondary_blue', 'accent_purple', 
                          'bg_light', 'bg_lavender', 'white', 'text_dark', 'text_body', 
                          'text_light', 'text_muted']:
            if field_name in self.fields:
                self.fields[field_name].widget.attrs.update({'class': 'color-picker'})
