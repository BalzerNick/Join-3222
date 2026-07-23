/**
 * Wird beim Laden der Seite aufgerufen (body onload).
 * Testet die Firebase-Verbindung und gibt jeden Knoten in der Konsole aus.
 * @returns {Promise<void>}
 */
async function init() {
  let antwort = await fetch(BASE_URL + ".json");
  let daten = await antwort.json();
  console.log("Alle Daten:", daten);
  console.log("Tasks:", daten.tasks);
  console.log("Contacts:", daten.contacts);
  console.log("Users:", daten.users);
}


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
