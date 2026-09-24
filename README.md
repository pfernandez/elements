# Elements.js

### A functional, recursive UI toolkit for composing reactive web pages.

<!-- BEGIN README:elements -->

Elements.js borrows the simple elegance of functional UI composition from
[React](https://react.dev/), distilled to its purest form:

- No JSX.
- No React-style hooks.
- Keys are optional; updates rely on identity and position

Components are pure functions; updates are just calling the function again with
new arguments from an event handler like `onclick`.

## Principles

- **Pure data model:** UI elements are represented as data-in, data-out
  functions. They accept W3C standard properties and child elements as
  arguments, and return plain nested arrays (vdom).
- **Dynamic updates:** When an event handler returns the vdom array from a
  `component` element, that element is updated wherever it is rendered.
- **Imperative boundary, functional interface:** DOM mutation is abstracted
  away, keeping the authoring experience functional and composable.

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
demo [here](https://pfernandez.github.io/elements).

## Example: Todos App
```js
import { button, component, div, form, input, li, span, ul }
  from '@pfern/elements'

const demoItems = [{ value: 'Add my first todo', done: true },
                   { value: 'Install elements.js', done: false }]

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

### What is a vnode?

Elements.js represents UI as plain arrays called **vnodes** (virtual nodes):

```js
['div', { class: 'box' }, 'hello', ['span', {}, 'world']]
```

- `tag`: a string tag name (or `'fragment'` for a wrapper-less group)
- `props`: an object (attributes, events, and Elements.js hooks like `ontick`)
- `children`: strings/numbers/vnodes (and optionally `null`/`undefined` slots)


### Declarative Events

- Any event handler (e.g. `onclick`, `onsubmit`, `oninput`) may return a vnode
  array to trigger a boundary update.
- Plain vnode returns update the handler’s nearest component boundary.
- Synchronous non-vnode returns are passive. Promises may resolve to vnodes;
  returning a Promise prevents submission or eligible link navigation
  immediately.
- On unmodified same-origin link clicks, returning a vnode prevents native
  navigation and updates the targeted component and URL.

Errors are not swallowed: thrown errors and rejected Promises propagate.

### Form Events

For `onsubmit`, Elements.js provides a special signature:

```js
(event.target.elements, event)
```

That is, your handler receives:

1. `elements`: the HTML form’s named input elements containing their values
2. `event`: the original DOM event object

Elements.js prevents submission when the handler returns a vnode or Promise.

```js
form({ onsubmit: ({ todo: { value } }, e) =>
       value && todos([...items, { value, done: false }]) })
```

`oninput` and `onchange` receive `(event.target, event)`, so you can destructure
`value` directly:

```js
const greeting = component((name = '') =>
  div(input({ value: name, oninput: ({ value }) => greeting(value) }),
      output(`Hello, ${name}!`)))
```

For checkboxes, use `({ checked })` instead. The original event remains the
second argument.

### SSG / SSR

For build-time prerendering (static site generation) or server-side rendering,
Elements.js can serialize vnodes to HTML:

```js
import { div, html, head, body, title, toHtmlString } from '@pfern/elements'

toHtmlString(div('Hello')) // => <div>Hello</div>

const doc = html(
              head(title('My page')),
              body(div('Hello')))

const htmlText = toHtmlString(doc, { doctype: true })
```

Notes:
- Event handlers (function props like `onclick`) are dropped during
  serialization.
- `innerHTML` is treated as an explicit escape hatch and is inserted verbatim.

### Explicit Rerenders

Calling `render(vtree, container)` again is supported (diff + patch). This is
useful for explicit rerenders (e.g. dev reload, external state updates).

To force a full remount (discarding existing DOM state), pass
`{ replace: true }`.

### Why Boundary Updates (and Optional Keys)

Component definitions identify shared state; retained vnode references identify
reusable descriptions. Across sibling reorders, Elements.js prefers preserved
vnode references first, then explicit `key`s, then unique unkeyed component
definitions, then positional fallback.

If you rebuild fresh anonymous sibling vnodes every render and need stable
identity across inserts/removals/reorders (e.g. a list of rows with uncontrolled
inputs, canvases, or 3D scenes), you can provide a `key` prop:

```js
ul(...items.map(item =>
  li({ key: item.id }, item.label)))
```

Keys must be unique among siblings. The `key` prop is reserved for
reconciliation and is not assigned to the DOM as an attribute.

## Props

Element functions accept a single props object as first argument:

```js
div({ id: 'x', class: 'box' }, 'hello')
```

In the DOM runtime:

- Most props are assigned via `setAttribute`.
- A small set of keys are treated as property exceptions when the property
  exists on the element.
- `key` is reserved for reconciliation and is ignored by the DOM runtime.
- Omitting a prop in a subsequent update clears it from the element.
- `style` objects are applied as patches: keys removed from the next `style`
  object are cleared from the element (React-like behavior). Use `null` to
  clear the entire style prop, or `null` values to remove individual style keys.

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

X3DOM is lazy-loaded the first time you call any helper from
`@pfern/elements-x3dom`. For correctness and stability, it always loads the
vendored `x3dom-full` bundle (plus `x3dom.css`).

## Types (the docs)

Elements.js is JS-first: TypeScript is not required at runtime. This package
ships `.d.ts` files so editors like VSCode can provide rich inline docs and
autocomplete.

The goal is for type definitions to be the canonical reference for:

* HTML/SVG/X3D element helpers
* DOM events (including the special form-event signature)
* Elements.js-specific prop conventions like `ontick`, plus supported
  prop shorthands like `style` (object) and `innerHTML` (escape hatch)

Most props are assigned as attributes. A small set of keys are treated as
property exceptions (when the property exists on the element): `value`,
`checked`, `selected`, `disabled`, `multiple`, `muted`, `volume`,
`currentTime`, `playbackRate`, `open`, `indeterminate`.

`key` is reserved for reconciliation and is not assigned as an attribute.

Omitting a prop in a subsequent update clears it from the element.

## API

### `component(fn)`

Wrap a recursive pure function that returns a vnode. Calls alone do not update
the DOM; returning the result from an event updates that component wherever it
is rendered. Use separate component definitions for independent state.

### `render(vnode[, container])`

Render a vnode into the DOM. If `vnode[0]` is `html`, `head`, or `body`, no
`container` is required.

Pass `{ replace: true }` to force a full remount.

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

Curated MathML helpers are available as a separate entrypoint:

```js
import { apply, ci, csymbol, math } from '@pfern/elements/mathml'

math(
  apply(csymbol({ cd: 'ski' }, 'app'), ci('f'), ci('x'))
)
```

For X3D / X3DOM nodes, use `@pfern/elements-x3dom`:

```js
import { box } from '@pfern/elements-x3dom'

box({ size: '2 2 2', solid: true })
```

### Links

Return a component from a same-origin link's click handler to update it and the URL:

```js
a({ href: '/about', onclick: () => page('/about') }, 'About')
```

No registration or extra `render()` call. Back/Forward restores previous views;
modified clicks remain native.

### `toHtmlString(vnode[, options])`

Serialize a vnode tree to HTML (SSG / SSR). Pass `{ doctype: true }` to emit
`<!doctype html>`.

### Testing Philosophy

Tests run in Node and use a small in-repo fake DOM for behavioral DOM checks.
See [`packages/elements/test/README.md`](./packages/elements/test/README.md).

## License

MIT License
Copyright (c) 2026 Paul Fernandez

[dom]: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model

<!-- END README:elements -->

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
