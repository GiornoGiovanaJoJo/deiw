# -*- coding: utf-8 -*-
from django import forms
from django.contrib.auth.models import User
from django.core.validators import MinLengthValidator
from .models import (
    SiteSettings,
    HeroCarouselImage,
    Service,
    Project,
    DesignSettings,
    ElementSettings,
    UserProfile,
    AdminProject,
    Category,
)

# Лимит размера аватара (5 МБ)
AVATAR_MAX_SIZE = 5 * 1024 * 1024


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


class RegisterForm(forms.Form):
    """Форма регистрации: клиент, работник или компания."""
    USER_TYPE_CHOICES = [
        ('client', 'Клиент'),
        ('worker', 'Работник'),
        ('company', 'Компания'),
    ]
    full_name = forms.CharField(
        max_length=255,
        strip=True,
        label='Полное имя',
        widget=forms.TextInput(attrs={'placeholder': 'Полное имя', 'autocomplete': 'name'}),
    )
    email = forms.EmailField(
        label='Email',
        widget=forms.EmailInput(attrs={'placeholder': 'Адрес эл. почты', 'autocomplete': 'email'}),
    )
    phone = forms.CharField(
        max_length=20,
        required=False,
        strip=True,
        widget=forms.TextInput(attrs={'placeholder': 'Номер телефона', 'autocomplete': 'tel'}),
    )
    user_type = forms.ChoiceField(
        choices=USER_TYPE_CHOICES,
        initial='client',
        widget=forms.HiddenInput(),
    )
    company_name = forms.CharField(
        max_length=255,
        required=False,
        strip=True,
        widget=forms.TextInput(attrs={'placeholder': 'Название компании', 'autocomplete': 'organization'}),
    )
    password1 = forms.CharField(
        label='Пароль',
        min_length=8,
        widget=forms.PasswordInput(attrs={'placeholder': 'Введите пароль', 'autocomplete': 'new-password'}),
        validators=[MinLengthValidator(8, message='Пароль должен быть не менее 8 символов.')],
    )
    password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={'placeholder': 'Повторите пароль', 'autocomplete': 'new-password'}),
        label='Повторите пароль',
    )
    accept_terms = forms.BooleanField(
        required=True,
        label='Я принимаю политику конфиденциальности',
        error_messages={'required': 'Необходимо принять политику конфиденциальности.'},
    )

    def clean_email(self):
        email = self.cleaned_data.get('email', '').strip().lower()
        if email and User.objects.filter(email=email).exists():
            raise forms.ValidationError('Пользователь с таким email уже зарегистрирован.')
        return email

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            self.add_error('password2', 'Пароли не совпадают.')
        user_type = cleaned_data.get('user_type', 'client')
        if user_type == 'company' and not (cleaned_data.get('company_name') or '').strip():
            self.add_error('company_name', 'Укажите название компании.')
        return cleaned_data


class AvatarUploadForm(forms.Form):
    """Загрузка аватара с валидацией через Pillow (Django ImageField)."""
    avatar = forms.ImageField(
        label='Аватар',
        required=True,
        widget=forms.FileInput(attrs={'accept': 'image/jpeg,image/png,image/gif,image/webp'}),
    )

    def clean_avatar(self):
        avatar = self.cleaned_data.get('avatar')
        if avatar and avatar.size > AVATAR_MAX_SIZE:
            raise forms.ValidationError('Размер файла не должен превышать 5 МБ.')
        return avatar


class CabinetProfileForm(forms.Form):
    """Редактирование профиля кабинета: имя, телефон, email."""
    first_name = forms.CharField(max_length=150, required=False, strip=True)
    last_name = forms.CharField(max_length=150, required=False, strip=True)
    email = forms.EmailField(required=True)
    phone = forms.CharField(max_length=20, required=False, strip=True)


class CabinetRequestEditForm(forms.Form):
    """Редактирование заявки пользователем в кабинете: имя, телефон, email, сообщение."""
    name = forms.CharField(max_length=100, required=True, strip=True, label='Имя')
    phone = forms.CharField(max_length=20, required=True, strip=True, label='Телефон')
    email = forms.EmailField(required=True, label='Email')
    message = forms.CharField(required=False, strip=True, widget=forms.Textarea(attrs={'rows': 3}), label='Сообщение')


class AdminProjectForm(forms.ModelForm):
    """Форма создания/редактирования проекта админки."""
    class Meta:
        model = AdminProject
        fields = [
            'project_code', 'name', 'description', 'category', 'status',
            'year', 'type', 'size', 'color', 'end_date',
        ]
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
            'end_date': forms.DateInput(attrs={'type': 'date'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['category'].required = False
        self.fields['category'].empty_label = 'Выберите категорию'
        self.fields['year'].required = False
        self.fields['end_date'].required = False


class CategoryForm(forms.ModelForm):
    """Форма создания категории."""
    class Meta:
        model = Category
        fields = ['name', 'name_en', 'name_de']
