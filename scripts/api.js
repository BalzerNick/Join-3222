let contactArray = [];

/**
 * Loads all contacts from the database and hands them over to
 * getContactElement, which fills the contactArray used by the dropdown.
 *
 * @returns {Promise<void>}
 */
async function getContacts() {
    let response = await fetch(BASE_URL + "contacts.json");
    let toJson = await response.json();
    console.log(toJson[0]);
    
    await getContactElement(toJson);
}

/**
 * Converts the raw contact data into dropdown entries and stores them in
 * contactArray. The previous content of that array is discarded.
 *
 * @param {Object} result - The API result from the database, holding all contacts keyed by their id.
 * @returns {Promise<void>}
 */
async function getContactElement(result) {
    let contacts = Object.values(result);
    contactArray = [];
    console.log(result);
    
    for (const element of contacts) {
        let contact = {
            Id: element.id,
            Name: element.name,
            Initials: element.initials,
            Color: getAvatarColor(element.name),
            Email: element.email,
            Phone: element.phone
        }
        contactArray.push(contact);
    }
    setContactStorage(contactArray);
}

/**
 * Saves a new contact in the database. POST makes Firebase generate the id.
 *
 * @param {Object} contact - The contact record that is stored.
 * @returns {Promise<void>}
 */
async function saveContact(contact) {
  await fetch(BASE_URL + "contacts.json", {
    method: "POST",
    body: JSON.stringify(contact)
  });
  await getContacts();
}

/**
 * Overwrites an existing contact in the database via PUT.
 *
 * @param {string} id - The database key of the contact that is overwritten.
 * @param {Object} contact - The new contact data that replaces the stored record.
 * @returns {Promise<void>}
 */
async function saveEditedContact(id, contact) {
  await fetch(BASE_URL + "contacts/" + id + ".json", {
    method: "PUT",
    body: JSON.stringify(contact)
  });
  await getContacts();
}

/**
 * Deletes a contact from the database, empties the detail view and refreshes
 * the list.
 *
 * @param {string} id - The database key of the contact that is deleted.
 * @returns {Promise<void>}
 */
async function deleteContacts(id) {
  await fetch(BASE_URL + "contacts/" + id + ".json", { method: "DELETE" });
  await getContacts();
}

/**
 * Loads all tasks from the database. The caller derives the next task id
 * from the number of entries, which is where the function name comes from.
 *
 * @returns {Promise<Object>} All tasks in JSON format from the database, keyed by task id.
 */
async function getNextTaskId() {
    let response = await fetch(BASE_URL + "/tasks.json");
    let tasks = await response.json();

    return tasks
}


/**
 * Saves a task in the database via PUT, overwriting whatever sits at that
 * path.
 *
 * @param {string} [path=""] - Path below the database root without the ".json" suffix, for example "/tasks/5".
 * @param {Object} [data={}] - The task object that is written to that path.
 * @returns {Promise<Object>} The database's response regarding the task to be saved.
 */
async function postTask(path ="", data = {}){
    let response = await fetch(BASE_URL + path + ".json", {
        method: "PUT",
        header: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    return responseToJson = await response.json
}