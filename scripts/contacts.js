// Cache of the loaded contacts (used by the detail and edit views).
let allContacts = {};

/**
 * Remembers whether the running mouse gesture started on the dim background.
 * Without it a text selection that is dragged out of an input and released
 * next to the popup would count as a click on the background.
 *
 * @type {boolean}
 */
let backdropPressed = false;

/**
 * The fields of the add contact popup with their validation rules. Both popups
 * check the same three things, they only differ in the ids of their inputs.
 *
 * @type {Array<{id: string, validate: function}>}
 */
const newContactFields = [
  { id: 'newContactName', validate: validateName },
  { id: 'newContactEmail', validate: validateEmail },
  { id: 'newContactPhone', validate: validatePhone }
];

/**
 * The fields of the edit contact popup with their validation rules.
 *
 * @type {Array<{id: string, validate: function}>}
 */
const editContactFields = [
  { id: 'editContactName', validate: validateName },
  { id: 'editContactEmail', validate: validateEmail },
  { id: 'editContactPhone', validate: validatePhone }
];

/**
 * Loads the contacts and both templates and renders the grouped list.
 * Called by initContacts() and after every change to a contact.
 *
 * The contacts normally come from the sessionStorage, where getContacts()
 * puts them once at the start of the session. If that cache is empty, for
 * example because the page was opened directly by its url or in a new tab,
 * they are fetched from the database first. Same safety net as in board.js.
 *
 * @returns {Promise<void>}
 */
async function renderContacts() {
  if (!getContactStorage()) await getContacts();
  allContacts = getContactStorage() || {};
  let card = await loadHtmlTemplate("assets/templates/contactsTemplate.html");
  let letter = await loadHtmlTemplate("assets/templates/contactLetterTemplate.html");
  showContacts(allContacts, card, letter);
}

/**
 * TOTER CODE (markiert am 2026-08-20, Denis) - wird nirgends aufgerufen.
 * Ersetzt durch getContacts() in scripts/api.js, das zusaetzlich
 * setContactStorage() aufruft und die Kontakte im sessionStorage ablegt.
 * Einzige verbliebene Fundstelle: auskommentiert in scripts/board.js.
 * Bleibt vorerst stehen, falls sie noch jemand braucht - bitte vor dem
 * Loeschen kurz Bescheid geben.
 *
 * @deprecated Stattdessen getContacts() aus scripts/api.js verwenden.
 *
 * Loads all contacts from the Firebase database.
 *
 * @returns {Promise<?Object>} All contacts keyed by their id, or null if the database holds none.
 */
async function loadContacts() {
  let response = await fetch(baseUrl + "contacts.json");

  return await response.json();
}

/**
 * Loads an HTML template from the templates folder. Used by the contact list
 * and by every popup of the contacts page.
 *
 * @param {string} path - Path of the template file relative to the project root.
 * @returns {Promise<string>} The template as HTML text, still containing its placeholders.
 */
async function loadHtmlTemplate(path) {
  let response = await fetch(path);
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
  let template = await loadHtmlTemplate("assets/templates/contactDetailTemplate.html");
  let detail = document.getElementById('contactDetail');
  detail.innerHTML = fillDetailTemplate(template, id, allContacts[id]);
  highlightContact(id);
  document.querySelector('.contacts-main').classList.add('detail-open');
}

/**
 * Returns from the detail view back to the contact list and clears the card
 * highlight. Bound to the back arrow that is only visible on mobile.
 *
 * cla@returns {void}
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
    .replaceAll("{{initials}}", contact.initials)
    .replaceAll("{{nameSize}}", getNameSizeClass(contact.name))
    .replaceAll("{{name}}", contact.name)
    .replaceAll("{{email}}", contact.email)
    .replaceAll("{{phone}}", contact.phone || "");
}

/**
 * Returns the CSS modifier class that keeps a long contact name readable in
 * the detail view. Long names are rendered one or two steps smaller so they
 * wrap into fewer lines instead of filling the whole card.
 *
 * @param {string} name - The full name of the contact.
 * @returns {string} "" for short names, otherwise a detail-name-* class.
 */
