/**
 * Builds the edit form of a task, prefilled with its current values.
 *
 * @param {Object} data - The render data of the form, holding id, title, due date, description, priority plus the contact dropdown and avatar row as ready made HTML.
 * @returns {string} The complete edit form as HTML.
 */
function getTaskEditTemplate(data) {
    return `
        <div class="task-detail-card">
            ${getTaskEditHeaderTemplate()}
            <form id="task-edit-form" class="task-edit-form" onsubmit="saveTaskEdits(event)">
                ${getTaskEditTextInputTemplate('Title', 'editTaskTitle', data.title, 'text', true)}
                ${getTaskEditTextareaTemplate('Description', 'editTaskDescription', data.description)}
                ${getTaskEditDateInputTemplate(data.dueDate)}
                ${getTaskEditPriorityTemplate(data.priority)}
                ${getTaskEditAssignedTemplate(data)}
                ${getTaskEditSubtasksTemplate()}
                ${getTaskEditFooterTemplate()}
            </form>
        </div>`;
}

/**
 * Builds the header of the edit modal, which only holds the close button.
 *
 * @returns {string} The header as HTML.
 */
function getTaskEditHeaderTemplate() {
    return `
        <div class="task-detail-top">
            <div></div>
            <button class="modal-close task-detail-close" onclick="closeTaskDetail()">&times;</button>
        </div>`;
}

/**
 * Builds a labelled input row of the edit form.
 *
 * @param {string} label - The label text.
 * @param {string} id - Id of the input element.
 * @param {string} value - The prefilled value.
 * @param {string} type - The HTML input type, e.g. 'text'.
 * @param {boolean} [required=false] - Whether the field is mandatory.
 * @returns {string} The row as HTML.
 */
function getTaskEditTextInputTemplate(label, id, value, type, required = false) {
    return `
        <div class="form-row">
            <label for="${id}" class="edit-form-label">${label}</label>
            <input id="${id}" class="input task-edit-input" type="${type}" value="${value}" ${required ? 'required' : ''}>
        </div>`;
}

/**
 * Builds a labelled textarea row of the edit form.
 *
 * @param {string} label - The label text.
 * @param {string} id - Id of the textarea element.
 * @param {string} value - The prefilled value.
 * @returns {string} The row as HTML.
 */
function getTaskEditTextareaTemplate(label, id, value) {
    return `
        <div class="form-row">
            <label for="${id}" class="edit-form-label">${label}</label>
            <textarea id="${id}" class="input task-edit-textarea">${value}</textarea>
        </div>`;
}

/**
 * Builds the due date row of the edit form.
 *
 * @param {string} value - The prefilled date in ISO format (YYYY-MM-DD).
 * @returns {string} The row as HTML.
 */
function getTaskEditDateInputTemplate(value) {
    return `
        <div class="form-row">
            <label for="editTaskDeadline" class="edit-form-label">Due date</label>
            <div class="edit-date-wrapper">
                <input id="editTaskDeadline" class="input task-edit-input" type="date" value="${value}">
            </div>
        </div>`;
}

/**
 * Builds the priority row of the edit form: the three buttons plus the
 * hidden field that holds the current value.
 *
 * @param {string} priority - The currently selected priority.
 * @returns {string} The row as HTML.
 */
function getTaskEditPriorityTemplate(priority) {
    return `
        <div class="form-row">
            <label class="edit-priority-label">Priority</label>
            <div class="priority-buttons edit-priority-buttons">${getTaskEditPriorityButtonsTemplate()}</div>
            <input type="hidden" id="editTaskPriority" value="${priority}">
        </div>`;
}

/**
 * Builds all three priority buttons of the edit form.
 *
 * @returns {string} The buttons as HTML.
 */
function getTaskEditPriorityButtonsTemplate() {
    return getTaskEditPriorityButton('Urgent', 'urgent', 'editBtnUrgent', 'assets/icons/arrow up.svg', 'assets/icons/arrow up_choosed.svg') +
        getTaskEditPriorityButton('Medium', 'medium', 'editBtnMedium', 'assets/icons/=.svg', 'assets/icons/=_choosed.svg') +
        getTaskEditPriorityButton('Low', 'low', 'editBtnLow', 'assets/icons/arrow down.svg', 'assets/icons/arrow down_choosed.svg');
}

/**
 * Builds a single priority button. Both icon variants are kept in data
 * attributes, so the button can swap them when it becomes selected.
 *
 * @param {string} label - The button text, e.g. 'Urgent'.
 * @param {string} value - The priority this button stands for.
 * @param {string} id - Id of the button element.
 * @param {string} icon - Path of the normal icon.
 * @param {string} selectedIcon - Path of the icon shown while selected.
 * @returns {string} The button as HTML.
 */
