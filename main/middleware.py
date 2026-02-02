"""
Middleware для приложения main.
"""
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin


class CsrfTrustOriginMiddleware(MiddlewareMixin):
    """
    Добавляет origin текущего запроса в CSRF_TRUSTED_ORIGINS,
    если хост разрешён в ALLOWED_HOSTS. Решает 403 CSRF за прокси (Railway, Heroku),
    когда RAILWAY_PUBLIC_DOMAIN или CSRF_TRUSTED_ORIGINS не заданы.
    """
    def process_request(self, request):
        host = request.get_host()
        if not host:
            return None
        if host in settings.ALLOWED_HOSTS or self._host_matches_allowed(host):
            scheme = 'https' if request.is_secure() else 'http'
            origin = f'{scheme}://{host}'
            if origin not in settings.CSRF_TRUSTED_ORIGINS:
                settings.CSRF_TRUSTED_ORIGINS = list(settings.CSRF_TRUSTED_ORIGINS) + [origin]
        return None

    def _host_matches_allowed(self, host):
        for allowed in settings.ALLOWED_HOSTS:
            if allowed.startswith('.') and (host == allowed[1:] or host.endswith(allowed)):
                return True
            if allowed == host:
                return True
        return False
