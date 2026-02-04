# EP-System - System Architecture Prompt

## Overview
You are working on EP-System - a comprehensive construction company management platform built with React, Base44 BaaS, and Deno Functions.

## Technology Stack

### Frontend
- **Framework**: React 18.2.0
- **Routing**: React Router DOM 6.26.0
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React 0.475.0
- **State Management**: @tanstack/react-query 5.84.1
- **Forms**: react-hook-form 7.54.2
- **Date Handling**: date-fns 3.6.0
- **Markdown**: react-markdown 9.0.1
- **Drag & Drop**: @hello-pangea/dnd 17.0.0
- **Rich Text**: react-quill 2.0.0
- **PDF Generation**: jspdf 4.0.0
- **Animations**: framer-motion 11.16.4

### Backend
- **BaaS**: Base44 Platform (@base44/sdk 0.8.3)
- **Functions Runtime**: Deno Deploy
- **Authentication**: Base44 Auth + Custom Benutzer entity
- **Storage**: Base44 Storage
- **Database**: Base44 Entities (NoSQL)

### Key Packages
```json
{
  "@base44/sdk": "^0.8.3",
  "@tanstack/react-query": "^5.84.1",
  "react-router-dom": "^6.26.0",
  "lucide-react": "^0.475.0",
  "tailwindcss": "latest",
  "date-fns": "^3.6.0",
  "react-hook-form": "^7.54.2",
  "jspdf": "^4.0.0"
}
```

## Architecture Pattern

### 1. Entity-Driven Architecture
All data is stored in Base44 entities (JSON schema definitions in `/entities/*.json`):
- Anfrage (customer inquiries)
- Projekt (projects)
- Kategorie (categories with dynamic fields)
- Benutzer (users/employees)
- Kunde (customers)
- Subunternehmer (subcontractors)
- Aufgabe (tasks)
- Ware (warehouse items)
- WarenLog (warehouse movement log)
- Kassa (cash registers)
- KassaSale (sales from registers)
- Etappe (project stages)
- Dokument (documents)
- Kommentar (comments)
- Ticket (support tickets)

### 2. Role-Based Access Control (RBAC)
Roles stored in `Benutzer.position`:
- **Admin**: Full access
- **Projektleiter**: Project management, team coordination
- **Gruppenleiter**: Team leader, assigned projects only
- **Worker**: Assigned tasks and projects only
- **Büro**: Office, CRM, inquiries
- **Warehouse**: Inventory management

Access control implemented in:
- `Layout.js`: Menu visibility based on `accessMap`
- Page level: Session checks and redirects
- Action level: Permission checks before CRUD operations

### 3. Authentication System
Two parallel auth systems:
1. **Base44 Auth** (admin panel):
   - Email + password from Benutzer entity
   - Session in localStorage: `{ id, timestamp }` (24h TTL)
   - Check: `localStorage.getItem("benutzer_session")`

2. **QR/Quick Auth** (terminal):
   - QR code scanning
   - User selection list
   - No password required

### 4. File Structure
```
/pages
  - Dashboard.js (home page, role-based widgets)
  - Anfragen.js (inquiry management, Büro/Admin)
  - AnfrageForm.js (PUBLIC: customer form)
  - Projekte.js (project list)
  - ProjektDetail.js (tabs: details, stages, materials, docs, comments, report)
  - ProjektNeu.js (create project)
  - ProjektBearbeiten.js (edit project)
  - Aufgaben.js (tasks)
  - Benutzer.js (users)
  - BenutzerLogin.js (login page)
  - Kunden.js (customers)
  - Subunternehmer.js (subcontractors)
  - Kategorien.js (categories + dynamic fields)
  - Waren.js (warehouse items)
  - Terminal.js (warehouse terminal, fullscreen)
  - Protokoll.js (movement log)
  - LagerDashboard.js (warehouse dashboard)
  - LagerKassa.js (cash registers)
  - Support.js (tickets)
  - SupportForm.js (PUBLIC: support form)

/components
  - CreateProjectMinimal.jsx (dialog: anfrage → projekt)
  - EtappenManager.jsx (project stages CRUD)
  - DokumentManager.jsx (document upload/management)
  - CommentThread.jsx (comments with @mentions)
  - ProjectReport.jsx (PDF generation)
  - CameraPhotoUpload.jsx (camera/gallery photo upload)
  - CategorySelector.jsx (hierarchical category picker)
  /DashboardWidgets (customizable widgets)
  /ui (shadcn/ui components)

/functions
  - kassaWebhook.js (webhook for cash register sales)
  - generateProjectReport.js (PDF report generation)

/entities
  - *.json (JSON schemas for all entities)

Layout.js (main layout with sidebar, role-based menu)
```

