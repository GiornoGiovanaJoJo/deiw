# EP-System - Construction Management Platform

## Overview
EP-System is a comprehensive web-based management platform for construction companies, providing project management, CRM, warehouse tracking, and team coordination in a unified interface.

## Quick Start

### Prerequisites
- Node.js 18+
- Base44 account
- Modern web browser

### Installation
```bash
# Clone repository
git clone <repository-url>
cd ep-system

# Install dependencies
npm install

# Run development server
npm run dev
```

### Access
- Admin Panel: `/Dashboard` (requires login)
- Customer Forms: `/AnfrageForm`, `/SupportForm` (public)
- Warehouse Terminal: `/Terminal` (QR code login)

## User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **Admin** | Full system access | All modules |
| **Projektleiter** | Project manager | Projects, team, customers, warehouse |
| **Gruppenleiter** | Team leader | Assigned projects, tasks, warehouse |
| **Worker** | Field worker | Own tasks/projects, warehouse terminal |
| **Büro** | Office staff | CRM, inquiries, customers, support |
| **Warehouse** | Inventory manager | Full warehouse, registers, logs |

## Module Overview

### 1. Dashboard (`/Dashboard`)
**Purpose**: Overview of key metrics and activities

**Access**: All roles (filtered by permissions)

**Features**:
- Project statistics (total, in progress, completed)
- Task counters (open, in progress, completed)
- Warehouse alerts (low stock)
- Budget overview
- Recent activities
- Upcoming deadlines
- Customizable widgets

**Functions**:
- `loadAllData()`: Fetches projects, tasks, users, warehouse items
- `loadWidgetVisibility()`: Restores widget preferences from localStorage
- `toggleWidget(widgetId)`: Shows/hides dashboard widgets

**Filters by Role**:
- Admin/Projektleiter: All projects
- Gruppenleiter: Projects where assigned as group leader
- Worker: Projects where assigned as worker

---

### 2. Anfragen (Inquiries) (`/Anfragen`)
**Purpose**: Manage customer inquiries and convert to projects

**Access**: Admin, Büro

**Features**:
- List all customer inquiries
- Search by customer name/email
- Filter by status
- View inquiry details
- Edit status and notes
- Create project from inquiry

**Functions**:
- `loadAnfragen()`: Fetch all inquiries with project numbers
- `handleRowClick(anfrage)`: Open inquiry detail dialog
- `handleSave()`: Update inquiry status/notes
- `openCreateProject(anfrage)`: Launch CreateProjectMinimal dialog
- Filter: By status (Neu, In Bearbeitung, Angeboten, Abgeschlossen, Abgelehnt)

**CRUD**:
- Create: Public form (`/AnfrageForm`)
- Read: All inquiries
- Update: status, notizen, projekt_id
- Delete: Not available

**Workflow**:
1. Customer submits inquiry via `/AnfrageForm`
2. Büro reviews in `/Anfragen`
3. Updates status as communication progresses
4. Clicks "Projekt erstellen" when ready
5. System creates project with anfrage_id link
6. Inquiry status → "Abgeschlossen"

---

### 3. AnfrageForm (`/AnfrageForm`)
**Purpose**: Public form for customers to submit inquiries

**Access**: Public (no authentication)

**Features**:
- Category selection (Elektrik, Sanitär, etc.)
- Subcategory selection
- Dynamic form fields based on category
- Customer information collection
- File upload support

**Functions**:
- `loadKategorien()`: Fetch categories for selection
- `handleKategorieChange(kat)`: Load subcategories
- `handleUnterkategorieChange(subkat)`: Load dynamic fields (zusatzfelder)
- `renderZusatzfeld(field)`: Generate form field based on type
- `handleSubmit()`: Create Anfrage entity

**Dynamic Fields**:
```javascript
// Renders based on Kategorie.zusatzfelder
field.type === "text" → <Input />
field.type === "number" → <Input type="number" />
field.type === "select" → <Select> with options
field.type === "textarea" → <Textarea />
field.type === "radio" → <RadioGroup> with options
```

