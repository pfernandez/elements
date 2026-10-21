import assert from 'node:assert/strict'
import * as core from '@pfern/elements'
import * as html from '@pfern/elements/html'
import * as svg from '@pfern/elements/svg'
import * as mathml from '@pfern/elements/mathml'
import * as x3dom from '@pfern/elements-x3dom'

for (const vocabulary of [html, svg, mathml, x3dom])
  for (const name of Object.keys(core).filter(name => !['html', 'svg', 'mathml'].includes(name)))
    assert.equal(vocabulary[name], core[name], `${name} must share the core implementation`)

const content = html.observe(() =>
  html.div(mathml.math(mathml.mi('x')), svg.svg(svg.circle({ r: 1 })), x3dom.box()))()
assert.equal(x3dom.toHtmlString(content),
             '<div><math><mi>x</mi></math><svg><circle r="1"></circle></svg><box></box></div>')
