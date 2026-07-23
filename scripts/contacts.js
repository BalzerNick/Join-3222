/**
 * Wird beim Laden der Seite aufgerufen (body onload). Rendert die Kontaktliste.
 * @returns {Promise<void>}
 */
async function renderContacts() {
  let contacts = await loadContacts();
  let template = await loadTemplate();
  showContacts(contacts, template);
}


/**
 * Laedt alle Kontakte aus Firebase.
 * @returns {Promise<Object>} Die Kontakte als ID-Objekt (oder null).
 */
async function loadContacts() {
  let response = await fetch(BASE_URL + "contacts.json");
  return await response.json();
}


/**
 * Laedt die Karten-Vorlage als Text.
 * @returns {Promise<string>} Die Vorlage als HTML-Text.
 */
async function loadTemplate() {
  let response = await fetch("assets/templates/contactsTemplate.html");
  return await response.text();
}


/**
 * Baut fuer jeden Kontakt eine Karte und schreibt sie in die Liste.
 * @param {Object} contacts - Die Kontakte als ID-Objekt.
 * @param {string} template - Die Kartenvorlage als HTML-Text.
 * @returns {void}
 */
function showContacts(contacts, template) {
  let list = document.getElementById('contactList');
  list.innerHTML = "";
  for (let id in contacts) {
    list.innerHTML += fillTemplate(template, contacts[id]);
  }
}


/**
 * Ersetzt die Platzhalter in der Vorlage durch die Kontaktdaten.
 * @param {string} template - Die Vorlage mit Platzhaltern.
 * @param {{name: string, email: string}} contact - Ein Kontakt.
 * @returns {string} Die gefuellte Karte als HTML.
 */
function fillTemplate(template, contact) {
  return template
    .replaceAll("{{initials}}", getInitials(contact.name))
    .replaceAll("{{name}}", contact.name)
    .replaceAll("{{email}}", contact.email);
}


/**
 * Bildet die Initialen aus dem Namen (z.B. "Anna Schmidt" -> "AS").
 * @param {string} name - Der vollstaendige Name.
 * @returns {string} Die Initialen in Grossbuchstaben.
 */
function getInitials(name) {
  let parts = name.split(" ");
  let first = parts[0][0];
  let last = parts[parts.length - 1][0];
  return (first + last).toUpperCase();
}


/**
 * Oeffnet das Popup zum Anlegen eines Kontakts.
 * @returns {Promise<void>}
 */
async function openAddContact() {
  let overlay = document.getElementById('addContactOverlay');
  overlay.innerHTML = await loadAddContactTemplate();
  overlay.classList.remove('d-none');
}


/**
 * Laedt die Popup-Vorlage als Text.
 * @returns {Promise<string>} Die Popup-Vorlage als HTML-Text.
 */
async function loadAddContactTemplate() {
  let response = await fetch("assets/templates/addContactTemplate.html");
  return await response.text();
}


/**
 * Schliesst das Popup.
 * @returns {void}
 */
function closeAddContact() {
  document.getElementById('addContactOverlay').classList.add('d-none');
}


/**
 * Liest die Eingaben aus dem Popup.
 * @returns {{name: string, email: string, phone: string}} Der neue Kontakt.
 */
function getNewContact() {
  return {
    name: document.getElementById('newContactName').value.trim(),
    email: document.getElementById('newContactEmail').value.trim(),
    phone: document.getElementById('newContactPhone').value.trim()
  };
}


/**
 * Speichert einen neuen Kontakt im Backend (POST erzeugt eine ID).
 * @param {{name: string, email: string, phone: string}} contact - Der neue Kontakt.
 * @returns {Promise<void>}
 */
async function saveContact(contact) {
  await fetch(BASE_URL + "contacts.json", {
    method: "POST",
    body: JSON.stringify(contact)
  });
}


/**
 * Liest die Eingaben, speichert den Kontakt und aktualisiert die Liste.
 * @returns {Promise<void>}
 */
async function createContact() {
  let contact = getNewContact();
  if (!contact.name || !contact.email) {
    return;
  }
  await saveContact(contact);
  closeAddContact();
  renderContacts();
  showToast("Contact successfully created");
}
