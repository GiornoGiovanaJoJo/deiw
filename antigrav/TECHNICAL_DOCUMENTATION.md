# EP-System - Техническая документация админ-панели

## 1. НАЗНАЧЕНИЕ СИСТЕМЫ

EP-System - веб-приложение для управления строительной компанией с модулями:
- Управление проектами
- CRM (клиенты, заявки)
- Складской учёт
- Управление персоналом
- Система задач
- Документооборот

**Технологический стек:**
- Frontend: React 18, React Router, Tailwind CSS
- UI: shadcn/ui, Lucide React icons
- Backend: Base44 BaaS (entities, authentication, storage)
- State: @tanstack/react-query
- Forms: react-hook-form
- Date: date-fns

## 2. РОЛИ И АУТЕНТИФИКАЦИЯ

### 2.1 Система ролей

Роли хранятся в entity `Benutzer.position`:

```typescript
type UserRole = 
  | "Admin"
  | "Projektleiter"
  | "Gruppenleiter"
  | "Worker"
  | "Büro"
  | "Warehouse"
```

### 2.2 Механизм аутентификации

**Для административной панели:**
- Вход: email + password из entity Benutzer
- Сессия: localStorage key `benutzer_session` (TTL 24h)
- Структура сессии: `{ id: string, timestamp: number }`

**Для терминала (склад):**
- QR-код сканирование
- Выбор из списка пользователей
- Без пароля

**Проверка прав:**
```javascript
const canAccessPage = (pagePath, benutzerPosition) => {
  return accessMap[benutzerPosition].includes(pagePath);
}
```

## 3. МАТРИЦА ДОСТУПА К МОДУЛЯМ

### 3.1 Таблица доступа

| Модуль | Admin | Projektleiter | Gruppenleiter | Worker | Büro | Warehouse |
|--------|-------|---------------|---------------|--------|------|-----------|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Aufgaben | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Benutzer | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Subunternehmer | ✓ | ✓ | - | - | - | - |
| Kunden | ✓ | ✓ | - | - | ✓ | - |
| Projekte | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| Kategorien | ✓ | ✓ | ✓ | - | ✓ | ✓ |
| Anfragen | ✓ | - | - | - | ✓ | - |
| Support | ✓ | - | - | - | ✓ | - |
| LagerDashboard | ✓ | - | - | - | ✓ | ✓ |
| Waren | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| Terminal | ✓ | ✓ | ✓ | ✓ | - | ✓ |
| LagerKassa | ✓ | - | - | - | - | ✓ |
| Protokoll | ✓ | - | - | - | ✓ | ✓ |
| LagerBenutzer | ✓ | - | - | - | ✓ | ✓ |

### 3.2 Реализация в Layout.js

```javascript
const accessMap = {
  "Admin": ["Dashboard", "Aufgaben", "Benutzer", "Subunternehmer", "Kunden", 
            "Projekte", "Kategorien", "Anfragen", "Support", "LagerDashboard", 
            "Waren", "Terminal", "LagerKassa", "Protokoll", "LagerBenutzer"],
  "Projektleiter": ["Dashboard", "Aufgaben", "Benutzer", "Subunternehmer", 
                    "Kunden", "Projekte", "Kategorien", "Waren", "Terminal"],
  "Gruppenleiter": ["Dashboard", "Aufgaben", "Benutzer", "Projekte", 
                    "Waren", "Terminal"],
  "Worker": ["Dashboard", "Aufgaben", "Projekte", "Benutzer", "Waren", "Terminal"],
  "Büro": ["Dashboard", "Aufgaben", "Benutzer", "Kunden", "Projekte", 
           "Support", "Kategorien", "Anfragen", "LagerDashboard", 
           "Protokoll", "LagerBenutzer"],
  "Warehouse": ["Dashboard", "Aufgaben", "Benutzer", "Kategorien", 
                "LagerDashboard", "Waren", "Terminal", "Protokoll", "LagerBenutzer"]
};
```

## 4. СУЩНОСТИ СИСТЕМЫ

### 4.1 Основные entities

