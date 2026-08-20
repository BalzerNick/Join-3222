let names = [];
let contacts = [];
let selectedContacts = [];
let subtasks = {};
let selectedPriority = "medium";
let sub = false
let editingSubtaskKey = null;

/**
 * Opens or closes a dropdown and rotates its arrow. Reloads the contacts
 * first, so the assignment list is always up to date. Any other open dropdown
 * is closed before this one opens.
 *
 * @param {string} ul - Id of the list element to toggle, e.g. 'contactList'.
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
    }
}

/**
 * Closes the contact and category dropdowns and resets the contact arrow.
 *
 * @returns {void}
 */
function closeAllDropdowns() {
    document.getElementById("contactList")?.classList.add("d-none");
    document.getElementById("contactArrow")?.classList.remove("open");
    document.getElementById("categoryList")?.classList.add("d-none");
}

/**
 * Filters the contact dropdown by the text typed into the assignment field,
 * hiding every entry that does not contain it.
 *
 * @returns {void}
 */
function searchList() {
    let input = document.getElementById("assignedTo");
    let filter = input.value.toLowerCase();
    let items = document.querySelectorAll("contactList li");

    for (let index = 0; index < items.length; index++) {
        let text = items[index].textContent.toLowerCase();
        if (text.includes(filter)) {
            items[index].style.display = "block";
        } else {
            items[index].style.display = "none"; 
        }
    }
}

/**
 * Writes the picked contact into the assignment field and closes the
 * dropdown.
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
 * Rebuilds the contact dropdown from contactArray. The entry of the logged
 * in user is marked with a '(you)' suffix.
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
 * Ticks the checkboxes of contacts that are already part of the current
 * selection. Needed because the dropdown is rebuilt from freshly loaded
 * contact objects on every open, so their checkboxes always start unchecked.
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
 * Submit handler of the Add-Task form. Collects the inputs, saves the task
 * under the next free id and resets the form.
 *
 * @param {Event} event - The submit event; its default action is prevented.
 * @returns {Promise<void>}
 */
async function submitTaskData(event) {
    event.preventDefault();
    let task = getTaskData();
    let tasks = await getNextTaskId();
    let nextId = Object.keys(tasks).length + 1

    postTask(`/tasks/${nextId}`, task);
    showToast("Task created", duration = 2000)
    resetTask();
}

function getTaskStatusFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('status') || 'todo';
}

/**
 * Collects all form inputs and the current selection state into a task
 * object. New tasks always start in the 'todo' column.
 *
 * @returns {Object} the finished task made in this function
 */
