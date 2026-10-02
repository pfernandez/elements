# Elements.js

<!-- BEGIN README:elements -->

Elements.js is a functional UI library built around **recursive composition**
and **declarative state transitions**. Build interfaces with ordinary nested
function calls; when an event occurs, return the next observation instead of
calling a setter. `observe(view)` gives those successive observations one stable
identity, and Elements projects the selected one into the DOM.

State is ordinary JavaScript data passed through function arguments and
closures.

## Start with a transition

A counter has one piece of state: its count. A view can describe the interface
at that count and the interaction that leads to the next one:

```js
import { button, observe, div, output, render } from '@pfern/elements'

const counter = observe((count = 0) =>
  div(
    output(count),
    button({ onclick: () => counter(count + 1) },
           'Increment')))

render(counter(), document.body)
```

The first call constructs an observation of the counter at zero. Clicking
**Increment** runs a handler that returns an observation of the same counter at
one. Elements selects it and updates the DOM. The new handler closes over the
new count, ready for the next click.

You normally call `render()` once, when the page loads. Event returns drive the
state transitions after that.

## The model

Elements separates five ideas that UI libraries often combine:

- A **view** is a pure function from state to an interface description.
- An **observation** is the immutable vnode data returned by a view.
- An **observer** is the stable identity created by `observe(view)`.
- **Selection** chooses one observation as that observer's current state.
- A **projection** is a mounted DOM realization of the selected observation.

A counter makes the relationship concrete:

```text
counter                         observer identity
   │
   └── current ──> observation from counter(1)
                         ├──> DOM projection A
                         └──> DOM projection B
```

Calling the view with state constructs an observation. The observer identity
persists while its current observation changes, and every mounted occurrence is
a projection of that current observation.

## Construction is not selection

Calling an observer constructs an observation. It does not by itself update the
DOM:

```js
counter(10)                       // Construct an observation.
() => { counter(10) }             // Construct it, then discard it.
() => counter(10)                 // Return it from an event: select it.
```

That distinction keeps view construction pure. Selection happens at the
projection boundary.

There is one corresponding mount rule: when a fresh observer vnode is first
projected, that observation becomes current. Reusing an already projected vnode
projects the observer's current observation instead of resetting it. Returning
an observer vnode from an event explicitly selects its observation, even if that
vnode was constructed earlier.

A plain vnode returned from an event updates the handler's nearest observer
boundary (or the render root outside an observer).

## One identity, many projections

The same observer can be projected in more than one place:

```js
const initial = counter()
render(div(initial, initial), document.body)
```

Both DOM projections subscribe to one observer identity and therefore show the
same selected observation. Clicking either advances both.

The DOM nodes themselves are still separate. Native state such as focus or an
input's edited value belongs to each projection.

For independent counters, create independent observers:

```js
const createCounter = () => {
  const counter = observe((count = 0) =>
    button({ onclick: () => counter(count + 1) }, count))
  return counter
}

const left = createCounter()
const right = createCounter()

render(div(left(), right()), document.body)
```

Each call to `observe` establishes a new identity.

## Observations are data

Tag helpers return plain nested arrays called **vnodes**:

```js
div({ class: 'message' }, 'Hello')
// ['div', { class: 'message' }, 'Hello']
```

The first item is the tag, the second holds props and event handlers, and the
rest are children. Nesting helper calls produces nested vnode data:

```js
div(
  output('Ready'),
  ul([
    li('One'),
    li('Two')
  ]))

// ['div', {},
//   ['output', {}, 'Ready'],
//   ['ul', {},
//     ['li', {}, 'One'],
//     ['li', {}, 'Two']]]
```

Arrays of vnodes can be passed directly, so mapped children compose
directly without argument spreading:

```js
ul(items.map(item =>
  li({ key: item.id }, item.label)))
```

Elements never rewrites the source arrays. The browser renderer interprets them
as DOM; `toHtmlString()` can interpret the same data as HTML.

## Recursive observers form a transition graph

The vnode nesting describes where things appear, so it forms a tree. JavaScript
references describe where interaction can continue.

In the counter, the button handler refers back to `counter`:

```text
observer → observation → event handler
    ↑                         │
    └─────────────────────────┘
```

The recursive call is deferred inside the event handler, so constructing an
observation does not recurse forever. Each event performs one step and can
return another observation of the same observer.

A handler can instead return an observation of a different observer. The
resulting transition graph can therefore cross the visible nesting tree.
Elements does not materialize every possible future state; ordinary references
and closures describe the possible next steps, and observations are constructed
when they are needed.

## State and the DOM

Selection changes an observer's current observation. Elements patches every
mounted projection to match while preserving compatible DOM nodes where
possible. This lets native state survive updates when the corresponding nodes
survive.

Across sibling reorders, matching prefers retained vnode references, then
explicit `key`s, then unique unkeyed observer identities, then position.
Repeated projections of one observer need retained references or keys to
distinguish them across reorders.

For fresh list items whose identity should survive insertion or removal, use a
key that is unique among siblings:

```js
ul(items.map(item =>
  li({ key: item.id }, item.label)))
```

`key` is used for matching and is never assigned to the DOM.

## Install

```sh
npm install @pfern/elements
```

