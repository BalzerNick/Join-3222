/* ============================================================
   rotateGuard.js - Landscape-Sperre fuer mobile Geraete

   Haengt einmalig einen Hinweis-Layer an das Ende des Body. Ob
   der Layer zu sehen ist, entscheidet allein die Media Query zu
   .rotate-hint in style.css. Dadurch reagiert er sofort auf das
   Drehen des Geraets, ohne dass hier ein Listener noetig waere.

   Die Datei wird auf jeder Seite direkt hinter spaceGuard.js
   eingebunden und braucht sonst nichts.
   ============================================================ */


/** Id of the hint layer, so that it is never inserted twice. */
const ROTATE_HINT_ID = 'rotateHint';


/**
 * Builds the markup of the hint layer.
 *
 * @returns {string} The layer as an HTML string.
 */
function getRotateHintTemplate() {
  return `
    <div id="${ROTATE_HINT_ID}" class="rotate-hint">
      <img src="assets/icons/rotateDevice.svg" alt="">
      <p>Please rotate your device</p>
      <span>Join is built for portrait mode on phones.</span>
    </div>`;
}


/**
 * Inserts the hint layer once. A page that already carries the layer is
 * left alone, so a second include of this file cannot duplicate it.
 *
 * @returns {void}
 */
function insertRotateHint() {
  if (document.getElementById(ROTATE_HINT_ID)) return;
  document.body.insertAdjacentHTML('beforeend', getRotateHintTemplate());
}

insertRotateHint();
