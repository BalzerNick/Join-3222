/**
 * Builds a draggable task card for the board.
 *
 * @param {Object} data - The render data of the card, holding id, title, category badge, description, priority icon, avatars and subtask progress as ready made HTML.
 * @returns {string} The complete task card as HTML.
 */
function getTaskTemplate(data) {
    return `
        <div draggable="true" ondragstart="startDragging('${data.id}')" onclick="openTaskDetail('${data.id}')" class="todo">
            ${getTaskCardTopTemplate(data.category)}
            <h3 class="task-title">${data.title}</h3>
            ${data.description}
            ${data.subtaskHTML}
            ${getTaskFooterTemplate(data)}
        </div>`;
}


/**
 * Builds the content of the task detail modal.
 *
 * @param {Object} data - The render data of the modal, holding id, title, category badge, priority row, description, due date, assigned contacts and subtask checklist as ready made HTML.
 * @returns {string} The complete modal content as HTML.
 */
function getTaskDetailTemplate(data) {
    return `
        <div class="task-detail-card">
            ${getTaskDetailHeaderTemplate(data.category)}
            <h2 class="detail-title">${data.title}</h2>
            ${data.description}
            ${getTaskDetailMetaTemplate(data)}
            ${getTaskDetailAssignedTemplate(data.assignedContactsHTML)}
            ${getTaskDetailSubtasksTemplate(data.subtasksHTML)}
            ${getTaskDetailActionsTemplate(data.id)}
        </div>`;
}


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
 * Builds the top line of a task card, which holds the category badge.
 *
 * @param {string} category - The category badge as HTML.
 * @returns {string} The top line as HTML.
 */
function getTaskCardTopTemplate(category) {
    return `
        <div class="task-topline">
            <div class="task-topline-left">${category}</div>
        </div>`;
}


/**
 * Builds the footer of a task card: avatars on the left, priority icon on
 * the right.
 *
 * @param {Object} data - The render data of the card.
 * @returns {string} The footer as HTML.
 */
function getTaskFooterTemplate(data) {
    return `
        <div class="task-footer">
            <div class="footer-left"><div class="avatars">${data.avatarsHTML}</div></div>
            <div class="footer-right">${data.priority}</div>
        </div>`;
}


/**
 * Builds the header of the detail modal, with the category badge and the
 * close button.
 *
 * @param {string} category - The category badge as HTML.
 * @returns {string} The header as HTML.
 */
function getTaskDetailHeaderTemplate(category) {
    return `
        <div class="task-detail-top">
            <div>${category}</div>
            <button class="modal-close task-detail-close" onclick="closeTaskDetail()">&times;</button>
        </div>`;
}


/**
 * Builds the due date and priority rows of the detail modal.
 *
 * @param {Object} data - The render data of the modal.
 * @returns {string} The rows as HTML.
 */
function getTaskDetailMetaTemplate(data) {
    return `
        <div class="detail-grid">
            <div class="detail-block"><span class="detail-label">Due date:</span>${data.dueDate}</div>
            <div class="detail-block"><span class="detail-label">Priority:</span>${data.priority}</div>
        </div>`;
}


/**
 * Builds the 'Assigned To' section of the detail modal.
 *
 * @param {string} assignedContactsHTML - The contact rows as HTML.
 * @returns {string} The section as HTML.
 */
function getTaskDetailAssignedTemplate(assignedContactsHTML) {
    return `
        <div class="detail-section">
            <h3>Assigned To:</h3>
            <div class="assigned-list">${assignedContactsHTML}</div>
        </div>`;
}


/**
 * Builds the 'Subtasks' section of the detail modal.
 *
 * @param {string} subtasksHTML - The checklist entries as HTML.
 * @returns {string} The section as HTML.
 */
function getTaskDetailSubtasksTemplate(subtasksHTML) {
    return `
        <div class="detail-section">
            <h3>Subtasks</h3>
            <ul class="subtask-list">${subtasksHTML}</ul>
        </div>`;
}


/**
 * Builds the delete and edit buttons of the detail modal.
 *
 * @param {string} taskId - Database key of the task.
 * @returns {string} The button row as HTML.
 */
