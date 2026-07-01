# Fortschritts-Board „Meine Stimme"

Stand: 01.07.2026. Siehe `plan.md` für den vollständigen Umsetzungsplan.
Prototyp ist **live deployed** (https://meine-stimme.jutio.org) und end-to-end funktionsfähig.

## Projekt-Setup
- [x] Monorepo-Struktur (`frontend/` Workspace + root `api/`)
- [x] Vite + React + TypeScript + Tailwind v4 im Frontend
- [x] `vercel.json` (SPA-Rewrite mit negativem Lookahead, `/api/*` via Dateisystem-Routing)
- [x] `.gitignore` (Secrets, `node_modules`, Build-Output)
- [x] `.env.example` mit den tatsächlichen Key-Namen
- [x] Supabase-Projekt angelegt (Region Frankfurt), Migration + Bucket aktiv
- [x] Resend-Account aktiv, eigene Domain **jutio.org** verifiziert (`RESEND_FROM=noreply@meinestimme.jutio.org`) — löst das frühere Blacklist-/Sandbox-Problem
- [x] Vercel-Projekt verbunden (GitHub-Auto-Deploy auf `main`), Env-Vars gesetzt, eigene Domain `meine-stimme.jutio.org`, Live + API/DB-Pfad in Produktion getestet
- [x] `COMPLAINT_RECIPIENT_EMAIL` gesetzt (zentrale Empfangsadresse)

## Frontend (Bewohner-Ansicht)
- [x] Routing für alle 6 Screens (`/:facilitySlug` → Start/Problem/Lösung/Name/Bestätigen/Fertig)
- [x] `lib/facility.ts` (Kiosk-URL-als-Identität) über `useFacilitySlug()` in allen Screens
- [x] Vorlesen der Fragen: vorproduzierte WAV-Voicelines + SpeechSynthesis-Fallback (de-DE)
- [x] Echte Audioaufnahme via MediaRecorder (webm/opus)
- [x] `RecordControls` (feldbasiert), stoppt laufende Voiceline beim Start der Aufnahme (sauberer Record)
- [x] UI nach `docs/ui_konzept/` umgesetzt: lucide-Icons, Marken-Farben, großer Mic-Knopf, KioskFrame
- [x] Whisper-base (Transformers.js, lazy geladen als eigenes Modul `lib/transcriber.ts`)
- [x] Erkannter Text editierbar + Tastatur-Eingabe als Alternative (v. a. für Namen)
- [x] **Hintergrund-Transkription**: durchklicken ohne Warten; Submit wartet bei Bedarf (`awaitTranscriptions()`)
- [x] `ConfirmScreen` „Anhören" spielt alle Audios nacheinander ab
- [x] `ConfirmScreen` an `/api/complaints` angebunden (Multipart, Lade-/Fehlerzustand, Aufnahme bleibt bei Fehler erhalten)
- [x] **Aufnahmen werden vor Versand nach WAV konvertiert** (`lib/audioConvert.ts`) — in Mail-Programmen abspielbar
- [ ] Barrierefreiheits-Pass auf echtem Tablet (Touch-Targets, Contrast, Screenreader)
- [ ] **Entscheidungspunkt**: Whisper-Ladezeit/Genauigkeit auf echtem Kiosk-Tablet testen

## Backend (`api/`)
- [x] `api/complaints.ts` (POST, Multipart, Audio-Upload, DB-Insert, Mail-Versand) — gegen echte Supabase/Resend getestet; Audios als `.wav`
- [x] `api/complaints/[id].ts` (PATCH Status **und** DELETE inkl. Storage-Löschung, Auth- + Facility-Scope)
- [x] `api/audio-url.ts` (signierte URL 60 s, Anonymitäts-Sperre für Audio)
- [x] `_lib/supabaseAdmin.ts`, `_lib/resend.ts`, `_lib/facilityConfig.ts`
- [x] Lokaler API-Dev-Server (`scripts/dev-api.ts`, `npm run dev:api`)
- [x] Mail-Fehlerbehandlung: `resend` liefert `{error}` statt zu werfen → explizit geprüft
- [x] Routing-Bug behoben: PATCH `/api/complaints/:id` gab 405 (redundante Rewrite entfernt)
- [ ] `facilityConfig.ts` mit den **echten** Einrichtungs-Slugs/Namen befüllen (aktuell `wohnform-01/-02/-03`)

## Datenbank (Supabase)
- [x] `supabase/migrations/0001_init.sql` (`complaints`/`staff`, RLS-Policies, privater Bucket)
- [x] Migration via Supabase-MCP ausgeführt (Tabellen + RLS aktiv, Bucket `complaint-audio`)
- [x] Admin-Account (Rolle `leitung`) + `staff`-Zeile angelegt; Login-Problem (`instance_id`) behoben

## Admin-/Verwaltungs-Ansicht
- [x] Supabase-Auth-Login (`signInWithPassword`, Session-Guard in `AdminApp`)
- [x] `ComplaintList` gegen echte Daten (RLS-gefiltert) + Status-Filter
- [x] `ComplaintDetail` mit Status-Änderung (PATCH)
- [x] Sichtbare Anonym-Sperre im UI (gesperrter Audio-Button „Nur für Leitung")
- [x] **Audio-Waveform-Player** (`AdminAudioPlayer`): echte Wellenform, Play/Pause, Fortschritt, Klick-zum-Spulen
- [x] **Nur das zuletzt geklickte Audio spielt** (globaler `registerPlayback`-Controller)
- [x] **Beschwerden löschen** (Detail, mit Bestätigung; entfernt auch die Audiodateien)
- [ ] Admin-Flow auf echtem Login-Gerät E2E getestet (anmelden → Liste → Status → Audio → löschen)

## Sicherheit / Bewertungsbogen
- [x] RLS-Policies (anon insert-only, authenticated facility-scoped, kein Delete über RLS)
- [x] Secrets ausschließlich in `.env`/Vercel-Env-Vars, nicht im Frontend-Bundle
- [x] Server-seitige Validierung in `api/complaints.ts` (Slug-Allowlist, Pflichtfeld)
- [x] Sicherheits-/Datenschutz-Abschnitt ausformuliert (Kurzdoku Abschnitt 10, Präsentation Abschnitt 9)
- [x] Löschkonzept-Entscheidung dokumentiert (12 Monate / anonym sofort)
- [x] `npm audit`-Befund (14 transitiv, über `@vercel/node` + `@xenova/transformers`) bewusst akzeptiert + begründet dokumentiert (Kurzdoku/Präsentation/README)

## Doku & Abgaben
- [x] **Kurzdokumentation** (`docs/Kurzdokumentation.md`) — alle Pflichtinhalte, echte Screenshots
- [x] **Professionelle README** (`README.md`) mit Inhaltsverzeichnis + Screenshot-Übersicht
- [x] **Präsentation** (`docs/Praesentation.md`) — deckt jeden Bewertungsbogen-Punkt ab, mit Code-Snippets + DB-Erklärung
- [x] **Retrospektive** (`docs/Retrospektive.md`) — eigenständige Abgabe, zielgerichtet & umfassend
- [x] Echte UI-Screenshots (`docs/ui/`) inkl. Montage-Übersicht
- [x] Logbuch/Fortschritts-Board geführt (dieses Dokument)

## Was noch offen ist (Rest-To-dos)
1. **Test auf echtem Kiosk-Tablet**: Whisper-Ladezeit/Genauigkeit, Touch-Targets, Vorlesen, Audio-E2E.
2. **`facilityConfig.ts`**: echte Einrichtungs-Slugs/Namen statt Platzhalter.
3. **Admin-E2E** einmal komplett auf echtem Gerät durchspielen (inkl. Löschen).
4. Optional/Ausblick: LLM-Kategorisierung, automatisierte Löschjobs, Kommentar-/Weiterleitungsfunktion.
