/**
 * Global state and constants shared across pages.
 * Only variables that are not scoped to a single function live here;
 * config objects that bind field ids to their validator functions
 * (e.g. *_FIELDS) stay next to those functions.
 */

// --- Add Task ---
let names = [];
let contacts = [];
let selectedContacts = [];
let subtasks = {};
let selectedPriority = "medium";
let sub = false
let editingSubtaskKey = null;
const maxVisibleContacts = 5;
const arrowIconClosed = "assets/icons/arrow_drop_down_down.svg";
const arrowIconOpen = "assets/icons/arrow_drop_down_up.svg";

// --- Contacts cache (shared by board and contacts pages) ---
let allContacts = {};
let contactArray = [];

// --- Board ---
let todos = [];
let searchTerm = "";
let editingTaskId = null;
let taskEditSubtasks = [];
let taskEditSelectedContacts = [];
let taskEditContactPool = [];
let currentDraggedElement = null;
let editDropdownCloseHandler = null;

// --- Summary ---
let tasks = [];

// --- Avatars ---
// Colour palette for the avatars (picked deterministically per name).
const avatarColors = [
  "#FF7A00", "#FF5EB3", "#6E52FF", "#9327FF", "#00BEE8",
  "#1FD7C1", "#FF745E", "#FFA35E", "#FC71FF", "#FFC701",
  "#0038FF", "#C3FF2B", "#FFE62B", "#FF4646", "#FFBB2B"
];

// --- Space guard ---
/** Field types the space guard watches. Date, checkbox and the like are left alone. */
const spaceGuardTypes = ['text', 'search', 'email', 'password', 'tel', 'url'];

/** Field types that must not hold a single space anywhere. */
const noSpaceTypes = ['email', 'password'];

// --- Validation ---
/** Accepted email format: something@something.tld, no spaces. */
const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

/** Accepted name format: letters, separated by single spaces, hyphens or
    apostrophes. \p{L} covers the letters of every language, so accented names
    like María, François or Łukasz are accepted as well. */
const namePattern = /^\p{L}+(?:[ '-]\p{L}+)*$/u;

/** Accepted phone format: digits, spaces and the separators + - ( ) /. */
const phonePattern = /^\+?[0-9 ()\/-]+$/;

/** A phone number has to hold at least this many digits. */
const phoneMinDigits = 6;

/** A name may be this long. The longest realistic full names reach about 38
    characters, 50 leaves room and still keeps the layout intact. */
const nameMaxLength = 50;

/** A password has to be at least this long. */
const passwordMinLength = 8;
