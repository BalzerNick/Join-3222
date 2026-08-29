/**
 * Loads all tasks from the database into the module level tasks array and
 * refreshes the metric tiles afterwards. Network and HTTP errors are logged
 * and leave the tiles untouched.
 *
 * @returns {Promise<void>}
 */
async function loadSummaryData() {
    try {
        const response = await fetch(baseUrl + "tasks.json");
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
 * Counts all tasks that currently sit in a given board column.
 *
 * @param {string} status - The status to count, for example "todo" or "done".
 * @returns {number} The number of tasks carrying that status.
 */
function countTasksByStatus(status) {
    return tasks.filter(task => task.status === status).length;
}

/**
 * Counts all tasks that carry a given priority.
 *
 * @param {string} priority - The priority to count: "urgent", "medium" or "low".
 * @returns {number} The number of tasks carrying that priority.
 */
function countTasksByPriority(priority) {
    return tasks.filter(task => task.priority === priority).length;
}

/**
 * Writes all calculated metrics into the summary tiles: the counts per
 * column, the total, the urgent count, the closest urgent due date and the
 * name of the logged in user.
 *
 * @returns {void}
 */

function updateSummaryHTML() {
    setStatNumber("todoCount", countTasksByStatus("todo"));
    setStatNumber("doneCount", countTasksByStatus("done"));
    setStatNumber("urgentCount", countTasksByPriority("urgent"));
    setStatNumber("boardCount", tasks.length);
    setStatNumber("inProgressCount", countTasksByStatus("in-progress"));
    setStatNumber("awaitFeedbackCount", countTasksByStatus("await-feedback"));
    setDate("uprisingdate", getMostUrgentTask()?.dueDate);
    setName("loginuser", "greetingtag", getLoggedInUserName());
}

/**
 * Writes a number into a metric tile, if that tile exists on the current
 * page.
 *
 * @param {string} id - Id of the element that receives the number.
 * @param {number} value - The number that is displayed in the tile.
 * @returns {void}
 */
function setStatNumber(id, value) {
    let counter = document.getElementById(id);
    if (counter) counter.textContent = value;
}

/**
 * Writes a date into an element, if that element exists on the current page.
 *
 * @param {string} id - Id of the element that receives the date.
 * @param {string} [date] - The date in ISO format (YYYY-MM-DD). Undefined clears the element.
 * @returns {void}
 */
function setDate(id, date) {
    let counter = document.getElementById(id);
    if (counter) counter.textContent = date;
} 

/**
 * Writes the user name next to the greeting. Nothing is written for guests,
 * where the name is missing.
 *
 * @param {string} iduser - Id of the element that holds the user name.
 * @param {string} idgreet - Id of the greeting element next to the name.
 * @param {?string} name - Name of the logged in user, or null for a guest session.
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
 * Finds the urgent task whose due date lies closest to today. Tasks with any
 * other priority are ignored.
 *
 * @returns {?Object} The most urgent task, or null if no task has priority "urgent".
 */
function getMostUrgentTask() {
    // Holds the most urgent task once one is found.
    let mostUrgentTask = null;
    // Walk through every task in the array.
    for (let i = 0; i < tasks.length; i++) {
        let task = tasks[i];
        // Only consider tasks with priority "urgent".
        if (task.priority === "urgent") {
            // If no urgent task has been found yet,
            // this one is stored as the first candidate.
            if (mostUrgentTask === null) {
                mostUrgentTask = task;
            }
            // Otherwise compare the due dates.
            else if (new Date(task.dueDate) < new Date(mostUrgentTask.dueDate)) {
                mostUrgentTask = task;
            }
        }
    }
    // Return the most urgent task.
    return mostUrgentTask;
}


/**
 * Reads the name of the logged in user out of localStorage.
 *
 * @returns {?string} The name of the user, or null if nobody is logged in.
 */
function getLoggedInUserName() {
    let userData = localStorage.getItem("user");
    if (!userData) return null;
    let user = JSON.parse(userData);
    return user.name;
}


// new Date().toLocaleTimeString() , new Date().toTimeString()
/**
 * Builds the greeting that matches the current time of day.
 *
 * @returns {string} "Good morning!" before 12, "Good afternoon!" before 18, otherwise "Good evening!".
 */
function getCurrentTime() {
    let now = new Date();
    let thehours = now.getHours();     // hours (0-23)
    let theminutes = now.getMinutes();   // minutes (0-59)
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
 * Writes the time of day greeting into the greeting element of the page.
 *
 * @returns {void}
 */
function startGreeting() {
    let greeting = getCurrentTime();
    console.log(`Greeting: ${greeting}`);
    document.getElementById("greetingtag").textContent = greeting;
}

function checkMobileGreeting() {
    if (window.innerWidth > 1140) return;

    if (sessionStorage.getItem("showGreeting") !== "true") return;

    const greetingBlock = document.querySelector(".greeting-block");

    greetingBlock.classList.add("mobile-greeting");

    sessionStorage.removeItem("showGreeting");

    setTimeout(() => {
        greetingBlock.classList.remove("mobile-greeting");
    }, 1800);
}


/**
 * Entry point of the summary page. Fills the greeting and loads the task
 * numbers for the metric tiles.
 *
 * @returns {void}
 */
function initSummary() {
    startGreeting();
    checkMobileGreeting();
    loadSummaryData();
}

document.addEventListener('DOMContentLoaded', initSummary);
