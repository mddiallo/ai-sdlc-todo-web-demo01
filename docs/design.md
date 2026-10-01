# Todo application design

## Scope and architecture

The application is a static, browser-only Todo list built with plain HTML, CSS,
and JavaScript modules. It runs from GitHub Pages and keeps each user's tasks
in that browser's `localStorage`; task data is never sent to a server.

```text
 GitHub Pages
      |
      v
 site/ (HTML + CSS + ES modules)
      |
      +----> UI module <----> Pure task functions
      |                           (validate, filter, date rules)
      |
      +----> Storage module <----> browser localStorage
                 |
                 +---- serialized task collection

 tests/ (Node unit tests for pure functions; Playwright browser tests)
```

### Browser interaction flow

1. The page loads its modules and asks the storage boundary to read the
   application task collection.
2. Storage access and JSON parsing are guarded. Valid saved tasks are normalized
   so a missing `dueDate` means no due date. Malformed data or unavailable
   storage produces a visible error; the app must not silently replace or erase
   the saved value.
3. The UI renders tasks and the selected filter using pure filtering/date
   functions. User actions are handled by the UI, which validates input before
   requesting a storage update.
4. On a valid create, edit, completion toggle, or due-date clear, the app
   updates the task collection, saves it, then renders the resulting state.
   Failed writes show a visible storage error and do not claim the update was
   saved.

Keep DOM operations in the UI layer and serialization/`localStorage` operations
in the storage layer. Neither belongs in validation, date, or filtering
functions.

## Repository layout

```text
site/       Deployable static application files (HTML, CSS, JavaScript modules)
tests/      Node unit tests and Playwright browser tests
docs/       Requirements and design documentation
```

The eventual GitHub Pages deployment publishes only `site/`. Tests and
documentation stay outside the published artifact.

## Task data and persistence

Each task is represented by:

| Field | Meaning |
| --- | --- |
| `id` | Stable, unique task identifier |
| `title` | Required task text |
| `completed` | Boolean open/completed status |
| `dueDate` | Optional nullable calendar date in `YYYY-MM-DD` form |

Use a namespaced, versioned key such as
`ai-sdlc-todo-web-demo.tasks.v1`. Versioning identifies the stored format; it
does not imply an automatic destructive migration. When loading existing task
objects that lack `dueDate`, treat the field as `null` in memory. When saving,
preserve task IDs, titles, completion status, and other recognized task data;
write the optional field as `null` or omit it consistently. Do not reject or
discard otherwise-valid older tasks just because the new field is absent.

Persist the collection as JSON. Catch access, parse, and quota/write failures.
Show a clear, perceivable message for storage errors. If saved JSON or task
records are malformed, report that the saved list could not be read and avoid
overwriting it automatically; provide a recovery path only if its effect is
clear to the user. Keep task data local to the user's browser and explain that
browser storage can be cleared and is not a backup.

## Validation, filtering, and dates

Keep validation and filtering as pure functions that accept values and return
results without reading the DOM, clock, or storage. Validate required titles
and ensure due dates are both shaped as `YYYY-MM-DD` and represent real calendar
dates, including leap days and month/year boundaries. Invalid due-date input
must produce a visible, associated validation message and must not replace the
last saved valid date.

Provide pure operations for the All, Open, Completed, and Overdue filters.
Overdue means an open task with a due date strictly earlier than today; tasks
due today, completed tasks, and tasks without due dates are not overdue.
Inject a `today` value into date-dependent validation/filtering operations,
rather than reading the system clock inside them. This makes tests deterministic
and permits boundary cases to be exercised directly.

Treat a due date as a local calendar day, not a timestamp. Calculate today's
date from local date components (`getFullYear()`, `getMonth() + 1`, and
`getDate()`), padding each component to form `YYYY-MM-DD`. Do not use
`toISOString()` or parse a date-only string as a UTC instant. Once both values
have been validated and normalized to fixed-width `YYYY-MM-DD`, lexical
comparison correctly identifies whether the due date precedes the injected
local `today`.

## UI, accessibility, and asset paths

Render task titles as text (for example, via `textContent` or text nodes), never
by interpolating user input into executable HTML. Use semantic controls with
visible labels and programmatic label associations for task entry, due date,
and filters. Status controls must have accessible names that describe the task
and the action; all functionality must be operable by keyboard with visible
focus. Associate validation messages with their inputs and announce changing
error/status feedback accessibly. Do not communicate completion, errors, or
overdue state by color alone.

Use a responsive layout that remains usable on narrow and wide viewports,
supports zoom, and does not require horizontal scrolling for ordinary task
content. Reference stylesheets, scripts, and other local assets with relative
URLs (for example, `./styles.css` and `./modules/app.js`) so they resolve when
the site is served below a GitHub Pages project subpath. Avoid root-absolute
asset paths.

## Tests and deployment

- **Node unit tests:** use Node's built-in test runner for pure title/date
  validation, legacy records without `dueDate`, filter results, and local-date
  boundary cases. Supply explicit `today` values so tests do not depend on the
  machine's clock or timezone.
- **Playwright browser tests:** run in cloud CI with a headless browser and
  installable browser dependencies. Serve the static `site/` files locally in
  the workflow; verify task creation, completion, due-date add/edit/clear,
  filters, persistence across reload, visible errors, keyboard/accessibility
  basics, and safe rendering of titles. Use isolated browser contexts for
  storage-dependent cases.
- **Later GitHub Actions deployment:** run unit and browser tests first, and
  publish only `site/` to GitHub Pages after all required tests succeed. A
  failed test must prevent deployment. The deployment workflow is a later
  delivery step, not part of this design-only change.

## Explicit tradeoffs and non-goals

This design deliberately has no server-side API, database or database
migration, authentication, cross-device synchronization, external service, or
secret. A static site and browser storage avoid operating backend
infrastructure and keep task data in the user's browser, but storage is
browser-specific, can be cleared or unavailable, and is not backed up.
Authentication and a shared database are unnecessary for the single-browser
use case and would introduce services and security responsibilities outside
the requirements. No API credentials or secrets are needed to serve the public
static application. Use fictional data in demonstrations; do not publish real
user task data.
