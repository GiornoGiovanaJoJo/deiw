# API Empire Premium

Документация по HTTP API для работы с заявками и поддержкой (категории, подкатегории, вопросы, отправка форм).

**Базовый URL:** относительные пути от корня сайта, например: `https://ваш-домен.com/api/...`

**Формат ответов:** JSON. Кодировка: UTF-8.

**CSRF:** для POST-запросов необходимо передавать токен CSRF (заголовок `X-CSRFToken` или поле `csrfmiddlewaretoken` в теле формы). Токен можно получить из cookie `csrftoken` или из тега `{% csrf_token %}` на странице.

---

## 1. Категории заявок

Список категорий для выбора в форме заявки.

| Параметр | Значение |
|----------|----------|
| **Метод** | `GET` |
| **URL** | `/api/request-categories/` |
| **Параметры** | нет |

### Ответ 200 OK

```json
{
  "categories": [
    {
      "id": 1,
      "name": "Название категории",
      "slug": "slug-category"
    }
  ]
}
```

| Поле   | Тип   | Описание |
|--------|--------|----------|
| `id`   | number | ID категории |
| `name` | string | Название (по текущему языку: DE/EN/RU) |
| `slug` | string | Код категории |

---

## 2. Подкатегории заявок

Подкатегории по выбранной категории.

| Параметр | Значение |
|----------|----------|
| **Метод** | `GET` |
| **URL** | `/api/request-subcategories/` |
| **Query-параметры** | `category_id` (обязательный) — ID категории |

### Пример запроса

```
GET /api/request-subcategories/?category_id=1
```

### Ответ 200 OK

```json
{
  "subcategories": [
    {
      "id": 1,
      "name": "Название подкатегории",
      "slug": "slug-subcategory",
      "category_id": 1
    }
  ]
}
```

| Поле         | Тип   | Описание |
|--------------|--------|----------|
| `id`         | number | ID подкатегории |
| `name`       | string | Название (по текущему языку) |
| `slug`       | string | Код подкатегории |
| `category_id`| number | ID родительской категории |

Если `category_id` не передан — возвращается пустой массив: `{"subcategories": []}`.

---

## 3. Вопросы подкатегории

Вопросы (дополнительные поля) для выбранной подкатегории.

| Параметр | Значение |
|----------|----------|
| **Метод** | `GET` |
| **URL** | `/api/request-questions/` |
| **Query-параметры** | `subcategory_id` (обязательный) — ID подкатегории |

### Пример запроса

```
GET /api/request-questions/?subcategory_id=2
```

### Ответ 200 OK

```json
{
  "questions": [
    {
      "id": 1,
      "text": "Текст вопроса",
      "field_name": "company_name"
    }
  ]
}
```

| Поле        | Тип   | Описание |
|-------------|--------|----------|
| `id`        | number | ID вопроса |
| `text`      | string | Текст вопроса (по текущему языку) |
| `field_name`| string | Имя поля для ответа (в форме передавать как `extra_<field_name>`) |

Если `subcategory_id` не передан — возвращается пустой массив: `{"questions": []}`.

---

## 4. Отправка сообщения в поддержку

Создание обращения в поддержку.

| Параметр | Значение |
|----------|----------|
| **Метод** | `POST` |
| **URL** | `/api/submit-support/` |
| **Content-Type** | `application/x-www-form-urlencoded` или `multipart/form-data` |

### Тело запроса (form-data)

| Поле     | Тип   | Обязательное | Описание |
|----------|--------|--------------|----------|
| `name`   | string | да          | Имя |
| `phone`  | string | да          | Телефон |
| `email`  | string | да          | Email (валидный адрес) |
| `message`| string | нет         | Текст сообщения |
| `csrfmiddlewaretoken` | string | да* | CSRF-токен (*если не передан в заголовке `X-CSRFToken`) |

### Успешный ответ 200 OK

```json
{
  "success": true,
  "message": "Сообщение отправлено."
}
```

### Ошибка 400 Bad Request

```json
{
  "success": false,
  "error": "Заполните имя, телефон и email."
}
```

или

```json
{
  "success": false,
  "error": "Некорректный email."
}
```

---

## 5. Отправка заявки

Создание заявки (с возможной привязкой к авторизованному пользователю).

| Параметр | Значение |
|----------|----------|
| **Метод** | `POST` |
| **URL** | `/api/submit-request/` |
| **Content-Type** | `application/x-www-form-urlencoded` или `multipart/form-data` |

### Тело запроса (form-data)

| Поле     | Тип   | Обязательное | Описание |
|----------|--------|--------------|----------|
| `name`   | string | да          | Имя |
| `phone`  | string | да          | Телефон |
| `email`  | string | да          | Email (валидный адрес) |
| `message`| string | нет         | Сообщение/описание |
| `category_id`   | number/string | нет | ID категории заявки |
| `subcategory_id`| number/string | нет | ID подкатегории |
| `extra_<field_name>` | string | нет | Ответ на вопрос; `field_name` — из API вопросов (например `extra_company_name`) |
| `csrfmiddlewaretoken` | string | да* | CSRF-токен |

### Успешный ответ 200 OK

```json
{
  "success": true,
  "message": "Заявка отправлена."
}
```

### Ошибка 400 Bad Request

```json
{
  "success": false,
  "error": "Заполните имя, телефон и email."
}
```

или

```json
{
  "success": false,
  "error": "Некорректный email."
}
```

---

## Коды ответов и ошибки

| Код | Описание |
|-----|-----------|
| 200 | Успешный ответ, тело в JSON |
| 400 | Ошибка валидации (тело `{"success": false, "error": "..."}`) |
| 403 | Ошибка CSRF (токен не передан или неверный) |
| 404 | Ресурс не найден (для GET) |
| 405 | Метод не разрешён (например, GET вместо POST) |

---

## Пример цепочки запросов для формы заявки

1. **Получить категории:**  
   `GET /api/request-categories/`

2. **После выбора категории — подкатегории:**  
   `GET /api/request-subcategories/?category_id=1`

3. **После выбора подкатегории — вопросы:**  
   `GET /api/request-questions/?subcategory_id=2`

4. **Отправить заявку:**  
   `POST /api/submit-request/`  
   с полями: `name`, `phone`, `email`, `message`, `category_id`, `subcategory_id`, `extra_<field_name>` для каждого вопроса, и CSRF-токен.

---

*Документация актуальна для приложения Empire Premium (main).*
