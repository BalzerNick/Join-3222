/**
 * Shows a short message that floats in from the top centre of the page and
 * disappears again on its own. Available on every page.
 *
 * @param {string} message - The text that is displayed inside the toast.
 * @param {number} [duration=2000] - How long the message stays visible, in milliseconds.
 * @returns {void}
 */
function showToast(message, duration = 2000) {
  let toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('toast-visible');
  setTimeout(() => toast.classList.remove('toast-visible'), duration);
}

/**
 * Locks or releases scrolling of the page behind an open overlay.
 *
 * @param {boolean} locked - Pass true to lock scrolling, false to release it again.
 * @returns {void}
 */
function lockScroll(locked) {
  document.documentElement.classList.toggle('no-scroll', locked);
  document.body.classList.toggle('no-scroll', locked);
}

/**
 * Builds the initials of a name from its first and its last word, for
 * example "Anna Schmidt" becomes "AS".
 *
 * @param {string} name - The full name of the person. Must not be empty.
 * @returns {string} The initials in upper case.
 */
function getInitials(name) {
  let parts = name.split(" ");
  let first = parts[0][0];
  let last = parts[parts.length - 1][0];
  return (first + last).toUpperCase();
}

// Colour palette for the avatars (picked deterministically per name).
const AVATAR_COLORS = [
  "#FF7A00", "#FF5EB3", "#6E52FF", "#9327FF", "#00BEE8",
  "#1FD7C1", "#FF745E", "#FFA35E", "#FC71FF", "#FFC701",
  "#0038FF", "#C3FF2B", "#FFE62B", "#FF4646", "#FFBB2B"
];

/**
 * Picks a fixed colour from the palette by summing up the character codes of
 * the name. The same name always yields the same colour, which keeps avatars
 * consistent across all pages.
 *
 * @param {string} name - The name of the contact the avatar belongs to.
 * @returns {string} A hex colour value from AVATAR_COLORS, for example "#FF7A00".
 */
function getAvatarColor(name) {
  let sum = 0;
  for (let char of name) {
    sum += char.charCodeAt(0);
  }
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

/**
 * Writes the initials of the logged in user into the avatar in the header.
 * Guests get a "G". Does nothing if the element is missing or nobody is
 * logged in. Runs once when this file is loaded.
 *
 * @returns {void}
 */
function renderUserInitials() {
  // let name = "Anton Axt";  // TODO: use the actually logged in user
  let el = document.getElementById("userInitials");
  if (!el) return;
  let userData = localStorage.getItem("user");
  if (!userData) return;
  let user = JSON.parse(userData);
  if (user.guest) {
    el.textContent = "G";
    return;
  }
  let name = user.name || "User"; // Fallback in case the name is missing
  let initials = getInitials(name);
  el.textContent = initials;
}

renderUserInitials();

/**
 * Ends the session by removing the user from localStorage and returning to
 * the login page.
 *
 * @returns {void}
 */
function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

/**
 * Opens or closes the dropdown menu behind the avatar in the header.
 *
 * @returns {void}
 */
function toggleUserMenu() {
  document.getElementById("userMenu").classList.toggle("open");
}

/**
 * Closes the user menu when the click happened outside of it. Bound to the
 * document, so a click anywhere on the page dismisses the menu.
 *
 * @param {Event} event - The click event, used to find out what was clicked.
 * @returns {void}
 */
function closeUserMenu(event) {
  let menu = document.getElementById("userMenu");
  if (menu && !menu.contains(event.target)) {
    menu.classList.remove("open");
  }
}

/**
 * Stops the event from bubbling up. Used on elements inside an overlay so
 * that a click on them does not trigger the close handler of the overlay.
 *
 * @param {Event} event - The event whose propagation is stopped.
 * @returns {void}
 */
function noEvent(event){
    event.stopPropagation();
}