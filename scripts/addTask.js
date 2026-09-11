/**
 * Opens or closes a dropdown, reloading contacts first and closing any other open dropdown.
 *
 * @param {string} ul - Id of the list element to toggle.
 * @param {string} arr - Id of the arrow icon belonging to that list.
 * @returns {Promise<void>}
 */
async function toggleDropdown(ul, arr) {
    let storedContacts = getContactStorage() || {};
    contacts = Object.keys(storedContacts).map(id => ({ id, ...storedContacts[id] }));
    getCoWorker()
    let list = document.getElementById(ul);
    let arrow = document.getElementById(arr);
    let wasOpen = !list.classList.contains("d-none");
    closeAllDropdowns();
    if (!wasOpen) {
        list.classList.remove("d-none");
        arrow.classList.add("open");
        arrow.src = arrowIconOpen;
    }
}

/**
 * Closes the contact and category dropdowns and resets their arrows.
 *
 * @returns {void}
 */
function closeAllDropdowns() {
    document.getElementById("contactList")?.classList.add("d-none");
    document.getElementById("categoryList")?.classList.add("d-none");
    resetArrowIcon("contactArrow");
    resetArrowIcon("categoryArrow");
}

/**
 * Finds the wrapper of the dropdown that is currently open, if any.
 *
 * @returns {Element|null} The open ".dropdown" wrapper, or null if none is open.
 */
function getOpenDropdownWrapper() {
    let openList = document.querySelector(".dropdown-list:not(.d-none)");
    return openList ? openList.closest(".dropdown") : null;
}

/**
 * Closes the currently open dropdown on an outside pointerdown. Uses
 * "pointerdown" instead of "click" so it also works on mobile, where a tap
 * outside a focused input can swallow the synthesized click.
 *
 * @param {PointerEvent} event - The pointerdown event.
 * @returns {void}
 */
function closeDropdownsOnOutsidePointer(event) {
    let openWrapper = getOpenDropdownWrapper();
    if (!openWrapper) return;
    if (openWrapper.contains(event.target)) return;
    closeAllDropdowns();
}

/**
 * Stops a click on the "Assigned to"/"Category" labels from forwarding to
 * their input and reopening the dropdown that just closed.
 *
 * @param {MouseEvent} event - The click event.
 * @returns {void}
 */
function preventLabelDropdownToggle(event) {
    if (event.target.closest('label[for="assignedTo"], label[for="category"]')) {
        event.preventDefault();
    }
}

/**
 * Wires up the two document-level listeners that keep the dropdowns in
 * sync no matter where on the page a click/tap lands: closing the open one
 * on an outside pointerdown, and stopping the "Assigned to"/"Category"
 * labels from reopening it via their native forwarded click. Runs once at
 * load - both listeners work off the live DOM at event time, so they don't
 * need to be re-attached when the board injects its Add-Task modal.
 *
 * The label listener runs in the capture phase, not bubble: the board's
 * Add-Task modal calls event.stopPropagation() on a click anywhere inside
 * it (see .modal-content in board.html), which would stop it from ever
 * running on the bubble phase - the label's forwarded click would then
 * still reach the input unblocked. Capture runs on the way down, before
 * that stopPropagation() can fire.
 *
 * @returns {void}
 */
function initDropdownGlobalListeners() {
    document.addEventListener("pointerdown", closeDropdownsOnOutsidePointer);
    document.addEventListener("click", preventLabelDropdownToggle, true);
}

initDropdownGlobalListeners();

/**
 * Resets a dropdown arrow icon back to its closed state.
 *
 * @param {string} id - Id of the arrow icon element.
 * @returns {void}
 */
function resetArrowIcon(id) {
    let arrow = document.getElementById(id);
    if (!arrow) return;
    arrow.classList.remove("open");
    arrow.src = arrowIconClosed;
}

/**
 * Filters the contact dropdown by the typed text, matching first/last name from its start (from 2 characters onward).
 *
 * @returns {void}
 */
function searchList() {
    let input = document.getElementById("assignedTo");
    let filter = input.value.trim().toLowerCase();
    let items = document.querySelectorAll("#contactList li");
    items.forEach(item => {
        let nameEl = item.querySelector(".contact-name");
        let nameParts = (nameEl?.textContent || "").replace(" (you)", "").toLowerCase().split(" ");
        let matches = filter.length < 2 || nameParts.some(part => part.startsWith(filter));
        item.style.display = matches ? "flex" : "none";
    });
}

/**
 * Writes the picked contact into the assignment field and closes the dropdown.
 *
 * @param {string} contact - The name of the picked contact.
 * @returns {void}
 */
function selectOption(contact) {
    let input = document.getElementById("assignedTo");
    let list = document.getElementById("dropdownList");
    let arrow = document.getElementById("arrow");
    input.value = contact;
    list.classList.remove("show");
    arrow.classList.remove("open");
}

/**
 * Rebuilds the contact dropdown; the logged-in user's entry gets a '(you)' suffix.
 *
 * @returns {void}
 */
