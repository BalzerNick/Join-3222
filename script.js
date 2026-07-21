// Wird beim Laden der Seite aufgerufen (body onload).
// Holt die Daten aus Firebase und zeigt sie in der Konsole.
async function init() {
  let antwort = await fetch(BASE_URL + ".json");
  let daten = await antwort.json();
  console.log("Firebase-Verbindung OK. Inhalt:", daten);
}
