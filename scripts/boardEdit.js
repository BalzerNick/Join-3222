/**
 * Closes the detail modal, drops the edit state and releases the page scroll.
 * When called from the backdrop, a click that started inside the modal is
 * ignored.
 *
 * @param {Event} [event] - The click event, if the call comes from the backdrop.
 * @returns {void}
 */
function closeTaskDetail(event) {
    if (event && event.target !== event.currentTarget) return;
    cleanupEditDropdownHandler();
    document.getElementById('task-detail-modal').classList.add('hidden');
    document.getElementById('task-detail-body').innerHTML = '';
    editingTaskId = null;
    taskEditSubtasks = [];
    taskEditSelectedContacts = [];
    taskEditContactPool = [];
    removeModalOpenFlag();
}

/**
 * Switches the detail modal into edit mode. Builds working copies of the
 * subtasks and the assigned contacts, so that cancelling leaves the task
 * untouched. Does nothing if the id is unknown.
 *
 * @param {string} taskId - Database key of the task.
 * @returns {void}
 */
function enterEditMode(taskId) {
    const task = todos.find(todo => todo.id === taskId);
    if (!task) return;
    editingTaskId = taskId;
    taskEditSubtasks = mapTaskEditSubtasks(task.subtasks);
    taskEditContactPool = buildTaskEditContactPool();
    taskEditSelectedContacts = mapTaskEditContacts(task.assignedTo || []);
    document.getElementById('task-detail-body').innerHTML = getTaskEditTemplate({
        id: task.id,
        title: task.title || '',
        dueDate: task.dueDate || '',
        description: task.description || '',
        priority: task.priority ? String(task.priority).toLowerCase() : 'medium',
        contactListHTML: buildEditContactListHTML(),
        assignedAvatarsHTML: buildEditAssignedAvatarsHTML()
    });
    setupTaskEditForm();
}

/**
 * Wires up the edit form after its markup has been inserted: subtask input,
 * priority buttons, subtask list and the outside-click handler of the dropdown.
 *
 * @returns {void}
 */
function setupTaskEditForm() {
    bindEditSubtaskInput();
    updateEditPriorityButtons();
    renderEditSubtasks();
    registerEditDropdownHandler();
}

/**
 * Highlights the priority button that matches the hidden priority field and
 * swaps the icons of all three buttons accordingly.
 *
 * @returns {void}
 */
function updateEditPriorityButtons() {
    const current = (document.getElementById('editTaskPriority')?.value || 'medium').toLowerCase();
    Object.entries({ urgent: 'editBtnUrgent', medium: 'editBtnMedium', low: 'editBtnLow' }).forEach(([priority, buttonId]) => {
        const button = document.getElementById(buttonId);
        if (!button) return;
        const isSelected = priority === current;
        button.classList.toggle('selected', isSelected);
        const image = button.querySelector('img');
        if (image) image.src = isSelected ? image.dataset.iconSelected : image.dataset.icon;
    });
}

/**
 * Stores the picked priority in the hidden field and refreshes the buttons.
 *
 * @param {string} priority - The priority to select.
 * @returns {void}
 */
function setEditPriority(priority) {
    const input = document.getElementById('editTaskPriority');
    if (input) input.value = priority;
    updateEditPriorityButtons();
}

/**
 * Submit handler of the edit form. Applies the changes to the board right
 * away and then saves them. If the write fails, the previous state of the
 * task is restored and an alert is shown.
 *
 * @param {Event} event - The submit event; its default action is prevented.
 * @returns {Promise<void>}
 */
async function saveTaskEdits(event) {
    event.preventDefault();
    const task = todos.find(todo => todo.id === editingTaskId);
    if (!task) return;
    const previousTask = { ...task, subtasks: JSON.parse(JSON.stringify(task.subtasks || {})) };
    const updates = {
        title: document.getElementById('editTaskTitle')?.value.trim() || task.title,
        description: document.getElementById('editTaskDescription')?.value.trim() || '',
        dueDate: document.getElementById('editTaskDeadline')?.value || '',
        priority: document.getElementById('editTaskPriority')?.value || task.priority,
        assignedTo: [...taskEditSelectedContacts],
        subtasks: buildTaskEditSubtaskMap()
    };
    Object.assign(task, updates);
    editingTaskId = null;
    taskEditSubtasks = [];
    closeTaskDetail();
    updateHTML();
    try {
        await updateTaskData(task.id, updates);
    } catch (error) {
        console.error('Failed to save task edits', error);
        const originalIndex = todos.findIndex(item => item.id === task.id);
        if (originalIndex !== -1) todos[originalIndex] = previousTask;
        updateHTML();
        alert('Speichern fehlgeschlagen. Bitte versuche es erneut.');
    }
}

