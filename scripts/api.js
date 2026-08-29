/**
 * Loads all contacts from the database and hands them over to
 * getContactElement, which fills the contactArray used by the dropdown.
 *
 * @returns {Promise<void>}
 */
async function getContacts() {
    let response = await fetch(baseUrl + "contacts.json");
    contactArray = [];
    contactArray = await response.json();
    setContactStorage(contactArray);
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
  await fetch(baseUrl + "contacts.json", {
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
  await fetch(baseUrl + "contacts/" + id + ".json", {
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
  await fetch(baseUrl + "contacts/" + id + ".json", { method: "DELETE" });
  await getContacts();
}

/**
 * Loads all tasks from the database. The caller derives the next task id
 * from the number of entries, which is where the function name comes from.
 *
 * @returns {Promise<Object>} All tasks in JSON format from the database, keyed by task id.
 */
async function getNextTaskId() {
    let response = await fetch(baseUrl + "/tasks.json");
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
    let response = await fetch(baseUrl + path + ".json", {
        method: "PUT",
        header: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    return responseToJson = await response.json
}

/**
 * Overwrites a single value at a database path and turns a failed response
 * into an error. Shared by all partial writes of this file.
 *
 * PUT on a leaf path only replaces that path, so this gives the same partial
 * update as PATCH would - without PATCH, whose CORS preflight Firebase's
 * Realtime Database does not answer reliably from the browser.
 *
 * @param {string} path - Path below the database root, including the .json suffix.
 * @param {*} value - The value written at that path.
 * @param {string} message - Prefix of the error message.
 * @returns {Promise<void>}
 * @throws {Error} If the response status is not ok.
 */
async function putBoardResource(path, value, message) {
    const response = await fetch(baseUrl + path, {
        method: 'PUT',
        body: JSON.stringify(value)
    });
    if (!response.ok) throw new Error(`${message}: ${response.status} ${response.statusText}`);
}

/**
 * Reads a resource from the database and insists on a successful response.
 *
 * @param {string} path - Path below the database root, including the .json suffix.
 * @param {string} message - Prefix of the error message.
 * @returns {Promise<*>} The parsed response body.
 * @throws {Error} If the response status is not ok.
 */
async function requireBoardJson(path, message) {
    const response = await fetch(baseUrl + path);
    if (!response.ok) throw new Error(`${message}: ${response.status} ${response.statusText}`);
    return await response.json();
}

/**
 * Saves the checkbox state of a single subtask.
 *
 * @param {string} taskId - Database key of the task.
 * @param {string} subtaskId - Key of the subtask, e.g. 'sub1'.
 * @param {boolean} done - The new state.
 * @returns {Promise<void>}
 * @throws {Error} If the database rejects the write.
 */
async function updateSubtaskDone(taskId, subtaskId, done) {
    await putBoardResource(`tasks/${taskId}/subtasks/${subtaskId}/done.json`, done, 'Firebase subtask update failed');
}

/**
 * Saves the new column of a task.
 *
 * @param {string} taskId - Database key of the task.
 * @param {string} status - The new status.
 * @returns {Promise<void>}
 * @throws {Error} If the database rejects the write.
 */
async function updateTaskStatus(taskId, status) {
    await putBoardResource(`tasks/${taskId}/status.json`, status, 'Firebase status update failed');
}

/**
 * Fetches the raw task collection. Errors are logged and reported as null.
 *
 * @returns {Promise<?Object>} The tasks keyed by id, or null on failure.
 */
async function fetchTaskCollection() {
    try {
        const response = await fetch(baseUrl + 'tasks.json');
        if (response.ok) return await response.json();
        console.error('Failed to load Firebase task data', response.status, response.statusText);
    } catch (error) {
        console.error('Firebase task load failed', error);
    }
    return null;
}

/**
 * Writes changed fields of a task back to the database.
 *
 * @param {string} taskId - Database key of the task.
 * @param {Object} updates - The fields to overwrite.
 * @returns {Promise<void>}
 * @throws {Error} If the database rejects the write.
 */
async function updateTaskData(taskId, updates) {
    await Promise.all(Object.entries(updates).map(([field, value]) =>
        putBoardResource(`tasks/${taskId}/${field}.json`, value, 'Firebase task update failed')
    ));
}

/**
 * Deletes a task from the database.
 *
 * @param {string} taskId - Database key of the task.
 * @returns {Promise<void>}
 * @throws {Error} If the database rejects the delete.
 */
async function deleteTaskFromFirebase(taskId) {
    const response = await fetch(baseUrl + `tasks/${taskId}.json`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`Firebase task delete failed: ${response.status} ${response.statusText}`);
}

/**
 * Loads all tasks for the summary page's metric tiles.
 *
 * @returns {Promise<?Array<Object>>} All tasks as an array, or null if the request failed.
 */
async function getTasks() {
    try {
        const response = await fetch(baseUrl + "tasks.json");
        if (!response.ok) {
            console.error("Failed to load task data", response.status, response.statusText);
            return null;
        }
        const data = await response.json();
        return data ? Object.values(data) : [];
    } catch (error) {
        console.error("Firebase load failed", error);
        return null;
    }
}

/**
 * Loads all registered users from the database.
 *
 * @returns {Promise<Object>} All users keyed by their id, empty if the database holds none.
 * @throws {Error} If the request fails or the response status is not ok.
 */
async function loadUsers() {
  return await requireBoardJson("users.json", "Firebase load users failed") || {};
}

/**
 * Saves a new user in the database. POST makes Firebase generate the id.
 *
 * @param {{name: string, email: string, password: string}} user - The user record that is stored.
 * @returns {Promise<void>}
 * @throws {Error} If the request fails or the database rejects the write.
 */
async function saveUser(user) {
  const response = await fetch(baseUrl + "users.json", {
    method: "POST",
    body: JSON.stringify(user)
  });
  if (!response.ok) throw new Error(`Firebase save user failed: ${response.status} ${response.statusText}`);
}
