# Testing Philosophy: Elements.js

Elements.js is designed around purity at the *API* boundary: tag helpers and
observers are functions that describe state as plain data (vnode arrays).
Constructing an observation does not select it; returning it from an
event does.

Internally, the framework does imperative DOM work (patching, event wiring, and
`ontick`). The tests treat those internals as an implementation detail, but
they still verify the *behavioral contract* that users rely on.

## Data in, data out

Most Elements application logic can be tested as ordinary function evaluation.
Views receive state and return vnode data. Event handlers receive input and
return the next vnode. Neither operation requires a DOM projection:

```js
import assert from 'node:assert/strict'
import { button, observe } from '../elements.js'

const counter = observe((count = 0) =>
  button({ onclick: () => counter(count + 1) }, count))

const current = counter(3)
assert.equal(current[2], 3)

const next = current[1].onclick()
assert.equal(next[2], 4)
```

A test can supply state, inspect the resulting observation, invoke one of its
interactions, and inspect the next observation without mocking framework
internals. That is the same data flow the browser runtime later projects:

```text
state → view → observation → event → next observation
                   │
                   └── projection into the DOM
```

DOM tests are still necessary when the behavior belongs to projection rather
than description: node identity, focus and edited values, namespaces, browser
history, asynchronous native events, and other browser-managed state.

The testing boundary therefore mirrors the library boundary: test the
description and transition path as **data in, data out**; use browser tests when
the browser itself is part of the behavior.

## What We Test

- **Vnode shape:** exported tag helpers return `[tag, props, ...children]`.
- **Declarative events:** a returned observer vnode updates that observer's projections;
  a plain vnode updates the closest boundary. Synchronous passive returns do nothing.
- **Form handler signature:** `onsubmit`, `oninput`, `onchange` receive
  `(arg, event)` where `onsubmit` gets `event.target.elements` and
  `oninput`/`onchange` get `event.target`; `onsubmit` calls `preventDefault()`
  when returning a vnode or Promise. Eligible link handlers also record the URL
  when their result is a vnode.
- **`render()` behavior:** initial mount, diff+patch updates, prop updates and
  removals, and child add/remove behavior.
- **`ontick`:** readiness gating, stop-on-throw, and stop-on-Promise.

## How We Test

Tests run in Node using `node:test` and `assert`. Construction, events,
observer behavior, projection, and animation contracts live in separate test
files. For DOM behavior, tests use a small in-repo fake DOM implementation.
The browser suite is likewise split by projection, event, observer, and
integration contracts, with Chrome/Chromium reserved for behavior that requires
a real browser.

The goal is to keep tests:

- **Behavioral:** assert user-visible outcomes, not private helpers.
- **Portable:** the Node suite runs without a headless browser.
- **Fast:** runs in CI on every push.

## Running Tests

```bash
npm test
```

Run the browser checks with Chrome or Chromium installed (`CHROME_BIN` can
specify its executable):

```bash
npm run -s test:browser
```

Check the production demo as GitHub Pages will serve it, without Vite's dev
server transformations or route fallback:

```bash
npm run -s build:pages
npm run -s test:pages
```

This checks the `/elements/` base path, bundled Markdown and CSS, direct route
visits, navigation history, and independent counters.

Packed-package checks also validate the generated types from a strict
TypeScript consumer:

```bash
npm run -s test:packages
```

## Coverage

CI enforces coverage thresholds via Node’s test runner coverage mode.

```bash
npm run -s test:coverage
```