## Core Workflows

### Workflow 1: Inquiry to Project
```
1. Customer fills AnfrageForm (public, no auth)
   ↓
2. Creates Anfrage entity (status: "Neu")
   ↓
3. Büro opens Anfragen page, views details
   ↓
4. Clicks "Projekt erstellen" → CreateProjectMinimal dialog
   ↓
5. Dialog:
   - Auto-generates projekt_nummer (EP-XXXX)
   - Finds/creates Kunde from anfrage data
   - Copies kategorie, unterkategorie, antworten → zusatzfelder
   - Creates Projekt with anfrage_id
   ↓
6. Updates Anfrage: projekt_id, status="Abgeschlossen"
   ↓
7. Bidirectional link: Anfrage ↔ Projekt
```

### Workflow 2: Warehouse Operations
```
Terminal Flow (Entnahme):
1. Worker logs in (QR scan or select)
2. Scans product barcode (or searches)
3. Selects action: "Entnahme"
4. Selects projekt
5. Enters quantity
6. Creates WarenLog:
   - ware_id, benutzer_id, projekt_id
   - aktion: "Entnahme"
   - menge: N
7. Updates Ware.bestand -= N
8. Recalculates status (Verfügbar/Niedrig/Ausverkauft)
9. Visible in ProjektDetail → Material tab

Kassa Webhook Flow:
1. Customer purchases at cash register
2. Register sends webhook → kassaWebhook function
3. Function (service role):
   - Creates KassaSale
   - Decreases Ware.bestand
   - Checks mindestbestand
   - Sets нужна_закупка flag if low
4. Warehouse sees alert in LagerKassa
5. Warehouse orders new stock
6. Warehouse receives goods → Terminal "Eingang"
```

### Workflow 3: Project Lifecycle
```
1. Create Projekt (from Anfrage or manual)
   - Auto projekt_nummer
   - Assign kunde_id, projektleiter_id
   ↓
2. Projektleiter assigns team:
   - gruppenleiter_ids: [...]
   - worker_ids: [...]
   - subunternehmer_ids: [...]
   ↓
3. Create Etappen (stages):
   - "Vorbereitung", "Hauptarbeit", "Abschluss"
   - Upload photos (before/after)
   ↓
4. Workers perform tasks:
   - Take materials via Terminal
   - Update Aufgabe status
   - Add photos to Etappen
   ↓
5. Upload Dokumente:
   - Plans, contracts, invoices
   - Categorize and tag
   ↓
6. Add Kommentare:
   - @mention team members
   - Threaded discussions
   ↓
7. Generate PDF report:
   - All project data
   - Photos from all stages
   - Material usage
   - Send to customer
```

## Key Features Implementation

### 1. Dynamic Forms (Kategorie.zusatzfelder)
```javascript
// In Kategorie entity
zusatzfelder: [
  {
    name: "dachflaeche",
    label: "Dachfläche (m²)",
    type: "number",
    erforderlich: true
  },
  {
    name: "dachtyp",
    label: "Dachtyp",
    type: "select",
    options: ["Flachdach", "Schrägdach"],
    erforderlich: true
  }
]

// In AnfrageForm - render dynamically
zusatzfelder.map(field => (
  {field.type === "number" && <Input type="number" />}
  {field.type === "select" && <Select><SelectItem>...</SelectItem></Select>}
  {field.type === "textarea" && <Textarea />}
))

// Save answers in Anfrage.antworten: { dachflaeche: 50, dachtyp: "Flachdach" }
```

### 2. Auto-numbering Projects
```javascript
const generateProjektNummer = async () => {
  const projekte = await base44.entities.Projekt.list();
  const numbers = projekte
    .map(p => parseInt(p.projekt_nummer?.replace("EP-", "") || "0"))
    .filter(n => !isNaN(n));
  const nextNumber = Math.max(1000, ...numbers) + 1;
  return `EP-${nextNumber}`;
};
```

### 3. Role-based Data Filtering
```javascript
const loadProjekte = async () => {
  const all = await base44.entities.Projekt.list();
  
  if (["Admin", "Projektleiter"].includes(benutzer.position)) {
    return all;
  }
  if (benutzer.position === "Gruppenleiter") {
    return all.filter(p => p.gruppenleiter_ids?.includes(benutzer.id));
  }
  if (benutzer.position === "Worker") {
    return all.filter(p => p.worker_ids?.includes(benutzer.id));
  }
};
```