```typescript
// User management
- Benutzer (пользователи/сотрудники)
- User (built-in Base44 entity, не модифицируется)

// CRM
- Kunde (клиенты)
- Anfrage (заявки от клиентов)
- Ticket (техподдержка)
- Subunternehmer (субподрядчики)

// Projects
- Projekt (проекты)
- Aufgabe (задачи)
- Etappe (этапы проекта)
- Dokument (документы)
- Kommentar (комментарии)
- Kategorie (категории работ/товаров)

// Warehouse
- Ware (товары)
- WarenLog (журнал движения)
- Kassa (кассовые аппараты)
- KassaSale (продажи через кассу)
```

### 4.2 Ключевые связи

```
Anfrage.projekt_id → Projekt.id
Projekt.anfrage_id → Anfrage.id
Projekt.kunde_id → Kunde.id
Projekt.projektleiter_id → Benutzer.id
Projekt.gruppenleiter_ids → [Benutzer.id]
Projekt.worker_ids → [Benutzer.id]
Projekt.kategorie → Kategorie.id
Aufgabe.projekt_id → Projekt.id
Aufgabe.zugewiesen_an → Benutzer.id
WarenLog.projekt_id → Projekt.id
WarenLog.benutzer_id → Benutzer.id
WarenLog.ware_id → Ware.id
```

## 5. ФУНКЦИОНАЛЬНЫЕ МОДУЛИ

### 5.1 Dashboard

**Путь:** `pages/Dashboard`

**Функции:**
- Виджеты статистики (настраиваемые)
- Проекты по статусам (Pie chart)
- Ближайшие дедлайны
- Бюджет-обзор
- Последние активности

**Фильтрация по ролям:**
```javascript
// Admin, Projektleiter: все проекты
const projekte = await base44.entities.Projekt.list();

// Gruppenleiter: только где он в gruppenleiter_ids
const projekte = allProjekte.filter(p => 
  p.gruppenleiter_ids?.includes(benutzer.id)
);

// Worker: только где он в worker_ids
const projekte = allProjekte.filter(p => 
  p.worker_ids?.includes(benutzer.id)
);
```

**CRUD операции:** Read only

**Ограничения:** Нет

### 5.2 Anfragen (Заявки)

**Путь:** `pages/Anfragen`

**Доступ:** Admin, Büro

**Функции:**
- Список заявок (таблица)
- Поиск по kunde_name, kunde_email
- Фильтр по status
- Просмотр деталей заявки
- Редактирование status, notizen
- Создание проекта из заявки

**CRUD операции:**
- Create: Публичная форма `pages/AnfrageForm` (без авторизации)
- Read: Все заявки
- Update: status, notizen, projekt_id
- Delete: Нет функции

**Workflow создания проекта:**
```javascript
// 1. Открыть CreateProjectMinimal dialog
// 2. Префилл данными из anfrage:
//    - kunde_name → найти Kunde или создать
//    - kategorie, unterkategorie, antworten → в Projekt
//    - kunde_adresse → Projekt.adresse
// 3. Создать Projekt с anfrage_id
// 4. Обновить Anfrage: status="Abgeschlossen", projekt_id
// 5. Reload страницы
```

**Бизнес-правила:**
- Статусы: "Neu", "In Bearbeitung", "Angeboten", "Abgeschlossen", "Abgelehnt"
- При создании проекта статус → "Abgeschlossen"
- Двусторонняя связь: Anfrage.projekt_id ↔ Projekt.anfrage_id

### 5.3 Projekte (Проекты)

**Путь:** `pages/Projekte`, `pages/ProjektDetail`, `pages/ProjektNeu`, `pages/ProjektBearbeiten`

**Доступ:** Admin, Projektleiter, Gruppenleiter, Worker, Büro

**Функции:**
- Список проектов (grid cards)
- Создание проекта
- Редактирование проекта
- Удаление проекта (Admin, Projektleiter only)
- Детальный просмотр с табами:
  - Details (основная инфо)
  - Etappen (этапы)
  - Material (WarenLog)
  - Dokumente
  - Diskussion (Kommentar)
  - Bericht (PDF export)