/**
 * Deletes a task. The card disappears from the board immediately; if the
 * delete fails, the previous board state is restored and an alert is shown.
 *
 * @param {string} taskId - Database key of the task.
 * @returns {Promise<void>}
 */
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

let editDropdownCloseHandler = null;

/**
 * Builds the pool of contacts available for assignment from the contacts
 * cached by the board.
 *
 * @returns {Array<Object>} All contacts with name, initials and avatar colour.
 */
function buildTaskEditContactPool() {
    return Object.values(allContacts).map(contact => {
        const name = contact.name || contact.Name || '';
        return { Name: name, Initials: getInitials(name), Color: getAvatarColor(name) };
    });
}

/**
 * Builds the contact dropdown of the edit form, ticking everyone who is
 * already assigned.
 *
 * @returns {string} The list entries as HTML.
 */
function buildEditContactListHTML() {
    return taskEditContactPool.map((contact, index) => getEditContactListItemTemplate({
        ...contact,
        Initials: contact.Initials,
        Name: contact.Name
    }, index, taskEditSelectedContacts.some(item => item.Name === contact.Name))).join('');
}

/**
 * Builds the avatar row of the assigned contacts below the dropdown.
 *
 * @returns {string} The avatars as HTML.
 */
function buildEditAssignedAvatarsHTML() {
    return taskEditSelectedContacts.map(contact => getEditAssignedAvatarTemplate({
        ...contact,
        Name: contact.Name,
        Initials: contact.Initials
    })).join('');
}

/**
 * Adds a contact to the selection or removes it again, and updates the row,
 * its checkbox and the avatar row accordingly.
 *
 * @param {number} index - Position of the contact in the contact pool.
 * @param {HTMLElement} listItem - The clicked list row.
 * @returns {void}
 */
function toggleEditContact(index, listItem) {
    const contact = taskEditContactPool[index];
    if (!contact) return;
    const selectedIndex = taskEditSelectedContacts.findIndex(item => item.Name === contact.Name);
    const isSelected = selectedIndex < 0;
    if (isSelected) taskEditSelectedContacts.push(contact);
    else taskEditSelectedContacts.splice(selectedIndex, 1);
    listItem.classList.toggle('selected', isSelected);
    const checkbox = listItem.querySelector('.contact-checkbox');
    if (checkbox) checkbox.checked = isSelected;
    const container = document.getElementById('editAssignedAvatars');
    if (container) container.innerHTML = buildEditAssignedAvatarsHTML();
}

/**
 * Opens or closes the contact dropdown of the edit form. Stops the event so
 * the outside-click handler does not close it again straight away.
 *
 * @param {Event} event - The click event on the dropdown field.
 * @returns {void}
 */
function toggleEditContactDropdown(event) {
    event.stopPropagation();
    const list = document.getElementById('editContactList');
    if (!list) return;
    setEditContactDropdownState(list.classList.contains('d-none'));
}

/**
 * Registers the handler that closes the contact dropdown on a click anywhere
 * outside of it. Any previously registered handler is removed first.
 *
 * @returns {void}
 */
function registerEditDropdownHandler() {
    cleanupEditDropdownHandler();
    editDropdownCloseHandler = event => {
        const dropdown = document.querySelector('.edit-contact-dropdown');
        if (dropdown && dropdown.contains(event.target)) return;
        setEditContactDropdownState(false);
    };
    document.onclick = editDropdownCloseHandler;
}

/**
 * Removes the outside-click handler of the contact dropdown, so it does not
 * outlive the closed modal.
 *
 * @returns {void}
 */
function cleanupEditDropdownHandler() {
    if (!editDropdownCloseHandler) return;
    if (document.onclick === editDropdownCloseHandler) document.onclick = null;
    editDropdownCloseHandler = null;
}

/**
 * Shows or hides the contact dropdown and flips its arrow.
 *
 * @param {boolean} shouldOpen - true opens the dropdown, false closes it.
 * @returns {void}
 */
function setEditContactDropdownState(shouldOpen) {
    const list = document.getElementById('editContactList');
    if (!list) return;
    list.classList.toggle('d-none', !shouldOpen);
    const arrow = document.getElementById('editContactArrow');
    if (arrow) arrow.textContent = shouldOpen ? '▲' : '▼';
}

/**
 * Turns the stored subtask object into the array the edit form works on.
 *
 * @param {Object} subtasks - The subtasks of the task, keyed by id.
 * @returns {Array<{id: string, title: string, done: boolean}>} The subtasks as an array, empty if there are none.
 */
function mapTaskEditSubtasks(subtasks) {
    return Object.entries(subtasks || {}).map(([id, subtask]) => ({ id, title: subtask.title, done: !!subtask.done }));
}

