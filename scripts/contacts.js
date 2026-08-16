// Cache of the loaded contacts (used by the detail and edit views).
let allContacts = {};

/**
 * Entry point of the contacts page, called from the body onload attribute.
 * Loads the contacts and both templates and renders the grouped list.
 *
 * @returns {Promise<void>}
 */
async function renderContacts() {
  allContacts = await loadContacts() || {};
  let card = await loadTemplate();
  let letter = await loadLetterTemplate();
  showContacts(allContacts, card, letter);
}

/**
 * Loads all contacts from the Firebase database.
 *
 * @returns {Promise<?Object>} All contacts keyed by their id, or null if the database holds none.
 */
async function loadContacts() {
  let response = await fetch(BASE_URL + "contacts.json");
  return await response.json();
}

/**
 * Loads the contact card template from the templates folder.
 *
 * @returns {Promise<string>} The card template as HTML text, still containing its placeholders.
 */
async function loadTemplate() {
  let response = await fetch("assets/templates/contactsTemplate.html");
  return await response.text();
}

/**
 * Loads the template for the letter separators of the contact list.
 *
 * @returns {Promise<string>} The letter template as HTML text, still containing its placeholder.
 */
async function loadLetterTemplate() {
  let response = await fetch("assets/templates/contactLetterTemplate.html");
  return await response.text();
}

/**
 * Turns the contact object into an array sorted by name, keeping the
 * database key of every contact as an id property.
 *
 * @param {Object} contacts - All contacts keyed by their id.
 * @returns {Array<Object>} The contacts sorted by name, each one including its id.
 */
