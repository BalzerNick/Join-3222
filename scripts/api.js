let contactArray = [];

/**
 * API Zugriff auf die Datenbank um die Kontakte zu bekommen
 *
 * @returns {Promise<void>}
 */
async function getContacts() {
    let response = await fetch(BASE_URL + "contacts.json");
    let toJson = await response.json();
    await getContactElement(toJson);
}

/**
 * Funktion um jeden Kontakt aus der Datenbank als Objekt in einem Array zu speichern
 *
 * @param {Object} result The API result from the Database with all Contacts
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
}

/**
 * API Zugriff auf Datenbank um die Tasks zu bekommen
 *
 * @returns {Promise<Object>} all task in json format from the database
 */
async function getNextTaskId() {
    let response = await fetch(BASE_URL + "/tasks.json");
    let tasks = await response.json();

    return tasks
}


/**
 * Funktion um einen neuen Task zu speichern.
 *
 * @param {string} [path=""] - Pfad unterhalb der Datenbank-Wurzel, ohne ".json", z.B. "/tasks/5".
 * @param {Object} [data={}] - Der zu speichernde Task.
 * @returns {Promise<Object>} the database's response regarding the task to be saved
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