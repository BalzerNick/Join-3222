/**
 * Shows the confirm/cancel buttons while the subtask input holds text, hides them when it's empty.
 *
 * @returns {void}
 */
function showButtons(){
    const input = document.getElementById('subtask');
    const buttons = document.getElementById("subtaskButtons");

    if(input.value.length > 0 && sub == false){
        buttons.classList.toggle('d-none')
        sub = true;
    }
    else if(input.value.length == 0 && sub == true){
         buttons.classList.toggle('d-none')
        sub = false;
    }
}

/**
 * Redraws the subtask list; the entry in editingSubtaskKey renders as an input, the rest as plain rows.
 *
 * @returns {void}
 */
function renderSubtask() {
    const subtaskArea = document.getElementById('subtaskArea');
    subtaskArea.innerHTML = "";
    const keys = Object.keys(subtasks);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (key === editingSubtaskKey) {
            subtaskArea.innerHTML += getSubtaskEdit(key, subtasks[key].title);
        } else {
            subtaskArea.innerHTML += getSubtask(key, subtasks[key].title);
        }
    }
    updateSubtaskScrollbar();
}

/**
 * Draws the custom subtask scrollbar thumb from the current scroll state (stays visible on mobile, unlike the native overlay).
 *
 * @returns {void}
 */
function updateSubtaskScrollbar() {
    const area = document.getElementById('subtaskArea');
    const track = document.getElementById('subtaskScrollbar');
    const thumb = document.getElementById('subtaskScrollbarThumb');
    if (!area || !track || !thumb) return;

    const { scrollTop, scrollHeight, clientHeight } = area;
    const canScroll = scrollHeight > clientHeight + 1;
    track.classList.toggle('d-none', !canScroll);
    if (!canScroll) return;

    const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, 20);
    const maxThumbTop = clientHeight - thumbHeight;
    const thumbTop = (scrollTop / (scrollHeight - clientHeight)) * maxThumbTop;

    thumb.style.height = `${thumbHeight}px`;
    thumb.style.top = `${thumbTop}px`;
}

/**
 * Adds the subtask input's text as a new subtask and clears it; ignores an empty input.
 *
 * @returns {void}
 */
function safeSubtask(){
    const input = document.getElementById('subtask').value.trim();
    if (input.length === 0) {
        return;
    }

    let id = getNextSubtaskId();
    subtasks[`sub${id}`] = {
        "title": input,
        "done": false
    };
    clearSubtask()
    renderSubtask();
}

/**
 * Finds the next free subtask id, based on the highest existing "subN" suffix so ids never get reused.
 *
 * @returns {number} The next free id.
 */
function getNextSubtaskId() {
    let usedIds = Object.keys(subtasks).map(key => parseInt(key.replace('sub', ''), 10));
    return usedIds.length ? Math.max(...usedIds) + 1 : 1;
}

/**
 * Removes a subtask, leaving edit mode if it was the one being edited.
 *
 * @param {string} key - Key of the subtask, e.g. 'sub1'.
 * @returns {void}
 */
function deleteSubtask(key){
    delete subtasks[key]

    if (editingSubtaskKey === key) {
        editingSubtaskKey = null;
    }

    renderSubtask();
}

/**
 * Switches a subtask into inline edit mode with the cursor at the end of the text.
 *
 * @param {string} key - Key of the subtask, e.g. 'sub1'.
 * @returns {void}
 */
function editSubtask(key){
    editingSubtaskKey = key;
    renderSubtask();

    const input = document.getElementById(`editInput-${key}`);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
}

/**
 * Applies a subtask's edited text and leaves edit mode; an empty input keeps the previous text.
 *
 * @param {string} key - Key of the subtask, e.g. 'sub1'.
 * @returns {void}
 */
function confirmEditSubtask(key){
    const input = document.getElementById(`editInput-${key}`);
    const value = input.value.trim();

    if (value.length > 0) {
        subtasks[key].title = value;
    }

    editingSubtaskKey = null;
    renderSubtask();
}

/**
 * Empties the subtask input and hides the confirm/cancel buttons.
 * @returns {void}
 */
function clearSubtask(){
    const input = document.getElementById('subtask');
    input.value = "";
    showButtons();
}