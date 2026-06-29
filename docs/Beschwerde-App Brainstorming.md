# Beschwerde-App für die Lebenshilfe — Brainstorming & Konzept

**NAME: Meine Stimme**  
Digitale, barrierefreie Beschwerdemöglichkeit für Menschen mit geistiger Behinderung in Besonderen Wohnformen. Vorbild für die Bedienung: Mebis (browserbasiert, große Knöpfe, Vorlese-Funktion, METACOM-Symbole).

**Änderungen gegenüber v1:** zwei Sprachfelder (Problem \+ Lösungsvorschlag) je eigener Screen · Fragen werden automatisch vorgelesen · Knöpfe „Frage wiederholen / Antwort anhören / Neu aufnehmen" · Audio wird mit an die Mail geschickt · Einrichtungs-Kennung über Kiosk-Start-URL statt Cookies · zentrale Mailadresse serverseitig.

---

## 1\. Ausgangslage

- 13 Einrichtungen ("Besondere Wohnformen") für Menschen mit geistiger Behinderung, die in Wohngruppen leben und rund um die Uhr durch Assistent:innen unterstützt werden.  
- Beschwerden werden bisher über einen Papierbogen ("Besser werden") erfasst und an die Leitung der Besonderen Wohnform gegeben, die bearbeitet oder weiterleitet.  
- Ziel: Beschwerden zukünftig über ein digitales System direkt an ein Mail-Postfach senden, damit koordiniert werden kann, wer sich vor Ort um was kümmert.  
- Bestehendes System **Mebis**: barrierefrei, browserbasiert, Touch-Bedienung, Vorlese-Funktion, große Schaltflächen, METACOM-Symbole, DSGVO-konform, auch als Kiosk-Variante.

## 2\. Konzept

- **Betreuer:innen konfigurieren das Tablet einmalig vor**: Die Einrichtung wird über die Start-URL des Kiosk-Browsers fest hinterlegt (siehe Abschnitt 4). Die Herkunft der Beschwerde wird dadurch automatisch mitgeschickt — niemand muss sie auswählen.  
- **Bewohner:innen müssen nur noch:**  
  1. das **Problem / die Beschwerde** per Sprache angeben (Pflicht),  
  2. einen **Lösungsvorschlag / eine Idee** per Sprache angeben (optional),  
  3. wählen, ob sie **anonym** bleiben oder ihren **Namen** angeben.  
- Beide Sprachfelder entsprechen genau dem Papierbogen "Besser werden" (Felder *Problem/Beschwerde* und *Idee/Lösungsvorschlag*).  
- **Jede Frage wird automatisch vorgelesen.** Pro Aufnahme gibt es drei Knöpfe:  
  - **Frage wiederholen** — liest die Frage erneut vor.  
  - **Antwort anhören** — spielt die eigene Aufnahme noch einmal ab.  
  - **Neu aufnehmen** — erneut einsprechen.

### Felder

| Feld | Pflicht? | Eingabe |
| :---- | :---- | :---- |
| Einrichtung | Ja | automatisch (Kiosk-Start-URL) |
| Problem / Beschwerde | Ja | Sprache → Text \+ Audio |
| Lösungsvorschlag / Idee | Nein | Sprache → Text \+ Audio |
| Name | Nein (anonym möglich) | Sprache/Auswahl |

## 3\. Bildschirm-Ablauf (eine Frage – ein Screen / „Ebenen")

2. **Start** — großer Knopf „Beschwerde abgeben".  
3. **Frage 1 · Problem** — Frage wird vorgelesen; „Was möchtest du sagen?"; aufnehmen, anhören, neu aufnehmen.  
4. **Frage 2 · Lösung** (optional) — „Was soll besser werden?"; zusätzlich „Überspringen".  
5. **Frage 3 · Name** — „Name sagen oder anonym bleiben?".  
6. **Bestätigen** — alles anhören und abschicken.  
7. **Gesendet** — Danke-Bildschirm (Symbol \+ Vorlesen).

Funktionen ohne Login (Bewertungsbogen verlangt ≥ 3): Spracheingabe · Vorlesen · Antwort-Wiedergabe · Anonym-Umschalter · Abschicken.

## 4\. Konfiguration & Speicherung der Einrichtung

