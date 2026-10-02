import { isTask } from "./tasks.js";

export const STORAGE_KEY = "ai-sdlc-todo-web-demo.tasks.v1";

export function loadTasks(storage) {
  let saved;
  try {
    saved = (storage ?? globalThis.localStorage).getItem(STORAGE_KEY);
  } catch {
    return {
      tasks: [],
      error: "Browser storage is unavailable. Your tasks could not be loaded.",
      corrupted: false,
    };
  }
  if (saved === null) {
    return { tasks: [], error: null, corrupted: false };
  }

  try {
    const tasks = JSON.parse(saved);
    if (!Array.isArray(tasks) || !tasks.every(isTask)) {
      throw new Error("Saved tasks have an invalid format.");
    }
    return { tasks, error: null, corrupted: false };
  } catch {
    return {
      tasks: [],
      error: "Saved tasks could not be read. They have not been changed.",
      corrupted: true,
    };
  }
}

export function saveTasks(tasks, storage = globalThis.localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
