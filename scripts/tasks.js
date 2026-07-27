let contactArray = [];
let names = [];
let selectedContacts = [];

/**
 * 
 */
function init(){
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

    list.classList.toggle("d-none");
    arrow.classList.toggle("open");
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
async function getContacts(){
    let response = await fetch(`./database-import.json`);
    let toJson = await response.json();
    
    await getContactElement(toJson);
}

/**
 * 
 * @param {*} result 
 */
async function getContactElement(result){
    let contacts = Object.values(result.contacts);
    
    for(const element of contacts){
        let contact ={
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
function getCoWorker(){
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
async function getInitials(name){
    let initials = name
    .split(" ")
    .map(word => word[0])
    .join("");

    return initials
}

/**
 * 
 */
function submitTaskData() {
    let test = getTaskData();
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
        priority: "",
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
 * @param {*} value 
 */
function chooseCategory(value){
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
}
