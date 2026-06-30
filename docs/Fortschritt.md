# Fortschritts-Board "Meine Stimme"

Stand: 29.06.2026 (Tag 1 von 5). Siehe `plan.md` für den vollständigen Umsetzungsplan.

## Projekt-Setup
- [x] Monorepo-Struktur (`frontend/` Workspace + root `api/`)
- [x] Vite + React + TypeScript + Tailwind v4 im Frontend
- [x] `vercel.json` (SPA-Rewrites + `/api`-Routing)
- [x] `.gitignore` (Secrets, `node_modules`, Build-Output)
- [x] `.env.example` mit den tatsächlichen Key-Namen
- [ ] Supabase-Projekt wirklich angelegt/verifiziert (Region Frankfurt) — Keys liegen in `.env`, Projekt-Status nicht geprüft
- [ ] Resend-Account + Sende-Domain verifiziert (aktuell Platzhalter-Absender `beschwerde@meine-stimme.app`)
- [ ] Vercel-Projekt importiert + Env-Vars dort gesetzt
- [ ] `COMPLAINT_RECIPIENT_EMAIL` festgelegt (zentrale Empfangsadresse für Beschwerden)

## Frontend (Bewohner-Ansicht)
- [x] Routing für alle 6 Screens (`/:facilitySlug` → Start/Problem/Lösung/Name/Bestätigen/Fertig)
- [x] Klick-Dummy für alle 6 Screens, Production-Build getestet
- [x] `lib/facility.ts` (Kiosk-URL-als-Identität) geschrieben und über `useFacilitySlug()` in allen 6 Screens verdrahtet (statt `useParams()`)
- [x] `useReadAloud` (Vorlesen der Fragen per SpeechSynthesis, de-DE)
- [x] `useRecorder` (echte Audioaufnahme via MediaRecorder, webm/opus)
- [x] `RecordControls`-Komponente (Aufnehmen/Stopp/Anhören/Neu), in Problem-/Lösung-/NameScreen eingebaut
- [x] Anonymitäts-Hinweis in `NameScreen.tsx` sichtbar ("Stimme kann erkennbar sein", Ethik-Anforderung)
- [x] UI nach `docs/ui_konzept/` umgesetzt: echte Icons (lucide-react), Nunito-Font, Marken-Farben, großer Mic-Knopf, KioskFrame-Layout, kontrastreiche große Buttons
- [x] `useTranscription` (Whisper-base via Transformers.js, lazy geladen) — erkannter Text wird unter der Aufnahme und als Zusammenfassung auf dem Bestätigen-Screen angezeigt
- [x] Erkannter Text ist editierbar + Tastatur-Eingabe als Alternative (Tastatur-Symbol), wichtig v. a. für Namen; bei Erkennungsfehler automatisch leeres Tippfeld
- [x] `ConfirmScreen` „Anhören" spielt alle Audios nacheinander ab (Problem → Idee → Name)
- [x] Anonym-Warnung entfernt (verwirrte Nutzer); „Anonym" geht direkt weiter
- [ ] **Entscheidungspunkt**: Whisper-Ladezeit/Genauigkeit auf echtem Tablet testen — ggf. Web-Speech-Fallback oder whisper-base
- [x] `ConfirmScreen` an `/api/complaints` angebunden (multipart-Upload, Lade-/Fehlerzustand, Aufnahme bleibt bei Fehler erhalten)
- [ ] Barrierefreiheits-Pass auf echtem Tablet (Touch-Targets, Contrast, Screenreader)

## Backend (`api/`)
- [x] `api/complaints.ts` (POST, Multipart-Parsing, Audio-Upload, DB-Insert, Mail-Versand) — **gegen echte Supabase/Resend getestet** (Text-Beschwerde: 200, DB-Zeile + Mail OK)
- [x] `api/complaints/[id].ts` (PATCH Status, Auth- + Facility-Scope-Prüfung)
- [x] `api/audio-url.ts` (signierte URL, Anonymitäts-Sperre für Audio)
- [x] `_lib/supabaseAdmin.ts`, `_lib/resend.ts`, `_lib/facilityConfig.ts`
- [x] Lokaler API-Dev-Server (`scripts/dev-api.ts`, `npm run dev:api`) für Test ohne Vercel
- [x] Resend-Absender auf Sandbox `onboarding@resend.dev` umgestellt (eigene Domain via `RESEND_FROM`)
- [ ] Voller Audio-End-to-End-Test über die UI (Aufnahme → Mail mit Audio-Anhang) auf echtem Gerät
- [ ] `facilityConfig.ts` mit den echten Einrichtungs-Slugs/Namen befüllen (aktuell nur Platzhalter `wohnform-01/-02/-03`)

## Datenbank (Supabase)
- [x] `supabase/migrations/0001_init.sql` (Tabellen `complaints`/`staff`, RLS-Policies, privater Storage-Bucket)
- [x] Migration via Supabase-MCP ausgeführt (Tabellen + RLS aktiv, Bucket `complaint-audio` angelegt)
- [x] Admin-Account `jonas.boos@mailbox.org` (Rolle: `leitung`) + `staff`-Zeile via SQL angelegt

## Admin-/Verwaltungs-Ansicht
- [x] Platzhalter-Routing (`AdminApp`, `LoginScreen`, `ComplaintList`, `ComplaintDetail`)
- [x] Supabase-Auth-Login funktionsfähig (`signInWithPassword`, Session-Guard in `AdminApp`)
- [x] `ComplaintList` gegen echte Daten (RLS-gefiltert nach Einrichtung) + Status-Filter
- [x] `ComplaintDetail` mit Status-Änderung (PATCH) + Audio-Wiedergabe über `/api/audio-url`
- [x] Sichtbare Anonym-Sperre im UI (gesperrter Audio-Button mit Hinweis "Nur für Leitung")
- [ ] Admin-Flow auf echtem Login getestet (E2E: anmelden → Liste → Status ändern → Audio)

## Sicherheit / Bewertungsbogen
- [x] RLS-Policies (anon insert-only, authenticated facility-scoped)
- [x] Secrets ausschließlich in `.env`/Vercel-Env-Vars, nicht im Frontend-Bundle
- [x] Server-seitige Validierung in `api/complaints.ts` (Slug-Allowlist-Pattern, Pflichtfeld-Check)
- [ ] Sicherheits-Doku-Abschnitt (Verschlüsselung, Passwort-Hashing, Datenminimierung) ausformuliert
- [ ] Löschkonzept-Entscheidung dokumentiert (kein Code nötig, nur Festlegung)
- [ ] `npm audit`-Befund (3 high, 1 critical, transitiv über `@xenova/transformers`) bewusst akzeptiert und begründet dokumentiert

## Doku & Präsentation
- [x] Kurzdokumentation (`docs/Kurzdokumentation.md`) geschrieben — alle Pflichtinhalte des Bewertungsbogens abgedeckt
- [ ] Präsentation (15-20 Min) erstellt
- [ ] Retrospektive geschrieben
- [ ] Logbuch geführt

## Nächste konkrete Schritte
1. `useReadAloud` (Vorlesen der Fragen per SpeechSynthesis) bauen.
2. `useRecorder` (echte Audioaufnahme via MediaRecorder) bauen — höchstes technisches Risiko.
3. `useTranscription` (Whisper im Browser) + Entscheidung Web-Speech-Fallback End-of-Tag-2.
