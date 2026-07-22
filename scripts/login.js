// Liest die Eingaben aus dem Login-Formular.
function getLoginInputs() {
  let email = document.getElementById('loginEmail').value.trim();
  let password = document.getElementById('loginPassword').value.trim();
  return { email: email, password: password };
}


// Zeigt eine Fehlermeldung unter dem Formular an (leerer Text = weg).
function showLoginError(message) {
  document.getElementById('loginError').textContent = message;
}


// Prueft, ob beide Pflichtfelder ausgefuellt sind.
function isLoginFilled(data) {
  return data.email !== "" && data.password !== "";
}


// Wird vom "Log in"-Button aufgerufen. Felder sind hier Pflicht.
function login() {
  let data = getLoginInputs();
  if (!isLoginFilled(data)) {
    showLoginError("Bitte E-Mail und Passwort eingeben.");
    return;
  }
  showLoginError("");
  console.log("Login-Daten OK:", data);
}


// Wird vom "Guest Log in"-Button aufgerufen. Keine Pflichtfelder.
function guestLogin() {
  console.log("Gast-Login");
}


// Wird vom "Sign up"-Button aufgerufen. Springt zur Registrierungsseite.
function signUp() {
  window.location.href = "signUp.html";
}