**CRUD**:
- Create: Anfrage entity with status "Neu"

---

### 4. Projekte (`/Projekte`)
**Purpose**: List and manage all projects

**Access**: Admin, Projektleiter, Gruppenleiter, Worker, Büro

**Features**:
- Grid view of project cards
- Search by name/number
- Filter by status
- Quick actions (view, edit, delete)
- Create new project

**Functions**:
- `loadData()`: Fetch projects and customers
- `filteredProjekte()`: Filter by search and status with role-based access
- `handleDelete(id)`: Delete project (Admin/Projektleiter only)
- `getKundeName(kunde_id)`: Resolve customer name
- `canDeleteProject()`: Check deletion permissions

**Role-based Filtering**:
```javascript
Admin/Projektleiter → All projects
Gruppenleiter → p.gruppenleiter_ids.includes(benutzer.id)
Worker → p.worker_ids.includes(benutzer.id)
Büro → All projects
```

**CRUD**:
- Create: `/ProjektNeu`
- Read: All (with filtering)
- Update: `/ProjektBearbeiten`
- Delete: Admin/Projektleiter only

---

### 5. ProjektDetail (`/ProjektDetail?id=XXX`)
**Purpose**: Detailed project view with multiple tabs

**Access**: All with project access

**Features**:
- **Details Tab**: Project info, team, customer, dates, budget
- **Etappen Tab**: Project stages with photos (`EtappenManager`)
- **Material Tab**: Warehouse items used in project
- **Dokumente Tab**: Document management (`DokumentManager`)
- **Diskussion Tab**: Comments and discussions (`CommentThread`)
- **Bericht Tab**: PDF report generation (`ProjectReport`)

**Functions**:
- `loadProjectData()`: Fetch project, customer, team, materials
- `loadAnfrageInfo()`: Fetch linked inquiry if anfrage_id exists
- Tab switching with state management

**Displays**:
- Project status badge with color
- Priority indicator
- Anfrage information (if linked)
- Customer details
- Project leader and team members
- Subcontractors
- Material usage log
- All project stages
- All documents
- Comment threads

**CRUD**:
- Read: All project data
- Update: Via edit button → `/ProjektBearbeiten`

---

### 6. ProjektNeu (`/ProjektNeu`)
**Purpose**: Create new project

**Access**: Admin, Projektleiter, Büro

**Features**:
- Multi-step form (customer selection, project details)
- Auto-generate project number (EP-XXXX)
- Customer creation inline
- Category and subcategory selection
- Dynamic fields based on category
- Team assignment
- Budget and dates
- Photo upload (main + additional)

**Functions**:
- `generateNextProjektNummer()`: Auto-increment EP numbers
- `loadData()`: Fetch customers, categories, users, subcontractors
- `handleKundeChange()`: Switch between existing/new customer
- `handleKategorieChange()`: Load subcategories
- `handleUnterkategorieChange()`: Load zusatzfelder, fetch subcategory details
- `getZusatzfelder()`: Determine dynamic fields to render
- `handlePhotoUpload()`: Upload photos to Base44 storage
- `handleSave()`: Create Projekt entity, navigate to detail

**Auto-numbering**:
```javascript
const numbers = projekte.map(p => parseInt(p.projekt_nummer.replace("EP-", "")));
const next = Math.max(1000, ...numbers) + 1;
return `EP-${next}`;
```

**CRUD**:
- Create: Projekt entity

---

### 7. ProjektBearbeiten (`/ProjektBearbeiten?id=XXX`)
**Purpose**: Edit existing project

**Access**: Admin, Projektleiter

**Features**:
- Edit all project fields
- Update team assignments
- Change category (reloads dynamic fields)
- Upload/remove photos
- Auto-assign team members based on hierarchy

