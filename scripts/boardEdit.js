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

function enterEditMode(taskId) {
    const task = todos.find(todo => todo.id === taskId);
    if (!task) return;
    editingTaskId = taskId;
    taskEditSubtasks = mapTaskEditSubtasks(task.subtasks);
    taskEditContactPool = buildTaskEditContactPool();
    taskEditSelectedContacts = mapTaskEditContacts(task.assignedTo || []);
    document.getElementById('task-detail-body').innerHTML = getTaskEditTemplate({
        id: task.id,
        title: escapeHtml(task.title || ''),
        dueDate: task.dueDate ? escapeHtml(task.dueDate) : '',
        description: task.description ? escapeHtml(task.description) : '',
        priority: task.priority ? String(task.priority).toLowerCase() : 'medium',
        contactListHTML: buildEditContactListHTML(),
        assignedAvatarsHTML: buildEditAssignedAvatarsHTML()
    });
    setupTaskEditForm();
}

function setupTaskEditForm() {
    bindEditSubtaskInput();
    updateEditPriorityButtons();
    renderEditSubtasks();
    registerEditDropdownHandler();
}

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

function setEditPriority(priority) {
    const input = document.getElementById('editTaskPriority');
    if (input) input.value = priority;
    updateEditPriorityButtons();
}

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

function buildTaskEditContactPool() {
    return Object.values(allContacts).map(contact => {
        const name = contact.name || contact.Name || '';
        return { Name: name, Initials: getInitials(name), Color: getAvatarColor(name) };
    });
}

function buildEditContactListHTML() {
    return taskEditContactPool.map((contact, index) => getEditContactListItemTemplate({
        ...contact,
        Initials: escapeHtml(contact.Initials),
        Name: escapeHtml(contact.Name)
    }, index, taskEditSelectedContacts.some(item => item.Name === contact.Name))).join('');
}

function buildEditAssignedAvatarsHTML() {
    return taskEditSelectedContacts.map(contact => getEditAssignedAvatarTemplate({
        ...contact,
        Name: escapeHtml(contact.Name),
        Initials: escapeHtml(contact.Initials)
    })).join('');
}

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

function toggleEditContactDropdown(event) {
    event.stopPropagation();
    const list = document.getElementById('editContactList');
    if (!list) return;
    setEditContactDropdownState(list.classList.contains('d-none'));
}

function registerEditDropdownHandler() {
    cleanupEditDropdownHandler();
    editDropdownCloseHandler = event => {
        const dropdown = document.querySelector('.edit-contact-dropdown');
        if (dropdown && dropdown.contains(event.target)) return;
        setEditContactDropdownState(false);
    };
    document.onclick = editDropdownCloseHandler;
}

function cleanupEditDropdownHandler() {
    if (!editDropdownCloseHandler) return;
    if (document.onclick === editDropdownCloseHandler) document.onclick = null;
    editDropdownCloseHandler = null;
}

function setEditContactDropdownState(shouldOpen) {
    const list = document.getElementById('editContactList');
    if (!list) return;
    list.classList.toggle('d-none', !shouldOpen);
    const arrow = document.getElementById('editContactArrow');
    if (arrow) arrow.textContent = shouldOpen ? '▲' : '▼';
}

function mapTaskEditSubtasks(subtasks) {
    return Object.entries(subtasks || {}).map(([id, subtask]) => ({ id, title: subtask.title, done: !!subtask.done }));
}

function bindEditSubtaskInput() {
    const input = document.getElementById('editSubtaskInput');
    if (!input) return;
    input.onkeydown = event => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        addEditSubtask();
    };
}

function renderEditSubtasks() {
    const list = document.getElementById('editSubtaskList');
    if (!list) return;
    list.innerHTML = taskEditSubtasks
        .map(subtask => getEditSubtaskItemTemplate({ ...subtask, title: escapeHtml(subtask.title) }))
        .join('');
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

function buildTaskEditSubtaskMap() {
    return taskEditSubtasks.reduce((map, subtask) => {
        map[subtask.id] = { title: subtask.title, done: subtask.done };
        return map;
    }, {});
}

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

function mapTaskEditContacts(assignedTo) {
    return assignedTo.map(item => {
        const name = typeof item === 'string' ? item : (item.Name || item.name || '');
        const match = taskEditContactPool.find(contact => contact.Name === name);
        return match || { Name: name, Initials: getInitials(name), Color: getAvatarColor(name) };
    }).filter(contact => contact.Name);
}
