let todos = [{
    'id': 0,
    'title': 'Putzen',
    'category': 'todo'
}, {
    'id': 1,
    'title': 'Kochen',
    'category': 'in-progress'
}, {
    'id': 2,
    'title': 'Einkaufen',
    'category': 'in-progress'
}, {
    'id': 3,
    'title': 'Wäsche waschen',
    'category': 'done'
}];

// This variable stores the ID of the task that is currently being dragged.
let currentDraggedElement;

window.addEventListener('load', () => {
    initPage();
});

function initPage() {
    updateHTML();
}

function updateHTML() {
    // Rebuild each column from the current tasks array.
    // This clears the column content and inserts fresh HTML for each matching task.
    renderColumn('todo', 'To Do');
    renderColumn('in-progress', 'In Progress');
    renderColumn('await-feedback', 'Await feedback');
    renderColumn('done', 'Done');
}

function renderColumn(columnId, columnName) {
    const column = document.getElementById(columnId);
    const filteredTasks = todos.filter(t => t['category'] === columnId);
    column.innerHTML = '';

    if (filteredTasks.length === 0) {
        column.innerHTML = `<div class="empty-state">No tasks ${columnName}</div>`;
    } else {
        for (let index = 0; index < filteredTasks.length; index++) {
            const element = filteredTasks[index];
            column.innerHTML += generateTodoHTML(element);
        }
    }
}

function startDragging(id) {
    // Remember which task is being dragged
    currentDraggedElement = id;
}

function generateTodoHTML(element) {
    // Create the task card HTML with a draggable attribute.
    return `<div draggable="true" ondragstart="startDragging(${element['id']})" class="todo">${element['title']}</div>`;
}

function allowDrop(ev) {
    // Prevent default so drop event is allowed on the drop target.
    ev.preventDefault();
}

function moveTo(category) {
    // Change the category of the dragged task and refresh the board.
    todos[currentDraggedElement]['category'] = category;
    // Remove highlight from the drop target so it doesn't remain highlighted after drop.
    // Check the element exists before calling the helper to avoid errors.
    const target = document.getElementById(category);
    if (target) removeHighlight(category);
    updateHTML();
}

function highlight(id) {
    // Add a highlight style to the drag area while an item is dragged over it.
    document.getElementById(id).classList.add('drag-area-highlight');
}

function removeHighlight(id) {
    // Remove the highlight once the dragged item leaves the area.
    document.getElementById(id).classList.remove('drag-area-highlight');
}

function openAddTaskDialog() {
    const modal = document.getElementById('add-task-modal');
    modal.classList.remove('hidden');
}

function closeAddTaskDialog(event) {
    // Allow closing by clicking the X button or the overlay background
    if (event && event.target !== event.currentTarget) return;
    const modal = document.getElementById('add-task-modal');
    modal.classList.add('hidden');
}

