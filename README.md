# ai-sdlc-todo-web-demo01

A small, browser-only Todo app for the baseline task workflow. The static
application lives in `site01/`; tasks stay in this browser's local storage and
are not sent to a server. Browser storage can be cleared and is not a backup.
Due dates and the Overdue filter are not part of this baseline.

## Run locally

Use Node.js 24 (see `.nvmrc`), then install dependencies from the lockfile:

```sh
npm ci
npm run serve
```

Open <http://127.0.0.1:4173>. The app uses relative asset URLs and can be served
under a project subpath.

## Test

Install the Playwright Chromium browser once, then run the unit and browser
tests:

```sh
npx playwright install chromium
npm test
```

`npm test` runs Node's built-in unit test runner and Playwright browser tests.
The Playwright configuration starts a local test server automatically and
writes its HTML report and failure screenshots to `test-results/`. CI installs
Chromium's system dependencies and uploads these results as an artifact.

## Scope and validation

The baseline supports adding a non-empty task, viewing and changing task status,
and All, Open, and Completed filters. Saved tasks use the
`ai-sdlc-todo-web-demo.tasks.v1` localStorage key. Invalid titles and storage
failures are reported in the interface, and user-entered titles are rendered as
text.

Validation outcomes for the submitted change:

- `npm ci` — passed.
- `npm run test:unit` — pending.
- `npm run test:e2e` — pending.

The CI workflow runs both test suites on pull requests and pushes to `main`.
This change does not deploy the website.
