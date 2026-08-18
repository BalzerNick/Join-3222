/**
 * Javascript Function to set and get Items from Session Storage
 * We use Session Storage and not Local Storage because we get the Data at the beginning of the Session after the Login
 * from our firebase database with a API.
 * After the Session we dont need the Data anymore because there are saved in the database.
 */

/**
 * 
 * @param {*} contacts 
 */
function setContactStorage(contacts){
    sessionStorage.setItem("contacts", JSON.stringify(contacts));
}

/**
 * 
 * @returns the contacts saved in sessionStorage
 */
function getContactStorage(){
    let tempContacts = JSON.parse(sessionStorage.getItem("contacts"));
    return tempContacts;
}