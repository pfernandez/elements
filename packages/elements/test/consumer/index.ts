import { button, observe, div, input, render } from '@pfern/elements'
import { math, mi } from '@pfern/elements/mathml'
import { box, scene, x3d, type BoxProps, type X3DNode } from '@pfern/elements-x3dom'

// Strict TypeScript needs a return annotation for a self-referencing initializer.
// The JavaScript examples do not need this annotation.
const counter = observe((n = 0): ReturnType<typeof button> =>
  button({ onclick: () => counter(n + 1) }, n))

counter(1)
// @ts-expect-error The initial call has the observer's argument types.
counter('not a number')

const label = observe((n = 0) => div(n))
label(1)
// @ts-expect-error Non-recursive observers infer their parameters without annotations.
label('not a number')

const props: BoxProps = { size: '1 1 1' }
const node: X3DNode = box(props)
render(div(counter(), math(mi('x')), x3d(scene(node)),
           input({ style: 'color: red', oninput: ({ value }) => div(value) }),
           input({ type: 'checkbox', onchange: ({ checked }) => div(String(checked)) })),
       document.body)
