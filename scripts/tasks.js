function init() {
    
}

/**
 * 
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
    let items = document.querySelectorAll("dropdownList li");

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