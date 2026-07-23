// Wird beim Laden der Seite aufgerufen (body onload).
// Holt die Daten aus Firebase und zeigt jeden Knoten in der Konsole.
async function init() {
  let antwort = await fetch(BASE_URL + ".json");
  let daten = await antwort.json();
  console.log("Alle Daten:", daten);
  console.log("Tasks:", daten.tasks);
  console.log("Contacts:", daten.contacts);
  console.log("Users:", daten.users);
}


// Zeigt eine kurze Meldung, die oben aus der Mitte einschwebt (seitenuebergreifend).
function showToast(message, duration = 2000) {
  let toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('toast-visible');
  setTimeout(() => toast.classList.remove('toast-visible'), duration);
}


