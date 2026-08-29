/* ============================================================
   spaceGuard.js - Leerzeichen-Schutz fuer Eingabefelder

   Verhindert, dass ein Feld mit einem Leerzeichen beginnt, dass
   mehrere Leerzeichen hintereinander stehen und dass E-Mail- oder
   Passwortfelder ueberhaupt ein Leerzeichen enthalten. Die Regeln
   greifen beim Tippen, beim Einfuegen und beim Speichern.

   Die beiden Listener am Ende der Datei haengen am document und
   arbeiten in der Capture-Phase. Dadurch gelten die Regeln auch
   fuer Felder, die es beim Laden der Seite noch gar nicht gibt,
   etwa das Add-Contact-Popup oder die Subtask-Edit-Felder.

   cleanSpaces() und allowsInnerSpaces() sind die oeffentliche
   Schnittstelle der Datei und werden von validation.js und
   tasks.js beim Speichern mitbenutzt.
   ============================================================ */


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
