# -*- coding: utf-8 -*-
from django import forms
from .models import SiteSettings, HeroCarouselImage, Service, Project, DesignSettings, ElementSettings


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


class ElementSettingsForm(forms.ModelForm):
    """Форма для редактирования настроек отдельного элемента."""
    
    # Поле для быстрого выбора популярных HTML тегов
    html_tag = forms.ChoiceField(
        label='HTML тег (быстрый выбор)',
        required=False,
        choices=[
            ('', '--- Выберите тег или укажите селектор вручную ---'),
            ('', '────────── Заголовки ──────────'),
            ('h1', 'h1 - Заголовок 1'),
            ('h2', 'h2 - Заголовок 2'),
            ('h3', 'h3 - Заголовок 3'),
            ('h4', 'h4 - Заголовок 4'),
            ('h5', 'h5 - Заголовок 5'),
            ('h6', 'h6 - Заголовок 6'),
            ('', '────────── Текст ──────────'),
            ('p', 'p - Параграф'),
            ('span', 'span - Строковый элемент'),
            ('a', 'a - Ссылка'),
            ('strong', 'strong - Жирный текст'),
            ('em', 'em - Курсив'),
            ('', '────────── Структура ──────────'),
            ('header', 'header - Шапка'),
            ('footer', 'footer - Подвал'),
            ('section', 'section - Секция'),
            ('nav', 'nav - Навигация'),
            ('main', 'main - Основной контент'),
            ('article', 'article - Статья'),
            ('aside', 'aside - Боковая панель'),
            ('div', 'div - Блочный элемент'),
            ('', '────────── Формы ──────────'),
            ('button', 'button - Кнопка'),
            ('input', 'input - Поле ввода'),
            ('textarea', 'textarea - Текстовая область'),
            ('label', 'label - Метка поля'),
            ('select', 'select - Выпадающий список'),
            ('', '────────── Списки ──────────'),
            ('ul', 'ul - Маркированный список'),
            ('ol', 'ol - Нумерованный список'),
            ('li', 'li - Элемент списка'),
            ('', '────────── Медиа ──────────'),
            ('img', 'img - Изображение'),
            ('video', 'video - Видео'),
            ('', '────────── Таблицы ──────────'),
            ('table', 'table - Таблица'),
            ('tr', 'tr - Строка таблицы'),
            ('td', 'td - Ячейка таблицы'),
            ('th', 'th - Заголовок ячейки'),
        ],
        help_text='Выберите HTML тег для быстрой настройки (автоматически заполнит селектор). Или укажите CSS селектор вручную ниже.'
    )
    
    class Meta:
        model = ElementSettings
        fields = '__all__'
        widgets = {
            'color': forms.TextInput(attrs={'type': 'color', 'style': 'width: 100px; height: 40px;'}),
            'background_color': forms.TextInput(attrs={'type': 'color', 'style': 'width: 100px; height: 40px;'}),
            'custom_css': forms.Textarea(attrs={'rows': 4, 'style': 'font-family: monospace;'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Если это существующий объект и селектор - это HTML тег, установим html_tag
        if self.instance.pk and self.instance.css_selector:
            selector = self.instance.css_selector.strip()
            # Проверяем, является ли селектор простым HTML тегом
            if selector and not selector.startswith('.') and not selector.startswith('#'):
                # Популярные HTML теги
                html_tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'header', 
                           'footer', 'section', 'nav', 'main', 'article', 'div', 'button', 
                           'ul', 'ol', 'li', 'img', 'input', 'textarea']
                if selector in html_tags:
                    self.fields['html_tag'].initial = selector
        
        # Делаем CSS селектор обязательным только при создании
        if not self.instance.pk:
            self.fields['css_selector'].required = False  # Будет заполнено из html_tag или вручную
    
    def clean(self):
        cleaned_data = super().clean()
        html_tag = cleaned_data.get('html_tag')
        css_selector = cleaned_data.get('css_selector')
        selector_type = cleaned_data.get('selector_type')
        
        # Если выбран HTML тег (и это не пустая строка-разделитель), автоматически заполняем селектор
        if html_tag and html_tag.strip() and not css_selector:
            cleaned_data['css_selector'] = html_tag
            cleaned_data['selector_type'] = 'tag'
        elif html_tag and html_tag.strip() and css_selector != html_tag:
            # Если выбран тег, но селектор другой, обновляем селектор
            cleaned_data['css_selector'] = html_tag
            cleaned_data['selector_type'] = 'tag'
        
        # Автоматически определяем тип селектора, если не указан
        if css_selector and not selector_type:
            if css_selector.startswith('.'):
                cleaned_data['selector_type'] = 'class'
            elif css_selector.startswith('#'):
                cleaned_data['selector_type'] = 'id'
            elif css_selector in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 
                                 'header', 'footer', 'section', 'nav', 'main', 'article', 
                                 'div', 'button', 'ul', 'ol', 'li', 'img', 'input', 'textarea']:
                cleaned_data['selector_type'] = 'tag'
            else:
                cleaned_data['selector_type'] = 'custom'
        
        if not cleaned_data.get('css_selector'):
            raise forms.ValidationError('Необходимо указать CSS селектор или выбрать HTML тег.')
        
        return cleaned_data