**CRUD операции:**
- Create: Admin, Projektleiter, Büro
- Read: Все (с фильтрацией)
- Update: Admin, Projektleiter
- Delete: Admin, Projektleiter

**Фильтрация доступа:**
```javascript
// Admin, Projektleiter: все проекты
if (["Admin", "Projektleiter"].includes(position)) {
  projekte = await base44.entities.Projekt.list();
}

// Gruppenleiter
if (position === "Gruppenleiter") {
  projekte = allProjekte.filter(p => 
    p.gruppenleiter_ids?.includes(benutzer.id)
  );
}

// Worker
if (position === "Worker") {
  projekte = allProjekte.filter(p => 
    p.worker_ids?.includes(benutzer.id)
  );
}
```

**Автонумерация проектов:**
```javascript
const projekte = await base44.entities.Projekt.list();
const epNumbers = projekte
  .map(p => parseInt(p.projekt_nummer?.replace("EP-", "") || "0"))
  .filter(n => !isNaN(n));
const nextNumber = Math.max(1000, ...epNumbers) + 1;
const projekt_nummer = `EP-${nextNumber}`;
```

**Проверка прав на удаление:**
```javascript
if (!["Admin", "Projektleiter"].includes(benutzer.position)) {
  // Скрыть кнопку удаления
}
```

### 5.4 Aufgaben (Задачи)

**Путь:** `pages/Aufgaben`

**Доступ:** Все роли

**Функции:**
- Список задач
- Создание задачи
- Редактирование задачи
- Удаление задачи
- Фильтры: search, zugewiesen_an, status

**CRUD операции:**
- Create: Все
- Read: Все (с фильтрацией)
- Update: Все
- Delete: Все

**Фильтрация:**
```javascript
// Worker видит только свои задачи
if (benutzer.position === "Worker") {
  const meineAufgaben = aufgaben.filter(a => 
    a.zugewiesen_an === benutzer.id
  );
}

// Остальные видят все
```

### 5.5 Kategorien (Категории)

**Путь:** `pages/Kategorien`

**Доступ:** Admin, Projektleiter, Gruppenleiter, Büro, Warehouse

**Функции:**
- CRUD категорий и подкатегорий
- Настройка динамических полей (zusatzfelder)
- Иерархия: parent_id
- Тип категории: "Projekt" / "Ware"

**Структура zusatzfelder:**
```typescript
interface Zusatzfeld {
  name: string;          // field name (snake_case)
  label: string;         // display label
  type: "text" | "number" | "select" | "textarea" | "radio";
  options?: string[];    // для select/radio
  erforderlich: boolean; // required validation
}
```

**CRUD операции:**
- Create: Все с доступом
- Read: Все с доступом
- Update: Все с доступом
- Delete: Все с доступом

**Использование:**
- В AnfrageForm: генерация динамических полей
- В Projekt: сохранение ответов в zusatzfelder

### 5.6 Benutzer (Пользователи)

**Путь:** `pages/Benutzer`

**Доступ:** Все роли (разные уровни просмотра)

**Функции:**
- Список пользователей
- Создание пользователя
- Редактирование пользователя
- Удаление пользователя
- Генерация QR-кода

**CRUD операции:**
- Create: Admin
- Read: Все (разная детализация)
- Update: Admin
- Delete: Admin

**Уровни доступа:**
- Admin: полный CRUD
- Остальные: только просмотр списка (для выбора в назначениях)

### 5.7 Kunden (Клиенты)

**Путь:** `pages/Kunden`

**Доступ:** Admin, Projektleiter, Büro

**Функции:**
- CRUD клиентов
- Типы: "Firma" / "Privat"
- Поиск и фильтрация

**CRUD операции:**
- Create: Все с доступом (включая из CreateProjectMinimal)
- Read: Все с доступом
- Update: Все с доступом
- Delete: Все с доступом

### 5.8 Subunternehmer (Субподрядчики)

**Путь:** `pages/Subunternehmer`

**Доступ:** Admin, Projektleiter

**Функции:**
- CRUD субподрядчиков
- Связь с проектами через Projekt.subunternehmer_ids

**CRUD операции:**
- Create: Все с доступом
- Read: Все с доступом
- Update: Все с доступом
- Delete: Все с доступом

