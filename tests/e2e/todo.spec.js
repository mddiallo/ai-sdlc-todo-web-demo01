import { expect, test } from "@playwright/test";

test("validates required titles accessibly", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add task" }).click();
  const input = page.getByRole("textbox", { name: "Task" });
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a task title.")).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(0);
});

test("creates, completes, reopens, and filters tasks", async ({ page }) => {
  await page.goto("/");
  const titleInput = page.getByRole("textbox", { name: "Task" });
  await titleInput.fill("Prepare demo");
  await page.getByRole("button", { name: "Add task" }).click();

  await expect(page.getByText("Prepare demo")).toBeVisible();
  await page.locator(".task-item input[type=checkbox]").check();
  await expect(page.getByRole("checkbox", { name: 'Mark "Prepare demo" open' })).toBeChecked();

  await page.getByRole("button", { name: "Open", exact: true }).click();
  await expect(page.getByText("No tasks match this filter.")).toBeVisible();
  await page.getByRole("button", { name: "Completed" }).click();
  await expect(page.getByText("Prepare demo")).toBeVisible();
  await page.getByRole("checkbox", { name: 'Mark "Prepare demo" open' }).uncheck();
  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(page.getByRole("checkbox", { name: 'Mark "Prepare demo" complete' })).not.toBeChecked();
});

test("supports adding a task with the keyboard", async ({ page }) => {
  await page.goto("/");
  const titleInput = page.getByRole("textbox", { name: "Task" });
  await titleInput.focus();
  await titleInput.fill("Keyboard task");
  await titleInput.press("Enter");
  await expect(page.getByText("Keyboard task")).toBeVisible();
});

test("restores tasks from browser storage after reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "Task" }).fill("Persist this task");
  await page.getByRole("button", { name: "Add task" }).click();
  await page.reload();
  await expect(page.getByText("Persist this task")).toBeVisible();
});

test("renders user titles as text instead of executable markup", async ({ page }) => {
  await page.goto("/");
  const unsafeTitle = '<img src=x onerror="window.compromised = true">';
  await page.getByRole("textbox", { name: "Task" }).fill(unsafeTitle);
  await page.getByRole("button", { name: "Add task" }).click();
  await expect(page.locator(".task-title")).toHaveText(unsafeTitle);
  await expect(page.locator("img")).toHaveCount(0);
  expect(await page.evaluate(() => window.compromised)).toBeUndefined();
});

test("reports malformed saved data without replacing it", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("ai-sdlc-todo-web-demo.tasks.v1", "{not json");
  });
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("Saved tasks could not be read");
  await expect(page.getByRole("button", { name: "Add task" })).toBeDisabled();
  expect(await page.evaluate(() => localStorage.getItem("ai-sdlc-todo-web-demo.tasks.v1"))).toBe("{not json");
});

test("shows write failures and does not claim the task was saved", async ({ page }) => {
  await page.addInitScript(() => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "ai-sdlc-todo-web-demo.tasks.v1") {
        throw new DOMException("Storage full", "QuotaExceededError");
      }
      return originalSetItem.call(this, key, value);
    };
  });
  await page.goto("/");
  await page.getByRole("textbox", { name: "Task" }).fill("Cannot save");
  await page.getByRole("button", { name: "Add task" }).click();
  await expect(page.getByRole("alert")).toContainText("could not be saved");
  await expect(page.getByRole("listitem")).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Task" })).toHaveValue("Cannot save");
});
