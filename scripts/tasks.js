let contactArray = [];
let names = [];
let selectedContacts = [];
let selectedPriority = "medium";

/**
 * 
 */
function init() {
    getContacts();
}

/**
 * 
 * @param {*} ul 
 * @param {*} arr 
 */
function toggleDropdown(ul, arr) {
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
    document.getElementById("contactList").classList.add("d-none");
    document.getElementById("contactArrow").classList.remove("open");
    document.getElementById("categoryList").classList.add("d-none");
}

document.addEventListener("click", closeAllDropdowns);

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
            items[index].style.display = "none"; //hallo //test
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
async function getContacts() {
    let response = await fetch(BASE_URL + "contacts.json");
    let toJson = await response.json();
    await getContactElement(toJson);
}

/**
 * 
 * @param {*} result 
 */
async function getContactElement(result) {
    let contacts = Object.values(result);

    for (const element of contacts) {
        let contact = {
            Name: element.name,
            Initials: await getInitials(element.name)
        }
        contactArray.push(contact);
    }

    getCoWorker();
}


/**
 * 
 */
function getCoWorker() {
    let dropbox = document.getElementById("contactList");
    for (let index = 0; index < contactArray.length; index++) {
        dropbox.innerHTML += getNameTemplate(contactArray[index], index);
    }
}

/**
 * 
 * @param {*} name 
 * @returns 
 */
async function getInitials(name) {
    let initials = name
        .split(" ")
        .map(word => word[0])
        .join("");

    return initials
}

/**
 * 
 */
function submitTaskData(event) {
    event.preventDefault();

    let test = getTaskData();
    //speichern in firebase mit PUT

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
        subtasks: ""
    }
    console.table(task);
    console.table(task.assignedTo);
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
        showContact(contact.Initials);
    } else {
        selectedContacts = selectedContacts.filter(c => c !== contact);
    }
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
 */
function showContact(initial){
    let contact = document.getElementById(`assignedContacts`)
    contact.innerHTML += getContactInitial(initial);
}

/**
 * 
 */
function resetTask(){
    document.getElementById("addTaskForm").reset();
    selectedContacts = [];
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