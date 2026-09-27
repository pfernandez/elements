## Writing with Elements

A page can mix **prose** and interactive examples without making them the same
thing. Write the explanation in Markdown, then compose it with ordinary Elements
functions.

### Views are values

An Elements view is a nested array describing what to display. Tag helpers keep
that description readable:

```js
div(
  h2('A small idea'),
  p('Build a view by composing functions.'))
```

Components add identity to those descriptions. Calling one constructs a view;
returning that view from an event handler selects what to display next.

> The description stays data. The renderer takes care of the DOM.

### Prose belongs in its own file

This page is loaded from `examples/content/introduction.md`. The demo imports it
as text and passes it to a small Markdown helper:

```js
import introduction from '../content/introduction.md?raw'
import { markdown } from './markdown.js'

const writing = () => section(markdown(introduction))
```

- Headings and lists give the writing structure.
- Fenced code blocks show examples without executing them.
- Live examples remain ordinary JavaScript components beside the prose.

The helper lives in the demo, not the Elements package. It uses
[markdown-it](https://github.com/markdown-it/markdown-it) with raw HTML disabled.
Links in the prose behave like ordinary browser links.
