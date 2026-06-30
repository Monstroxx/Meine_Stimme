# Meine Stimme

Barrierefreie Beschwerde-App für Menschen mit geistiger Behinderung in Besonderen Wohnformen.  
Bewohner:innen können per Spracheingabe (oder Tastatur) ein Problem schildern, einen Lösungsvorschlag
hinterlassen und die Beschwerde anonym oder mit Namen abschicken – die Meldung landet per E-Mail +
Datenbank bei der zentralen Stelle der Einrichtung.

---

## Technologie-Stack

| Bereich | Technologie |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Zustand |
| **Backend** | Vercel Serverless Functions (Node.js) |
| **Datenbank** | Supabase (PostgreSQL + RLS) |
| **Audio-Speicher** | Supabase Storage (privater Bucket) |
| **E-Mail** | Resend |
| **KI** | Whisper (Transformers.js) im Browser für Speech-to-Text |
| **Hosting** | Vercel |

---

## Voraussetzungen

- **Node.js** 20+
- **npm** 10+
- **Supabase-Konto** (kostenlos) – [supabase.com](https://supabase.com)
- **Resend-Konto** (kostenlos) – [resend.com](https://resend.com)
- **Vercel-Konto** (kostenlos) – [vercel.com](https://vercel.com)

---

## Lokale Entwicklung

### 1. Repository klonen & Abhängigkeiten installieren

```bash
git clone <repo-url>
cd Meine_Stimme
npm install
```

### 2. Supabase-Projekt anlegen

1. [Supabase Dashboard](https://supabase.com/dashboard) → **New project**
2. Region **Frankfurt** (eu-central-1) wählen
3. Datenbank-Passwort notieren
4. Nach der Erstellung unter **Project Settings → API** die folgenden Werte kopieren:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `service_role secret` → `SUPABASE_SECRET_KEY`
5. Unter **Authentication → Providers** sicherstellen, dass **E-Mail/Passwort** aktiviert ist

### 3. Datenbank-Migration ausführen

Im Supabase Dashboard **SQL Editor** öffnen und den Inhalt von
[`supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql)` einfügen und ausführen.
Alternativ per `supabase` CLI:

```bash
npx supabase link --project-ref <ref>
npx supabase db push
```

Dies erstellt:
- Tabelle `complaints` (Beschwerden)
- Tabelle `staff` (Personal-Zuordnung)
- RLS-Policies
- privaten Storage-Bucket `complaint-audio`

### 4. Resend-Account einrichten

1. [Resend Dashboard](https://resend.com) → **API Keys** → neuen Key erstellen → `RESEND_API_KEY`
2. Optional: Eine Domain verifizieren für den E-Mail-Versand von einer eigenen Adresse (`RESEND_FROM`)
3. Ohne eigene Domain wird der Sandbox-Sender `onboarding@resend.dev` genutzt (sendet nur an die
   E-Mail-Adresse des Resend-Accounts)

### 5. Umgebungsvariablen konfigurieren

`.env.example` in `.env` kopieren und alle Werte ausfüllen:

```bash
cp .env.example .env
```

| Variable | Beschreibung |
|---|---|
| `SUPABASE_URL` | Project URL aus Supabase |
| `SUPABASE_SECRET_KEY` | Service-Role-Key (server-only) |
| `RESEND_API_KEY` | API-Key aus Resend |
| `COMPLAINT_RECIPIENT_EMAIL` | Zentrale E-Mail-Adresse, an die Beschwerden geschickt werden |
| `RESEND_FROM` | Absenderadresse (optional, Standard: `onboarding@resend.dev`) |
| `SUPABASE_JWKS_URL` | JWKS-URL für Auth (optional für Admin) |

Für das Frontend zusätzlich `frontend/.env.local` anlegen:

```env
VITE_SUPABASE_URL=<gleiche URL wie oben>
VITE_SUPABASE_PUBLISHABLE_KEY=<anon public key>
```

### 6. Lokal starten

**Frontend + API parallel** (zwei Terminals):

```bash
# Terminal 1: Vite-Dev-Server (Frontend)
npm run dev

# Terminal 2: API-Dev-Server (imitert Vercel Serverless Functions)
npm run dev:api
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:3000](http://localhost:3000)

Im Browser mit einem Einrichtungs-Slug aufrufen, z. B.:
[http://localhost:5173/wohnform-01](http://localhost:5173/wohnform-01)

### 7. Admin-Account anlegen (für Verwaltungs-Ansicht)

1. Im Supabase Dashboard → **Authentication → Users** → **Add User**
2. E-Mail/Passwort vergeben
3. Im **SQL Editor** eine Staff-Zeile anlegen:

```sql
insert into staff (user_id, facility_slug, role)
values (
  '<UUID-des-neuen-Users>',
  null,        -- null = Leitung (sieht alle Einrichtungen)
  'leitung'
);
```

Der Admin-Bereich ist erreichbar unter [http://localhost:5173/admin](http://localhost:5173/admin).

---

## Deployment (Vercel)

1. Repo in Vercel importieren (via GitHub/GitLab)

   `vercel.json` ist bereits konfiguriert:
   - SPA-Rewrites für die Kiosk-Slug-Pfade
   - `/api/*`-Routing zu Serverless Functions

2. **Environment Variables** in den Vercel-Projekt-Einstellungen setzen:

   ```
   SUPABASE_URL, SUPABASE_SECRET_KEY,
   RESEND_API_KEY, COMPLAINT_RECIPIENT_EMAIL,
   VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
   ```

3. Deploy auslösen – fertig.

   Aufruf: `https://<projekt>.vercel.app/wohnform-01`

---

## Projektstruktur

```
Meine_Stimme/
├── api/                          # Vercel Serverless Functions
│   ├── complaints.ts             # POST: Beschwerde einreichen (Multipart + Audio + Mail)
│   ├── complaints/[id].ts        # PATCH: Status ändern (Admin, Auth-geprüft)
│   ├── audio-url.ts              # GET: signierte Audio-URL (Admin)
│   └── _lib/
│       ├── supabaseAdmin.ts      # Supabase-Client (Service-Role-Key)
│       ├── resend.ts             # Resend-E-Mail-Client
│       └── facilityConfig.ts     # Einrichtungs-Slug → Name
├── frontend/                     # React SPA
│   ├── src/
│   │   ├── App.tsx               # Root-Komponente (BrowserRouter)
│   │   ├── routes.tsx            # Routen-Definition
│   │   ├── main.tsx              # Einstiegspunkt
│   │   ├── index.css             # Tailwind-Import + Theme-Tokens
│   │   ├── screens/              # 6 Bewohner-Screens
│   │   │   ├── StartScreen.tsx
│   │   │   ├── ProblemScreen.tsx
│   │   │   ├── SolutionScreen.tsx
│   │   │   ├── NameScreen.tsx
│   │   │   ├── ConfirmScreen.tsx
│   │   │   └── DoneScreen.tsx
│   │   ├── components/           # Wiederverwendbare UI
│   │   │   ├── BigButton.tsx
│   │   │   ├── HomeButton.tsx
│   │   │   ├── KioskFrame.tsx
│   │   │   ├── MicButton.tsx
│   │   │   ├── ProgressDots.tsx
│   │   │   ├── ReadAloudButton.tsx
│   │   │   └── RecordControls.tsx
│   │   ├── hooks/                # Custom Hooks
│   │   │   ├── useReadAloud.ts   # SpeechSynthesis (Vorlesen)
│   │   │   ├── useRecorder.ts    # MediaRecorder (Audio-Aufnahme)
│   │   │   └── useTranscription.ts # Whisper Speech-to-Text
│   │   ├── lib/
│   │   │   ├── facility.ts       # Einrichtungs-Slug aus URL
│   │   │   ├── submitComplaint.ts # API-Aufruf (multipart/form-data)
│   │   │   └── supabaseClient.ts # Supabase-Client (anon Key)
│   │   ├── state/
│   │   │   └── complaintStore.ts # Zustand-Store
│   │   └── admin/                # Verwaltungs-Ansicht
│   │       ├── AdminApp.tsx
│   │       ├── LoginScreen.tsx
│   │       ├── ComplaintList.tsx
│   │       └── ComplaintDetail.tsx
│   └── vite.config.ts            # Vite-Konfiguration (React + Tailwind + Proxy)
├── supabase/
│   └── migrations/0001_init.sql  # Datenbank-Schema + RLS
├── scripts/
│   └── dev-api.ts                # Lokaler API-Dev-Server
├── .env.example                  # Dokumentation der Umgebungsvariablen
├── vercel.json                   # Vercel-Deployment-Konfiguration
├── package.json                  # Root-Workspace
└── README.md
```

---

## Routen

| Pfad | Screen |
|---|---|
| `/:facilitySlug` | Startseite |
| `/:facilitySlug/problem` | Problem schildern |
| `/:facilitySlug/loesung` | Lösungsvorschlag (optional) |
| `/:facilitySlug/name` | Name oder anonym |
| `/:facilitySlug/bestaetigen` | Zusammenfassung & abschicken |
| `/:facilitySlug/fertig` | Bestätigung |
| `/admin` | Admin-Login / Dashboard |
| `/admin/complaint/:id` | Beschwerde-Detail (Audio + Status) |

---

## Entwicklungsskripte

```bash
npm run dev        # Vite-Dev-Server (Frontend, Port 5173)
npm run dev:api    # API-Dev-Server (Port 3000, parallel zu dev)
npm run build      # Production-Build (Frontend)
npm run lint       # Linting (oxlint)
```

---

## Lizenz

Projekt der Lebenshilfe – im Rahmen der Praktikumsersatzleistung HIT12 AWE mit KI.
