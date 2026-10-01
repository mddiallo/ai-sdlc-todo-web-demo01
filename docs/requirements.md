# Todo Application Requirements

## Product description

The Todo application is a static browser application for demonstrating an
AI-assisted software development lifecycle through the GitHub website. Users
can create tasks, view their tasks, and mark tasks complete or open. The
baseline stores tasks in the user's browser with `localStorage`.

The follow-on feature adds optional due dates and an Overdue filter. The final
task filters are All, Open, Completed, and Overdue. The application is hosted
as a static site on GitHub Pages; it has no server-side services.

Only fictional demo data may be used in examples, screenshots, and
demonstrations. Users' tasks remain in their own browser storage.

## User stories

1. As a user, I want to create a task so I can keep track of something I need
   to do.
2. As a user, I want to see my tasks so I can review what I have recorded.
3. As a user, I want to mark a task complete or open so its status reflects
   my progress.
4. As a user, I want my tasks to remain available in the same browser after I
   close and reopen the application.
5. As a user, I want to add, edit, or clear an optional due date so I can
   manage a task's deadline.
6. As a user, I want to filter tasks by All, Open, Completed, or Overdue so I
   can focus on the tasks relevant to me.
7. As a user, I want an understandable validation message when I enter an
   invalid due date so I can correct it.

## Acceptance criteria

### Baseline

1. The application lets a user create a task with task text.
2. The application displays the user's tasks and their open or completed
   status.
3. A user can change a task's status between open and completed.
4. Tasks are saved in browser `localStorage` and restored when the application
   is reopened in the same browser.
5. Task data is not sent to a backend or shared database.

### Optional due dates and filters

6. A task may have no due date or a due date represented as a calendar date in
   `YYYY-MM-DD` format. The stored `dueDate` value is nullable.
7. A user can add a due date to a task, edit its due date, or clear it.
8. The application rejects a value that is not a real calendar date and shows
   a visible validation message. Invalid input is not saved as a due date.
9. “Today” means the current calendar date in the user's browser-local time
   zone; date comparisons do not interpret a calendar date as a UTC timestamp.
10. An open task with a due date earlier than today is overdue.
11. A task due today is not overdue.
12. A completed task is not overdue, regardless of its due date.
13. A task without a due date is not overdue.
14. The final set of filters is All, Open, Completed, and Overdue. Each filter
   shows only tasks matching its name; All shows every task.
15. Existing saved tasks that do not have a `dueDate` field continue to load
   and work as tasks without due dates.
16. Updating or saving a task preserves its other task data and status.

## Edge cases

- Month and year boundaries, including leap days and the last day of a month.
- Calendar-shaped but impossible values, such as `2025-02-29` or
  `2025-13-01`.
- Due dates around local midnight, where the browser-local date may differ
  from the UTC date.
- Tasks due today, tasks completed before or after their due date, and tasks
  without a due date.
- Previously saved tasks with no `dueDate` property, as well as tasks whose
  due date was cleared.
- Invalid due-date input must not silently replace the last saved valid date.

## Assumptions

- Task text is required; task identity and status are stored with each task.
- Tasks belong to the browser storage in which they were created. Storage is
  not synchronized between browsers or devices.
- Due dates represent calendar days, not times of day or instants.
- The Overdue filter is introduced with the optional due-date feature; without
  due dates, the baseline filters are All, Open, and Completed.
- The application targets modern browsers with JavaScript and `localStorage`.

## Non-goals

- Backend services, shared databases, accounts, authentication, or
  cross-device synchronization.
- Notifications, reminders, recurring tasks, or time-of-day deadlines.
- Collaboration, sharing, or multi-user task lists.
- Importing or using real personal data in demos; demo content must be
  fictional.
- Native mobile or desktop applications.

## Risks

- Browser storage can be cleared, unavailable, or constrained; local storage
  is not a backup or durable server-side record.
- Time-zone and date parsing mistakes can incorrectly classify tasks near
  midnight or across daylight-saving transitions.
- Introducing the new field can break older saved task data if missing values
  are not handled as no due date.
- Invalid date handling can accept impossible dates if validation relies only
  on the input's textual shape.
- Publishing a static site makes its application code publicly accessible;
  no sensitive or real user data should be included in the application or its
  demonstrations.

## Staged delivery plan

1. **Baseline application:** Build the static browser application to create,
   list, complete, reopen, and persist tasks in `localStorage`.
2. **Due-date feature:** Add nullable calendar due dates, including add, edit,
   clear, and visible validation for invalid calendar dates. Keep tasks
   without the new field compatible.
3. **Overdue behavior and filters:** Apply the browser-local overdue rules and
   provide the final All, Open, Completed, and Overdue filters.
4. **Static publication and demonstration:** Publish the static application
   through GitHub Pages and demonstrate it only with fictional data.
