let todos = [];
let allContacts = {};
let searchTerm = "";
let editingTaskId = null;
let taskEditSubtasks = [];
let taskEditSelectedContacts = [];
let taskEditContactPool = [];
let currentDraggedElement = null;

window.onload = initPage;

/**
 * Entry point of the board page, bound to window.onload. Loads the contacts
 * and the tasks and renders the columns.
 *
 * @returns {Promise<void>}
 */
async function initPage() {
    //await loadContacts();
    allContacts = getContactStorage();
    if (typeof getContacts === 'function') await getContacts();
    await loadTasks();
}

/**
 * Redraws all four board columns from the loaded tasks.
 *
 * @returns {void}
 */
function updateHTML() {
    [['todo', 'To Do'], ['in-progress', 'In Progress'], ['await-feedback', 'Await feedback'], ['done', 'Done']]
        .forEach(([id, name]) => renderColumn(id, name));
}

/**
 * Renders one column with the tasks of that status that also match the
 * current search term. Empty columns get a placeholder instead.
 *
 * @param {string} columnId - Id of the column element, which is also the task status.
 * @param {string} columnName - Display name used in the empty-column placeholder.
 * @returns {void}
 */
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

/**
 * Remembers which task is being dragged. Bound to ondragstart of a card.
 *
 * @param {string} id - Database key of the dragged task.
 * @returns {void}
 */
function startDragging(id) {
    currentDraggedElement = id;
}

/**
 * Allows dropping on a column by suppressing the browser default.
 *
 * @param {DragEvent} ev - The dragover event.
 * @returns {void}
 */
function allowDrop(ev) {
    ev.preventDefault();
}

/**
 * Moves the dragged task into another column and saves the new status.
 * The board updates immediately; if the write fails, the previous status is
 * restored and the board is drawn again.
 *
 * @param {string} category - Target column, e.g. 'done'.
 * @returns {Promise<void>}
 */
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

/**
 * Converts the camelCase status values stored in the database into the
 * hyphenated column ids used in the DOM.
 *
 * @param {Object} task - The task as loaded from the database.
 * @returns {Object} A copy of the task with a normalized status.
 */
function normalizeTask(task) {
    let status = task.status;
    if (status === 'inProgress') status = 'in-progress';
    if (status === 'awaitFeedback') status = 'await-feedback';
    return { ...task, status };
}

/**
 * Loads all tasks into the board and redraws the columns.
 *
 * @returns {Promise<void>}
 */
async function loadTasks() {
    todos = mapLoadedTasks(await fetchTaskCollection());
    updateHTML();
}

/**
 * Fetches the raw task collection. Errors are logged and reported as null.
 *
 * @returns {Promise<?Object>} The tasks keyed by id, or null on failure.
 */
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

/**
 * Turns the raw task collection into an array, attaching the database key as
 * id and normalizing the status of every task.
 *
 * @param {?Object} tasksData - The tasks keyed by id.
 * @returns {Array<Object>} The tasks as an array, empty if there is no data.
 */
function mapLoadedTasks(tasksData) {
    if (!tasksData || typeof tasksData !== 'object') return [];
    return Object.entries(tasksData).map(([id, task]) => ({ id, ...normalizeTask(task) }));
}

/**
 * Saves the new column of a task.
 *
 * @param {string} taskId - Database key of the task.
 * @param {string} status - The new status.
 * @returns {Promise<void>}
 * @throws {Error} If the database rejects the write.
 */
async function updateTaskStatus(taskId, status) {
    await patchBoardResource(`tasks/${taskId}.json`, { status }, 'Firebase status update failed');
}

/**
 * Determines the next free task id by taking the highest existing number and
 * adding one.
 *
 * @returns {Promise<string>} The next id, e.g. 'task7'. 'task1' if no tasks exist.
 * @throws {Error} If the tasks cannot be loaded.
 */
async function getNextBoardTaskId() {
    const tasks = await requireBoardJson('tasks.json', 'Firebase load tasks failed');
    if (!tasks || typeof tasks !== 'object') return 'task1';
    const ids = Object.keys(tasks).map(extractTaskNumber).filter(num => num > 0);
    return 'task' + (ids.length === 0 ? 1 : Math.max(...ids) + 1);
}