/**
 * Makes the Enter key in the subtask input add a subtask instead of
 * submitting the whole form.
 *
 * @returns {void}
 */
function bindEditSubtaskInput() {
    const input = document.getElementById('editSubtaskInput');
    if (!input) return;
    input.onkeydown = event => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        addEditSubtask();
    };
}

/**
 * Redraws the subtask list of the edit form from the working copy.
 *
 * @returns {void}
 */
function renderEditSubtasks() {
    const list = document.getElementById('editSubtaskList');
    if (!list) return;
    list.innerHTML = taskEditSubtasks
    .map(subtask => getEditSubtaskItemTemplate({ ...subtask, title: subtask.title }))
        .join('');
}

/**
 * Adds the text of the subtask input to the working copy and clears the
 * input. An empty input is ignored.
 *
 * @returns {void}
 */
function addEditSubtask() {
    const input = document.getElementById('editSubtaskInput');
    if (!input) return;
    const value = input.value.trim();
    if (!value) return;
    taskEditSubtasks.push({ id: `subtask-${Date.now()}`, title: value, done: false });
    input.value = '';
    renderEditSubtasks();
}

/**
 * Removes a subtask from the working copy. The change reaches the database
 * only when the form is saved.
 *
 * @param {string} subtaskId - Key of the subtask.
 * @returns {void}
 */
function deleteTaskSubtask(subtaskId) {
    taskEditSubtasks = taskEditSubtasks.filter(item => item.id !== subtaskId);
    renderEditSubtasks();
}

/**
 * Asks for a new title of a subtask via a browser prompt. Cancelling or
 * entering only whitespace keeps the old title.
 *
 * @param {string} subtaskId - Key of the subtask.
 * @returns {void}
 */
function editTaskSubtask(subtaskId) {
    const item = document.querySelector(`[data-subtask-id="${subtaskId}"]`);
    const title = item.querySelector('.edit-subtask-title');
    const button = item.querySelector('.edit-subtask-actions img');

    title.contentEditable = true;
    title.focus();

    button.src = 'assets/icons/check_black.svg';
    button.onclick = () => saveEditedSubtask(subtaskId);
}

/**
 * Saves the edited subtask title.
 *
 * @param {string} subtaskId - Key of the subtask.
 */
function saveEditedSubtask(subtaskId) {
    const item = document.querySelector(`[data-subtask-id="${subtaskId}"]`);
    const title = item.querySelector('.edit-subtask-title');
    const subtask = taskEditSubtasks.find(item => item.id === subtaskId);
    const button = item.querySelector('.edit-subtask-actions img');

    subtask.title = title.textContent.trim();
    title.contentEditable = false;

    button.src = 'assets/icons/edit.svg';
    button.onclick = () => editTaskSubtask(subtaskId);
}

/**
 * Turns the working copy back into the object shape the database expects.
 *
 * @returns {Object} The subtasks keyed by id.
 */
function buildTaskEditSubtaskMap() {
    return taskEditSubtasks.reduce((map, subtask) => {
        map[subtask.id] = { title: subtask.title, done: subtask.done };
        return map;
    }, {});
}

/**
 * Ticks or unticks a subtask in the detail view. The progress bar updates
 * immediately; if the write fails, the checkbox is reverted.
 *
 * @param {string} taskId - Database key of the task.
 * @param {string} subtaskId - Key of the subtask.
 * @param {boolean} done - The new state.
 * @returns {Promise<void>}
 */
async function toggleSubtaskDone(taskId, subtaskId, done) {
    const task = todos.find(item => item.id === taskId);
    if (!task || !task.subtasks || !task.subtasks[subtaskId]) return;
    task.subtasks[subtaskId].done = done;
    updateHTML();
    try {
        await updateSubtaskDone(taskId, subtaskId, done);
    } catch (error) {
        console.error('Failed to persist subtask state', error);
        task.subtasks[subtaskId].done = !done;
        updateHTML();
    }
}

/**
 * Resolves the assignedTo entries of a task against the contact pool.
 * Entries that are no longer in the pool are rebuilt from their name;
 * entries without a name are dropped.
 *
 * @param {Array<string|Object>} assignedTo - The assigned contacts, as ids or objects.
 * @returns {Array<Object>} The resolved contacts.
 */
function mapTaskEditContacts(assignedTo) {
    return assignedTo.map(item => {
        const name = typeof item === 'string' ? item : (item.Name || item.name || '');
        const match = taskEditContactPool.find(contact => contact.Name === name);
        return match || { Name: name, Initials: getInitials(name), Color: getAvatarColor(name) };
    }).filter(contact => contact.Name);
}