### 5.9 Waren (Склад)

**Путь:** `pages/Waren`

**Доступ:** Admin, Projektleiter, Gruppenleiter, Worker, Warehouse

**Функции:**
- CRUD товаров
- Поиск по barcode
- Статусы: "Verfügbar", "Niedrig", "Ausverkauft"
- Ручная корректировка bestand

**CRUD операции:**
- Create: Admin, Warehouse
- Read: Все с доступом
- Update: Admin, Warehouse
- Delete: Admin, Warehouse

**Автоматический расчёт status:**
```javascript
if (bestand <= 0) status = "Ausverkauft";
else if (bestand <= mindestbestand) status = "Niedrig";
else status = "Verfügbar";
```

### 5.10 Terminal (Складской терминал)

**Путь:** `pages/Terminal`

**Доступ:** Admin, Projektleiter, Gruppenleiter, Worker, Warehouse

**Функции:**
- Login через QR / выбор пользователя
- Сканирование barcode
- Выбор действия: Entnahme, Rückgabe, Eingang, Korrektur, Inventur
- Выбор проекта (опционально)
- Создание WarenLog

**Workflow:**
```javascript
// 1. Login
const benutzer = scanQR() || selectUser();

// 2. Scan товар
const ware = scanBarcode() || searchWare();

// 3. Выбор действия
const aktion = "Entnahme" | "Rückgabe" | "Eingang" | "Korrektur" | "Inventur";

// 4. Выбор проекта (если Entnahme/Rückgabe)
const projekt = selectProjekt(); // optional

// 5. Количество
const menge = inputNumber();

// 6. Создать WarenLog
await base44.entities.WarenLog.create({
  ware_id, ware_name,
  benutzer_id, benutzer_name,
  projekt_id, projekt_nummer,
  aktion, menge, notiz, datum: new Date()
});

// 7. Обновить Ware.bestand
if (aktion === "Entnahme") ware.bestand -= menge;
if (aktion === "Rückgabe") ware.bestand += menge;
if (aktion === "Eingang") ware.bestand += menge;
```

**CRUD операции:**
- WarenLog Create: Все с доступом
- Ware Update: bestand только

**Ограничения:** Layout отключён для Terminal (fullscreen app)

### 5.11 Protokoll (Журнал движения)

**Путь:** `pages/Protokoll`

**Доступ:** Admin, Büro, Warehouse

**Функции:**
- Просмотр всех WarenLog записей
- Фильтрация по: ware, benutzer, projekt, aktion, datum
- Сортировка по дате (desc)

**CRUD операции:**
- Read only
- Записи создаются через Terminal

### 5.12 LagerKassa (Кассы)

**Путь:** `pages/LagerKassa`

**Доступ:** Admin, Warehouse

**Функции:**
- CRUD касс
- Просмотр KassaSale
- Мониторинг статуса подключения

**CRUD операции:**
- Kassa: Create, Read, Update, Delete
- KassaSale: Read only (создаются webhook)

### 5.13 Support (Техподдержка)

**Путь:** `pages/Support`, `pages/SupportForm`

**Доступ:** Admin, Büro (обработка)

**Функции:**
- Просмотр тикетов
- Обработка тикетов
- Ответ на тикеты
- Изменение статуса

**CRUD операции:**
- Create: Публичная форма (без авторизации)
- Read: Admin, Büro
- Update: Admin, Büro (только antwort, status, bearbeiter_id)
- Delete: Нет функции

## 6. СПЕЦИАЛЬНЫЕ КОМПОНЕНТЫ

### 6.1 CreateProjectMinimal

**Путь:** `components/CreateProjectMinimal`

**Назначение:** Dialog создания проекта из заявки

**Workflow:**
1. Получает anfrage prop
2. Генерирует projekt_nummer
3. Ищет/создаёт клиента
4. Копирует данные из anfrage
5. Создаёт Projekt с anfrage_id
6. Обновляет Anfrage с projekt_id
7. Reload страницы