/**
 * Reads the number out of a task key, e.g. 'task12' yields 12.
 *
 * @param {string} key - Database key of a task.
 * @returns {number} The number, or 0 if the key does not follow the task<n> pattern.
 */
function extractTaskNumber(key) {
    const match = key.match(/^task(\d+)$/);
    return match ? Number(match[1]) : 0;
}

/**
 * Writes changed fields of a task back to the database.
 *
 * @param {string} taskId - Database key of the task.
 * @param {Object} updates - The fields to overwrite.
 * @returns {Promise<void>}
 * @throws {Error} If the database rejects the write.
 */
async function updateTaskData(taskId, updates) {
    await patchBoardResource(`tasks/${taskId}.json`, updates, 'Firebase task update failed');
}

/**
 * Deletes a task from the database.
 *
 * @param {string} taskId - Database key of the task.
 * @returns {Promise<void>}
 * @throws {Error} If the database rejects the delete.
 */
async function deleteTaskFromFirebase(taskId) {
    const response = await fetch(BASE_URL + `tasks/${taskId}.json`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`Firebase task delete failed: ${response.status} ${response.statusText}`);
}

/**
 * Saves the checkbox state of a single subtask.
 *
 * @param {string} taskId - Database key of the task.
 * @param {string} subtaskId - Key of the subtask, e.g. 'sub1'.
 * @param {boolean} done - The new state.
 * @returns {Promise<void>}
 * @throws {Error} If the database rejects the write.
 */
async function updateSubtaskDone(taskId, subtaskId, done) {
    await patchBoardResource(`tasks/${taskId}/subtasks/${subtaskId}.json`, { done }, 'Firebase subtask update failed');
}

/**
 * Sends a PATCH request to the database and turns a failed response into an
 * error. Shared by all partial writes of this file.
 *
 * @param {string} path - Path below the database root, including the .json suffix.
 * @param {Object} payload - The fields to write.
 * @param {string} message - Prefix of the error message.
 * @returns {Promise<void>}
 * @throws {Error} If the response status is not ok.
 */
async function patchBoardResource(path, payload, message) {
    const response = await fetch(BASE_URL + path, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`${message}: ${response.status} ${response.statusText}`);
}

/**
 * Reads a resource from the database and insists on a successful response.
 *
 * @param {string} path - Path below the database root, including the .json suffix.
 * @param {string} message - Prefix of the error message.
 * @returns {Promise<*>} The parsed response body.
 * @throws {Error} If the response status is not ok.
 */
async function requireBoardJson(path, message) {
    const response = await fetch(BASE_URL + path);
    if (!response.ok) throw new Error(`${message}: ${response.status} ${response.statusText}`);
    return await response.json();
}

/**
 * Highlights a column as a drop target. Bound to ondragenter.
 *
 * @param {string} id - Id of the column element.
 * @returns {void}
 */
function highlight(id) {
    document.getElementById(id).classList.add('drag-area-highlight');
}

/**
 * Removes the drop-target highlight from a column. Bound to ondragleave.
 *
 * @param {string} id - Id of the column element.
 * @returns {void}
 */
function removeHighlight(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
}

/**
 * Applies the board search. Matches against title and description of the
 * tasks and redraws all columns.
 *
 * @returns {void}
 */
function findTask() {
    searchTerm = document.getElementById("searchInput").value.toLowerCase();
    updateHTML();
}

/**
 * Opens the Add-Task dialog on the board, resets its state and wires up the
 * form so that the new task lands in the given column.
 *
 * @param {string} [status='todo'] - The column the new task belongs to.
 * @returns {void}
 */
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

/**
 * Clears everything the Add-Task form keeps in global state, so a freshly
 * opened dialog never shows leftovers from the last one. Each reset is
 * guarded, because tasks.js is not loaded on every page.
 *
 * @returns {void}
 */
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

