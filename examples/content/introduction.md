## Recursive state observers

An interface has a present state and ways to move to another state. A counter
might be at zero, with a button that takes it to one. A form contains values,
with a submit action that can take it to a result. In Elements, ordinary
functions describe both the present interface and what can happen next.

### Begin with a value

Start with a **view**: a pure function that describes a state. Here the state is
a count:

```js
const view = count => output(count)
```

`count` is the state. Calling `view(3)` produces an observation of that state:

```js
['output', {}, 3]
```

The array is data. It describes an element without creating a DOM node. Tag
helpers let us compose larger descriptions in the same way:

```js
const view = count =>
  div(output(count), button('Increment'))
```

An observation can also contain event handlers. Those functions describe how
the interface responds to interaction.

### Give the calculation somewhere to return

Pass the view to `observe` and let its handler refer to the resulting
observer:

```js
import { button, observe, div, output, render } from '@pfern/elements'

const counter = observe((count = 0) =>
  div(
    output(count),
    button({ onclick: () => counter(count + 1) },
           'Increment')))

render(counter(), document.body)
```

`observe` establishes a stable identity for the counter. Each call to `counter`
constructs an observation associated with that identity. Returning one from an
event handler selects it as the observer's current observation, and Elements
updates its mounted DOM projections.

Follow the first click:

1. The selected observation describes zero. Its handler closes over `count = 0`.
2. Clicking runs that handler, which returns `counter(1)`.
3. Elements selects the returned observation. Its output shows one, and its
   handler closes over `count = 1`.
4. The next click can return `counter(2)`.

A **closure** is simply a function that retains access to the variables where
it was created. Here that is how each handler knows the count it continues from.
The new observation carries the next handlers along with the next output.

### Recursion across events

The counter refers to itself, but the next call is inside an event handler.
Constructing its observation does not immediately recurse. Each click continues
the calculation with new arguments.

This is what we mean by a **recursive state observer**: a function that observes
a state and describes interactions that can lead to its next observation.
The function's return includes both presentation and possible continuations.
A continuation here is the returned description of what should happen next.

Calling `counter(10)` on its own constructs a value. Returning that value from
an event selects it. This lets a handler compute a possible next state before
committing to it, including while waiting for asynchronous work.

```js
const counter = observe((count = 0) =>
  button({ onclick: async () => {
    const next = counter(count + 1)
    await save(count + 1)
    return next
  } }, count))
```

Here `save` is an application-supplied asynchronous function. The counter stays
at its current observation until the returned Promise resolves to `next`. If
several handlers are pending, their results are selected in completion order.
Each handler still carries the state from which it began.

### The connections form a graph

The nesting in our source describes a tree: a `div` contains an `output` and a
`button`. But the button's handler refers back to `counter`, outside that
nesting. References connect the pieces into a **graph**. The counter has a cycle:

```text
observer → current observation → event handler → same observer
```

The handler carries the count and can call `counter` with the next count. That
call constructs a new observation; returning it from the event selects it.
The selected observation changes. The observer remains the same point of
return in the graph.

This is the **recursive fixed-point** intuition: the definition refers back to
itself, so the calculation can continue through the same identity. `observe`
provides that identity; the reference to `counter` ties the recursive cycle.
A view can also have an identity without being recursive.

Other handlers can refer to other observers. A button in a sidebar can select
the next observation of a page. Where something is nested tells us where it
appears; its references tell us where the interaction can continue. These
connections can describe future steps without constructing every possible
observation in advance.

For readers coming from Lisp, the structure is familiar: functions construct
data, closures carry values, and recursion expresses the next step. In the
browser, events provide the occasions for those steps, and Elements handles the
DOM work after an observation is selected.

An observer fills a role similar to a React or Web component. Given a state,
it describes the interface and its possible interactions. Declaring an
`onclick` handler describes a subscription that Elements installs at the DOM
boundary. Selecting a new observation also updates the handlers, ready for
subsequent events.

### One identity, multiple projections

One observer can appear in several places:

```js
const initial = counter()
render(div(initial, initial), document.body)
```

Both projections subscribe to the same observer's current observation.
Clicking either advances both. Their DOM nodes are separate; they share the
selected description and its handlers.

Independent counters need independent definitions:

```js
const createCounter = () => {
  const counter = observe((count = 0) =>
    button({ onclick: () => counter(count + 1) }, count))
  return counter
}

const left = createCounter()
const right = createCounter()
```

Keep a child's vnode to preserve its current observation through parent
updates. Mounting a fresh call such as `left(0)` selects the newly described
state. An event return can explicitly select an earlier observation again.

### Let the DOM follow

The DOM is a projection of the selected observations. Its parent–child
containment forms a [tree](https://dom.spec.whatwg.org/#trees); event handlers
and other JavaScript references connect it to the wider graph. The browser
turns that DOM into what appears on screen.

The visible page is one aspect of the application's state. Two observations can
look the same while carrying different handlers and different possible next
steps. Each observer carries its own current observation, so several parts of a
page can evolve independently.

The state transition selects an observation. Elements patches existing DOM
nodes where possible and installs the corresponding event handlers. Input
values, focus, and other native state can survive when their nodes and
properties are preserved. Native state belongs to each DOM projection.

The original observation remains data. Selecting a later observation does not
rewrite earlier source arrays. Link navigation uses this distinction too:
Back and Forward can select saved observations, including their handlers,
without taking a snapshot of the DOM.

### Writing alongside live examples

This article lives in `examples/content/introduction.md`. The demo imports it
as text and composes it with ordinary Elements functions:

```js
import introduction from '../content/introduction.md?raw'
import { markdown } from './markdown.js'

const writing = () => section(markdown(introduction))
```

Fenced code blocks explain examples without executing them. The Todos and Scope
pages provide live observers to explore. The Markdown helper belongs to the
demo and uses `markdown-it` with raw HTML disabled.