**Functions**:
- `loadProjekt()`: Fetch project data and populate form
- `loadData()`: Fetch customers, categories, users, subcontractors
- `handleProjektleiterChange()`: Auto-assign subordinates
- `handleGruppenleiterChange()`: Auto-assign workers under group leader
- `handleKategorieChange()`: Reload subcategories
- `handleUnterkategorieChange()`: Reload zusatzfelder
- `handlePhotoUpload()`: Add photos
- `removePhoto(url)`: Remove photo
- `handleSubmit()`: Update Projekt entity

**Auto-assignment Logic**:
```javascript
// When projektleiter selected → auto-add all subordinates
// When gruppenleiter selected → auto-add all workers under them
if (benutzer.vorgesetzter_id === projektleiter_id) {
  auto-add to gruppenleiter_ids
}
```

**CRUD**:
- Update: Projekt entity

---

### 8. Aufgaben (`/Aufgaben`)
**Purpose**: Task management

**Access**: All roles

**Features**:
- List all tasks (grid cards)
- Create task
- Edit task
- Delete task
- Filter by assignee, status
- Search by title

**Functions**:
- `loadData()`: Fetch tasks, projects, users
- `filteredAufgaben()`: Filter by search, assignee, status
- `handleCreate()`: Create new task
- `handleEdit(task)`: Edit existing task
- `handleDelete(id)`: Delete task
- `getProjektName(projekt_id)`: Resolve project name
- `getBenutzerName(benutzer_id)`: Resolve user name

**Role-based Filtering**:
```javascript
Worker → Only tasks assigned to self (zugewiesen_an === benutzer.id)
Others → All tasks
```

**CRUD**:
- Create: Aufgabe entity
- Read: All (with filtering)
- Update: All fields
- Delete: Yes

**Task Statuses**: Offen, In Bearbeitung, Erledigt, Storniert

---

### 9. Kategorien (`/Kategorien`)
**Purpose**: Manage categories and configure dynamic form fields

**Access**: Admin, Projektleiter, Gruppenleiter, Büro, Warehouse

**Features**:
- Create/edit categories and subcategories
- Hierarchical structure (parent_id)
- Category types: Projekt, Ware
- Configure zusatzfelder (dynamic fields)
- Set icons and colors

**Functions**:
- `loadKategorien()`: Fetch all categories
- `handleCreate(parent)`: Create category/subcategory
- `handleEdit(kat)`: Edit category
- `handleDelete(id)`: Delete category
- `handleAddZusatzfeld()`: Add dynamic field to category
- `handleRemoveZusatzfeld(index)`: Remove field

**Zusatzfeld Structure**:
```javascript
{
  name: "field_name",        // snake_case identifier
  label: "Display Label",    // Human-readable
  type: "text|number|select|textarea|radio",
  options: ["opt1", "opt2"], // For select/radio
  erforderlich: true|false   // Required validation
}
```

**Usage**:
- AnfrageForm: Generates form fields dynamically
- Projekt: Stores answers in zusatzfelder object

**CRUD**:
- Create: Kategorie entity
- Read: All
- Update: All fields including zusatzfelder
- Delete: Yes (if no dependencies)

---

### 10. Benutzer (`/Benutzer`)
**Purpose**: User/employee management

**Access**: All roles (Admin for CRUD)

**Features**:
- List all users
- Create user with QR code generation
- Edit user details
- Delete user
- Set role/position
- Assign supervisor (vorgesetzter_id)

**Functions**:
- `loadBenutzer()`: Fetch all users
- `generateQRCode(userId)`: Generate QR code for terminal login
- `handleCreate()`: Create new Benutzer
- `handleEdit(user)`: Edit user
- `handleDelete(id)`: Delete user

**CRUD**:
- Create: Admin only
- Read: All roles (for selection in assignments)
- Update: Admin only
- Delete: Admin only

**User Fields**:
- vorname, nachname, email
- position (Admin, Projektleiter, Gruppenleiter, Worker, Büro, Warehouse)
- spezialisierung (Elektriker, Schlosser, etc.)
- vorgesetzter_id (hierarchy)
- qr_code (for terminal)
- passwort (for admin panel login)

---

### 11. BenutzerLogin (`/BenutzerLogin`)
**Purpose**: Login page for admin panel