function getTaskDetailActionsTemplate(taskId) {
    return `
        <div class="detail-actions">
            <button class="btn-detail btn-delete" onclick="deleteTask('${taskId}')"><img src="assets/icons/delete.svg" alt="delete">Delete</button>
            <button class="btn-detail btn-edit" onclick="enterEditMode('${taskId}')"><img src="assets/icons/edit.svg" alt="edit">Edit</button>
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
            <label for="${id}">${label}</label>
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
            <label for="${id}">${label}</label>
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
            <label for="editTaskDeadline">Due date</label>
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
            <label>Priority</label>
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
            <label>Assigned to</label>
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
            <label>Subtasks</label>
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
 * Builds the placeholder shown in a column without tasks.
 *
 * @param {string} columnName - Display name of the column, e.g. 'To Do'.
 * @returns {string} The placeholder as HTML.
 */
function getBoardEmptyColumnTemplate(columnName) {
    return `<div class="empty-state">No tasks ${columnName}</div>`;
}


/**
 * Builds the confirm and cancel icons next to the subtask input. The board
 * appends these to the Add-Task dialog at runtime.
 *
 * @returns {string} The icons as HTML.
 */
function getBoardSubtaskButtonsTemplate() {
    return `
        <img class="input-img subtask-icon pointer" src="assets/icons/close.svg" alt="x" onclick="clearSubtask()">
        <span>|</span>
        <img class="input-img subtask-icon pointer" src="assets/icons/check_black.svg" alt="Add subtask" onclick="safeSubtask()">`;
}


/**
 * Builds the description paragraph. The class decides whether it is clamped
 * to the card size or shown in full in the detail modal.
 *
 * @param {string} description - The description text.
 * @param {string} [className='task-description'] - CSS class of the paragraph.
 * @returns {string} The paragraph as HTML.
 */
function getTaskDescriptionTemplate(description, className = 'task-description') {
    return `<p class="${className}">${description}</p>`;
}


/**
 * Builds the due date of the detail modal, or a placeholder if none is set.
 *
 * @param {string} dueDate - The due date in ISO format (YYYY-MM-DD), or ''.
 * @returns {string} The date as HTML.
 */
function getTaskDueDateTemplate(dueDate) {
    return dueDate ? `<span class="detail-value">${dueDate}</span>` : "<span class='detail-empty'>No due date</span>";
}


/**
 * Builds the subtask progress bar of a card.
 *
 * @param {{done: number, total: number, percent: number}} progress - Completed and total count plus the resulting percentage.
 * @returns {string} The progress bar as HTML.
 */
function getTaskSubtaskProgressTemplate(progress) {
    return `
        <div class="subtask-row">
            <div class="subtask-wrap">
                <div class="subtask-progress" aria-hidden>
                    <div class="subtask-progress-fill" style="width: ${progress.percent}%;"></div>
                </div>
                <div class="subtask-count">${progress.done}/${progress.total} Subtasks</div>
            </div>
        </div>`;
}


/**
 * Builds the placeholder shown when a task has no assigned contacts.
 *
 * @returns {string} The placeholder as HTML.
 */
function getEmptyAssignedContactsTemplate() {
    return "<p class='detail-empty'>No assigned contacts</p>";
}


/**
 * Builds one row of the assigned contacts list, with avatar and name.
 *
 * @param {string} contactInitialHtml - The avatar as HTML.
 * @param {string} contactName - The name of the contact.
 * @returns {string} The row as HTML.
 */
function getAssignedContactTemplate(contactInitialHtml, contactName) {
    return `
        <div class="assigned-person">
            ${contactInitialHtml}
            <div class="assigned-info"><span class="assigned-name">${contactName}</span></div>
        </div>`;
}


/**
 * Builds the placeholder shown when a task has no subtasks.
 *
 * @returns {string} The placeholder as HTML.
 */
function getEmptySubtasksTemplate() {
    return "<p class='detail-empty'>No subtasks</p>";
}


/**
 * Builds one checklist entry of the detail modal. Ticking the checkbox saves
 * the new state right away.
 *
 * @param {string} taskId - Database key of the task.
 * @param {string} subtaskId - Key of the subtask.
 * @param {boolean} isDone - Whether the subtask is completed.
 * @param {string} title - The subtask title.
 * @returns {string} The entry as HTML.
 */
function getTaskSubtaskItemTemplate(taskId, subtaskId, isDone, title) {
    return `
        <li class="subtask-item">
            <label>
                <input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleSubtaskDone('${taskId}', '${subtaskId}', this.checked)">
                <span>${title}</span>
            </label>
        </li>`;
}


/**
 * Builds the priority icon. The label is part of the icon file name, so it
 * must match the capitalisation of the files in assets/icons.
 *
 * @param {string} label - Capitalised priority, e.g. 'Urgent'.
 * @param {string} altText - Alt text of the image.
 * @returns {string} The icon as HTML.
 */
function getPriorityIconTemplate(label, altText) {
    return `<img class="priority-icon" src="assets/icons/Property%201=${label}.png" alt="${altText}">`;
}


/**
 * Builds the priority of the detail modal as label plus icon.
 *
 * @param {string} label - Capitalised priority, e.g. 'Urgent'.
 * @param {string} iconHtml - The priority icon as HTML.
 * @returns {string} The priority as HTML.
 */
function getPriorityDetailTemplate(label, iconHtml) {
    return `<span class="priority-detail-value"><span class="priority-detail-text">${label}</span>${iconHtml}</span>`;
}


/**
 * Builds the placeholder shown when a task has no priority.
 *
 * @returns {string} The placeholder as HTML.
 */
function getEmptyPriorityTemplate() {
    return "<span class='detail-empty'>No priority</span>";
}


/**
 * Builds the category badge.
 *
 * @param {string} badgeClass - Base class, deciding between card and detail size.
 * @param {string} extraClass - Colour class of the category, or ''.
 * @param {string} category - The category text.
 * @returns {string} The badge as HTML.
 */
function getCategoryBadgeTemplate(badgeClass, extraClass, category) {
    return `<span class="${badgeClass} ${extraClass}">${category}</span>`;
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
            <div class="edit-subtask-actions">
                <img class="subtask-icon pointer" src="assets/icons/edit.svg" alt="edit" onclick="editTaskSubtask('${subtask.id}')">
                <span class="subtask-divider">|</span>
                <img class="subtask-icon pointer" src="assets/icons/delete.svg" alt="delete" onclick="deleteTaskSubtask('${subtask.id}')">
            </div>
        </li>`;
}
