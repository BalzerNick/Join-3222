# Git-Workflow: Mergen, Konflikte lösen, Push-Probleme

Diese Doku beschreibt den Git-Workflow für dieses Projekt. Ihr arbeitet mit
persönlichen Branches (`Nick`, `Denis`, `Marcus`, `Simon`, ...), die regelmäßig
in `main` gemerged werden.

## Inhalt
- [Grundprinzip](#grundprinzip)
- [Richtig mergen](#richtig-mergen)
- [Merge-Konflikte lösen](#merge-konflikte-lösen)
- [Push-Probleme](#push-probleme)
- [Nützliche Befehle](#nützliche-befehle)
- [Faustregeln](#faustregeln)

---

## Grundprinzip

- `main` ist der stabile Branch. Fertige, getestete Features landen hier.
- Jede:r arbeitet auf dem eigenen Branch (z. B. `Nick`) und merged von dort
  regelmäßig in `main` (per Pull Request oder direktem Merge).
- **Bevor** du auf deinem Branch weiterarbeitest oder in `main` mergst:
  aktuellen Stand von `main` holen, damit dein Branch nicht zu weit abdriftet.
  Je länger man wartet, desto größer werden die Konflikte.

```
main  ──●──────●───────●───────●──   (stabil, deploybar)
          \           /       /
Nick       ●───●───●─         (dein Feature-Branch)
```

---

## Richtig mergen

### 1. Immer mit sauberem Stand starten

```bash
git status
```

Wenn hier Änderungen auftauchen, die du nicht verlieren willst: erst
committen oder stashen (`git stash`), **nie** einfach überschreiben.

### 2. main aktuell holen

```bash
git checkout main
git pull origin main
```

### 3. main in deinen Branch mergen (nicht umgekehrt!)

```bash
git checkout Nick
git merge main
```

So bringst du die Neuerungen aus `main` in deinen Branch, testest sie dort,
und erst danach geht dein fertiges Feature zurück nach `main`. Das ist
sicherer, als direkt in `main` zu experimentieren.

### 4. Wenn dein Feature fertig ist: zurück nach main

```bash
git checkout main
git pull origin main          # nochmal aktualisieren, falls sich was getan hat
git merge Nick
git push origin main
```

> **Empfehlung:** Statt direkt lokal in `main` zu mergen, lieber einen
> **Pull Request auf GitHub** erstellen (Branch `Nick` → `main`). Vorteil:
> Andere sehen die Änderungen, können Feedback geben, und GitHub zeigt
> Konflikte an, bevor irgendwas kaputtgeht.

### Merge vs. Rebase

- `git merge` erstellt einen Merge-Commit und bewahrt die komplette Historie.
  **Für dieses Projekt: bevorzugt**, weil einfacher und im Team nachvollziehbarer.
- `git rebase` schreibt Commits um (lineare Historie). Nur verwenden, wenn du
  genau weißt was du tust, und **niemals** auf Branches, die andere auch
  benutzen (also nicht auf `main` oder fremden Branches wie `Denis`).

---

## Merge-Konflikte lösen

Ein Konflikt entsteht, wenn dieselbe Zeile in zwei Branches unterschiedlich
geändert wurde. Git kann das nicht automatisch entscheiden und meldet:

```
CONFLICT (content): Merge conflict in contacts.js
Automatic merge failed; fix conflicts and then commit the result.
```

### Schritt für Schritt

1. **Ruhig bleiben** – das ist normaler Alltag, kein Fehler.

2. Schau, welche Dateien betroffen sind:
   ```bash
   git status
   ```
   Dateien unter "Unmerged paths" enthalten Konflikte.

3. Öffne die Datei. Git markiert die Konfliktstellen so:
   ```
   <<<<<<< HEAD
   dein aktueller Stand (der Branch, in dem du gerade bist)
   =======
   der Stand aus dem Branch, den du gerade mergst
   >>>>>>> main
   ```

4. **Entscheide bewusst**, welcher Code bleibt:
   - Nur deine Version behalten
   - Nur die andere Version behalten
   - Beide kombinieren (z. B. beide Funktionen behalten)

   Wichtig: Die Marker `<<<<<<<`, `=======`, `>>>>>>>` **komplett entfernen**
   – die dürfen nicht im Code übrig bleiben.

5. In VS Code (empfohlen): VS Code zeigt bei Konflikten Buttons wie
   *"Accept Current Change"*, *"Accept Incoming Change"*, *"Accept Both
   Changes"* direkt über der Konfliktstelle an. Damit geht's am schnellsten.

6. Datei speichern, dann als gelöst markieren:
   ```bash
   git add contacts.js
   ```

7. Wenn alle Konflikte behoben sind, Merge abschließen:
   ```bash
   git commit
   ```
   (Git schlägt automatisch eine Merge-Commit-Message vor, die kann man i.d.R.
   so lassen.)

8. Testen, ob die App noch läuft, bevor du pusht!

### Bei mehreren Konflikt-Dateien

`git status` nach jedem Schritt erneut aufrufen – zeigt dir immer, was noch
offen ist ("both modified") und was schon erledigt ("all conflicts fixed").

### Merge abbrechen

Falls du merken, dass gerade zu viel durcheinander ist und du nochmal in
Ruhe rangehen willst:

```bash
git merge --abort
```

Das setzt alles auf den Stand vor dem Merge-Versuch zurück – **verliert
keine bereits committeten Änderungen**.

### Typische Konfliktquellen in diesem Projekt

- Mehrere Leute ändern dieselbe HTML-Datei (z. B. `index.html`,
  `contacts.html`) an ähnlicher Stelle → vorher kurz im Team absprechen, wer
  gerade woran arbeitet.
- CSS-Dateien (z. B. `buttons.css`) parallel angepasst → Konflikte meist
  einfach lösbar, da meist beide Regeln behalten werden können.
- `database-import.json` – bei strukturierten Daten (JSON) besonders genau
  hinschauen, dass am Ende gültiges JSON übrig bleibt (Kommas, Klammern!).

---

## Push-Probleme

### "Updates were rejected because the remote contains work that you do not have locally"

```
! [rejected]        main -> main (fetch first)
error: failed to push some refs
```

**Ursache:** Jemand anderes hat schon gepusht, dein lokaler Stand ist
veraltet.

**Lösung:**
```bash
git pull origin main
```
- Wenn das automatisch klappt (Fast-Forward oder automatischer Merge) →
  danach normal pushen.
- Wenn Konflikte auftreten → wie oben im Abschnitt "Merge-Konflikte lösen"
  vorgehen, dann committen und erst danach pushen.

**Nicht tun:** `git push --force` auf `main` oder gemeinsam genutzten
Branches. Das überschreibt die Arbeit anderer und kann Commits von
Teammitgliedern unwiederbringlich löschen.

### "fatal: The current branch Nick has no upstream branch"

Passiert, wenn du einen neuen lokalen Branch zum ersten Mal pushst:

```bash
git push -u origin Nick
```

Das `-u` verknüpft deinen lokalen Branch dauerhaft mit `origin/Nick` – ab da
reicht ein einfaches `git push`.

### "Permission denied (publickey)" beim Push

SSH-Key-Problem mit GitHub. Prüfen:
```bash
ssh -T git@github.com
```
Sollte eine Erfolgsmeldung mit deinem GitHub-Usernamen zeigen. Falls nicht:
SSH-Key fehlt/ist nicht bei GitHub hinterlegt – dann kurz Bescheid geben,
das richten wir gezielt.

### Push hat "funktioniert", aber die Änderung fehlt auf GitHub

Meistens wurde in den falschen Branch gepusht. Prüfen:
```bash
git branch        # zeigt, auf welchem Branch du gerade bist (der mit *)
git remote -v     # zeigt, wohin origin/upstream zeigen
```
In diesem Repo gibt es sowohl `origin` als auch `upstream` (beide zeigen auf
`BalzerNick/Join-3222`, aber über unterschiedliche URLs). Im Zweifel explizit
angeben, wohin gepusht wird:
```bash
git push origin Nick
```

### Versehentlich in main statt im eigenen Branch committet

Nicht in Panik `reset --hard` machen. Stattdessen den Commit auf den
richtigen Branch verschieben:
```bash
git branch verschoben-fix        # legt neuen Branch auf aktuellem main-Stand an
git reset --hard origin/main     # main lokal zurücksetzen auf den Remote-Stand
git checkout verschoben-fix      # dein Commit ist hier weiterhin vorhanden
```

---

## Nützliche Befehle

| Befehl | Zweck |
|---|---|
| `git status` | Was ist geändert, was ist im Konflikt |
| `git log --oneline --graph --all` | Branch-Historie visuell anzeigen |
| `git diff` | Was hat sich genau geändert |
| `git stash` / `git stash pop` | Änderungen kurz beiseite legen |
| `git merge --abort` | Merge sauber abbrechen |
| `git fetch --all` | Alle Remotes aktualisieren, ohne zu mergen |

---

## Faustregeln

1. **Vor jedem Merge/Pull:** `git status` – keine offenen Änderungen verlieren.
2. **Klein und häufig mergen** statt wochenlang auf einem Branch zu bleiben.
3. **Nie `--force` pushen** auf `main` oder fremde Branches.
4. **Bei Konflikten:** genau lesen, bewusst entscheiden, nicht blind
   "Accept Current" für alles klicken.
5. **Vor dem Push:** kurz testen, ob die Seite/App noch lädt.
6. **Im Zweifel fragen**, bevor du etwas mit `--hard` oder `--force`
   zurücksetzt – das ist im Team schwer rückgängig zu machen.
