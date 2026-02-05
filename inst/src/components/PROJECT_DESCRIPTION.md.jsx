# EP-System - Vollständige Projektbeschreibung

## Überblick
EP-System ist eine umfassende Verwaltungsplattform für ein Bauunternehmen, die Projektmanagement, Lagerverwaltung, Mitarbeiterverwaltung und Kundenbeziehungen integriert.

## Benutzerrollen und Zugriffe

### 1. Admin
**Vollzugriff auf alle Funktionen:**
- Dashboard
- Aufgaben
- Benutzer
- Subunternehmer
- Kunden
- Projekte
- Kategorien
- Anfragen
- Support
- LagerDashboard
- Waren
- Terminal
- LagerKassa
- Protokoll
- LagerBenutzer

**Verantwortlichkeiten:**
- Systemkonfiguration
- Benutzerverwaltung
- Kategorieverwaltung
- Vollständige Projekt- und Lagerverwaltung

### 2. Projektleiter
**Zugriff auf:**
- Dashboard
- Aufgaben
- Benutzer (eingeschränkt)
- Subunternehmer
- Kunden
- Projekte
- Kategorien
- Waren
- Terminal

**Verantwortlichkeiten:**
- Projekte erstellen und verwalten
- Team zuweisen (Gruppenleiter, Worker)
- Subunternehmer zuordnen
- Projektfortschritt überwachen
- Material für Projekte verwalten

### 3. Gruppenleiter
**Zugriff auf:**
- Dashboard
- Aufgaben
- Benutzer (eingeschränkt)
- Projekte (nur zugewiesene)
- Waren
- Terminal

**Verantwortlichkeiten:**
- Zugewiesene Projekte überwachen
- Aufgaben für sein Team verwalten
- Material für seine Projekte entnehmen
- Arbeiter koordinieren

### 4. Worker
**Zugriff auf:**
- Dashboard
- Aufgaben (nur eigene)
- Projekte (nur zugewiesene)
- Benutzer (eingeschränkt)
- Waren
- Terminal

**Verantwortlichkeiten:**
- Eigene Aufgaben bearbeiten
- Material entnehmen (Terminal)
- Projektfortschritt dokumentieren
- Zeiterfassung

### 5. Büro
**Zugriff auf:**
- Dashboard
- Aufgaben
- Benutzer
- Kunden
- Projekte
- Support
- Kategorien
- Anfragen
- LagerDashboard
- Protokoll
- LagerBenutzer

**Verantwortlichkeiten:**
- Kundenanfragen bearbeiten
- Angebote erstellen
- Kundenverwaltung
- Support-Tickets bearbeiten
- Lagerübersicht und Bestellungen

### 6. Warehouse
**Zugriff auf:**
- Dashboard
- Aufgaben
- Benutzer (eingeschränkt)
- Kategorien
- LagerDashboard
- Waren
- Terminal
- Protokoll
- LagerBenutzer

**Verantwortlichkeiten:**
- Lagerverwaltung
- Warenein- und -ausgang
- Inventur
- Bestellungen bei niedrigem Bestand
- Kassa-Integration

## Hauptmodule

### 1. Dashboard
**Funktionen:**
- Projekt-Übersicht (nach Status)
- Anstehende Deadlines
- Budget-Übersicht
- Aktuelle Aktivitäten
- Aufgaben-Widget
- Anpassbare Widgets

**Anzeige nach Rolle:**
- Admin/Projektleiter: Alle Projekte
- Gruppenleiter: Projekte, wo er zugewiesen ist
- Worker: Projekte, wo er zugewiesen ist
- Warehouse: Lagerstatistiken
- Büro: Anfragen und Projekte

### 2. Anfragen-System
**Workflow:**
1. **Anfrage erstellen** (öffentliches Formular - AnfrageForm)
   - Kunde füllt Formular aus
   - Auswahl: Kategorie → Unterkategorie
   - Dynamische Zusatzfelder je nach Kategorie
   - Kontaktdaten (Name, Email, Telefon, Adresse)

2. **Anfrage bearbeiten** (Büro/Admin)
   - Status: Neu, In Bearbeitung, Angeboten, Abgeschlossen, Abgelehnt
   - Notizen hinzufügen
   - Projekt aus Anfrage erstellen

