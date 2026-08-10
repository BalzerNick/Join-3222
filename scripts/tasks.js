let names = [];
let selectedContacts = [];
let subtasks = {};
let selectedPriority = "medium";
let sub = false
let editingSubtaskKey = null;

/**
 * 
 * @param {*} ul 
 * @param {*} arr 
 */
async function toggleDropdown(ul, arr) {
    await getContacts();
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
 *
 */
function closeAllDropdowns() {
    document.getElementById("contactList")?.classList.add("d-none");
    document.getElementById("contactArrow")?.classList.remove("open");
    document.getElementById("categoryList")?.classList.add("d-none");
}

/**
 * 
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
 * 
 * @param {*} contact 
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
 * 
 */
function getCoWorker() {
    let dropbox = document.getElementById("contactList");
    dropbox.innerHTML = "";
    let loggedinUser = getUser();
    for (let index = 0; index < contactArray.length; index++) {
        let user = testUser(loggedinUser, contactArray[index]);
        dropbox.innerHTML += getNameTemplate(user, contactArray[index].Initials, index, contactArray[index].Color);
    }
}

/**
 *
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

/**
 * 
 * @returns 
 */
function getTaskData() {
    const task = {
        title: document.getElementById("taskName").value,
        description: document.getElementById("taskDescription").value,
        dueDate: document.getElementById("taskDeadline").value,
        priority: selectedPriority,
        category: document.getElementById("category").value,
        status: "todo",
        assignedTo: selectedContacts,
        subtasks: subtasks
    }
    return task;
}

/**
 *
 * @param {*} priority
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
 *
 * @param {*} value
 */
function chooseCategory(value) {
    let input = document.getElementById("category");
    input.value = " ";
    input.value = value;

    toggleDropdown(`categoryList`, `categoryArrow`);
}

/**
 * 
 * @param {*} index 
 * @param {*} checked 
 */
function toggleContact(index, checked) {
    const contact = contactArray[index];

    if (checked) {
        selectedContacts.push(contact);
    } else {
        selectedContacts = selectedContacts.filter(c => c !== contact);
    }
    renderContacts();
}

/**
 *
 * @param {*} index
 */
function toggleContactRow(index) {
    let checkbox = document.getElementById(`contactCheckbox${index}`);

    checkbox.checked = !checkbox.checked;
    toggleContact(index, checkbox.checked);
}

/**
 *
 * @param {*} initial
 * @param {*} color
 */
function renderContacts(initial, color){
    let contact = document.getElementById(`assignedContacts`)
    contact.innerHTML = ""
    let user = getUser();
    for (let index = 0; index < selectedContacts.length; index++) {
        testUser(user);
        contact.innerHTML += getContactInitial(selectedContacts[index].Initials, selectedContacts[index].Color);
    }
}

/**
 * 
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
 * 
 */
function resetAssignedContacts(){
    let contact = document.getElementById(`assignedContacts`)
    contact.innerHTML = ""
}

/**
 * 
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
 * 
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
 * 
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
 *
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
 *
 */
function editSubtask(key){
    editingSubtaskKey = key;
    renderSubtask();

    const input = document.getElementById(`editInput-${key}`);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
}

/**
 *
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
 * 
 */
function clearSubtask(){
    const input = document.getElementById('subtask');
    input.value = "";
    showButtons();
}

/**
 * 
 * @returns 
 */
function getUser(){
    const user = localStorage.getItem("user");
    return user;
}

/**
 * 
 * @param {*} loggedinUser 
 * @param {*} user 
 * @returns 
 */
function testUser(loggedinUser, user){
    if(JSON.parse(loggedinUser).name == user.Name){
        return user.Name +" (you)"
    }
    else{
        return user.Name
    }
}


