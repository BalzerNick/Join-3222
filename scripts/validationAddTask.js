/**
 * Required fields of the Add-Task form, each with its validation rule.
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
 * Sets up the Add-Task form: live validation and blocking past due dates.
 * No-op if the form isn't in the DOM yet (board page before the dialog opens).
 *
 * @returns {void}
 */
function initAddTaskForm() {
  if (!document.getElementById('addTaskForm')) return;
  bindFormValidation(addTaskFields);
  document.getElementById('taskDeadline').min = getTodayIsoDate();
  document.getElementById('subtaskArea')?.addEventListener('scroll', updateSubtaskScrollbar);
  updateSubtaskScrollbar();
}

document.addEventListener('DOMContentLoaded', initAddTaskForm);
