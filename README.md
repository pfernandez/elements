# Elements.js

<!-- BEGIN README:elements -->

### A functional UI toolkit for composing reactive web pages.

Elements.js was developed after many years working with UI systems and experiencing their benefits and pitfalls first-hand. The problem of the complexity of these systems led to the conviction, [shared by many](https://github.com/papers-we-love/papers-we-love/blob/master/design/out-of-the-tar-pit.pdf "Out of the Tar Pit"), that the answer lies in the principles of functional programming. We can do more, and better, with much less than we may think. The result is the simple elegance of declarative UI composition, distilled to its purest form.

* **Elegant, intuitive syntax**: Function composition results in uniform code that mirrors the shape of HTML, making it immediately understandable. No JSX or hooks; just functions all the way down.

* **Dynamic updates:** Element functions describe DOM elements using function arguments as input. [Event handlers](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events) like `onclick` reload DOM elements in response to user input by calling the same functions again with new arguments.

* **Pure data model:** UI elements are represented as data-in, data-out functions. They accept [W3C](https://www.w3.org/) standard props and child elements as arguments, and return nested arrays.

## Component Architecture: Fixed-Point State Observers

In Elements, a reactive DOM component is modeled as a **Fixed-Point State Observer**, or simply an _observer_: A declarative, recursive _state transition_ that maps directly to a predictable _projection_.

### Example: Recursive Counter

```js
import { button, div, observe, output, project } from '@pfern/elements/html'

const counter = observe((count = 0) =>
  div(
    output(count),
    button({ onclick: () => counter(count + 1) },
           'Increment')))

project(counter(), document.body)
```

An observer is a pure function that receives state data and returns array data called _vdom_. Calling `counter()` returns:

```js
['div', { class: 'container' },
  [['output', {}, 0],
   ['button', { onclick: () => counter(x + 1) }, 'Increment']]]
```

To keep observers pure, the imperative work of DOM manipulation is handled by `project`, which converts vdom into the real DOM rendered onto the screen by a web browser. When the button is clicked, `counter(count + 1)` is invoked, reloading the observer with its next argument.

### The Fixed-Point Cycle

Mathematically, a fixed point satisfies the identity equation $fix(F) = F(fix(F))$. Traditional functional programming languages require explicit machinery (like the Z combinator) to evaluate this loop. We achieve this mathematical model natively using the browser's runtime environment.

1. **The Stable Fixed Point ($fix(F)$):** In the above example, counter is the stable reference through which the observer refers recursively to itself. Its observations change, but its identity remains fixed.

2. **The State Transition ($F$):** The function passed into observe defines what a single state frame looks like, mapping the input `count` to an immutable representation of the DOM.

3. **The Event Loop as Combinator:** The browser's Asynchronous Event Loop acts as a lazy evaluator. The recursive cycle pauses with each transition, waiting for a user interaction (like a button click) to unroll the next frame (`count(x + 1)`).

### The Transition Graph

Observers can call themselves or other observers within their scope. The composed functions, vdom, and the DOM it represents all describe a tree. The _continuations_ invoked by the event handlers can connect back into the tree, turning it into a graph lazily as application state progresses. In the counter, the button handler refers back to `counter`:

```text
observer → observation → event handler
    ↑                         │
    └─────────────────────────┘
```

In Elements, **an observer describes a fixed-point cycle on the transition graph** whose state is projected into the tree with each event.

## Getting Started: Todos App

First install the library:

```sh
npm install @pfern/elements
```

Create a minimal `index.html` to import your app:

```html
<!doctype html>
<meta charset="utf-8">
<script type="module" src="/index.js"></script>
```

Define and export a `todos` observer:

```js
// todos.js
import { button, div, form, input, li, observe, span, ul }
  from '@pfern/elements/html'

const demoItems = [{ value: 'Add my first todo', done: true },
                   { value: 'Install elements.js', done: false }]

export const todos = observe(
  (items = demoItems) => {

    const add = ({ todo: { value }}) =>
      value && todos([...items, { value, done: false }])

    const remove = item =>
      todos(items.filter(i => i !== item))

    const toggle = item =>
      todos(items.map(i => i === item ? { ...i, done: !item.done } : i))

    return div({ class: 'todos' },
      form({ onsubmit: add },
        input({ name: 'todo', placeholder: 'What needs doing?' }),
        button({ type: 'submit' }, 'Add')),
      ul(items.map(item =>
        li({ style: { 'text-decoration': item.done ? 'line-through' : 'none' }},
          span({ onclick: () => toggle(item) }, item.value),
          button({ onclick: () => remove(item) }, '✕')))))
  })
```

Then create and mount the document:

```js
// index.js
import { project, html, head, meta, title, body } from '@pfern/elements/html'
import { todos } from './todos.js'
import css from './style.css?inline'  // Using the Vite NPM package

project(
  html({ lang: 'en' },
    head(
      meta({ charset: 'utf-8' }),
      title('My app')
      style(css)),
    body(todos())))
```

## Links and History

If a link element returns vdom, the corresponding observer will be reloaded. Here we call a `page` observer, which will reload with the new path without refreshing the actual web page:

```js
a({ href: '/about', onclick: () => page('/about') }, 'About')
```

That's it. The browser's native back and forward buttons work as expected. See [the demo entry point](./examples/index.js) for a complete page composed this way.

## State and the DOM

When an observer is reloaded, elements patches every mounted projection while preserving DOM nodes where possible. This lets native state like input values survive updates when the corresponding nodes survive.

When sibling elements are reordered, Elements attempts to retain the identity of each first using retained vnode references, then explicit `key` props, then unique unkeyed observer identities, then position. `key` props work exactly as they do [in React](https://react.dev/learn/rendering-lists#why-does-react-need-keys):

```js
ul(items.map(item =>
  li({ key: item.id }, item.label)))
```

## API

### `observe(transition)`

Give a pure state transition a stable identity. `transition(...args)` must return a vnode array. Calling the returned observer constructs an observation; returning that observation from an event selects it.

The same observer can be projected in more than one place:

```js
const initial = counter()
project(div(initial, initial), document.body)
```

Both DOM projections subscribe to one observer identity and therefore share the same projection. Clicking either advances both. For independent counters, create independent observers:

```js
const createCounter = () => {
  const counter = observe((count = 0) =>
    button({ onclick: () => counter(count + 1) }, count))
  return counter
}

const left = createCounter()
const right = createCounter()

project(div(left(), right()), document.body)
```

### `project(graph, target?)`

Create a live DOM projection and return its root element. Every call creates a separate projection. If a target is supplied, append it there. Without a target, `html`, `head`, and `body` roots will automatically replace their corresponding document elements.

```js
// Replace the document body.
project(body(app()))
```

```js
// Append to the existing body.
project(app(), document.body)
```

```JS
// Store the app in a variable, en append it to the body.
const dom = project(app())
document.body.append(dom)
```

### Element Packages

To avoid naming collisions and unneessary imports, Elements provides separate packages. In addition to the core `@pfern/elements`, each package exports `observe`, `project`, `element`, `fragment`, `toHtmlString`, and `DEBUG` for convenience.

```js
// Import from select libraries.
import { observe, project, button } from '@pfern/elements/html'

const greeting = message => button({ onclick: () => greeting(message) })
project(body(greeting('Hello World!')))
```

```js
// Import everything from the core library.
import { observe, project, html, svg, mathml, fragment } from '@pfern/elements'

// Elements can be destrutured and aliased.
const { title, h1, button } = html
const { title, circle, a as svgA } = svg
const { math, mfrac } = mathml

// Dot-property access can also prevent collisions.
const htmlElement = html.html
const svgTitle = svg.title
```

* Element functions accept individual children or arrays of vnodes.
* `fragment(...)` groups children without adding a wrapper element.

### Props

The optional first argument to an element is a "props" object:

```js
div({ class: 'message', style: { color: 'green' } }, 'Ready')
```

Most props are assigned as [attributes](https://developer.mozilla.org/en-US/docs/Web/API/Element/attributes). These explicit exceptions are assigned as [https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model](DOM) properties when present on the element: `value`, `checked`, `selected`, `disabled`, `multiple`, `muted`, `volume`, `currentTime`, `playbackRate`, `open`, and `indeterminate`.

Omitting a previously supplied prop clears it. Style objects are patched: removed properties are cleared, and `null` removes a style property or the whole style. DOM assignment errors propagate to the caller.

### `ontick`

`ontick` is an animation hook, called once per animation frame when the element is connected and ready. It receives `(element, context, dtMs)` and returns the context for the next frame:

```js
transform({
  ontick: (el, angle = 0, dt) => {
    const next = angle + 0.001 * dt
    el.setAttribute('rotation', `0 1 0 ${next}`)
    return next
  }
})
```

Unlike other `on*` events, `ontick` it does _not_ reload an observer if vdom is returned from it. The hook must be synchronous. Throwing or returning a Promise stops ticking and propagates an error. X3DOM elements wait for scene readiness. Disconnection pauses ticking; reconnection resumes with the previous context and an initial `dtMs` of zero, excluding time spent paused.

### `toHtmlString(vnode[, options])`

Serialize a description as HTML for server rendering (SSR) or static generation:

```js
import { div, toHtmlString } from '@pfern/elements/html'

toHtmlString(div('Hello')) // '<div>Hello</div>'
```

Use `{ doctype: true }` for a document. Event handlers are omitted from the HTML. `innerHTML` inserts its value verbatim.

## X3DOM

The optional @pfern/elements-x3dom package includes elements for X3DOM’s supported X3D node set:

```sh
npm install @pfern/elements-x3dom
```

You can then import them and create 3D scenes declaratively:

```js
import { appearance, box, material, scene, shape, x3d }
  from '@pfern/elements-x3dom'

const cube = () =>
  x3d(
    scene(
      shape(
        appearance(material({ diffuseColor: '0.2 0.6 1' })),
        box())))
```

This will generate the vdom, but the x3dom runtime and stylesheet won't be loaded until the scene is mounted with `project`.

The package handles later scenes, reconnection, and stylesheet restoration after head replacement. See the [X3DOM package](./packages/elements-x3dom/README.md) and [animation example](./examples/views/tick.js).

## Types and Testing

Elements is JS-first. Generated `.d.ts` files provide completion and API documentation in editors; TypeScript is optional. Strict TypeScript users may need an explicit return type on recursive observers to break circular inference.

Transition functions and declarative handlers can be tested directly as data in, data out, without mounting a DOM. Real-browser checks are reserved for projection behavior such as DOM identity, native state, namespaces, asynchronous events, and history.

See the [testing guide](./packages/elements/test/README.md).

## License

MIT License. Copyright (c) 2026 Paul Fernandez.

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

### Publishing the demo

The demo uses Vite to bundle Markdown, styles, and package imports. GitHub Pages must publish the built `dist/` directory. Serving the repository directly leaves imports such as `introduction.md?raw` unprocessed.

```sh
npm run -s build:pages
npm run -s test:pages
```

This builds for `/elements/`, creates an entry page for each demo route, and checks the output in Chrome using a plain static server. The check covers Markdown, styles, navigation, history, direct visits, and state transitions.

In the repository's **Settings → Pages**, set **Source** to **GitHub Actions**. The `Deploy demo to GitHub Pages` workflow then builds, checks, and publishes `dist/` on pushes to `main`. It can also be run manually from the Actions tab.

### Security / `npm audit`

CI fails on **high+critical** vulnerabilities in production dependencies:

```sh
npm audit --omit=dev --audit-level=high
```

CI also prints the full `npm audit` report (including dev dependencies) as a non-blocking log to aid triage.

To refresh upstream X3DOM docs for type generation after updating vendor bundles (manual step; requires network access):

```sh
npm run -s fetch:x3dom-src
```
