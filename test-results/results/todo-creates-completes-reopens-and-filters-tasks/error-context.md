# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: todo.spec.js >> creates, completes, reopens, and filters tasks
- Location: tests/e2e/todo.spec.js:12:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.check: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('checkbox', { name: 'Mark "Prepare demo" complete' })
    - locator resolved to <input type="checkbox" aria-label="Mark "Prepare demo" complete"/>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - performing click action
    - click action done
    - waiting for scheduled navigations to finish
    - navigations have finished

```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic [ref=e3]:
    - paragraph [ref=e4]: A little more focus
    - heading "Todo list" [level=1] [ref=e5]
    - paragraph [ref=e6]: Keep track of what you want to get done.
  - region [ref=e7]:
    - heading "Add a task" [level=2] [ref=e8]
    - generic [ref=e9]:
      - generic [ref=e10]: Task
      - generic [ref=e11]:
        - textbox "Task" [ref=e12]
        - button "Add task" [ref=e13] [cursor=pointer]
  - region [ref=e14]:
    - generic [ref=e15]:
      - heading "Your tasks" [level=2] [ref=e16]
      - generic [ref=e17]: 1 task
    - group "Filter tasks" [ref=e18]:
      - button "All" [pressed] [ref=e19] [cursor=pointer]
      - button "Open" [ref=e20] [cursor=pointer]
      - button "Completed" [ref=e21] [cursor=pointer]
    - list [ref=e22]:
      - listitem [ref=e23]:
        - checkbox "Mark \"Prepare demo\" open" [checked] [ref=e24]
        - generic [ref=e25]: Prepare demo
  - paragraph [ref=e27]: Your tasks stay in this browser only. Browser storage can be cleared and is not a backup.
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | test("validates required titles accessibly", async ({ page }) => {
  4  |   await page.goto("/");
  5  |   await page.getByRole("button", { name: "Add task" }).click();
  6  |   const input = page.getByRole("textbox", { name: "Task" });
  7  |   await expect(input).toHaveAttribute("aria-invalid", "true");
  8  |   await expect(page.getByText("Enter a task title.")).toBeVisible();
  9  |   await expect(page.getByRole("listitem")).toHaveCount(0);
  10 | });
  11 | 
  12 | test("creates, completes, reopens, and filters tasks", async ({ page }) => {
  13 |   await page.goto("/");
  14 |   const titleInput = page.getByRole("textbox", { name: "Task" });
  15 |   await titleInput.fill("Prepare demo");
  16 |   await page.getByRole("button", { name: "Add task" }).click();
  17 | 
  18 |   await expect(page.getByText("Prepare demo")).toBeVisible();
> 19 |   await page.getByRole("checkbox", { name: 'Mark "Prepare demo" complete' }).check();
     |                                                                              ^ Error: locator.check: Test timeout of 30000ms exceeded.
  20 |   await expect(page.getByRole("checkbox", { name: 'Mark "Prepare demo" open' })).toBeChecked();
  21 | 
  22 |   await page.getByRole("button", { name: "Open", exact: true }).click();
  23 |   await expect(page.getByText("No tasks match this filter.")).toBeVisible();
  24 |   await page.getByRole("button", { name: "Completed" }).click();
  25 |   await expect(page.getByText("Prepare demo")).toBeVisible();
  26 |   await page.getByRole("checkbox", { name: 'Mark "Prepare demo" open' }).uncheck();
  27 |   await page.getByRole("button", { name: "All", exact: true }).click();
  28 |   await expect(page.getByRole("checkbox", { name: 'Mark "Prepare demo" complete' })).not.toBeChecked();
  29 | });
  30 | 
  31 | test("restores tasks from browser storage after reload", async ({ page }) => {
  32 |   await page.goto("/");
  33 |   await page.getByRole("textbox", { name: "Task" }).fill("Persist this task");
  34 |   await page.getByRole("button", { name: "Add task" }).click();
  35 |   await page.reload();
  36 |   await expect(page.getByText("Persist this task")).toBeVisible();
  37 | });
  38 | 
  39 | test("renders user titles as text instead of executable markup", async ({ page }) => {
  40 |   await page.goto("/");
  41 |   const unsafeTitle = '<img src=x onerror="window.compromised = true">';
  42 |   await page.getByRole("textbox", { name: "Task" }).fill(unsafeTitle);
  43 |   await page.getByRole("button", { name: "Add task" }).click();
  44 |   await expect(page.locator(".task-title")).toHaveText(unsafeTitle);
  45 |   await expect(page.locator("img")).toHaveCount(0);
  46 |   expect(await page.evaluate(() => window.compromised)).toBeUndefined();
  47 | });
  48 | 
  49 | test("reports malformed saved data without replacing it", async ({ page }) => {
  50 |   await page.addInitScript(() => {
  51 |     localStorage.setItem("ai-sdlc-todo-web-demo.tasks.v1", "{not json");
  52 |   });
  53 |   await page.goto("/");
  54 |   await expect(page.getByRole("alert")).toContainText("Saved tasks could not be read");
  55 |   await expect(page.getByRole("button", { name: "Add task" })).toBeDisabled();
  56 |   expect(await page.evaluate(() => localStorage.getItem("ai-sdlc-todo-web-demo.tasks.v1"))).toBe("{not json");
  57 | });
  58 | 
  59 | test("shows write failures and does not claim the task was saved", async ({ page }) => {
  60 |   await page.addInitScript(() => {
  61 |     const originalSetItem = Storage.prototype.setItem;
  62 |     Storage.prototype.setItem = function (key, value) {
  63 |       if (key === "ai-sdlc-todo-web-demo.tasks.v1") {
  64 |         throw new DOMException("Storage full", "QuotaExceededError");
  65 |       }
  66 |       return originalSetItem.call(this, key, value);
  67 |     };
  68 |   });
  69 |   await page.goto("/");
  70 |   await page.getByRole("textbox", { name: "Task" }).fill("Cannot save");
  71 |   await page.getByRole("button", { name: "Add task" }).click();
  72 |   await expect(page.getByRole("alert")).toContainText("could not be saved");
  73 |   await expect(page.getByRole("listitem")).toHaveCount(0);
  74 |   await expect(page.getByRole("textbox", { name: "Task" })).toHaveValue("Cannot save");
  75 | });
  76 | 
```