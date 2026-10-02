import test from "node:test";
import assert from "node:assert/strict";
import { filterTasks, isTask, validateTitle } from "../../site01/modules/tasks.js";

test("title validation rejects empty and whitespace-only values", () => {
  assert.deepEqual(validateTitle(""), { valid: false, message: "Enter a task title." });
  assert.deepEqual(validateTitle(" \n\t "), { valid: false, message: "Enter a task title." });
});

test("title validation trims valid titles", () => {
  assert.deepEqual(validateTitle("  Write a test  "), { valid: true, title: "Write a test" });
});

test("filters return all, open, or completed tasks", () => {
  const tasks = [
    { id: "1", title: "Open task", completed: false },
    { id: "2", title: "Done task", completed: true },
  ];

  assert.deepEqual(filterTasks(tasks, "all"), tasks);
  assert.deepEqual(filterTasks(tasks, "open"), [tasks[0]]);
  assert.deepEqual(filterTasks(tasks, "completed"), [tasks[1]]);
});

test("task records require an id, non-empty title, and boolean status", () => {
  assert.equal(isTask({ id: "1", title: "Task", completed: false }), true);
  assert.equal(isTask({ id: "1", title: "  ", completed: false }), false);
  assert.equal(isTask({ id: "1", title: "Task", completed: "false" }), false);
});
