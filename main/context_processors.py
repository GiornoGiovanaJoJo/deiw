# -*- coding: utf-8 -*-
"""
Контекст-процессоры: добавляют переменные в контекст шаблонов.
"""
from .models import UserProfile


def cabinet_profile(request):
    """
    Добавляет profile (UserProfile) в контекст только для страниц личного кабинета,
    чтобы не выполнять запрос к БД на всех страницах.
    """
    context = {}
    if not request.user.is_authenticated:
        return context
    resolver_match = getattr(request, 'resolver_match', None)
    if not resolver_match:
        return context
    url_name = getattr(resolver_match, 'url_name', '') or ''
    if not url_name.startswith('cabinet_'):
        return context
    try:
        context['user_profile'] = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        context['user_profile'] = None
    return context
