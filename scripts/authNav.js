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
 * Key under which the page is remembered that led to the Privacy Policy or the
 * Legal Notice.
 */
const LEGAL_ORIGIN_KEY = "legalOrigin";

/**
 * Remembers the current page right before a link to the Privacy Policy or the
 * Legal Notice is followed. Sits on those links of the login and the sign up
 * page, both of which are visited while logged out.
 *
 * @returns {void}
 */
function rememberLegalOrigin() {
  let page = window.location.pathname.split("/").pop();
  if (page) sessionStorage.setItem(LEGAL_ORIGIN_KEY, page);
}

/**
 * Reads the remembered page and drops it right away, so that a later visit
 * cannot be sent back to a page the user came from much earlier.
 *
 * @returns {?string} The remembered page, or null if nothing was stored.
 */
function takeLegalOrigin() {
  let page = sessionStorage.getItem(LEGAL_ORIGIN_KEY);
  sessionStorage.removeItem(LEGAL_ORIGIN_KEY);
  return page;
}

/**
 * Handler of the back arrow on the Privacy Policy and Legal Notice pages.
 * Someone who is logged in returns to whatever they were looking at before.
 * Everybody else goes back to the page that led here, which is the sign up
 * form or the login page, and to the login page if nothing was remembered.
 *
 * @returns {void}
 */
function goBackOrLogin() {
  if (isLoggedIn()) {
    window.history.back();
    return;
  }
  window.location.href = takeLegalOrigin() || "index.html";
}

applyAuthState();