function getNameSizeClass(name) {
  if (name.length > 32) return "detail-name-xs";
  if (name.length > 20) return "detail-name-sm";
  return "";
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
  overlay.innerHTML = await loadHtmlTemplate("assets/templates/addContactTemplate.html");
  overlay.classList.remove('overlay-closing', 'd-none');
  bindFormValidation(newContactFields);
  lockScroll(true);
}

/**
 * Starts closing the add and edit popup. The popup flies out to the right
 * first, hiding and scroll release happen in finishAddContactClose().
 *
 * @returns {void}
 */
function closeAddContact() {
  let overlay = document.getElementById('addContactOverlay');
  if (overlay.classList.contains('d-none')) return;
  if (overlay.classList.contains('overlay-closing')) return;
  overlay.classList.add('overlay-closing');
  overlay.addEventListener('animationend', finishAddContactClose);
}

/**
 * Hides the popup once its closing animation has finished and gives the page
 * its scrolling back.
 *
 * @param {AnimationEvent} event - The animationend event of the overlay.
 * @returns {void}
 */
function finishAddContactClose(event) {
  let overlay = event.currentTarget;
  if (event.target !== overlay) return;
  overlay.removeEventListener('animationend', finishAddContactClose);
  if (!overlay.classList.contains('overlay-closing')) return;
  overlay.classList.remove('overlay-closing');
  overlay.classList.add('d-none');
  lockScroll(false);
}

/**
 * Notes whether a mouse press landed on the dim background and not inside the
 * popup itself.
 *
 * @param {MouseEvent} event - The mousedown event of the overlay.
 * @returns {void}
 */
function pressAddContactBackdrop(event) {
  backdropPressed = event.target === event.currentTarget;
}

/**
 * Closes the popup when the click happened next to it, on the dim background.
 * Presses that started inside the popup are ignored.
 *
 * @param {MouseEvent} event - The click event of the overlay.
 * @returns {void}
 */
function clickAddContactBackdrop(event) {
  if (!backdropPressed) return;
  if (event.target !== event.currentTarget) return;
  closeAddContact();
}

/**
 * Reads the inputs of the add contact popup. The initials are derived from
 * the entered name.
 *
 * @returns {Object} The new contact with name, email, phone and initials.
 */
function getNewContact() {
  let name = getFieldValue('newContactName');
  return {
    name: name,
    email: getFieldValue('newContactEmail'),
    phone: getFieldValue('newContactPhone'),
    initials: getInitials(name)
  };
}



/**
 * Handler of the create button in the add popup. Validates the form, saves the
 * contact and refreshes the list. Invalid fields keep the popup open and show
 * their message.
 *
 * @returns {Promise<void>}
 */
async function createContact() {
  if (!checkForm(newContactFields)) return;
  let contact = getNewContact();
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
  let editTpl = await loadHtmlTemplate("assets/templates/contactEditTemplate.html");
  overlay.innerHTML = fillEditTemplate(editTpl, id, allContacts[id]);
  overlay.classList.remove('overlay-closing', 'd-none');
  bindFormValidation(editContactFields);
  lockScroll(true);
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
    .replaceAll("{{initials}}", contact.initials)
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
  let name = getFieldValue('editContactName');
  return {
    name: name,
    email: getFieldValue('editContactEmail'),
    phone: getFieldValue('editContactPhone'),
    initials: getInitials(name)
  };
}

/**
 * Handler of the save button in the edit popup. Validates the form, stores the
 * change and refreshes both the list and the detail view. Invalid fields keep
 * the popup open and show their message.
 *
 * @param {string} id - The database key of the contact that is updated.
 * @returns {Promise<void>}
 */
async function updateContact(id) {
  if (!checkForm(editContactFields)) return;
  let contact = getEditContact();
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
  await deleteContacts(id);
  closeAddContact();
  document.getElementById('contactDetail').innerHTML = "";
  closeContactDetail();
  renderContacts();
  showToast("Contact deleted");
}



/**
 * Entry point of the contacts page. Draws the contact list.
 *
 * @returns {void}
 */
function initContacts() {
  renderContacts();
}

document.addEventListener('DOMContentLoaded', initContacts);
