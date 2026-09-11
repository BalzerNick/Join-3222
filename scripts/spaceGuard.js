/**
 * Tells whether an element is a text field the space guard applies to.
 *
 * @param {EventTarget} element - The element the event came from.
 * @returns {boolean} True if the element is a guarded input or textarea.
 */
function isSpaceGuarded(element) {
  if (!element || !element.tagName) return false;
  if (element.tagName === 'TEXTAREA') return true;
  return element.tagName === 'INPUT' && spaceGuardTypes.includes(element.type);
}

/**
 * Tells whether a field may hold spaces between words. Names, titles and
 * subtasks may, e-mail addresses and passwords may not.
 *
 * @param {HTMLElement} field - The input or textarea to ask about.
 * @returns {boolean} True if single spaces inside the value are allowed.
 */
function allowsInnerSpaces(field) {
  return !noSpaceTypes.includes(field.type);
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
 * Shows or clears the "no spaces allowed" message of a field, if it has one.
 *
 * @param {HTMLElement} field - The field a space was typed into.
 * @param {boolean} blocked - True if a space was just removed from it.
 * @returns {void}
 */
function showSpaceError(field, blocked) {
  let errorSpan = document.getElementById(field.id + 'Error');
  if (errorSpan) errorSpan.textContent = blocked ? 'Spaces are not allowed here.' : '';
  field.classList.toggle('input-error', blocked);
}

/**
 * Cleans a guarded field on every keystroke (and on paste). Fields that may
 * not contain spaces at all get an error message when a space is caught.
 *
 * @param {Event} event - The input event of the changed field.
 * @returns {void}
 */
function handleSpaceInput(event) {
  let field = event.target;
  if (!isSpaceGuarded(field)) return;
  let blocked = !allowsInnerSpaces(field) && /\s/.test(field.value);
  field.value = cleanSpaces(field.value, allowsInnerSpaces(field));
  showSpaceError(field, blocked);
}
/**
 * Registers the space guard for the whole page. Runs in the bubble phase, not
 * capture, so it fires after validation.js's own listener - otherwise that
 * would clear our "no spaces" message again within the same input event.
 *
 * @returns {void}
 */
function initSpaceGuard() {
  document.addEventListener('input', handleSpaceInput);
}

document.addEventListener('DOMContentLoaded', initSpaceGuard);
