# Join-3222

Kanban-Taskboard, entwickelt im Team im Rahmen der Developer Akademie.
Techstack: HTML, CSS, JavaScript, Firebase Realtime Database.

## Projektstruktur

Multi-Page-Application (MPA) mit einer eigenen HTML-Seite je Bereich:

- `index.html` – Login und Startseite
- `signUp.html` – Registrierung
- `summary_guest.html`, `board.html`, `addTask.html`, `contacts.html` – geschuetzte Bereiche
- `help.html` – Hilfeseite, `card.html` – Vorlage fuer Task-Karten
- `legalNotice.html`, `privacyPolicy.html` – Rechtstexte

Weitere Ordner und Dateien:

- `css/` – globale Dateien `style.css` (Reset, Farbvariablen, Basis), `navbar.css`
  (Sidebar + Header) und `buttons.css` (Buttons), plus eine CSS-Datei je Seite.
  Ladereihenfolge: `style.css → navbar.css → buttons.css → seiten.css`
- `scripts/` – eine JS-Datei je Seite (`login.js`, `signUp.js`, `board.js` …)
- `script.js` – gemeinsame, seitenuebergreifende Datei (u.a. Firebase-Verbindungstest)
- `assets/` – `imgs/`, `fonts/` (Inter lokal via `@font-face`), `templates/`
- `firebase-config.js` – enthaelt `baseUrl` der Realtime Database
- `database-import.json` – Startdaten fuer den Import in die Datenbank

## Setup

### 1. Firebase Realtime Database anlegen

1. Auf <https://console.firebase.google.com> ein Projekt anlegen. Google
   Analytics wird nicht gebraucht und kann abgewaehlt werden.
2. In der linken Leiste **Build → Realtime Database → Datenbank erstellen**.
3. Als Standort **europe-west1** waehlen. Der Standort steht spaeter in der URL
   und laesst sich nachtraeglich nicht mehr aendern.
4. Beim Sicherheitsmodus **Im Testmodus starten** waehlen. Lesen und Schreiben
   sind damit ohne Anmeldung erlaubt, und genau das setzt diese App voraus: sie
   spricht die Datenbank direkt per REST an und kennt kein Firebase-Login.

Die Testmodus-Regeln laufen nach 30 Tagen ab, danach antwortet die Datenbank
nur noch mit "Permission denied". In der Konsole unter **Realtime Database →
Regeln** ersetzt man sie dann durch:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Damit kann jeder lesen und schreiben, der die URL kennt. Fuer dieses
Lernprojekt ist das so gewollt – echte oder persoenliche Daten gehoeren
deshalb nicht in die Datenbank.

### 2. baseUrl eintragen

Oben in der Realtime Database steht die URL der Datenbank, sie endet auf
`.firebasedatabase.app`. Diese URL kommt in `firebase-config.js` im
Projekt-Root:

```js
const baseUrl = "https://DEIN-PROJEKT-default-rtdb.europe-west1.firebasedatabase.app/";
```

Der abschliessende Schraegstrich gehoert dazu, weil die App ihre Pfade direkt
an die `baseUrl` anhaengt.

### 3. Starten

Das Projekt ueber einen lokalen Server oeffnen (z.B. Live Server in VS Code),
nicht per Doppelklick: `fetch` auf die Vorlagen in `assets/templates/`
funktioniert unter `file://` nicht.

Die Datenbank ist am Anfang leer, Startdaten muessen nicht importiert werden.
Firebase legt die drei Bereiche `tasks`, `contacts` und `users` selbst an,
sobald der erste Eintrag geschrieben wird: Account ueber `signUp.html`
registrieren, Kontakte ueber `contacts.html` anlegen, Tasks ueber
`addTask.html`.

## Login und Registrierung

- **Login** (`index.html`): prueft E-Mail und Passwort gegen die `users` in der
  Datenbank. Bei Treffer Weiterleitung auf `summary_guest.html`, sonst
  Fehlermeldung "User nicht bekannt".
- **Gast-Login**: springt ohne Pruefung direkt auf `summary_guest.html`, damit alle
  Funktionen getestet werden koennen.
