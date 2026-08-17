/**
 * Builds one row of the contact dropdown, with avatar, name and checkbox.
 *
 * @param {string} name - The display name, possibly with a '(you)' suffix.
 * @param {string} initials - The initials shown in the avatar.
 * @param {number} index - Position of the contact in contactArray.
 * @param {string} color - Background colour of the avatar.
 * @returns {string} The list row as HTML.
 */
function getNameTemplate(name, initials, index, color) {
    return `
        <li class="contact-li" onclick="toggleContactRow(${index})">
            <span class="avatar avatar-sm" style="background-color: ${color}">${initials}</span>
            <span class="contact-name">${name}</span>
            <input
                id="contactCheckbox${index}"
                class="contact-checkbox"
                type="checkbox"
                onclick="event.stopPropagation()"
                onchange="toggleContact(${index}, this.checked)">
        </li>
    `;
}

/**
 * Builds a single avatar badge. Used by the Add-Task form and the board.
 *
 * @param {string} initial - The initials to show.
 * @param {string} color - Background colour of the avatar.
 * @returns {string} The avatar as HTML.
 */
function getContactInitial(initial, color) {
    return `
            <span class="avatar avatar-sm" style="background-color: ${color}">
                ${initial}
            </span>
    `
}

/**
 * Builds a subtask row in its normal state, with edit and delete icons.
 *
 * @param {string} key - Key of the subtask, e.g. 'sub1'.
 * @param {string} subtask - The subtask title.
 * @returns {string} The row as HTML.
 */
function getSubtask(key, subtask){
    return `
        <div class="subtask" id="${key}">
            <span class="subtask-text">${subtask}</span>
            <div class="subtask-actions">
                <img class="subtask-icon pointer" src="assets/icons/edit.svg" alt="Edit subtask" onclick="editSubtask('${key}')">
                <span class="subtask-divider">|</span>
                <img class="subtask-icon pointer" src="assets/icons/delete.svg" alt="Delete subtask" onclick="deleteSubtask('${key}')">
            </div>
        </div>
    `
}

/**
 * Builds a subtask row in edit state, as an input field that also confirms
 * on the Enter key.
 *
 * @param {string} key - Key of the subtask, e.g. 'sub1'.
 * @param {string} subtask - The current subtask title.
 * @returns {string} The row as HTML.
 */
function getSubtaskEdit(key, subtask){
    return `
        <div class="subtask subtask-editing" id="${key}">
            <input class="subtask-edit-input" id="editInput-${key}" type="text" value="${subtask}" autocomplete="off"
                onkeydown="if(event.key === 'Enter'){ event.preventDefault(); confirmEditSubtask('${key}'); }">
            <div class="subtask-actions subtask-actions-edit">
                <img class="subtask-icon pointer" src="assets/icons/delete.svg" alt="Delete subtask" onclick="deleteSubtask('${key}')">
                <img class="subtask-icon pointer" src="assets/icons/check_black.svg" alt="Confirm edit" onclick="confirmEditSubtask('${key}')">
            </div>
        </div>
    `
}

/**
 * Builds the complete Add-Task form. Used by the board to fill its Add-Task
 * dialog with the same markup the standalone page uses.
 *
 * @returns {string} The whole form as HTML.
 */