### 4. Automatic Status Calculation
```javascript
// Ware status based on bestand
const status = 
  bestand <= 0 ? "Ausverkauft" :
  bestand <= mindestbestand ? "Niedrig" :
  "Verfügbar";
```

### 5. Bidirectional Entity Links
```javascript
// Create Projekt from Anfrage
const projekt = await base44.entities.Projekt.create({
  ...data,
  anfrage_id: anfrage.id  // Link to anfrage
});

// Update Anfrage with projekt link
await base44.entities.Anfrage.update(anfrage.id, {
  projekt_id: projekt.id,
  status: "Abgeschlossen"
});

// Now both entities reference each other
```

## Base44 SDK Patterns

### Entity Operations
```javascript
import { base44 } from "@/api/base44Client";

// List all
const items = await base44.entities.EntityName.list();

// Filter
const filtered = await base44.entities.EntityName.filter({ 
  status: "active" 
});

// Create
const item = await base44.entities.EntityName.create(data);

// Bulk create
await base44.entities.EntityName.bulkCreate([data1, data2]);

// Update
await base44.entities.EntityName.update(id, changes);

// Delete
await base44.entities.EntityName.delete(id);

// Get schema (for dynamic forms)
const schema = await base44.entities.EntityName.schema();
```

### Authentication
```javascript
// Get current user
const user = await base44.auth.me();

// Update current user
await base44.auth.updateMe({ additional_field: value });

// Logout
await base44.auth.logout();

// Check auth
const isAuth = await base44.auth.isAuthenticated();
```

### Integrations
```javascript
// Upload file
const { file_url } = await base44.integrations.Core.UploadFile({ file });

// LLM call
const result = await base44.integrations.Core.InvokeLLM({
  prompt: "Extract data",
  response_json_schema: { type: "object", properties: {...} }
});

// Send email
await base44.integrations.Core.SendEmail({
  to: "user@example.com",
  subject: "...",
  body: "..."
});

// Generate image
const { url } = await base44.integrations.Core.GenerateImage({
  prompt: "..."
});
```

### Functions
```javascript
// Call backend function
const response = await base44.functions.invoke('functionName', {
  param1: value1
});

const data = response.data; // Function response
```

## Backend Functions

### Structure
```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // User auth required
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse payload
    const payload = await req.json();
    
    // User-scoped operations
    const data = await base44.entities.SomeEntity.list();
    
    // Service role (admin privileges)
    const allData = await base44.asServiceRole.entities.SomeEntity.list();
    
    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
```

### When to use Service Role
```javascript
// Webhook (no user auth)
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  // Validate webhook signature
  // ...
  
  // Use service role for DB operations
  await base44.asServiceRole.entities.SomeEntity.create(data);
  
  return Response.json({ ok: true });
});

// Admin-only function
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Admin operation with service role
  await base44.asServiceRole.entities.SomeEntity.delete(id);
  
  return Response.json({ ok: true });
});
```

## State Management

### React Query Pattern
```javascript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Query
const { data: projekte, isLoading } = useQuery({
  queryKey: ['projekte'],
  queryFn: () => base44.entities.Projekt.list(),
  initialData: []
});

// Mutation with cache invalidation
const queryClient = useQueryClient();

const createMutation = useMutation({
  mutationFn: (data) => base44.entities.Projekt.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['projekte'] });
    toast.success("Projekt erstellt");
  }
});

const handleCreate = (data) => {
  createMutation.mutate(data);
};
```

## Navigation

### Using createPageUrl
```javascript
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const navigate = useNavigate();

// Navigate
navigate(createPageUrl("Projekte"));

// With query params
navigate(createPageUrl("ProjektDetail?id=123"));

// Link component
<Link to={createPageUrl("PageName")}>Text</Link>
```

## UI Patterns

### Dialogs
```javascript
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Forms
```javascript
import { useForm } from "react-hook-form";

const { register, handleSubmit, formState: { errors } } = useForm();

const onSubmit = (data) => {
  // Handle form
};

<form onSubmit={handleSubmit(onSubmit)}>
  <Input {...register("name", { required: true })} />
  {errors.name && <span>Required</span>}
  <Button type="submit">Save</Button>
</form>
```

### Notifications
```javascript
import { toast } from "sonner";

