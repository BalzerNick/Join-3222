Test// Zwischenspeicher der geladenen Kontakte (fuer Detailansicht/Bearbeiten).
let allContacts = {};

// Farbpalette fuer die Avatare (deterministisch pro Name gewaehlt).
const AVATAR_COLORS = [
  "#FF7A00", "#FF5EB3", "#6E52FF", "#9327FF", "#00BEE8",
  "#1FD7C1", "#FF745E", "#FFA35E", "#FC71FF", "#FFC701",
  "#0038FF", "#C3FF2B", "#FFE62B", "#FF4646", "#FFBB2B"
];


/**
 * Wird beim Laden der Seite aufgerufen (body onload). Rendert die Kontaktliste.
 * @returns {Promise<void>}
 */
async function renderContacts() {
  allContacts = await loadContacts() || {};
  let card = await loadTemplate();
  let letter = await loadLetterTemplate();
  showContacts(allContacts, card, letter);
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
 * Laedt die Buchstaben-Vorlage als Text.
 * @returns {Promise<string>} Die Buchstaben-Vorlage als HTML-Text.
 */
async function loadLetterTemplate() {
  let response = await fetch("assets/templates/contactLetterTemplate.html");
  return await response.text();
}


/**
 * Wandelt das Kontakt-Objekt in ein alphabetisch sortiertes Array um.
 * @param {Object} contacts - Die Kontakte als ID-Objekt.
 * @returns {Array<Object>} Die nach Name sortierten Kontakte inklusive id.
 */
function sortContacts(contacts) {
  let list = Object.keys(contacts).map(id => ({ id, ...contacts[id] }));
  list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}


/**
 * Baut das HTML mit Buchstaben-Gruppen und Kontaktkarten.
 * @param {Array<Object>} sorted - Die sortierten Kontakte.
 * @param {string} card - Die Kartenvorlage.
 * @param {string} letterTpl - Die Buchstaben-Vorlage.
 * @returns {string} Das fertige Listen-HTML.
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
 * Sortiert, gruppiert und schreibt die Kontakte in die Liste.
 * @param {Object} contacts - Die Kontakte als ID-Objekt.
 * @param {string} card - Die Kartenvorlage.
 * @param {string} letterTpl - Die Buchstaben-Vorlage.
 * @returns {void}
 */
function showContacts(contacts, card, letterTpl) {
  let list = document.getElementById('contactList');
  list.innerHTML = buildContactsHtml(sortContacts(contacts), card, letterTpl);
}


/**
 * Ersetzt die Platzhalter in der Kartenvorlage durch die Kontaktdaten.
 * @param {string} template - Die Vorlage mit Platzhaltern.
 * @param {{id: string, name: string, email: string}} contact - Ein Kontakt.
 * @returns {string} Die gefuellte Karte als HTML.
 */
function fillTemplate(template, contact) {
  return template
    .replaceAll("{{id}}", contact.id)
    .replaceAll("{{color}}", getAvatarColor(contact.name))
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
 * Waehlt anhand des Namens eine feste Farbe aus der Palette.
 * @param {string} name - Der Name des Kontakts.
 * @returns {string} Ein Hex-Farbwert.
 */
function getAvatarColor(name) {
  let sum = 0;
  for (let char of name) {
    sum += char.charCodeAt(0);
  }
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}


/**
 * Zeigt die Detailansicht eines Kontakts rechts an und markiert die Karte.
 * @param {string} id - Die ID des Kontakts.
 * @returns {Promise<void>}
 */
async function showContactDetail(id) {
  let template = await loadDetailTemplate();
  let detail = document.getElementById('contactDetail');
  detail.innerHTML = fillDetailTemplate(template, id, allContacts[id]);
  highlightContact(id);
}


/**
 * Laedt die Detail-Vorlage als Text.
 * @returns {Promise<string>} Die Detail-Vorlage als HTML-Text.
 */
async function loadDetailTemplate() {
  let response = await fetch("assets/templates/contactDetailTemplate.html");
  return await response.text();
}


/**
 * Ersetzt die Platzhalter in der Detail-Vorlage.
 * @param {string} template - Die Detail-Vorlage.
 * @param {string} id - Die ID des Kontakts.
 * @param {{name: string, email: string, phone: string}} contact - Der Kontakt.
 * @returns {string} Die gefuellte Detailansicht als HTML.
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
 * Markiert die gewaehlte Karte aktiv und entfernt die Markierung der anderen.
 * @param {string} id - Die ID des aktiven Kontakts.
 * @returns {void}
 */
function highlightContact(id) {
  let cards = document.querySelectorAll('.contact');
  cards.forEach(card => card.classList.remove('contact-active'));
  document.getElementById('card-' + id).classList.add('contact-active');
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
 * Laedt die Add-Popup-Vorlage als Text.
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
 * Liest die Eingaben aus dem Add-Popup.
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


/**
 * Oeffnet das Popup zum Bearbeiten mit den aktuellen Werten des Kontakts.
 * @param {string} id - Die ID des Kontakts.
 * @returns {Promise<void>}
 */
async function openEditContact(id) {
  let overlay = document.getElementById('addContactOverlay');
  overlay.innerHTML = fillEditTemplate(await loadEditTemplate(), id, allContacts[id]);
  overlay.classList.remove('d-none');
}


/**
 * Laedt die Edit-Popup-Vorlage als Text.
 * @returns {Promise<string>} Die Edit-Vorlage als HTML-Text.
 */
async function loadEditTemplate() {
  let response = await fetch("assets/templates/contactEditTemplate.html");
  return await response.text();
}


/**
 * Ersetzt die Platzhalter in der Edit-Vorlage durch die aktuellen Werte.
 * @param {string} template - Die Edit-Vorlage.
 * @param {string} id - Die ID des Kontakts.
 * @param {{name: string, email: string, phone: string}} contact - Der Kontakt.
 * @returns {string} Die gefuellte Edit-Vorlage als HTML.
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
 * Liest die Eingaben aus dem Edit-Popup.
 * @returns {{name: string, email: string, phone: string}} Die geaenderten Daten.
 */
function getEditContact() {
  return {
    name: document.getElementById('editContactName').value.trim(),
    email: document.getElementById('editContactEmail').value.trim(),
    phone: document.getElementById('editContactPhone').value.trim()
  };
}


/**
 * Ueberschreibt einen bestehenden Kontakt im Backend (PUT).
 * @param {string} id - Die ID des Kontakts.
 * @param {{name: string, email: string, phone: string}} contact - Die neuen Daten.
 * @returns {Promise<void>}
 */
async function saveEditedContact(id, contact) {
  await fetch(BASE_URL + "contacts/" + id + ".json", {
    method: "PUT",
    body: JSON.stringify(contact)
  });
}


/**
 * Liest die Eingaben, speichert die Aenderung und aktualisiert Liste + Detail.
 * @param {string} id - Die ID des Kontakts.
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
 * Loescht einen Kontakt im Backend und leert die Detailansicht.
 * @param {string} id - Die ID des Kontakts.
 * @returns {Promise<void>}
 */
async function deleteContact(id) {
  await fetch(BASE_URL + "contacts/" + id + ".json", { method: "DELETE" });
  closeAddContact();
  document.getElementById('contactDetail').innerHTML = "";
  renderContacts();
  showToast("Contact deleted");
}
