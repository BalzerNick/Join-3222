/**
 * All fields of the registration form in form order, each with the rule that
 * validates it. The password re-checks the confirmation, so that changing it
 * afterwards does not leave a stale "passwords match" state behind.
 *
 * @type {Array<{id: string, validate: function, revalidate?: Array<string>}>}
 */
const signupFields = [
  { id: 'signupName', validate: validateName },
  { id: 'signupEmail', validate: validateEmail },
  { id: 'signupPassword', validate: validatePassword, revalidate: ['signupConfirm'] },
  { id: 'signupConfirm', validate: validateConfirm },
  { id: 'acceptPrivacy', validate: validatePrivacy }
];


/**
 * Checks the repeated password against the first one.
 *
 * @param {string} value - The trimmed confirmation.
 * @param {Object<string, string>} values - All values of the form, keyed by field id.
 * @returns {string} The error text, or an empty string if both passwords match.
 */
function validateConfirm(value, values) {
  if (!value) return "Please confirm your password.";
  if (value !== values.signupPassword) return "Your passwords don't match.";
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
 * Sets the registration form up once the page is loaded.
 *
 * @returns {void}
 */
function initSignupForm() {
  bindFormValidation(signupFields);
  updatePasswordIcon('signupPassword');
  updatePasswordIcon('signupConfirm');
}


/**
 * Saves a new user in the database. POST makes Firebase generate the id.
 *
 * @param {{name: string, email: string, password: string}} user - The user record that is stored.
 * @returns {Promise<void>}
 */
async function saveUser(user) {
  await fetch(baseUrl + "users.json", {
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
  if (!checkForm(signupFields)) return;
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
