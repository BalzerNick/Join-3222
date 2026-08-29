/**
 * Shows a short message that floats in from the top centre of the page and
 * disappears again on its own. Available on every page.
 *
 * @param {string} message - The text that is displayed inside the toast.
 * @param {number} [duration=2000] - How long the message stays visible, in milliseconds.
 * @param {string} [icon] - Path of an icon to show after the text.
 * @returns {void}
 */
function showToast(message, duration = 2000, icon) {
  let toast = document.getElementById('toast');
  toast.textContent = message;
  if (icon) {
    let iconImg = document.createElement('img');
    iconImg.src = icon;
    iconImg.alt = '';
    iconImg.className = 'toast-icon';
    toast.appendChild(iconImg);
  }
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

/**
 * Picks a fixed colour from the palette by summing up the character codes of
 * the name. The same name always yields the same colour, which keeps avatars
 * consistent across all pages.
 *
 * @param {string} name - The name of the contact the avatar belongs to.
 * @returns {string} A hex colour value from avatarColors, for example "#FF7A00".
 */
function getAvatarColor(name) {
  let sum = 0;
  for (let char of name) {
    sum += char.charCodeAt(0);
  }
  return avatarColors[sum % avatarColors.length];
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

/**
 * Goes one step back in the browser history. Bound to the back arrow of the
 * help page.
 *
 * @returns {void}
 */
function histarrow() {
  window.history.back();
}

/**
 * Reads the raw session entry of the logged in user from localStorage.
 *
 * @returns {?string} the logged in user from localstorage, or null if nobody is logged in.
 */
function getUser(){
    const user = localStorage.getItem("user");
    return user;
}

/**
 * Builds the display name of a contact for the dropdown.
 *
 * @param {string} loggedinUser - The session entry as returned by getUser.
 * @param {Object} user - The contact to label, with a Name property.
 * @returns {string} the user name and if its your name its get the (you) tag
 */
function testUser(loggedinUser, user){
    if(JSON.parse(loggedinUser).name == user.name){
        return user.name +" (you)"
    }
    else{
        return user.name
    }
}