/**
 * Zeigt eine kurze Meldung, die oben aus der Mitte einschwebt (seitenuebergreifend).
 * @param {string} message - Der anzuzeigende Text.
 * @param {number} [duration=2000] - Anzeigedauer in Millisekunden.
 * @returns {void}
 */
function showToast(message, duration = 2000) {
  let toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('toast-visible');
  setTimeout(() => toast.classList.remove('toast-visible'), duration);
}

/**
 * Sperrt oder loest das Scrollen im Hintergrund (fuer offene Overlays).
 * @param {boolean} locked - true sperrt das Scrollen, false gibt es wieder frei.
 * @returns {void}
 */
function lockScroll(locked) {
  document.documentElement.classList.toggle('no-scroll', locked);
  document.body.classList.toggle('no-scroll', locked);
}

/**
 * Bildet die Initialen aus dem Namen (z.B. "Anna Schmidt" -> "AS").
 * @param {string} name - Der vollstaendige Name.
 * @returns {string} Die Initialen in Grossbuchstaben.
 */
function getInitials(name) {
  let parts = name.split(" ");
  let first = parts[0][0];
  let last = parts[parts.length - 1][0];
  return (first + last).toUpperCase();
}

// Farbpalette fuer die Avatare (deterministisch pro Name gewaehlt).
const AVATAR_COLORS = [
  "#FF7A00", "#FF5EB3", "#6E52FF", "#9327FF", "#00BEE8",
  "#1FD7C1", "#FF745E", "#FFA35E", "#FC71FF", "#FFC701",
  "#0038FF", "#C3FF2B", "#FFE62B", "#FF4646", "#FFBB2B"
];

/**
 * Waehlt anhand des Namens eine feste Farbe aus der Palette (konsistent ueberall im Projekt).
 * @param {string} name - Der Name des Kontakts.
 * @returns {string} Ein Hex-Farbwert.
 */
function getAvatarColor(name) {
  let sum = 0;
  for (let char of name) {
    sum += char.charCodeAt(0);
  }
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

/**
 * Schreibt die Initialen des eingeloggten Users in den Avatar im Header.
 * Gaeste bekommen ein "G". Tut nichts, wenn das Element fehlt oder niemand
 * eingeloggt ist. Wird beim Laden dieser Datei einmal aufgerufen.
 *
 * @returns {void}
 */
function renderUserInitials() {
  // let name = "Anton Axt";  // TODO: echten eingeloggten User verwenden
  let el = document.getElementById("userInitials");
  if (!el) return;
  let userData = localStorage.getItem("user");
  if (!userData) return;
  let user = JSON.parse(userData);
  if (user.guest) {
    el.textContent = "G";
    return;
  }
  let name = user.name || "User"; // Fallback, falls der Name nicht vorhanden ist
  let initials = getInitials(name);
  el.textContent = initials;
}

renderUserInitials();

/**
 * Beendet die Sitzung: entfernt den User aus dem localStorage und springt
 * zurueck zur Login-Seite.
 *
 * @returns {void}
 */
function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

/**
 * Oeffnet bzw. schliesst das Klappmenue hinter dem Avatar im Header.
 *
 * @returns {void}
 */
function toggleUserMenu() {
  document.getElementById("userMenu").classList.toggle("open");
}

/**
 * Schliesst das User-Menue, wenn der Klick daneben ging. Haengt am Dokument,
 * damit ein Klick irgendwo auf der Seite das Menue zumacht.
 *
 * @param {Event} event - Das Klick-Ereignis.
 * @returns {void}
 */
function closeUserMenu(event) {
  let menu = document.getElementById("userMenu");
  if (menu && !menu.contains(event.target)) {
    menu.classList.remove("open");
  }
}

/**
 * Stoppt das Weiterreichen des Ereignisses nach oben. Wird auf Elementen
 * innerhalb eines Overlays benutzt, damit ein Klick darauf das Overlay nicht
 * schliesst.
 *
 * @param {Event} event - Das zu stoppende Ereignis.
 * @returns {void}
 */
function noEvent(event){
    event.stopPropagation();
}