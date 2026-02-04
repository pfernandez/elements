# @pfern/elements-3d

X3DOM-powered X3D helpers for Elements.js.

## Install

```sh
npm i @pfern/elements @pfern/elements-3d
```

## Usage

```js
import { render, div } from '@pfern/elements'
import { appearance, box, material, scene, shape, transform, viewpoint, x3d }
  from '@pfern/elements-3d'

export const cubeScene = () =>
  x3d(
    scene(
      viewpoint({ position: '0 0 6', description: 'Default View' }),
      transform({ rotation: '0 1 0 0.5' },
        shape(
          appearance(material({ diffuseColor: '0.2 0.6 1.0' })),
          box()))))

render(div({}, cubeScene()), document.body)
```

## Loading

X3DOM is lazy-loaded the first time you call any helper from this package.
It loads a small “core” bundle first, and only loads the larger “full” bundle
if you call a helper for a node that core doesn’t register.

This package includes both bundles (plus `x3dom.css`) so apps can run without a
CDN or additional runtime fetch steps.
