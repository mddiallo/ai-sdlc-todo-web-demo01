export const FILTERS = ["all", "open", "completed"];

export function validateTitle(value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { valid: false, message: "Enter a task title." };
  }

  return { valid: true, title: value.trim() };
}

export function isTask(value) {
  return value !== null
    && typeof value === "object"
    && typeof value.id === "string"
    && value.id.length > 0
    && typeof value.title === "string"
    && value.title.trim().length > 0
    && typeof value.completed === "boolean";
}

export function filterTasks(tasks, filter) {
  if (filter === "open") {
    return tasks.filter((task) => !task.completed);
  }
  if (filter === "completed") {
    return tasks.filter((task) => task.completed);
  }
  return tasks;
}
