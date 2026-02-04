/*
╔════════════════════════════════════════════════════════════════════════════════╗
║                      EP-SYSTEM - ПОЛНАЯ ТЕХНИЧЕСКАЯ ДОКУМЕНТАЦИЯ              ║
║                                                                                ║
║  Дата: 2026-02-02                                                             ║
║  Версия: 1.0.0 (Post-PWA & Mobile)                                            ║
║  Язык: Русский (для других ИИ)                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════════
1. ОБЗОР ПРОЕКТА
═══════════════════════════════════════════════════════════════════════════════════

EP-System — веб-приложение для управления строительными/ремонтными проектами.

ОСНОВНЫЕ ФУНКЦИИ:
  • Планирование и отслеживание проектов
  • Управление командой с иерархией (Admin > Projektleiter > Gruppenleiter > Worker)
  • Управление материалами и складом с трассируемостью
  • Работа с клиентами и документами
  • Командная коллаборация через комментарии и @mentions
  • Мобильный доступ через PWA (offline, install, push notifications)
  • Загрузка фото с камеры или галереи

СТЕК:
  Frontend: React 18, React Router, TailwindCSS, shadcn/ui
  Backend: Base44 BaaS (встроенная база данных)
  Icons: Lucide React
  Charts: Recharts
  Notifications: Sonner (toasts)
  Forms: react-hook-form, Zod
  State: TanStack React Query

═══════════════════════════════════════════════════════════════════════════════════
2. СУЩНОСТИ БД (ENTITIES)
═══════════════════════════════════════════════════════════════════════════════════

[PROJEKT] - ЦЕНТРАЛЬНАЯ СУЩНОСТЬ
──────────────────────────────────────────────────────────────────────────────────
Поля:
  projekt_nummer      string        "EP-1001" (уникален, генерируется автоматом)
  name               string         Название проекта
  beschreibung       string         Описание
  kunde_id           string         Ссылка на Kunde
  projektleiter_id   string         Руководитель проекта
  gruppenleiter_ids  string[]       Группенлайтеры
  worker_ids         string[]       Рабочие
  subunternehmer_ids string[]       Подрядчики
  kategorie          string         ID категории (parent)
  unterkategorie     string         ID подкатегории
  zusatzfelder       object         Динамические поля по категории
  status             enum           "Geplant" | "In Bearbeitung" | "Abgeschlossen" | "Pausiert" | "Storniert"
  prioritaet         enum           "Niedrig" | "Mittel" | "Hoch" | "Kritisch"
  startdatum         date
  enddatum           date
  budget             number         €
  adresse            string
  foto               string         URL (основное фото)
  fotos              string[]       URLs (доп фото)

Связи:
  ← Kunde (через kunde_id)
  ← Benutzer (projektleiter_id, gruppenleiter_ids, worker_ids)
  ← Subunternehmer (через subunternehmer_ids)
  → Etappe (many, projekt_id)
  → Aufgabe (many, projekt_id)
  → Dokument (many, projekt_id)
  → Kommentar (many, entitaet_id + entitaet_typ="Projekt")
  → WarenLog (many, projekt_id опционально)

Создание: ProjektNeu (2 шага) → UploadFile для фото
Редактирование: ProjektBearbeiten
Просмотр: ProjektDetail (tabs: Details, Etappen, Materialien, Dokumente, Diskussion, Bericht)


[BENUTZER] - СОТРУДНИКИ
──────────────────────────────────────────────────────────────────────────────────
Поля:
  vorname           string         Имя
  nachname          string         Фамилия
  email             string         E-mail
  position          enum           "Admin" | "Projektleiter" | "Gruppenleiter" | "Worker" | "Warehouse" | "Büro"
  spezialisierung   string         Специальность (для Worker)
  vorgesetzter_id   string         ID начальника (иерархия!)
  telefon           string
  qr_code           string         QR для Terminal
  passwort          string         Пароль (важно: хешируется!)
  status            enum           "Aktiv" | "Inaktiv"
  foto              string         URL профиля

Иерархия (vorgesetzter_id):
  Admin → все
  Projektleiter → видит свои Gruppenleiter'ов и Worker'ов
  Gruppenleiter → видит только своих Worker'ов
  Worker → видит только себя
  
Управление: Benutzer страница
Переключение в тестах: localStorage "benutzer_session" → switch user dropdown в Layout


[AUFGABE] - ЗАДАЧА
──────────────────────────────────────────────────────────────────────────────────
Поля:
  titel              string         Название
  beschreibung       string
  projekt_id         string         Ссылка на Projekt
  projekt_nummer     string         "EP-1001" (для быстрого доступа)
  zugewiesen_an      string         Benutzer ID (кому назначена)
  zugewiesen_name    string         Имя для быстрого доступа
  status             enum           "Offen" | "In Bearbeitung" | "Erledigt" | "Storniert"
  prioritaet         enum           "Niedrig" | "Mittel" | "Hoch" | "Kritisch"
  faellig_am         date           Дедлайн

Видимость:
  Admin/Büro → все
  Projektleiter → свои проекты
  Gruppenleiter → задачи своих Worker'ов
  Worker → только свои

Управление: Aufgaben страница (список, фильтры, CRUD в modal)
Комментарии: CommentThread на задачах


[ETAPPE] - ФАЗА ПРОЕКТА
──────────────────────────────────────────────────────────────────────────────────
Поля:
  projekt_id        string         Ссылка на Projekt
  name              string         Название фазы
  beschreibung      string
  bilder            string[]       Фото этапа
  status            enum           "Geplant" | "In Bearbeitung" | "Abgeschlossen"
  reihenfolge       number         Сортировка

Управление: EtappenManager компонент на ProjektDetail
Комментарии: CommentThread на этапах


[KOMMENTAR] - КОММЕНТАРИИ & ОБСУЖДЕНИЕ
──────────────────────────────────────────────────────────────────────────────────
Поля:
  entitaet_typ      enum           "Projekt" | "Etappe" | "Aufgabe" | "Dokument"
  entitaet_id       string         ID сущности (Projekt ID, Aufgabe ID и т.д.)
  inhalt            string         Текст комментария
  benutzer_id       string         Автор (Benutzer ID)
  benutzer_name     string         Имя автора
  parent_kommentar_id string       (для ответов, вложенные комментарии)
  mentions          array          [{ benutzer_id, benutzer_name }, ...]

Функции (@mention):
  1. При вводе @ в CommentForm → фильтрация списка пользователей
  2. Выбор пользователя → добавление в mentions массив
  3. При отображении → @name выделяется и ссылается
  4. Уведомления (потенциально): пользователь видит что его упомянули

Вложенные ответы (replies):
  1. Кнопка "Reply" на комментарии
  2. parent_kommentar_id = ID того комментария
  3. CommentThread рекурсивно рендерит replies

Удаление:
  - Только автор или админ
  - Soft delete (остается в БД, но скрыто)

Компоненты:
  - CommentThread: отображение + управление
  - CommentForm: создание комментариев


[WARE] - ТОВАР/МАТЕРИАЛ
──────────────────────────────────────────────────────────────────────────────────
Поля:
  name              string         Название
  barcode           string         EAN/штрих-код (УНИКАЛЕН!)
  kategorie_id      string         Ссылка на Kategorie
  einheit           enum           "Stk" | "kg" | "m" | "l" | "m²" | "m³" | "Set"
  einkaufspreis     number         Цена покупки
  verkaufspreis     number         Цена продажи
  bestand           number         Текущий уровень (количество)
  mindestbestand    number         Минимум (для оповещений)
  lagerort          string         Место на складе
  status            enum           "Verfügbar" | "Niedrig" | "Ausverkauft"
  bild              string         URL товара

Статус меняется автоматом:
  bestand >= mindestbestand → "Verfügbar"
  bestand < mindestbestand → "Niedrig"
  bestand <= 0 → "Ausverkauft"

Управление: Waren страница (CRUD)


[WARENLOG] - ИСТОРИЯ МАТЕРИАЛОВ (ЛОГИРОВАНИЕ)
──────────────────────────────────────────────────────────────────────────────────
Поля:
  ware_id           string         Ссылка на Ware
  ware_name         string         Имя для быстрого доступа
  benutzer_id       string         Кто выполнил действие
  benutzer_name     string
  projekt_id        string         Какой проект (опционально)
  projekt_nummer    string         "EP-1001"
  aktion            enum           "Entnahme" | "Rückgabe" | "Eingang" | "Korrektur" | "Inventur"
  menge             number         Количество
  notiz             string         Примечание
  datum             datetime       Когда (автоматом = now)

Использование:
  1. Terminal страница → сканирование QR → создание WarenLog
  2. Entnahme (выемка) → bestand уменьшается
  3. Rückgabe (возврат) → bestand увеличивается
  4. Eingang (приход) → увеличение + инвентаризация
  5. Protokoll страница → просмотр всей истории


[KATEGORIE] - КАТЕГОРИЯ ПРОЕКТОВ/ТОВАРОВ
──────────────────────────────────────────────────────────────────────────────────
Поля:
  name              string         Название
  beschreibung      string
  parent_id         string         Для иерархии (подкатегории)
  typ               enum           "Projekt" | "Ware"
  farbe             string         Hex color (#1e40af)
  zusatzfelder      array          Динамические поля для подкатегорий:
                                   [
                                     { name, label, type: "text|number|select", options: [] }
                                   ]

Использование:
  1. При выборе категории проекта → загружаются подкатегории (parent_id = kategorie_id)
  2. При выборе подкатегории → показываются zusatzfelder
  3. zusatzfelder сохраняются в projekt.zusatzfelder = { field1: value }

Управление: Kategorien страница


[DOKUMENT] - ДОКУМЕНТ
──────────────────────────────────────────────────────────────────────────────────
Поля:
  projekt_id        string         Ссылка на Projekt
  titel             string
  beschreibung      string
  typ               enum           "Plan" | "Vertrag" | "Bericht" | "Rechnung" | "Sonstiges"
  datei_url         string         URL файла (загружено через UploadFile)
  datei_name        string         Исходное имя файла
  datei_groesse     number         Размер в байтах
  tags              string[]       Теги для поиска
  status            enum           "Aktiv" | "Archiviert"

Управление: DokumentManager компонент на ProjektDetail


[KUNDE] - КЛИЕНТ
──────────────────────────────────────────────────────────────────────────────────
Поля:
  typ               enum           "Firma" | "Privat"
  firma             string         Имя компании
  ansprechpartner   string         Контактное лицо
  email             string
  telefon           string
  adresse           string
  plz               string         Почтовый индекс
  stadt             string         Город
  notizen           string
  status            enum           "Aktiv" | "Inaktiv"

Управление: Kunden страница


[SUBUNTERNEHMER] - ПОДРЯДЧИК
──────────────────────────────────────────────────────────────────────────────────
Поля:
  firma             string         Компания
  ansprechpartner   string
  email             string
  telefon           string
  adresse           string
  spezialisierung   string         "Elektriker", "Schlosser" и т.д.
  status            enum           "Aktiv" | "Inaktiv"
  stundensatz       number         Часовая ставка

Использование: ProjektNeu/ProjektBearbeiten → выбор субподрядчиков
Управление: Subunternehmer страница


[TICKET] - СИСТЕМА ПОДДЕРЖКИ
──────────────────────────────────────────────────────────────────────────────────
Поля:
  betreff           string         Тема
  nachricht         string         Сообщение от клиента
  absender_name     string
  absender_email    string
  absender_telefon  string
  kategorie         enum           "Anfrage" | "Support" | "Beschwerde" | "Sonstiges"
  status            enum           "Neu" | "In Bearbeitung" | "Beantwortet" | "Geschlossen"
  prioritaet        enum           "Niedrig" | "Mittel" | "Hoch"
  bearbeiter_id     string         Кто обрабатывает
  antwort           string         Ответ

Управление: Support страница


═══════════════════════════════════════════════════════════════════════════════════
3. РОЛЕВОЙ КОНТРОЛЬ ДОСТУПА (ACL)
═══════════════════════════════════════════════════════════════════════════════════

Определено в: Layout.js → canAccessMenu() + canAccessPage()

РОЛИ И ДОСТУП:
──────────────────────────────────────────────────────────────────────────────────

[ADMIN]
  Доступ: КСЕ (полный доступ)
  Может: видеть, редактировать, удалять любые данные

[PROJEKTLEITER] - Руководитель проекта
  Доступ: Dashboard, Aufgaben, Benutzer, Kunden, Projekte, Kategorien
  Видит: только свои проекты и подчиненных
  Может: создавать проекты, управлять своей командой

[GRUPPENLEITER] - Руководитель группы
  Доступ: Dashboard, Aufgaben, Benutzer, Projekte
  Видит: только своих Worker'ов
  Может: назначать задачи подчиненным

[WORKER] - Рабочий
  Доступ: Dashboard, Aufgaben, Projekte, Benutzer
  Видит: только свои задачи и свои проекты
  Может: обновлять статус своих задач, участвовать в комментариях

[BÜRO] - Офисный сотрудник
  Доступ: Dashboard, Aufgaben, Benutzer, Kunden, Projekte, Support, Kategorien, 
          LagerDashboard, Protokoll, LagerBenutzer
  Может: управлять клиентами, документами, поддержкой

[WAREHOUSE] - Сотрудник склада
  Доступ: Dashboard, Aufgaben, Benutzer, Kategorien, LagerDashboard, Waren, 
          Terminal, Protokoll, LagerBenutzer
  Может: управлять товарами, сканировать QR, вести логирование материалов

ИЕРАРХИЯ ВИДИМОСТИ (vorgesetzter_id):
──────────────────────────────────────────────────────────────────────────────────
  Admin → видит всех
  Projektleiter → видит своих Gruppenleiter'ов и Worker'ов (рекурсивно)
  Gruppenleiter → видит только своих Worker'ов
  Worker → видит только себя

На Aufgaben странице это фильтруется через getVisibleUsers()


═══════════════════════════════════════════════════════════════════════════════════
4. ОСНОВНЫЕ СТРАНИЦЫ (PAGES)
═══════════════════════════════════════════════════════════════════════════════════

[LAYOUT.js] - ГЛАВНЫЙ КОНТЕЙНЕР
──────────────────────────────────────────────────────────────────────────────────
  Компоненты:
    - Боковая панель (Sidebar) → основная навигация
    - Меню: Allgemein (общее), Lager (складское)
    - Top Bar → breadcrumb + пользователь
    - PWAInstallPrompt → предложение установки
  
  Функции:
    - loadUser() → загрузка текущего пользователя из localStorage
    - switchUser() → переключение пользователя (для тестирования)
    - canAccessPage() → проверка доступа по ролям
    - toggleSection() → сворачивание/разворачивание меню
    - handleLogout() → выход
  
  Состояние:
    - user → текущий пользователь (Base44)
    - benutzer → текущий сотрудник (Benutzer entity)
    - mobileOpen → открыто ли меню на мобильной версии
    - expandedSections → какие разделы раскрыты
  
  Responsive:
    - На мобильной: меню скрывается, появляется burger menu
    - На desktop: боковая панель всегда видна


[DASHBOARD] - ГЛАВНАЯ ПАНЕЛЬ
──────────────────────────────────────────────────────────────────────────────────
  Виджеты:
    1. ProjectStatusSummary (пирог) → диаграмма статусов
    2. UpcomingDeadlines (таблица) → задачи в 14-дневном окне
    3. BudgetOverview (карточки) → проверка бюджета
    4. RecentActivity (таблица) → последние действия
  
  Функции:
    - DashboardCustomizer → кнопка для выбора видимых виджетов
    - localStorage → сохранение настроек
  
  Вычисляемые значения:
    - stats → количество проектов по статусам
    - active tasks → задачи со статусом "In Bearbeitung"


[PROJEKTE] - СПИСОК ПРОЕКТОВ
──────────────────────────────────────────────────────────────────────────────────
  Функции:
    - Поиск по названию
    - Фильтр по статусу
    - Карточки проектов:
      - Название, номер (EP-XXXX), клиент
      - Статус (цветной badge), приоритет
      - Даты (start - end)
      - Аватары назначенных людей
      - Dropdown: View, Edit, Delete
  
  Фильтрация по ролям:
    - Projektleiter → видит только свои проекты
    - Gruppenleiter → видит проекты где он есть
    - Worker → видит проекты где он назначен
    - Admin/Büro → видят все
  
  Действия:
    - Клик на карточку → ProjektDetail
    - Edit → ProjektBearbeiten
    - Delete → удаление (с подтверждением)


[PROJEKTNEU] - СОЗДАНИЕ ПРОЕКТА (2 ШАГА)
──────────────────────────────────────────────────────────────────────────────────
  Шаг 1: Выбор/создание клиента
    - Select из существующих клиентов
    - Или форма для создания нового:
      * Firma (обязателен)
      * Ansprechpartner
      * Email
      * Telefon
    - Кнопка "Weiter" → переход на шаг 2
  
  Шаг 2: Данные проекта
    - Базовая информация:
      * Projektnummer (автоматом)
      * Name (обязателен)
      * Beschreibung (textarea)
      * Status, Priorität (select)
    - Категория & подкатегории:
      * Выбор kategorie → загрузка детей (parent_id filter)
      * Выбор unterkategorie → отображение zusatzfelder
      * Динамические поля (text/number/select)
    - Персонал:
      * Projektleiter (select)
      * Gruppenleiter/Worker (checkboxes или multiselect)
      * Subunternehmer (toggle cards)
    - Даты:
      * Startdatum, Enddatum (date inputs)
    - Финансы:
      * Budget (number), Adresse (text)
    - Фото:
      * Hauptfoto: CameraPhotoUpload компонент
      * Weitere Fotos: несколько фото с камеры/галереи
  
  Сохранение:
    - Валидация обязательных полей
    - Создание Projekt в БД
    - Redirect на Projekte
  
  Компоненты:
    - CameraPhotoUpload (новый) → снимок с камеры или загрузка из галереи


[PROJEKTDETAIL] - ПОЛНАЯ ИНФОРМАЦИЯ ПРОЕКТА
──────────────────────────────────────────────────────────────────────────────────
  Tabs (по выбору):
    1. Details
       - Основная инфо (name, beschreibung, kunde, projektleiter)
       - Статус, приоритет, даты, бюджет
       - Адрес и контакты
       - Фото основное (большой размер)
       - Галерея доп фото
    
    2. Etappen
       - EtappenManager компонент
       - Добавление новых этапов
       - Список этапов с фото
       - Статус, описание
       - CRUD операции
    
    3. Materialien
       - WarenLog таблица (история использования)
       - Фильтр по типу действия (Entnahme, Rückgabe и т.д.)
       - Таблица: материал, количество, действие, дата, пользователь
    
    4. Dokumente
       - DokumentManager компонент
       - Загрузка файлов
       - Список документов с типом и тегами
       - Удаление/архивирование
    
    5. Diskussion
       - CommentThread компонент
       - Вся история обсуждений проекта
       - @mentions для привлечения людей
       - Вложенные ответы
    
    6. Bericht
       - ProjectReport компонент
       - Визуализация прогресса
       - График статусов этапов
       - Бюджет и расходы
       - Кнопка экспорта в PDF
  
  Заголовок:
    - Фото проекта (small)
    - Название + номер
    - Статус (colored badge)
    - Приоритет (colored badge)
    - Действия: Edit, Delete, More


[PROJEKTBEARBEITEN] - РЕДАКТИРОВАНИЕ ПРОЕКТА
──────────────────────────────────────────────────────────────────────────────────
  Все то же самое что в ProjektNeu, но:
    - Форма предзаполнена из БД
    - Редактирование существующего проекта
    - Переход на ProjektDetail после сохранения


[AUFGABEN] - УПРАВЛЕНИЕ ЗАДАЧАМИ
──────────────────────────────────────────────────────────────────────────────────
  Список с фильтрами:
    - Поиск по названию
    - Фильтр по статусу (select)
    - Фильтр по пользователю (select)
    
    Видимость пользователей зависит от иерархии:
      Admin/Büro → все пользователи
      Projektleiter → его Worker'ы
      Gruppenleiter → его Worker'ы
      Worker → сам себе
  
  Таблица задач:
    - Название
    - Проект (ссылка на EP-XXXX)
    - Статус (colored badge)
    - Приоритет (colored badge)
    - Назначен на (имя пользователя)
    - Дедлайн (красный если past)
    - Dropdown: Edit, Delete
  
  Modal форма (создание/редактирование):
    - Titel, Beschreibung
    - Projekt (select)
    - Zugewiesen an (select из доступных)
    - Status, Priorität
    - Fällig am (date)
    - Сохранить/Отмена
  
  CommentThread:
    - На каждой задаче можно комментировать


[BENUTZER] - УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ
──────────────────────────────────────────────────────────────────────────────────
  Таблица пользователей:
    - Имя (vorname + nachname)
    - Должность (position)
    - Email
    - Телефон
    - Начальник (vorgesetzter_id)
    - Статус (active/inactive)
    - Действия: Edit, Delete
  
  Modal форма:
    - Vorname, Nachname (обязательны)
    - Email, Passwort
    - Position (select)
    - Spezialisierung (для Worker)
    - Telefon
    - Vorgesetzter (select)
    - QR Code (если есть)
    - Status
    - Фото (загрузка)


[KUNDEN] - УПРАВЛЕНИЕ КЛИЕНТАМИ
──────────────────────────────────────────────────────────────────────────────────
  CRUD таблица:
    - Компания/Имя
    - Контактное лицо
    - Email, Телефон
    - Адрес
    - Статус
    - Действия


[KATEGORIEN] - УПРАВЛЕНИЕ КАТЕГОРИЯМИ
──────────────────────────────────────────────────────────────────────────────────
  Иерархия:
    - Родительские категории (без parent_id)
    - Подкатегории (parent_id = родителя)
  
  Для каждой категории:
    - Name, beschreibung
    - Typ (Projekt или Ware)
    - Farbe
    - Zusatzfelder (для подкатегорий):
      * Редактор полей (add/remove)
      * Каждое поле: name, label, type, options


[WAREN] - УПРАВЛЕНИЕ ТОВАРАМИ
──────────────────────────────────────────────────────────────────────────────────
  Таблица товаров:
    - Название
    - Barcode (уникален)
    - Einheit (стк, кг, м и т.д.)
    - Bestand (текущий уровень)
    - Mindestbestand
    - Цены (покупка/продажа)
    - Статус (Verfügbar/Niedrig/Ausverkauft)
    - Действия: Edit, Delete
  
  CRUD форма:
    - Name (обязателен)
    - Barcode (обязателен, проверка уникальности)
    - Kategorie
    - Einheit
    - Цены, уровни запасов
    - Lagerort (место на складе)
    - Фото товара


[TERMINAL] - СКАНИРОВАНИЕ QR КОДОВ
──────────────────────────────────────────────────────────────────────────────────
  Специальная страница (БЕЗ Layout):
    - Полный экран (для планшета на складе)
  
  Функции:
    1. Сканирование штрих-кода товара
       → Поиск в Ware по barcode
       → Отображение товара (название, foto, einheit, bestand)
    
    2. Выбор действия:
       - Entnahme (выемка)
       - Rückgabe (возврат)
       - Eingang (приход)
    
    3. Ввод количества
    
    4. Опциональная привязка к проекту (select)
    
    5. Подтверждение
       → Создание WarenLog записи
       → Обновление bestand в Ware
       → Toast уведомление
  
  Дизайн: большие кнопки и шрифты для сенсорного взаимодействия


[LAGERDASHBOARD] - ПАНЕЛЬ УПРАВЛЕНИЯ СКЛАДОМ
──────────────────────────────────────────────────────────────────────────────────
  Виджеты:
    1. Товары с низким уровнем запасов
    2. Недавние операции со складом
    3. Статистика по категориям
    4. Ссылки на основные операции


[PROTOKOLL] - ИСТОРИЯ ОПЕРАЦИЙ СО СКЛАДОМ
──────────────────────────────────────────────────────────────────────────────────
  Таблица WarenLog с фильтрами:
    - Дата операции
    - Товар
    - Действие (Entnahme, Rückgabe и т.д.)
    - Количество
    - Проект (если привязан)
    - Пользователь


[SUPPORT] - СИСТЕМА ТИКЕТОВ
──────────────────────────────────────────────────────────────────────────────────
  Таблица Ticket'ов:
    - Тема
    - От (email клиента)
    - Статус
    - Приоритет
    - Назначен на (Benutzer)
    - Действия
  
  Modal просмотра/ответа:
    - Исходное сообщение
    - Поле для ответа
    - Смена статуса


[BENUTZERLLOGIN] - ВХОД
──────────────────────────────────────────────────────────────────────────────────
  Специальная страница (БЕЗ Layout):
  
  Функции:
    - Вход по Email + Passwort
    - Проверка в Benutzer entity
    - Сохранение в localStorage ("benutzer_session")
    - Redirect на Dashboard


═══════════════════════════════════════════════════════════════════════════════════
5. ПЕРЕИСПОЛЬЗУЕМЫЕ КОМПОНЕНТЫ (COMPONENTS)
═══════════════════════════════════════════════════════════════════════════════════

[CommentThread] - ОТОБРАЖЕНИЕ КОММЕНТАРИЕВ
──────────────────────────────────────────────────────────────────────────────────
  Props:
    - entityType: "Projekt" | "Aufgabe" | "Etappe" | "Dokument"
    - entityId: string
  
  Функции:
    - Загрузка комментариев (filter по entitaet_typ + entitaet_id)
    - Отображение top-level комментариев
    - Рекурсивное отображение replies (parent_kommentar_id)
    - Кнопка "Reply" на каждом комментарии
    - Удаление комментариев (только автор или админ)
  
  Структура отображения:
    - Аватар автора + имя
    - Timestamp
    - Текст с выделением @mentions
    - Кнопки: Reply, Delete (если автор/админ)
    - Вложенные replies (indented)
  
  Использование:
    - ProjektDetail (tab Diskussion)
    - Aufgaben (на каждой задаче)


[CommentForm] - ФОРМА ДОБАВЛЕНИЯ КОММЕНТАРИЕВ
──────────────────────────────────────────────────────────────────────────────────
  Props:
    - entityType: string
    - entityId: string
    - parentCommentId?: string (для ответов)
    - onCommentCreated: function (callback после создания)
  
  Функции:
    - Textarea для ввода текста
    - @mention suggestions:
      * При @ → фильтрация списка Benutzer'ов
      * Выбор пользователя → вставка @name
      * Добавление в mentions массив
    - Отправка (send button)
    - Отмена (cancel button)
    - Валидация (не пустой текст)
  
  Компоненты:
    - @mention tags выводятся отдельно
    - Toast notifications (success/error)


[CameraPhotoUpload] - ЗАГРУЗКА ФОТО 🆕
──────────────────────────────────────────────────────────────────────────────────
  Props:
    - onPhotoCapture: (base64, file) => void
    - disabled?: boolean
  
  Функции:
    - Кнопка "Kamera" → capture="environment" (задняя камера)
    - Кнопка "Galerie" → стандартный file picker
    - Кнопка "Löschen" → удаление текущего фото
  
  Состояние:
    - preview: base64 preview текущего фото
  
  Вывод:
    - Превью выбранного фото (если есть)
    - Кнопки выше
  
  Использование:
    - ProjektNeu → для Hauptfoto и Weitere Fotos
    - ProjektBearbeiten (аналогично)
    - Любая форма где нужны фото с камеры


[PWAInstallPrompt] - ПРЕДЛОЖЕНИЕ УСТАНОВКИ ПВА 🆕
──────────────────────────────────────────────────────────────────────────────────
  Функции:
    - Слушает beforeinstallprompt событие
    - Проверяет если app уже установлен (display-mode: standalone)
    - Показывает промпт с кнопками "Установить" и "Не сейчас"
    - Вызывает deferredPrompt.prompt() при клике
    - Слушает appinstalled событие → скрывает промпт
  
  Дизайн:
    - Плавающий prompt внизу страницы
    - Responsive (адаптируется к мобильному/desktop)
  
  Использование:
    - Layout (главный контейнер) → показывается везде


[EtappenManager] - УПРАВЛЕНИЕ ЭТАПАМИ
──────────────────────────────────────────────────────────────────────────────────
  Props:
    - projektId: string
  
  Функции:
    - Список этапов (отсортированы по reihenfolge)
    - Добавление новой этапы (modal форма)
    - Редактирование (inline или modal)
    - Удаление (с подтверждением)
    - Загрузка фото (для каждого этапа)
  
  Использование:
    - ProjektDetail (tab Etappen)


[DokumentManager] - УПРАВЛЕНИЕ ДОКУМЕНТАМИ
──────────────────────────────────────────────────────────────────────────────────
  Props:
    - projektId: string
  
  Функции:
    - Список документов
    - Загрузка новых файлов
    - Удаление документов
    - Фильтр по типу (Plan, Vertrag и т.д.)
    - Архивирование
  
  Использование:
    - ProjektDetail (tab Dokumente)


[ProjectReport] - ОТЧЕТ ПО ПРОЕКТУ
──────────────────────────────────────────────────────────────────────────────────
  Props:
    - projektId: string
  
  Функции:
    - Загрузка всех данных проекта (Etappen, Dokumente, WarenLog, Kunde)
    - Визуализация:
      * Статус и приоритет (badges)
      * Прогресс этапов (progress bar)
      * Диаграмма статусов (пирог)
      * Бюджет и расходы (cards)
      * Таблица этапов
    - Экспорт в PDF
      * Использует html2canvas + jsPDF
      * Скачивание файла
  
  Использование:
    - ProjektDetail (tab Bericht)


[DashboardCustomizer] - ВЫБОР ВИДИМЫХ ВИДЖЕТОВ
──────────────────────────────────────────────────────────────────────────────────
  Функции:
    - Modal с чекбоксами для каждого виджета
    - Save → localStorage
    - Cancel
  
  Виджеты:
    - ProjectStatusSummary
    - UpcomingDeadlines
    - BudgetOverview
    - RecentActivity
  
  Использование:
    - Dashboard (шестеренка в заголовке)


[Dashboard Widgets] (Components/DashboardWidgets/)
──────────────────────────────────────────────────────────────────────────────────
  1. ProjectStatusSummary
     - Pie chart статусов проектов
  
  2. UpcomingDeadlines
     - Таблица задач в 14-дневном окне
  
  3. BudgetOverview
     - Cards: Total Budget, Spent, Remaining
     - Progress bar
  
  4. RecentActivity
     - Таблица последних действий


═══════════════════════════════════════════════════════════════════════════════════
6. FEATURE: СИСТЕМА КОММЕНТАРИЕВ 🆕
═══════════════════════════════════════════════════════════════════════════════════

КОГДА БЫЛА ДОБАВЛЕНА:
  - В середине разработки
  - Интегрирована в ProjektDetail и Aufgaben

АРХИТЕКТУРА:
──────────────────────────────────────────────────────────────────────────────────
  Entity: Kommentar (см выше)
  
  Компоненты:
    1. CommentThread (отображение)
    2. CommentForm (создание)
  
  Интеграция:
    - ProjektDetail → tab "Diskussion"
    - Aufgaben → inline на каждой задаче

ФУНКЦИИ:
──────────────────────────────────────────────────────────────────────────────────
  1. Основные комментарии
     - Привязка к сущности (entitaet_typ + entitaet_id)
     - Автор (benutzer_id + benutzer_name)
     - Timestamp (автоматом created_date)
  
  2. @mentions
     - При вводе @ в CommentForm → suggestions
     - Выбор пользователя → добавление в mentions[]
     - При отображении → выделение и ссылка на профиль (потенциально)
     - Потенциально: push notifications упомянутому пользователю
  
  3. Вложенные ответы (Replies)
     - Кнопка "Reply" на комментарии
     - parent_kommentar_id = ID родительского комментария
     - Рекурсивный рендеринг (indent)
     - Можно ответить на ответ (многоуровневое)
  
  4. Удаление
     - Только автор или админ (check: benutzer_id == current_user.id || role == Admin)
     - Soft delete (скрыто, но остается в БД)
  
  5. Уведомления
     - Toast при успешном создании
     - Потенциально: email/push при @mention


ПРИМЕР ИСПОЛЬЗОВАНИЯ В КОДЕ:
──────────────────────────────────────────────────────────────────────────────────
  // На ProjektDetail
  <CommentThread
    entityType="Projekt"
    entityId={projektId}
  />
  
  // На Aufgaben
  <CommentThread
    entityType="Aufgabe"
    entityId={aufgabeId}
  />


═══════════════════════════════════════════════════════════════════════════════════
7. FEATURE: PWA & МОБИЛЬНАЯ ПОДДЕРЖКА 🆕
═══════════════════════════════════════════════════════════════════════════════════

PWA КОМПОНЕНТЫ:
──────────────────────────────────────────────────────────────────────────────────
  1. Service Worker (public/service-worker.js)
     - Network-first стратегия
     - Offline кэширование
     - Push notifications
  
  2. manifest.json
     - App метаданные
     - Icons (SVG)
     - Shortcuts (Dashboard, Projekte)
     - Display: standalone
  
  3. PWAInstallPrompt компонент
     - Показывает beforeinstallprompt
     - Кнопка "Установить" → prompt()
     - Проверка установки


SERVICE WORKER ФУНКЦИИ:
──────────────────────────────────────────────────────────────────────────────────
  install:
    - Кэширование основных assets
    - skipWaiting (активация без перезагрузки)
  
  activate:
    - Очистка старых кэшей
    - clients.claim() (контроль клиентов сразу)
  
  fetch:
    - Network-first стратегия:
      1. Пытаемся fetch с сервера
      2. Если успех → кэшируем и возвращаем
      3. Если ошибка → возвращаем из кэша
      4. Если нет в кэше → ошибка "Offline"
  
  push:
    - Слушает push события
    - Показывает notification с title + body
    - Опционально: действия (actions)
  
  notificationclick:
    - При клике на notification → открыть app


МОБИЛЬНАЯ ОПТИМИЗАЦИЯ:
──────────────────────────────────────────────────────────────────────────────────
  1. CameraPhotoUpload компонент
     - Снимок с камеры (capture="environment")
     - Загрузка из галереи
     - Предпросмотр
  
  2. Адаптивная сетка
     - grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
     - Автоматическое переформатирование
  
  3. Размеры шрифтов
     - @media (max-width: 1024px) → 16px (prevent zoom)
  
  4. Сенсорные кнопки
     - Минимум 44x44px для удобства
  
  5. Плавающее меню
     - На мобильной: burger menu (сворачивается)
     - На desktop: боковая панель (всегда видна)
  
  6. Padding/margin
     - sm: → smaller padding на мобильной
     - lg: → larger padding на desktop


═══════════════════════════════════════════════════════════════════════════════════
8. ТЕХНИЧЕСКИЙ СТЕК И ЗАВИСИМОСТИ
═══════════════════════════════════════════════════════════════════════════════════

FRONTEND ФРЕЙМВОРК:
  - React 18 (ui library)
  - React Router v6 (page navigation)
  - TailwindCSS (styling)
  - shadcn/ui (prebuilt components)

UI КОМПОНЕНТЫ (shadcn/ui):
  - Button, Input, Label, Textarea, Select
  - Card, Badge, Dialog, Tabs, Dropdown Menu
  - Alert Dialog, Checkbox, Radio, Switch
  - Popover, Tooltip, Scroll Area

ИКОНКИ И ВИЗУАЛИЗАЦИЯ:
  - Lucide React (icons)
  - Recharts (graphs and charts)
  - html2canvas + jsPDF (PDF export)

ФОРМЫ И ВАЛИДАЦИЯ:
  - react-hook-form (form state management)
  - Zod (schema validation)

СОСТОЯНИЕ И КЭШИРОВАНИЕ:
  - TanStack React Query (data fetching & caching)

УВЕДОМЛЕНИЯ:
  - Sonner (toast notifications)

УТИЛИТЫ:
  - date-fns (date formatting)
  - lodash (utility functions)
  - tailwind-merge (class merging)
  - clsx (conditional classnames)

BACKEND:
  - Base44 SDK (@base44/sdk v0.8.6)
    * Entities CRUD
    * Authentication
    * Integrations

ИНТЕГРАЦИИ:
  - Core.UploadFile (file upload)
  - Core.GenerateImage (AI image generation)
  - Core.InvokeLLM (AI prompt execution)


═══════════════════════════════════════════════════════════════════════════════════
9. ОСНОВНЫЕ РАБОЧИЕ ПРОЦЕССЫ (WORKFLOWS)
═══════════════════════════════════════════════════════════════════════════════════

WORKFLOW 1: СОЗДАНИЕ И УПРАВЛЕНИЕ ПРОЕКТОМ
──────────────────────────────────────────────────────────────────────────────────
  1. Перейти на Projekte → нажать "Neues Projekt"
  2. Выбрать существующего клиента или создать нового
  3. Заполнить данные проекта (name, budget, dates и т.д.)
  4. Выбрать категорию → загрузятся подкатегории
  5. Если подкатегория имеет zusatzfelder → заполнить их
  6. Назначить Projektleiter и других сотрудников
  7. Загрузить фото (с камеры или галереи через CameraPhotoUpload)
  8. Сохранить → создание Projekt в БД
  
  Результат: новый проект видится в Projekte списке

  Дальнейшее управление:
  - Нажать на проект → ProjektDetail
  - Вкладка "Etappen" → добавить фазы работ
  - Вкладка "Dokumente" → загрузить планы, контракты
  - Вкладка "Diskussion" → обсудить через комментарии
  - Вкладка "Materialien" → видеть использованные материалы
  - Вкладка "Bericht" → сгенерировать PDF отчет


WORKFLOW 2: УПРАВЛЕНИЕ ЗАДАЧАМИ
──────────────────────────────────────────────────────────────────────────────────
  1. Перейти на Aufgaben
  2. Поиск/фильтр по проекту, статусу, пользователю
  3. Нажать "Новая задача" → modal форма
  4. Заполнить: название, проект, назначить на пользователя, дату
  5. Сохранить
  
  Работа над задачей:
  - Видеть статус (Offen, In Bearbeitung, Erledigt)
  - Менять статус через dropdown
  - Комментировать задачу (CommentThread)
  - @mention коллег для привлечения внимания
  
  Видимость:
  - Admin/Büro видят все
  - Projektleiter видят свои проекты
  - Worker видят только свои
  - Gruppenleiter видят своих Worker'ов


WORKFLOW 3: УПРАВЛЕНИЕ СКЛАДОМ
──────────────────────────────────────────────────────────────────────────────────
  A. Добавление товара:
    1. Waren страница → "Новый товар"
    2. Название, barcode (обязателен, должен быть уникален)
    3. Цена, einheit, минимум запасов
    4. Сохранить
  
  B. Выемка материала (на складе):
    1. Перейти на Terminal (планшет на складе)
    2. Сканировать barcode товара → поиск по Ware
    3. Выбрать действие "Entnahme"
    4. Ввести количество
    5. Привязать к проекту (опционально)
    6. Подтвердить → создается WarenLog запись
    → bestand уменьшается на это количество
  
  C. Возврат материала:
    1. Terminal
    2. Сканировать barcode
    3. Действие "Rückgabe"
    4. Ввести количество
    5. Подтвердить → bestand увеличивается
  
  D. Приход товаров:
    1. Terminal
    2. Действие "Eingang"
    3. Сканировать несколько товаров или вручную выбрать
    4. Ввести количество поступившего
    5. Подтвердить
  
  E. Просмотр истории:
    1. Protokoll страница
    2. Таблица WarenLog со всеми операциями
    3. Фильтр по дате, товару, действию


WORKFLOW 4: СИСТЕМА КОММЕНТАРИЕВ И ОБСУЖДЕНИЙ
──────────────────────────────────────────────────────────────────────────────────
  1. На ProjektDetail → вкладка "Diskussion"
  2. Увидеть историю комментариев (CommentThread)
  3. Написать новый комментарий (CommentForm)
  4. При вводе @ → выбрать пользователя (suggestion)
  5. Отправить
  
  Ответы на комментарии:
  - Нажать "Reply" на комментарии
  - Написать ответ
  - Отправить → создается с parent_kommentar_id
  
  Удаление:
  - Только автор или админ может удалить
  - Нажать X → удалить из списка
  
  Уведомления:
  - @mention → потенциально push notification
  - Toast при успешном создании


WORKFLOW 5: PWA ИСПОЛЬЗОВАНИЕ
──────────────────────────────────────────────────────────────────────────────────
  1. Открыть EP-System в браузере
  2. Внизу страницы → PWAInstallPrompt
  3. Нажать "Установить"
  4. Подтвердить в браузере
  5. App устанавливается на экран
  
  Offline использование:
  - Service Worker кэширует assets
  - Если нет интернета → приложение работает с кэшем
  - При восстановлении → синхронизация с сервером
  
  Notifications:
  - Если установлена PWA → могут приходить push notifications
  - Например: "Новая задача назначена тебе"


═══════════════════════════════════════════════════════════════════════════════════
10. ВАЖНЫЕ ДЕТАЛИ РЕАЛИЗАЦИИ
═══════════════════════════════════════════════════════════════════════════════════

АУТЕНТИФИКАЦИЯ И СЕССИЯ:
──────────────────────────────────────────────────────────────────────────────────
  1. Base44 встроенная аутентификация:
     - base44.auth.me() → текущий пользователь (User entity)
     - Используется для проверки входа
  
  2. Локальная сессия Benutzer:
     - localStorage "benutzer_session" = { id, timestamp }
     - Используется для переключения между пользователями (для тестирования!)
     - TTL: 24 часа
  
  3. BenutzerLogin:
     - Email + Passwort → поиск в Benutzer entity
     - Сохранение session в localStorage
     - Проверка в Layout (если нет сессии → редирект на login)


ДИНАМИЧЕСКИЕ ПОЛЯ (ZUSATZFELDER):
──────────────────────────────────────────────────────────────────────────────────
  1. Определены в Kategorie:
     zusatzfelder: [
       { name: "feld1", label: "Label", type: "text" | "number" | "select", options: [] }
     ]
  
  2. При выборе подкатегории в ProjektNeu:
     - getZusatzfelder() → возвращает дополнительные поля
     - Показываются в форме (text/number/select)
  
  3. При сохранении:
     - Все значения сохраняются в projekt.zusatzfelder объект
     - Например: zusatzfelder = { feld1: "value1", feld2: 123 }


ИЕРАРХИЯ И ВИДИМОСТЬ:
──────────────────────────────────────────────────────────────────────────────────
  1. Структура (vorgesetzter_id):
     ```
     Admin
     ├─ Projektleiter
     │  ├─ Gruppenleiter
     │  │  └─ Worker
     │  └─ Worker
     └─ Büro/Warehouse
     ```
  
  2. Видимость контактов:
     function getVisibleUsers(currentUser, allUsers):
       if currentUser.position == "Admin" → return all
       if currentUser.position == "Projektleiter":
         → return allUsers.filter(u => u.vorgesetzter_id == current.id OR я являюсь их начальником)
       if currentUser.position == "Gruppenleiter":
         → return только Worker'ов где currentUser.id == vorgesetzter_id
       else → return [currentUser]
  
  3. Проверка доступа к странице:
     if !canAccessPage(currentPageName, currentUser.position) → скрыть


ФОТО И МЕДИА:
──────────────────────────────────────────────────────────────────────────────────
  1. CameraPhotoUpload компонент:
     - Input capture="environment" → задняя камера на мобильной
     - Input type="file" accept="image/*" → галерея
     - Сохранение как base64 (preview)
     - Или загрузка через UploadFile интеграцию
  
  2. В ProjektNeu:
     - Hauptfoto: одно основное фото (замена)
     - Weitere Fotos: несколько фото (добавление)
     - Массив fotos хранит URL'ы
  
  3. Отображение:
     - img tag с src={foto}
     - grid-cols-2 sm:grid-cols-3 для галереи
  
  4. Удаление:
     - Кнопка X → removePhoto(index) → splice из массива


УВЕДОМЛЕНИЯ И FEEDBACK:
──────────────────────────────────────────────────────────────────────────────────
  1. Toast уведомления (Sonner):
     toast.success("Проект создан") → зеленое сообщение
     toast.error("Ошибка при загрузке") → красное сообщение
     toast.loading("Сохранение...") → spinner
  
  2. Модальные диалоги (shadcn/ui):
     <Dialog> компонент для форм и подтверждений
  
  3. Alert диалоги:
     AlertDialog для деструктивных действий (удаление)


СОСТОЯНИЕ И ЛОГИКА:
──────────────────────────────────────────────────────────────────────────────────
  1. React Query (TanStack):
     - useQuery('tasks') → загрузка и кэширование
     - useMutation() → создание/обновление
     - invalidateQueries() → пересинхронизация
  
  2. React State (useState):
     - Локальное состояние формы
     - Модальные окна (open/close)
     - Фильтры и поиск
  
  3. URL параметры (useSearchParams):
     - Проект ID в URL
     - Сохранение фильтров в URL


═══════════════════════════════════════════════════════════════════════════════════
11. ВОЗМОЖНЫЕ УЛУЧШЕНИЯ И РАСШИРЕНИЯ
═══════════════════════════════════════════════════════════════════════════════════

ФУНКЦИОНАЛЬНЫЕ:
  ✓ Push notifications (браузер + мобильная)
  ✓ Real-time синхронизация комментариев (WebSocket/SSE)
  ✓ Экспорт отчетов (Excel, Word, CSV)
  ✓ Email уведомления при @mention
  ✓ Календарь проектов/задач
  ✓ Интеграции (Slack, Google Calendar, Microsoft Teams)
  ✓ Mobile Native App (React Native)
  ✓ OCR для документов
  ✓ Система уведомлений (внутренняя)
  ✓ Система прав доступа (более гибкая)
  ✓ Версионирование документов

ТЕХНИЧЕСКИЕ:
  ✓ GraphQL вместо REST
  ✓ Offline-first sync (Replicache или подобное)
  ✓ Шифрование конфиденциальных данных
  ✓ Аудит логирование (кто, что, когда изменил)
  ✓ Кэширование на IndexedDB
  ✓ Batch operations для массовых изменений

UX:
  ✓ Dark mode
  ✓ Кастомизируемые dashboards (drag & drop)
  ✓ Булк импорт (CSV -> Projekte)
  ✓ Интеграция с картами (Google Maps)
  ✓ Timeline визуализация проектов
  ✓ Ресурсная планирование (Gantt chart)


═══════════════════════════════════════════════════════════════════════════════════
12. ДЛЯ НОВЫХ РАЗРАБОТЧИКОВ: ПОШАГОВАЯ ИНСТРУКЦИЯ
═══════════════════════════════════════════════════════════════════════════════════

1. ИЗУЧИТЬ АРХИТЕКТУРУ:
   а) Прочитать entities выше (понять структуру данных)
   б) Посмотреть Layout.js (основной контейнер и ACL)
   в) Изучить несколько Pages (Dashboard, Projekte)

2. ПОНЯТЬ ACL (РОЛЕВОЙ КОНТРОЛЬ):
   а) canAccessMenu() → какие меню видит пользователь
   б) canAccessPage() → доступ к страницам
   в) getVisibleUsers() на Aufgaben → иерархия контактов

3. ИЗУЧИТЬ КОМПОНЕНТЫ:
   а) CommentThread + CommentForm → как работает обсуждение
   б) CameraPhotoUpload → как загружать фото
   в) EtappenManager → CRUD operations на связанные сущности

4. БАЗОВЫЕ ОПЕРАЦИИ:
   а) Создание entity: await base44.entities.Projekt.create(data)
   б) Получение: await base44.entities.Projekt.list()
   в) Обновление: await base44.entities.Projekt.update(id, data)
   г) Удаление: await base44.entities.Projekt.delete(id)

5. ДОБАВИТЬ НОВУЮ СТРАНИЦУ:
   а) Создать pages/NewPage.js (React компонент)
   б) Добавить в Layout menuItems
   в) Добавить проверку доступа в canAccessPage()
   г) Использовать переиспользуемые компоненты и Entities SDK

6. ДОБАВИТЬ НОВУЮ СУЩНОСТЬ:
   а) Создать entities/NewEntity.json (JSON schema)
   б) Использовать base44.entities.NewEntity.* везде в коде
   в) Добавить ACL проверки где нужно

7. СТИЛИЗАЦИЯ:
   а) Использовать TailwindCSS classses
   б) shadcn/ui компоненты (Button, Card, Dialog и т.д.)
   г) Lucide иконки для визуализации
   д) Responsive: sm: lg: prefixes для адаптивности


═══════════════════════════════════════════════════════════════════════════════════

Дата создания: 2026-02-02
Версия документации: 1.0.0
Язык: Русский (для других ИИ и разработчиков)

═══════════════════════════════════════════════════════════════════════════════════
*/

