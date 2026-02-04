# @pfern/elements

A minimalist, pure functional declarative UI toolkit.

Elements.js is JS-first: TypeScript is not required at runtime. This package
ships `.d.ts` files so editors like VSCode can provide rich inline docs and
autocomplete.

## Install

```sh
npm i @pfern/elements
```

## Usage

```js
import { button, component, div, output, render } from '@pfern/elements'

export const counter = component((count = 0) =>
  div(
    output(count),
    button({ onclick: () => counter(count + 1) }, 'Increment')))

render(counter(), document.body)
```
