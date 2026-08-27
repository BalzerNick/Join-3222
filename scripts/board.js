let todos = [];
let allContacts = {};
let searchTerm = "";
let editingTaskId = null;
let taskEditSubtasks = [];
let taskEditSelectedContacts = [];
let taskEditContactPool = [];
let currentDraggedElement = null;

/**
 * Entry point of the board page. Loads the contacts and the tasks and
 * renders the columns.
 *
 * @returns {Promise<void>}
 */
async function initBoard() {
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
    initAddTaskForm();
    resetBoardAddTaskState();
    injectBoardTaskStatus(status);
    const form = document.getElementById('addTaskForm');
    if (form) form.onsubmit = submitBoardTaskData;
    setupBoardSubtaskControls();
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
}

/**
 * opens the Add-Task dialog on the board, or navigates to the standalone
 * 
 * @param {string} status - The column the new task belongs to.
 * @returns {void}
 */
function openAddTask(status = 'todo') {
    if (window.innerWidth <= 768) {
        window.location.href = `addTask.html?status=${status}`;
        return;
    }

    openAddTaskDialog(status);
}

/**
 * Saves a new board task under the next available task id.
 *
 * @param {Object} task - The task data to save.
 * @returns {Promise<void>}
 */
async function saveBoardTask(task) {
    const nextID = await getNextBoardTaskId();
    await postTask(`tasks/${nextID}`, task);
}

/**
 * Collects the task data from the Add-Task dialog. Only called once
 * checkForm(ADD_TASK_FIELDS) has confirmed the required fields are filled in.
 *
 * @returns {Object} The task data.
 */
function getBoardTaskFormData() {
    return {
        title: document.getElementById('taskName').value.trim(),
        description: document.getElementById('taskDescription')?.value.trim() || '',
        dueDate: document.getElementById('taskDeadline').value,
        priority: getBoardDialogPriority(),
        category: document.getElementById('category').value,
        status: document.getElementById('taskStatus')?.value || 'todo',
        assignedTo: typeof selectedContacts !== 'undefined' ? selectedContacts : [],
        subtasks: typeof subtasks !== 'undefined' ? subtasks : {}
    };
}

/**
 * Submit handler of the Add-Task dialog on the board. Validates the same
 * required fields as the standalone Add-Task page, saves the task under the
 * next free id, closes the dialog and reloads the board.
 *
 * @param {Event} event - The submit event; its default action is prevented.
 * @returns {Promise<void>}
 */
async function submitBoardTaskData(event) {
    event.preventDefault();
    if (!checkForm(ADD_TASK_FIELDS)) return;
    const task = getBoardTaskFormData();
    await saveBoardTask(task);
    resetBoardTaskForm();
    closeAddTaskDialog();
    await loadTasks();
    showBoardToast('Task added to Board', 2000, 'assets/icons/navbar/board_img.svg');
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
 * Toggles the visibility of the move menu for a task.
 *
 * @param {string} taskId - The ID of the task.
 * 
 */
function toggleMoveMenu(taskId) {
    const menu = document.getElementById(`move-menu-${taskId}`);

    document.querySelectorAll('.move-menu').forEach(otherMenu => {
        if (otherMenu !== menu) {
            otherMenu.classList.remove('active');
        }
    });

    menu.classList.toggle('active');
}

/**
 * Moves a task to a different category when the user selects an option from the move menu.
 * 
 * @param {string} taskId - The ID of the task.
 * @param {string} category - The category to move the task to.
 */
async function moveMobileTask(taskId, category) {
    currentDraggedElement = taskId;

    await moveTo(category);
}


document.addEventListener('DOMContentLoaded', initBoard);
