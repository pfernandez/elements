# Testing Philosophy: Elements.js

Elements.js is designed around **purity**, **immutability**, and **data-in/data-out UI logic**.

This testing suite reflects that philosophy:

---

## What We Test

### Element Structure

* Every exported tag (e.g. `div`, `svg`, `form`) is a pure function.
* It returns a **vnode array**: `['tag', props, ...children]`
* Props and children must appear in the correct positions.

### Event Listeners

* Event handlers return vnodes to declaratively update the view.
* Special cases like `onsubmit`, `oninput`, `onchange` receive `(elements, event)`.
* Listeners returning falsy values (`null`, `false`, `''`) are treated as passive.

### Components

* `component(fn)` wraps a recursive, stateless function that can call itself with new arguments.
* Recursive updates should return well-formed vnodes and trigger no side effects.

---

## What We Don't Test

We **do not** test:

* Real DOM rendering or patching (that’s internal)
* Whether `preventDefault()` was called (covered by behavior, not inspection)
* Any mutation of the DOM
* Internal utilities like `assignProperties`, `diffTree`, or `render` directly

Instead, we test only what is **observable through public exports**.

---

## Purity Contract

> **Every test must be resolvable by examining the return value.**
> No test depends on the DOM, mutation, timers, side effects, or internal state.

This allows the entire system to be:

* Predictable
* Stateless
* Transparent

And trivially portable to other runtimes (SSR, testing, WASM, etc).

---

## Running Tests

```bash
node --test
```

All tests use native `node:test` and `assert`—no external dependencies.

---

## Adding New Tests

When adding features, ask:

* Is this behavior observable at the vnode or component level?
* Can it be tested using only function return values and inputs?

If yes → write a test.
If not → consider whether the feature belongs in this framework at all.