function getTaskEditPriorityButton(label, value, id, icon, selectedIcon) {
    return `
        <button type="button" class="btn btn-secondary btn-task btn-priority-${value}" id="${id}" onclick="setEditPriority('${value}')">
            <span>${label}</span>
            <img src="${icon}" data-icon="${icon}" data-icon-selected="${selectedIcon}" alt="${value}">
        </button>`;
}

/**
 * Builds the contact dropdown and the avatar row of the edit form.
 *
 * @param {Object} data - The render data of the form.
 * @returns {string} The row as HTML.
 */
function getTaskEditAssignedTemplate(data) {
    return `
        <div class="form-row">
            <label class="edit-form-label">Assigned to</label>
            <div class="edit-contact-dropdown" onclick="noEvent(event)">
                <div class="edit-contact-input-row" onclick="toggleEditContactDropdown(event)">
                    <span class="edit-contact-placeholder">Select contacts to assign</span>
                    <span class="edit-dropdown-arrow" id="editContactArrow">▼</span>
                </div>
                <ul class="edit-contact-list d-none" id="editContactList">${data.contactListHTML}</ul>
            </div>
            <div id="editAssignedAvatars" class="edit-assigned-avatars">${data.assignedAvatarsHTML}</div>
        </div>`;
}

/**
 * Builds the subtask row of the edit form: input, add button and the empty
 * list that renderEditSubtasks fills.
 *
 * @returns {string} The row as HTML.
 */
function getTaskEditSubtasksTemplate() {
    return `
        <div class="form-row">
            <label class="edit-form-label">Subtasks</label>
            <div class="edit-subtask-entry">
                <input id="editSubtaskInput" class="input task-edit-input" type="text" placeholder="Add new subtask">
                <button type="button" class="edit-subtask-add-btn" onclick="addEditSubtask()">+</button>
            </div>
            <ul id="editSubtaskList" class="edit-subtask-list-ul"></ul>
        </div>`;
}

/**
 * Builds the footer of the edit form with its submit button.
 *
 * @returns {string} The footer as HTML.
 */
function getTaskEditFooterTemplate() {
    return `
        <div class="edit-form-footer">
            <button type="submit" class="btn-ok-edit">Ok <img src="assets/icons/check.svg" alt="ok"></button>
        </div>`;
}

/**
 * Builds one row of the contact dropdown in the edit form.
 *
 * @param {Object} contact - The contact to render, with Name, Initials and Color.
 * @param {number} index - Position of the contact in the contact pool.
 * @param {boolean} isSelected - Whether the contact is currently assigned.
 * @returns {string} The row as HTML.
 */
function getEditContactListItemTemplate(contact, index, isSelected) {
    return `
        <li class="edit-contact-li ${isSelected ? 'selected' : ''}" onclick="toggleEditContact(${index}, this)">
            <span class="avatar avatar-sm" style="background-color: ${contact.Color}">${contact.Initials}</span>
            <span class="edit-contact-name">${contact.Name}</span>
            <input type="checkbox" class="contact-checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation()">
        </li>`;
}

/**
 * Builds a single avatar of the assigned contacts in the edit form. The full
 * name is shown as a tooltip.
 *
 * @param {Object} contact - The contact to render, with Name, Initials and Color.
 * @returns {string} The avatar as HTML.
 */
function getEditAssignedAvatarTemplate(contact) {
    return `<span class="avatar avatar-sm edit-assigned-avatar" style="background-color: ${contact.Color}" title="${contact.Name}">${contact.Initials}</span>`;
}

/**
 * Builds one subtask row of the edit form, with edit and delete icons.
 *
 * @param {{id: string, title: string, done: boolean}} subtask - The subtask to render.
 * @returns {string} The row as HTML.
 */
function getEditSubtaskItemTemplate(subtask) {
    return `
        <li class="edit-subtask-li" data-subtask-id="${subtask.id}">
            <span class="edit-subtask-title">${subtask.title}</span>
            <span class="edit-subtask-actions">
                <img class="subtask-icon pointer" src="assets/icons/edit.svg" alt="edit" onclick="editTaskSubtask('${subtask.id}')">
                <span class="subtask-divider">|</span>
                <img class="subtask-icon pointer" src="assets/icons/delete.svg" alt="delete" onclick="deleteTaskSubtask('${subtask.id}')">
            </span>
        </li>`;
}