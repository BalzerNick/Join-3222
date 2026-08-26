/**
 * Builds a draggable task card for the board.
 *
 * @param {Object} data - The render data of the card, holding id, title, category badge, description, priority icon, avatars and subtask progress as ready made HTML.
 * @returns {string} The complete task card as HTML.
 */
function getTaskTemplate(data) {
    return `
        <div draggable="true" ondragstart="startDragging('${data.id}')" onclick="openTaskDetail('${data.id}')" class="todo">
            ${getTaskCardTopTemplate(data.category, data.id)}

                <div id="move-menu-${data.id}" class="move-menu" onclick="event.stopPropagation()">
                    <span>Move to</span>
                    <button onclick="moveMobileTask('${data.id}', 'todo')">
                        To-do
                    </button>
                    <button onclick="moveMobileTask('${data.id}', 'in-progress')">
                        In progress
                    </button>
                    <button onclick="moveMobileTask('${data.id}', 'await-feedback')">
                        Await feedback
                    </button>
                    <button onclick="moveMobileTask('${data.id}', 'done')">
                        Done
                    </button>
                </div>

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
 * Builds the top line of a task card, which holds the category badge.
 *
 * @param {string} category - The category badge as HTML.
 * @returns {string} The top line as HTML.
 */
function getTaskCardTopTemplate(category, taskId) {
    return `
        <div class="task-topline">
            <div class="task-topline-left">${category}</div>
            <button class="move-task-btn"
            onclick="event.stopPropagation(); toggleMoveMenu('${taskId}')">
                <img src="assets/imgs/swap_horiz.svg" alt="Move task">
            </button>
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