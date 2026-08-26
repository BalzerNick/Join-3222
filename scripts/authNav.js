/**
 * Checks whether a session is currently open. Both a registered user and a
 * guest count as logged in, because both store an entry under "user".
 *
 * @returns {boolean} True if somebody is logged in.
 */
function isLoggedIn() {
  return !!localStorage.getItem("user");
}

/**
 * Marks the document as logged out so that the CSS can swap the navigation
 * over to the single "Log In" entry and hide the header menu. Called while
 * the head is still being parsed, which is early enough that the wrong menu
 * never becomes visible.
 *
 * @returns {void}
 */
function applyAuthState() {
  document.documentElement.classList.toggle("logged-out", !isLoggedIn());
}

/**
 * Handler of the back arrow on the Privacy Policy and Legal Notice pages.
 * Someone who is not logged in reached these pages from the login page, so
 * that is where the arrow leads. Everybody else returns to whatever they
 * were looking at before.
 *
 * @returns {void}
 */
function goBackOrLogin() {
  if (isLoggedIn()) {
    window.history.back();
    return;
  }
  window.location.href = "index.html";
}

applyAuthState();
