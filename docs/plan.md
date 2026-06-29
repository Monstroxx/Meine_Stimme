# "Meine Stimme" — Umsetzungsplan (Mo 29.06.26 – Fr 03.07.26)

## Context

Dies ist die Praktikumsersatzleistung "HIT12 AWE mit KI": ein Team von 2–3 Schüler*innen entwickelt innerhalb einer Schulwoche (Start heute, 29.06.26) eine gesellschaftlich relevante App mit KI-Unterstützung, inklusive Konzept, funktionsfähigem Prototyp, Kurzdokumentation, Präsentation und Retrospektive (siehe `docs/BewertungsBogen.pdf`).

Das Konzept selbst ist bereits vollständig durchdacht in `docs/Beschwerde-App Brainstorming.md` und den Wireframes in `docs/ui_konzept/` (6 Screens: Start → Problem → Idee → Name → Abschicken → Fertig): eine barrierefreie, Mebis-inspirierte Beschwerde-App für Bewohner:innen Besonderer Wohnformen (Menschen mit geistiger Behinderung), die Spracheingabe statt Text nutzt, jede Frage vorliest, und Beschwerden per Mail + Datenbank an eine zentrale Stelle weiterleitet. Das Repo ist aktuell komplett leer (nur `docs/`) — dies ist ein Greenfield-Aufbau.

Dieser Plan übersetzt das fertige Konzept in eine konkrete, dateibasierte Bauanleitung für die Woche, aufgeteilt in drei parallelisierbare Arbeitsstränge, damit ein 2-3-köpfiges Team gleichzeitig arbeiten kann, ohne sich zu blockieren.

**Entscheidungen aus Rückfrage an den Nutzer:** Team codet zu mehreren (nicht solo) → Plan ist in parallele Workstreams aufgeteilt. Supabase/Resend-Accounts existieren noch nicht → Setup-Schritte sind Teil des Plans. Die Verwaltungs-Ansicht (Login, Status-Liste, Audio-Wiedergabe) wird diese Woche mitgebaut, nicht nur als Ausblick dokumentiert.

---

## 1. Projekt-Scaffold

**Entscheidung: Monorepo, ein Vercel-Projekt, Vercel Serverless Functions** (statt eigenständigem Express-Server) — passt zum geplanten Vercel-Hosting: ein Deploy, keine CORS-Probleme, kostenlose HTTPS, Functions liegen direkt neben dem Frontend.

```
Meine_Stimme/
├── package.json                   # root: workspaces, shared scripts
├── .env.example                   # dokumentiert benötigte Env-Vars (keine Secrets)
├── vercel.json                    # Routing /api/* zu Functions, SPA-Rewrites für Kiosk-Slug-Pfade
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── index.html
│   ├── public/icons/               # METACOM-artige Icons, Häkchen, Mikro, Lautsprecher
│   └── src/
│       ├── main.tsx, App.tsx, routes.tsx
│       ├── lib/
│       │   ├── facility.ts         # liest Einrichtungs-Slug frisch aus der URL, localStorage nur Fallback
│       │   └── supabaseClient.ts   # anon-key Client (nur Storage-Upload + Insert)
│       ├── hooks/
│       │   ├── useReadAloud.ts     # SpeechSynthesis-Wrapper
│       │   ├── useRecorder.ts      # MediaRecorder-Wrapper (start/stop/blob/playback)
│       │   └── useTranscription.ts # Transformers.js Whisper, lazy-geladen
│       ├── state/complaintStore.ts # zustand-Store über die 6 Screens hinweg
│       ├── screens/
│       │   ├── StartScreen.tsx, ProblemScreen.tsx, SolutionScreen.tsx
│       │   ├── NameScreen.tsx, ConfirmScreen.tsx, DoneScreen.tsx
│       ├── components/
│       │   ├── BigButton.tsx, RecordControls.tsx  # "Frage wiederholen / Antwort anhören / Neu aufnehmen"
│       │   ├── ReadAloudIcon.tsx, ProgressDots.tsx
│       └── admin/
│           ├── AdminApp.tsx, LoginScreen.tsx
│           ├── ComplaintList.tsx, ComplaintDetail.tsx, StatusFilter.tsx
├── api/                             # Vercel Serverless Functions (Node runtime)
│   ├── complaints.ts                # POST: Beschwerde anlegen + Audio hochladen + Mail senden
│   ├── complaints/[id].ts           # PATCH: Status ändern (Admin, auth-geprüft)
│   ├── audio-url.ts                 # GET: signierte Kurzzeit-URL für Audio-Wiedergabe (Admin)
│   └── _lib/
│       ├── supabaseAdmin.ts         # service-role Client, server-only
│       ├── resend.ts                # Resend-Client + Send-Helper
│       └── facilityConfig.ts        # Slug -> Anzeigename, server-only
└── supabase/
    ├── config.toml
    └── migrations/0001_init.sql
```

