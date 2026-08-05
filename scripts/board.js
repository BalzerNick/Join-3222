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
    await loadContacts();
    if (typeof getContacts === 'function') {
        await getContacts();
    }
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
            column.innerHTML += getTaskTemplate(buildTaskTemplateData(element));
        }
    }
}

function startDragging(id) {
    // Remember which task is being dragged
    currentDraggedElement = id;
}

function buildTaskTemplateData(task) {
    const category = getCategoryBadge(task.category, false);
    const description = task.description ? `<p class="task-description">${task.description}</p>` : "";
    const subtaskTotal = task.subtasks ? Object.keys(task.subtasks).length : 0;
    const subtaskDone = task.subtasks ? Object.values(task.subtasks).filter(sub => sub.done).length : 0;
    const subtasks = subtaskTotal > 0 ? { done: subtaskDone, total: subtaskTotal, percent: Math.round((subtaskDone / subtaskTotal) * 100) } : null;
    const subtaskHTML = subtasks ? `
        <div class="subtask-row">
            <div class="subtask-wrap">
                <div class="subtask-progress" aria-hidden>
                    <div class="subtask-progress-fill" style="width: ${subtasks.percent}%;"></div>
                </div>
                <div class="subtask-count">${subtasks.done}/${subtasks.total} Subtasks</div>
            </div>
        </div>` : "";
    return {
        id: task.id,
        title: task.title,
        category,
        description,
        priority: task.priority ? getPriorityIcon(task.priority) : "",
        avatarsHTML: getAvatarsHTML(task.assignedTo),
        subtaskHTML
    };
}

function allowDrop(ev) {
    // Prevent default so drop event is allowed on the drop target.
    ev.preventDefault();
}

async function moveTo(category) {
    // Change the status of the dragged task and refresh the board.
    const task = todos.find(t => t.id === currentDraggedElement);
    if (task) {
        const previousStatus = task.status;
        task.status = category;
        updateHTML();

        try {
            await updateTaskStatus(task.id, category);
        } catch (error) {
            console.error("Failed to persist task status update", error);
            task.status = previousStatus;
            updateHTML();
        }
    }
    // Remove highlight from the drop target so it doesn't remain highlighted after drop.
    const target = document.getElementById(category);
    if (target) removeHighlight(category);
}

async function updateTaskStatus(taskId, status) {
    const response = await fetch(BASE_URL + `tasks/${taskId}.json`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
    });

    if (!response.ok) {
        throw new Error(`Firebase status update failed: ${response.status} ${response.statusText}`);
    }
}

function highlight(id) {
    // Add a highlight style to the drag area while an item is dragged over it.
    document.getElementById(id).classList.add('drag-area-highlight');
}

function removeHighlight(id) {
    // Remove the highlight once the dragged item leaves the area.
    document.getElementById(id).classList.remove('drag-area-highlight');
}

