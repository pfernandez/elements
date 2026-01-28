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
```

## X3D / X3DOM

This package includes helpers for X3DOM’s supported X3D node set.

### Loading strategy

- X3DOM is lazy-loaded the first time you call any 3D helper.
- It loads a small “core” bundle first, and only loads the larger “full” bundle if you call a helper for a node that core doesn’t register.
- The implementation is documented in `src/3d.js`.

Type declarations for these nodes are generated in `types/x3d.d.ts` and `types/x3d-base.d.ts`. To regenerate them:

```bash
node scripts/generate-x3d.mjs
```

If you have a matching checkout of the X3DOM source repo at `./.cache/x3dom-src-<version>`, the generator will also pull the node `@classdesc` JSDoc into the `.d.ts` docblocks.

### Vendored bundles

`vendor/x3dom.js`, `vendor/x3dom.css`, and `vendor/x3dom-full.js` are vendored build artifacts produced from the X3DOM source repo at the pinned version. They are loaded via DOM injection to preserve X3DOM’s “classic script” global behavior across bundlers.
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
- For a starter app template, use `@pfern/create-elements`:
  - https://github.com/pfernandez/create-elements
  - `npx @pfern/create-elements my-app`
- More examples live in `examples/`.
