let tasks = [];

window.addEventListener("load", () => {
    loadSummaryData();
});

/**
 * Laedt die Task-Daten aus der Firebase Realtime Database und stoesst das Rendern an.
 */
/* async function loadSummaryData() {
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
 * @param {string} status
 * @returns {number}
 */
function countTasksByStatus(status) {
    return tasks.filter(task => task.status === status).length;
}

/**
 * Zaehlt alle Tasks mit einer bestimmten Prioritaet.
 * @param {string} priority
 * @returns {number}
 */
function countTasksByPriority(priority) {
    return tasks.filter(task => task.priority === priority).length;
}

/**
 * Schreibt die berechneten Kennzahlen in die Summary-Kacheln.
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
 * @param {string} id
 * @param {number} value
 */
function setStatNumber(id, value) {
    let counter = document.getElementById(id);
    if (counter) counter.textContent = value;
}

function setDate(id, date) {
    let counter = document.getElementById(id);
    if (counter) counter.textContent = date;
} 

function setName(iduser, idgreet, name) {
    let greeting = document.getElementById(idgreet);
    let counter = document.getElementById(iduser);

    if (name) {
        if (counter) counter.textContent = name;
        if (greeting) greeting.textContent = "Good morning,";
    } else {
        if (greeting) greeting.textContent = "Good morning!";
    }
}

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


function getLoggedInUserName() {
    let userData = localStorage.getItem("user");
    if (!userData) return null;
    let user = JSON.parse(userData);
    return user.name;
}


function histarrow() {
    window.history.back();
}

// new Date().toLocaleTimeString() , new Date().toTimeString()
function getCurrentTime() {
    let jetzt = new Date();
    let stunden = jetzt.getHours();     // Stunden (0-23)
    let minuten = jetzt.getMinutes();   // Minuten (0-59)
    let sekunden = jetzt.getSeconds();
    console.log(`Aktuelle Uhrzeit: ${stunden}:${minuten}:${sekunden}`);
}