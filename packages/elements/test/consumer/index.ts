import { element, fragment, html, mathml, observe, project, svg as drawing } from '@pfern/elements'
import { button, div, input } from '@pfern/elements/html'
import { circle, svg } from '@pfern/elements/svg'
import { math, mi } from '@pfern/elements/mathml'
import { box, scene, x3d, type BoxProps, type X3DNode } from '@pfern/elements-x3dom'

// Strict TypeScript needs a return annotation for a self-referencing initializer.
// The JavaScript examples do not need this annotation.
const counter = observe((n = 0): ReturnType<typeof button> =>
  button({ onclick: () => counter(n + 1) }, n))

counter(1)
// @ts-expect-error The initial call has the view's argument types.
counter('not a number')

const label = observe((n = 0) => div(n))
label(1)
// @ts-expect-error Non-recursive views infer their parameters without annotations.
label('not a number')

const props: BoxProps = { size: '1 1 1' }
const node: X3DNode = box(props)
const custom = element('custom-element')('custom')
const picture = svg(circle({ r: 5 }))
project(div(counter(), custom, picture, math(mi('x')), x3d(scene(node)),
           input({ style: 'color: red', oninput: ({ value }) => div(value) }),
           input({ type: 'checkbox', onchange: ({ checked }) => div(String(checked)) })),
       document.body)

project(fragment(html.title('page'), drawing.title('drawing'), mathml.mi('x')),
        document.createDocumentFragment())
project(element('item', 'urn:example')(), document.body)

const detached: Element | DocumentFragment = project(counter())
document.body.append(detached)
document.body.replaceWith(project(html.body()))
const mounted: Element | DocumentFragment = project(counter(), document.body)
// @ts-expect-error Project has no replacement mode.
project(counter(), document.body, { replace: true })
// @ts-expect-error Tags are exported through vocabularies, not the main module.
import { button as removedFlatHelper } from '@pfern/elements'
