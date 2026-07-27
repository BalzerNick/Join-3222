let todos = [];
let allContacts = {};

// This variable stores the ID of the task that is currently being dragged.
let currentDraggedElement = null;

window.addEventListener('load', () => {
    initPage();
});

async function initPage() {
    await loadTasks();
}

function updateHTML() {
    // Rebuild each column from the current tasks array.
    // This clears the column content and inserts fresh HTML for each matching task.
    renderColumn('todo', 'To Do');
    renderColumn('in-progress', 'In Progress');
    renderColumn('await-feedback', 'Await feedback');
    renderColumn('done', 'Done');
}

function renderColumn(columnId, columnName) {
    const column = document.getElementById(columnId);
    const filteredTasks = todos.filter(t => t['status'] === columnId);
    column.innerHTML = '';

    if (filteredTasks.length === 0) {
        column.innerHTML = `<div class="empty-state">No tasks ${columnName}</div>`;
    } else {
        for (let index = 0; index < filteredTasks.length; index++) {
            const element = filteredTasks[index];
            column.innerHTML += generateTodoHTML(element);
        }
    }
}

function startDragging(id) {
    // Remember which task is being dragged
    currentDraggedElement = id;
}

function generateTodoHTML(element) {
    const dueDate = element.dueDate ? `<span class="task-due">${element.dueDate}</span>` : "";
    const priority = element.priority ? `<span class="task-priority badge-${element.priority.toLowerCase()}">${element.priority}</span>` : "";
    const category = element.category ? `<span class="task-badge">${element.category}</span>` : "";
    const description = element.description ? `<p class="task-description">${element.description}</p>` : "";
    const subtaskTotal = element.subtasks ? Object.keys(element.subtasks).length : 0;
    const subtaskDone = element.subtasks ? Object.values(element.subtasks).filter(sub => sub.done).length : 0;
    const subtasks = subtaskTotal > 0 ? `<span class="task-extra-item">${subtaskDone}/${subtaskTotal} Subtasks</span>` : "";
    const assignedCount = element.assignedTo ? element.assignedTo.length : 0;
    const assigned = assignedCount > 0 ? `<span class="task-extra-item">${assignedCount} Assigned</span>` : "";

    return `
        <div draggable="true"
             ondragstart="startDragging('${element.id}')"
             onclick="openTaskDetail('${element.id}')"
             class="todo">
            <div class="task-topline">
                <div class="task-topline-left">${category}</div>
                <div class="task-topline-right">${priority}</div>
            </div>
            <h3 class="task-title">${element.title}</h3>
            ${description}
            <div class="task-meta-row">
                <div class="task-meta-items">
                    ${assigned}
                    ${subtasks}
                </div>
                ${dueDate}
            </div>
        </div>`;
}

function allowDrop(ev) {
    // Prevent default so drop event is allowed on the drop target.
    ev.preventDefault();
}

function moveTo(category) {
    // Change the status of the dragged task and refresh the board.
    const task = todos.find(t => t.id === currentDraggedElement);
    if (task) {
        task.status = category;
    }
    // Remove highlight from the drop target so it doesn't remain highlighted after drop.
    const target = document.getElementById(category);
    if (target) removeHighlight(category);
    updateHTML();
}

function highlight(id) {
    // Add a highlight style to the drag area while an item is dragged over it.
    document.getElementById(id).classList.add('drag-area-highlight');
}

function removeHighlight(id) {
    // Remove the highlight once the dragged item leaves the area.
    document.getElementById(id).classList.remove('drag-area-highlight');
}

function openAddTaskDialog() {
    const modal = document.getElementById('add-task-modal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = getAddTaskPage();
    modal.classList.remove('hidden');
}

function closeAddTaskDialog(event) {
    // Allow closing by clicking the X button or the overlay background
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById('add-task-modal');
    modal.classList.add('hidden');
    document.getElementById('modal-body').innerHTML = '';
}

function closeTaskDetail(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById('task-detail-modal');
    modal.classList.add('hidden');
    document.getElementById('task-detail-body').innerHTML = '';
}

function normalizeTask(task) {
    let status = task.status;
    if (status === "inProgress") status = "in-progress";
    if (status === "awaitFeedback") status = "await-feedback";
    return { ...task, status };
}

function renderAssignedContacts(ids) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) return "<p class='detail-empty'>No assigned contacts</p>";
    return ids.map(id => {
        const contact = allContacts[id] || { name: id };
        const initials = contact.name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();
        return `
            <div class="assigned-person">
                <div class="avatar-circle">${initials}</div>
                <div class="assigned-info">
                    <span class="assigned-name">${contact.name}</span>
                </div>
            </div>`;
    }).join("");
}

function renderSubtasks(subtasks) {
    if (!subtasks || typeof subtasks !== "object") return "<p class='detail-empty'>No subtasks</p>";
    return Object.values(subtasks).map(sub => `
        <li class="subtask-item">
            <label>
                <input type="checkbox" ${sub.done ? "checked" : ""} disabled>
                <span>${sub.title}</span>
            </label>
        </li>`).join("");
}

function openTaskDetail(id) {
    const task = todos.find(t => t.id === id);
    if (!task) return;
    const modal = document.getElementById('task-detail-modal');
    const modalBody = document.getElementById('task-detail-body');

    const category = task.category ? `<span class="detail-category-badge">${task.category}</span>` : "";
    const priority = task.priority ? `<span class="task-priority badge-${task.priority.toLowerCase()}">${task.priority}</span>` : "";
    const description = task.description ? `<p class="task-detail-description">${task.description}</p>` : "";
    const dueDate = task.dueDate ? `<span class="detail-value">${task.dueDate}</span>` : "<span class='detail-empty'>No due date</span>";

    modalBody.innerHTML = `
        <div class="task-detail-card">
            <div class="task-detail-top">
                <div>${category}</div>
                <div>${priority}</div>
            </div>
            <h2 class="detail-title">${task.title}</h2>
            ${description}
            <div class="detail-grid">
                <div class="detail-block">
                    <span class="detail-label">Due date:</span>
                    ${dueDate}
                </div>
                <div class="detail-block">
                    <span class="detail-label">Priority:</span>
                    ${priority}
                </div>
            </div>
            <div class="detail-section">
                <h3>Assigned To:</h3>
                <div class="assigned-list">${renderAssignedContacts(task.assignedTo)}</div>
            </div>
            <div class="detail-section">
                <h3>Subtasks</h3>
                <ul class="subtask-list">${renderSubtasks(task.subtasks)}</ul>
            </div>
            <div class="detail-actions">
                <button class="btn-detail btn-delete">Delete</button>
                <button class="btn-detail btn-edit">Edit</button>
            </div>
        </div>`;

    modal.classList.remove('hidden');
}

async function loadTasks() {
    let tasksData = null;

    try {
        const response = await fetch("database-import.json");
        if (response.ok) {
            const localData = await response.json();
            tasksData = localData.tasks;
            allContacts = localData.contacts || {};
        } else {
            console.error("Failed to load local task data", response.status, response.statusText);
        }
    } catch (error) {
        console.error("Local load failed", error);
    }

    if (tasksData && typeof tasksData === "object") {
        todos = Object.entries(tasksData).map(([id, task]) => ({ id, ...normalizeTask(task) }));
    } else {
        todos = [];
    }

    updateHTML();
}
