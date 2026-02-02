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
        # Добавляем origin из заголовка HTTP_ORIGIN (то, что отправляет браузер) —
        # это устраняет 403 CSRF за прокси (Railway/Heroku), когда Referer/Origin проверяется.
        origin = request.META.get('HTTP_ORIGIN')
        if origin and self._origin_host_allowed(origin):
            if origin not in settings.CSRF_TRUSTED_ORIGINS:
                settings.CSRF_TRUSTED_ORIGINS = list(settings.CSRF_TRUSTED_ORIGINS) + [origin]
        host = request.get_host()
        if not host:
            return None
        if host in settings.ALLOWED_HOSTS or self._host_matches_allowed(host):
            scheme = 'https' if request.is_secure() else 'http'
            built_origin = f'{scheme}://{host}'
            if built_origin not in settings.CSRF_TRUSTED_ORIGINS:
                settings.CSRF_TRUSTED_ORIGINS = list(settings.CSRF_TRUSTED_ORIGINS) + [built_origin]
        return None

    def _origin_host_allowed(self, origin):
        """Проверяет, что хост из origin разрешён в ALLOWED_HOSTS."""
        try:
            from urllib.parse import urlparse
            parsed = urlparse(origin)
            host = parsed.hostname or parsed.netloc.split(':')[0]
            return (host in settings.ALLOWED_HOSTS) or self._host_matches_allowed(host)
        except Exception:
            return False

    def _host_matches_allowed(self, host):
        for allowed in settings.ALLOWED_HOSTS:
            if allowed.startswith('.') and (host == allowed[1:] or host.endswith(allowed)):
                return True
            if allowed == host:
                return True
        return False
