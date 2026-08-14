let tasks = [];

/**
 * Laedt alle Tasks aus der Datenbank und aktualisiert danach die Kacheln.
 * Netzwerk- und HTTP-Fehler werden geloggt, die Kacheln bleiben dann leer.
 *
 * @returns {Promise<void>}
 */
async function loadSummaryData() {
    try {
        const response = await fetch(BASE_URL + "tasks.json");
        if (!response.ok) {
            console.error("Failed to load task data", response.status, response.statusText);
            return;
        }
        const data = await response.json();
        tasks = data ? Object.values(data) : [];
    } catch (error) {
        console.error("Firebase load failed", error);
        return;
    }
    updateSummaryHTML();
}


/**
 * Zaehlt alle Tasks mit einem bestimmten Status.
 *
 * @param {string} status - Der gesuchte Status, z.B. "todo".
 * @returns {number} Die Anzahl der passenden Tasks.
 */
function countTasksByStatus(status) {
    return tasks.filter(task => task.status === status).length;
}

/**
 * Zaehlt alle Tasks mit einer bestimmten Prioritaet.
 *
 * @param {string} priority - Die gesuchte Prioritaet, z.B. "urgent".
 * @returns {number} Die Anzahl der passenden Tasks.
 */
function countTasksByPriority(priority) {
    return tasks.filter(task => task.priority === priority).length;
}

/**
 * Schreibt die berechneten Kennzahlen in die Summary-Kacheln.
 *
 * @returns {void}
 */

function updateSummaryHTML() {
    setStatNumber("todoCount", countTasksByStatus("todo"));
    setStatNumber("doneCount", countTasksByStatus("done"));
    setStatNumber("urgentCount", countTasksByPriority("urgent"));
    setStatNumber("boardCount", tasks.length);
    setStatNumber("inProgressCount", countTasksByStatus("inProgress"));
    setStatNumber("awaitFeedbackCount", countTasksByStatus("awaitFeedback"));
    setDate("uprisingdate", getMostUrgentTask()?.dueDate);
    setName("loginuser", "greetingtag", getLoggedInUserName());
}

/**
 * Setzt den Text eines Elements, falls es auf der Seite vorhanden ist.
 *
 * @param {string} id - Die ID des Ziel-Elements.
 * @param {number} value - Die anzuzeigende Zahl.
 * @returns {void}
 */
function setStatNumber(id, value) {
    let counter = document.getElementById(id);
    if (counter) counter.textContent = value;
}

/**
 * Setzt ein Datum in ein Element, falls es auf der Seite vorhanden ist.
 *
 * @param {string} id - Die ID des Ziel-Elements.
 * @param {string} [date] - Das Datum im Format YYYY-MM-DD.
 * @returns {void}
 */
function setDate(id, date) {
    let counter = document.getElementById(id);
    if (counter) counter.textContent = date;
} 

/**
 * Schreibt den Usernamen neben die Begruessung. Fuer Gaeste ohne Namen
 * wird nichts geschrieben.
 *
 * @param {string} iduser - Die ID des Elements fuer den Namen.
 * @param {string} idgreet - Die ID des Begruessungs-Elements.
 * @param {?string} name - Der Name des eingeloggten Users, oder null bei Gaesten.
 * @returns {void}
 */
function setName(iduser, idgreet, name) {
    let greeting = document.getElementById(idgreet);
    let counter = document.getElementById(iduser);

    if (name) {
        if (counter) counter.textContent = name;
        // if (greeting) greeting.textContent = "Good morning,";
    } else {
        /* if (greeting) greeting.textContent = "Good morning!"; */
    } 
}

/**
 * Sucht den dringenden Task mit dem naechstliegenden Faelligkeitsdatum.
 *
 * @returns {?Object} Der dringendste Task, oder null wenn kein Task die Prioritaet "urgent" hat.
 */
function getMostUrgentTask() {
    // Hier wird später die dringendste Aufgabe gespeichert.
    let mostUrgentTask = null;
    // Gehe jede Aufgabe im Array durch.
    for (let i = 0; i < tasks.length; i++) {
        let task = tasks[i];
        // Nur Aufgaben mit der Priorität "urgent" berücksichtigen.
        if (task.priority === "urgent") {
            // Falls noch keine dringende Aufgabe gefunden wurde,
            // wird diese als erste gespeichert.
            if (mostUrgentTask === null) {
                mostUrgentTask = task;
            }
            // Ansonsten vergleichen wir die Fälligkeitsdaten.
            else if (new Date(task.dueDate) < new Date(mostUrgentTask.dueDate)) {
                mostUrgentTask = task;
            }
        }
    }
    // Die dringendste Aufgabe zurückgeben.
    return mostUrgentTask;
}


/**
 * Liest den Namen des eingeloggten Users aus dem localStorage.
 *
 * @returns {?string} Der Name, oder null wenn niemand eingeloggt ist.
 */
function getLoggedInUserName() {
    let userData = localStorage.getItem("user");
    if (!userData) return null;
    let user = JSON.parse(userData);
    return user.name;
}


/**
 * Geht einen Schritt zurueck im Browser-Verlauf. Haengt am Zurueck-Pfeil.
 *
 * @returns {void}
 */
function histarrow() {
    window.history.back();
}

// new Date().toLocaleTimeString() , new Date().toTimeString()
/**
 * Baut die zur Tageszeit passende Begruessung.
 *
 * @returns {string} "Good morning!" vor 12, "Good afternoon!" vor 18, sonst "Good evening!".
 */
function getCurrentTime() {
    let now = new Date();
    let thehours = now.getHours();     // Stunden (0-23)
    let theminutes = now.getMinutes();   // Minuten (0-59)
    let thesconds = now.getSeconds();
    console.log(`Aktuelle Uhrzeit: ${thehours}:${theminutes}:${thesconds}`);
    if (0 <= thehours && thehours < 12) {
        return "Good morning!";
    }
    else if (12 <= thehours && thehours < 18) {
        return "Good afternoon!";
    }
    else {
        return "Good evening!";
    }
}

/**
 * Schreibt die Tageszeit-Begruessung in das Begruessungs-Element.
 *
 * @returns {void}
 */
function startGreeting() {
    let greeting = getCurrentTime();
    console.log(`Greeting: ${greeting}`);
    document.getElementById("greetingtag").textContent = greeting;
}