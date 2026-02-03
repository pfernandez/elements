# Testing Philosophy: Elements.js

Elements.js is designed around purity at the *API* boundary: tag helpers and
components are plain functions that return plain data (vnode arrays).

Internally, the framework does imperative DOM work (patching, event wiring, and
`ontick`). The tests treat those internals as an implementation detail, but
they still verify the *behavioral contract* that users rely on.

## What We Test

- **Vnode shape:** exported tag helpers return `[tag, props, ...children]`.
- **Declarative events:** returning a vnode from an event handler replaces the
  closest component boundary; passive returns do nothing.
- **Form handler signature:** `onsubmit`, `oninput`, `onchange` receive
  `(elements, event)` and only call `preventDefault()` when returning a vnode.
- **`render()` behavior:** initial mount, diff+patch updates, prop updates and
  removals, and child add/remove behavior.
- **`ontick`:** readiness gating, stop-on-throw, and stop-on-Promise.

## How We Test (No jsdom Required)

Tests run in Node using `node:test` and `assert`. For DOM behavior, tests use a
small in-repo fake DOM implementation (see `test/fake-dom.js`) instead of a
full browser or `jsdom`.

The goal is to keep tests:

- **Behavioral:** assert user-visible outcomes, not private helpers.
- **Portable:** no headless browser dependency.
- **Fast:** runs in CI on every push.

## Running Tests

```bash
npm test
```

## Coverage

CI enforces coverage thresholds via Node’s test runner coverage mode.

```bash
npm run -s test:coverage
```