function sortContacts(contacts) {
  let list = Object.keys(contacts).map(id => ({ id, ...contacts[id] }));
  list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

/**
 * Builds the list markup and inserts a letter separator whenever the first
 * letter of the name changes.
 *
 * @param {Array<Object>} sorted - The contacts sorted by name, as returned by sortContacts.
 * @param {string} card - The contact card template with its placeholders.
 * @param {string} letterTpl - The letter separator template with its placeholder.
 * @returns {string} The finished contact list as HTML.
 */
function buildContactsHtml(sorted, card, letterTpl) {
  let html = "";
  let currentLetter = "";
  for (let contact of sorted) {
    let letter = contact.name[0].toUpperCase();
    if (letter !== currentLetter) {
      currentLetter = letter;
      html += letterTpl.replaceAll("{{letter}}", letter);
    }
    html += fillTemplate(card, contact);
  }
  return html;
}

/**
 * Sorts and groups the contacts and writes the result into the list element.
 *
 * @param {Object} contacts - All contacts keyed by their id.
 * @param {string} card - The contact card template with its placeholders.
 * @param {string} letterTpl - The letter separator template with its placeholder.
 * @returns {void}
 */
function showContacts(contacts, card, letterTpl) {
  let list = document.getElementById('contactList');
  list.innerHTML = buildContactsHtml(sortContacts(contacts), card, letterTpl);
}

/**
 * Replaces the placeholders of the card template with the data of one
 * contact.
 *
 * @param {string} template - The card template containing the {{...}} placeholders.
 * @param {Object} contact - The contact to render, including its id, name, email and initials.
 * @returns {string} The filled contact card as HTML.
 */
function fillTemplate(template, contact) {
  return template
    .replaceAll("{{id}}", contact.id)
    .replaceAll("{{color}}", getAvatarColor(contact.name))
    .replaceAll("{{initials}}", contact.initials)
    .replaceAll("{{name}}", contact.name)
    .replaceAll("{{email}}", contact.email);
}

/**
 * Shows the detail view of a contact on the right hand side and highlights
 * the matching card in the list.
 *
 * @param {string} id - The database key of the contact to display.
 * @returns {Promise<void>}
 */
async function showContactDetail(id) {
  let template = await loadDetailTemplate();
  let detail = document.getElementById('contactDetail');
  detail.innerHTML = fillDetailTemplate(template, id, allContacts[id]);
  highlightContact(id);
  document.querySelector('.contacts-main').classList.add('detail-open');
}

/**
 * Returns from the detail view back to the contact list and clears the card
 * highlight. Bound to the back arrow that is only visible on mobile.
 *
 * @returns {void}
 */
function closeContactDetail() {
  document.querySelector('.contacts-main').classList.remove('detail-open');
  document.querySelectorAll('.contact').forEach(card => card.classList.remove('contact-active'));
}

/**
 * Opens or closes the mobile edit and delete menu of the detail view.
 *
 * @returns {void}
 */
function toggleContactMenu() {
  document.querySelector('.detail-actions').classList.toggle('open');
}

/**
 * Closes the mobile menu when the click happened next to it. Bound to the
 * body onclick attribute.
 *
 * @param {Event} event - The click event, used to find out what was clicked.
 * @returns {void}
 */
function closeContactMenu(event) {
  let menu = document.querySelector('.detail-actions');
  let button = document.querySelector('.detail-menu-btn');
  if (!menu || menu.contains(event.target) || button.contains(event.target)) return;
  menu.classList.remove('open');
}

/**
 * Loads the template of the contact detail view.
 *
 * @returns {Promise<string>} The detail template as HTML text, still containing its placeholders.
 */
async function loadDetailTemplate() {
  let response = await fetch("assets/templates/contactDetailTemplate.html");
  return await response.text();
}

/**
 * Replaces the placeholders of the detail template with the data of one
 * contact.
 *
 * @param {string} template - The detail template containing the {{...}} placeholders.
 * @param {string} id - The database key of the contact, used by the edit and delete buttons.
 * @param {Object} contact - The contact to render, with name, email and phone.
 * @returns {string} The filled detail view as HTML.
 */
function fillDetailTemplate(template, id, contact) {
  return template
    .replaceAll("{{id}}", id)
    .replaceAll("{{color}}", getAvatarColor(contact.name))
    .replaceAll("{{initials}}", getInitials(contact.name))
    .replaceAll("{{name}}", contact.name)
    .replaceAll("{{email}}", contact.email)
    .replaceAll("{{phone}}", contact.phone || "");
}

/**
 * Marks the chosen card as active and removes the highlight from all other
 * cards.
 *
 * @param {string} id - The database key of the contact whose card is highlighted.
 * @returns {void}
 */
function highlightContact(id) {
  let cards = document.querySelectorAll('.contact');
  cards.forEach(card => card.classList.remove('contact-active'));
  document.getElementById('card-' + id).classList.add('contact-active');
}

/**
 * Opens the popup for creating a contact and locks the page behind it.
 *
 * @returns {Promise<void>}
 */
async function openAddContact() {
  let overlay = document.getElementById('addContactOverlay');
  overlay.innerHTML = await loadAddContactTemplate();
  overlay.classList.remove('d-none');
  lockScroll(true);
}

/**
 * Loads the template of the add contact popup.
 *
 * @returns {Promise<string>} The popup template as HTML text.
 */
async function loadAddContactTemplate() {
  let response = await fetch("assets/templates/addContactTemplate.html");
  return await response.text();
}

/**
 * Closes the add and edit popup and releases the page scroll again.
 *
 * @returns {void}
 */
function closeAddContact() {
  document.getElementById('addContactOverlay').classList.add('d-none');
  lockScroll(false);
}

/**
 * Reads the inputs of the add contact popup. The initials are derived from
 * the entered name.
 *
 * @returns {Object} The new contact with name, email, phone and initials.
 */
function getNewContact() {
  return {
    name: document.getElementById('newContactName').value.trim(),
    email: document.getElementById('newContactEmail').value.trim(),
    phone: document.getElementById('newContactPhone').value.trim(),
    initials: getInitials(document.getElementById('newContactName').value.trim())
  };
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
}

/**
 * Handler of the create button in the add popup. Saves the contact and
 * refreshes the list. Does nothing if name or email are empty.
 *
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

/**
 * Opens the edit popup, prefilled with the current values of the contact.
 *
 * @param {string} id - The database key of the contact to edit.
 * @returns {Promise<void>}
 */
async function openEditContact(id) {
  let overlay = document.getElementById('addContactOverlay');
  overlay.innerHTML = fillEditTemplate(await loadEditTemplate(), id, allContacts[id]);
  overlay.classList.remove('d-none');
  lockScroll(true);
}

/**
 * Loads the template of the edit contact popup.
 *
 * @returns {Promise<string>} The edit template as HTML text, still containing its placeholders.
 */
async function loadEditTemplate() {
  let response = await fetch("assets/templates/contactEditTemplate.html");
  return await response.text();
}

/**
 * Replaces the placeholders of the edit template with the current values of
 * the contact.
 *
 * @param {string} template - The edit template containing the {{...}} placeholders.
 * @param {string} id - The database key of the contact, used by the save button.
 * @param {Object} contact - The contact to edit, with name, email and phone.
 * @returns {string} The filled edit popup as HTML.
 */
function fillEditTemplate(template, id, contact) {
  return template
    .replaceAll("{{id}}", id)
    .replaceAll("{{color}}", getAvatarColor(contact.name))
    .replaceAll("{{initials}}", getInitials(contact.name))
    .replaceAll("{{name}}", contact.name)
    .replaceAll("{{email}}", contact.email)
    .replaceAll("{{phone}}", contact.phone || "");
}

/**
 * Reads the inputs of the edit popup. The initials are derived from the
 * entered name.
 *
 * @returns {Object} The changed contact data with name, email, phone and initials.
 */
function getEditContact() {
  return {
    name: document.getElementById('editContactName').value.trim(),
    email: document.getElementById('editContactEmail').value.trim(),
    phone: document.getElementById('editContactPhone').value.trim(),
    initials: getInitials(document.getElementById('editContactName').value.trim())
  };
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
}

/**
 * Handler of the save button in the edit popup. Stores the change and
 * refreshes both the list and the detail view. Does nothing if name or email
 * are empty.
 *
 * @param {string} id - The database key of the contact that is updated.
 * @returns {Promise<void>}
 */
async function updateContact(id) {
  let contact = getEditContact();
  if (!contact.name || !contact.email) {
    return;
  }
  await saveEditedContact(id, contact);
  closeAddContact();
  await renderContacts();
  showContactDetail(id);
  showToast("Contact successfully updated");
}

/**
 * Deletes a contact from the database, empties the detail view and refreshes
 * the list.
 *
 * @param {string} id - The database key of the contact that is deleted.
 * @returns {Promise<void>}
 */
async function deleteContact(id) {
  await fetch(BASE_URL + "contacts/" + id + ".json", { method: "DELETE" });
  closeAddContact();
  document.getElementById('contactDetail').innerHTML = "";
  closeContactDetail();
  renderContacts();
  showToast("Contact deleted");
}

