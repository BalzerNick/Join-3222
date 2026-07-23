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
