/**
 * Reads all values out of the registration form and trims the text fields.
 *
 * @returns {{name: string, email: string, password: string, confirm: string, accept: boolean}} The inputs of the registration form.
 */
function getSignupInputs() {
  return {
    name: document.getElementById('signupName').value.trim(),
    email: document.getElementById('signupEmail').value.trim(),
    password: document.getElementById('signupPassword').value.trim(),
    confirm: document.getElementById('signupConfirm').value.trim(),
    accept: document.getElementById('acceptPrivacy').checked
  };
}


/**
 * Shows an error message inside the registration form.
 *
 * @param {string} message - The error text to display. Pass an empty string to hide the message.
 * @returns {void}
 */
function showSignupError(message) {
  document.getElementById('signupError').textContent = message;
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
 * Validates the registration inputs and returns the first problem it finds:
 * missing fields, an email without "@", a password shorter than 8
 * characters, two passwords that differ, or a missing privacy consent.
 *
 * @param {{name: string, email: string, password: string, confirm: string, accept: boolean}} data - The inputs to validate.
 * @returns {string} The error text, or an empty string if everything is valid.
 */
function validateSignup(data) {
  if (!data.name || !data.email || !data.password) return "Bitte alle Felder ausfuellen.";
  if (!data.email.includes("@")) return "Bitte eine gueltige E-Mail eingeben.";
  if (!isPasswordLongEnough(data.password)) return "Passwort muss mindestens 8 Zeichen lang sein.";
  if (data.password !== data.confirm) return "Passwoerter stimmen nicht ueberein.";
  if (!data.accept) return "Bitte die Datenschutzerklaerung akzeptieren.";
  return "";
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
  let data = getSignupInputs();
  let error = validateSignup(data);
  if (error) {
    showSignupError(error);
    return;
  }
  await saveUser({ name: data.name, email: data.email, password: data.password });
  showToast("You signed up successfully");
  setTimeout(() => window.location.href = "index.html", 1500);
}
