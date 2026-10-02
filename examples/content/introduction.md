## Recursive state observers

Elements is built around recursive composition and declarative state
transitions. Ordinary functions compose interface data, and event handlers can
return to the same observer with new state. Each call produces an observation;
Elements selects which observation of that stable identity is current.

The model has five parts:

- a **view** is a pure function from state to interface data;
- an **observation** is the vnode data produced by that view;
- an **observer** is the stable identity created by `observe(view)`;
- **selection** chooses the observer's current observation;
- a **projection** is a mounted DOM realization of that selection.

The distinction between constructing an observation and selecting it is the
center of the model.

### Begin with a value

Start with a view:

```js
const view = count => output(count)
```

`count` is the state. Calling `view(3)` produces an observation:

```js
['output', {}, 3]
```

The array is data. It describes an element without creating a DOM node. Tag
helpers compose these descriptions directly:

```js
const view = count =>
  div(
    output(count),
    ul([
      li('Previous'),
      li('Next')
    ]))

// ['div', {},
//   ['output', {}, count],
//   ['ul', {},
//     ['li', {}, 'Previous'],
//     ['li', {}, 'Next']]]
```

Arrays of vnodes are flattened into the surrounding vnode, so mapped children
can be passed directly without argument spreading. An observation can also
contain event handlers; those functions describe the interactions available in
that state.

### Give observations an identity

Pass the view to `observe`:

```js
import { button, observe, div, output, render } from '@pfern/elements'

const counter = observe((count = 0) =>
  div(
    output(count),
    button({ onclick: () => counter(count + 1) },
           'Increment')))

render(counter(), document.body)
```

`observe` establishes one stable identity for the counter. Each call to
`counter(...)` constructs an observation associated with that identity.

The identity is not the observation. The observer remains the same while its
selected observation changes:

```text
counter
   │
   ├── observation at 0
   ├── observation at 1
   └── observation at 2
```

Only one of those observations is current at a time.

### Construction is pure; selection is an effect

Calling an observer does not by itself advance it:

```js
counter(10)                       // Construct an observation.
() => { counter(10) }             // Construct it, then discard it.
() => counter(10)                 // Event return: select it.
```

The first two expressions create vnode data and have no rendering effect. In
the third, Elements receives the returned vnode at the event boundary and
selects its observation.

This separation means application code can compute a candidate state without
committing to it. It is especially useful with asynchronous work:

```js
const counter = observe((count = 0) =>
  button({ onclick: async () => {
    const next = counter(count + 1)
    await save(count + 1)
    return next
  } }, count))
```

`next` is only data while `save` is pending. When the Promise resolves to it,
Elements selects that observation. If several handlers are pending, resolved
observations are selected in completion order.

A fresh observer vnode is also selected when it is first projected into the
DOM. Reusing an already projected vnode does not reset the observer; it projects
the observer's current observation. Event returns are explicit selections even
when the returned vnode was constructed earlier.

### Follow one transition

The first click of the counter proceeds in a small sequence:

1. `counter()` constructs an observation whose handler closes over `count = 0`.
2. The first projection selects that observation and renders zero.
3. Clicking the button runs its handler.
4. The handler calls `counter(1)`, constructing another observation.
5. Returning that vnode selects it.
6. Every projection of `counter` patches to show one.
7. The new handler now closes over `count = 1`.

Nothing needs to mutate the old vnode. State advances by selecting another
observation of the same identity.

### Recursion happens across events

The definition refers to `counter` from inside its own result:

```text
observer → observation → event handler
    ↑                         │
    └─────────────────────────┘
```

That is a real recursive cycle, but the recursive call is deferred inside the
handler. Constructing the current observation therefore terminates normally.
An event provides the occasion for one more step.

A closure is simply a function that retains access to values from the scope in
which it was created. Here, each handler carries the state from which the next
transition begins.

This is why **recursive state observer** is a useful name: the observer presents
one state and contains interactions that can return another observation of the
same identity.

The model is continuation-like without requiring a continuation API. The
handler contains the computation that can continue from the current state; its
returned observation tells Elements what state to select next.

### One identity can have many projections

An observer may appear in several places:

```js
const initial = counter()
render(div(initial, initial), document.body)
```

There is still one observer identity and one selected observation:

```text
                 counter
                    │
             current observation
                /         \
       projection A     projection B
```

Clicking either projection advances `counter`, so both update.

The projections are not the same DOM nodes. Native browser state belongs to
each projection individually. One input may be focused or contain an edited
value while another projection of the same observation does not.

Independent state requires independent observer identities:

```js
const createCounter = () => {
  const counter = observe((count = 0) =>
    button({ onclick: () => counter(count + 1) }, count))
  return counter
}

const left = createCounter()
const right = createCounter()
```

Calling the same observer twice does not create two component instances.
Calling `observe` twice does.

### The visible tree and the transition graph are different

Vnode nesting describes containment:

```text
div
├── output
└── button
```

That is a tree. References inside handlers add edges that are not part of the
nesting tree. The counter's button points back to the counter observer. A button
in one observer can just as easily return an observation belonging to another.

So an Elements program has at least two useful structures:

- the **projection tree**, describing where observations appear;
- the **transition graph**, describing where interactions can continue.

The transition graph is implicit in ordinary JavaScript references and
closures. Elements does not enumerate or store a graph of every future
observation. New observations can be constructed only when an interaction
requires them.

For readers coming from Lisp, this should feel familiar: functions construct
data, closures retain values, references form recursive structure, and an
interpreter at the boundary gives the data operational meaning.

### The DOM is a projection

When an observation is selected, Elements patches its mounted DOM projections.
The vnode remains ordinary source data.

This distinction matters because logical and native state are not identical.
The observer owns the selected observation. Each projection owns its actual DOM
nodes and therefore its browser-managed state: focus, selection, edited input
values, media state, and so on.

Elements reuses compatible nodes where it can. Retained vnode references,
explicit keys, unique observer identities, and finally sibling positions help
determine which existing nodes correspond to the next observation.

The result is a useful separation:

```text
observer identity       stable
selected observation    changes by selection
source vnode             remains data
DOM projection           patched in place where possible
native DOM state         belongs to that projection
```

### Navigation is the same operation

Page navigation does not require a separate state architecture. An ordinary
same-origin link can return the next observation of a page observer:

```js
a({ href: '/about', onclick: () => page('/about') }, 'About')
```

For an eligible click, Elements selects the returned observation and records the
URL. Back and Forward restore previously selected observations.

History stores observations, including the closures reachable through their
handlers. It does not snapshot DOM nodes, and it cannot serialize those
closures across a full page reload. After a reload, the URL again becomes the
source from which the application constructs its initial observation.

Navigation is therefore another case of the same primitive: **select an
observation**.

### One small interpreter boundary

Most application code only constructs data and functions. Elements contains the
imperative machinery needed to make those values operational in a browser:

- event handlers turn returned vnodes into selections;
- observers notify their mounted projections;
- the DOM renderer patches those projections;
- browser history records and restores selections;
- `toHtmlString()` interprets the same vnode data as HTML instead of live DOM.

This is the intended boundary of the library. Purity belongs to the
description API; the runtime performs the effects required to project those
descriptions into the browser.

### Writing alongside live examples

This article lives in `examples/content/introduction.md`. The demo imports it
as text and composes it with ordinary Elements functions:

```js
import introduction from '../content/introduction.md?raw'
import { markdown } from './markdown.js'

const writing = () => section(markdown(introduction))
```

The Todos and Scope pages provide live observers to explore. The Markdown
helper belongs to the demo and uses `markdown-it` with raw HTML disabled.
