# Elements.js

A minimalist declarative UI toolkit designed around purity, immutability, and HTML semantics.

## Features

* Zero-dependency functional UI engine
* Stateless components defined as pure functions
* Fully declarative, deeply composable view trees
* HTML element functions with JSDoc and TypeScript-friendly signatures
* No hooks, no classes, no virtual DOM heuristics

---

## Why Elements.js?

Modern frameworks introduced declarative UI—but buried it beneath lifecycle hooks, mutable state, and complex diffing algorithms.

**Elements.js goes further:**

* Pure functions represent both logic and view
* The DOM *is* your state model
* Re-rendering is *recursion*, not reconciliation

> Can UI be defined as a tree of pure function calls—nothing more?

Yes. Elements.js proves it.

---

## Philosophy

### Declarative from top to bottom

* No internal component state
* No lifecycle methods or effects
* Every component is a function

To update a view: just **call the function again** with new arguments. The DOM subtree is replaced in place.

### State lives in the DOM

There is no observer graph, no `useState`, and no memory of previous renders.
The DOM node *is the history*. Input state is passed as an argument.

### Minimal abstraction

* No keys, refs, proxies, or context systems
* No transpilation step
* No reactive graph to debug

Elements.js embraces the full truth of each function call as the only valid state.

---

## Example: Counter

```js
import { div, pre, button, component, render } from './elements.js';

const counter = component((count = 0) =>
  div(
    pre(count),
    button({ onclick: () => counter(count + 1) }, 'Increment')
  )
)

render(counter(), document.body);
```

* Each click returns a new call to `counter(count + 1)`
* The old DOM node is replaced with the new one
* No virtual DOM, no diffing

---

## Form Example: Todos App

```js
import { button, div, component, form, input, li, span, ul } from './elements.js';

export const todos = component((items = []) => {
  const add = ({ todo: { value } }) =>
    value && todos([...items, { value, done: false }])

  const remove = item =>
    todos(items.filter(i => i !== item))

  const toggle = item =>
    todos(items.map(i => i === item ? { ...i, done: !item.done } : i))

  return (
    div({ class: 'todos' },
      form({ onsubmit: add },
        input({ name: 'todo', placeholder: 'What needs doing?' }),
        button({ type: 'submit' }, 'Add')),
      ul(...items.map(item =>
          li({ style: { 'text-decoration': item.done ? 'line-through' : 'none' } },
            span({ onclick: () => toggle(item) }, item.value),
            button({ onclick: () => remove(item) }, '✕')))))
    )
})
```

This is a complete MVC-style app:

* Stateless
* Immutable
* Pure

You can view these examples live on [Github Pages](https://pfernandez.github.io/elements/) or by running them locally with `npm run dev`.

---

## Root Rendering Shortcut

If you use `html`, `head`, or `body` as the top-level tag, `render()` will automatically mount into the corresponding document element—no need to pass a container.

```js
import {
  body, h1, h2, head, header, html,
  link, main, meta, render, section, title
} from './elements.js'
import { todos } from './components/todos.js'

render(
  html(
    head(
      title('Elements.js'),
      meta({ name: 'viewport', content: 'width=device-width, initial-scale=1.0' }),
      link({ rel: 'stylesheet', href: 'css/style.css' })
    ),
    body(
      header(h1('Elements.js Demo')),
      main(
        section(
          h2('Todos'),
          todos()
        )
      )
    )
  )
)
```

---

## Declarative Events

All event listeners in Elements.js are pure functions. You can return a vnode from a listener to declaratively update the component tree—no mutation or imperative logic required.

### General Behavior

* Any event handler (e.g. `onclick`, `onsubmit`, `oninput`) may return a new vnode to trigger a subtree replacement.
* If the handler returns `undefined`, the event is treated as passive (no update occurs).
* Returned vnodes are passed to `component()` to re-render declaratively.

### Form Events

For `onsubmit`, `oninput`, and `onchange`, Elements.js provides a special signature:

```js
(event.target.elements, event)
```

That is, your handler receives:

1. `elements`: the HTML form’s named inputs
2. `event`: the original DOM event object

Elements.js will automatically call `event.preventDefault()` *only if* your handler returns a vnode.

```js
form({
  onsubmit: ({ todo: { value } }, e) =>
    value && todos([...items, { value, done: false }])
})
```

If the handler returns nothing, `preventDefault()` is skipped and the form submits natively.

---

## API

### `component(fn)`

Wrap a recursive pure function that returns a vnode.

### `render(vnode[, container])`

Render a vnode into the DOM. If `vnode[0]` is `html`, `head`, or `body`, no `container` is required.

### DOM Elements

Every HTML and SVG tag is available as a function:

```js
div({ id: 'box' }, 'hello')
svg({ width: 100 }, circle({ r: 10 }))
```

### TypeScript & JSDoc

Each tag function (e.g. `div`, `button`, `svg`) includes a `@typedef` and MDN-sourced description to:

* Provide editor hints
* Encourage accessibility and semantic markup
* Enable intelligent autocomplete

### Testing Philosophy

Elements are data-in, data-out only, so mocking and headless browsers like `jsdom` are unnecessary out of the box.
See the tests [in this repository](test/README.md) for some examples.

---

## Status

* ✅ Production-ready core
* 🧪 Fully tested (data-in/data-out behavior)
* ⚡ Under 2kB min+gzip
* ✅ Node and browser compatible

---

## Installation

```bash
npm install @pfern/elements
```

Or clone the repo and use as an ES module:

```js
import { render, div, component, ... } from './elements.js';
```

---

## Summary

Elements.js is a thought experiment turned practical:

> Can UI be nothing but functions?

Turns out, yes.

* No diffing
* No state hooks
* No lifecycle
* No reconciliation heuristics

Just pure declarative HTML—rewritten in JavaScript.

---

**Lightweight. Immutable. Composable.**

Give it a try. You might never go back.

