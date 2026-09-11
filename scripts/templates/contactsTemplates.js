/**
 * Builds one contact card for the list.
 *
 * @param {Object} contact - The contact to render, including its id, name, email and initials.
 * @returns {string} The contact card as HTML.
 */
function getContactCardTemplate(contact) {
    return `
        <div class="contact" id="card-${contact.id}" onclick="showContactDetail('${contact.id}')">
            <div class="avatar" style="background-color: ${getAvatarColor(contact.name)}">${contact.initials}</div>
            <div class="contact-info">
                <span class="contact-name" title="${contact.name}">${contact.name}</span>
                <span class="contact-email" title="${contact.email}">${contact.email}</span>
            </div>
        </div>
    `;
}

/**
 * Builds the letter separator shown before the first contact of each letter group.
 *
 * @param {string} letter - The letter to display.
 * @returns {string} The separator as HTML.
 */
function getContactLetterTemplate(letter) {
    return `<h2 class="contact-letter">${letter}</h2>`;
}

/**
 * Builds the detail view of one contact, shown on the right hand side.
 *
 * @param {string} id - The database key of the contact.
 * @param {Object} contact - The contact to render, with name, email, phone and initials.
 * @returns {string} The detail view as HTML.
 */
function getContactDetailTemplate(id, contact) {
    return `
        <div class="detail-card">
            <div class="detail-head">
                <div class="avatar avatar-lg" style="background-color: ${getAvatarColor(contact.name)}">${contact.initials}</div>
                <div class="detail-head-text">
                    <h2 class="detail-name ${getNameSizeClass(contact.name)}">${contact.name}</h2>
                    <div class="detail-actions">
                        <button class="detail-action" type="button" onclick="openEditContact('${id}')"><img src="assets/icons/edit.svg" alt="" class="icon-18">Edit</button>
                        <button class="detail-action" type="button" onclick="deleteContact('${id}')"><img src="assets/icons/delete.svg" alt="" class="icon-18">Delete</button>
                    </div>
                </div>
            </div>

            <p class="detail-label">Contact Information</p>
            <p class="detail-line"><strong>Email</strong><br><a href="mailto:${contact.email}">${contact.email}</a></p>
            <p class="detail-line"><strong>Phone</strong><br>${contact.phone || ""}</p>

            <!-- Nur mobil sichtbar: oeffnet Edit/Delete als schwebendes Menue -->
            <button class="detail-menu-btn" type="button" onclick="toggleContactMenu()">
                <img src="assets/icons/more_vert.svg" alt="Options">
            </button>
        </div>
    `;
}

/**
 * Builds the "Add contact" popup.
 *
 * @returns {string} The popup as HTML.
 */
function getAddContactTemplate() {
    return `
        <div class="contact-modal">
            <img src="assets/icons/close.svg" alt="Close" class="modal-close" onclick="closeAddContact()">

            <div class="contact-modal-left">
                <img src="assets/imgs/logoMain.png" alt="Join Logo" class="modal-logo">
                <h2 class="modal-title">Add contact</h2>
                <p class="modal-subtitle">Tasks are better with a team!</p>
                <span class="modal-underline"></span>
            </div>

            <div class="contact-modal-right">
                <div class="avatar avatar-xl avatar-placeholder"><img src="assets/icons/person_add.svg" alt=""></div>
                <form class="modal-form" novalidate>
                    <div class="input-field">
                        <input class="input" type="text" id="newContactName" maxlength="50" placeholder="Name" autocomplete="name">
                        <span id="newContactNameError" class="field-error"></span>
                    </div>
                    <div class="input-field">
                        <input class="input" type="email" id="newContactEmail" placeholder="Email" autocomplete="email">
                        <span id="newContactEmailError" class="field-error"></span>
                    </div>
                    <div class="input-field">
                        <input class="input" type="tel" id="newContactPhone" placeholder="Phone" inputmode="tel" autocomplete="tel"
                            pattern="\\+?[0-9]*" maxlength="20" oninput="filterPhoneInput(this)">
                        <span id="newContactPhoneError" class="field-error"></span>
                    </div>
                    <div class="add-contact-buttons">
                        <button class="btn btn-secondary btn-cancel" type="button" onclick="closeAddContact()">Cancel</button>
                        <button class="btn btn-primary" type="button" onclick="createContact()">Create contact<img src="assets/icons/check.svg" alt="" class="btn-check"></button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

/**
 * Builds the "Edit contact" popup, prefilled with the current contact data.
 *
 * @param {string} id - The database key of the contact.
 * @param {Object} contact - The contact to edit, with name, email, phone and initials.
 * @returns {string} The popup as HTML.
 */
function getEditContactTemplate(id, contact) {
    return `
        <div class="contact-modal">
            <img src="assets/icons/close.svg" alt="Close" class="modal-close" onclick="closeAddContact()">

            <div class="contact-modal-left">
                <img src="assets/imgs/logoMain.png" alt="Join Logo" class="modal-logo">
                <h2 class="modal-title">Edit contact</h2>
                <span class="modal-underline"></span>
            </div>

            <div class="contact-modal-right">
                <div class="avatar avatar-xl" style="background-color: ${getAvatarColor(contact.name)}">${contact.initials}</div>
                <form class="modal-form" novalidate>
                    <div class="input-field">
                        <input class="input" type="text" id="editContactName" maxlength="50" value="${contact.name}" autocomplete="name">
                        <span id="editContactNameError" class="field-error"></span>
                    </div>
                    <div class="input-field">
                        <input class="input" type="email" id="editContactEmail" value="${contact.email}" autocomplete="email">
                        <span id="editContactEmailError" class="field-error"></span>
                    </div>
                    <div class="input-field">
                        <input class="input" type="tel" id="editContactPhone" value="${contact.phone || ""}" inputmode="tel" autocomplete="tel"
                            pattern="\\+?[0-9]*" maxlength="20" oninput="filterPhoneInput(this)">
                        <span id="editContactPhoneError" class="field-error"></span>
                    </div>
                    <div class="add-contact-buttons">
                        <button class="btn btn-secondary" type="button" onclick="deleteContact('${id}')">Delete</button>
                        <button class="btn btn-primary" type="button" onclick="updateContact('${id}')">Save<img src="assets/icons/check.svg" alt="" class="btn-check"></button>
                    </div>
                </form>
            </div>
        </div>
    `;
}
