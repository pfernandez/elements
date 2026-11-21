# Migrating from 0.2.1 to 0.3.0

## Mount once per placement

Find calls to `render` that run after startup. In 0.2.1, rendering again into
the same host patched its current tree. For example, this button rerenders
into an initially empty `<main id="app"></main>` on every click.

```js
import { button, render } from '@pfern/elements'

const host = document.querySelector('#app')
const show = n => render(button({ onclick: () => show(n + 1) }, n), host)

show(0)
```

In 0.3.0, mount once with `project` and return the next observation from the
handler. Calling `project` on each click would append a second button, then a
third.

```js
import { button, observe, project } from '@pfern/elements/html'

const counter = observe(n => button({ onclick: () => counter(n + 1) }, n))
project(counter(0), document.querySelector('#app'))
```

Replace `component(view)` with `observe(view)`. Calling the observer constructs
a vnode. If an old timer or subscription called a mounted component to update
it, that call alone now leaves the DOM untouched. Event handlers can return
a vnode or a Promise that resolves to one. Returning an observer vnode updates
every placement of that observer. Define separate observers for independent
counters.

`project` returns the DOM it creates. With a host, it preserves existing
children. For an intentional full remount in a host your app owns, use
`host.replaceChildren(project(counter(0)))` in place of `{ replace: true }`.
Without a host, ordinary roots stay detached. An HTML `html`, `head`, or
`body` root replaces the corresponding document element, so include any
styles or app roots it must retain.

## Update imports and handlers

- Move flat HTML and SVG imports to `@pfern/elements/html` and
  `@pfern/elements/svg`. For the old `elements` map, import the named
  `html`, `svg`, or `mathml` namespace from the package root. The document
  constructor there is `html.html`. `toHtmlString` remains a root export.
- Change `oninput: value => search(value)` to
  `oninput: ({ value }) => search(value)`. Both `oninput` and `onchange`
  now receive the control, followed by the event. Read `checked` for a
  checkbox. The first `onsubmit` argument is still the form's controls.

## Return the destination from a link

Replace `onNavigate` registration and link handlers that call `navigate`
with a page observer. Read the initial URL at startup. On an ordinary
same-origin click, return the destination's observation and give the link
its real URL.

```js
import { a, h1, main, observe, project } from '@pfern/elements/html'

const page = observe(path => main(
  h1(path === '/about' ? 'About' : 'Home'),
  a({ href: '/', onclick: () => page('/') }, 'Home'),
  a({ href: '/about', onclick: () => page('/about') }, 'About')))

project(page(location.pathname), document.querySelector('#app'))
```

Back and Forward restore the recorded observations. A direct visit or reload
starts from the URL again, so the server must serve the page at both paths.
For a full browser navigation initiated by application code, use
`location.assign(url)` or `location.replace(url)`.
