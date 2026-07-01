# Meine Stimme — Retrospektive

**HIT12 · Praktikumsersatzleistung „AWE mit KI" · Projektwoche 29.06.–03.07.2026**
**Team:** Monstroxx · TagerTi

Diese Retrospektive reflektiert die Projektwoche ehrlich und zielgerichtet: Was haben wir uns
vorgenommen, was ist gelungen, was nicht — und was nehmen wir daraus mit. Wir haben bewusst nicht
nur das Endprodukt bewertet, sondern den **Entwicklungsprozess** und die **Zusammenarbeit**.

---

## Inhaltsverzeichnis

1. [Ziel & Ergebnis auf einen Blick](#1-ziel--ergebnis-auf-einen-blick)
2. [Reflexion je Projektphase](#2-reflexion-je-projektphase)
3. [Was lief gut (Continue)](#3-was-lief-gut-continue)
4. [Was lief weniger gut (Stop)](#4-was-lief-weniger-gut-stop)
5. [Was wir anders machen würden (Start)](#5-was-wir-anders-machen-würden-start)
6. [Reflexion der Teamarbeit](#6-reflexion-der-teamarbeit)
7. [Umgang mit KI im Entwicklungsprozess](#7-umgang-mit-ki-im-entwicklungsprozess)
8. [Wichtigste Erkenntnisse (Lessons Learned)](#8-wichtigste-erkenntnisse-lessons-learned)
9. [Selbstbewertung gegen die Aufgabenstellung](#9-selbstbewertung-gegen-die-aufgabenstellung)

---

## 1. Ziel & Ergebnis auf einen Blick

**Vorgenommen:** eine barrierefreie, sprachbasierte Beschwerde-App für Menschen mit geistiger
Behinderung — funktionsfähig, mit KI-Spracherkennung, Mail- und Datenbank-Anbindung sowie einer
Verwaltungs-Ansicht — innerhalb einer Schulwoche.

**Erreicht:** Alle Kernziele wurden umgesetzt und **live deployed**. Der komplette Weg funktioniert
end-to-end: Bewohner spricht am Tablet → KI transkribiert im Browser → Beschwerde landet als E-Mail
(mit Audio) **und** in der Datenbank → Personal sieht sie in der Verwaltung und pflegt den Status.

| Kriterium | Selbsteinschätzung |
| :--- | :--- |
| Funktionsfähiger Prototyp | ✅ live unter meine-stimme.jutio.org |
| Mehrere Ebenen | ✅ 6 Bewohner-Screens + Verwaltung |
| ≥ 3 Funktionen ohne Login | ✅ 7 Funktionen (Aufnahme, Vorlesen, Anhören, Anonym, KI-Text, Tastatur, Senden) |
| Sicherheitsaspekte | ✅ RLS, Hashing, HTTPS, private Audios, Datenminimierung |
| KI eingesetzt & offengelegt | ✅ Whisper (App) + Claude (Entwicklung) |

**Ehrliche Gesamtbewertung:** Wir haben mehr geschafft als geplant (Hintergrund-Transkription,
Live-Deployment), sind aber bei zwei Punkten an äußere Grenzen gestoßen (E-Mail-Zustellung,
Test auf echter Kiosk-Hardware).

---

## 2. Reflexion je Projektphase

| Tag | Ziel | Ergebnis | Reflexion |
| :--- | :--- | :--- | :--- |
| **Mo** | Konzept & Setup | Wireframes, Monorepo, DB-Schema + RLS, Klick-Dummy | Das früh geschärfte Konzept hat die ganze Woche getragen — die investierte Zeit hat sich mehrfach ausgezahlt. |
| **Di** | Aufnahme & KI | Vorlesen, Audioaufnahme, Whisper integriert | Whisper lief schneller als befürchtet; die Genauigkeit bei Namen war die erste echte Hürde. |
| **Mi** | Backend end-to-end | Upload + DB + Mail, Frontend angebunden | Erster kompletter Durchlauf — hier zahlte sich der früh eingefrorene Daten-Vertrag aus. |
| **Do** | Verwaltung & Sicherheit | Login, Liste, Detail, Anonym-Sperre | Die Auth-Stolperfalle (`instance_id`) kostete unerwartet Zeit. |
| **Fr** | Deploy & Doku | Live-Deployment, Doku, Präsentation | Deployment brachte typische Prod-Themen (ESM, Env-Vars); am Ende lief alles live. |

---

## 3. Was lief gut (Continue)

- **Konzept zuerst, Code danach.** Wir haben am Montag das Problem, die Zielgruppe und die 6 Screens
  klar durchdacht. Dadurch konnten wir die restliche Woche fokussiert bauen, ohne ständig
  umzuentscheiden.
- **Schnittstellen früh einfrieren.** Die Feldnamen zwischen Frontend und Backend standen schon
  Dienstag fest. So konnten beide Seiten unabhängig und parallel arbeiten.
- **KI lokal im Browser.** Whisper über Transformers.js war die richtige Wahl: datenschutzfreundlich,
  keine laufenden Kosten, kein externer Dienst — und passt genau zur sensiblen Zielgruppe.
- **Ehrlicher Umgang mit Grenzen.** Statt Probleme zu verstecken (E-Mail-Blacklist, Kiosk-Hardware),
  haben wir sie dokumentiert und pragmatische Prototyp-Lösungen gewählt.
- **Barrierefreiheit als Leitprinzip.** „Eine Frage pro Bildschirm", große Knöpfe, Vorlesen — die
  konsequente Reduktion hat die App wirklich bedienbar gemacht.

---

## 4. Was lief weniger gut (Stop)

- **Spracherkennung bei Eigennamen.** Whisper erkennt Namen oft falsch. Wir haben es abgefedert
  (editierbarer Text + Tastatur), aber eine perfekte Lösung fehlt.
- **E-Mail-Zustellung unterschätzt.** Dass der Empfänger-Server die geteilte Absender-IP über eine
  Blacklist ablehnt, hat uns überrascht und Zeit gekostet. Das Thema „verifizierte Domain" hätten
  wir früher angehen sollen.
- **Auth zu spät getestet.** Der per rohem SQL angelegte Login-Nutzer funktionierte wegen fehlender
  `instance_id` nicht — das fiel erst spät auf.
- **Keine echte Zielhardware.** Wir konnten die App nicht auf einem echten Kiosk-Tablet testen; die
  Whisper-Ladezeit auf schwacher Hardware bleibt eine offene Unbekannte.

---

## 5. Was wir anders machen würden (Start)

- **Auth früher end-to-end testen**, nicht erst am Verwaltungs-Tag.
- **Von Anfang an auf einem echten Tablet testen**, statt nur im Desktop-Browser.
- **Kleine automatisierte Tests** für den kritischen Pfad (Absenden → DB/Mail), um Regressionen beim
  Umbauen schneller zu bemerken.

---

## 6. Reflexion der Teamarbeit

Wir haben das Projekt in **drei parallele Arbeitsstränge** aufgeteilt — Bewohner-Frontend,
Backend/DB/Mail sowie Verwaltung/Sicherheit/Doku. Der Schlüssel für reibungslose Zusammenarbeit war
der **früh eingefrorene Daten-Vertrag**: Weil die Feldnamen zwischen den Teilen feststanden, konnte
jede:r unabhängig arbeiten, ohne auf die anderen zu warten.

**Was in der Zusammenarbeit gut funktioniert hat:**

- Klare Zuständigkeiten → wenig Doppelarbeit und kaum Merge-Konflikte.
- Tägliche Abstimmung über das gemeinsame Git-Repository und das Fortschritts-Board
  (`docs/Fortschritt.md`).
- Gegenseitiges Einspringen bei Blockaden statt starrer Silos.

**Was wir bei der Zusammenarbeit gelernt haben:**

- **Schnittstellen sind wichtiger als Details.** Solange der Vertrag steht, darf jede Seite intern
  frei arbeiten.
- **Sichtbarkeit schafft Vertrauen.** Ein gemeinsames Board, auf dem jede:r den Stand sieht, ersetzt
  viele Rückfragen.
- **Kommunikation an Übergabepunkten** (z. B. Frontend ↔ Backend beim ersten End-to-End-Test) ist
  entscheidend — hier haben wir bewusst gemeinsam getestet.

---

## 7. Umgang mit KI im Entwicklungsprozess

KI war in diesem Projekt **doppelt** präsent, und wir legen beides offen:

- **Als Produkt-KI:** Whisper (OpenAI, via Transformers.js) ist der funktionale Kern — die
  Spracherkennung, ohne die die App ihre Barrierefreiheit nicht erreichen würde.
- **Als Entwicklungs-Werkzeug:** Claude (Anthropic) haben wir als Assistenten für Architektur-Ideen,
  Code und Dokumentation genutzt.

**Unsere Reflexion dazu:** KI hat uns beschleunigt, aber die **Verantwortung für Entscheidungen**
blieb bei uns — etwa die Wahl, Whisper lokal statt in der Cloud laufen zu lassen (Datenschutz), oder
die Anonym-Sperre serverseitig zu erzwingen (Ethik). KI liefert Vorschläge; die fachlichen und
ethischen Abwägungen haben wir selbst getroffen und im Code verankert.

---

## 8. Wichtigste Erkenntnisse (Lessons Learned)

1. **Konzept früh einfrieren** spart die ganze Woche über Zeit.
2. **Schnittstellen zuerst** — dann kann ein Team echt parallel arbeiten.
3. **Barrierefreiheit heißt radikale Reduktion**, nicht mehr Features.
4. **Ethik gehört in den Code**, nicht nur in die Doku (z. B. die serverseitige Anonym-Sperre für
   Stimmen).
5. **Externe Dienste bergen versteckte Hürden** (Mail-Blacklist, IPv6-only-DB, Auth-`instance_id`) —
   früh und real testen.
6. **Datenschutz by Design**: keine IP/Geräte-Daten speichern, KI lokal, private Audios — von Anfang
   an eingebaut, nicht nachträglich.

---

## 9. Selbstbewertung gegen die Aufgabenstellung

| Anforderung | Erfüllt? | Anmerkung |
| :--- | :---: | :--- |
| Gesellschaftlich relevantes Problem | ✅ | Beschwerderecht + Gewaltschutz für eine besonders schutzbedürftige Gruppe |
| Zielgruppe beschrieben | ✅ | Bewohner:innen, Leitung, Betreuer:innen, Träger |
| Konzept & Skizzen | ✅ | Wireframes → 1:1 umgesetzte Oberfläche |
| Funktionsfähiger Prototyp | ✅ | live & end-to-end getestet |
| Geeignete Werkzeuge / KI | ✅ | React/TS, Supabase, Whisper — offengelegt |
| Arbeitsschritte dokumentiert | ✅ | Logbuch, Git-Historie, Kurzdoku |
| Ansprechende Oberfläche | ✅ | barrierefrei, Mebis-inspiriert |
| Sicherheitsaspekte | ✅ | RLS, Hashing, HTTPS, private Audios, Datenminimierung |
| Datenschutz & Ethik | ✅ | Anonymitäts-Hinweis, Anonym-Sperre, Löschkonzept |
| Herausforderungen reflektiert | ✅ | siehe Abschnitte 4 & 5 |
| Teamarbeit reflektiert | ✅ | siehe Abschnitt 6 |

**Fazit:** Wir sind mit dem Ergebnis zufrieden — nicht weil alles perfekt ist, sondern weil wir einen
**echten, sinnvollen Prototyp** gebaut, ehrlich mit den Grenzen umgegangen sind und als Team gut
zusammengearbeitet haben. Der Fokus lag, wie in der Aufgabe gefordert, auf **Prozess und
Problemlösung** — und genau daraus haben wir am meisten mitgenommen.
