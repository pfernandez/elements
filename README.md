# Elements.js

### A functional, stateless UI toolkit for composing reactive web pages.

Elements.js borrows the simple elegance of functional UI composition from
[React](https://react.dev/), distilled to its purest form:

- No JSX.
- No hooks or keys.
- No virtual DOM heuristics.

Components are pure functions; updates are just calling the function again with
new arguments.

While you may choose to manage application logic with tools like
[Redux](https://redux.js.org/) or [Zustand](https://github.com/pmndrs/zustand),
Elements.js keeps UI state exactly where it belongs: in the
[DOM][https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Anatomy_of_the_DOM]
itself.

## Principles

- **Pure data model:** UI elements are represented as are data-in, data-out
  functions. They accept W3C standard`props`and child elements as arguments, and
  return nested arrays.
- **Dynamic updates:** When an event handler returns the output of a component
  element defined within its scope, the element is updated with its new
  arguments.
- **Imperative boundary, functional surface:** DOM mutation is abstracted away,
  keeping the authoring experience functional and composable.

### Example: Recursive counter
```js
import { button, component, div, output } from '@pfern/elements'

export const counter = component((count = 0) =>
  div(
    output(count),
    button({ onclick: () => counter(count + 1) },
           'Increment')))
```

## Quick Start

### Install as a dependency
```sh
npm install @pfern/elements
```

### Optional 3D / X3DOM helpers

```sh
npm install @pfern/elements @pfern/elements-x3dom
```

### Install as a minimal starter app
```sh
npx @pfern/create-elements my-app
cd my-app
npm install
```

Source code for the examples on this page can be found in the
[examples/](./examples) directory of this repository, which are hosted as a live
demo [here](https://pfernandez.github.io/elements). The starter app also
includes examples as well as simple URL router for page navigation.

## Example: Todos App
```js
import { button, component, div,
         form, input, li, span, ul } from '@pfern/elements'

const demoItems = [
  { value: 'Add my first todo', done: true },
  { value: 'Install elements.js', done: false }
]

export const todos = component(
  (items = demoItems) => {
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
            li({ style:
                { 'text-decoration': item.done ? 'line-through' : 'none' } },
               span({ onclick: () => toggle(item) }, item.value),
               button({ onclick: () => remove(item) }, '✕'))))))
  })
```

## Root Rendering Shortcut

If you use `html`, `head`, or `body` as the top-level tag, `render()` will
automatically mount into the corresponding document element—no need to pass a
container.

```js
import { body, h1, h2, head, header, html,
         link, main, meta, render, section, title } from '@pfern/elements'
import { todos } from './components/todos.js'

render(
  html(
    head(
      title('Elements.js'),
      meta({ name: 'viewport',
             content: 'width=device-width, initial-scale=1.0' }),
      link({ rel: 'stylesheet', href: 'css/style.css' })),
    body(
      header(h1('Elements.js Demo')),
      main(
        section(
          h2('Todos'),
          todos())))))
```

## How Updates Work

Elements.js is designed so you typically call `render()` once at startup (see
`examples/index.js`). After that, updates happen by returning a vnode from an
event handler.

### Declarative Events

- Any event handler (e.g. `onclick`, `onsubmit`, `oninput`) may return a vnode
  array to trigger a replacement.
- If the handler returns `undefined` (or any non-vnode value), the event is
  passive and the DOM is left alone.
- Returned vnodes are applied at the closest component boundary.

Errors are not swallowed: thrown errors and rejected Promises propagate.

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

### Explicit Rerenders

Calling `render(vtree, container)` again is supported (diff + patch). This is
useful for explicit rerenders (e.g. dev reload, external state updates).

### Why Replacement (No Keys)

Replacement updates keep the model simple:

- You never have to maintain key stability.
- Identity is the closest component boundary.
- The DOM remains the single source of truth for UI state.

## Props

Elements.js accepts a single props object as the second element of a vnode:

```js
['div', { id: 'x', class: 'box' }, 'hello']
```

In the DOM runtime:

- Most props are assigned via `setAttribute`.
- A small set of keys are treated as property exceptions when the property
  exists on the element.
- Omitting a prop in a subsequent update clears it from the element.

This keeps updates symmetric and predictable.

## `ontick` (animation hook)

`ontick` is a hook (not a DOM event) that runs once per animation frame. It can
thread context across frames:

```js
transform({
  ontick: (el, ctx = { rotation: 0 }, dt) => {
    el.setAttribute('rotation', `0 1 1 ${ctx.rotation}`)
    return { ...ctx, rotation: ctx.rotation + 0.001 * dt }
  }
})
```

`ontick` must be synchronous. If it throws (or returns a Promise), ticking
stops, and the error is not swallowed.

If the element is inside an `<x3d>` scene, Elements.js waits for the X3DOM
runtime to be ready before ticking.

## X3D / X3DOM (experimental)

The optional `@pfern/elements-x3dom` package includes elements for X3DOM’s
supported X3D node set. You can import them and create 3D scenes
declaratively:

```sh
npm i @pfern/elements @pfern/elements-x3dom
```

### Demo: Interactive 3D Cube
```js
import { appearance, box, material, scene,
         shape, transform, viewpoint, x3d } from '@pfern/elements-x3dom'

export const cubeScene = () =>
  x3d(
    scene(
      viewpoint({ position: '0 0 6', description: 'Default View' }),
      transform({ rotation: '0 1 0 0.5' },
        shape(
          appearance(
            material({ diffuseColor: '0.2 0.6 1.0' })),
          box()))))
```

### Lazy Loading

X3DOM is lazy-loaded the first time you call any 3D element. It loads a small
“core” bundle first, and only loads the larger “full” bundle if you call
a helper for a node that core doesn’t register.

## Types (the docs)

Elements.js is JS-first: TypeScript is not required at runtime. This package
ships `.d.ts` files so editors like VSCode can provide rich inline docs and
autocomplete.

The goal is for type definitions to be the canonical reference for:

* HTML/SVG/X3D element helpers
* DOM events (including the special form-event signature)
* Elements.js-only props like `style`, `innerHTML`, and `ontick`

Most props are assigned as attributes. A small set of keys are treated as
property exceptions (when the property exists on the element): `value`,
`checked`, `selected`, `disabled`, `multiple`, `muted`, `volume`,
`currentTime`, `playbackRate`, `open`, `indeterminate`.

Omitting a prop in a subsequent update clears it from the element.

## Development

This repository is a monorepo:

- `@pfern/elements` lives in `packages/elements`
- `@pfern/elements-x3dom` lives in `packages/elements-x3dom`

The root `package.json` provides convenience scripts that proxy into each
package workspace.

```sh
npm test
npm run -s test:coverage
npm run -s typecheck
npm run -s build:types
npm run -s x3dom:test
npm run -s x3dom:test:coverage
npm run -s x3dom:typecheck
```

### Security / `npm audit`

CI fails on **high+critical** vulnerabilities in production dependencies:

```sh
npm audit --omit=dev --audit-level=high
```

CI also prints the full `npm audit` report (including dev dependencies) as a
non-blocking log to aid triage.

To refresh upstream X3DOM docs for type generation after updating vendor
bundles (manual step; requires network access):

```sh
npm run -s fetch:x3dom-src
```

## API

### `component(fn)`

Wrap a recursive pure function that returns a vnode.

### `render(vnode[, container])`

Render a vnode into the DOM. If `vnode[0]` is `html`, `head`, or `body`, no
`container` is required.

### `elements`

All tag helpers are also exported in a map for dynamic use:

```js
import { elements } from '@pfern/elements'

const { div, button } = elements
```

### DOM Elements

Every HTML and SVG tag is available as a function:

```js
div({ id: 'box' }, 'hello')
svg({ width: 100 }, circle({ r: 10 }))
```

For X3D / X3DOM nodes, use `@pfern/elements-x3dom`:

```js
import { box } from '@pfern/elements-x3dom'

box({ size: '2 2 2', solid: true })
```

### `navigate(path[, options])`

`navigate` updates `window.history` and dispatches a `popstate` event. It is a
tiny convenience for router-style apps.

### Testing Philosophy

Tests run in Node and use a small in-repo fake DOM for behavioral DOM checks.
See `test/README.md`.

## License

MIT License
Copyright (c) 2026 Paul Fernandez

[dom]: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model
