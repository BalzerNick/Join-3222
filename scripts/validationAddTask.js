/**
 * All required fields of the Add-Task form, each with the rule that validates
 * it. Uses the shared validation infrastructure from validation.js (see
 * signUp.js for the same pattern).
 *
 * @type {Array<{id: string, validate: function}>}
 */
const addTaskFields = [
  { id: 'taskName', validate: validateTaskTitle },
  { id: 'taskDeadline', validate: validateDueDate },
  { id: 'category', validate: validateCategory }
];


/**
 * Checks the task title: it just has to be filled in.
 *
 * @param {string} value - The trimmed title.
 * @returns {string} The error text, or an empty string if the title is valid.
 */
function validateTaskTitle(value) {
  if (!value) return "Please enter a title.";
  return "";
}


/**
 * Today's date in the YYYY-MM-DD format used by date inputs.
 *
 * @returns {string} Today's date.
 */
function getTodayIsoDate() {
  return new Date().toISOString().split('T')[0];
}


/**
 * Checks the due date: filled in and not in the past.
 *
 * @param {string} value - The date as delivered by the date input (YYYY-MM-DD).
 * @returns {string} The error text, or an empty string if the date is valid.
 */
function validateDueDate(value) {
  if (!value) return "Please select a due date.";
  if (value < getTodayIsoDate()) return "The due date can't be in the past.";
  return "";
}


/**
 * Checks whether a category has been picked from the dropdown.
 *
 * @param {string} value - The trimmed category.
 * @returns {string} The error text, or an empty string if a category is set.
 */
function validateCategory(value) {
  if (!value) return "Please select a category.";
  return "";
}


/**
 * Sets the Add-Task form up: hooks up live validation and stops the due date
 * picker from offering past dates. Does nothing if the form isn't in the DOM
 * yet, which is the case on the board page until its Add-Task dialog is
 * opened - there, openAddTaskDialog() calls this again once the form has
 * been injected.
 *
 * @returns {void}
 */
function initAddTaskForm() {
  if (!document.getElementById('addTaskForm')) return;
  bindFormValidation(addTaskFields);
  document.getElementById('taskDeadline').min = getTodayIsoDate();
}


document.addEventListener('DOMContentLoaded', initAddTaskForm);