/**
 * Stores the target column in a hidden form field, creating that field on
 * first use. This is how the dialog knows which column the plus button was
 * clicked in.
 *
 * @param {string} status - The column the new task belongs to.
 * @returns {void}
 */
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

/**
 * Wires up the subtask input of the dialog and appends the confirm/cancel
 * buttons, which the standalone Add-Task page brings along in its own markup.
 *
 * @returns {void}
 */
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

/**
 * Submit handler of the Add-Task dialog on the board. Collects the inputs,
 * saves the task under the next free id, closes the dialog and reloads the
 * board. A missing title or a failed write aborts with an alert.
 *
 * @param {Event} event - The submit event; its default action is prevented.
 * @returns {Promise<void>}
 */
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

/**
 * Reads the selected priority from the dialog buttons.
 *
 * @returns {string} The selected priority, 'medium' if none is marked.
 */
function getBoardDialogPriority() {
    const urgent = document.getElementById('btnUrgent');
    const medium = document.getElementById('btnMedium');
    const low = document.getElementById('btnLow');
    if (urgent?.classList.contains('selected')) return 'urgent';
    if (low?.classList.contains('selected')) return 'low';
    if (medium?.classList.contains('selected')) return 'medium';
    return 'medium';
}

/**
 * Shows a short message in the centre of the board. A running message is
 * replaced rather than queued.
 *
 * @param {string} message - The text to display.
 * @param {number} [duration=2000] - How long the message stays visible, in milliseconds.
 * @returns {void}
 */
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

/**
 * Closes the Add-Task dialog and empties it. When called from the backdrop,
 * a click that started inside the dialog is ignored.
 *
 * @param {Event} [event] - The click event, if the call comes from the backdrop.
 * @returns {void}
 */
function closeAddTaskDialog(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('add-task-modal').classList.add('hidden');
    document.getElementById('modal-body').innerHTML = '';
    removeModalOpenFlag();
}

/**
 * Releases the page scroll after the last modal has closed.
 *
 * @returns {void}
 */
function removeModalOpenFlag() {
    document.body.classList.remove('modal-open');
}

/**
 * Prepares everything the card template needs: badge, description, priority
 * icon, avatars and subtask progress.
 *
 * @param {Object} task - The task to render.
 * @returns {Object} The render data for getTaskTemplate.
 */
function buildTaskTemplateData(task) {
    return {
        id: task.id,
        title: task.title || '',
        category: getCategoryBadge(task.category),
        description: task.description ? getTaskDescriptionTemplate(task.description) : '',
        priority: task.priority ? getPriorityIcon(task.priority) : '',
        avatarsHTML: getAvatarsHTML(task.assignedTo),
        subtaskHTML: getTaskSubtaskHtml(task.subtasks)
    };
}

/**
 * Builds the subtask progress bar of a card.
 *
 * @param {Object} subtasks - The subtasks of the task, keyed by id.
 * @returns {string} The progress bar as HTML, or '' if the task has no subtasks.
 */
function getTaskSubtaskHtml(subtasks) {
    const total = subtasks ? Object.keys(subtasks).length : 0;
    if (total === 0) return '';
    const done = Object.values(subtasks).filter(subtask => subtask.done).length;
    return getTaskSubtaskProgressTemplate({ done, total, percent: Math.round((done / total) * 100) });
}

/**
 * Opens the detail modal of a task. Does nothing if the id is unknown.
 *
 * @param {string} id - Database key of the task.
 * @returns {void}
 */
function openTaskDetail(id) {
    const task = todos.find(todo => todo.id === id);
    if (!task) return;
    document.getElementById('task-detail-body').innerHTML = getTaskDetailTemplate({
        id: task.id,
        title: task.title || '',
        category: getCategoryBadge(task.category, true),
        priority: getPriorityDetail(task.priority),
        description: task.description ? getTaskDescriptionTemplate(task.description, 'task-detail-description') : '',
        dueDate: getTaskDueDateTemplate(task.dueDate ? task.dueDate : ''),
        assignedContactsHTML: renderAssignedContacts(task.assignedTo),
        subtasksHTML: renderSubtasks(task.id, task.subtasks)
    });
    document.getElementById('task-detail-modal').classList.remove('hidden');
    document.body.classList.add('modal-open');
}

