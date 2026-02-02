# -*- coding: utf-8 -*-
"""
Создаёт пользователя админки granpainside@yandex.ru с заданным паролем, если его ещё нет.
"""
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand


EMAIL = 'granpainside@yandex.ru'
USERNAME = 'granpainside'
PASSWORD = 'Nikitoso02-'


class Command(BaseCommand):
    help = 'Создаёт пользователя админки (granpainside@yandex.ru), если его ещё нет.'

    def handle(self, *args, **options):
        User = get_user_model()
        if User.objects.filter(email=EMAIL).exists():
            self.stdout.write(self.style.NOTICE(f'Пользователь {EMAIL} уже существует, пропуск.'))
            return
        if User.objects.filter(username=USERNAME).exists():
            self.stdout.write(self.style.WARNING(f'Логин {USERNAME} занят, пропуск.'))
            return
        user = User(
            username=USERNAME,
            email=EMAIL,
            is_staff=True,
            is_active=True,
        )
        user.password = make_password(PASSWORD)
        user.save()
        self.stdout.write(self.style.SUCCESS(f'Создан пользователь админки: {EMAIL}'))
