let todos = [];
let allContacts = {};
let searchTerm = "";
let editingTaskId = null;
let taskEditSubtasks = [];
let taskEditSelectedContacts = [];
let taskEditContactPool = [];
let currentDraggedElement = null;

window.onload = initPage;

async function initPage() {
    await loadContacts();
    if (typeof getContacts === 'function') await getContacts();
    await loadTasks();
}

function updateHTML() {
    [['todo', 'To Do'], ['in-progress', 'In Progress'], ['await-feedback', 'Await feedback'], ['done', 'Done']]
        .forEach(([id, name]) => renderColumn(id, name));
}

function renderColumn(columnId, columnName) {
    const column = document.getElementById(columnId);
    const filteredTasks = todos.filter(task =>
        task.status === columnId && `${task.title || ''} ${task.description || ''}`.toLowerCase().includes(searchTerm)
    );
    column.innerHTML = '';
    column.innerHTML = filteredTasks.length
        ? filteredTasks.map(task => getTaskTemplate(buildTaskTemplateData(task))).join('')
        : getBoardEmptyColumnTemplate(columnName);
}

function startDragging(id) {
    currentDraggedElement = id;
}

function allowDrop(ev) {
    ev.preventDefault();
}

async function moveTo(category) {
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
    removeHighlight(category);
}

function normalizeTask(task) {
    let status = task.status;
    if (status === 'inProgress') status = 'in-progress';
    if (status === 'awaitFeedback') status = 'await-feedback';
    return { ...task, status };
}

async function loadContacts() {
    try {
        const response = await fetch(BASE_URL + 'contacts.json');
        allContacts = response.ok ? await response.json() : {};
        if (!response.ok) console.error('Failed to load Firebase contacts', response.status, response.statusText);
    } catch (error) {
        console.error('Firebase contacts load failed', error);
        allContacts = {};
    }
}

async function loadTasks() {
    todos = mapLoadedTasks(await fetchTaskCollection());
    console.info('Board loaded tasks:', todos.length, todos.map(task => task.id));
    updateHTML();
}

async function fetchTaskCollection() {
    try {
        const response = await fetch(BASE_URL + 'tasks.json');
        if (response.ok) return await response.json();
        console.error('Failed to load Firebase task data', response.status, response.statusText);
    } catch (error) {
        console.error('Firebase task load failed', error);
    }
    return null;
}

function mapLoadedTasks(tasksData) {
    if (!tasksData || typeof tasksData !== 'object') return [];
    return Object.entries(tasksData).map(([id, task]) => ({ id, ...normalizeTask(task) }));
}

async function updateTaskStatus(taskId, status) {
    await patchBoardResource(`tasks/${taskId}.json`, { status }, 'Firebase status update failed');
}

async function getNextBoardTaskId() {
    const tasks = await requireBoardJson('tasks.json', 'Firebase load tasks failed');
    if (!tasks || typeof tasks !== 'object') return 'task1';
    const ids = Object.keys(tasks).map(extractTaskNumber).filter(num => num > 0);
    return 'task' + (ids.length === 0 ? 1 : Math.max(...ids) + 1);
}

function extractTaskNumber(key) {
    const match = key.match(/^task(\d+)$/);
    return match ? Number(match[1]) : 0;
}

async function updateTaskData(taskId, updates) {
    await patchBoardResource(`tasks/${taskId}.json`, updates, 'Firebase task update failed');
}

async function deleteTaskFromFirebase(taskId) {
    const response = await fetch(BASE_URL + `tasks/${taskId}.json`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`Firebase task delete failed: ${response.status} ${response.statusText}`);
}

async function updateSubtaskDone(taskId, subtaskId, done) {
    await patchBoardResource(`tasks/${taskId}/subtasks/${subtaskId}.json`, { done }, 'Firebase subtask update failed');
}

async function patchBoardResource(path, payload, message) {
    const response = await fetch(BASE_URL + path, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`${message}: ${response.status} ${response.statusText}`);
}

async function requireBoardJson(path, message) {
    const response = await fetch(BASE_URL + path);
    if (!response.ok) throw new Error(`${message}: ${response.status} ${response.statusText}`);
    return await response.json();
}

function highlight(id) {
    document.getElementById(id).classList.add('drag-area-highlight');
}

function removeHighlight(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
}

function findTask() {
    searchTerm = document.getElementById("searchInput").value.toLowerCase();
    updateHTML();
}

function openAddTaskDialog(status = 'todo') {
    const modal = document.getElementById('add-task-modal');
    document.getElementById('modal-body').innerHTML = getAddTaskPage();
    resetBoardAddTaskState();
    injectBoardTaskStatus(status);
    const form = document.getElementById('addTaskForm');
    if (form) form.onsubmit = submitBoardTaskData;
    setupBoardSubtaskControls();
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
}