**Ключевые поля:**
```javascript
projektData = {
  projekt_nummer: "EP-XXXX", // auto
  name: string,
  kunde_id: string | null,
  anfrage_id: anfrage.id,
  kategorie: anfrage.kategorie,
  unterkategorie: anfrage.unterkategorie,
  zusatzfelder: anfrage.antworten,
  adresse: anfrage.kunde_adresse,
  beschreibung: string,
  status: "Geplant",
  prioritaet: "Mittel",
  startdatum: date | null,
  enddatum: date | null,
  budget: number | null
}
```

### 6.2 EtappenManager

**Путь:** `components/EtappenManager`

**Назначение:** CRUD этапов проекта с фотографиями

**Функции:**
- Создание этапов
- Загрузка фото (camera/gallery)
- Drag-and-drop сортировка
- Изменение статуса этапа

### 6.3 DokumentManager

**Путь:** `components/DokumentManager`

**Назначение:** Управление документами проекта

**Функции:**
- Upload файлов (base44.integrations.Core.UploadFile)
- Категоризация по типу
- Теги
- Архивирование

### 6.4 CommentThread

**Путь:** `components/CommentThread`

**Назначение:** Система комментариев

**Функции:**
- Создание комментариев с @mentions
- Markdown поддержка
- Replies (threads)
- Edit/Delete собственных комментариев

### 6.5 ProjectReport

**Путь:** `components/ProjectReport`

**Назначение:** Генерация PDF-отчёта

**Использует:** `functions/generateProjectReport`

**Backend function:**
```javascript
// functions/generateProjectReport.js
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  // Получить данные проекта, этапов, материалов
  // Сгенерировать PDF
  // Вернуть arraybuffer
  
  return new Response(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=projekt.pdf'
    }
  });
});
```

## 7. BACKEND FUNCTIONS

### 7.1 kassaWebhook

**Путь:** `functions/kassaWebhook`

**Назначение:** Webhook для приёма продаж от касс

**Аутентификация:** Service role (без user auth)

**Workflow:**
```javascript
// 1. Получить данные о продаже
const { kassa_id, ware_id, количество, сумма } = await req.json();

// 2. Валидация (signature verification если есть)

// 3. Создать KassaSale
await base44.asServiceRole.entities.KassaSale.create({
  kassa_id,
  kassa_name,
  ware_id,
  ware_name,
  количество,
  сумма,
  дата: new Date(),
  статус: "Ожидание"
});

// 4. Получить товар
const ware = await base44.asServiceRole.entities.Ware.filter({ id: ware_id });

// 5. Уменьшить bestand
ware[0].bestand -= количество;
await base44.asServiceRole.entities.Ware.update(ware_id, {
  bestand: ware[0].bestand
});

// 6. Проверить mindestbestand
if (ware[0].bestand <= ware[0].mindestbestand) {
  await base44.asServiceRole.entities.KassaSale.update(sale_id, {
    нужна_закупка: true
  });
}

// 7. Обновить статус продажи
await base44.asServiceRole.entities.KassaSale.update(sale_id, {
  статус: "Обработана",
  уменьшено_количество: true
});
```

### 7.2 generateProjectReport

**Назначение:** Генерация PDF-отчёта по проекту

**Аутентификация:** User auth required

**Workflow:**
1. Получить projekt_id из payload
2. Загрузить все данные проекта
3. Загрузить этапы с фотографиями
4. Загрузить материалы (WarenLog)
5. Сгенерировать HTML структуру
6. Конвертировать в PDF (jsPDF)
7. Вернуть PDF как arraybuffer

## 8. ОГРАНИЧЕНИЯ И ПРОВЕРКИ

### 8.1 Проверки на уровне UI

```javascript
// Layout.js - скрытие недоступных пунктов меню
const canAccessPage = (pagePath) => {
  if (!benutzer) return false;
  const position = benutzer.position;
  const allowedPages = accessMap[position] || [];
  return allowedPages.includes(pagePath);
};

// Только для разрешённых ролей показываем пункт меню
{canAccessPage(item.path) && (
  <Link to={createPageUrl(item.path)}>...</Link>
)}
```

### 8.2 Проверки на уровне страницы

