# @pfern/elements

A minimalist, pure functional declarative UI toolkit.

Elements.js is JS-first: TypeScript is not required at runtime. This package
ships `.d.ts` files so editors like VSCode can provide rich inline docs and
autocomplete.

## Install

```sh
npm i @pfern/elements
```

## How Updates Work

Most apps call `render()` once on page load. You can force a full remount via `render(vtree, container, { replace: true })`. After that, updates happen when a
DOM event handler (e.g. `onclick`, `onsubmit`) returns the next vnode: Elements.js
replaces the closest component boundary.


Note: for `<a href>` links, if an `onclick` handler returns a vnode, Elements.js
calls `event.preventDefault()` for unmodified left-clicks so SPAs can use real
links without manual boilerplate.



### Routing

For SPAs, register a URL-change handler once:

```js
import { onNavigate } from '@pfern/elements'

onNavigate(() => App())
```

With a handler registered, `a({ href: '/path' }, ...)` intercepts unmodified
left-clicks for same-origin links and uses the History API instead of reloading
the page.

### SSG / SSR

For build-time prerendering (static site generation) or server-side rendering,
Elements.js can serialize vnodes to HTML:

```js
import { div, html, head, body, title, toHtmlString } from '@pfern/elements'

toHtmlString(div('Hello')) // => <div>Hello</div>

const doc =
  html(
    head(title('My page')),
    body(div('Hello')))

const htmlText = toHtmlString(doc, { doctype: true })
```

Notes:
- Event handlers (function props like `onclick`) are dropped during
  serialization.
- `innerHTML` is treated as an explicit escape hatch and is inserted verbatim.

## Usage

```js
import { button, component, div, output, render } from '@pfern/elements'

export const counter = component((count = 0) =>
  div(
    output(count),
    button({ onclick: () => counter(count + 1) }, 'Increment')))

render(counter(), document.body)
```

## MathML (curated)

The runtime supports rendering MathML tags natively (via the MathML namespace).
A small curated helper set is available as a separate entrypoint:

```js
import { apply, ci, csymbol, math } from '@pfern/elements/mathml'

math(
  apply(csymbol({ cd: 'ski' }, 'app'), ci('f'), ci('x')))
```

## Optional 3D

X3DOM / X3D helpers live in `@pfern/elements-x3dom` to keep this package small:

```sh
npm i @pfern/elements @pfern/elements-x3dom
```