3. **Projekt erstellen**
   - Automatische Projektnummer (EP-XXXX)
   - Kundenzuordnung
   - Übernahme aller Daten aus Anfrage
   - Verlinkung: Anfrage ↔ Projekt (bidirektional)

### 3. Projektverwaltung
**Projektstruktur:**
- Projektnummer (EP-XXXX, automatisch inkrementiert)
- Name, Beschreibung
- Kunde
- Projektleiter
- Team (Gruppenleiter, Worker, Subunternehmer)
- Kategorie/Unterkategorie
- Status: Geplant, In Bearbeitung, Abgeschlossen, Pausiert, Storniert
- Priorität: Niedrig, Mittel, Hoch, Kritisch
- Zeitraum (Start-/Enddatum)
- Budget
- Adresse
- Fotos
- Zusatzfelder (dynamisch aus Anfrage)
- Verknüpfte Anfrage (anfrage_id)

**Projekt-Features:**
- **Etappen:** Projektphasen mit Fotos und Status
- **Dokumente:** Pläne, Verträge, Berichte, Rechnungen
- **Material:** Übersicht verwendetes Material aus Lager
- **Diskussion:** Kommentar-Thread mit @mentions
- **Bericht:** PDF-Export mit allen Projektdaten

**Zugriffskontrolle:**
- Projektleiter können alle Projekte bearbeiten
- Gruppenleiter/Worker sehen nur zugewiesene Projekte
- Projekt löschen nur für Admin/Projektleiter

### 4. Kategorien-System
**Struktur:**
- **Hauptkategorien** (z.B. Elektrik, Sanitär, Heizung)
- **Unterkategorien** (z.B. Solaranlage, Reparatur)
- **Unter-Unterkategorien** (optional)

**Eigenschaften:**
- Typ: Projekt oder Ware
- Icon (Lucide React)
- Farbe
- Bild
- Beschreibung
- **Dynamische Zusatzfelder:**
  - Feldtyp: text, number, select, textarea, radio
  - Label und Name
  - Optionen (bei select/radio)
  - Erforderlich: ja/nein

**Verwendung:**
- Bei Anfragen: Dynamische Fragen basierend auf Kategorie
- Bei Projekten: Zusatzfelder werden übernommen
- Bei Waren: Kategorisierung von Lagerwaren

### 5. Aufgabenverwaltung
**Aufgaben-Eigenschaften:**
- Titel, Beschreibung
- Zugewiesen an (Benutzer)
- Projekt (optional)
- Priorität: Niedrig, Mittel, Hoch, Kritisch
- Status: Offen, In Bearbeitung, Erledigt, Storniert
- Fälligkeitsdatum

**Filterung:**
- Nach Suchbegriff
- Nach Benutzer
- Nach Status
- Nach zugewiesenem Benutzer

**Zugriff:**
- Jeder sieht seine eigenen Aufgaben
- Projektleiter/Gruppenleiter können Aufgaben zuweisen
- Admin sieht alle Aufgaben

### 6. Benutzerverwaltung
**Benutzer-Eigenschaften:**
- Vorname, Nachname
- Email (für Admin-Login)
- Position: Admin, Projektleiter, Gruppenleiter, Worker, Warehouse, Büro
- Spezialisierung (z.B. Elektriker, Schlosser)
- Vorgesetzter
- Telefon
- QR-Code (für Terminal)
- Passwort (für Admin-Panel)
- Status: Aktiv/Inaktiv
- Foto

**Authentifizierung:**
- **Admin-Panel:** Email + Passwort
- **Terminal:** QR-Code Scan oder Benutzerauswahl
- Session-Speicherung (24h) in localStorage
- Schneller Benutzerwechsel (TEST-Funktion)

### 7. Kundenverwaltung
**Kunden-Typen:**
- Firma
- Privat

**Eigenschaften:**
- Firma/Name
- Ansprechpartner
- Email, Telefon
- Adresse (Straße, PLZ, Stadt)
- Notizen
- Status: Aktiv/Inaktiv

### 8. Subunternehmer
**Eigenschaften:**
- Firma
- Ansprechpartner
- Email, Telefon
- Adresse
- Spezialisierung
- Stundensatz
- Status: Aktiv/Inaktiv
- Notizen

### 9. Lagerverwaltung

