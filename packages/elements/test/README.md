# Testing Philosophy: Elements.js

Elements.js is designed around purity at the *API* boundary: tag helpers and
component observers are functions that describe state as plain data (vnode
arrays). Constructing an observation does not select it; returning it from an
event does.

Internally, the framework does imperative DOM work (patching, event wiring, and
`ontick`). The tests treat those internals as an implementation detail, but
they still verify the *behavioral contract* that users rely on.

## What We Test

- **Vnode shape:** exported tag helpers return `[tag, props, ...children]`.
- **Declarative events:** a returned component vnode updates that component's projections;
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

Tests run in Node using `node:test` and `assert`. For DOM behavior, tests use a
small in-repo fake DOM implementation (see `test/fake-dom.js`). A separate
Chrome/Chromium suite checks behavior that requires a real browser, including
native input state, namespaces, history, and asynchronous event handling.

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