- **Registrierung** (`signUp.html`): validiert die Eingaben (Felder ausgefuellt,
  gueltige E-Mail, Passwoerter gleich, Datenschutz akzeptiert) und legt den
  neuen User per `POST` in der Datenbank an.

Die Formulare nutzen keine HTML5-Validierung (`novalidate`), sondern eine
eigene Pruefung in JavaScript.

## Navigation und Layout (global)

Sidebar und Header sind auf allen Bereichsseiten gleich und werden zentral in
`navbar.css` gepflegt:

- Feste linke Sidebar (`.menu-line`) mit Logo, Menue-Icons (Summary, Add Task,
  Board, Contacts) und den Rechtstext-Links unten.
- Weisser Header oben mit Titel, Hilfe-Button (`?` -> `help.html`) und dem
  Nutzer-Avatar.
- Das aktive Menue-Item wird als dunkler Balken ueber die volle Breite
  markiert (`class="active"`).

Buttons kommen aus `buttons.css` (`.btn`, `.btn-primary`, `.btn-secondary`) und
nutzen zentrale Farbvariablen aus `style.css` (`--color-primary`,
`--color-accent`, ...). Farben aendert man so an einer Stelle.

## Eingeloggter Nutzer (Header-Avatar)

Nach dem Login merkt sich die App den Nutzer im `localStorage` (Schluessel
`user`), damit der Header auf jeder Seite die Initialen anzeigen kann:

- **Login**: speichert `{"name": "..."}`.
- **Gast-Login**: speichert `{"guest": true}`.

`renderUserInitials()` in `script.js` laeuft per `DOMContentLoaded` auf jeder
Seite, liest `user` und fuellt den Kreis oben rechts (`#userInitials`):
Gast -> "G", echter Nutzer -> Initialen aus `getInitials(name)`. Ist niemand
eingeloggt oder fehlt der Kreis, passiert nichts (Null-Schutz, kein Fehler).

## Rendering und Templates

Dynamische Inhalte (z.B. die Kontaktkarten) werden nicht statisch ins HTML
geschrieben, sondern zur Laufzeit aus den Daten erzeugt. Das wiederkehrende
Karten-HTML liegt getrennt in `assets/templates/` (reines HTML, kein Script) –
die Logik holt es und fuellt es. So bleibt die Regel "kein Template in Scripten,
kein Scriptcode in Templates" eingehalten.

Muster (Beispiel Contacts):

1. Daten laden: `fetch(baseUrl + "contacts.json")`.
2. Vorlage laden: `fetch("assets/templates/contactsTemplate.html")` als Text.
3. Platzhalter fuellen: `{{name}}`, `{{email}}` usw. per `replaceAll` ersetzen.
4. In den Container schreiben: das gefuellte HTML in `#contactList` einfuegen.

Hinweis: `fetch` auf lokale Vorlagen funktioniert nur ueber einen Server
(z.B. Live Server), nicht per Doppelklick (`file://`).

## Toast-Benachrichtigung (seitenuebergreifend)

`showToast(message, duration)` zeigt eine kurze Meldung, die oben aus der Mitte
einschwebt und nach der Dauer wieder verschwindet. Die Funktion liegt in
`script.js`, das CSS in `css/style.css` – beide sind global.

So nutzt du den Toast auf einer beliebigen Seite:

1. `script.js` und `css/style.css` einbinden (falls noch nicht vorhanden).
2. Ein leeres Toast-Element in die Seite legen: `<div id="toast" class="toast"></div>`
3. Aufrufen, z.B. `showToast("Contact successfully created")` oder mit eigener
   Dauer `showToast("Task deleted", 3000)` (Standard: 2000 ms).

## Datenbankzugriff (REST)

Die App nutzt kein Firebase-SDK, sondern spricht die Realtime Database per
`fetch` ueber deren REST-Schnittstelle an. Jede Adresse folgt demselben
Muster:

```
baseUrl + <Pfad im JSON-Baum> + ".json"
```

Das angehaengte `.json` ist Pflicht, sonst liefert Firebase keine Daten. Der
Pfad ist derselbe wie im JSON-Baum: `contacts` fuer alle Kontakte,
`contacts/contact1` fuer einen einzelnen.