```javascript
// Редирект на login при отсутствии сессии
useEffect(() => {
  const checkAuth = async () => {
    const sessionData = localStorage.getItem("benutzer_session");
    if (!sessionData || isExpired(sessionData)) {
      navigate(createPageUrl("BenutzerLogin"));
    }
  };
  checkAuth();
}, []);
```

### 8.3 Проверки на уровне действий

```javascript
// Удаление проекта
const handleDelete = async (projektId) => {
  if (!["Admin", "Projektleiter"].includes(benutzer.position)) {
    toast.error("Keine Berechtigung");
    return;
  }
  await base44.entities.Projekt.delete(projektId);
};

// Фильтрация данных по роли
const loadProjekte = async () => {
  const allProjekte = await base44.entities.Projekt.list();
  
  if (["Admin", "Projektleiter"].includes(benutzer.position)) {
    setProjekte(allProjekte);
  } else if (benutzer.position === "Gruppenleiter") {
    setProjekte(allProjekte.filter(p => 
      p.gruppenleiter_ids?.includes(benutzer.id)
    ));
  } else if (benutzer.position === "Worker") {
    setProjekte(allProjekte.filter(p => 
      p.worker_ids?.includes(benutzer.id)
    ));
  }
};
```

### 8.4 Backend проверки (для functions)

```javascript
// generateProjectReport.js
const base44 = createClientFromRequest(req);
const user = await base44.auth.me();

if (!user) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

// Admin-only function example
if (user.role !== 'admin') {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}
```

## 9. БИЗНЕС-ЛОГИКА

### 9.1 Workflow: Anfrage → Projekt

```
1. Клиент → AnfrageForm (публичная) → Anfrage entity (status: "Neu")
2. Büro → Anfragen page → открывает детали
3. Büro → "Projekt erstellen" → CreateProjectMinimal dialog
4. Dialog:
   - auto projekt_nummer (EP-XXXX)
   - найти/создать Kunde
   - префилл данными
   - сохранить
5. Создаётся Projekt:
   - anfrage_id = anfrage.id
   - все данные из anfrage
6. Обновляется Anfrage:
   - projekt_id = projekt.id
   - status = "Abgeschlossen"
7. Reload страницы
8. В Anfragen видно projekt_nummer
9. В ProjektDetail видно anfrage инфо
```

### 9.2 Workflow: Складские операции

```
Entnahme (взятие):
1. Worker → Terminal → login (QR)
2. Scan товар → выбор проекта
3. Указать количество
4. Создать WarenLog:
   - aktion: "Entnahme"
   - ware_id, benutzer_id, projekt_id
   - menge: -N
5. Обновить Ware:
   - bestand -= N
   - пересчитать status
6. В ProjektDetail видно в табе "Material"

Продажа (касса):
1. Клиент покупает → Касса → webhook
2. kassaWebhook function:
   - создать KassaSale
   - уменьшить Ware.bestand
   - проверить mindestbestand
   - флаг нужна_закупка
3. Warehouse → LagerKassa → видит alert
4. Warehouse → заказывает товар
5. Warehouse → Terminal → "Eingang" → увеличивает bestand
```

### 9.3 Автоматические расчёты

**Статус товара:**
```javascript
const calculateWareStatus = (bestand, mindestbestand) => {
  if (bestand <= 0) return "Ausverkauft";
  if (bestand <= mindestbestand) return "Niedrig";
  return "Verfügbar";
};
```

**Номер проекта:**
```javascript
const generateProjektNummer = async () => {
  const projekte = await base44.entities.Projekt.list();
  const numbers = projekte
    .map(p => parseInt(p.projekt_nummer.replace("EP-", "")))
    .filter(n => !isNaN(n));
  return `EP-${Math.max(1000, ...numbers) + 1}`;
};
```

## 10. ТЕХНИЧЕСКИЕ ДЕТАЛИ

### 10.1 Структура проекта