#### 9.1 Waren
**Eigenschaften:**
- Name, Beschreibung
- Barcode (EAN, eindeutig)
- Kategorie
- Einheit: Stk, kg, m, l, m², m³, Set
- Einkaufspreis, Verkaufspreis
- Bestand (aktuell)
- Mindestbestand (für Warnungen)
- Lagerort
- Bild
- Status: Verfügbar, Niedrig, Ausverkauft

**Funktionen:**
- Waren hinzufügen/bearbeiten/löschen
- Bestand manuell korrigieren
- Niedrigbestand-Warnungen
- Barcode-Suche

#### 9.2 Terminal
**Funktionen:**
- Benutzer-Login (QR-Code oder Auswahl)
- Waren scannen (Barcode)
- Aktionen:
  - Entnahme (für Projekt)
  - Rückgabe
  - Eingang
  - Korrektur
  - Inventur
- Projekt zuordnen
- Menge eingeben
- Notiz hinzufügen

**Mobile-First Design:**
- Große Touch-Buttons
- Scanner-Integration
- Offline-fähig (PWA)
- Schneller Workflow

#### 9.3 Protokoll (WarenLog)
**Log-Einträge:**
- Ware (ID + Name)
- Benutzer (ID + Name)
- Projekt (ID + Nummer, optional)
- Aktion: Entnahme, Rückgabe, Eingang, Korrektur, Inventur, Verkauf
- Menge
- Notiz
- Datum/Zeitstempel

**Filterung:**
- Nach Ware
- Nach Benutzer
- Nach Projekt
- Nach Aktion
- Nach Datum

#### 9.4 Kassa-Integration
**Kassas:**
- Name
- Kassa-Nummer
- API-Key
- Status: Verbunden, Nicht verbunden, Fehler
- Letzte Synchronisation
- Adresse/Standort

**KassaSale (Verkäufe):**
- Kassa (ID + Name)
- Ware (ID + Name)
- Menge
- Summe (€)
- Datum
- Status: Bearbeitet, Wartend, Fehler
- Automatische Bestandsreduktion
- Nachbestellungs-Flag

**Webhook:**
- Endpoint: functions/kassaWebhook
- Empfängt Verkaufsdaten von Kassa
- Validiert und speichert
- Reduziert Bestand automatisch

### 10. Support-System
**Ticket-Eigenschaften:**
- Betreff, Nachricht
- Absender (Name, Email, Telefon)
- Kategorie: Anfrage, Support, Beschwerde, Sonstiges
- Status: Neu, In Bearbeitung, Beantwortet, Geschlossen
- Priorität: Niedrig, Mittel, Hoch
- Bearbeiter (Benutzer)
- Antwort

**Workflow:**
1. Kunde sendet Ticket (SupportForm - öffentlich)
2. Büro/Admin sieht neue Tickets
3. Ticket bearbeiten, Antwort schreiben
4. Status ändern
5. Ticket schließen

### 11. Kommentar-System
**Features:**
- Für Entitäten: Projekt, Etappe, Aufgabe, Dokument
- Markdown-Unterstützung
- @Mentions (Benutzer)
- Benachrichtigungen
- Threads (Parent-Comments)
- Bearbeiten/Löschen (eigene Kommentare)

### 12. Dokument-Management
**Dokument-Typen:**
- Plan
- Vertrag
- Bericht
- Rechnung
- Sonstiges

**Eigenschaften:**
- Projekt-Zuordnung
- Titel, Beschreibung
- Datei-Upload
- Tags
- Status: Aktiv/Archiviert

### 13. Etappen-System
**Etappen:**
- Projekt-Zuordnung
- Name, Beschreibung
- Bilder (mehrere)
- Status: Geplant, In Bearbeitung, Abgeschlossen
- Reihenfolge (sortierbar)

**Verwendung:**
- Projektfortschritt visualisieren
- Vorher/Nachher Dokumentation
- Abnahme-Protokolle

## Technische Details

