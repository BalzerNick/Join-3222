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


