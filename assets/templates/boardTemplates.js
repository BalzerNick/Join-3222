function getTaskTemplate(data) {
    return `
        <div draggable="true"
             ondragstart="startDragging('${data.id}')"
             onclick="openTaskDetail('${data.id}')"
             class="todo">
            <div class="task-topline">
                <div class="task-topline-left">${data.category}</div>
            </div>
            <h3 class="task-title">${data.title}</h3>
            ${data.description}

            ${data.subtaskHTML}
            <div class="task-footer">
                <div class="footer-left">
                    <div class="avatars">${data.avatarsHTML}</div>
                </div>
                <div class="footer-right">${data.priority}</div>
            </div>
        </div>`;
}

function getTaskDetailTemplate(data) {
    return `
        <div class="task-detail-card">
            <div class="task-detail-top">
                <div>${data.category}</div>
                <button class="modal-close task-detail-close" onclick="closeTaskDetail()">&times;</button>
            </div>
            <h2 class="detail-title">${data.title}</h2>
            ${data.description}
            <div class="detail-grid">
                <div class="detail-block">
                    <span class="detail-label">Due date:</span>
                    ${data.dueDate}
                </div>
                <div class="detail-block">
                    <span class="detail-label">Priority:</span>
                    ${data.priority}
                </div>
            </div>
            <div class="detail-section">
                <h3>Assigned To:</h3>
                <div class="assigned-list">${data.assignedContactsHTML}</div>
            </div>
            <div class="detail-section">
                <h3>Subtasks</h3>
                <ul class="subtask-list">${data.subtasksHTML}</ul>
            </div>
            <div class="detail-actions">
                <button class="btn-detail btn-delete" onclick="deleteTask('${data.id}')"><img src="assets/icons/delete.svg" alt="delete">Delete</button>
                <button class="btn-detail btn-edit" onclick="enterEditMode('${data.id}')"><img src="assets/icons/edit.svg" alt="edit">Edit</button>
            </div>
        </div>`;
}

function getTaskEditTemplate(data) {
    return `
        <div class="task-detail-card">
            <div class="task-detail-top">
                <div></div>
                <button class="modal-close task-detail-close" onclick="closeTaskDetail()">&times;</button>
            </div>
            <form id="task-edit-form" class="task-edit-form" onsubmit="saveTaskEdits(event)">
                <div class="form-row">
                    <label for="editTaskTitle">Title</label>
                    <input id="editTaskTitle" class="input task-edit-input" type="text" value="${data.title}" required>
                </div>
                <div class="form-row">
                    <label for="editTaskDescription">Description</label>
                    <textarea id="editTaskDescription" class="input task-edit-textarea">${data.description}</textarea>
                </div>
                <div class="form-row">
                    <label for="editTaskDeadline">Due date</label>
                    <div class="edit-date-wrapper">
                        <input id="editTaskDeadline" class="input task-edit-input" type="date" value="${data.dueDate}">
                    </div>
                </div>
                <div class="form-row">
                    <label>Priority</label>
                    <div class="priority-buttons edit-priority-buttons">
                        <button type="button" class="btn btn-secondary btn-task btn-priority-urgent" id="editBtnUrgent" onclick="setEditPriority('urgent')">
                            <span>Urgent</span>
                            <img src="assets/icons/arrow up.svg" data-icon="assets/icons/arrow up.svg" data-icon-selected="assets/icons/arrow up_choosed.svg" alt="urgent">
                        </button>
                        <button type="button" class="btn btn-secondary btn-task btn-priority-medium" id="editBtnMedium" onclick="setEditPriority('medium')">
                            <span>Medium</span>
                            <img src="assets/icons/=.svg" data-icon="assets/icons/=.svg" data-icon-selected="assets/icons/=_choosed.svg" alt="medium">
                        </button>
                        <button type="button" class="btn btn-secondary btn-task btn-priority-low" id="editBtnLow" onclick="setEditPriority('low')">
                            <span>Low</span>
                            <img src="assets/icons/arrow down.svg" data-icon="assets/icons/arrow down.svg" data-icon-selected="assets/icons/arrow down_choosed.svg" alt="low">
                        </button>
                    </div>
                    <input type="hidden" id="editTaskPriority" value="${data.priority}">
                </div>
                <div class="form-row">
                    <label>Assigned to</label>
                    <div class="edit-contact-dropdown" onclick="noEvent(event)">
                        <div class="edit-contact-input-row" onclick="toggleEditContactDropdown(event)">
                            <span class="edit-contact-placeholder">Select contacts to assign</span>
                            <span class="edit-dropdown-arrow" id="editContactArrow">▼</span>
                        </div>
                        <ul class="edit-contact-list d-none" id="editContactList">
                            ${data.contactListHTML}
                        </ul>
                    </div>
                    <div id="editAssignedAvatars" class="edit-assigned-avatars">${data.assignedAvatarsHTML}</div>
                </div>
                <div class="form-row">
                    <label>Subtasks</label>
                    <div class="edit-subtask-entry">
                        <input id="editSubtaskInput" class="input task-edit-input" type="text" placeholder="Add new subtask">
                        <button type="button" class="edit-subtask-add-btn" onclick="addEditSubtask()">+</button>
                    </div>
                    <ul id="editSubtaskList" class="edit-subtask-list-ul"></ul>
                </div>
                <div class="edit-form-footer">
                    <button type="submit" class="btn-ok-edit">Ok <img src="assets/icons/check.svg" alt="ok"></button>
                </div>
            </form>
        </div>`;
}
