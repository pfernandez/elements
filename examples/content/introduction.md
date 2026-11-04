## Writing alongside live examples

This article lives in `examples/content/introduction.md`. The demo imports it
as text and composes it with ordinary Elements functions:

```js
import introduction from '../content/introduction.md?raw'
import { markdown } from './markdown.js'

const writing = () => section(markdown(introduction))
```

The Todos and Scope pages provide live observers to explore. The Markdown
helper belongs to the demo and uses `markdown-it` to generate the HTML.
