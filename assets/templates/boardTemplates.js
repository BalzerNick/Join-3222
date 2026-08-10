/**
 * Builds the board task card template.
 * @param {Object} data
 * @returns {string}
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
 * Builds the task detail modal template.
 * @param {Object} data
 * @returns {string}
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
 * Builds the task edit modal template.
 * @param {Object} data
 * @returns {string}
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


function getTaskCardTopTemplate(category) {
    return `
        <div class="task-topline">
            <div class="task-topline-left">${category}</div>
        </div>`;
}


function getTaskFooterTemplate(data) {
    return `
        <div class="task-footer">
            <div class="footer-left"><div class="avatars">${data.avatarsHTML}</div></div>
            <div class="footer-right">${data.priority}</div>
        </div>`;
}


function getTaskDetailHeaderTemplate(category) {
    return `
        <div class="task-detail-top">
            <div>${category}</div>
            <button class="modal-close task-detail-close" onclick="closeTaskDetail()">&times;</button>
        </div>`;
}


function getTaskDetailMetaTemplate(data) {
    return `
        <div class="detail-grid">
            <div class="detail-block"><span class="detail-label">Due date:</span>${data.dueDate}</div>
            <div class="detail-block"><span class="detail-label">Priority:</span>${data.priority}</div>
        </div>`;
}


function getTaskDetailAssignedTemplate(assignedContactsHTML) {
    return `
        <div class="detail-section">
            <h3>Assigned To:</h3>
            <div class="assigned-list">${assignedContactsHTML}</div>
        </div>`;
}


function getTaskDetailSubtasksTemplate(subtasksHTML) {
    return `
        <div class="detail-section">
            <h3>Subtasks</h3>
            <ul class="subtask-list">${subtasksHTML}</ul>
        </div>`;
}


function getTaskDetailActionsTemplate(taskId) {
    return `
        <div class="detail-actions">
            <button class="btn-detail btn-delete" onclick="deleteTask('${taskId}')"><img src="assets/icons/delete.svg" alt="delete">Delete</button>
            <button class="btn-detail btn-edit" onclick="enterEditMode('${taskId}')"><img src="assets/icons/edit.svg" alt="edit">Edit</button>
        </div>`;
}


function getTaskEditHeaderTemplate() {
    return `
        <div class="task-detail-top">
            <div></div>
            <button class="modal-close task-detail-close" onclick="closeTaskDetail()">&times;</button>
        </div>`;
}


function getTaskEditTextInputTemplate(label, id, value, type, required = false) {
    return `
        <div class="form-row">
            <label for="${id}">${label}</label>
            <input id="${id}" class="input task-edit-input" type="${type}" value="${value}" ${required ? 'required' : ''}>
        </div>`;
}


function getTaskEditTextareaTemplate(label, id, value) {
    return `
        <div class="form-row">
            <label for="${id}">${label}</label>
            <textarea id="${id}" class="input task-edit-textarea">${value}</textarea>
        </div>`;
}


function getTaskEditDateInputTemplate(value) {
    return `
        <div class="form-row">
            <label for="editTaskDeadline">Due date</label>
            <div class="edit-date-wrapper">
                <input id="editTaskDeadline" class="input task-edit-input" type="date" value="${value}">
            </div>
        </div>`;
}


function getTaskEditPriorityTemplate(priority) {
    return `
        <div class="form-row">
            <label>Priority</label>
            <div class="priority-buttons edit-priority-buttons">${getTaskEditPriorityButtonsTemplate()}</div>
            <input type="hidden" id="editTaskPriority" value="${priority}">
        </div>`;
}


function getTaskEditPriorityButtonsTemplate() {
    return getTaskEditPriorityButton('Urgent', 'urgent', 'editBtnUrgent', 'assets/icons/arrow up.svg', 'assets/icons/arrow up_choosed.svg') +
        getTaskEditPriorityButton('Medium', 'medium', 'editBtnMedium', 'assets/icons/=.svg', 'assets/icons/=_choosed.svg') +
        getTaskEditPriorityButton('Low', 'low', 'editBtnLow', 'assets/icons/arrow down.svg', 'assets/icons/arrow down_choosed.svg');
}


function getTaskEditPriorityButton(label, value, id, icon, selectedIcon) {
    return `
        <button type="button" class="btn btn-secondary btn-task btn-priority-${value}" id="${id}" onclick="setEditPriority('${value}')">
            <span>${label}</span>
            <img src="${icon}" data-icon="${icon}" data-icon-selected="${selectedIcon}" alt="${value}">
        </button>`;
}


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


function getTaskEditFooterTemplate() {
    return `
        <div class="edit-form-footer">
            <button type="submit" class="btn-ok-edit">Ok <img src="assets/icons/check.svg" alt="ok"></button>
        </div>`;
}


function getBoardEmptyColumnTemplate(columnName) {
    return `<div class="empty-state">No tasks ${columnName}</div>`;
}


function getBoardSubtaskButtonsTemplate() {
    return `
        <img class="input-img subtask-icon pointer" src="assets/icons/close.svg" alt="x" onclick="clearSubtask()">
        <span>|</span>
        <img class="input-img subtask-icon pointer" src="assets/icons/check_black.svg" alt="Add subtask" onclick="safeSubtask()">`;
}


function getTaskDescriptionTemplate(description, className = 'task-description') {
    return `<p class="${className}">${description}</p>`;
}


function getTaskDueDateTemplate(dueDate) {
    return dueDate ? `<span class="detail-value">${dueDate}</span>` : "<span class='detail-empty'>No due date</span>";
}


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


function getEmptyAssignedContactsTemplate() {
    return "<p class='detail-empty'>No assigned contacts</p>";
}


function getAssignedContactTemplate(contactInitialHtml, contactName) {
    return `
        <div class="assigned-person">
            ${contactInitialHtml}
            <div class="assigned-info"><span class="assigned-name">${contactName}</span></div>
        </div>`;
}


function getEmptySubtasksTemplate() {
    return "<p class='detail-empty'>No subtasks</p>";
}


function getTaskSubtaskItemTemplate(taskId, subtaskId, isDone, title) {
    return `
        <li class="subtask-item">
            <label>
                <input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleSubtaskDone('${taskId}', '${subtaskId}', this.checked)">
                <span>${title}</span>
            </label>
        </li>`;
}


function getPriorityIconTemplate(label, altText) {
    return `<img class="priority-icon" src="assets/icons/Property%201=${label}.png" alt="${altText}">`;
}


function getPriorityDetailTemplate(label, iconHtml) {
    return `<span class="priority-detail-value"><span class="priority-detail-text">${label}</span>${iconHtml}</span>`;
}


function getEmptyPriorityTemplate() {
    return "<span class='detail-empty'>No priority</span>";
}


function getCategoryBadgeTemplate(badgeClass, extraClass, category) {
    return `<span class="${badgeClass} ${extraClass}">${category}</span>`;
}


function getEditContactListItemTemplate(contact, index, isSelected) {
    return `
        <li class="edit-contact-li ${isSelected ? 'selected' : ''}" onclick="toggleEditContact(${index}, this)">
            <span class="avatar avatar-sm" style="background-color: ${contact.Color}">${contact.Initials}</span>
            <span class="edit-contact-name">${contact.Name}</span>
            <input type="checkbox" class="contact-checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation()">
        </li>`;
}


function getEditAssignedAvatarTemplate(contact) {
    return `<span class="avatar avatar-sm edit-assigned-avatar" style="background-color: ${contact.Color}" title="${contact.Name}">${contact.Initials}</span>`;
}


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
