"""
Скрипт для создания тестовых данных для админки
Запуск: python manage.py shell < create_test_data.py
"""

from main.models import Category, AdminProject, ContactRequest
from datetime import date, timedelta

print("Создание тестовых данных...")

# Создание категорий
categories_data = [
    {'name': 'Строительство', 'name_en': 'Construction', 'name_de': 'Trockenbau'},
    {'name': 'Ремонт', 'name_en': 'Renovation', 'name_de': 'Renovierung'},
    {'name': 'Дизайн', 'name_en': 'Design', 'name_de': 'Design'},
]

for cat_data in categories_data:
    cat, created = Category.objects.get_or_create(
        name_de=cat_data['name_de'],
        defaults=cat_data
    )
    if created:
        print(f"✓ Создана категория: {cat.name_de}")

# Создание проектов
projects_data = [
    {
        'project_code': 'PRJ-2026-001',
        'name': 'Офисное здание на Берлинштрассе',
        'description': 'Строительство современного офисного здания с подземной парковкой',
        'status': 'in_progress',
        'year': 2026,
        'type': 'Коммерческий',
        'size': '5000 м²',
        'color': '#D4AF37',
        'end_date': date.today() + timedelta(days=180),
    },
    {
        'project_code': 'PRJ-2026-002',
        'name': 'Жилой комплекс "Зеленый квартал"',
        'description': 'Строительство жилого комплекса на 200 квартир',
        'status': 'planned',
        'year': 2026,
        'type': 'Жилой',
        'size': '15000 м²',
        'color': '#4CAF50',
        'end_date': date.today() + timedelta(days=365),
    },
    {
        'project_code': 'PRJ-2025-045',
        'name': 'Торговый центр "Европа"',
        'description': 'Реконструкция торгового центра',
        'status': 'completed',
        'year': 2025,
        'type': 'Коммерческий',
        'size': '8000 м²',
        'color': '#2196F3',
        'end_date': date.today() - timedelta(days=30),
    },
]

for proj_data in projects_data:
    # Добавляем категорию
    if Category.objects.exists():
        proj_data['category'] = Category.objects.first()
    
    proj, created = AdminProject.objects.get_or_create(
        project_code=proj_data['project_code'],
        defaults=proj_data
    )
    if created:
        print(f"✓ Создан проект: {proj.name}")

# Создание заявок в поддержку
requests_data = [
    {
        'name': 'Иван Петров',
        'phone': '+49 30 12345678',
        'email': 'ivan.petrov@example.com',
        'reason': 'project',
        'message': 'Хотел бы обсудить возможность строительства частного дома',
        'status': 'new',
    },
    {
        'name': 'Мария Смирнова',
        'phone': '+49 30 87654321',
        'email': 'maria.smirnova@example.com',
        'reason': 'consult',
        'message': 'Нужна консультация по ремонту квартиры',
        'status': 'in_progress',
        'message_admin': 'Свяжемся с вами в ближайшее время',
    },
    {
        'name': 'Алексей Козлов',
        'phone': '+49 30 55555555',
        'email': 'alexey.kozlov@example.com',
        'reason': 'other',
        'message': 'Вопрос по гарантии на выполненные работы',
        'status': 'closed',
        'message_admin': 'Гарантия продлена на 2 года',
    },
]

for req_data in requests_data:
    req, created = ContactRequest.objects.get_or_create(
        email=req_data['email'],
        defaults=req_data
    )
    if created:
        print(f"✓ Создана заявка от: {req.name}")

print("\n✓ Все тестовые данные успешно созданы!")
print("\nДля входа в админку используйте:")
print("URL: http://localhost:8000/adminka/")
print("Email: admin@example.com")
print("Пароль: admin123")
