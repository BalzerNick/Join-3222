let tasks = [];

window.addEventListener("load", () => {
    loadSummaryData();
});

/**
 * Laedt die Task-Daten aus der lokalen JSON-Datei und stoesst das Rendern an.
 */
async function loadSummaryData() {
    try {
        const response = await fetch("database-import.json");
        if (!response.ok) {
            console.error("Failed to load task data", response.status, response.statusText);
            return;
        }
        const data = await response.json();
        tasks = data.tasks ? Object.values(data.tasks) : [];
    } catch (error) {
        console.error("Local load failed", error);
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



/* function getMostUrgentTask() {
    return tasks
        .filter(task => task.priority === "urgent")
        .reduce((earliest, task) => {
            if (!earliest) return task;
            return new Date(task.dueDate) < new Date(earliest.dueDate) ? task : earliest;
        }, null);
}
 */

function histarrow() {
    window.history.back();
}
