# Join-3222

Kanban-Taskboard, entwickelt im Team im Rahmen der Developer Akademie.
Techstack: HTML, CSS, JavaScript, Firebase Realtime Database.

## Projektstruktur

Multi-Page-Application (MPA) mit einer eigenen HTML-Seite je Bereich:

- `index.html` – Login und Startseite
- `signUp.html` – Registrierung
- `summary.html`, `board.html`, `addTask.html`, `contacts.html` – geschuetzte Bereiche
- `legalNotice.html`, `privacyPolicy.html` – Rechtstexte

Weitere Ordner und Dateien:

- `css/` – `style.css` (global, auf jeder Seite verlinkt) plus eine CSS-Datei je Seite
- `scripts/` – eine JS-Datei je Seite (`login.js`, `signUp.js`, `board.js` …)
- `script.js` – gemeinsame, seitenuebergreifende Datei (u.a. Firebase-Verbindungstest)
- `assets/` – `imgs/`, `fonts/` (Inter lokal via `@font-face`), `templates/`
- `firebase-config.js` – enthaelt `BASE_URL`, per `.gitignore` aus dem Repo
- `database-import.json` – Startdaten fuer den Import in die Datenbank

## Setup

1. In der Firebase Console ein Projekt und eine Realtime Database anlegen.
2. `firebase-config.js` im Projekt-Root anlegen und die eigene `BASE_URL`
   eintragen (Datei ist per `.gitignore` ausgeschlossen, kommt nicht ins Repo).
3. `database-import.json` in der Realtime Database importieren
   (Console → Realtime Database → Menue → JSON importieren).
4. `index.html` im Browser oeffnen.

## Login und Registrierung

- **Login** (`index.html`): prueft E-Mail und Passwort gegen die `users` in der
  Datenbank. Bei Treffer Weiterleitung auf `board.html`, sonst Fehlermeldung
  "User nicht bekannt".
- **Gast-Login**: springt ohne Pruefung direkt auf `board.html`, damit alle
  Funktionen getestet werden koennen.
- **Registrierung** (`signUp.html`): validiert die Eingaben (Felder ausgefuellt,
  gueltige E-Mail, Passwoerter gleich, Datenschutz akzeptiert) und legt den
  neuen User per `POST` in der Datenbank an.

Die Formulare nutzen keine HTML5-Validierung (`novalidate`), sondern eine
eigene Pruefung in JavaScript.

## Toast-Benachrichtigung (seitenuebergreifend)

`showToast(message, duration)` zeigt eine kurze Meldung, die oben aus der Mitte
einschwebt und nach der Dauer wieder verschwindet. Die Funktion liegt in
`script.js`, das CSS in `css/style.css` – beide sind global.

So nutzt du den Toast auf einer beliebigen Seite:

1. `script.js` und `css/style.css` einbinden (falls noch nicht vorhanden).
2. Ein leeres Toast-Element in die Seite legen: `<div id="toast" class="toast"></div>`
3. Aufrufen, z.B. `showToast("Contact successfully created")` oder mit eigener
   Dauer `showToast("Task deleted", 3000)` (Standard: 2000 ms).

## Datenbankstruktur (Firebase Realtime Database)

Die Datenbank ist ein einziger JSON-Baum mit drei Top-Level-Bereichen.
Sammlungen werden als Objekte mit stabilen IDs abgelegt (nicht als Arrays),
damit sich beim Loeschen keine Indizes verschieben.

```json
{
  "tasks": {
    "task1": {
      "title": "Kontaktformular bauen",
      "description": "Formular mit eigener Validierung erstellen",
      "dueDate": "2026-08-01",
      "priority": "medium",
      "category": "Technical Task",
      "status": "todo",
      "assignedTo": ["contact1"],
      "subtasks": {
        "sub1": { "title": "HTML-Grundgeruest anlegen", "done": false }
      }
    }
  },
  "contacts": {
    "contact1": {
      "name": "Anna Schmidt",
      "email": "anna.schmidt@example.com",
      "phone": "+49 151 1234567"
    }
  },
  "users": {
    "user1": {
      "name": "Max Mustermann",
      "email": "max@example.com",
      "password": "123456"
    }
  }
}
```

### tasks

Eine Board-Karte. Wichtige Keys:

- `title` – Pflichtfeld, Name des Tasks.
- `description` – optionale Beschreibung.
- `dueDate` – Faelligkeitsdatum im Format `YYYY-MM-DD`.
- `priority` – `urgent`, `medium` oder `low`.
- `category` – `Technical Task` oder `User Story`.
- `status` – Spalte auf dem Board: `todo`, `inProgress`, `awaitFeedback`, `done`.
- `assignedTo` – Liste von Kontakt-IDs, die dem Task zugewiesen sind.
- `subtasks` – Objekt aus Unteraufgaben, je mit `title` und `done` (true/false).

### contacts

Eine Person, die einem Task zugewiesen werden kann. Wichtige Keys:

- `name` – vollstaendiger Name.
- `email` – E-Mail-Adresse.
- `phone` – Telefonnummer.

### users

Ein Login-Account. Wichtige Keys:

- `name` – Anzeigename.
- `email` – Login-E-Mail.
- `password` – Passwort. Hinweis: Klartext ist keine echte Sicherheit,
  fuer dieses Lernprojekt aber ausreichend.

### Zusammenhang tasks und contacts

`assignedTo` in einem Task speichert nur die IDs der Kontakte (z.B. `contact1`),
nicht deren Namen. Die Anzeige (Name, Initialen) wird beim Rendern ueber die
ID aus `contacts` nachgeschlagen. So muss ein Kontakt nur an einer Stelle
geaendert werden.