function getTaskData() {
    const task = {
        title: document.getElementById("taskName").value,
        description: document.getElementById("taskDescription").value,
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
 * Stores the picked priority and highlights the matching button, swapping
 * its icon for the selected variant.
 *
 * @param {string} priority - The priority to select: 'urgent', 'medium' or 'low'.
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
 * Writes the category picked from the dropdown into the category field and
 * closes the dropdown.
 *
 * @param {string} value This is the choosed category from the Dropbox
 * @returns {void}
 */
function chooseCategory(value) {
    let input = document.getElementById("category");
    input.value = " ";
    input.value = value;

    toggleDropdown(`categoryList`, `categoryArrow`);
}

/**
 * Adds a contact to the selection or removes it again, then redraws the
 * avatar row below the field.
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
 * Flips the checkbox of a contact row and applies the new state. Lets the
 * whole row act as a click target, not just the checkbox itself.
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
 * Redraws the avatar row of the assigned contacts below the assignment
 * field.
 *
 * @param {string} [initial] - Not used; the initials are taken from selectedContacts instead.
 * @param {string} [color] - Not used; the colour is taken from selectedContacts instead.
 * @returns {void}
 */
function renderContacts(initial, color){
    let contact = document.getElementById(`assignedContacts`)
    contact.innerHTML = ""
    let user = getUser();
    for (let index = 0; index < selectedContacts.length; index++) {
        //testUser(user, contacts[index]);
        contact.innerHTML += getContactInitial(selectedContacts[index].initials, getAvatarColor(selectedContacts[index].name));
    }
}

/**
 * Clears the whole Add-Task form: inputs, selected contacts, subtasks,
 * avatars, and the priority back to 'medium'.
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

/**
 * Shows the confirm/cancel buttons next to the subtask input while it holds
 * text and hides them again once it is empty.
 *
 * @returns {void}
 */
function showButtons(){
    const input = document.getElementById('subtask');
    const buttons = document.getElementById("subtaskButtons");

    if(input.value.length > 0 && sub == false){
        buttons.classList.toggle('d-none')
        sub = true;
    }
    else if(input.value.length == 0 && sub == true){
         buttons.classList.toggle('d-none')
        sub = false;
    }
}

/**
 * Redraws the subtask list. The entry named by editingSubtaskKey is rendered
 * as an input field, all others as plain rows.
 *
 * @returns {void}
 */
function renderSubtask() {
    const subtaskArea = document.getElementById('subtaskArea');
    subtaskArea.innerHTML = "";
    const keys = Object.keys(subtasks);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (key === editingSubtaskKey) {
            subtaskArea.innerHTML += getSubtaskEdit(key, subtasks[key].title);
        } else {
            subtaskArea.innerHTML += getSubtask(key, subtasks[key].title);
        }
    }
}

/**
 * Adds the text of the subtask input as a new subtask and clears the input.
 * An empty input is ignored.
 *
 * @returns {void}
 */
function safeSubtask(){
    const input = document.getElementById('subtask').value.trim();

    if (input.length === 0) {
        return;
    }

    let id = Object.keys(subtasks).length + 1;

    subtasks[`sub${id}`] = {
        "title": input,
        "done": false
    };

    clearSubtask()
    renderSubtask();
}

/**
 * Removes a subtask and leaves edit mode if that subtask was being edited.
 *
 * @param {string} key - Key of the subtask, e.g. 'sub1'.
 * @returns {void}
 */
function deleteSubtask(key){
    console.log(key);

    delete subtasks[key]

    if (editingSubtaskKey === key) {
        editingSubtaskKey = null;
    }

    renderSubtask();
}

/**
 * Switches a subtask into inline edit mode and places the cursor at the end
 * of the text.
 *
 * @param {string} key - Key of the subtask, e.g. 'sub1'.
 * @returns {void}
 */
function editSubtask(key){
    editingSubtaskKey = key;
    renderSubtask();

    const input = document.getElementById(`editInput-${key}`);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
}

/**
 * Applies the edited text of a subtask and leaves edit mode. An empty input
 * keeps the previous text.
 *
 * @param {string} key - Key of the subtask, e.g. 'sub1'.
 * @returns {void}
 */
function confirmEditSubtask(key){
    const input = document.getElementById(`editInput-${key}`);
    const value = input.value.trim();

    if (value.length > 0) {
        subtasks[key].title = value;
    }

    editingSubtaskKey = null;
    renderSubtask();
}

/**
 * Empties the subtask input and hides the confirm/cancel buttons.
 *
 * @returns {void}
 */
function clearSubtask(){
    const input = document.getElementById('subtask');
    input.value = "";
    showButtons();
}

/**
 * Reads the raw session entry of the logged in user from localStorage.
 *
 * @returns {?string} the logged in user from localstorage, or null if nobody is logged in.
 */
function getUser(){
    const user = localStorage.getItem("user");
    return user;
}

/**
 * Builds the display name of a contact for the dropdown.
 *
 * @param {string} loggedinUser - The session entry as returned by getUser.
 * @param {Object} user - The contact to label, with a Name property.
 * @returns {string} the user name and if its your name its get the (you) tag
 */
function testUser(loggedinUser, user){
   
    console.log(user);
    
    if(JSON.parse(loggedinUser).name == user.name){
        return user.name +" (you)"
    }
    else{
        return user.name
    }
}