function openAddTaskDialog(status = 'todo') {
    const modal = document.getElementById('add-task-modal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = getAddTaskPage();
    resetBoardAddTaskState();
    injectBoardTaskStatus(status);
    attachBoardTaskFormHandler();
    setupBoardSubtaskControls();
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
}

function resetBoardAddTaskState() {
    if (typeof selectedContacts !== 'undefined') {
        selectedContacts = [];
    }
    if (typeof subtasks !== 'undefined') {
        subtasks = {};
    }
    if (typeof sub !== 'undefined') {
        sub = false;
    }
    if (typeof editingSubtaskKey !== 'undefined') {
        editingSubtaskKey = null;
    }
    if (typeof selectedPriority !== 'undefined') {
        selectedPriority = 'medium';
    }

    const subtaskInput = document.getElementById('subtask');
    if (subtaskInput) {
        subtaskInput.value = '';
    }
    const subtaskArea = document.getElementById('subtaskArea');
    if (subtaskArea) {
        subtaskArea.innerHTML = '';
    }
    const assignedContacts = document.getElementById('assignedContacts');
    if (assignedContacts) {
        assignedContacts.innerHTML = '';
    }
    const subtaskButtons = document.getElementById('subtaskButtons');
    if (subtaskButtons) {
        subtaskButtons.classList.add('d-none');
    }
}

function injectBoardTaskStatus(status) {
    const form = document.getElementById('addTaskForm');
    if (!form) return;

    let statusInput = document.getElementById('taskStatus');
    if (!statusInput) {
        statusInput = document.createElement('input');
        statusInput.type = 'hidden';
        statusInput.id = 'taskStatus';
        statusInput.name = 'taskStatus';
        form.appendChild(statusInput);
    }
    statusInput.value = status;
}

function attachBoardTaskFormHandler() {
    const form = document.getElementById('addTaskForm');
    if (!form) return;

    form.onsubmit = submitBoardTaskData;
}

function setupBoardSubtaskControls() {
    const subtaskInput = document.getElementById('subtask');
    if (!subtaskInput) return;

    const subtaskArea = document.querySelector('.subtask-area');
    if (subtaskArea && !subtaskArea.id) {
        subtaskArea.id = 'subtaskArea';
    }

    subtaskInput.oninput = function() {
        if (typeof showButtons === 'function') {
            showButtons();
        }
    };

    const wrapper = subtaskInput.parentElement;
    if (!wrapper) return;

    if (!document.getElementById('subtaskButtons')) {
        const buttons = document.createElement('div');
        buttons.className = 'subtask-buttons input-img d-none';
        buttons.id = 'subtaskButtons';
        buttons.innerHTML = `
            <img class="input-img subtask-icon pointer" src="assets/icons/close.svg" alt="x" onclick="clearSubtask()">
            <span>|</span>
            <img class="input-img subtask-icon pointer" src="assets/icons/check_black.svg" alt="Add subtask" onclick="safeSubtask()">
        `;
        wrapper.appendChild(buttons);
    }
}

async function submitBoardTaskData(event) {
    event.preventDefault();

    const title = document.getElementById('taskName')?.value.trim();
    if (!title) {
        alert('Please enter a title.');
        return;
    }

    const task = {
        title,
        description: document.getElementById('taskDescription')?.value.trim() || '',
        dueDate: document.getElementById('taskDeadline')?.value || '',
        priority: getBoardDialogPriority(),
        category: document.getElementById('category')?.value || '',
        status: document.getElementById('taskStatus')?.value || 'todo',
        assignedTo: typeof selectedContacts !== 'undefined' ? selectedContacts : [],
        subtasks: typeof subtasks !== 'undefined' ? subtasks : {}
    };

    try {
        const nextID = await getNextBoardTaskId();
        const response = await fetch(BASE_URL + `tasks/${nextID}.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });

        if (!response.ok) {
            throw new Error(`Task create failed: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error('Board task creation failed', error);
        alert('Failed to create task. Please try again.');
        return;
    }

    if (typeof resetTask === 'function') {
        try {
            resetTask();
        } catch (resetError) {
            console.warn('Board resetTask failed', resetError);
        }
    }

    closeAddTaskDialog();
    await loadTasks();
    showBoardToast('Task added to Board', 2000);
}

function getBoardDialogPriority() {
    const urgent = document.getElementById('btnUrgent');
    const medium = document.getElementById('btnMedium');
    const low = document.getElementById('btnLow');

    if (urgent?.classList.contains('selected')) return 'urgent';
    if (low?.classList.contains('selected')) return 'low';
    if (medium?.classList.contains('selected')) return 'medium';
    return 'medium';
}

function showBoardToast(message, duration = 2000) {
    const toast = document.getElementById('center-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('center-toast-visible');
    if (toast._timeout) {
        clearTimeout(toast._timeout);
    }
    toast._timeout = setTimeout(() => {
        toast.classList.remove('center-toast-visible');
        toast._timeout = null;
    }, duration);
}

async function getNextBoardTaskId() {
    const response = await fetch(BASE_URL + 'tasks.json');
    if (!response.ok) {
        throw new Error(`Firebase load tasks failed: ${response.status} ${response.statusText}`);
    }
    const tasks = await response.json();
    if (!tasks || typeof tasks !== 'object') {
        return 'task1';
    }

    const ids = Object.keys(tasks)
        .map(key => {
            const match = key.match(/^task(\d+)$/);
            return match ? Number(match[1]) : 0;
        })
        .filter(num => num > 0);

    const next = ids.length === 0 ? 1 : Math.max(...ids) + 1;
    return 'task' + next;
}

function closeAddTaskDialog(event) {
    // Allow closing by clicking the X button or the overlay background
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById('add-task-modal');
    modal.classList.add('hidden');
    document.getElementById('modal-body').innerHTML = '';
    removeModalOpenFlag();
}

function closeTaskDetail(event) {
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById('task-detail-modal');
    modal.classList.add('hidden');
    document.getElementById('task-detail-body').innerHTML = '';
    editingTaskId = null;
    taskEditSubtasks = [];
    removeModalOpenFlag();
}

function normalizeTask(task) {
    let status = task.status;
    if (status === "inProgress") status = "in-progress";
    if (status === "awaitFeedback") status = "await-feedback";
    return { ...task, status };
}

async function loadContacts() {
    try {
        const response = await fetch(BASE_URL + "contacts.json");
        if (response.ok) {
            allContacts = await response.json();
        } else {
            console.error("Failed to load Firebase contacts", response.status, response.statusText);
            allContacts = {};
        }
    } catch (error) {
        console.error("Firebase contacts load failed", error);
        allContacts = {};
    }
}

function renderAssignedContacts(ids) {
    if (!ids || !Array.isArray(ids) || ids.length === 0) return "<p class='detail-empty'>No assigned contacts</p>";
    return ids.map(item => {
        let contact;
        if (typeof item === 'string') {
            contact = allContacts[item] || { name: item };
        } else if (item && typeof item === 'object') {
            const name = item.name || item.Name || item.Name || item.Initials || JSON.stringify(item);
            contact = { name };
        } else {
            contact = { name: String(item) };
        }
        const initials = getBoardInitials(contact.name);
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

    const category = getCategoryBadge(task.category, true);
    const priority = task.priority ? getPriorityIcon(task.priority) : "";
    const description = task.description ? `<p class="task-detail-description">${escapeHtml(task.description)}</p>` : "";
    const dueDate = task.dueDate ? `<span class="detail-value">${escapeHtml(task.dueDate)}</span>` : "<span class='detail-empty'>No due date</span>";
    const assignedContactsHTML = renderAssignedContacts(task.assignedTo);
    const subtasksHTML = renderSubtasks(task.id, task.subtasks);

    modalBody.innerHTML = getTaskDetailTemplate({
        id: task.id,
        title: task.title,
        category,
        priority,
        description,
        dueDate,
        assignedContactsHTML,
        subtasksHTML
    });
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
}

function removeModalOpenFlag() {
    document.body.classList.remove('modal-open');
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

    const category = getCategoryBadge(task.category, true);
    const dueDate = task.dueDate ? escapeHtml(task.dueDate) : "";
    const description = task.description ? escapeHtml(task.description) : "";
    const assignedContactsHTML = renderAssignedContacts(task.assignedTo);
    const priority = task.priority ? String(task.priority).toLowerCase() : 'medium';
    const modalBody = document.getElementById('task-detail-body');

    modalBody.innerHTML = getTaskEditTemplate({
        id: task.id,
        title: task.title,
        category,
        dueDate,
        description,
        assignedContactsHTML,
        priority
    });
    setupTaskEditForm();
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
    const current = (document.getElementById('editTaskPriority')?.value || 'medium').toLowerCase();
    document.querySelectorAll('.priority-select').forEach(button => {
        button.classList.toggle('selected', button.textContent.trim().toLowerCase() === current);
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

async function saveTaskEdits(event) {
    event.preventDefault();
    const task = todos.find(t => t.id === editingTaskId);
    if (!task) return;

    const previousTask = {
        ...task,
        subtasks: JSON.parse(JSON.stringify(task.subtasks || {}))
    };
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

    const updates = {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        subtasks: task.subtasks
    };

    editingTaskId = null;
    taskEditSubtasks = [];
    updateHTML();
    closeTaskDetail();

    try {
        await updateTaskData(task.id, updates);
    } catch (error) {
        console.error('Failed to save task edits', error);
        const originalIndex = todos.findIndex(t => t.id === task.id);
        if (originalIndex !== -1) {
            todos[originalIndex] = previousTask;
        }
        updateHTML();
        alert('Speichern fehlgeschlagen. Bitte versuche es erneut.');
    }
}

async function deleteTask(taskId) {
    const previousTodos = [...todos];
    todos = todos.filter(task => task.id !== taskId);
    updateHTML();
    closeTaskDetail();

    try {
        await deleteTaskFromFirebase(taskId);
    } catch (error) {
        console.error('Failed to delete task', error);
        todos = previousTodos;
        updateHTML();
        alert('Löschen fehlgeschlagen. Bitte versuche es erneut.');
    }
}

async function updateTaskData(taskId, updates) {
    const response = await fetch(BASE_URL + `tasks/${taskId}.json`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
    });

    if (!response.ok) {
        throw new Error(`Firebase task update failed: ${response.status} ${response.statusText}`);
    }
}

async function deleteTaskFromFirebase(taskId) {
    const response = await fetch(BASE_URL + `tasks/${taskId}.json`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        throw new Error(`Firebase task delete failed: ${response.status} ${response.statusText}`);
    }
}

async function loadTasks() {
    let tasksData = null;

    try {
        const response = await fetch(BASE_URL + "tasks.json");
        if (response.ok) {
            tasksData = await response.json();
        } else {
            console.error("Failed to load Firebase task data", response.status, response.statusText);
        }
    } catch (error) {
        console.error("Firebase task load failed", error);
    }

    if (tasksData && typeof tasksData === "object") {
        todos = Object.entries(tasksData).map(([id, task]) => ({ id, ...normalizeTask(task) }));
    } else {
        todos = [];
    }

    console.info("Board loaded tasks:", todos.length, todos.map(task => task.id));
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
    return ids.slice(0, max).map(item => {
        let contact;
        if (typeof item === 'string') {
            contact = allContacts[item] || { name: item };
        } else if (item && typeof item === 'object') {
            const name = item.name || item.Name || item.Initials || JSON.stringify(item);
            contact = { name };
        } else {
            contact = { name: String(item) };
        }
        const initials = getBoardInitials(contact.name);
        const color = getAvatarColor(contact.name);
        return getContactInitial(initials, color);
    }).join("");
}

async function toggleSubtaskDone(taskId, subtaskId, done) {
    const task = todos.find(t => t.id === taskId);
    if (!task || !task.subtasks || !task.subtasks[subtaskId]) return;

    task.subtasks[subtaskId].done = done;
    updateHTML();

    try {
        await updateSubtaskDone(taskId, subtaskId, done);
    } catch (error) {
        console.error("Failed to persist subtask state", error);
        task.subtasks[subtaskId].done = !done;
        updateHTML();
    }
}

async function updateSubtaskDone(taskId, subtaskId, done) {
    const response = await fetch(BASE_URL + `tasks/${taskId}/subtasks/${subtaskId}.json`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ done })
    });

    if (!response.ok) {
        throw new Error(`Firebase subtask update failed: ${response.status} ${response.statusText}`);
    }
}

function getCategoryBadge(category, isDetail = false) {
    if (!category) return "";
    const baseClass = isDetail ? 'detail-category-badge' : 'task-badge';
    let extra = '';
    if (category === 'User Story') extra = 'cat-user-story';
    else if (category === 'Technical Task') extra = 'cat-technical-task';
    return `<span class="${baseClass} ${extra}">${category}</span>`;
}