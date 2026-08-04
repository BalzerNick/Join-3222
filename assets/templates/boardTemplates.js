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
                <button class="btn-detail btn-delete" onclick="deleteTask('${data.id}')">Delete</button>
                <button class="btn-detail btn-edit" onclick="enterEditMode('${data.id}')">Edit</button>
            </div>
        </div>`;
}

function getTaskEditTemplate(data) {
    return `
        <div class="task-detail-card">
            <div class="task-detail-top">
                <div>${data.category}</div>
                <button class="modal-close task-detail-close" onclick="closeTaskDetail()">&times;</button>
            </div>
            <form id="task-edit-form" class="task-edit-form" onsubmit="saveTaskEdits(event)">
                <div class="form-row">
                    <label for="editTaskTitle">Title</label>
                    <input id="editTaskTitle" class="task-edit-input" type="text" value="${data.title}" required>
                </div>
                <div class="form-row">
                    <label for="editTaskDescription">Description</label>
                    <textarea id="editTaskDescription" class="task-edit-textarea">${data.description}</textarea>
                </div>
                <div class="detail-grid edit-grid">
                    <div class="detail-block edit-block">
                        <label class="detail-label" for="editTaskDeadline">Due date</label>
                        <input id="editTaskDeadline" class="task-edit-input" type="date" value="${data.dueDate}">
                    </div>
                    <div class="detail-block edit-block">
                        <span class="detail-label">Priority</span>
                        <div class="edit-priority-buttons">
                            <button type="button" class="priority-select" onclick="setEditPriority('urgent')">Urgent</button>
                            <button type="button" class="priority-select" onclick="setEditPriority('medium')">Medium</button>
                            <button type="button" class="priority-select" onclick="setEditPriority('low')">Low</button>
                        </div>
                        <input type="hidden" id="editTaskPriority" value="${data.priority}">
                    </div>
                </div>
                <div class="detail-section">
                    <h3>Assigned To</h3>
                    <div class="assigned-list">${data.assignedContactsHTML}</div>
                </div>
                <div class="detail-section">
                    <h3>Subtasks</h3>
                    <div class="subtask-entry">
                        <input id="editSubtaskInput" class="task-edit-input" type="text" placeholder="Add new subtask">
                        <button type="button" class="icon-button" onclick="addEditSubtask()">✔</button>
                        <button type="button" class="icon-button" onclick="resetEditSubtaskInput()">✖</button>
                    </div>
                    <div id="editSubtaskList" class="subtask-list edit-subtask-list"></div>
                </div>
                <div class="detail-actions">
                    <button type="button" class="btn-detail btn-delete" onclick="deleteTask('${data.id}')">Delete</button>
                    <button type="submit" class="btn-detail btn-edit">Save</button>
                </div>
            </form>
        </div>`;
}
