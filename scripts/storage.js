/**
 * Javascript Function to set and get Items from Session Storage
 * We use Session Storage and not Local Storage because we get the Data at the beginning of the Session after the Login
 * from our firebase database with a API.
 * After the Session we dont need the Data anymore because there are saved in the database.
 */

/**
 * Saves the contacts in sessionStorage as JSON, so they are available again
 * without another Firebase request for the rest of the session.
 *
 * @param {Object<string, Object>} contacts - The contacts, keyed by their Firebase id.
 * @returns {void}
 */
function setContactStorage(contacts){
    sessionStorage.setItem("contacts", JSON.stringify(contacts));
}

/**
 * Reads the contacts back out of sessionStorage.
 *
 * @returns {Object<string, Object>|null} The contacts, keyed by their Firebase id, or null if none are stored.
 */
function getContactStorage(){
    let tempContacts = JSON.parse(sessionStorage.getItem("contacts"));
    return tempContacts;
}