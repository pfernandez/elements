**This is a work in progress.**

### FIXME — Mathematical and technical accuracy

- Fixed-point combinator definition. Keep \(fix(F)=F(fix(F))\), but correct the explanation: `fix` produces a fixed point of \(F\). Clarify that a recursive function is a fixed point of its defining transformation, not necessarily of itself.

* SKI combinators. A combinator is a function expression with no free variables, not necessarily a function that transforms other combinators. Clarify that SKI is a computationally complete basis from which fixed-point combinators can be constructed.

- Closures and recursion. `onclick` captures `x` and the `count` binding, but `x + 1` and the recursive call aren't evaluated until the event occurs. No recursive call is suspended on the stack.

* Fixed-point observer claim. Replace the assertion that an observer is a fixed point of its state transitions. Its recursive definition satisfies \(O=F(O)\), while its state can change under \(T\). The observer's persistent identity is invariant across those transitions.

- Incorrect equations. Remove or correct `fix(f) = f(fix(x))`, `count(increment) = increment(count(increment))`, and `count(x) = count(increment(x))`. They don't accurately express the intended recursive fixed-point relationship.

* Functional purity. Don't assert that `observe` creates pure functions merely because they return arrays. A view can be pure, but `observe` and the runtime maintain identity and selection state, and perform effects during projection.

- Trees versus graphs. Vnode containment is normally tree-shaped. Closures, shared identities, and recursive references form the larger graph. Distinguish these rather than saying that vdom itself is necessarily not a tree.

* JavaScript and HTML examples. Correct `div.class` to `div.className`, `button.innertext` to `button.innerText` or `textContent`, `output(count)` to `output(x)`, and the missing comma after the `div` attributes. Call `count(0)` in the imperative example. The serialized HTML shouldn't contain a JavaScript function as a literal `onclick` attribute; the initial output should display `0` and the container should retain its class.

One additional sentence I'd qualify is:

> Elements tracks and preserves the identity of both the vdom emitted by an observer and of the DOM node it represents.

Elements preserves observer identity and reconciles DOM nodes where possible. It doesn't guarantee permanent one-to-one identity between a vnode and a DOM node.

I would leave the remaining conceptual discussion largely intact for now. In particular, I wouldn't introduce \(F\), \(T\), and \(P\) everywhere yet. Your article's progression can remain exploratory while avoiding these specific inaccuracies.

---

## Fixed Points, Recursive State Observers, and the Transition Graph

The Elements library centers around a family of concepts that may feel unfamiliar, or that you've heard of before but never quite put together into a coherent mental model. In this page I'll begin with an overview of these concepts,
then describe how they relate to the library.

### The Fixed Point