```
/pages
  Dashboard.js
  Anfragen.js
  AnfrageForm.js (публичная)
  Projekte.js
  ProjektDetail.js
  ProjektNeu.js
  ProjektBearbeiten.js
  Aufgaben.js
  Benutzer.js
  BenutzerLogin.js
  Kunden.js
  Subunternehmer.js
  Kategorien.js
  Waren.js
  Terminal.js
  Protokoll.js
  LagerDashboard.js
  LagerKassa.js
  LagerBenutzer.js
  Support.js
  SupportForm.js (публичная)

/components
  CreateProjectMinimal.jsx
  EtappenManager.jsx
  DokumentManager.jsx
  CommentThread.jsx
  CommentForm.jsx
  ProjectReport.jsx
  CameraPhotoUpload.jsx
  CategorySelector.jsx
  ProjektNeuDialog.jsx
  /DashboardWidgets
    ProjectStatusSummary.jsx
    UpcomingDeadlines.jsx
    BudgetOverview.jsx
    RecentActivity.jsx
    DashboardCustomizer.jsx
  /ui (shadcn components)

/functions
  kassaWebhook.js
  generateProjectReport.js

/entities (JSON schemas)
  Anfrage.json
  Projekt.json
  Kategorie.json
  Benutzer.json
  Kunde.json
  Subunternehmer.json
  Aufgabe.json
  Ware.json
  WarenLog.json
  Kassa.json
  KassaSale.json
  Etappe.json
  Dokument.json
  Kommentar.json
  Ticket.json

Layout.js (роутинг и права)
```

### 10.2 Base44 SDK использование

```javascript
import { base44 } from "@/api/base44Client";

// Read
const items = await base44.entities.EntityName.list();
const filtered = await base44.entities.EntityName.filter({ status: "active" });

// Create
const newItem = await base44.entities.EntityName.create(data);
const bulk = await base44.entities.EntityName.bulkCreate([data1, data2]);

// Update
await base44.entities.EntityName.update(id, changes);

// Delete
await base44.entities.EntityName.delete(id);

// Auth
const user = await base44.auth.me();
await base44.auth.updateMe(data);
await base44.auth.logout();

// Integrations
const { file_url } = await base44.integrations.Core.UploadFile({ file });

// Functions
const response = await base44.functions.invoke('functionName', params);
```

### 10.3 Навигация

```javascript
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const navigate = useNavigate();

// Переход на страницу
navigate(createPageUrl("Projekte"));

// С параметрами
navigate(createPageUrl("ProjektDetail?id=123"));

// Назад
navigate(-1);

// Link
<Link to={createPageUrl("PageName")}>Text</Link>
```

### 10.4 Состояние и кеширование

```javascript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Query
const { data, isLoading, error } = useQuery({
  queryKey: ['projekte'],
  queryFn: () => base44.entities.Projekt.list(),
  initialData: []
});

// Mutation
const queryClient = useQueryClient();
const createMutation = useMutation({
  mutationFn: (data) => base44.entities.Projekt.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['projekte'] });
  }
});
```

### 10.5 Уведомления

```javascript
import { toast } from "sonner";

toast.success("Erfolgreich gespeichert");
toast.error("Fehler beim Speichern");
toast.info("Bitte warten...");
toast.warning("Mindestbestand erreicht");
```

## 11. РЕЗЮМЕ

EP-System - комплексная админ-панель для строительной компании с:

**Ключевые особенности:**
- 6 ролей с гранулированным доступом
- 15 взаимосвязанных entities
- Двусторонняя связь Anfrage ↔ Projekt
- Динамические формы через Kategorie.zusatzfelder
- Складской учёт с Terminal и webhook интеграцией
- Проектное управление с этапами и документами
- PWA для offline работы
- Автоматизация: нумерация, статусы, bestand

**Архитектура:**
- Frontend: React + Tailwind + shadcn/ui
- Backend: Base44 BaaS + Deno Functions
- Auth: localStorage sessions (24h TTL)
- State: React Query
- Навигация: React Router

**Безопасность:**
- Роле-based access control (RBAC)
- UI-level проверки (скрытие элементов)
- Page-level проверки (редиректы)
- Action-level проверки (права на CRUD)
- Backend auth (для functions)

**Масштабируемость:**
- Модульная структура
- Переиспользуемые компоненты
- Настраиваемые widgets
- Расширяемая система ролей