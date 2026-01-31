# Elements.js

### A functional, stateless UI toolkit for composing reactive web pages and applications.

Elements.js borrows the simple elegance of functional UI composition from[
React](https://react.dev/), distilled to its purest form. No hooks, no side
effects, no JSX. Components are pure functions; updates are just calling the
function again with new arguments; props are the standard
[HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference) and
[SVG](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference) element
attributes.

While you may choose to manage application logic with tools like
[Redux](https://redux.js.org/) or [Zustand](https://github.com/pmndrs/zustand),
Elements.js keeps _UI state_ exactly where it belongs: in the
[DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Anatomy_of_the_DOM).

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
         form, input, li, span, ul } from '../../elements.js'

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
         link, main, meta, render, section, title } from './elements.js'
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

## X3D / X3DOM (experimental)

This package includes elements for X3DOM’s supported X3D node set. You can
import them from `@pfern/elements/3d.js` and create 3D scenes
declaratively:

### Demo: Interactive 3D Cube
```js
import { appearance, box, material, scene,
         shape, transform, viewpoint, x3d } from '@pfern/elements/3d.js'

export const scene = () =>
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
“core” bundle first, and only loads the larger “full” bundle if you call a
helper for a node that core doesn’t register.

## API

### `component(fn)`

Wrap a recursive pure function that returns a vnode.

### `render(vnode[, container])`

Render a vnode into the DOM. If `vnode[0]` is `html`, `head`, or `body`, no
`container` is required.

### DOM Elements

Every HTML, SVG, and X3DOM tag is available as a function:

```js
div({ id: 'box' }, 'hello')
svg({ width: 100 }, circle({ r: 10 }))
box({ size: '2,2,2' solid: true })
```

### TypeScript & JSDoc

Each tag function (e.g. `div`, `button`, `svg`, `box`) includes a `@typedef` and
MDN-sourced description to:

* Provide editor hints
* Encourage accessibility and semantic markup
* Enable intelligent autocomplete

### Testing Philosophy

Elements are data-in, data-out only, so mocking and headless browsers like
`jsdom` are unnecessary out of the box. See the tests [in this
repository](test/README.md) for some examples.

## License

MIT License
Copyright (c) 2026 Paul Fernandez

