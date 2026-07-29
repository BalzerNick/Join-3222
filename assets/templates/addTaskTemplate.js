function getNameTemplate(contact, index) {
    return `
        <li class="contact-li" onclick="toggleContactRow(${index})">
            <span class="avatar avatar-sm" style="background-color: ${contact.Color}">${contact.Initials}</span>
            <span class="contact-name">${contact.Name}</span>
            <input
                id="contactCheckbox${index}"
                class="contact-checkbox"
                type="checkbox"
                onclick="event.stopPropagation()"
                onchange="toggleContact(${index}, this.checked)">
        </li>
    `;
}

function getContactInitial(initial, color) {
    return `
            <span class="avatar avatar-sm" style="background-color: ${color}">
                ${initial}
            </span>
    `
}

function getAddTaskPage() {
    return `    <main>


        <h1>Add Task</h1>
        <form id="addTaskForm">

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
                        <button type="button" class="btn btn-secondary" id="btnUrgent">
                            Urgent
                            <!-- hier noch Bild rein mit doppel Pfeil nach oben -->
                        </button>
                        <button type="button" class="btn btn-secondary" id="btnMedium">
                            Medium
                            <!-- hier noch Bild rein mit Gleich Zeichen -->
                        </button>
                        <button type="button" class="btn btn-secondary" id="btnLow">
                            Low
                            <!-- hier noch Bild rein mit doppel Pfeil nach unten -->
                        </button>
                    </div>

                    <div class="dropdown">
                        <label for="assignedTo">Assigned to</label>
                        <div class="input-wrapper">
                            <input class="input" id="assignedTo" type="text" placeholder="Auswahl" oninput="searchList()"
                                onclick="toggleDropdown()">

                            <span class="arrow" id="arrow" onclick="toggleDropdown()">▼</span>
                        </div>


                        <ul class="dropdownList d-none" id="dropdownList">
                            <li class="contact-li">
                                <span>
                                    NB
                                </span>
                                <span>
                                    Nick Balzer
                                </span>
                                <input class="contact-checkbox" type="checkbox">
                            </li>
                        </ul>

                    </div>


                    <!--Muss ausgetauscht werden in Div oder Button, der dann ein eigenes hidden Fenster öffnet -->
                    <label for="category">Category*</label>
                    <select name="category" id="category" required>
                        <option value="" disabled selected>Select your category</option>
                        <option value="technical">Technical Task</option>
                        <option value="story">User Story</option>
                    </select>

                    <label for="subTask">Subtask</label>
                    <input class="input" type="text" id="subTask" name="subTask" required placeholder="Add new subtask">
                </div>


            </div>

            <div class="submit-form">
                <span class="required-hint"><span class="required">*</span>This field is required</span>
                <div class="button-area">
                    <!-- Bilder einfügen mit x und Hacken -->
                    <button type="reset" class="btn btn-secondary">Clear </button>
                    <button type="submit" class="btn btn-primary">Create Task </button>
                </div>
            </div>

        </form>
    </main>`
}