**Access**: Public

**Features**:
- Email + password authentication
- Session creation (localStorage, 24h TTL)
- Redirect to Dashboard on success

**Functions**:
- `handleLogin()`: Validate credentials, create session
- `createSession(benutzer)`: Store in localStorage

**Session Structure**:
```javascript
{
  id: "benutzer_id",
  timestamp: Date.now()
}
```

**Authentication Flow**:
1. User enters email + password
2. Query Benutzer entity by email
3. Compare password (plain text comparison)
4. Create session in localStorage
5. Redirect to Dashboard

---

### 12. Kunden (`/Kunden`)
**Purpose**: Customer management

**Access**: Admin, Projektleiter, Büro

**Features**:
- List customers
- Create customer (Firma or Privat)
- Edit customer details
- Delete customer
- Search and filter

**Functions**:
- `loadKunden()`: Fetch all customers
- `handleCreate()`: Create Kunde
- `handleEdit(kunde)`: Edit Kunde
- `handleDelete(id)`: Delete Kunde

**Customer Types**:
- **Firma** (Company): Business customers
- **Privat** (Private): Individual customers

**CRUD**:
- Create: All with access
- Read: All with access
- Update: All with access
- Delete: All with access

---

### 13. Subunternehmer (`/Subunternehmer`)
**Purpose**: Subcontractor management

**Access**: Admin, Projektleiter

**Features**:
- List subcontractors
- Create subcontractor
- Edit details
- Delete subcontractor
- Track specialization and hourly rate

**Functions**:
- `loadSubunternehmer()`: Fetch all subcontractors
- `handleCreate()`: Create Subunternehmer
- `handleEdit(sub)`: Edit Subunternehmer
- `handleDelete(id)`: Delete Subunternehmer

**CRUD**:
- Create: All with access
- Read: All with access
- Update: All with access
- Delete: All with access

---

### 14. Waren (`/Waren`)
**Purpose**: Warehouse inventory management

**Access**: Admin, Projektleiter, Gruppenleiter, Worker, Warehouse

**Features**:
- List all items with stock levels
- Create item
- Edit item details
- Manual stock adjustment
- Barcode management
- Low stock alerts

**Functions**:
- `loadWaren()`: Fetch all warehouse items
- `handleCreate()`: Create Ware
- `handleEdit(ware)`: Edit Ware
- `handleDelete(id)`: Delete Ware
- `calculateStatus(bestand, mindestbestand)`: Auto-status

**Status Calculation**:
```javascript
bestand <= 0 → "Ausverkauft"
bestand <= mindestbestand → "Niedrig"
else → "Verfügbar"
```

**CRUD**:
- Create: Admin, Warehouse
- Read: All with access
- Update: Admin, Warehouse
- Delete: Admin, Warehouse

---

### 15. Terminal (`/Terminal`)
**Purpose**: Mobile-optimized warehouse terminal

**Access**: Admin, Projektleiter, Gruppenleiter, Worker, Warehouse

**Features**:
- QR code login (no password)
- User selection login
- Barcode scanning
- Quick stock operations
- Project selection for material tracking

**Functions**:
- `handleLogin(benutzer)`: Set terminal session
- `scanBarcode()`: Find product by barcode
- `handleAction(aktion)`: Process warehouse operation
- `createWarenLog()`: Log transaction
- `updateWareBestand()`: Update stock

**Actions**:
- **Entnahme** (Take): Remove from stock for project
- **Rückgabe** (Return): Return unused items
- **Eingang** (Receive): Add new stock
- **Korrektur** (Correction): Fix stock errors
- **Inventur** (Inventory): Physical count
- **Verkauf** (Sale): Manual sale entry

**Workflow**:
```
1. Login (QR or select user)
2. Scan/search product
3. Select action
4. Enter quantity
5. Select project (if Entnahme/Rückgabe)
6. Add note (optional)
7. Confirm
8. Creates WarenLog + updates Ware.bestand
```

