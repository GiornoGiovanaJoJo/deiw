# -*- coding: utf-8 -*-
"""
Создаёт суперпользователя root/root, если ни одного суперпользователя ещё нет.
Используется при первом деплое на Railway.
"""
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Создаёт суперпользователя root/root, если суперпользователей ещё нет.'

    def handle(self, *args, **options):
        User = get_user_model()
        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write(self.style.NOTICE('Суперпользователь уже существует, пропуск.'))
            return
        username = 'root'
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'Пользователь {username} уже есть, пропуск.'))
            return
        user = User(
            username=username,
            email='root@localhost',
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )
        user.password = make_password('root')
        user.save()
        self.stdout.write(self.style.SUCCESS(f'Создан суперпользователь: {username} / root'))