### Entities (Datenmodell)
1. **Anfrage** - Kundenanfragen
2. **Projekt** - Projekte mit anfrage_id Link
3. **Kategorie** - Kategorien mit Zusatzfeldern
4. **Benutzer** - Mitarbeiter
5. **Kunde** - Kunden
6. **Subunternehmer** - Externe Partner
7. **Aufgabe** - Aufgabenverwaltung
8. **Ware** - Lagerartikel
9. **WarenLog** - Lagerbewegungen
10. **Kassa** - Kassen-Geräte
11. **KassaSale** - Verkäufe
12. **Etappe** - Projektphasen
13. **Dokument** - Dateien
14. **Kommentar** - Diskussionen
15. **Ticket** - Support-Anfragen

### Layout und Navigation
**Zwei Hauptbereiche:**
1. **Allgemein:** Dashboard, Projekte, Aufgaben, Benutzer, Kunden, etc.
2. **Lagerverwaltung:** Warehouse-spezifische Seiten

**Features:**
- Collapsible Sidebar
- Mobile-responsive
- Breadcrumb Navigation
- Benutzer-Profil in Sidebar
- Schneller Benutzerwechsel (TEST)
- Logout-Funktion

### Sicherheit
- Rollen-basierte Zugriffskontrolle
- Session-Management (24h)
- Projekt-Zugriffskontrolle (nur zugewiesene sehen)
- Lösch-Berechtigungen nach Rolle

### PWA (Progressive Web App)
- Service Worker
- Offline-fähig
- Installierbar auf Mobile/Desktop
- Push-Benachrichtigungen (vorbereitet)
- PWAInstallPrompt Component

### UI/UX
**Design-System:**
- Tailwind CSS
- shadcn/ui Components
- Lucide React Icons
- Responsive Design
- Mobile-First für Terminal
- Toast-Benachrichtigungen (Sonner)
- Loading States
- Error Handling