### package.json / Env-Vars
- Root-Workspace `["frontend"]`. `frontend` deps: `react`, `react-dom`, `react-router-dom`, `@supabase/supabase-js`, `@xenova/transformers`, `zustand`, `tailwindcss`, `vite`.
- Root deps (für `/api`): `@supabase/supabase-js`, `resend`.
- `vercel.json`: SPA-Rewrite aller Nicht-`/api`-Pfade auf `frontend/index.html`, damit `/wohnform-03` auch bei Hard-Refresh funktioniert.

| Env-Var | Genutzt von | Hinweis |
|---|---|---|
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` | Frontend | öffentlich, RLS-eingeschränkt |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | `api/*` | **server-only** |
| `RESEND_API_KEY` | `api/*` | server-only |
| `COMPLAINT_RECIPIENT_EMAIL` | `api/*` | zentrale Adresse, **niemals ans Tablet gesendet** |
| `FACILITY_NAMES_JSON` | `api/*` | Slug→Name-Mapping für E-Mail-Betreff |

Der Einrichtungs-Slug kommt beim Frontend **ausschließlich** aus `window.location.pathname`, frisch bei jedem Laden — kein Env-Var, kein Cookie. `localStorage` nur als Fallback mit Warn-Banner, falls die URL mal ohne Slug aufgerufen wird.

---

## 2. Supabase-Schema (`supabase/migrations/0001_init.sql`)

**Tabelle `complaints`**: `id` uuid pk, `facility_slug` text (indiziert), `problem_text`, `problem_audio_path`, `solution_text` nullable, `solution_audio_path` nullable, `is_anonymous` bool default true, `name_text`/`name_audio_path` nullable, `status` text default `'offen'` (check: offen/in_bearbeitung/erledigt), `created_at`.

**Tabelle `staff`**: `user_id` references `auth.users`, `facility_slug` (null/`'*'` = Leitung sieht alles), `role` (`leitung`/`betreuer`).

**Storage**: ein privater Bucket `complaint-audio`, Pfad-Konvention `{facility_slug}/{complaint_id}/problem.webm` etc. Kein direkter Client-Zugriff — Upload/Download laufen ausschließlich über die Serverless Functions mit Service-Role-Key, damit RLS auf Storage gar nicht erst gebraucht wird.

**RLS auf `complaints`**:
- `insert` für `anon`: offen (`with check (true)`) — bewusst, weil Kiosk ohne Login senden muss; in der Doku explizit als gewollt kennzeichnen.
- `select`/`update` für `authenticated`: nur eigene `facility_slug` (oder `'*'` für Leitung); `update` nur auf die Spalte `status`.
- Kein `delete`.

**Zugriffsbeschränkung für anonyme Audios** (Abschnitt 10 des Brainstormings — Stimme ist erkennbar, auch wenn "anonym" gewählt wurde): Postgres-Funktion `can_access_audio(complaint_id)`, die bei `is_anonymous = true` nur `role = 'leitung'` durchlässt; wird in `api/audio-url.ts` vor Ausstellen der signierten URL geprüft.

---

## 3. Frontend: Routen & Komponenten

```
/:facilitySlug              -> StartScreen
/:facilitySlug/problem      -> ProblemScreen
/:facilitySlug/loesung      -> SolutionScreen
/:facilitySlug/name         -> NameScreen
/:facilitySlug/bestaetigen  -> ConfirmScreen
/:facilitySlug/fertig       -> DoneScreen
/admin/login, /admin, /admin/complaint/:id   (geschützt)
```

- **`useReadAloud.ts`**: `window.speechSynthesis`-Wrapper, `speak()`/`repeat()`, automatisch bei Mount jeder Frage; `de-DE`-Stimme mit Fallback, falls auf dem Kiosk-Gerät keine installiert ist.
- **`useRecorder.ts`**: `getUserMedia` + `MediaRecorder` (webm/opus), `startRecording/stopRecording/audioBlob/playback/reset`. **Kein gleichzeitiges SpeechRecognition auf demselben Stream** (laut Doku auf manchen Geräten unzuverlässig) — erst aufnehmen, danach transkribieren.
- **`useTranscription.ts`**: lazy `@xenova/transformers` Whisper-Pipeline (tiny/base), Singleton-Cache, "Sprachsystem wird geladen…"-Spinner mit Vorlesen.
  - **Risiko**: WASM-Modell-Ladezeit auf echtem Kiosk-Tablet unklar. **Entscheidungspunkt Ende Tag 2**: auf echtem/verfügbarem Gerät testen; falls zu langsam, Fallback auf `window.SpeechRecognition` (Web Speech API, online, sofort) — beides zählt als die im Bewertungsbogen geforderte "verwendete KI", dokumentieren, welcher Weg tatsächlich verschifft wurde.
- **Screens**: dünn, komponieren die Hooks. `NameScreen.tsx` zeigt bei Wahl "Anonym" zusätzlich einen kurzen vorgelesenen Hinweis ("Deine Stimme kann erkennbar sein, auch wenn du anonym bleibst") — konkretes, vorzeigbares Artefakt für die Ethik-Anforderung aus Abschnitt 10. `ConfirmScreen.tsx` postet an `/api/complaints`, behandelt Lade-/Fehler-/Offline-Zustände (Aufnahme darf bei WLAN-Aussetzer nicht verloren gehen — Retry).

---

## 4. Backend-Endpunkte

**`POST /api/complaints`** (öffentlich, kein Login):
- empfängt `multipart/form-data`: `facility_slug`, `problem_text`, `problem_audio`, optional `solution_text/_audio`, `is_anonymous`, optional `name_text/_audio`.
- validiert `facility_slug` gegen Allowlist, prüft Pflichtfeld `problem` serverseitig zusätzlich zur UI.
- lädt Audios via `supabaseAdmin` in den Storage-Bucket, schreibt eine Zeile in `complaints`.
- sendet via `resend.ts` an `process.env.COMPLAINT_RECIPIENT_EMAIL` (nie an den Client zurückgegeben), Betreff mit Einrichtungsname aus `facilityConfig.ts`, Audios als Anhang.
- Antwort nur `{ ok: true, id }` — keine internen Konfigurationsdetails im Response.

**`PATCH /api/complaints/[id]`** (Admin): prüft Supabase-Auth-JWT + Facility-Scope aus `staff`, ändert ausschließlich `status`.

**`GET /api/audio-url`** (Admin): liefert kurzlebige signierte URL, geprüft über `can_access_audio()`.

---

## 5. Verwaltungs-Ansicht

- Supabase Auth (E-Mail/Passwort reicht für den Prototyp; Hashing übernimmt Supabase automatisch).
- `ComplaintList.tsx` fragt `complaints` direkt mit dem anon-Key + eingeloggter Session ab — RLS filtert automatisch auf die eigene Einrichtung. `StatusFilter.tsx` für offen/in Bearbeitung/erledigt.
- `ComplaintDetail.tsx`: Volltext, Audio-Buttons holen sich die signierte URL erst bei Klick über `/api/audio-url` — hier wird die Anonym-Sperre sichtbar (deaktivierter Button mit Hinweis "Nur für Leitung", wenn nicht berechtigt).
- Erste Staff-Accounts diese Woche manuell über Supabase Studio anlegen, kein Self-Signup nötig.

---

## 6. Sicherheits-Checkliste → Bewertungsbogen

| Maßnahme | Bewertungspunkt | Wo |
|---|---|---|
| HTTPS überall | Verschlüsselung Übertragung | automatisch via Vercel/Supabase |
| Verschlüsselung at rest | Verschlüsselung Ruhezustand | Supabase-Standard |
| Gehashte Passwörter | explizit gefordert | Supabase Auth (bcrypt intern) |
| Row-Level-Security | Sicherheitsaspekte 5% | `0001_init.sql` |
| Secrets nur in Env-Vars | explizit gefordert | nie im `frontend/`-Bundle |
| Datenminimierung | Doku Abschnitt 10 | keine IP/Geräte-Kennung in `complaints` |
| Zugriffsbeschränkung anonymes Audio | ethische Fragestellung | `can_access_audio()` + `audio-url.ts` |
| Hinweis bei Anonym-Wahl | ethische Fragestellung | `NameScreen.tsx` |
| Server-seitige Validierung | allgemein | `api/complaints.ts` |
| Löschkonzept (Entscheidung, nicht zwingend Automatisierung) | offene Frage aus Doku | als Absatz in der Kurzdoku festhalten |

---

## 7. Tagesplan, drei parallele Workstreams

**WS-A Bewohner-Frontend** · **WS-B Backend+DB+Mail** · **WS-C Admin+Sicherheit+Doku**
(Bei nur 2 Personen: Person 1 = WS-A, Person 2 = WS-B+WS-C zusammen.)

- **Tag 1 (Mo)** — Alle: Vite/Tailwind-Scaffold, Vercel-Projekt verknüpfen, Payload-Vertrag (Felder) früh einfrieren. WS-B: Supabase-Projekt (Frankfurt) anlegen, Migration schreiben & ausführen, Bucket anlegen. WS-C: Logbuch starten, Kurzdoku-Grundgerüst aus dem Brainstorming-Dokument ableiten. WS-A: alle 6 Routen als Klick-Dummy verdrahten.
- **Tag 2 (Di)** — WS-A: `useReadAloud`/`useRecorder`/`RecordControls`, alle Screens mit echter Aufnahme+Wiedergabe, Barrierefreiheits-Pass; **Entscheidungspunkt Ende Tag 2**: Whisper vs. Web-Speech-Fallback testen & festlegen. WS-B: `supabaseAdmin`/`resend`-Clients, `api/complaints.ts` Happy-Path gegen Migration testen (curl/Postman, unabhängig vom Frontend). WS-C: Resend-Account + Domain-Verifizierung, RLS-Policies (mit WS-B abstimmen), Sicherheits-Doku-Abschnitt starten. **Sync:** Payload-Feldnamen zwischen WS-A und WS-B einfrieren.
- **Tag 3 (Mi)** — WS-A: `ConfirmScreen` an `/api/complaints` anbinden, Transkriptions-Entscheidung integrieren. WS-B: Audio-Upload+Mail-Versand fertig, **mit echten Beispielsätzen** end-to-end testen. WS-C: `LoginScreen` + Supabase Auth, `ComplaintList` gegen echte Daten. **Kritischer Sync:** kompletter Pfad Tablet→Mail+DB muss mindestens einmal gemeinsam funktionieren.
- **Tag 4 (Do)** — WS-A: Polishing nach Tag-3-Bugs, Cross-Device-Test. WS-B: `can_access_audio()` + `audio-url.ts`, Status-PATCH-Endpunkt, optional LLM-Kategorisierung (zuletzt, nur falls Zeit). WS-C: `ComplaintDetail.tsx` fertig, Sicherheits-Doku abschließen, Präsentations-Gerüst starten. Alle: gemeinsamer Testlauf inkl. Fehlerfälle (kein Mikrofon-Zugriff, Netzwerkausfall, Anonym-Sperre im Admin).
- **Tag 5 (Fr)** — Alle: Deploy auf Vercel, Smoke-Test mit jedem Einrichtungs-Slug; Kurzdoku fertigstellen (4-6 Seiten, alle Pflichtinhalte aus dem Bewertungsbogen); Präsentation (15-20 Min) bauen; Retrospektive schreiben; Puffer + finaler Abgleich gegen `docs/BewertungsBogen.pdf` Zeile für Zeile.

---

## 8. Manuelle Setup-Schritte (außerhalb des Codes)

1. **Supabase**: Account → neues Projekt, Region **Frankfurt** → URL/anon-key/service-role-key notieren → Auth (E-Mail/Passwort) aktivieren → privaten Bucket `complaint-audio` anlegen.
2. **Resend**: Account → Sende-Domain verifizieren (DNS); falls keine eigene Domain verfügbar, Sandbox-Sender für den Prototyp nutzen und das als bekannte Einschränkung in der Doku nennen.
3. **Vercel**: Repo importieren, alle Env-Vars aus Abschnitt 1 setzen, ersten Deploy auslösen.
4. **Kiosk-Start-URLs**: 2-3 Demo-Slugs festlegen (z. B. `wohnform-01`/`-02`/`-03`), volle URLs im Logbuch dokumentieren.
5. **Fully Kiosk Browser / Geführter Zugriff**: falls Hardware verfügbar, Start-URL konfigurieren; falls nicht, bewusst per normalem Browser mit Slug in der URL simulieren und das in der Doku so benennen (nicht stillschweigend weglassen).
6. Mindestens einen Supabase-Auth-Nutzer manuell anlegen (Studio → Authentication) + zugehörige `staff`-Zeile für den Admin-Demo-Login.

---

## 9. Explizite Cut-Liste, falls die Zeit knapp wird

- LLM-Auto-Kategorisierung (laut Doku selbst "optional") — zuerst streichen, im Ausblick erwähnen.
- Echte Kiosk-Hardware/Fully-Kiosk-Konfiguration — sonst per URL-Simulation ersetzen.
- Whisper im Browser, falls Ladezeit auf Testgerät unpraktikabel — Fallback Web Speech API (Abschnitt 3).
- Mehr als 2-3 Einrichtungs-Slugs gleichzeitig demonstrieren — Mechanismus ist generisch, Skalierung auf alle 13 nur im Ausblick erwähnen.
- Kommentar-/Weiterleitungsfunktion im Admin-View — laut Doku selbst offene Frage, diese Woche nur Lesen+Status.
- Automatisierte Löschjobs — nur die Löschkonzept-*Entscheidung* dokumentieren, kein Cron bauen.

---

## Kritische Dateien

- `supabase/migrations/0001_init.sql` — Schema + RLS, alles andere hängt daran.
- `api/complaints.ts` — Vertrag zwischen WS-A und WS-B, früh einfrieren (Tag 1-2).
- `frontend/src/hooks/useRecorder.ts` + `useTranscription.ts` — höchstes technisches Risiko, Fallback-Entscheidung bis Ende Tag 2.
- `frontend/src/lib/facility.ts` — Kiosk-URL-als-Identität ist die zentrale Architekturentscheidung der Doku.
- `frontend/src/screens/NameScreen.tsx` — trägt die Ethik-Anforderung (Anonymitäts-Hinweis) konkret vor.

---

## Verifikation am Ende der Woche

1. `npm run dev` lokal: alle 6 Screens durchklicken, Aufnahme/Wiedergabe/Vorlesen testen.
2. Echte Test-Beschwerde von `/<slug>/` bis "Fertig" absenden → prüfen, dass E-Mail mit Audio-Anhang bei der zentralen Adresse ankommt **und** eine Zeile in `complaints` (Supabase Studio) liegt.
3. Admin-Login → Beschwerde erscheint in der Liste, Status änderbar, Audio-Wiedergabe funktioniert (und ist bei anonymen Beschwerden korrekt eingeschränkt).
4. Deploy-URL auf einem Tablet/Handy-Browser öffnen, Touch-Targets und Vorlesen auf einem realen Mobilgerät prüfen.
5. `docs/BewertungsBogen.pdf` Zeile für Zeile gegen die Doku/Präsentation abgleichen, bevor abgegeben wird.
