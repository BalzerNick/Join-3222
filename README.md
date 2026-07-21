# Join-3222

Kanban-Taskboard, entwickelt im Team im Rahmen der Developer Akademie.
Techstack: HTML, CSS, JavaScript, Firebase Realtime Database.

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