export default function SystemDocumentation() {
  return (
    <div className="p-8 bg-slate-50">
      <h1 className="text-4xl font-bold mb-4">📚 EP-System Техническая Документация</h1>
      <p className="text-xl text-slate-600 mb-6">
        Эта документация находится в комментариях этого файла. Откройте исходный код для полного описания системы.
      </p>
      <div className="bg-white rounded-lg p-6 border border-slate-200">
        <h2 className="text-2xl font-semibold mb-4">Основные разделы документации:</h2>
        <ul className="space-y-2 text-slate-700">
          <li>✅ Обзор проекта (стек, функции)</li>
          <li>✅ Сущности БД (Projekt, Benutzer, Aufgabe, Kommentar и т.д.)</li>
          <li>✅ Ролевой контроль доступа (ACL)</li>
          <li>✅ Основные страницы приложения</li>
          <li>✅ Переиспользуемые компоненты</li>
          <li>✅ Система комментариев 🆕</li>
          <li>✅ PWA & мобильная поддержка 🆕</li>
          <li>✅ Технический стек и зависимости</li>
          <li>✅ Основные рабочие процессы</li>
          <li>✅ Важные детали реализации</li>
          <li>✅ Возможные улучшения</li>
          <li>✅ Инструкция для новых разработчиков</li>
        </ul>
      </div>
    </div>
  );
}