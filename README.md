# Elements.js

Elements.js is a tiny, functional UI toolkit for building DOM trees with plain
functions. Components are just functions; updates are just calling the function
again with new arguments.

## Install

```bash
npm install @pfern/elements
```

## Quick Example: Counter

```js
import { button, component, div, output } from '@pfern/elements'

export const counter = component((count = 0) =>
  div(
    output(count),
    button(
      { onclick: () => counter(count + 1) },
      'Increment')))
```

## Example: Todos App

```js

import { button, component, div,
         form, input, li, span, ul } from '@pfern/elements'

export const todos = component(
  (items = [{ value: 'Add my first todo', done: true }]) => {

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
          li(
            { style:
              { 'text-decoration': item.done ? 'line-through' : 'none' } },
            span({ onclick: () => toggle(item) }, item.value),
            button({ onclick: () => remove(item) }, '✕'))))))})

```

## Root Rendering Shortcut

If you use `html`, `head`, or `body` as the top-level tag, `render()` will
automatically mount into the corresponding document element—no need to pass a
container.

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
      meta({ name: 'viewport',
             content: 'width=device-width, initial-scale=1.0' }),
      link({ rel: 'stylesheet', href: 'css/style.css' })
    ),
    body(
      header(h1('Elements.js Demo')),
      main(
        section(
          h2('Todos'),
          todos())))))
```

## Declarative Events

### General Behavior

* Any event handler (e.g. `onclick`, `onsubmit`, `oninput`) may return a new
  vnode to trigger a subtree replacement.
* If the handler returns `undefined`, the event is treated as passive (no update
  occurs).
* Returned vnodes are applied at the closest component boundary.

### Form Events

For `onsubmit`, `oninput`, and `onchange`, Elements.js provides a special
signature:

```js
(event.target.elements, event)
```

That is, your handler receives:

1. `elements`: the HTML form’s named inputs
2. `event`: the original DOM event object

Elements.js will automatically call `event.preventDefault()` *only if* your
handler returns a vnode.

```js
form({
  onsubmit: ({ todo: { value } }, e) =>
    value && todos([...items, { value, done: false }])
})
```

If the handler returns nothing, `preventDefault()` is skipped and the form
submits natively.

## API

### `component(fn)`

Wrap a recursive pure function that returns a vnode.

### `render(vnode[, container])`

Render a vnode into the DOM. If `vnode[0]` is `html`, `head`, or `body`, no
`container` is required.

### DOM Elements

Every HTML and SVG tag is available as a function:

```js
div({ id: 'box' }, 'hello')
svg({ width: 100 }, circle({ r: 10 }))
```

### TypeScript & JSDoc

Each tag function (e.g. `div`, `button`, `svg`) includes a `@typedef` and
MDN-sourced description to:

* Provide editor hints
* Encourage accessibility and semantic markup
* Enable intelligent autocomplete

### Testing Philosophy

Elements are data-in, data-out only, so mocking and headless browsers like
`jsdom` are unnecessary out of the box. See the tests [in this
repository](test/README.md) for some examples.

## Notes

- Elements.js is intended to be small and easy to reason about.
- If you want examples, see the `examples/` folder or the `elements-app/` repo.

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