function getAddTaskPage() {
    return `
    <main>
        <h1>Add Task</h1>

        <form id="addTaskForm" onsubmit="submitTaskData(event)" onreset="resetTask()">
            <div class="input-form">
                <div class="input-area">
                    <label for="taskName">Title<span class="required">*</span></label>
                    <input class="input" type="text" id="taskName" name="taskName" required placeholder="Enter a title">

                    <label for="taskDescription">Description</label>
                    <textarea class="input" id="taskDescription" name="taskDescription"
                        placeholder="Enter a Description"></textarea>

                    <label for="taskDeadline">Due date<span class="required">*</span></label>
                    <input class="input" type="date" id="taskDeadline" name="taskDeadline" required>
                </div>

                <div class="divider"></div>


                <div class="input-area">
                    <label>Priority</label>
                    <div class="priority-buttons">
                        <button type="button" class="btn btn-secondary btn-task btn-priority-urgent" id="btnUrgent"
                            onclick="selectPriority('urgent')">
                            <span>Urgent</span>
                            <img class="medium" src="assets/icons/arrow up.svg" data-icon="assets/icons/arrow up.svg"
                                data-icon-selected="assets/icons/arrow up_choosed.svg" alt="Urgent priority icon">
                        </button>
                        <button type="button" class="btn btn-secondary btn-task btn-priority-medium selected"
                            id="btnMedium" onclick="selectPriority('medium')">
                            <span>Medium</span>
                            <img class="medium" src="assets/icons/=_choosed.svg" data-icon="assets/icons/=.svg"
                                data-icon-selected="assets/icons/=_choosed.svg" alt="Medium priority icon">
                        </button>
                        <button type="button" class="btn btn-secondary btn-task btn-priority-low" id="btnLow"
                            onclick="selectPriority('low')">
                            <span>Low</span>
                            <img class="medium" src="assets/icons/arrow down.svg"
                                data-icon="assets/icons/arrow down.svg"
                                data-icon-selected="assets/icons/arrow down_choosed.svg" alt="Low priority icon">
                        </button>
                    </div>

                    <label for="assignedTo">Assigned to</label>
                    <div class="dropdown" onclick="noEvent(event)">
                        <div class="input-wrapper">
                            <input class="input pointer" id="assignedTo" type="text"
                                placeholder="Select contact to assign" autocomplete="off" oninput="searchList()"
                                onclick="toggleDropdown('contactList', 'contactArrow')">

                            <span class="input-img pointer arrow" id="contactArrow"
                                onclick="toggleDropdown('contactList', 'contactArrow')">▼</span>
                        </div>


                        <ul class="dropdown-list dropdown-scroll d-none" id="contactList">

                        </ul>
                    </div>

                    <div id="assignedContacts" class="assigned-contacts">

                    </div>

                    <label for="category">Category<span class="required">*</span></label>
                    <div class="dropdown" onclick="noEvent(event)">
                        <div class="input-wrapper">
                            <input class="input pointer" id="category" type="text" placeholder="Select task category"
                                autocomplete="off" oninput="searchList()"
                                onclick="toggleDropdown('categoryList', 'categoryArrow')" required>

                            <span class="input-img pointer arrow" id="categoryArrow"
                                onclick="toggleDropdown('categoryList', 'categoryArrow')">▼</span>
                        </div>

                        <ul class="dropdown-list d-none" id="categoryList">
                            <li class="contact-li" onclick="chooseCategory('Technical Task')">
                                <span class="category-label">
                                    Technical Task
                                </span>
                            </li>

                            <li class="contact-li" onclick="chooseCategory('User Story')">
                                <span class="category-label">
                                    User Story
                                </span>
                            </li>
                        </ul>
                    </div>

                    <label for="subtask">Subtask</label>
                    <div class="add-subtask">
                        <div class="input-wrapper">
                            <input class="input" id="subtask" type="text" placeholder="Add new subtask" autocomplete="off" oninput="showButtons()"
                                onkeydown="if(event.key === 'Enter'){ event.preventDefault(); safeSubtask(); }">
                            <div class="subtask-buttons input-img d-none" id="subtaskButtons">
                                <img class="input-img subtask-icon pointer" src="assets/icons/close.svg" alt="x" onclick="clearSubtask()">
                                <span>|</span>
                                <img class="input-img subtask-icon pointer" src="assets/icons/check_black.svg" alt="Add subtask" onclick="safeSubtask()">
                            </div>

                        </div>
                        <div class="subtask-area" id="subtaskArea">

                        </div>
                    </div>

                </div>
            </div>


            <div class="submit-form">
                <span class="required-hint"><span class="required">*</span>This field is required</span>
                <div class="button-area">
                    <button type="reset" class="btn btn-secondary btn-task">
                        <span>Clear</span>
                        <img class="btn-img" src="assets/icons/close.svg" alt="x symbole for close">
                    </button>
                    <button class="btn btn-primary btn-task" type="submit">
                        <span>Create Task</span>
                        <img class="btn-img" src="assets/icons/check.svg" alt=" symbole for submit">
                    </button>
                </div>
            </div>
        </form>
    </main>
    `;
}
