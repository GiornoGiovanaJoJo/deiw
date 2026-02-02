#!/usr/bin/env sh
set -e
python manage.py migrate --noinput
python manage.py collectstatic --noinput --clear
python manage.py create_default_superuser || true
python manage.py create_adminka_user || true
exec gunicorn config.wsgi:application --bind "0.0.0.0:${PORT:-8000}" --workers 1 --threads 2