We can begin with the mathematical definition currently [on Wikipedia](https://en.wikipedia.org/wiki/Fixed_point_(mathematics)) at the time that I'm writing this:

> A fixed point, also known as an invariant point, is a value that does not
change under a given transformation.

An example of this is the function $f(x) = x^2$, which leaves the state of $x$ unchanged for values of 0 and 1. Any other value passed to $f$ is not a fixed point under the trasformation $x \rarr x^2$ because their state is changed: 2 becomes 4, 3 becomes 9, etc.

The mathemaical definition of a fixed-point _combinator_ is

$$fix(f) = f(fix(f))$$

where $fix$ is a function that takes another function $f$ as its argument, which itself takes the original function call and returns it. $fix$ and $f$ together form a recursive cycle.

A [combinator](https://writings.stephenwolfram.com/2020/12/combinators-a-centennial-view/) is a function that transforms other combinators. These three examples are the complete basis of the [SKI Calculus](https://en.wikipedia.org/wiki/SKI_combinator_calculus) system of functional logic, including $fix$.

$$
\begin{align*}
I(x) &= x \\
K(x,\ y) &= x \\
S(x,\ y,\ z) &= x(z)(y(z)) \\
\end{align*}
$$

You might think of $I$ as "self", $K$ as "select", and $S$ as "share".

### The Observer Pattern

In software design, the [observer pattern](https://en.wikipedia.org/wiki/Observer_pattern) describes an object (the observer) that listens for state changes published by another object (the observable subject). An example is an element on a screen that displays the result of a calculation such as $x^2$: If the screen shows 1 and the user enters 1 and runs the program, there's nothing to change, but it the user enters 2, it updates the screen to show 4.

### State and State Transitions

A fixed point and an observer share a common idea: The _state transition_. "State" here refers to anything that can change under a "transition", or transform. In both of the above examples, the state of the value $x$ transitions from 2 to 4.

### Closures, Side Effects, and Projection

Let's write a simple JavaScript function called `count` that begins with an intital state of 0 and displays the result. First we'll do a little setup to create the page elements:

```js
// Create output and button elements.
const output = document.createElement('output')
const button = document.createElement('button')
const div = document.createElement('div')
div.class = 'container'
button.innertext = 'Increment'

// Insert the elements into the DOM.
div.append(output, button)
document.body.append(div)
```

then define a function to do the work:

```js
const count = (x = 0) => {
  output.innerText = x
  button.onclick = () => count(x + 1)
}
```

When `count` is called, it performs the _side effect_ `output.text = state`, which _mutates_ the previous value held by the `output` DOM element, causing the _projection_ on the screen to be updated by a web browser. `count` then computes `x + 1` internally, forming a _closure_ around its own next input where it is suspendend within the recursive call to `count` until `onclick` receives an event, beginning a new cycle.

## The Elements Library

Now we have enough vocabulary to understand the thesis around which the Elements library is designed.

### The Fixed-Point Recursive State Observer

If a fixed point is a value that remains unchanged under a given transform, a recursive state observer is a fixed point with respect to the state transitions it encloses. Although the enclosed state may change when it responds to an event, the observer itself remains fixed.

Along with functions to simplify the creation of DOM elements, the Elements library provides the `observe` helper to define such an observer with the signature `observer = observe(transition)`, where `transition` is a function that describes a state transition and its projection. The example we've been working with can be written

```js
import { body, button, div, observe, output, render } from '@pfern/elements'

const counter = observe((x = 0) =>
  div({ class: 'container' }
    output(count),
    button({ onclick: () => counter(x + 1) })))

render(body(counter(0)))
```

With each recursive state transition, the DOM is efficiently updated with the next projection. The imperative work of DOM element creation and mutation is abstracted away.

The form of the observer is that of the fixed-point combinator, which is that of any recursive function. If we remove the side-effecting machinery and temination condition, and name the operation `x + 1` $increment$, we're left with `count(x) = count(increment(x))`, increasing forever within its own closure.

$$
\begin{align*}
\end{align*}
$$


### Functional Purity

The opposite of a side-effecting function is a _pure_ function. A pure function performs no side effects and always returns a deterministic result. The same input always results in the same output no matter when, where, or how often the function is called. For this reason, pure functions are easy to reason about and test.

Observers created with `observe` are pure functions because they return array data that represents the HTML to be rendered. We refer to these arrays as _vdom_.

The value passed to `render` looks like this:

```js
[body, {},
  ['div', { class: 'container' },
    ['output', {}, 0],
    ['button', { onclick: () => counter(count + 1) }]]]
```

`render` will convert this to the equivalent HTML, and `onclick` contains the next call to `counter` with the closure around its next state value. When the button is clicked, Elements intercepts the event and performs the DOM update using the new vdom returned deterministically by `counter(count + 1)`. In fact, it's possible to precompute the result rather than evaluate it lazily on-demand, i.e. `{ onclick: () => ['div' ..., ['output', {}, 1], ...] }`. In this case that might not be a great idea, but it illustrates that it's all ultimately just vdom, all the way down.

### The Transition Graph

At the surface, vdom mirrors the structure of a [DOM tree](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model#what_is_a_dom_tree), which is a tree structure whose nodes represent an HTML or XML document's contents. The HTML generated using the vdom state from our previous example is

```html
<body>
  <div>
    <output></output>
    <button onclick="() => counter(count + 1)"></button>
  </div>
</body>
```

The outer `body` node is the trunk of the tree, the `div` is a branch node, and `output` and `button` branch off of the `div`. But because the state represented by vdom is self-referential, it is not a tree.

Elements tracks and preserves the identity of both the vdom emitted by an observer such as `counter` and of the DOM node it represents. The vdom is a graph because it can point back at nodes anywhere else in the tree. The DOM, the HTML, the pixels you see on the screen, and the mental image it creates are all tree-shaped projections of the underlying graph of state transitions. An observer is a fixed point over the graph of state transitions that occur within its own self-description.


---

**The article below was generated along with the README.**


## Recursive State Observers

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
