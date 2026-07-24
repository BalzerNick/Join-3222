/**
 * Liest die Eingaben aus dem Login-Formular.
 * @returns {{email: string, password: string}} Die getrimmten Eingaben.
 */
function getLoginInputs() {
  let email = document.getElementById('loginEmail').value.trim();
  let password = document.getElementById('loginPassword').value.trim();
  return { email: email, password: password };
}


/**
 * Zeigt eine Fehlermeldung unter dem Formular an (leerer Text = weg).
 * @param {string} message - Der Fehlertext.
 * @returns {void}
 */
function showLoginError(message) {
  document.getElementById('loginError').textContent = message;
}


/**
 * Prueft, ob beide Pflichtfelder ausgefuellt sind.
 * @param {{email: string, password: string}} data - Die Login-Eingaben.
 * @returns {boolean} true, wenn beide Felder gefuellt sind.
 */
function isLoginFilled(data) {
  return data.email !== "" && data.password !== "";
}


/**
 * Laedt alle User aus der Firebase-Datenbank.
 * @returns {Promise<Object>} Das User-Objekt (oder null bei leerer DB).
 */
async function loadUsers() {
  let response = await fetch(BASE_URL + "users.json");
  return await response.json();
}


/**
 * Sucht einen User mit passender E-Mail und passendem Passwort.
 * @param {Object} users - Alle User als ID-Objekt.
 * @param {{email: string, password: string}} data - Die Login-Eingaben.
 * @returns {Object|null} Der gefundene User oder null.
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
 * Wird vom "Log in"-Button aufgerufen. Prueft Felder und Backend.
 * @returns {Promise<void>}
 */
async function login() {
  let data = getLoginInputs();
  if (!isLoginFilled(data)) {
    showLoginError("Bitte E-Mail und Passwort eingeben.");
    return;
  }
  let users = await loadUsers();
  if (findUser(users, data)) {
    window.location.href = "board.html";
  } else {
    showLoginError("User nicht bekannt");
  }
}


/**
 * Wird vom "Guest Log in"-Button aufgerufen. Springt ohne Pruefung aufs Board.
 * @returns {void}
 */
function guestLogin() {
  window.location.href = "board.html";
}


/**
 * Wird vom "Sign up"-Button aufgerufen. Springt zur Registrierungsseite.
 * @returns {void}
 */
function signUp() {
  window.location.href = "signUp.html";
}
