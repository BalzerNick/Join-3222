/**
 * Liest alle Eingaben aus dem Registrierungsformular.
 * @returns {{name: string, email: string, password: string, confirm: string, accept: boolean}} Die Eingaben.
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
 * Zeigt eine Fehlermeldung im Formular an (leerer Text = weg).
 * @param {string} message - Der Fehlertext.
 * @returns {void}
 */
function showSignupError(message) {
  document.getElementById('signupError').textContent = message;
}


/**
 * Prueft die Registrierungseingaben.
 * @param {{name: string, email: string, password: string, confirm: string, accept: boolean}} data - Die Eingaben.
 * @returns {string} Fehlertext, leer wenn alles ok ist.
 */
function validateSignup(data) {
  if (!data.name || !data.email || !data.password) return "Bitte alle Felder ausfuellen.";
  if (!data.email.includes("@")) return "Bitte eine gueltige E-Mail eingeben.";
  if (data.password !== data.confirm) return "Passwoerter stimmen nicht ueberein.";
  if (!data.accept) return "Bitte die Datenschutzerklaerung akzeptieren.";
  return "";
}


/**
 * Speichert einen neuen User im Backend (POST erzeugt eine neue ID).
 * @param {{name: string, email: string, password: string}} user - Der neue User.
 * @returns {Promise<void>}
 */
async function saveUser(user) {
  await fetch(BASE_URL + "users.json", {
    method: "POST",
    body: JSON.stringify(user)
  });
}


/**
 * Wird vom "Sign up"-Button aufgerufen. Prueft und speichert den User.
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
