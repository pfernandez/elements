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

## Usage

```js
import { button, component, div, output, render } from '@pfern/elements'

export const counter = component((count = 0) =>
  div(
    output(count),
    button({ onclick: () => counter(count + 1) }, 'Increment')))

render(counter(), document.body)
```

## Optional 3D

X3DOM / X3D helpers live in `@pfern/elements-3d` to keep this package small:

```sh
npm i @pfern/elements @pfern/elements-3d
```
