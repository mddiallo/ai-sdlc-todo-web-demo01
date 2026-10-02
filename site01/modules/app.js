import { filterTasks, validateTitle } from "./tasks.js";
import { loadTasks, saveTasks } from "./storage.js";

const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const titleError = document.querySelector("#title-error");
const taskList = document.querySelector("#task-list");
const emptyMessage = document.querySelector("#empty-message");
const taskCount = document.querySelector("#task-count");
const storageError = document.querySelector("#storage-error");
const filterButtons = [...document.querySelectorAll("[data-filter]")];

const loaded = loadTasks();
let tasks = loaded.tasks;
let activeFilter = "all";
let storageCorrupted = loaded.corrupted;

if (loaded.error) {
  showStorageError(loaded.error);
}

function showStorageError(message) {
  storageError.textContent = message;
  storageError.hidden = false;
}

function persist(nextTasks) {
  if (storageCorrupted) {
    showStorageError("Saved tasks could not be read. Reload or clear browser storage before making changes.");
    return false;
  }

  try {
    saveTasks(nextTasks);
    tasks = nextTasks;
    storageError.hidden = true;
    return true;
  } catch {
    showStorageError("Your change could not be saved. Check browser storage and try again.");
    return false;
  }
}

function render() {
  const visibleTasks = filterTasks(tasks, activeFilter);
  taskList.replaceChildren();

  for (const task of visibleTasks) {
    const item = document.createElement("li");
    item.className = "task-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.disabled = storageCorrupted;
    checkbox.setAttribute(
      "aria-label",
      `Mark "${task.title}" ${task.completed ? "open" : "complete"}`,
    );
    checkbox.addEventListener("change", () => {
      const nextTasks = tasks.map((current) => current.id === task.id
        ? { ...current, completed: checkbox.checked }
        : current);
      if (persist(nextTasks)) {
        render();
      } else {
        checkbox.checked = task.completed;
      }
    });

    const title = document.createElement("span");
    title.className = `task-title${task.completed ? " completed" : ""}`;
    title.textContent = task.title;

    item.append(checkbox, title);
    taskList.append(item);
  }

  taskCount.textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
  emptyMessage.hidden = visibleTasks.length > 0;
  emptyMessage.textContent = tasks.length === 0
    ? "No tasks yet. Add one above to get started."
    : "No tasks match this filter.";
  filterButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.filter === activeFilter));
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = validateTitle(titleInput.value);

  if (!result.valid) {
    titleError.textContent = result.message;
    titleInput.setAttribute("aria-invalid", "true");
    titleInput.focus();
    return;
  }

  titleError.textContent = "";
  titleInput.removeAttribute("aria-invalid");
  const task = { id: crypto.randomUUID(), title: result.title, completed: false };
  if (persist([...tasks, task])) {
    form.reset();
    titleInput.focus();
    render();
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    render();
  });
});

if (storageCorrupted) {
  form.querySelector("button").disabled = true;
  titleInput.disabled = true;
}

render();