/**
 * Builds the list of assigned contacts for the detail modal.
 *
 * @param {Array<string>} ids - The assigned contact ids.
 * @returns {string} The contact rows as HTML, or a placeholder if nobody is assigned.
 */
function renderAssignedContacts(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return getEmptyAssignedContactsTemplate();
    return ids.map(item => {
        const contact = getBoardContact(item);
        return getAssignedContactTemplate(getContactInitial(contact.initials, contact.color), contact.name);
    }).join('');
}

/**
 * Builds the subtask checklist for the detail modal.
 *
 * @param {string} taskId - Database key of the task.
 * @param {Object} subtasks - The subtasks of the task, keyed by id.
 * @returns {string} The checklist as HTML, or a placeholder if there are no subtasks.
 */
function renderSubtasks(taskId, subtasks) {
    if (!subtasks || typeof subtasks !== 'object' || Object.keys(subtasks).length === 0) return getEmptySubtasksTemplate();
    return Object.entries(subtasks).map(([subtaskId, subtask]) =>
        getTaskSubtaskItemTemplate(taskId, subtaskId, subtask.done, subtask.title)
    ).join('');
}

/**
 * Builds the small priority icon shown on a card.
 *
 * @param {string} priority - The priority of the task.
 * @returns {string} The icon as HTML, or '' if no priority is set.
 */
function getPriorityIcon(priority) {
    if (!priority) return '';
    const normalized = String(priority).toLowerCase();
    const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    return getPriorityIconTemplate(label, normalized);
}

/**
 * Builds the priority row with label and icon for the detail modal.
 *
 * @param {string} priority - The priority of the task.
 * @returns {string} The row as HTML, or a placeholder if no priority is set.
 */
function getPriorityDetail(priority) {
    if (!priority) return getEmptyPriorityTemplate();
    const normalized = String(priority).toLowerCase();
    const labels = { urgent: 'Urgent', medium: 'Medium', low: 'Low' };
    const label = labels[normalized] || normalized.charAt(0).toUpperCase() + normalized.slice(1);
    return getPriorityDetailTemplate(label, getPriorityIcon(priority));
}

/**
 * Builds the avatar row of a card. At most three avatars are shown.
 *
 * @param {Array<string>} ids - The assigned contact ids.
 * @returns {string} The avatars as HTML, or '' if nobody is assigned.
 */
function getAvatarsHTML(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return '';
    return ids.slice(0, 3).map(item => {
        const contact = getBoardContact(item);
        return getContactInitial(contact.initials, contact.color);
    }).join('');
}

/**
 * Resolves an entry of assignedTo into name, initials and avatar colour.
 * Handles both the contact ids written by the board and the contact objects
 * written by the standalone Add-Task page.
 *
 * @param {string|Object} item - A contact id, or a contact object.
 * @returns {{name: string, initials: string, color: string}} The data needed to draw the avatar.
 */
function getBoardContact(item) {
    const name = typeof item === 'string'
        ? (allContacts[item]?.name || item)
        : (item && typeof item === 'object' ? item.name || item.Name || item.Initials || JSON.stringify(item) : String(item));
    return { name, initials: getInitials(name), color: getAvatarColor(name) };
}

/**
 * Builds the category badge of a task, in the card or the detail variant.
 *
 * @param {string} category - The category, 'User Story' or 'Technical Task'.
 * @param {boolean} [isDetail=false] - true for the larger badge of the detail modal.
 * @returns {string} The badge as HTML, or '' if no category is set.
 */
function getCategoryBadge(category, isDetail = false) {
    if (!category) return '';
    const badgeClass = isDetail ? 'detail-category-badge' : 'task-badge';
    const extraClass = category === 'User Story' ? 'cat-user-story' : (category === 'Technical Task' ? 'cat-technical-task' : '');
    return getCategoryBadgeTemplate(badgeClass, extraClass, category);
}
