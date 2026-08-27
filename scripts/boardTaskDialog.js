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
 * Shows a short message in the centre of the board, optionally followed by an
 * icon. A running message is replaced rather than queued.
 *
 * @param {string} message - The text to display.
 * @param {number} [duration=2000] - How long the message stays visible, in milliseconds.
 * @param {string} [icon] - Path of an icon to show after the text.
 * @returns {void}
 */
function showBoardToast(message, duration = 2000, icon) {
    const toast = document.getElementById('center-toast');
    if (!toast) return;
    toast.textContent = message;
    if (icon) {
        const iconImg = document.createElement('img');
        iconImg.src = icon;
        iconImg.alt = '';
        iconImg.className = 'toast-icon';
        toast.appendChild(iconImg);
    }
    toast.classList.add('center-toast-visible');
    if (toast._timeout) clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('center-toast-visible');
        toast._timeout = null;
    }, duration);
}

/**
 * Resets the Add-Task form if the reset function is available.
 *
 * @returns {void}
 */
function resetBoardTaskForm() {
    if (typeof resetTask !== 'function') return;

    try {
        resetTask();
    } catch (resetError) {
        console.warn('Board resetTask failed', resetError);
    }
}