toast.success("Success message");
toast.error("Error message");
toast.info("Info message");
toast.warning("Warning message");
```

## Important Conventions

### 1. Entity Naming
- Use German field names (e.g., `projekt_nummer`, `kunde_id`)
- Foreign keys: `{entity}_id` (singular)
- Array relations: `{entity}_ids` (plural)

### 2. Status Enums
Always define allowed values in entity schema:
```json
{
  "status": {
    "type": "string",
    "enum": ["Neu", "In Bearbeitung", "Abgeschlossen"],
    "default": "Neu"
  }
}
```

### 3. Built-in Fields
Every entity has (auto-managed):
- `id`
- `created_date`
- `updated_date`
- `created_by` (email of creator)

### 4. Color Mapping
Use consistent color classes:
- Neu/Geplant: `bg-slate-100 text-slate-800`
- In Bearbeitung: `bg-blue-100 text-blue-800`
- Abgeschlossen: `bg-green-100 text-green-800`
- Abgelehnt/Storniert: `bg-red-100 text-red-800`
- Pausiert: `bg-yellow-100 text-yellow-800`

### 5. Layout Integration
Pages without layout:
```javascript
// In Layout.js
if (currentPageName === "Terminal" || currentPageName === "BenutzerLogin") {
  return <div className="min-h-screen">{children}</div>;
}
```

### 6. Mobile Responsiveness
- Always use responsive Tailwind classes: `md:`, `lg:`
- Test on mobile viewport
- Terminal page optimized for tablets

### 7. Loading States
```javascript
if (isLoading) return <div>Lädt...</div>;
if (error) return <div>Fehler: {error.message}</div>;
if (!data.length) return <div>Keine Daten gefunden</div>;
```

## Security Best Practices

1. **Never expose sensitive data** in client-side code
2. **Always validate user permissions** before CRUD operations
3. **Use service role only when necessary** in backend functions
4. **Validate webhook signatures** for external integrations
5. **Check session expiry** on every protected page load
6. **Filter data by role** before displaying

## Testing Considerations

1. **Quick user switch** (dev only):
   ```javascript
   localStorage.setItem("benutzer_session", JSON.stringify({
     id: user.id,
     timestamp: Date.now()
   }));
   window.location.reload();
   ```

2. **Test each role**:
   - Verify menu items visibility
   - Check data filtering
   - Confirm CRUD permissions

3. **Test workflows**:
   - Anfrage → Projekt creation
   - Terminal operations
   - PDF report generation

## Common Pitfalls to Avoid

1. ❌ Don't use Base44 User entity for employees → ✓ Use Benutzer entity
2. ❌ Don't fetch all data for Workers → ✓ Filter by assigned projects
3. ❌ Don't forget anfrage_id ↔ projekt_id bidirectional link
4. ❌ Don't hardcode categories → ✓ Use dynamic zusatzfelder
5. ❌ Don't skip permission checks → ✓ Check role before actions
6. ❌ Don't use sequential tool calls → ✓ Parallel when possible
7. ❌ Don't modify unrelated functionality → ✓ Minimal changes only

## Development Workflow

1. **Read existing code** before making changes
2. **Use find_replace** for existing files (not write_file)
3. **Create new components** instead of growing large files
4. **Test role-based access** after changes
5. **Verify bidirectional links** are maintained
6. **Check mobile responsiveness**
7. **Update technical docs** if architecture changes

## Performance Optimization

1. **Use React Query caching** for frequently accessed data
2. **Implement pagination** for large lists (50 items default)
3. **Lazy load images** in project galleries
4. **Debounce search inputs** (300ms)
5. **Memoize expensive calculations** with useMemo
6. **Virtual scrolling** for Terminal product lists

## Future Extensibility

System is designed to easily add:
- New roles (update accessMap in Layout.js)
- New entity types (create JSON schema in /entities)
- New dynamic fields (edit Kategorie.zusatzfelder)
- New backend functions (create in /functions)
- New integrations (Base44 integrations API)
- New dashboard widgets (add to /components/DashboardWidgets)

## Summary

EP-System is a **role-based construction management platform** with:
- ✅ Dynamic forms via category configuration
- ✅ Bidirectional entity relationships
- ✅ Real-time warehouse tracking
- ✅ Customer inquiry to project workflow
- ✅ Mobile-optimized terminal interface
- ✅ PDF report generation
- ✅ Webhook integrations
- ✅ Comprehensive RBAC
- ✅ PWA capabilities

Built on **Base44 BaaS** for rapid development with React best practices and modern UI/UX patterns.