# @pfern/elements-x3dom

X3DOM-powered X3D helpers for Elements.js.

Each X3D helper uses the same `element(tag)` vnode constructor as the built-in
HTML, SVG, and MathML vocabularies. Constructing a vnode does not load assets or
touch the DOM.

## Install

```sh
npm i @pfern/elements @pfern/elements-x3dom
```

## Usage

```js
import { project } from '@pfern/elements'
import { div } from '@pfern/elements/html'
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

document.body.append(project(div(cubeScene())))
```

## Loading

Importing the package watches the importing document for connected `<x3d>`
scenes. The first connection loads `x3dom-full` and `x3dom.css` automatically;
unused descriptions and detached projections load neither. Import the package
in each document that hosts scenes, including iframe documents.

Later scenes share the loaded engine and stylesheet. Reconnection initializes
scenes that X3DOM tore down, and a missing stylesheet is restored in the current
head. Authors do not need to include CSS or transfer assets during root replacement.

All assets are vendored so apps can run without a CDN or additional runtime
fetch steps.

## Naming

- Helpers are exported in `camelCase` (e.g. `audioClip`, `binaryGeometry`), but
  generate lowercase tags (e.g. `<audioclip>`, `<binarygeometry>`).
- Collision-prone names are prefixed: `switch` → `x3dswitch`, `text` → `x3dtext`,
  `param` → `x3dparam`.
- `route` is exported as a helper even though it is not registered via
  `registerNodeType` in X3DOM.
