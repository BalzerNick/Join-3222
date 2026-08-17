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
    for (const element of contacts) {
        let contact = {
            Name: element.name,
            Initials: element.initials,
            Color: getAvatarColor(element.name)
        }
        contactArray.push(contact);
    }

    setContactStorage(contactArray);
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