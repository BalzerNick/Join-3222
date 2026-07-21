# Join-3222

Join ist ein Projektmanagement-Tool für Teams, die ihre Aufgaben klar strukturieren und gemeinsam abarbeiten wollen.

Funktionen

Tasks anlegen und verwalten
Board mit verschiedenen Listen für überblick auf das gesamte Projekt
Tasks Kontakten aus der Kontaktliste zuweisen
Tasks per Drag and Drop den einzelnen Listen hinzufügen

## `up.bat` und `up.sh`

Mit den Skripten `up.bat` (Windows) und `up.sh` (macOS/Linux) kann man Änderungen automatisch committen und auf den aktuell ausgecheckten Branch pushen.
Darüber hinaus wird vor jedem push einmal gepullt, um potenzielle Merge-Konflikte festzustellen und zu lösen

### Windows

Im Terminal:

```bash
up.bat CommitName
```

oder

```bash
./up.bat CommitName
```

### macOS / Linux

Im Terminal:

```bash
up.sh CommitName
```

oder

```bash
./up.sh CommitName
```

> **Hinweis:** `CommitName` soll mit deiner eigenen Commit-Nachricht ausgetauscht werden.
