/**
 * Shows a short message that floats in from the top centre of the page and
 * disappears again on its own. Available on every page.
 *
 * @param {string} message - The text that is displayed inside the toast.
 * @param {number} [duration=2000] - How long the message stays visible, in milliseconds.
 * @returns {void}
 */
function showToast(message, duration = 2000) {
  let toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('toast-visible');
  setTimeout(() => toast.classList.remove('toast-visible'), duration);
}

/**
 * Locks or releases scrolling of the page behind an open overlay.
 *
 * @param {boolean} locked - Pass true to lock scrolling, false to release it again.
 * @returns {void}
 */
function lockScroll(locked) {
  document.documentElement.classList.toggle('no-scroll', locked);
  document.body.classList.toggle('no-scroll', locked);
}

/**
 * Builds the initials of a name from its first and its last word, for
 * example "Anna Schmidt" becomes "AS".
 *
 * @param {string} name - The full name of the person. Must not be empty.
 * @returns {string} The initials in upper case.
 */
function getInitials(name) {
  let parts = name.split(" ");
  let first = parts[0][0];
  let last = parts[parts.length - 1][0];
  return (first + last).toUpperCase();
}

// Colour palette for the avatars (picked deterministically per name).
const AVATAR_COLORS = [
  "#FF7A00", "#FF5EB3", "#6E52FF", "#9327FF", "#00BEE8",
  "#1FD7C1", "#FF745E", "#FFA35E", "#FC71FF", "#FFC701",
  "#0038FF", "#C3FF2B", "#FFE62B", "#FF4646", "#FFBB2B"
];

/**
 * Picks a fixed colour from the palette by summing up the character codes of
 * the name. The same name always yields the same colour, which keeps avatars
 * consistent across all pages.
 *
 * @param {string} name - The name of the contact the avatar belongs to.
 * @returns {string} A hex colour value from AVATAR_COLORS, for example "#FF7A00".
 */