- **Einrichtungs-Kennung über die Kiosk-Start-URL**, nicht über Cookies (die werden geleert). Jedes Tablet öffnet beim Start fest eine URL mit Kennung, z. B. `https://app.lebenshilfe.de/wohnform-03`. Diese URL liegt in der Geräte-Konfiguration des Kiosk-Browsers (z. B. *Fully Kiosk Browser* auf Android oder „Geführter Zugriff" / verwaltete Konfiguration auf dem iPad) und überlebt jedes Cookie-/Cache-Löschen. Die App liest die Kennung bei jedem Laden frisch aus der URL.  
- **localStorage** nur als Komfort-Fallback; die URL bleibt die verlässliche Quelle. Cookies werden nicht für die Kennung genutzt.  
- **Zentrale Mailadresse**: Es gibt nur eine Adresse. Sie wird **einmal serverseitig** hinterlegt (Einstellung bzw. Umgebungsvariable), nicht auf dem Tablet. Das Tablet schickt nur „Einrichtung \= wohnform-03"; das Backend kennt den festen Empfänger. Pflichtfeld, zentral gepflegt, ausfallsicher bei Geräte-Reset.

## 5\. Audio-Anhang an die E-Mail

- Die Aufnahme wird im Browser mit der **MediaRecorder-API** mitgeschnitten (kleine Opus/WebM-Datei).  
- Am Ende gehen **Audio \+ transkribierter Text gemeinsam** in die Datenbank und an die Mail. Falls Speech-to-Text Lücken hat, ist das Audio die „Wahrheit".  
- **Hinweis zur Technik:** Web Speech API und MediaRecorder gleichzeitig auf dasselbe Mikrofon ist auf manchen Geräten unzuverlässig. Sauberer: nur mit MediaRecorder aufnehmen und anschließend transkribieren — serverseitig mit Whisper (genauer) oder per Browser-STT (ohne Backend-STT). Der „Antwort anhören"-Knopf spielt dann die echte Aufnahme ab.

## 6\. Tech-Stack

| Bereich | Technologie | Warum |
| :---- | :---- | :---- |
| Oberfläche | React \+ Vite, Tailwind CSS | Schnell, gut erklärbar; Router liefert die „Ebenen" |
| Audioaufnahme | MediaRecorder-API (getUserMedia) | Liefert die Audiodatei für den Mail-Anhang |
| Speech-to-Text (KI) | [Transformers.js](http://Transformers.js) (whisper) | STT als KI-Kern; Whisper genauer, Web Speech kostenlos/instant |
| Vorlesen | Web Speech API (`SpeechSynthesis`) | Liest Fragen vor, wie Mebis |
| Backend | Node.js \+ Express oder Serverless | Nimmt Beschwerde \+ Audio an, speichert, mailt; kennt zentralen Empfänger |
| Datenbank \+ Login | Supabase (PostgreSQL), Region Frankfurt | Auth, Verschlüsselung, Row-Level-Security, EU-Hosting |
| E-Mail-Versand | Brevo oder Resend (EU) | DSGVO-freundlicher Versand inkl. Anhang |
| Hosting | Vercel (Frontend) \+ Supabase | Einfaches Deployment |
| Optionale KI | LLM (Claude/GPT) zur Auto-Kategorisierung | Tagt Kategorie \+ Dringlichkeit — **nur taggen, nicht bündeln** |

## 7\. Architektur (Datenfluss)

Bewohner-Tablet (Kiosk-Browser, Kennung in Start-URL)

        │   Aufnahme: MediaRecorder \+ Vorlesen der Fragen

        ▼

Spracheingabe / STT (KI)  ──  Text (+ Audiodatei)

        │

        ▼

Backend (Serverless / Node.js, kennt zentralen Empfänger)

        │

        ├─────────────► Datenbank (Supabase) — jede Beschwerde getrennt, mit Audio

        │                        │

        │                        ▼

        │               Verwaltungs-Ansicht (Login · Status · Übersicht)

        │

        └─────────────► E-Mail-Versand — an zentrale Adresse, Audio als Anhang

## 8\. Roadmap für die Projektwoche (Mo–Fr)

Logbuch ab Tag 1 führen (gebaut / Tools / Probleme) → Kurzdoku schreibt sich fast von selbst, K.O.-Kriterien abgesichert.

- **Tag 1 (Mo) — Problem & Konzept**: Problem, Zielgruppe, gesellschaftliche Relevanz (Selbstbestimmung, Gewaltschutz, Inklusion). Wireframes der 6 Screens. Setup: Repo, Supabase (Frankfurt), Vite \+ React \+ Tailwind.  
- **Tag 2 (Di) — Bewohner-Oberfläche**: 6 Screens, Fragen-Vorlesen, MediaRecorder-Aufnahme, die drei Knöpfe, Anonym-Wahl. Barrierefreiheit (Kontrast, Touch ≥ 48 px, Symbole).  
- **Tag 3 (Mi) — Backend, Speichern, Audio & Mailversand**: Endpunkt, Datensatz in Supabase, Audio-Upload, E-Mail mit Anhang an die zentrale Adresse. Mit echten Beispielsätzen testen.  
- **Tag 4 (Do) — Verwaltung, Sicherheit & KI-Extra**: Login, getrennte Liste mit Status (offen / in Bearbeitung / erledigt), Audio abspielbar. Sicherheitsaspekte umsetzen \+ dokumentieren. Optional KI-Kategorisierung. Testen & Fixen.  
- **Tag 5 (Fr) — Doku, Präsentation, Retro, Puffer**: Kurzdoku (4–6 Seiten), Präsentation (15–20 Min), Retrospektive, Deployment & Live-Demo.

## 9\. Bewertungsbogen-Mapping

| Kriterium (Punkte) | Wie wir es holen |
| :---- | :---- |
| Ansprechende, intuitive Oberfläche (10) | Mebis-Vorbild: große Knöpfe, Symbole, Vorlesen, ein Screen pro Frage |
| Mehrere Ebenen (5) | Start → Problem → Lösung → Name → Bestätigen → Gesendet \+ Verwaltung |
| ≥ 3 Funktionen ohne Login (10) | Spracheingabe, Vorlesen, Antwort anhören, Anonym-Umschalter, Abschicken |
| Zusätzliche Funktionen (5) | Audio-Anhang, KI-Kategorisierung, Status-Verwaltung |
| Sicherheitsaspekte (5) | Verschlüsselung, gehashte Passwörter, Row-Level-Security, Datenminimierung |
| Code nachvollziehbar erklärt (15) | Klare Trennung Frontend/Backend/DB |
| Gesellschaftliche Relevanz (15) | Selbstbestimmung, Barrierefreiheit, Gewaltschutz-Dokumentation |
| Werkzeuge & KI nennen/zeigen (5) | Web Speech API / Whisper, React, Supabase, ggf. LLM — offen angeben (Pflicht) |
| Arbeitsprozess ehrlich (5) | Aus dem täglichen Logbuch |

## 10\. Datenschutz, Sicherheit & Ethik

- **Echte Anonymität**: Name optional, keine Speicherung von IP-Adressen oder Geräte-Kennungen, die Rückschlüsse erlauben. Wichtig wegen des Machtgefälles — Beschwerden können sich auch gegen Assistent:innen richten (Gewaltschutz).  
- **Stimme vs. Anonymität**: Eine Audioaufnahme ist erkennbar und steht damit in leichtem Widerspruch zur Anonymität. Wer „anonym" wählt, dessen Audio sollte nur eingeschränkt zugänglich sein (nur berechtigte Personen), und beim Absenden sollte darauf hingewiesen werden.  
- **Datenminimierung**: nur erheben, was nötig ist.  
- **EU-Hosting**: Supabase Frankfurt, EU-Mailanbieter.  
- **Verschlüsselung**: bei Übertragung (HTTPS/TLS) und im Ruhezustand.  
- **Zugriffskontrolle**: nur autorisierte Personen, Row-Level-Security, Login.  
- **Geheimnisse**: API-Schlüssel nur in Umgebungsvariablen, nie im Frontend.  
- **Löschkonzept**: Aufbewahrungsdauer der Beschwerden und Audiodateien festlegen.

## 11\. Offene Fragen

- Soll die Verwaltungs-Ansicht nur lesen oder auch kommentieren/weiterleiten können?  
- Aufbewahrungsdauer / Löschfristen für Text und Audio?  
- Welche Kategorien sollen für die (optionale) KI-Verschlagwortung vorgegeben werden?

---

*Quellen / Vorbilder: Mebis Informationssystem (connedata GmbH), Papierbogen "Besser werden" (Lebenshilfe Wohnverbund Wohnen NRW), METACOM-Symbole (Annette Kitzinger).*  