**Layout**: Fullscreen, no sidebar (optimized for tablets)

---

### 16. Protokoll (`/Protokoll`)
**Purpose**: Warehouse movement log

**Access**: Admin, Büro, Warehouse

**Features**:
- View all warehouse transactions
- Filter by product, user, project, action, date
- Export log data

**Functions**:
- `loadProtokoll()`: Fetch all WarenLog entries
- `filteredLog()`: Apply filters
- Filter fields: ware, benutzer, projekt, aktion, date range

**Display Fields**:
- Timestamp
- Product name
- User who performed action
- Action type
- Quantity
- Project (if applicable)
- Note

**CRUD**:
- Read only (created via Terminal)

---

### 17. LagerDashboard (`/LagerDashboard`)
**Purpose**: Warehouse overview and statistics

**Access**: Admin, Büro, Warehouse

**Features**:
- Total items count
- Low stock alerts
- Out of stock alerts
- Recent transactions
- Sales statistics (from Kassa)

**Functions**:
- `loadData()`: Fetch warehouse items, logs, sales
- `calculateStats()`: Compute metrics

**Widgets**:
- Stock status summary
- Low stock items list
- Recent movements
- Sales from registers

---

### 18. LagerKassa (`/LagerKassa`)
**Purpose**: Cash register management

**Access**: Admin, Warehouse

**Features**:
- List all cash registers
- Add/edit register
- View sales from each register
- Monitor connection status
- Low stock alerts from sales

**Functions**:
- `loadKassas()`: Fetch Kassa entities
- `loadSales()`: Fetch KassaSale entities
- `handleCreateKassa()`: Create register
- `handleEditKassa()`: Edit register details

**Register Fields**:
- name, kassa_nummer
- api_key (for webhook authentication)
- status (Подключена, Не подключена, Ошибка)
- последняя_синхронизация
- адрес (location)

**Sales Display**:
- Product sold
- Quantity
- Amount (€)
- Date/time
- Status (Обработана, Ожидание, Ошибка)
- Low stock flag (нужна_закупка)

**CRUD**:
- Kassa: Full CRUD
- KassaSale: Read only (webhook creates)

---

### 19. Support (`/Support`)
**Purpose**: Support ticket management

**Access**: Admin, Büro

**Features**:
- List all tickets
- View ticket details
- Assign to staff
- Add response
- Change status
- Filter by category, status, priority

**Functions**:
- `loadTickets()`: Fetch all Ticket entities
- `handleViewTicket(ticket)`: Open detail dialog
- `handleUpdateTicket()`: Update status, response, bearbeiter_id
- `filteredTickets()`: Apply search and filters

**Ticket Workflow**:
1. Customer submits via `/SupportForm`
2. Ticket created with status "Neu"
3. Büro/Admin assigns to staff
4. Status → "In Bearbeitung"
5. Staff writes response
6. Status → "Beantwortet"
7. Close ticket → "Geschlossen"

**CRUD**:
- Create: Public form
- Read: Admin, Büro
- Update: status, antwort, bearbeiter_id, prioritaet
- Delete: Not available

---

### 20. SupportForm (`/SupportForm`)
**Purpose**: Public form for support requests

**Access**: Public (no authentication)

**Features**:
- Submit support ticket
- Category selection
- Priority indication
- Contact information

**Functions**:
- `handleSubmit()`: Create Ticket entity with status "Neu"

**Fields**:
- betreff (subject)
- nachricht (message)
- absender_name, absender_email, absender_telefon
- kategorie (Anfrage, Support, Beschwerde, Sonstiges)
- prioritaet (Niedrig, Mittel, Hoch)

**CRUD**:
- Create: Ticket entity

---

### 21. LagerBenutzer (`/LagerBenutzer`)
**Purpose**: Warehouse-specific user view

**Access**: Admin, Büro, Warehouse

**Features**:
- View warehouse staff
- QR code generation
- Terminal access management

**Functions**:
- `loadWarehouseUsers()`: Filter Benutzer by position "Warehouse"
- Same as Benutzer page, filtered view

