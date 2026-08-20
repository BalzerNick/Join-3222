/** Accepted email format: something@something.tld, no spaces. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

/** Accepted name format: letters, separated by single spaces, hyphens or apostrophes. */
const NAME_PATTERN = /^[a-zA-ZÄÖÜäöüß]+(?:[ '-][a-zA-ZÄÖÜäöüß]+)*$/;

/**
 * All fields of the registration form in form order, each with the rule that
 * validates it. Used for the blur validation as well as for the final check
 * on submit.
 *
 * @type {Array<{id: string, validate: function(*, Object): string}>}
 */
const SIGNUP_FIELDS = [
  { id: 'signupName', validate: validateName },
  { id: 'signupEmail', validate: validateEmail },
  { id: 'signupPassword', validate: validatePassword },
  { id: 'signupConfirm', validate: validateConfirm },
  { id: 'acceptPrivacy', validate: validatePrivacy }
];


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
 * Reads all values out of the registration form and trims the text fields.
 *
 * @returns {{name: string, email: string, password: string, confirm: string, accept: boolean}} The inputs of the registration form.
 */
function getSignupInputs() {
  return {
    name: getFieldValue('signupName'),
    email: getFieldValue('signupEmail'),
    password: getFieldValue('signupPassword'),
    confirm: getFieldValue('signupConfirm'),
    accept: getFieldValue('acceptPrivacy')
  };
}


/**
 * Checks the name: it has to be filled in and may only consist of letters,
 * spaces, hyphens and apostrophes.
 *
 * @param {string} value - The trimmed name.
 * @returns {string} The error text, or an empty string if the name is valid.
 */
function validateName(value) {
  if (!value) return "Please enter your name.";
  if (value.length < 2) return "Your name must be at least 2 characters long.";
  if (!NAME_PATTERN.test(value)) return "Your name may only contain letters.";
  return "";
}


/**
 * Checks the email address against EMAIL_PATTERN.
 *
 * @param {string} value - The trimmed email address.
 * @returns {string} The error text, or an empty string if the email is valid.
 */
function validateEmail(value) {
  if (!value) return "Please enter your email address.";
  if (!EMAIL_PATTERN.test(value)) return "Please enter a valid email address.";
  return "";
}


/**
 * Checks whether the password reaches the required minimum length of 8
 * characters.
 *
 * @param {string} password - The password entered in the form.
 * @returns {boolean} True if the password is long enough.
 */
function isPasswordLongEnough(password) {
  return password.length >= 8;
}


/**
 * Checks the password: filled in and at least 8 characters long.
 *
 * @param {string} value - The trimmed password.
 * @returns {string} The error text, or an empty string if the password is valid.
 */
function validatePassword(value) {
  if (!value) return "Please enter a password.";
  if (!isPasswordLongEnough(value)) return "Your password must be at least 8 characters long.";
  return "";
}


/**
 * Checks the repeated password against the first one.
 *
 * @param {string} value - The trimmed confirmation.
 * @param {{password: string}} data - All form inputs, needed for the comparison.
 * @returns {string} The error text, or an empty string if both passwords match.
 */
function validateConfirm(value, data) {
  if (!value) return "Please confirm your password.";
  if (value !== data.password) return "Your passwords don't match.";
  return "";
}


/**
 * Checks whether the privacy policy has been accepted.
 *
 * @param {boolean} value - The checked state of the checkbox.
 * @returns {string} The error text, or an empty string if the box is ticked.
 */
function validatePrivacy(value) {
  if (!value) return "Please accept the Privacy Policy.";
  return "";
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
 * @returns {boolean} True if the field is valid.
 */
function checkField(id) {
  let rule = SIGNUP_FIELDS.find(field => field.id === id);
  let message = rule.validate(getFieldValue(id), getSignupInputs());
  showFieldError(id, message);
  return !message;
}


/**
 * Shows a general error message below the form, for problems that belong to
 * no single field.
 *
 * @param {string} message - The error text to display. Pass an empty string to hide the message.
 * @returns {void}
 */
function showSignupError(message) {
  document.getElementById('signupError').textContent = message;
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


/**
 * Runs when the user leaves a field: removes leading and trailing spaces from
 * the value and validates it.
 *
 * @param {string} id - The id of the input element.
 * @returns {void}
 */
function handleFieldBlur(id) {
  let field = document.getElementById(id);
  field.value = field.value.trim();
  updatePasswordIcon(id);
  checkField(id);
}


/**
 * Runs while the user types: keeps the password icon up to date and makes a
 * message that is already shown disappear as soon as the input is correct.
 *
 * @param {string} id - The id of the input element.
 * @returns {void}
 */
function handleFieldInput(id) {
  updatePasswordIcon(id);
  if (document.getElementById(id + 'Error').textContent) checkField(id);
  if (id === 'signupPassword' && getFieldValue('signupConfirm')) checkField('signupConfirm');
}


/**
 * Hooks one field up to the validation: checkboxes react to their change
 * event, all other fields to leaving the field and to typing.
 *
 * @param {string} id - The id of the input element.
 * @returns {void}
 */
function bindFieldValidation(id) {
  let field = document.getElementById(id);
  if (field.type === 'checkbox') {
    field.addEventListener('change', () => checkField(id));
    return;
  }
  field.addEventListener('blur', () => handleFieldBlur(id));
  field.addEventListener('input', () => handleFieldInput(id));
}


/**
 * Sets the registration form up once the page is loaded.
 *
 * @returns {void}
 */
function initSignupForm() {
  SIGNUP_FIELDS.forEach(rule => bindFieldValidation(rule.id));
  updatePasswordIcon('signupPassword');
  updatePasswordIcon('signupConfirm');
}


/**
 * Validates every field of the form and jumps to the first one that is
 * invalid.
 *
 * @returns {boolean} True if the whole form is valid.
 */
function validateSignupForm() {
  let firstInvalid = "";
  SIGNUP_FIELDS.forEach(rule => {
    if (!checkField(rule.id) && !firstInvalid) firstInvalid = rule.id;
  });
  if (firstInvalid) document.getElementById(firstInvalid).focus();
  return !firstInvalid;
}


/**
 * Saves a new user in the database. POST makes Firebase generate the id.
 *
 * @param {{name: string, email: string, password: string}} user - The user record that is stored.
 * @returns {Promise<void>}
 */
async function saveUser(user) {
  await fetch(BASE_URL + "users.json", {
    method: "POST",
    body: JSON.stringify(user)
  });
}


/**
 * Handler of the "Sign up" button. Validates the form, saves the user and
 * returns to the login page after a short confirmation.
 *
 * @returns {Promise<void>}
 */
async function registerUser() {
  showSignupError("");
  if (!validateSignupForm()) return;
  let data = getSignupInputs();
  try {
    await saveUser({ name: data.name, email: data.email, password: data.password });
  } catch (error) {
    showSignupError("Sign up failed. Please try again.");
    return;
  }
  showToast("You signed up successfully");
  setTimeout(() => window.location.href = "index.html", 1500);
}


document.addEventListener('DOMContentLoaded', initSignupForm);
