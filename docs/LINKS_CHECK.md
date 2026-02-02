# Проверка ссылок и кнопок

## Что сделано

### 1. Жёстко прописанные пути заменены на `{% url %}`

- **`main/templates/adminka/login.html`**
  - Логотип: `href="/"` → `href="{% url 'main:home' %}"`
  - Навигация (О нас, Услуги, Проекты, Карьера): `/#about`, `/#services` и т.д. → `{% url 'main:home' %}#about` и т.д.
  - Кнопка «Оставить заявку»: `/#contact` → `{% url 'main:home' %}#contact`

- **`main/templates/adminka/register.html`**
  - Те же замены: логотип, навигация, «Оставить заявку» — везде используется `{% url 'main:home' %}`.

### 2. Футер (`main/templates/components/site_footer.html`)

- **Импрессум:** `href="#"` → `href="{% url 'main:terms' %}#impressum"` (переход на страницу условий с якорем).
- **Cookies:** `href="#"` → `href="{% url 'main:privacy' %}#cookies"` (переход на страницу политики конфиденциальности с якорем).

### 3. Проверенные ссылки (все ведут на существующие маршруты)

| Шаблон / раздел | Ссылки |
|-----------------|--------|
| **login.html** | home, adminka_login, register (абсолютный URL), password_reset |
| **register.html** | home, adminka_login, privacy |
| **cabinet/base.html** | home, cabinet_orders, cabinet_requests, cabinet_profile, cabinet_support, cabinet_analytics, adminka_logout |
| **cabinet/requests.html** | cabinet_request_detail(pk) |
| **cabinet/request_detail.html** | cabinet_request_edit(pk), cabinet_requests |
| **cabinet/request_edit.html** | cabinet_request_detail(pk) |
| **cabinet/orders.html** | home#contact, cabinet_order_detail(pk) |
| **cabinet/analytics.html** | cabinet_export_pdf, cabinet_export_excel, cabinet_request_detail(id) |
| **cabinet/order_detail.html** | cabinet_orders |
| **cabinet/support.html** | home#contact |
| **cabinet/profile.html** | cabinet_profile (form action) |
| **cabinet/password_reset_*.html** | home, adminka_login, password_reset |
| **site_footer.html** | home, privacy, terms, terms#impressum, privacy#cookies, соцсети, mailto, tel |
| **adminka/sidebar.html** | adminka_dashboard, adminka_profile, adminka_projects, adminka_categories, adminka_requests, adminka_support |
| **adminka/header.html** | adminka_profile, adminka_logout |
| **adminka/dashboard.html** | adminka_requests, adminka_request_edit(pk), adminka_support, adminka_support_edit(pk) |
| **adminka/projects.html** | adminka_project_add, adminka_project_view(pk), adminka_project_edit(pk) |
| **adminka/project_add.html, project_edit.html, project_view.html** | adminka_projects, adminka_project_edit(pk) |
| **adminka/requests.html, request_edit.html** | adminka_requests, adminka_request_edit(pk) |
| **adminka/support.html, support_edit.html** | adminka_support, adminka_support_edit(pk) |
| **adminka/profile.html** | adminka_dashboard |

### 4. JavaScript (fetch)

- **cabinet-requests.js:** `/api/request-categories/`, `/api/request-subcategories/`, `/api/request-questions/`, `/api/submit-request/`, `/cabinet/requests/<pk>/delete/` — пути корректны при развертывании в корне.
- **adminka (categories, projects, support, requests):** удаление через `/adminka/.../delete/` — пути соответствуют `main/urls.py`.

### 5. Формы (action)

- Логин: `action="{% url 'main:adminka_login' %}"`
- Регистрация: `action="{% url 'main:register' %}"`
- Профиль кабинета (аватар, данные, пароль): `action="{% url 'main:cabinet_profile' %}"`

---

## Замечания

1. **Импрессум и Cookies** сейчас ведут на `terms#impressum` и `privacy#cookies`. Если появятся отдельные страницы (например, `/impressum/`, `/cookies/`), в футере нужно будет заменить ссылки на их URL.
2. **Язык в футере** переключается через `?lang=de|en|ru`. Если используется Django i18n (`set_language`), при необходимости можно перейти на `/i18n/setlang/`.
3. **users.js** содержит `fetch('library/php/...')` и в этом проекте нигде не подключается — это legacy из другого проекта, на текущие ссылки не влияет.

Все проверенные ссылки и кнопки привязаны к существующим маршрутам в `main/urls.py`.
