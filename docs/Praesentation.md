# Meine Stimme — Präsentation

**Barrierefreie, sprachbasierte Beschwerde-App für Menschen mit geistiger Behinderung in Besonderen Wohnformen**

HIT12 · Praktikumsersatzleistung „AWE mit KI“ · Projektwoche 29.06.–03.07.2026
**Team:** Monstroxx · TagerTi

**Live-Demo:** https://meine-stimme.jutio.org/wohnform-01
**Code:** https://github.com/Monstroxx/Meine_Stimme

> Dieses Dokument enthält alle Inhalte für die Abschlusspräsentation (ca. 15–20 Min) und deckt
> jeden Punkt des Bewertungsbogens ab: Problem, Lösung, verwendete KI, Entwicklungsprozess,
> Herausforderungen & Lösungswege, Sicherheit, Teamarbeit und Retrospektive — mit den
> wichtigsten Code-Snippets und einer Erklärung der Datenbank.

---

## Inhaltsverzeichnis

1. [Das Problem & die gesellschaftliche Relevanz](#1-das-problem--die-gesellschaftliche-relevanz)
2. [Zielgruppe](#2-zielgruppe)
3. [Unsere Lösung & die Oberfläche](#3-unsere-lösung--die-oberfläche)
4. [Funktionen & mehrere Ebenen](#4-funktionen--mehrere-ebenen)
5. [Die verwendete KI — Whisper](#5-die-verwendete-ki--whisper)
6. [Architektur & Datenfluss](#6-architektur--datenfluss)
7. [Die Datenbank erklärt](#7-die-datenbank-erklärt)
8. [Code erklärt — die wichtigsten Snippets](#8-code-erklärt--die-wichtigsten-snippets)
9. [Sicherheit, Datenschutz & Ethik](#9-sicherheit-datenschutz--ethik)
10. [Verwendete Werkzeuge, Sprachen & KI-Dienste](#10-verwendete-werkzeuge-sprachen--ki-dienste)
11. [Der Entwicklungsprozess](#11-der-entwicklungsprozess)
12. [Herausforderungen & Lösungswege](#12-herausforderungen--lösungswege)
13. [Teamarbeit](#13-teamarbeit)
14. [Retrospektive](#14-retrospektive)
15. [Ausblick](#15-ausblick)
16. [Quellen & Vorbilder](#16-quellen--vorbilder)

---

## 1. Das Problem & die gesellschaftliche Relevanz

Menschen mit geistiger Behinderung leben in **Besonderen Wohnformen** in einem starken
**Abhängigkeits- und Machtgefälle** gegenüber den Assistent:innen, die sie rund um die Uhr betreuen.
Sich zu beschweren ist für sie **doppelt schwer**:

- **Sprach- & Schreibbarriere** — der bisherige Papierbogen „Besser werden“ setzt Lesen und
  Schreiben voraus. Das schließt viele Bewohner:innen von vornherein aus.
- **Soziale Hürde** — die Beschwerde muss einer betreuenden Person persönlich übergeben werden,
  obwohl sie sich genau gegen diese Person richten kann (**Gewaltschutz**).

**Warum das gesellschaftlich relevant ist** — Meine Stimme stärkt drei zentrale Werte:

1. **Selbstbestimmung & Teilhabe** — Betroffene äußern ihr Anliegen selbstständig, ohne fremde Hilfe.
2. **Inklusion & Barrierefreiheit** — Sprache statt Schrift, Vorlesen statt Lesen.
3. **Gewaltschutz** — eine anonyme, niederschwellige Meldung, die das Machtgefälle umgeht und
   direkt die Leitung erreicht.

Das Recht auf Beschwerde ohne Nachteile ist in **§§ 7, 8 BTHG** und im Wohn- und Teilhaberecht
verankert — eine barrierefreie Umsetzung ist gesetzlicher **und** ethischer Auftrag der Einrichtungen.

---

## 2. Zielgruppe

| Gruppe | Rolle in der App |
| :--- | :--- |
| **Bewohner:innen** mit geistiger Behinderung *(Haupt-Zielgruppe)* | Geben Beschwerden per Sprache am Kiosk-Tablet ab — **ganz ohne Login**. |
| **Leitung** der Wohnform | Sieht alle Beschwerden, ändert den Status, darf auch anonyme Aufnahmen anhören. |
| **Betreuer:innen** | Sehen Beschwerden der eigenen Einrichtung, dürfen anonyme Audios aber **nicht** anhören. |

Sekundär profitiert der **Träger** (im Vorbild 13 Einrichtungen): Beschwerden kommen zentral,
strukturiert und nachverfolgbar an — statt auf verteilten Papierbögen.

---

## 3. Unsere Lösung & die Oberfläche

**Meine Stimme** ist eine digitale, barrierefreie Beschwerdemöglichkeit. Statt zu schreiben,
**sprechen** die Bewohner:innen ihr Anliegen auf ein Tablet. Die App liest jede Frage vor, nimmt
die Antwort als Sprache auf, wandelt sie per KI in Text um und schickt Beschwerde, Text **und**
Audioaufnahme an eine zentrale Stelle.

Der Ablauf ist bewusst auf das Nötigste reduziert: **eine Frage pro Bildschirm**, große Knöpfe,
echte Symbole, Vorlesefunktion. Vorbild für die Bedienung ist das barrierefreie Lernsystem *Mebis*.

![Übersicht aller Screens](ui/overview_all.png)

**Der Bewohner-Flow (6 Ebenen):**

| Start | Problem | Lösung |
| :---: | :---: | :---: |
| ![Start](ui/1_start.png) | ![Problem](ui/2_problem.png) | ![Lösung](ui/3_loesung.png) |
| Große Begrüßung, ein Knopf | Aufnahme per Mikro-Knopf | Optionaler Lösungsvorschlag |

| Name | Bestätigen | Fertig |
| :---: | :---: | :---: |
| ![Name](ui/4_name.png) | ![Senden](ui/5_senden.png) | ![Fertig](ui/6_fertig.png) |
| Name sagen **oder** anonym | Anhören & absenden | Freundliche Bestätigung |

**Die geschützte Verwaltungs-Ansicht:**

![Verwaltung](ui/7_verwaltung.png)

---

## 4. Funktionen & mehrere Ebenen

**Mehrere Ebenen:** Start → Problem → Lösung → Name → Bestätigen → Fertig **+** Verwaltungs-Ansicht.

**≥ 3 Funktionen ohne Login (Bewohner):**

1. **Spracheingabe / -aufnahme** (MediaRecorder)
2. **Automatisches Vorlesen** jeder Frage
3. **Eigene Antwort anhören**
4. **Anonym-Umschalter**
5. **KI-Transkription** mit Korrekturmöglichkeit
6. **Tastatur-Eingabe** als gleichwertige Alternative
7. **Absenden** → E-Mail + Datenbank

**Zusatzfunktionen (ZP):**

- **Audio-Anhang** an die E-Mail (als WAV, damit überall abspielbar)
- **Login & rollenbasierter Zugriff** (Leitung / Betreuer)
- **Status-Verwaltung** (offen / in Bearbeitung / erledigt)
- **Wellenform-Player** in der Verwaltung (Play/Pause, Fortschritt, Klick-zum-Spulen; nur das zuletzt geöffnete Audio spielt)
- **Löschen** von Beschwerden inkl. der Audiodateien
- **Hintergrund-Transkription** — durchklicken ohne Warten (siehe [Snippet 3](#83-hintergrund-transkription--durchklicken-ohne-warten))

---

## 5. Die verwendete KI — Whisper

Der **KI-Kern** der App ist **Whisper** (OpenAI). Wir nutzen die browserlauffähige Variante
`Xenova/whisper-base` über **Transformers.js**.

| | |
| :--- | :--- |
| **Was** | *Automatic Speech Recognition* — wandelt gesprochene Sprache in Text um. |
| **Wo** | Läuft **komplett lokal im Browser** (WebAssembly). Die Audiodaten verlassen das Gerät für die Erkennung **nicht**. |
| **Warum so** | Datenschutzfreundlich, kein externer KI-Dienst, keine laufenden Kosten. Das Modell wird per dynamischem Import **lazy** geladen, damit der Kiosk schnell startet. |

**Offenlegung des KI-Einsatzes** (laut Aufgabenstellung Pflicht):

- **Whisper** ist die **eingesetzte KI** der App (Spracherkennung).
- Bei der **Entwicklung** diente zusätzlich **Claude (Anthropic)** als KI-Assistent für Code,
  Architektur und Dokumentation.

---

## 6. Architektur & Datenfluss

```
Bewohner-Tablet  (Kiosk-Browser, Einrichtungs-Slug in der Start-URL)
   │  Vorlesen (WAV-Voicelines + SpeechSynthesis-Fallback)
   │  Aufnahme (MediaRecorder → WebM/Opus), vor Versand nach WAV konvertiert
   │  KI: Whisper im Browser  →  transkribierter Text
   ▼
Vercel Serverless Function   POST /api/complaints
   ├──▶ Supabase Storage      complaint-audio/{slug}/{id}/problem.wav …
   ├──▶ Supabase PostgreSQL   INSERT INTO complaints …
   └──▶ Resend                E-Mail mit Text + Audio-Anhang an zentrale Adresse
                                   │
Verwaltungs-Ansicht  /admin  ◀────┘
   ├── GET   complaints             (RLS: nur eigene Einrichtung)
   ├── PATCH /api/complaints/:id     (Status ändern, Auth-geprüft)
   └── GET   /api/audio-url          (signierte URL, Anonym-Sperre)
```

Zwei zentrale Architektur-Entscheidungen:

- **Kiosk-Identität über die URL:** Der Einrichtungs-Slug (z. B. `/wohnform-03`) kommt
  ausschließlich aus dem URL-Pfad — frisch bei jedem Laden, **kein Cookie, kein Login**.
- **Hintergrund-Transkription:** Die KI läuft, während der Nutzer schon weiterklickt. Erst beim
  Absenden wartet die App bei Bedarf, bis alle Texte erkannt sind.

---

## 7. Die Datenbank erklärt

Wir nutzen **Supabase** (gehostetes PostgreSQL, Region **Frankfurt**) mit **Row-Level-Security (RLS)**
und einem **privaten Storage-Bucket** für die Audiodateien. Das komplette Schema liegt in
[`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql).

### 7.1 Tabelle `complaints` — die Beschwerden

```sql
create table if not exists complaints (
  id                  uuid primary key default gen_random_uuid(),
  facility_slug       text not null,          -- welche Einrichtung (aus der Kiosk-URL)
  problem_text        text,                   -- transkribierter Text (Pflicht: Text ODER Audio)
  problem_audio_path  text,                   -- Pfad zur Audiodatei im Storage
  solution_text       text,                   -- optionaler Lösungsvorschlag
  solution_audio_path text,
  is_anonymous        boolean not null default true,
  name_text           text,                   -- nur wenn nicht anonym
  name_audio_path     text,
  status              text not null default 'offen'
                      check (status in ('offen', 'in_bearbeitung', 'erledigt')),
  created_at          timestamptz not null default now()
);

create index if not exists complaints_facility_slug_idx on complaints (facility_slug);
```

**Erklärung der Entscheidungen:**

- **`id uuid`** statt fortlaufender Zahl → IDs sind nicht erratbar und geben nicht preis, wie viele
  Beschwerden es gibt.
- **Je Feld ein Text- *und* ein Audio-Pfad** → wir speichern beides: den KI-Text *und* die
  Originalaufnahme. Die Aufnahme ist das „Beweismittel“, falls die Erkennung etwas verfälscht.
- **`is_anonymous` default `true`** → **Datensparsamkeit by default**: ohne aktive Namensangabe
  bleibt die Beschwerde anonym.
- **`status` mit `check`-Constraint** → die Datenbank lässt nur die drei erlaubten Zustände zu;
  ein ungültiger Status ist technisch unmöglich.
- **Index auf `facility_slug`** → die Verwaltung filtert immer nach Einrichtung; der Index hält das schnell.
- **Bewusst *keine* Spalten** für IP-Adresse, Geräte-Kennung o. Ä. → **Datenminimierung**.

### 7.2 Tabelle `staff` — wer darf was sehen

```sql
create table if not exists staff (
  user_id       uuid primary key references auth.users (id) on delete cascade,
  facility_slug text,     -- null = Leitung (sieht ALLE Einrichtungen)
  role          text not null default 'betreuer'
                check (role in ('betreuer', 'leitung'))
);
```

- Verknüpft einen **Supabase-Auth-Nutzer** (`auth.users`) mit einer **Einrichtung** und einer **Rolle**.
- **`facility_slug = null`** bedeutet **Leitung** und sieht alle Einrichtungen; ein gesetzter Slug
  beschränkt eine Betreuungsperson auf *ihre* Einrichtung.
- **`on delete cascade`** → wird der Login-Account gelöscht, verschwindet auch die Zuordnung.
- Passwörter stehen **nicht** hier — die verwaltet Supabase Auth (bcrypt-Hash), nie im Klartext.

### 7.3 Row-Level-Security (RLS) — die Datenbank schützt sich selbst

RLS ist auf beiden Tabellen aktiv. Das heißt: Die **Datenbank selbst** entscheidet bei *jeder*
Abfrage, welche Zeilen ein:e Nutzer:in sehen oder ändern darf — nicht erst die Anwendung.

```sql
alter table complaints enable row level security;
alter table staff       enable row level security;

-- 1) Kiosk sendet OHNE Login → anon darf NUR anlegen (kein Lesen/Ändern/Löschen)
create policy "anon kann beschwerden anlegen"
  on complaints for insert to anon
  with check (true);

-- 2) Personal sieht nur Beschwerden der EIGENEN Einrichtung
create policy "staff sieht beschwerden der eigenen einrichtung"
  on complaints for select to authenticated
  using (
    exists (
      select 1 from staff
      where staff.user_id = auth.uid()
        and (staff.facility_slug is null                       -- Leitung: alle
             or staff.facility_slug = complaints.facility_slug) -- Betreuer: nur eigene
    )
  );

-- 3) Personal darf nur den Status der eigenen Einrichtung ändern
create policy "staff aendert status der eigenen einrichtung"
  on complaints for update to authenticated
  using ( /* gleiche Bedingung wie beim Lesen */ );
```

**Was das in der Praxis bedeutet:**

- Das **Tablet** (anonyme Rolle `anon`) kann Beschwerden **nur einreichen** — selbst wenn jemand den
  öffentlichen Schlüssel abgreift, kann er damit **keine** Beschwerden auslesen.
- Angemeldetes **Personal** sieht ausschließlich die Beschwerden **seiner** Einrichtung; die Leitung
  (Slug `null`) sieht alles.
- Es gibt **keine** Delete-Policy für `anon`/`authenticated` → weder das Tablet noch der
  Browser-Client können löschen. Das **manuelle Löschen** in der Verwaltung läuft bewusst
  ausschließlich serverseitig über den geschützten API-Endpunkt (Service-Role, nach Auth- und
  Einrichtungs-Prüfung).

### 7.4 Audio-Speicher — privater Bucket, nur über den Server

```sql
insert into storage.buckets (id, name, public)
values ('complaint-audio', 'complaint-audio', false)   -- public = false!
on conflict (id) do nothing;
```

- Der Bucket ist **nicht öffentlich**. Es gibt **keinen** direkten Client-Zugriff.
- **Upload** und **Download** laufen ausschließlich über die Serverless Functions mit dem
  **Service-Role-Key** (server-only). Dieser Schlüssel umgeht RLS bewusst — deshalb liegt er
  **niemals** im Frontend.
- Zum Anhören stellt der Server nur eine **kurzlebige signierte URL (60 Sekunden)** aus — und erst,
  nachdem die Berechtigung geprüft wurde (siehe [Snippet 5](#85-ethik-anonyme-aufnahmen-nur-für-die-leitung)).

---

## 8. Code erklärt — die wichtigsten Snippets

### 8.1 Einrichtung aus der Kiosk-URL — ohne Cookies

Die zentrale Architektur-Entscheidung. Jedes Tablet startet fest auf einer URL wie `…/wohnform-03`.
Kiosk-Browser leeren beim Neustart Cookies und Cache — die **URL** ist deshalb die einzige
verlässliche Quelle für die Einrichtung.

```ts
// frontend/src/lib/facility.ts
export function getFacilitySlug(pathname = window.location.pathname): string | null {
  const segment = pathname.split('/').filter(Boolean)[0];

  if (segment && segment !== 'admin') {
    window.localStorage.setItem(STORAGE_KEY, segment); // nur Komfort-Fallback
    return segment;
  }
  return window.localStorage.getItem(STORAGE_KEY);
}
```

- Liest den **ersten Pfad-Abschnitt** frisch bei jedem Laden.
- `localStorage` dient **nur** als Notnagel, falls die URL ausnahmsweise keinen Slug enthält.
- Kein Cookie, kein Login — die App weiß trotzdem immer, zu welcher Einrichtung sie gehört.

### 8.2 KI-Spracherkennung im Browser (Whisper)

Das Whisper-Modell wird **einmal** geladen (Singleton) und per **dynamischem Import** aus dem
Haupt-Bundle herausgehalten, damit der Kiosk schnell startet.

```ts
// frontend/src/lib/transcriber.ts
let transcriberPromise: Promise<TranscribeFn> | null = null;

function getTranscriber(): Promise<TranscribeFn> {
  if (!transcriberPromise) {
    transcriberPromise = (async () => {
      const { pipeline, env } = await import('@xenova/transformers'); // lazy: eigenes Bundle
      env.allowLocalModels = false;
      return pipeline('automatic-speech-recognition', 'Xenova/whisper-base');
    })();
  }
  return transcriberPromise; // Singleton: Modell nur einmal laden
}

export async function transcribeBlob(blob: Blob): Promise<string> {
  const url = URL.createObjectURL(blob);
  try {
    const transcriber = await getTranscriber();
    const output = await transcriber(url, { language: 'german', task: 'transcribe' });
    return (Array.isArray(output) ? output.map((o) => o.text).join(' ') : output.text).trim();
  } finally {
    URL.revokeObjectURL(url); // Speicher wieder freigeben
  }
}
```

- **Singleton** → Modell/WASM wird nur einmal geladen und wiederverwendet.
- **`language: 'german'`** → deutsche Erkennung.
- Weil Spracherkennung nie perfekt ist (besonders bei Eigennamen), ist der Text **editierbar** und es
  gibt eine **Tastatur-Eingabe** als Alternative.

### 8.3 Hintergrund-Transkription — durchklicken ohne Warten

Damit niemand auf die KI warten muss, startet die Erkennung im **Hintergrund**, während der Nutzer
schon weiterklickt. Ein **Token-System** verhindert, dass ein spätes Ergebnis eine neue Aufnahme
überschreibt.

```ts
// frontend/src/state/complaintStore.ts (Auszug)
recordField: (field, blob) => {
  const token = (tokens[field] += 1);
  set({ [`${field}Blob`]: blob, [`${field}Status`]: 'pending' });

  inflight[field] = (async () => {
    const text = await transcribeBlob(blob);
    if (tokens[field] !== token) return;         // zwischenzeitlich neu aufgenommen/gelöscht
    set({ [`${field}Text`]: text, [`${field}Status`]: 'done' });
  })();
},

// Beim "Senden": erst warten, bis alle laufenden Erkennungen fertig sind
awaitTranscriptions: async () => {
  await Promise.allSettled(Object.values(inflight));
},
```

- Die Aufnahme setzt den Status auf `pending` und startet die KI **ohne** die UI zu blockieren.
- **Token-System:** Jede Aufnahme bekommt eine Nummer; ist die Nummer beim Fertigwerden veraltet,
  wird das Ergebnis verworfen.
- **Beim Absenden** ruft die App `awaitTranscriptions()` auf — so gehen nie unfertige Texte in die
  Mail/Datenbank, ohne dass der Nutzer vorher warten musste.

### 8.4 Backend — Beschwerde annehmen, speichern, versenden

Der öffentliche Endpunkt nimmt die Multipart-Daten an, lädt die Audios in den privaten Bucket,
schreibt die DB-Zeile und verschickt die E-Mail an die **zentrale** Adresse (die nie an den Client
zurückgegeben wird).

```ts
// api/complaints.ts (Auszug)
// Server-seitige Validierung – zusätzlich zur UI:
if (!facilitySlug || !isValidFacilitySlug(facilitySlug))
  return res.status(400).json({ ok: false, error: 'Ungueltige oder fehlende Einrichtung' });
if (!problemText && !problemAudioFile)
  return res.status(400).json({ ok: false, error: 'Problem/Beschwerde ist ein Pflichtfeld' });

// Audios parallel in den privaten Storage laden, dann eine Zeile schreiben:
const [problemAudio, solutionAudio, nameAudio] = await Promise.all([...]);
await supabaseAdmin.from('complaints').insert({ id: complaintId, facility_slug: facilitySlug, ... });

// Mail an die zentrale Adresse (aus Env-Var, nie im Client) – mit Audio als Anhang:
const { error: mailError } = await resend.emails.send({
  from: process.env.RESEND_FROM || 'Meine Stimme <onboarding@resend.dev>',
  to: process.env.COMPLAINT_RECIPIENT_EMAIL,
  subject: `Neue Beschwerde — ${getFacilityName(facilitySlug)}`,
  text: /* … */, attachments,
});
if (mailError) throw new Error('Mail-Versand fehlgeschlagen'); // SDK wirft nicht von selbst
```

- **Validierung auch im Backend** — nicht nur in der UI (Pflichtfeld + Einrichtungs-Allowlist).
- **Empfängeradresse aus `process.env`** — steht nie im Frontend-Bundle und wird nie an das Tablet
  zurückgegeben.
- Das Resend-SDK **wirft bei Fehlern nicht**, sondern liefert `{ error }` — wir prüfen es explizit,
  sonst würde die Funktion fälschlich Erfolg melden.

### 8.5 Ethik: anonyme Aufnahmen nur für die Leitung

Eine Audioaufnahme ist an der **Stimme erkennbar** und steht damit im Widerspruch zur gewählten
Anonymität. Der Audio-Endpunkt prüft das **serverseitig**, bevor er eine signierte URL ausgibt.

```ts
// api/audio-url.ts (Auszug)
const sameFacility =
  staff.facility_slug === null || staff.facility_slug === complaint.facility_slug;

// Stimme ist auch bei "anonym" erkennbar → Audio dann nur für die Leitung:
const anonymityGateOk = !complaint.is_anonymous || staff.role === 'leitung';

if (!sameFacility || !anonymityGateOk) {
  return res.status(403).json({ ok: false, error: 'Kein Zugriff auf dieses Audio' });
}
// sonst: kurzlebige signierte URL (60 s)
const { data } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, 60);
```

- **Betreuer:innen** bekommen für **anonyme** Beschwerden **kein** Recht am Audio — nur die **Leitung**.
- Der Link ist eine **signierte URL mit 60 s Gültigkeit** — kein dauerhaft öffentlicher Zugriff.

---

## 9. Sicherheit, Datenschutz & Ethik

| Maßnahme | Umsetzung |
| :--- | :--- |
| **Verschlüsselung Übertragung** | HTTPS/TLS automatisch über Vercel & Supabase |
| **Verschlüsselung Ruhezustand** | Supabase-Standard (verschlüsselte Festplatten) |
| **Passwort-Hashing** | Supabase Auth (bcrypt intern), keine Klartext-Passwörter |
| **Row-Level-Security** | anon nur *Insert*, Personal nur eigene Einrichtung, kein *Delete* ([7.3](#73-row-level-security-rls--die-datenbank-schützt-sich-selbst)) |
| **Geheimnisse** | API-Keys & zentrale Mailadresse nur in Umgebungsvariablen, nie im Frontend-Bundle |
| **Server-seitige Validierung** | Pflichtfeld- und Slug-Prüfung im Backend ([8.4](#84-backend--beschwerde-annehmen-speichern-versenden)) |
| **Privater Audio-Storage** | Bucket ohne Public-Zugriff; Wiedergabe nur über kurzlebige signierte URLs |
| **Datenminimierung** | keine IP-Adressen oder Geräte-Kennungen gespeichert |
| **Anonymität & Stimme (Ethik)** | anonyme Aufnahmen nur für die Leitung zugänglich ([8.5](#85-ethik-anonyme-aufnahmen-nur-für-die-leitung)) |
| **KI lokal** | Whisper läuft im Browser — Audio verlässt das Gerät für die Erkennung nicht |
| **EU-Hosting** | Supabase Frankfurt, EU-Mailanbieter Resend |

**Löschkonzept (Festlegung):** Beschwerden und Audiodateien werden nach Abschluss der Bearbeitung für
maximal **12 Monate** aufbewahrt, anonyme Aufnahmen direkt nach der Bearbeitung gelöscht. In der
Verwaltung können Beschwerden zusätzlich **manuell gelöscht** werden (inkl. Audiodateien). Ein
automatisierter Löschjob ist im Prototyp als Konzept festgehalten.

**Bekannte Schwachstellen (`npm audit`):** 14 Befunde (1 kritisch, 9 hoch, 4 moderat), **alle
transitiv** über Entwicklungs-/Build-Abhängigkeiten — die Vercel-Build-Tools (`@vercel/node`) und
die KI-Laufzeit (`@xenova/transformers` → `onnxruntime-web` → `protobufjs`). Kein eigener Code ist
betroffen; Fixes erfordern Breaking Changes bzw. sind für die Transformers-Kette nicht verfügbar.
Bewusst akzeptiert (die KI lädt nur ein festes, vertrauenswürdiges Modell; die Build-Tools laufen
nicht im Auslieferungspfad) und für den Produktivbetrieb als Update-Aufgabe notiert.

---

## 10. Verwendete Werkzeuge, Sprachen & KI-Dienste

| Bereich | Technologie | Begründung |
| :--- | :--- | :--- |
| Sprache | **TypeScript** | Typsicherheit über Frontend und Backend hinweg |
| Oberfläche | **React + Vite**, **Tailwind CSS v4** | schnelle Entwicklung, React-Router liefert die „Ebenen“ |
| Icons | **lucide-react** | echte, klare Symbole statt Emojis |
| Audioaufnahme | **MediaRecorder-API** | nimmt WebM/Opus auf; vor Versand nach **WAV** konvertiert (überall abspielbar) |
| **KI: Spracherkennung** | **Whisper (`Xenova/whisper-base`) via Transformers.js** | Sprache → Text, **lokal** im Browser |
| Vorlesen | **Web Speech API** + WAV-Voicelines | liest jede Frage automatisch vor |
| Status-Verwaltung | **Zustand** | leichtgewichtiger Store über die 6 Screens |
| Backend | **Vercel Serverless Functions** | ein Deployment, kein separater Server |
| Datenbank + Auth | **Supabase** (PostgreSQL, Frankfurt) | EU-Hosting, Passwort-Hashing, RLS, privater Storage |
| E-Mail | **Resend** | transaktionaler Versand inkl. Audio-Anhang |
| Hosting | **Vercel** | einfaches Deployment, automatisch HTTPS |

**KI-Offenlegung:** **Whisper** (OpenAI/Xenova) als App-KI · **Claude** (Anthropic) als
Entwicklungs-Assistent.

---

## 11. Der Entwicklungsprozess

Wir haben ein tägliches Logbuch (`docs/Fortschritt.md`) geführt; der Code liegt in einem
Git-Repository mit nachvollziehbarer Commit-Historie.

| Tag | Fokus | Was passiert ist |
| :--- | :--- | :--- |
| **Mo** | Setup & Konzept | Problem geschärft, Wireframes der 6 Screens, Monorepo (Vite + React + Tailwind), Supabase-Schema + RLS, alle Screens als Klick-Dummy. |
| **Di** | Aufnahme & KI | Vorlesen, echte Audioaufnahme, Oberfläche nach Wireframes, Whisper integriert + Text editierbar + Tastatur-Alternative. |
| **Mi** | Backend end-to-end | `POST /api/complaints` (Upload, DB-Insert, Mailversand), Frontend angebunden, gegen echte Supabase/Resend getestet. |
| **Do** | Verwaltung & Sicherheit | Login (Supabase Auth), Beschwerde-Liste mit Status-Filter, Detailansicht mit Status-Änderung & Audio inkl. Anonym-Sperre. |
| **Fr** | Deploy & Doku | Live-Deployment auf Vercel, Hintergrund-Transkription, Dokumentation, Präsentation, Retrospektive. |

---

## 12. Herausforderungen & Lösungswege

| Herausforderung | Lösungsweg |
| :--- | :--- |
| **Spracherkennung ungenau**, besonders bei Namen | Modell von `whisper-tiny` auf `whisper-base` umgestellt; Text **editierbar** + **Tastatur-Eingabe** als Alternative. |
| **Identität ohne Cookies** (Kiosk-Browser löschen Cookies) | Einrichtung kommt aus der **Start-URL**, frisch bei jedem Laden gelesen ([8.1](#81-einrichtung-aus-der-kiosk-url--ohne-cookies)). |
| **Aufnahme + Erkennung gleichzeitig** ist unzuverlässig | Erst mit MediaRecorder aufnehmen, **danach** transkribieren. |
| **Datenbank nur über IPv6** erreichbar | Schema-Migration über den Supabase-MCP-Server ausgeführt. |
| **Login trotz korrektem Passwort** abgelehnt (`invalid_credentials`) | Ursache: fehlende `instance_id` beim per SQL angelegten Auth-Nutzer. **Lehre:** Accounts über Supabase-Studio / Admin-API anlegen, nicht per rohem SQL-Insert. |
| **E-Mail-Versand zeitweise geblockt** (Empfänger stufte die geteilte Resend-IP über eine Blacklist ein) | Eigene Absender-Domain `meinestimme.jutio.org` verifiziert → zuverlässige Zustellung. |
| **Audio nicht in Mail-Programmen abspielbar** (WebM/Opus) | Aufnahme vor Versand im Browser per Web Audio API nach **WAV** (16-bit PCM, mono) konvertiert — ohne externe Bibliothek. |
| **Wartezeit auf die KI** störte den Flow | **Hintergrund-Transkription** mit Token-System + `awaitTranscriptions()` beim Senden ([8.3](#83-hintergrund-transkription--durchklicken-ohne-warten)). |

---

## 13. Teamarbeit

Das Projekt wurde entlang **dreier paralleler Arbeitsstränge** umgesetzt, damit niemand blockiert war:

- **Bewohner-Frontend** — Screens, Aufnahme, Vorlesen, Whisper-Spracherkennung.
- **Backend, Datenbank & Mail** — API-Endpunkte, Supabase-Schema + RLS, Resend-Versand.
- **Verwaltung, Sicherheit & Doku** — Login, Liste/Detail, Sicherheits- & Datenschutzkonzept, Dokumentation.

Der **Daten-Vertrag** (die Feldnamen zwischen Frontend und Backend) wurde **früh eingefroren**, sodass
beide Seiten unabhängig arbeiten konnten. Abstimmung lief über das gemeinsame Git-Repository und das
tägliche Fortschritts-Board. *(Bei 2 Personen: Frontend vs. Backend+Verwaltung — über die klaren
Schnittstellen jederzeit arbeitsfähig.)*

---

## 14. Retrospektive

**Was lief gut**

- Konzept früh & klar → fokussierte, ablenkungsfreie Umsetzung.
- Paralleles Arbeiten über **eingefrorene Schnittstellen** — kaum Blockaden.
- KI **lokal** im Browser — datenschutzfreundlich und ohne laufende Kosten.
- Kompletter Weg **live**: Tablet → Mail + Datenbank → Verwaltung.

**Was weniger gut lief**

- Whisper-Genauigkeit bei **Eigennamen**.
- **E-Mail-Zustellung** (Blacklist der geteilten Absender-IP).
- Supabase-Auth-Stolperfalle (`instance_id`) kostete Zeit.
- Wenig Zeit für Tests auf **echter Kiosk-Hardware**.

**Was wir gelernt haben**

- **Schnittstellen früh einfrieren** spart im Team viele Konflikte.
- Barrierefreiheit heißt **radikale Reduktion** — weniger Elemente, größere Knöpfe.
- **Ethik gehört in den Code**, nicht nur in die Doku (Anonym-Sperre serverseitig).
- Auth-Accounts über **Studio/API** anlegen, nicht per rohem SQL.

---

## 15. Ausblick

- **KI-Auto-Kategorisierung** per LLM (Kategorie + Dringlichkeit automatisch taggen).
- **Eigene verifizierte Mail-Domain** statt Sandbox-Absender.
- **Echte Kiosk-Hardware** (Fully Kiosk Browser / Geführter Zugriff) und Rollout auf alle
  13 Einrichtungen — der URL-Mechanismus ist generisch.
- **Automatisierte Löschjobs** entsprechend dem Löschkonzept.
- **Kommentar-/Weiterleitungsfunktion** in der Verwaltung (derzeit nur Lesen + Status).
- **Barrierefreiheits-Feinschliff** auf echten Tablets (Touch-Größen, Kontrast, Screenreader),
  Prüfung der Whisper-Ladezeit auf der Zielhardware.

---

## 16. Quellen & Vorbilder

- **Mebis Informationssystem** (connedata GmbH) — Vorbild für die barrierefreie, browserbasierte Bedienung.
- **Papierbogen „Besser werden“** (Lebenshilfe, Wohnverbund NRW) — Vorlage für die Felder
  *Problem/Beschwerde* und *Idee/Lösungsvorschlag*.
- **METACOM-Symbole** (Annette Kitzinger) — gestalterisches Vorbild für klare Symbole.
- **Whisper** (OpenAI) / **Transformers.js** (Xenova / Hugging Face) — Spracherkennung.
  <https://github.com/xenova/transformers.js>
- **React** <https://react.dev>, **Vite** <https://vite.dev>, **Tailwind CSS**
  <https://tailwindcss.com>, **lucide-react** <https://lucide.dev>, **Zustand**
  <https://zustand-demo.pmnd.rs>.
- **Supabase** <https://supabase.com>, **Resend** <https://resend.com>, **Vercel** <https://vercel.com>.
- **MediaRecorder-API** / **Web Speech API** — MDN Web Docs <https://developer.mozilla.org/>.
- **KI-Assistenz bei der Entwicklung:** Claude (Anthropic).
- Rechtlicher Rahmen: **Bundesteilhabegesetz (BTHG), §§ 7, 8**.
