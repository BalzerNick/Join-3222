/* ============================================================
   validation.js - Gemeinsame Formularpruefung fuer Login,
   Sign-up und die Kontakt-Popups.

   Ein Formular beschreibt seine Felder als Liste von Regeln:

     [{ id: 'newContactName', validate: validateName }, ...]

   bindFormValidation() haengt daran die Pruefung beim Verlassen
   des Feldes, checkForm() prueft vor dem Speichern alles auf
   einmal. Jedes Feld braucht im HTML eine eigene Meldung mit der
   id "<feld-id>Error".
   ============================================================ */

/** Accepted email format: something@something.tld, no spaces. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

/** Accepted name format: letters, separated by single spaces, hyphens or
    apostrophes. \p{L} covers the letters of every language, so accented names
    like María, François or Łukasz are accepted as well. */
const NAME_PATTERN = /^\p{L}+(?:[ '-]\p{L}+)*$/u;

/** Accepted phone format: digits, spaces and the separators + - ( ) /. */
const PHONE_PATTERN = /^\+?[0-9 ()\/-]+$/;

/** A phone number has to hold at least this many digits. */
const PHONE_MIN_DIGITS = 6;

/** A name may be this long. The longest realistic full names reach about 38
    characters, 50 leaves room and still keeps the layout intact. */
const NAME_MAX_LENGTH = 50;

/** A password has to be at least this long. */
const PASSWORD_MIN_LENGTH = 8;


/**
 * Reads a single field. Text fields come back trimmed, so that a value made of
 * spaces only counts as empty; a checkbox comes back as its checked state.
 *
 * @param {string} id - The id of the input element.
 * @returns {string|boolean} The trimmed value, or the checked state for a checkbox.
 */
function getFieldValue(id) {
  let field = document.getElementById(id);
  if (field.type === 'checkbox') return field.checked;
  return field.value.trim();
}


/**
 * Reads all fields of a form at once, keyed by their id. Rules that compare
 * two fields, like the repeated password, get their counterpart from here.
 *
 * @param {Array<{id: string}>} fields - The field rules of the form.
 * @returns {Object<string, string|boolean>} All values of the form, keyed by field id.
 */
function getFormValues(fields) {
  let values = {};
  fields.forEach(field => values[field.id] = getFieldValue(field.id));
  return values;
}


/**
 * Shows or clears the message belonging to one field and marks the field
 * itself as invalid.
 *
 * @param {string} id - The id of the input element.
 * @param {string} message - The error text. Pass an empty string to clear it.
 * @returns {void}
 */
function showFieldError(id, message) {
  document.getElementById(id + 'Error').textContent = message;
  document.getElementById(id).classList.toggle('input-error', !!message);
}


/**
 * Validates one field and shows the result right away.
 *
 * @param {string} id - The id of the input element.
 * @param {Array<{id: string, validate: function}>} fields - The field rules of the form.
 * @returns {boolean} True if the field is valid.
 */
function checkField(id, fields) {
  let rule = fields.find(field => field.id === id);
  let message = rule.validate(getFieldValue(id), getFormValues(fields));
  showFieldError(id, message);
  return !message;
}


/**
 * Validates every field of a form and jumps to the first one that is invalid.
 *
 * @param {Array<{id: string, validate: function}>} fields - The field rules of the form.
 * @returns {boolean} True if the whole form is valid.
 */
function checkForm(fields) {
  let firstInvalid = "";
  fields.forEach(rule => {
    if (!checkField(rule.id, fields) && !firstInvalid) firstInvalid = rule.id;
  });
  if (firstInvalid) document.getElementById(firstInvalid).focus();
  return !firstInvalid;
}


/**
 * Runs when the user leaves a field: removes leading and trailing spaces from
 * the value and validates it.
 *
 * @param {{id: string}} field - The rule of the field that was left.
 * @param {Array<{id: string, validate: function}>} fields - The field rules of the form.
 * @returns {void}
 */
function handleFieldBlur(field, fields) {
  let element = document.getElementById(field.id);
  element.value = element.value.trim();
  updatePasswordIcon(field.id);
  checkField(field.id, fields);
}


/**
 * Runs while the user types: keeps a password icon up to date and makes a
 * message that is already shown disappear as soon as the input is correct.
 *
 * @param {{id: string, revalidate?: Array<string>}} field - The rule of the field being typed in.
 * @param {Array<{id: string, validate: function}>} fields - The field rules of the form.
 * @returns {void}
 */
function handleFieldInput(field, fields) {
  updatePasswordIcon(field.id);
  if (document.getElementById(field.id + 'Error').textContent) checkField(field.id, fields);
  revalidateLinkedFields(field, fields);
}


/**
 * Re-checks the fields that depend on the one just edited, for example the
 * repeated password after the first one has changed. Only fields the user has
 * already filled in are touched.
 *
 * @param {{revalidate?: Array<string>}} field - The rule of the field that was edited.
 * @param {Array<{id: string, validate: function}>} fields - The field rules of the form.
 * @returns {void}
 */
function revalidateLinkedFields(field, fields) {
  if (!field.revalidate) return;
  field.revalidate.forEach(id => {
    if (getFieldValue(id)) checkField(id, fields);
  });
}


/**
 * Hooks one field up to the validation: checkboxes react to their change
 * event, all other fields to leaving the field and to typing.
 *
 * @param {{id: string}} field - The rule of the field to hook up.
 * @param {Array<{id: string, validate: function}>} fields - The field rules of the form.
 * @returns {void}
 */
function bindFieldValidation(field, fields) {
  let element = document.getElementById(field.id);
  if (element.type === 'checkbox') {
    element.addEventListener('change', () => checkField(field.id, fields));
    return;
  }
  element.addEventListener('blur', () => handleFieldBlur(field, fields));
  element.addEventListener('input', () => handleFieldInput(field, fields));
}


/**
 * Hooks a whole form up to the validation.
 *
 * @param {Array<{id: string, validate: function}>} fields - The field rules of the form.
 * @returns {void}
 */
function bindFormValidation(fields) {
  fields.forEach(field => bindFieldValidation(field, fields));
}


/**
 * Checks a name: it has to be filled in, may be at most NAME_MAX_LENGTH
 * characters long and may only consist of letters, spaces, hyphens and
 * apostrophes.
 *
 * @param {string} value - The trimmed name.
 * @returns {string} The error text, or an empty string if the name is valid.
 */
function validateName(value) {
  if (!value) return "Please enter a name.";
  if (value.length < 2) return "The name must be at least 2 characters long.";
  if (value.length > NAME_MAX_LENGTH) return `The name may be at most ${NAME_MAX_LENGTH} characters long.`;
  if (!NAME_PATTERN.test(value)) return "The name may only contain letters.";
  return "";
}


/**
 * Checks an email address against EMAIL_PATTERN.
 *
 * @param {string} value - The trimmed email address.
 * @returns {string} The error text, or an empty string if the email is valid.
 */
function validateEmail(value) {
  if (!value) return "Please enter an email address.";
  if (!EMAIL_PATTERN.test(value)) return "Please enter a valid email address.";
  return "";
}


/**
 * Counts how many digits a value holds, so that separators alone do not pass
 * as a phone number.
 *
 * @param {string} value - The value to count in.
 * @returns {number} The number of digits.
 */
function countDigits(value) {
  return (value.match(/\d/g) || []).length;
}


/**
 * Checks a phone number: digits and the usual separators only, and enough
 * digits to be a real number.
 *
 * @param {string} value - The trimmed phone number.
 * @returns {string} The error text, or an empty string if the number is valid.
 */
function validatePhone(value) {
  if (!value) return "Please enter a phone number.";
  if (!PHONE_PATTERN.test(value)) return "The phone number may only contain digits, spaces and + - ( ).";
  if (countDigits(value) < PHONE_MIN_DIGITS) return "Please enter at least " + PHONE_MIN_DIGITS + " digits.";
  return "";
}


/**
 * Checks whether the password reaches the required minimum length.
 *
 * @param {string} password - The password entered in the form.
 * @returns {boolean} True if the password is long enough.
 */
function isPasswordLongEnough(password) {
  return password.length >= PASSWORD_MIN_LENGTH;
}


/**
 * Checks a password: filled in and long enough.
 *
 * @param {string} value - The trimmed password.
 * @returns {string} The error text, or an empty string if the password is valid.
 */
function validatePassword(value) {
  if (!value) return "Please enter a password.";
  if (!isPasswordLongEnough(value)) return "Your password must be at least " + PASSWORD_MIN_LENGTH + " characters long.";
  return "";
}


/**
 * Picks the icon of a password field: a lock while the field is empty,
 * otherwise the eye that shows the current state.
 *
 * @param {HTMLInputElement} field - The password field.
 * @returns {string} The path of the icon to display.
 */
function getPasswordIconSrc(field) {
  if (!field.value) return 'assets/icons/lock.png';
  if (field.type === 'password') return 'assets/icons/visibility_off.png';
  return 'assets/icons/visibility.png';
}


/**
 * Brings icon and toggle button of a password field in line with its current
 * state. Fields without a toggle button are ignored.
 *
 * @param {string} id - The id of the password field.
 * @returns {void}
 */
function updatePasswordIcon(id) {
  let toggle = document.getElementById(id + 'Toggle');
  if (!toggle) return;
  let field = document.getElementById(id);
  if (!field.value) field.type = 'password';
  toggle.disabled = !field.value;
  toggle.setAttribute('aria-label', field.type === 'password' ? 'Show password' : 'Hide password');
  document.getElementById(id + 'Icon').src = getPasswordIconSrc(field);
}


/**
 * Handler of the eye icon. Switches a password field between hidden and
 * readable text.
 *
 * @param {string} id - The id of the password field.
 * @returns {void}
 */
function togglePassword(id) {
  let field = document.getElementById(id);
  field.type = field.type === 'password' ? 'text' : 'password';
  updatePasswordIcon(id);
}
