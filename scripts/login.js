/**
 * Reads email and password out of the login form and trims both values.
 *
 * @returns {{email: string, password: string}} The trimmed inputs of the login form.
 */
function getLoginInputs() {
  let email = getFieldValue('loginEmail');
  let password = getFieldValue('loginPassword');
  return { email: email, password: password };
}


/**
 * Sets the login form up once the page is loaded: the eye icon of the
 * password field starts out as a lock.
 *
 * @returns {void}
 */
function initLoginForm() {
  updatePasswordIcon('loginPassword');
  document.getElementById('loginPassword').addEventListener('input', () => updatePasswordIcon('loginPassword'));
}


/**
 * Shows an error message below the login form.
 *
 * @param {string} message - The error text to display. Pass an empty string to hide the message.
 * @returns {void}
 */
function showLoginError(message) {
  document.getElementById('loginError').textContent = message;
}


/**
 * Checks whether both required fields of the login form have been filled in.
 *
 * @param {{email: string, password: string}} data - The inputs as returned by getLoginInputs.
 * @returns {boolean} True if neither email nor password is empty.
 */
function isLoginFilled(data) {
  return data.email !== "" && data.password !== "";
}


/**
 * Loads the registered users and turns a failed request into null, so that a
 * broken connection can be told apart from wrong credentials. The request
 * itself is done by loadUsers() in scripts/api.js.
 *
 * @returns {Promise<?Object>} All users keyed by their id, or null if the request failed.
 */
async function tryLoadUsers() {
  try {
    return await loadUsers();
  } catch (error) {
    return null;
  }
}


/**
 * Searches for a user whose email and password both match the entered
 * credentials.
 *
 * @param {Object} users - All users keyed by their id, as returned by loadUsers.
 * @param {{email: string, password: string}} data - The credentials entered in the login form.
 * @returns {?Object} The matching user, or null if no user matches.
 */
function findUser(users, data) {
  for (let id in users) {
    let user = users[id];
    if (user.email === data.email && user.password === data.password) {
      return user;
    }
  }
  return null;
}


/**
 * Handler of the "Log in" button. Validates the form, checks the credentials
 * against the database and, on success, stores the session and opens the
 * summary page. Otherwise an error message is shown.
 *
 * @returns {Promise<void>}
 */
async function login() {
  let data = getLoginInputs();
  if (!isLoginFilled(data)) {
    showLoginError("Please enter your email and password.");
    return;
  }
  let users = await tryLoadUsers();
  if (!users) {
    showLoginError("Login failed. Please check your connection and try again.");
    return;
  }
  let foundUser = findUser(users, data);
  if (!foundUser) {
    showLoginError("Check your email and password. Please try again.");
    return;
  }
  await startUserSession(foundUser);
}


/**
 * Stores the session of the user who just logged in, loads the contacts of
 * that session and opens the summary page.
 *
 * @param {Object} foundUser - The user whose email and password matched.
 * @returns {Promise<void>}
 */
async function startUserSession(foundUser) {
  localStorage.setItem("user", JSON.stringify({ name: foundUser.name }));
  sessionStorage.setItem("showGreeting", "true");
  await getContacts();
  window.location.href = "summary_guest.html";
}

/**
 * Handler of the "Guest Log in" button. Starts a guest session without any
 * check and jumps straight to the summary page.
 *
 * @returns {void}
 */
async function guestLogin() {
  localStorage.setItem("user", JSON.stringify({ guest: true }));
  sessionStorage.setItem("showGreeting", "true");
  await getContacts();
  window.location.href = "summary_guest.html";
}

/**
 * Handler of the "Sign up" button. Opens the registration page.
 *
 * @returns {void}
 */
function signUp() {
  window.location.href = "signUp.html";
}


document.addEventListener('DOMContentLoaded', initLoginForm);