---

## Components

### CreateProjectMinimal
**Purpose**: Dialog to create project from inquiry

**Props**: `anfrage`, `onSuccess`, `onClose`

**Functions**:
- `generateProjektNummer()`: Auto EP-XXXX
- `findOrCreateKunde()`: Match or create customer
- `handleSave()`: Create Projekt + update Anfrage

**Workflow**:
```
1. Opens with anfrage data pre-filled
2. User can select existing customer or create new
3. Fills project details (name, dates, budget)
4. Saves:
   - Create Projekt with anfrage_id
   - Update Anfrage with projekt_id, status="Abgeschlossen"
5. Closes and refreshes parent page
```

---

### EtappenManager
**Purpose**: Manage project stages with photos

**Props**: `projektId`

**Functions**:
- `loadEtappen()`: Fetch Etappe entities
- `handleCreate()`: Create new stage
- `handleEdit()`: Edit stage
- `handleDelete()`: Delete stage
- `handlePhotoUpload()`: Add photos to stage
- `handleDragEnd()`: Reorder stages

**Features**:
- Drag-and-drop reordering
- Multiple photo upload per stage
- Status per stage (Geplant, In Bearbeitung, Abgeschlossen)
- Camera/gallery photo capture

---

### DokumentManager
**Purpose**: Document upload and management

**Props**: `projektId`

**Functions**:
- `loadDokumente()`: Fetch Dokument entities
- `handleUpload()`: Upload file via Base44.integrations.Core.UploadFile
- `handleDelete()`: Delete document
- `handleArchive()`: Change status to "Archiviert"

**Document Types**: Plan, Vertrag, Bericht, Rechnung, Sonstiges

**Features**:
- File upload with drag-and-drop
- Tag management
- Type categorization
- Archive functionality

---

### CommentThread
**Purpose**: Comments and discussions

**Props**: `entitaet_typ`, `entitaet_id`

**Functions**:
- `loadKommentare()`: Fetch Kommentar entities
- `handlePost()`: Create comment
- `handleEdit()`: Edit own comment
- `handleDelete()`: Delete own comment
- `handleReply()`: Reply to comment (parent_kommentar_id)

**Features**:
- Markdown rendering
- @mentions with user tagging
- Threaded replies
- Edit/delete own comments

---

### ProjectReport
**Purpose**: Generate PDF report

**Props**: `projektId`

**Functions**:
- `handleGeneratePDF()`: Call generateProjectReport function
- Downloads PDF with all project data

**PDF Contents**:
- Project details
- Customer information
- Team members
- All stage photos
- Material usage
- Document list
- Comments

---

### CameraPhotoUpload
**Purpose**: Capture photo from camera or gallery

**Props**: `onPhotoCapture(file)`

**Functions**:
- `handleCameraClick()`: Trigger camera input
- `handleGalleryClick()`: Trigger file input
- `handleFileChange()`: Process selected file
- `handleRemove()`: Clear selection

**Features**:
- Camera capture on mobile
- Gallery selection
- Image preview
- Remove before upload

---

### CategorySelector
**Purpose**: Hierarchical category picker

**Props**: `kategorien`, `selectedKategorie`, `onChange`

**Functions**:
- `renderCategories()`: Recursive category tree
- `handleSelect()`: Select category/subcategory

**Features**:
- Multi-level hierarchy
- Icon display
- Color coding
- Parent-child relationships

---

### ProjektNeuDialog
**Purpose**: Full project creation form (alternative to ProjektNeu page)

**Props**: `open`, `onClose`, `onSuccess`, `anfrage` (optional)

**Same as ProjektNeu** but in dialog format for inline creation

---

## Backend Functions

### kassaWebhook (`/functions/kassaWebhook.js`)
**Purpose**: Webhook endpoint for cash register sales

**Method**: POST

**Authentication**: Service role (no user auth required)

**Payload**:
```json
{
  "kassa_id": "string",
  "ware_id": "string",
  "количество": number,
  "сумма": number
}
```

