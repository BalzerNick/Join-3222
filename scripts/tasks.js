let contactArray = [];

function init(){
    getContacts();
    searchList();
    toggleDropdown(1,2);
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
