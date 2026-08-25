
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