**Process**:
1. Validate webhook (signature check if implemented)
2. Create KassaSale entity
3. Fetch Ware entity
4. Decrease Ware.bestand
5. Check mindestbestand
6. Set нужна_закупка flag if low
7. Update KassaSale status to "Обработана"

**Response**:
```json
{
  "success": true,
  "sale_id": "string"
}
```

**Error Handling**:
- Invalid kassa_id → 404
- Invalid ware_id → 404
- Insufficient stock → Warning flag, still processes
- Server error → 500

---

### generateProjectReport (`/functions/generateProjectReport.js`)
**Purpose**: Generate PDF report for project

**Method**: POST

**Authentication**: User auth required

**Payload**:
```json
{
  "projekt_id": "string"
}
```

**Process**:
1. Authenticate user
2. Fetch Projekt entity
3. Fetch related data:
   - Kunde
   - Benutzer (team)
   - Etappen with photos
   - WarenLog (materials)
   - Dokumente
4. Generate PDF with jsPDF
5. Return PDF as arraybuffer

**Response**: PDF file (Content-Type: application/pdf)

**PDF Structure**:
- Title: Project number and name
- Section: Project details
- Section: Customer information
- Section: Team members
- Section: Project stages with photos
- Section: Material usage table
- Section: Documents list
- Footer: Generated date

---

## API Routes Summary

### Public Routes (No Auth)
| Route | Method | Purpose |
|-------|--------|---------|
| `/AnfrageForm` | GET | Customer inquiry form |
| `/SupportForm` | GET | Support ticket form |

### Protected Routes (Auth Required)
| Route | Method | Purpose | Access |
|-------|--------|---------|--------|
| `/Dashboard` | GET | Main dashboard | All |
| `/Anfragen` | GET | Inquiry list | Admin, Büro |
| `/Projekte` | GET | Project list | All |
| `/ProjektDetail?id=X` | GET | Project details | Project members |
| `/ProjektNeu` | GET | Create project | Admin, Projektleiter, Büro |
| `/ProjektBearbeiten?id=X` | GET | Edit project | Admin, Projektleiter |
| `/Aufgaben` | GET | Task list | All |
| `/Benutzer` | GET | User management | All (CRUD: Admin) |
| `/BenutzerLogin` | GET | Login page | Public |
| `/Kunden` | GET | Customer list | Admin, Projektleiter, Büro |
| `/Subunternehmer` | GET | Subcontractor list | Admin, Projektleiter |
| `/Kategorien` | GET | Category management | Multiple roles |
| `/Waren` | GET | Warehouse items | Multiple roles |
| `/Terminal` | GET | Warehouse terminal | Multiple roles |
| `/Protokoll` | GET | Movement log | Admin, Büro, Warehouse |
| `/LagerDashboard` | GET | Warehouse dashboard | Admin, Büro, Warehouse |
| `/LagerKassa` | GET | Cash registers | Admin, Warehouse |
| `/LagerBenutzer` | GET | Warehouse users | Admin, Büro, Warehouse |
| `/Support` | GET | Support tickets | Admin, Büro |