**Farben:**
- Primary: Blue (#1e40af, #3b82f6)
- Accent: Sky Blue (#0ea5e9)
- Status-Colors: 
  - Grün: Abgeschlossen, Erfolg
  - Blau: In Bearbeitung
  - Gelb: Warnung, Pausiert
  - Rot: Fehler, Storniert
  - Grau: Geplant, Inaktiv

### Backend-Funktionen
**generateProjectReport:**
- Erstellt PDF-Bericht von Projekt
- Enthält alle Projektdaten, Etappen, Material
- HTML zu PDF Konvertierung

**kassaWebhook:**
- Empfängt Verkäufe von Kassa-System
- Speichert in KassaSale
- Reduziert Warenbestand
- Prüft Mindestbestand

## Spezielle Features

### 1. Dynamische Formulare
- Kategorien definieren Zusatzfelder
- Felder werden automatisch im Anfrage-Formular generiert
- Validierung basierend auf "erforderlich"
- Übertragung in Projekt

### 2. Automatische Projektnummer
- Format: EP-XXXX
- Startet bei 1000
- Auto-Increment
- Eindeutig

### 3. Bidirektionale Verlinkung
- Anfrage → Projekt (projekt_id)
- Projekt → Anfrage (anfrage_id)
- In beiden Details sichtbar

### 4. Material-Tracking
- Jede Entnahme wird geloggt
- Zuordnung zu Projekt
- Übersicht in Projekt-Details
- Bestandsüberwachung

### 5. Kassa-Integration
- Webhook für Echtzeit-Verkäufe
- Automatische Bestandsreduktion
- Nachbestellungs-Alerts
- Multi-Kassa Unterstützung

### 6. Dashboard-Widgets
- Anpassbar (localStorage)
- Projekt-Status-Übersicht (Pie Chart)
- Anstehende Deadlines
- Budget-Übersicht
- Aktivitäten-Feed

### 7. Foto-Upload
- Camera API für Handy
- Gallery-Upload
- Preview
- Multiple Fotos pro Projekt/Etappe

### 8. Bericht-Generierung
- PDF-Export von Projekten
- Enthält Etappen-Fotos
- Material-Übersicht
- Kommentare
- Druckbar

## Workflow-Beispiele

### Beispiel 1: Von Anfrage zu Projekt
1. Kunde füllt Anfrage-Formular aus (AnfrageForm)
2. Büro sieht neue Anfrage in "Anfragen"-Seite
3. Büro öffnet Details, fügt Notizen hinzu
4. Büro klickt "Projekt erstellen"
5. Dialog mit vorausgefüllten Daten
6. Kunde auswählen/erstellen
7. Start-/Enddatum, Budget festlegen
8. Projekt erstellen → Anfrage wird "Abgeschlossen"
9. Projekt erhält anfrage_id, Anfrage erhält projekt_id
10. Projektleiter weist Team zu
11. Projekt wird durchgeführt

### Beispiel 2: Material-Entnahme
1. Worker geht zu Terminal
2. Login via QR-Code
3. Projekt auswählen
4. Ware scannen oder suchen
5. Menge eingeben
6. "Entnahme" bestätigen
7. Bestand wird reduziert
8. WarenLog erstellt
9. In Projekt-Details sichtbar

### Beispiel 3: Kassa-Verkauf
1. Kunde kauft Ware an Kassa
2. Kassa sendet Webhook an System
3. kassaWebhook empfängt Daten
4. KassaSale wird erstellt
5. Bestand wird automatisch reduziert
6. Falls unter Mindestbestand → Flag gesetzt
7. Warehouse sieht Alert
8. Neue Bestellung wird ausgelöst

### Beispiel 4: Projekt mit Etappen
1. Projektleiter erstellt Projekt
2. Team wird zugewiesen
3. Gruppenleiter erstellt Etappen (z.B. "Vorbereitung", "Installation", "Fertigstellung")
4. Worker beginnt erste Etappe
5. Macht Fotos während Arbeit
6. Lädt Fotos in Etappe hoch
7. Status → "Abgeschlossen"
8. Nächste Etappe beginnt
9. Am Ende: Komplette Foto-Dokumentation
10. PDF-Bericht für Kunde

## Wichtige Hinweise für AI-Entwicklung

### Reihenfolge der Entwicklung:
1. **Entities erstellen** (alle 15)
2. **Layout** mit Rollen-System
3. **Dashboard** (basic)
4. **Kategorien** (wichtig für Rest)
5. **Anfragen-System** (AnfrageForm + Anfragen)
6. **Projektverwaltung** (Projekte, ProjektDetail, ProjektNeu, ProjektBearbeiten)
7. **Benutzer** und **Kunden**
8. **Aufgaben**
9. **Lagerverwaltung** (Waren, Terminal, Protokoll)
10. **Kassa-Integration**
11. **Support**
12. **Erweiterte Features** (Etappen, Dokumente, Kommentare, Berichte)

### Kritische Punkte:
- **Rollen-System** muss von Anfang an funktionieren
- **Kategorien mit Zusatzfeldern** sind zentral
- **Bidirektionale Links** (Anfrage ↔ Projekt) nicht vergessen
- **Bestandsverwaltung** muss korrekt sein
- **Session-Management** (localStorage + 24h)
- **Mobile-Optimierung** für Terminal
- **Zugriffskontrolle** bei jedem Feature berücksichtigen

### Best Practices:
- Kleine, fokussierte Components erstellen
- Wiederverwendbare UI-Components (shadcn/ui)
- Konsistente Fehlerbehandlung (Toast)
- Loading States überall
- Responsive Design (Mobile-First für Terminal)
- Klare Status-Farben
- Icons von Lucide React

### Testing-Szenarien:
1. Admin kann alles sehen/bearbeiten
2. Projektleiter sieht alle Projekte, kann Team zuweisen
3. Gruppenleiter sieht nur seine Projekte
4. Worker sieht nur seine Projekte und Aufgaben
5. Büro kann Anfragen bearbeiten und Projekte erstellen
6. Warehouse verwaltet Lager und sieht Kassa-Verkäufe
7. Terminal funktioniert auf Smartphone
8. Kassa-Webhook verarbeitet Verkäufe korrekt
9. Material-Entnahme wird im Projekt angezeigt
10. PDF-Bericht enthält alle Daten

## Zusammenfassung
EP-System ist eine vollständige Unternehmenslösung mit:
- **6 Benutzerrollen** mit unterschiedlichen Berechtigungen
- **15 Entities** für verschiedene Geschäftsprozesse
- **Anfrage-zu-Projekt Workflow** mit Kategorien-System
- **Lagerverwaltung** mit Terminal und Kassa-Integration
- **Projektmanagement** mit Etappen, Dokumenten und Berichten
- **Support-System** für Kundenanfragen
- **Mobile-optimiert** für Lagerarbeiter
- **PWA** für Offline-Nutzung