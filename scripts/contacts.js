// Wird beim Laden der Seite aufgerufen (body onload).
async function renderContacts() {
  let contacts = await loadContacts();
  let template = await loadTemplate();
  showContacts(contacts, template);
}


// Laedt alle Kontakte aus Firebase.
async function loadContacts() {
  let response = await fetch(BASE_URL + "contacts.json");
  return await response.json();
}


// Laedt die Karten-Vorlage als Text.
async function loadTemplate() {
  let response = await fetch("assets/templates/contactsTemplate.html");
  return await response.text();
}


// Baut fuer jeden Kontakt eine Karte und schreibt sie in die Liste.
function showContacts(contacts, template) {
  let list = document.getElementById('contactList');
  list.innerHTML = "";
  for (let id in contacts) {
    list.innerHTML += fillTemplate(template, contacts[id]);
  }
}


// Ersetzt die Platzhalter in der Vorlage durch die Kontaktdaten.
function fillTemplate(template, contact) {
  return template
    .replaceAll("{{initials}}", getInitials(contact.name))
    .replaceAll("{{name}}", contact.name)
    .replaceAll("{{email}}", contact.email);
}


// Bildet die Initialen aus dem Namen (z.B. "Anna Schmidt" -> "AS").
function getInitials(name) {
  let parts = name.split(" ");
  let first = parts[0][0];
  let last = parts[parts.length - 1][0];
  return (first + last).toUpperCase();
}


// Oeffnet das Popup zum Anlegen eines Kontakts.
async function openAddContact() {
  let overlay = document.getElementById('addContactOverlay');
  overlay.innerHTML = await loadAddContactTemplate();
  overlay.classList.remove('d-none');
}


// Laedt die Popup-Vorlage als Text.
async function loadAddContactTemplate() {
  let response = await fetch("assets/templates/addContactTemplate.html");
  return await response.text();
}


// Schliesst das Popup.
function closeAddContact() {
  document.getElementById('addContactOverlay').classList.add('d-none');
}


// Liest die Eingaben aus dem Popup.
function getNewContact() {
  return {
    name: document.getElementById('newContactName').value.trim(),
    email: document.getElementById('newContactEmail').value.trim(),
    phone: document.getElementById('newContactPhone').value.trim()
  };
}


// Speichert einen neuen Kontakt im Backend (POST erzeugt eine ID).
async function saveContact(contact) {
  await fetch(BASE_URL + "contacts.json", {
    method: "POST",
    body: JSON.stringify(contact)
  });
}


// Liest die Eingaben, speichert den Kontakt und aktualisiert die Liste.
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