### Function Routes
| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/functions/kassaWebhook` | POST | Receive sales | Webhook (Service) |
| `/api/functions/generateProjectReport` | POST | Generate PDF | User |

---

## Entity Schemas

### Anfrage
```json
{
  "kategorie": "string",
  "unterkategorie": "string",
  "kunde_name": "string",
  "kunde_email": "email",
  "kunde_telefon": "string",
  "kunde_adresse": "string",
  "antworten": "object",
  "status": "enum",
  "notizen": "string",
  "projekt_id": "string"
}
```

### Projekt
```json
{
  "projekt_nummer": "string (EP-XXXX)",
  "name": "string",
  "beschreibung": "string",
  "kunde_id": "string",
  "anfrage_id": "string",
  "projektleiter_id": "string",
  "gruppenleiter_ids": ["string"],
  "worker_ids": ["string"],
  "subunternehmer_ids": ["string"],
  "kategorie": "string",
  "unterkategorie": "string",
  "zusatzfelder": "object",
  "status": "enum",
  "startdatum": "date",
  "enddatum": "date",
  "budget": "number",
  "foto": "string",
  "fotos": ["string"],
  "adresse": "string",
  "prioritaet": "enum"
}
```

### Kategorie
```json
{
  "name": "string",
  "beschreibung": "string",
  "parent_id": "string",
  "typ": "enum (Projekt|Ware)",
  "farbe": "string",
  "icon_name": "string",
  "bild": "string",
  "zusatzfelder": [{
    "name": "string",
    "label": "string",
    "type": "enum",
    "options": ["string"],
    "erforderlich": "boolean"
  }]
}
```

### Benutzer
```json
{
  "vorname": "string",
  "nachname": "string",
  "email": "email",
  "position": "enum",
  "spezialisierung": "string",
  "vorgesetzter_id": "string",
  "telefon": "string",
  "qr_code": "string",
  "passwort": "string",
  "status": "enum",
  "foto": "string"
}
```

### Ware
```json
{
  "name": "string",
  "beschreibung": "string",
  "barcode": "string",
  "kategorie_id": "string",
  "einheit": "enum",
  "einkaufspreis": "number",
  "verkaufspreis": "number",
  "bestand": "number",
  "mindestbestand": "number",
  "lagerort": "string",
  "notizen": "string",
  "bild": "string",
  "status": "enum"
}
```

### WarenLog
```json
{
  "ware_id": "string",
  "ware_name": "string",
  "benutzer_id": "string",
  "benutzer_name": "string",
  "projekt_id": "string",
  "projekt_nummer": "string",
  "aktion": "enum",
  "menge": "number",
  "notiz": "string",
  "datum": "datetime"
}
```

For complete entity schemas, see `/entities/*.json` files.

---

## Development

### Adding a New Page
1. Create `/pages/NewPage.js`
2. Add route in router configuration
3. Update `accessMap` in `Layout.js`
4. Add menu item with role check

### Adding a New Role
1. Update `Benutzer.position` enum in entity schema
2. Add role to `accessMap` in `Layout.js`
3. Update role-based filtering in relevant pages
4. Test access restrictions

### Adding a New Entity
1. Create `/entities/NewEntity.json` with JSON schema
2. Use in pages: `base44.entities.NewEntity.list()`
3. Add CRUD operations as needed
4. Update TypeScript types if using

### Adding a Backend Function
1. Create `/functions/newFunction.js`
2. Use Deno.serve pattern
3. Import Base44 SDK: `npm:@base44/sdk@0.8.6`
4. Implement authentication check
5. Call from frontend: `base44.functions.invoke('newFunction', payload)`

---

## Testing

### Login as Different Roles
```javascript
// In browser console or via quick switch dropdown
localStorage.setItem("benutzer_session", JSON.stringify({
  id: "user_id_here",
  timestamp: Date.now()
}));
window.location.reload();
```

### Test Checklist
- [ ] Login flow
- [ ] Role-based menu visibility
- [ ] Data filtering by role
- [ ] CRUD permissions
- [ ] Anfrage → Projekt workflow
- [ ] Terminal operations
- [ ] Warehouse stock updates
- [ ] PDF report generation
- [ ] Mobile responsiveness

---

## Deployment

### Environment Variables
Set in Base44 dashboard:
- `BASE44_APP_ID` (auto-set)
- Any webhook secrets for kassa integration

### Build
```bash
npm run build
```

### Deploy
Base44 handles deployment automatically when you push to production.

---

## Support

For issues or questions:
1. Check technical documentation: `TECHNICAL_DOCUMENTATION.md`
2. Review system architecture: `SYSTEM_PROMPT.md`
3. Read project description: `PROJECT_DESCRIPTION.md`

---

## License

Proprietary - Construction Company Management System

---

## Credits

Built with:
- React + Tailwind CSS
- Base44 Platform
- shadcn/ui components
- Lucide Icons