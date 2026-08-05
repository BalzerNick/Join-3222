let todos = [];
let allContacts = {};
let searchTerm = "";
let editingTaskId = null;
let taskEditSubtasks = [];

// This variable stores the ID of the task that is currently being dragged.
let currentDraggedElement = null;

window.addEventListener('load', () => {
    initPage();
});

async function initPage() {
    await loadTasks();
    getContacts()
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

    const filteredTasks = todos.filter(task => {
        const matchesStatus = task.status === columnId;

        const matchesSearch =
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm);

        return matchesStatus && matchesSearch;
    });

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
    const priority = element.priority ? getPriorityIcon(element.priority) : "";
    const category = getCategoryBadge(element.category, false);
    const description = element.description ? `<p class="task-description">${element.description}</p>` : "";
    const subtaskTotal = element.subtasks ? Object.keys(element.subtasks).length : 0;
    const subtaskDone = element.subtasks ? Object.values(element.subtasks).filter(sub => sub.done).length : 0;
    const subtasks = subtaskTotal > 0 ? { done: subtaskDone, total: subtaskTotal, percent: Math.round((subtaskDone / subtaskTotal) * 100) } : null;

    const avatarsHTML = getAvatarsHTML(element.assignedTo);

    const subtaskHTML = subtasks ? `
        <div class="subtask-row">
            <div class="subtask-wrap">
                <div class="subtask-progress" aria-hidden>
                    <div class="subtask-progress-fill" style="width: ${subtasks.percent}%;"></div>
                </div>
                <div class="subtask-count">${subtasks.done}/${subtasks.total} Subtasks</div>
            </div>
        </div>` : "";

    return `
        <div draggable="true"
             ondragstart="startDragging('${element.id}')"
             onclick="openTaskDetail('${element.id}')"
             class="todo">
            <div class="task-topline">
                <div class="task-topline-left">${category}</div>
            </div>
            <h3 class="task-title">${element.title}</h3>
            ${description}

            ${subtaskHTML}
            <div class="task-footer">
                <div class="footer-left">
                    <div class="avatars">${avatarsHTML}</div>
                </div>
                <div class="footer-right">${priority}</div>
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
    editingTaskId = null;
    taskEditSubtasks = [];
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
        const initials = contact.initials;
        const color = getAvatarColor(contact.name);
        return `
            <div class="assigned-person">
                ${getContactInitial(initials, color)}
                <div class="assigned-info">
                    <span class="assigned-name">${contact.name}</span>
                </div>
            </div>`;
    }).join("");
}

function renderSubtasks(taskId, subtasks) {
    if (!subtasks || typeof subtasks !== "object" || Object.keys(subtasks).length === 0) return "<p class='detail-empty'>No subtasks</p>";
    return Object.entries(subtasks).map(([subtaskId, sub]) => `
        <li class="subtask-item">
            <label>
                <input type="checkbox" ${sub.done ? "checked" : ""} onchange="toggleSubtaskDone('${taskId}', '${subtaskId}', this.checked)">
                <span>${sub.title}</span>
            </label>
        </li>`).join("");
}

function openTaskDetail(id) {
    const task = todos.find(t => t.id === id);
    if (!task) return;
    const modal = document.getElementById('task-detail-modal');
    const modalBody = document.getElementById('task-detail-body');

    modalBody.innerHTML = getTaskDetailHTML(task);
    modal.classList.remove('hidden');
}

function getTaskDetailHTML(task) {
    const category = getCategoryBadge(task.category, true);
    const priority = task.priority ? getPriorityIcon(task.priority) : "";
    const description = task.description ? `<p class="task-detail-description">${escapeHtml(task.description)}</p>` : "";
    const dueDate = task.dueDate ? `<span class="detail-value">${escapeHtml(task.dueDate)}</span>` : "<span class='detail-empty'>No due date</span>";

    return `
        <div class="task-detail-card">
            <div class="task-detail-top">
                <div>${category}</div>
                <button class="modal-close task-detail-close" onclick="closeTaskDetail()">&times;</button>
            </div>
            <h2 class="detail-title">${escapeHtml(task.title)}</h2>
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
                <ul class="subtask-list">${renderSubtasks(task.id, task.subtasks)}</ul>
            </div>
            <div class="detail-actions">
                <button class="btn-detail btn-delete" onclick="deleteTask('${task.id}')">Delete</button>
                <button class="btn-detail btn-edit" onclick="enterEditMode('${task.id}')">Edit</button>
            </div>
        </div>`;
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function enterEditMode(taskId) {
    const task = todos.find(t => t.id === taskId);
    if (!task) return;

    editingTaskId = taskId;
    taskEditSubtasks = Object.entries(task.subtasks || {}).map(([subtaskId, sub]) => ({
        id: subtaskId,
        title: sub.title,
        done: !!sub.done
    }));

    const modalBody = document.getElementById('task-detail-body');
    modalBody.innerHTML = getTaskEditHTML(task);
    setupTaskEditForm();
}

function getTaskEditHTML(task) {
    const category = getCategoryBadge(task.category, true);
    const dueDate = task.dueDate ? escapeHtml(task.dueDate) : "";
    const description = task.description ? escapeHtml(task.description) : "";

    return `
        <div class="task-detail-card">
            <div class="task-detail-top">
                <div>${category}</div>
                <button class="modal-close task-detail-close" onclick="closeTaskDetail()">&times;</button>
            </div>
            <form id="task-edit-form" class="task-edit-form" onsubmit="saveTaskEdits(event)">
                <div class="form-row">
                    <label for="editTaskTitle">Title</label>
                    <input id="editTaskTitle" class="task-edit-input" type="text" value="${escapeHtml(task.title)}" required>
                </div>
                <div class="form-row">
                    <label for="editTaskDescription">Description</label>
                    <textarea id="editTaskDescription" class="task-edit-textarea">${description}</textarea>
                </div>
                <div class="detail-grid edit-grid">
                    <div class="detail-block edit-block">
                        <label class="detail-label" for="editTaskDeadline">Due date</label>
                        <input id="editTaskDeadline" class="task-edit-input" type="date" value="${dueDate}">
                    </div>
                    <div class="detail-block edit-block">
                        <span class="detail-label">Priority</span>
                        <div class="edit-priority-buttons">
                            <button type="button" class="priority-select" onclick="setEditPriority('urgent')">Urgent</button>
                            <button type="button" class="priority-select" onclick="setEditPriority('medium')">Medium</button>
                            <button type="button" class="priority-select" onclick="setEditPriority('low')">Low</button>
                        </div>
                        <input type="hidden" id="editTaskPriority" value="${escapeHtml(task.priority || 'medium')}">
                    </div>
                </div>
                <div class="detail-section">
                    <h3>Assigned To</h3>
                    <div class="assigned-list">${renderAssignedContacts(task.assignedTo)}</div>
                </div>
                <div class="detail-section">
                    <h3>Subtasks</h3>
                    <div class="subtask-entry">
                        <input id="editSubtaskInput" class="task-edit-input" type="text" placeholder="Add new subtask">
                        <button type="button" class="icon-button" onclick="addEditSubtask()">✔</button>
                        <button type="button" class="icon-button" onclick="resetEditSubtaskInput()">✖</button>
                    </div>
                    <div id="editSubtaskList" class="subtask-list edit-subtask-list"></div>
                </div>
                <div class="detail-actions">
                    <button type="button" class="btn-detail btn-delete" onclick="deleteTask('${task.id}')">Delete</button>
                    <button type="submit" class="btn-detail btn-edit">Save</button>
                </div>
            </form>
        </div>`;
}

function setupTaskEditForm() {
    const input = document.getElementById('editSubtaskInput');
    if (input) {
        input.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                addEditSubtask();
            }
        });
    }
    updateEditPriorityButtons();
    renderEditSubtasks();
}

function updateEditPriorityButtons() {
    const current = document.getElementById('editTaskPriority')?.value || 'medium';
    document.querySelectorAll('.priority-select').forEach(button => {
        button.classList.toggle('selected', button.textContent.toLowerCase() === current);
    });
}

function setEditPriority(priority) {
    const input = document.getElementById('editTaskPriority');
    if (input) input.value = priority;
    updateEditPriorityButtons();
}

function renderEditSubtasks() {
    const list = document.getElementById('editSubtaskList');
    if (!list) return;
    list.innerHTML = taskEditSubtasks.map(subtask => `
        <div class="subtask-item editable" data-subtask-id="${subtask.id}">
            <span class="subtask-title">${escapeHtml(subtask.title)}</span>
            <div class="subtask-actions">
                <button type="button" onclick="editTaskSubtask('${subtask.id}')">✎</button>
                <button type="button" onclick="deleteTaskSubtask('${subtask.id}')">✖</button>
            </div>
        </div>
    `).join('');
}

function addEditSubtask() {
    const input = document.getElementById('editSubtaskInput');
    if (!input) return;
    const value = input.value.trim();
    if (!value) return;
    taskEditSubtasks.push({ id: `subtask-${Date.now()}`, title: value, done: false });
    input.value = '';
    renderEditSubtasks();
}

function resetEditSubtaskInput() {
    const input = document.getElementById('editSubtaskInput');
    if (input) input.value = '';
}

function deleteTaskSubtask(subtaskId) {
    taskEditSubtasks = taskEditSubtasks.filter(item => item.id !== subtaskId);
    renderEditSubtasks();
}

function editTaskSubtask(subtaskId) {
    const subtask = taskEditSubtasks.find(item => item.id === subtaskId);
    if (!subtask) return;
    const newTitle = prompt('Edit subtask', subtask.title);
    if (newTitle === null) return;
    subtask.title = newTitle.trim() || subtask.title;
    renderEditSubtasks();
}

function saveTaskEdits(event) {
    event.preventDefault();
    const task = todos.find(t => t.id === editingTaskId);
    if (!task) return;

    const title = document.getElementById('editTaskTitle')?.value.trim();
    const description = document.getElementById('editTaskDescription')?.value.trim();
    const dueDate = document.getElementById('editTaskDeadline')?.value;
    const priority = document.getElementById('editTaskPriority')?.value || task.priority;

    if (title) task.title = title;
    task.description = description || '';
    task.dueDate = dueDate || '';
    task.priority = priority;
    task.subtasks = taskEditSubtasks.reduce((obj, sub) => {
        obj[sub.id] = { title: sub.title, done: sub.done };
        return obj;
    }, {});

    editingTaskId = null;
    taskEditSubtasks = [];
    updateHTML();
    closeTaskDetail();
}

function deleteTask(taskId) {
    todos = todos.filter(task => task.id !== taskId);
    updateHTML();
    closeTaskDetail();
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

function findTask() {
    searchTerm = document.getElementById("searchInput").value.toLowerCase();
    updateHTML();
}

function getPriorityIcon(priority) {
    if (!priority) return "";
    const p = String(priority).toLowerCase();
    const capitalized = p.charAt(0).toUpperCase() + p.slice(1);
    const src = `assets/icons/Property%201=${capitalized}.png`;
    return `<img class="priority-icon" src="${src}" alt="${priority}">`;
}

function getBoardInitials(name) {
    if (!name || typeof name !== 'string') return '';
    return name
        .split(' ')
        .filter(Boolean)
        .map(word => word[0])
        .join('')
        .toUpperCase();
}

function getAvatarsHTML(ids) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) return "";
    const max = 3;
    return ids.slice(0, max).map(id => {
        const contact = allContacts[id] || { name: id };
        const initials = contact.initials;
        const color = getAvatarColor(contact.name);
        return getContactInitial(initials, color);
    }).join("");
}

function toggleSubtaskDone(taskId, subtaskId, done) {
    const task = todos.find(t => t.id === taskId);
    if (!task || !task.subtasks || !task.subtasks[subtaskId]) return;
    task.subtasks[subtaskId].done = done;
    updateHTML();
}

function getCategoryBadge(category, isDetail = false) {
    if (!category) return "";
    const baseClass = isDetail ? 'detail-category-badge' : 'task-badge';
    let extra = '';
    if (category === 'User Story') extra = 'cat-user-story';
    else if (category === 'Technical Task') extra = 'cat-technical-task';
    return `<span class="${baseClass} ${extra}">${category}</span>`;
}