| Methode | Bedeutung | Beispiel |
| --- | --- | --- |
| `GET` | liest den Teilbaum | `fetch(baseUrl + "contacts.json")` |
| `POST` | legt neu an, Firebase erzeugt den Schluessel | `fetch(baseUrl + "contacts.json", { method: "POST", body })` |
| `PUT` | ueberschreibt den Eintrag komplett | `fetch(baseUrl + "contacts/" + id + ".json", { method: "PUT", body })` |
| `PATCH` | aendert nur die mitgeschickten Felder | `fetch(baseUrl + "tasks/" + id + ".json", { method: "PATCH", body })` |
| `DELETE` | loescht den Eintrag | `fetch(baseUrl + "contacts/" + id + ".json", { method: "DELETE" })` |

Zwei Eigenheiten, die im Code immer wieder auftauchen:

- Ein `GET` auf eine Sammlung liefert **kein Array**, sondern ein Objekt mit den
  IDs als Schluessel. Deshalb steht dahinter meist `Object.keys(...)` oder
  `Object.values(...)`, um daraus eine Liste zu machen.
- Ein Pfad, den es nicht gibt, ist kein Fehler: Firebase antwortet mit Status
  200 und dem Wert `null`. Eine leere Datenbank liefert also `null`, keinen 404.

Genutzte Pfade sind `contacts`, `contacts/<id>`, `tasks`, `tasks/<id>`,
`tasks/<id>/subtasks/<subId>` und `users`.

Sammelstelle fuer diese Aufrufe ist `scripts/api.js`; die Seitenskripte rufen
nur deren Funktionen auf.

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
      "assignedTo": [
        {
          "id": "contact1",
          "name": "Anna Schmidt",
          "email": "anna.schmidt@example.com",
          "phone": "+49 151 1234567",
          "initials": "AS"
        }
      ],
      "subtasks": {
        "sub1": { "title": "HTML-Grundgeruest anlegen", "done": false }
      }
    }
  },
  "contacts": {
    "contact1": {
      "name": "Anna Schmidt",
      "email": "anna.schmidt@example.com",
      "phone": "+49 151 1234567",
      "initials": "AS"
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
- `status` – Spalte auf dem Board: `todo`, `in-progress`, `await-feedback`,
  `done`. Die aeltere Schreibweise `inProgress` / `awaitFeedback` wird beim
  Laden in `board.js` noch auf die Bindestrich-Form umgeschrieben.
- `assignedTo` – Liste der zugewiesenen Kontakte, siehe unten.
- `subtasks` – Objekt aus Unteraufgaben, je mit `title` und `done` (true/false).

### contacts

Eine Person, die einem Task zugewiesen werden kann. Wichtige Keys:

- `name` – vollstaendiger Name.
- `email` – E-Mail-Adresse.
- `phone` – Telefonnummer.
- `initials` – Initialen fuer den Avatar.

### users

Ein Login-Account. Wichtige Keys:

- `name` – Anzeigename.
- `email` – Login-E-Mail.
- `password` – Passwort. Hinweis: Klartext ist keine echte Sicherheit,
  fuer dieses Lernprojekt aber ausreichend.

### Zusammenhang tasks und contacts

`assignedTo` speichert den **vollstaendigen Kontakt als Objekt**, inklusive
`id`, `name` und `initials`. Das Board kann eine Karte damit zeichnen, ohne
vorher `contacts` nachzuschlagen.

Der Preis dafuer: die Daten liegen doppelt. Wird ein Kontakt in `contacts`
umbenannt, stehen in den Tasks weiterhin die alten Namen. Wer das aufraeumen
will, muesste beim Speichern eines Kontakts auch die Tasks mitziehen.

Aus einer aelteren Fassung kann `assignedTo` auch nur die Kontakt-ID als
String enthalten (`["contact1"]`). `getBoardContact()` in
`assets/templates/boardTaskTemplates.js` faengt beide Formen ab und schlaegt
den String-Fall ueber `contacts` nach.
