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
- [ ] `useTranscription` (Whisper im Browser) + Web-Speech-Fallback-Entscheidung
- [ ] `ConfirmScreen` an `/api/complaints` anbinden (sendet aktuell nichts)
- [ ] Anonymitäts-Hinweis in `NameScreen.tsx` (Ethik-Anforderung aus dem Brainstorming)
- [ ] Barrierefreiheits-Pass (Touch-Targets, Contrast, Screenreader)

## Backend (`api/`)
- [x] `api/complaints.ts` (POST, Multipart-Parsing, Audio-Upload, DB-Insert, Mail-Versand) — typgeprüft, **ungetestet gegen echte Supabase/Resend-Accounts**
- [x] `api/complaints/[id].ts` (PATCH Status, Auth- + Facility-Scope-Prüfung)
- [x] `api/audio-url.ts` (signierte URL, Anonymitäts-Sperre für Audio)
- [x] `_lib/supabaseAdmin.ts`, `_lib/resend.ts`, `_lib/facilityConfig.ts`
- [ ] Echter End-to-End-Test: Beschwerde absenden → Mail mit Anhang kommt an → Zeile in `complaints` sichtbar
- [ ] `facilityConfig.ts` mit den echten Einrichtungs-Slugs/Namen befüllen (aktuell nur Platzhalter `wohnform-01/-02/-03`)

## Datenbank (Supabase)
- [x] `supabase/migrations/0001_init.sql` (Tabellen `complaints`/`staff`, RLS-Policies, privater Storage-Bucket)
- [x] Migration via Supabase-MCP ausgeführt (Tabellen + RLS aktiv, Bucket `complaint-audio` angelegt)
- [x] Admin-Account `jonas.boos@mailbox.org` (Rolle: `leitung`) + `staff`-Zeile via SQL angelegt

## Admin-/Verwaltungs-Ansicht
- [x] Platzhalter-Routing (`AdminApp`, `LoginScreen`, `ComplaintList`, `ComplaintDetail`)
- [ ] Supabase-Auth-Login funktionsfähig
- [ ] `ComplaintList` gegen echte Daten (RLS-gefiltert nach Einrichtung)
- [ ] `ComplaintDetail` mit Status-Änderung + Audio-Wiedergabe über `/api/audio-url`
- [ ] Sichtbare Anonym-Sperre im UI (deaktivierter Audio-Button mit Hinweis "Nur für Leitung")

## Sicherheit / Bewertungsbogen
- [x] RLS-Policies (anon insert-only, authenticated facility-scoped)
- [x] Secrets ausschließlich in `.env`/Vercel-Env-Vars, nicht im Frontend-Bundle
- [x] Server-seitige Validierung in `api/complaints.ts` (Slug-Allowlist-Pattern, Pflichtfeld-Check)
- [ ] Sicherheits-Doku-Abschnitt (Verschlüsselung, Passwort-Hashing, Datenminimierung) ausformuliert
- [ ] Löschkonzept-Entscheidung dokumentiert (kein Code nötig, nur Festlegung)
- [ ] `npm audit`-Befund (3 high, 1 critical, transitiv über `@xenova/transformers`) bewusst akzeptiert und begründet dokumentiert

## Doku & Präsentation
- [ ] Kurzdokumentation (4-6 Seiten) geschrieben
- [ ] Präsentation (15-20 Min) erstellt
- [ ] Retrospektive geschrieben
- [ ] Logbuch geführt

## Nächste konkrete Schritte
1. `useReadAloud` (Vorlesen der Fragen per SpeechSynthesis) bauen.
2. `useRecorder` (echte Audioaufnahme via MediaRecorder) bauen — höchstes technisches Risiko.
3. `useTranscription` (Whisper im Browser) + Entscheidung Web-Speech-Fallback End-of-Tag-2.
