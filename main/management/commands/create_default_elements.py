# -*- coding: utf-8 -*-
from django.core.management.base import BaseCommand
from main.models import ElementSettings


class Command(BaseCommand):
    help = 'Создает предустановленные настройки для популярных HTML элементов'

    def handle(self, *args, **options):
        """Создает настройки для основных HTML тегов."""
        
        default_elements = [
            {
                'element_name': 'Все заголовки H1',
                'selector_type': 'tag',
                'css_selector': 'h1',
                'order': 1,
            },
            {
                'element_name': 'Все заголовки H2',
                'selector_type': 'tag',
                'css_selector': 'h2',
                'order': 2,
            },
            {
                'element_name': 'Все заголовки H3',
                'selector_type': 'tag',
                'css_selector': 'h3',
                'order': 3,
            },
            {
                'element_name': 'Все параграфы',
                'selector_type': 'tag',
                'css_selector': 'p',
                'order': 4,
            },
            {
                'element_name': 'Все span элементы',
                'selector_type': 'tag',
                'css_selector': 'span',
                'order': 5,
            },
            {
                'element_name': 'Все ссылки',
                'selector_type': 'tag',
                'css_selector': 'a',
                'order': 6,
            },
            {
                'element_name': 'Шапка сайта',
                'selector_type': 'tag',
                'css_selector': 'header',
                'order': 7,
            },
            {
                'element_name': 'Подвал сайта',
                'selector_type': 'tag',
                'css_selector': 'footer',
                'order': 8,
            },
            {
                'element_name': 'Секции',
                'selector_type': 'tag',
                'css_selector': 'section',
                'order': 9,
            },
            {
                'element_name': 'Навигация',
                'selector_type': 'tag',
                'css_selector': 'nav',
                'order': 10,
            },
            {
                'element_name': 'Основной контент',
                'selector_type': 'tag',
                'css_selector': 'main',
                'order': 11,
            },
            {
                'element_name': 'Кнопки',
                'selector_type': 'tag',
                'css_selector': 'button',
                'order': 12,
            },
        ]
        
        created_count = 0
        skipped_count = 0
        
        for element_data in default_elements:
            obj, created = ElementSettings.objects.get_or_create(
                css_selector=element_data['css_selector'],
                defaults={
                    'element_name': element_data['element_name'],
                    'selector_type': element_data['selector_type'],
                    'order': element_data['order'],
                    'is_active': False,  # По умолчанию неактивны, чтобы не перезаписать существующие стили
                }
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Создан элемент: {element_data["element_name"]} ({element_data["css_selector"]})')
                )
            else:
                skipped_count += 1
                self.stdout.write(
                    self.style.WARNING(f'⊘ Пропущен (уже существует): {element_data["element_name"]} ({element_data["css_selector"]})')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'\nГотово! Создано: {created_count}, пропущено: {skipped_count}')
        )