function getAvatarColor(name) {
  let sum = 0;
  for (let char of name) {
    sum += char.charCodeAt(0);
  }
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

/**
 * Writes the initials of the logged in user into the avatar in the header.
 * Guests get a "G". Does nothing if the element is missing or nobody is
 * logged in. Runs once when this file is loaded.
 *
 * @returns {void}
 */
function renderUserInitials() {
  // let name = "Anton Axt";  // TODO: use the actually logged in user
  let el = document.getElementById("userInitials");
  if (!el) return;
  let userData = localStorage.getItem("user");
  if (!userData) return;
  let user = JSON.parse(userData);
  if (user.guest) {
    el.textContent = "G";
    return;
  }
  let name = user.name || "User"; // Fallback in case the name is missing
  let initials = getInitials(name);
  el.textContent = initials;
}

renderUserInitials();

/**
 * Ends the session by removing the user from localStorage and returning to
 * the login page.
 *
 * @returns {void}
 */
function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

/**
 * Opens or closes the dropdown menu behind the avatar in the header.
 *
 * @returns {void}
 */
function toggleUserMenu() {
  document.getElementById("userMenu").classList.toggle("open");
}

/**
 * Closes the user menu when the click happened outside of it. Bound to the
 * document, so a click anywhere on the page dismisses the menu.
 *
 * @param {Event} event - The click event, used to find out what was clicked.
 * @returns {void}
 */
function closeUserMenu(event) {
  let menu = document.getElementById("userMenu");
  if (menu && !menu.contains(event.target)) {
    menu.classList.remove("open");
  }
}

/**
 * Stops the event from bubbling up. Used on elements inside an overlay so
 * that a click on them does not trigger the close handler of the overlay.
 *
 * @param {Event} event - The event whose propagation is stopped.
 * @returns {void}
 */
function noEvent(event){
    event.stopPropagation();
}

/* ============================================================
   Leerzeichen-Schutz fuer Eingabefelder

   Verhindert, dass ein Feld mit einem Leerzeichen beginnt, dass
   mehrere Leerzeichen hintereinander stehen und dass E-Mail- oder
   Passwortfelder ueberhaupt ein Leerzeichen enthalten. Die Regeln
   greifen beim Tippen, beim Einfuegen und beim Speichern.
   ============================================================ */

/** Field types the space guard watches. Date, checkbox and the like are left alone. */
const SPACE_GUARD_TYPES = ['text', 'search', 'email', 'password', 'tel', 'url'];

/** Field types that must not hold a single space anywhere. */
const NO_SPACE_TYPES = ['email', 'password'];


/**
 * Tells whether an element is a text field the space guard applies to.
 *
 * @param {EventTarget} element - The element the event came from.
 * @returns {boolean} True if the element is a guarded input or textarea.
 */
function isSpaceGuarded(element) {
  if (!element || !element.tagName) return false;
  if (element.tagName === 'TEXTAREA') return true;
  return element.tagName === 'INPUT' && SPACE_GUARD_TYPES.includes(element.type);
}


/**
 * Tells whether a field may hold spaces between words. Names, titles and
 * subtasks may, e-mail addresses and passwords may not.
 *
 * @param {HTMLElement} field - The input or textarea to ask about.
 * @returns {boolean} True if single spaces inside the value are allowed.
 */
function allowsInnerSpaces(field) {
  return !NO_SPACE_TYPES.includes(field.type);
}


/**
 * Removes the spaces that are not allowed in a value: either every space, or
 * the leading ones and every repetition. A single space at the end stays, so
 * that a space between two words can still be typed. Line breaks are kept.
 *
 * @param {string} value - The raw value of the field.
 * @param {boolean} [allowInner=true] - False strips every space instead.
 * @returns {string} The cleaned value.
 */
function cleanSpaces(value, allowInner = true) {
  if (!allowInner) return value.replace(/\s+/g, '');
  return value.replace(/^ +/, '').replace(/ {2,}/g, ' ');
}


/**
 * Tells whether a space pressed right now would be allowed: never in a
 * no-space field, and never at the start or behind another space.
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} field - The focused field.
 * @returns {boolean} True if the space may be typed.
 */
function isSpaceKeyAllowed(field) {
  if (!allowsInnerSpaces(field)) return false;
  let caret = field.selectionStart ?? field.value.length;
  let before = field.value.slice(0, caret);
  return before.length > 0 && !before.endsWith(' ');
}


/**
 * Puts the caret back where it was after a value has been cleaned. Fields
 * without selection support, for example e-mail fields, are skipped.
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} field - The cleaned field.
 * @param {number} position - The position the caret should end up at.
 * @returns {void}
 */
function restoreCaret(field, position) {
  if (field.selectionStart === null) return;
  field.setSelectionRange(position, position);
}


/**
 * Cleans the value of a field and keeps the caret in place. Catches whatever
 * the keyboard did not block, above all pasted text.
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} field - The field to clean.
 * @returns {void}
 */
function applySpaceRules(field) {
  let cleaned = cleanSpaces(field.value, allowsInnerSpaces(field));
  if (cleaned === field.value) return;
  let caret = (field.selectionStart ?? field.value.length) - (field.value.length - cleaned.length);
  field.value = cleaned;
  restoreCaret(field, Math.max(caret, 0));
}


/**
 * Swallows the space bar in a guarded field whenever the space would not be
 * allowed at the current position.
 *
 * @param {KeyboardEvent} event - The key event of the pressed key.
 * @returns {void}
 */
function handleSpaceKey(event) {
  if (event.key !== ' ') return;
  if (!isSpaceGuarded(event.target)) return;
  if (isSpaceKeyAllowed(event.target)) return;
  event.preventDefault();
}


/**
 * Cleans a guarded field after its content has changed.
 *
 * @param {Event} event - The input event of the changed field.
 * @returns {void}
 */
function handleSpaceInput(event) {
  if (!isSpaceGuarded(event.target)) return;
  applySpaceRules(event.target);
}

document.addEventListener('keydown', handleSpaceKey, true);
document.addEventListener('input', handleSpaceInput, true);