function resetBoardAddTaskState() {
    if (typeof selectedContacts !== 'undefined') selectedContacts = [];
    if (typeof subtasks !== 'undefined') subtasks = {};
    if (typeof sub !== 'undefined') sub = false;
    if (typeof editingSubtaskKey !== 'undefined') editingSubtaskKey = null;
    if (typeof selectedPriority !== 'undefined') selectedPriority = 'medium';
    const subtaskInput = document.getElementById('subtask');
    if (subtaskInput) subtaskInput.value = '';
    const subtaskArea = document.getElementById('subtaskArea');
    if (subtaskArea) subtaskArea.innerHTML = '';
    const assignedContacts = document.getElementById('assignedContacts');
    if (assignedContacts) assignedContacts.innerHTML = '';
    const subtaskButtons = document.getElementById('subtaskButtons');
    if (subtaskButtons) subtaskButtons.classList.add('d-none');
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

function setupBoardSubtaskControls() {
    const subtaskInput = document.getElementById('subtask');
    if (!subtaskInput) return;
    const subtaskArea = document.querySelector('.subtask-area');
    if (subtaskArea && !subtaskArea.id) subtaskArea.id = 'subtaskArea';
    subtaskInput.oninput = () => { if (typeof showButtons === 'function') showButtons(); };
    const wrapper = subtaskInput.parentElement;
    if (!wrapper || document.getElementById('subtaskButtons')) return;
    const buttons = document.createElement('div');
    buttons.className = 'subtask-buttons input-img d-none';
    buttons.id = 'subtaskButtons';
    buttons.innerHTML = getBoardSubtaskButtonsTemplate();
    wrapper.appendChild(buttons);
}

async function submitBoardTaskData(event) {
    event.preventDefault();
    const title = document.getElementById('taskName')?.value.trim();
    if (!title) return alert('Please enter a title.');
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });
        if (!response.ok) throw new Error(`Task create failed: ${response.status} ${response.statusText}`);
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
    if (toast._timeout) clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('center-toast-visible');
        toast._timeout = null;
    }, duration);
}

function closeAddTaskDialog(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('add-task-modal').classList.add('hidden');
    document.getElementById('modal-body').innerHTML = '';
    removeModalOpenFlag();
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

function buildTaskTemplateData(task) {
    return {
        id: task.id,
        title: escapeHtml(task.title || ''),
        category: getCategoryBadge(task.category),
        description: task.description ? getTaskDescriptionTemplate(escapeHtml(task.description)) : '',
        priority: task.priority ? getPriorityIcon(task.priority) : '',
        avatarsHTML: getAvatarsHTML(task.assignedTo),
        subtaskHTML: getTaskSubtaskHtml(task.subtasks)
    };
}

function getTaskSubtaskHtml(subtasks) {
    const total = subtasks ? Object.keys(subtasks).length : 0;
    if (total === 0) return '';
    const done = Object.values(subtasks).filter(subtask => subtask.done).length;
    return getTaskSubtaskProgressTemplate({ done, total, percent: Math.round((done / total) * 100) });
}

function openTaskDetail(id) {
    const task = todos.find(todo => todo.id === id);
    if (!task) return;
    document.getElementById('task-detail-body').innerHTML = getTaskDetailTemplate({
        id: task.id,
        title: escapeHtml(task.title || ''),
        category: getCategoryBadge(task.category, true),
        priority: getPriorityDetail(task.priority),
        description: task.description ? getTaskDescriptionTemplate(escapeHtml(task.description), 'task-detail-description') : '',
        dueDate: getTaskDueDateTemplate(task.dueDate ? escapeHtml(task.dueDate) : ''),
        assignedContactsHTML: renderAssignedContacts(task.assignedTo),
        subtasksHTML: renderSubtasks(task.id, task.subtasks)
    });
    document.getElementById('task-detail-modal').classList.remove('hidden');
    document.body.classList.add('modal-open');
}

function renderAssignedContacts(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return getEmptyAssignedContactsTemplate();
    return ids.map(item => {
        const contact = getBoardContact(item);
        return getAssignedContactTemplate(getContactInitial(contact.initials, contact.color), escapeHtml(contact.name));
    }).join('');
}

function renderSubtasks(taskId, subtasks) {
    if (!subtasks || typeof subtasks !== 'object' || Object.keys(subtasks).length === 0) return getEmptySubtasksTemplate();
    return Object.entries(subtasks).map(([subtaskId, subtask]) =>
        getTaskSubtaskItemTemplate(taskId, subtaskId, subtask.done, escapeHtml(subtask.title))
    ).join('');
}

function getPriorityIcon(priority) {
    if (!priority) return '';
    const normalized = String(priority).toLowerCase();
    const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    return getPriorityIconTemplate(label, escapeHtml(normalized));
}

function getPriorityDetail(priority) {
    if (!priority) return getEmptyPriorityTemplate();
    const normalized = String(priority).toLowerCase();
    const labels = { urgent: 'Urgent', medium: 'Medium', low: 'Low' };
    const label = labels[normalized] || escapeHtml(normalized.charAt(0).toUpperCase() + normalized.slice(1));
    return getPriorityDetailTemplate(label, getPriorityIcon(priority));
}

function getAvatarsHTML(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return '';
    return ids.slice(0, 3).map(item => {
        const contact = getBoardContact(item);
        return getContactInitial(contact.initials, contact.color);
    }).join('');
}

function getBoardContact(item) {
    const name = typeof item === 'string'
        ? (allContacts[item]?.name || item)
        : (item && typeof item === 'object' ? item.name || item.Name || item.Initials || JSON.stringify(item) : String(item));
    return { name, initials: getInitials(name), color: getAvatarColor(name) };
}

function getCategoryBadge(category, isDetail = false) {
    if (!category) return '';
    const badgeClass = isDetail ? 'detail-category-badge' : 'task-badge';
    const extraClass = category === 'User Story' ? 'cat-user-story' : (category === 'Technical Task' ? 'cat-technical-task' : '');
    return getCategoryBadgeTemplate(badgeClass, extraClass, escapeHtml(category));
}
