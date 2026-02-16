# @pfern/elements-x3dom

X3DOM-powered X3D helpers for Elements.js.

## Install

```sh
npm i @pfern/elements @pfern/elements-x3dom
```

## Usage

```js
import { render, div } from '@pfern/elements'
import { appearance, box, material, scene, shape, transform, viewpoint, x3d }
  from '@pfern/elements-x3dom'

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
This package always loads the `x3dom-full` bundle (plus `x3dom.css`) for
correctness and stability.

All assets are vendored so apps can run without a CDN or additional runtime
fetch steps.

## Naming

- Helpers are exported in `camelCase` (e.g. `audioClip`, `binaryGeometry`), but
  generate lowercase tags (e.g. `<audioclip>`, `<binarygeometry>`).
- Collision-prone names are prefixed: `switch` → `x3dswitch`, `text` → `x3dtext`,
  `param` → `x3dparam`.
- `route` is exported as a helper even though it is not registered via
  `registerNodeType` in X3DOM.