Explore the [live demo](https://pfernandez.github.io/elements), its
[examples](./examples), and the longer article on
[recursive state observers](./examples/content/introduction.md).

## Events and forms

Any DOM event handler can return a vnode. An observer vnode selects that
observer's observation wherever it is mounted. A plain vnode updates the
handler's nearest observer boundary (or the render root outside an observer).

`oninput` and `onchange` receive `(event.target, event)`. Destructure the native
control's `value` or `checked` property:

```js
const greeting = observe((name = '') =>
  div(
    input({ value: name, oninput: ({ value }) => greeting(value) }),
    output(`Hello, ${name}!`)))
```

`onsubmit` receives `(event.target.elements, event)`, giving access to the form's
named controls:

```js
const todos = observe((items = []) =>
  div(
    form({ onsubmit: ({ todo: { value } }) =>
           todos([...items, value]) },
         input({ name: 'todo', required: true }),
         button({ type: 'submit' }, 'Add')),
    ul(items.map(item => li(item)))))
```

Import the tag helpers you use from `@pfern/elements`. Other event handlers
receive the original DOM event as their first argument.

Handlers may return Promises that resolve to vnodes. Returning a vnode or a
Promise prevents native form submission or eligible link navigation;
Promises claim that behavior immediately, before they settle. Their returned
observations are selected in completion order. Synchronous non-vnode returns
leave native behavior alone. Errors propagate.

## Links and history

An ordinary same-origin link can return the next observation of a page observer:

```js
a({ href: '/about', onclick: () => page('/about') }, 'About')
```

For an eligible unmodified click, Elements selects the observation and records
the URL. Back and Forward restore previous observations. Modified clicks and
links with native-navigation opt-outs, such as `download`, retain native
behavior. No navigation registration is required.

History stores observations, including their handlers. It does not snapshot
DOM nodes or serialize closures for restoration after a reload.

## API

### `observe(view)`

Give a pure view a stable identity. `view(...args)` must return
a vnode array. Calling the returned observer constructs an observation;
returning that observation from an event selects it. Each call to `observe`
establishes a separate identity for independent state.

### `render(vnode[, container[, options]])`

Mount an observation into the DOM, normally once at startup. When the root tag
is `html`, `head`, or `body`, the container can be omitted:

```js
render(body(counter()))
```

Calling `render` again is supported for explicit updates. To discard an ordinary
container's mounted DOM and mount again, use
`render(vnode, container, { replace: true })`.

### Tag helpers and `elements`

HTML and SVG helpers are exported from the main package for convenience:

```js
import { div, svg, circle, elements } from '@pfern/elements'

const { button, fragment } = elements
```

They are also available as explicit vocabularies:

```js
import { div } from '@pfern/elements/html'
import { svg, circle } from '@pfern/elements/svg'
import { math, mfrac } from '@pfern/elements/mathml'
```

All of these are built on the same `element(tag)` primitive. Custom
vocabularies can use it directly:

```js
import { element } from '@pfern/elements'

const widget = element('my-widget')
```

`fragment(...)` groups children without adding a wrapper element. Tag helpers
accept individual children or arrays of vnodes.

### Props

The optional first argument to a tag helper is a props object:

```js
div({ class: 'message', style: { color: 'green' } }, 'Ready')
```

Most props are assigned as attributes. These explicit exceptions are assigned
as DOM properties when present on the element: `value`, `checked`, `selected`,
`disabled`, `multiple`, `muted`, `volume`, `currentTime`, `playbackRate`, `open`,
and `indeterminate`.

Omitting a previously supplied prop clears it. Style objects are patched:
removed properties are cleared, and `null` removes a style property or the
whole style. DOM assignment errors propagate to the caller.

### `ontick`

`ontick` is an animation hook, called once per animation frame when the element
is connected and ready. It receives `(element, context, dtMs)` and returns the
context for the next frame:

```js
transform({
  ontick: (el, angle = 0, dt) => {
    const next = angle + 0.001 * dt
    el.setAttribute('rotation', `0 1 0 ${next}`)
    return next
  }
})
```

This return value carries animation context; it does not select an observer
observation. The hook must be synchronous. Throwing or returning a Promise
stops ticking and propagates an error. X3DOM elements wait for scene readiness.

### `toHtmlString(vnode[, options])`

Serialize a description as HTML for server rendering or static generation:

```js
import { div, toHtmlString } from '@pfern/elements'

toHtmlString(div('Hello')) // '<div>Hello</div>'
```

Use `{ doctype: true }` for a document. Event handlers are omitted from the
HTML. `innerHTML` inserts its value verbatim.

## Optional X3DOM helpers

```sh
npm install @pfern/elements-x3dom
```

Import 3D helpers from the separate package:

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

The first helper call loads the vendored X3DOM runtime and stylesheet in the
browser. See the [X3DOM package](./packages/elements-x3dom/README.md) and
[animation example](./examples/views/tick.js).

## Types and testing

Elements is JS-first. Generated `.d.ts` files provide completion and API
documentation in editors; TypeScript is optional. Strict TypeScript users may
need an explicit return type on recursive observers to break circular inference.

Views and declarative handlers can be tested directly as data in, data out,
without mounting a DOM. Real-browser checks are reserved for projection behavior
such as DOM identity, native state, namespaces, asynchronous events, and history.
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

The demo uses Vite to bundle Markdown, styles, and package imports. GitHub Pages
must publish the built `dist/` directory. Serving the repository directly leaves
imports such as `introduction.md?raw` unprocessed.

```sh
npm run -s build:pages
npm run -s test:pages
```

This builds for `/elements/`, creates an entry page for each demo route, and
checks the output in Chrome using a plain static server. The check covers
Markdown, styles, navigation, history, direct visits, and state transitions.

In the repository's **Settings → Pages**, set **Source** to **GitHub Actions**.
The `Deploy demo to GitHub Pages` workflow then builds, checks, and publishes
`dist/` on pushes to `main`. It can also be run manually from the Actions tab.

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
