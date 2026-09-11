/* ============================================================
   rotateGuard.js - Landscape lock for mobile devices

   Appends a hint layer to the end of the body once. Whether the
   layer is visible is decided solely by the media query for
   .rotate-hint in style.css. That way it reacts instantly to the
   device being rotated, with no listener needed here.

   This file is included on every page right after spaceGuard.js
   and needs nothing else.
   ============================================================ */

/**
 * Builds the markup of the hint layer.
 *
 * @returns {string} The layer as an HTML string.
 */
function getRotateHintTemplate() {
  return `
    <div id="${rotateHintId}" class="rotate-hint">
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
  if (document.getElementById(rotateHintId)) return;
  document.body.insertAdjacentHTML('beforeend', getRotateHintTemplate());
}

insertRotateHint();