function getCoWorker() {
    let dropbox = document.getElementById("contactList");
    dropbox.innerHTML = "";
    let loggedinUser = getUser();
    for (let index = 0; index < contacts.length; index++) {
        let user = testUser(loggedinUser, contacts[index]);
        dropbox.innerHTML += getNameTemplate(user, contacts[index].initials, index, getAvatarColor(contacts[index].name) );
    }
    applySelectedContactsState();
}

/**
 * Ticks the checkboxes of contacts already in the current selection (the dropdown starts unchecked on every rebuild).
 *
 * @returns {void}
 */
function applySelectedContactsState() {
    for (let index = 0; index < contacts.length; index++) {
        let isSelected = selectedContacts.some(c => c.name === contacts[index].name);
        let checkbox = document.getElementById(`contactCheckbox${index}`);
        if (checkbox) checkbox.checked = isSelected;
    }
}

/**
 * Submit handler of the Add-Task form: saves the task, resets the form and navigates to the board.
 *
 * @param {Event} event - The submit event; its default action is prevented.
 * @returns {Promise<void>}
 */
async function submitTaskData(event) {
    event.preventDefault();
    if (!checkForm(addTaskFields)) return;
    let task = getTaskData();
    let tasks = await getNextTaskId();
    let nextId = Object.keys(tasks).length + 1;
    postTask(`/tasks/${nextId}`, task);
    showToast("Task added to Board", 2000, 'assets/icons/navbar/board_img.svg')
    resetTask();
    setTimeout(() => window.location.href = "board.html", 2000);
}

function getTaskStatusFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('status') || 'todo';
}

/**
 * Collects all form inputs and the current selection into a task object (new tasks start in 'todo').
 *
 * @returns {Object} The finished task.
 */
function getTaskData() {
    const task = {
        title: cleanSpaces(document.getElementById("taskName").value).trim(),
        description: cleanSpaces(document.getElementById("taskDescription").value).trim(),
        dueDate: document.getElementById("taskDeadline").value,
        priority: selectedPriority,
        category: document.getElementById("category").value,
        status: getTaskStatusFromUrl(),
        assignedTo: selectedContacts,
        subtasks: subtasks
    }
    return task;
}

/**
 * Stores the picked priority and highlights the matching button with its selected icon.
 *
 * @param {string} priority - 'urgent', 'medium' or 'low'.
 * @returns {void}
 */
function selectPriority(priority) {
    selectedPriority = priority;
    let buttons = document.querySelectorAll("#btnUrgent, #btnMedium, #btnLow");
    for (const button of buttons) {
        let isSelected = button.id.toLowerCase() === `btn${priority}`;
        let img = button.querySelector("img");

        button.classList.toggle("selected", isSelected);
        img.src = isSelected ? img.dataset.iconSelected : img.dataset.icon;
    }
}

/**
 * Writes the category picked from the dropdown into the category field and closes the dropdown.
 *
 * @param {string} value - The picked category.
 * @returns {void}
 */
function chooseCategory(value) {
    let input = document.getElementById("category");
    input.value = " ";
    input.value = value;
    checkField('category', addTaskFields);
    toggleDropdown(`categoryList`, `categoryArrow`);
}

/**
 * Adds or removes a contact from the selection and redraws the avatar row.
 *
 * @param {number} index - Position of the contact in contactArray.
 * @param {boolean} checked - true adds the contact, false removes it.
 * @returns {void}
 */
function toggleContact(index, checked) {
    const contact = contacts[index];
    if (checked) {
        selectedContacts.push(contact);
    } else {
        selectedContacts = selectedContacts.filter(c => c.name !== contact.name);
    }
    renderContacts();
}

/**
 * Flips a contact row's checkbox and applies the new state (row acts as the click target).
 *
 * @param {number} index - Position of the contact in contactArray.
 * @returns {void}
 */
function toggleContactRow(index) {
    let checkbox = document.getElementById(`contactCheckbox${index}`);
    checkbox.checked = !checkbox.checked;
    toggleContact(index, checkbox.checked);
}

/**
 * Redraws the assigned-contacts avatar row, collapsing extra contacts into a '+N' badge.
 *
 * @returns {void}
 */
function renderContacts(){
    let contact = document.getElementById(`assignedContacts`)
    contact.innerHTML = ""
    const total = selectedContacts.length;
    const overflow = total > maxVisibleContacts;
    const visibleCount = overflow ? maxVisibleContacts - 1 : total;

    for (let index = 0; index < visibleCount; index++) {
        contact.innerHTML += getContactInitial(selectedContacts[index].initials, getAvatarColor(selectedContacts[index].name));
    }
    if (overflow) {
        contact.innerHTML += getContactInitial(`+${total - visibleCount}`, '', 'avatar-more');
    }
}

/**
 * Clears the whole Add-Task form back to its default state.
 *
 * @returns {void}
 */
function resetTask(){
    document.getElementById("addTaskForm").reset();
    selectedContacts = [];
    subtasks = [];
    renderSubtask()
    resetAssignedContacts();
    selectPriority("medium")
    addTaskFields.forEach(field => showFieldError(field.id, ""));
}

/**
 * Empties the avatar row below the assignment field.
 *
 * @returns {void}
 */
function resetAssignedContacts(){
    let contact = document.getElementById(`assignedContacts`)
    contact.innerHTML = ""
}
