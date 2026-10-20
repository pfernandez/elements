import * as core from '../elements.js'
import * as html from '../html.js'
import * as svg from '../svg.js'
import * as mathml from '../mathml.js'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { htmlElements } from '../src/vocabularies/html.js'
import { svgElements } from '../src/vocabularies/svg.js'
import { mathmlElements } from '../src/vocabularies/mathml.js'

for (const [name, vocabulary, metadata] of [
  ['html', html, htmlElements], ['svg', svg, svgElements], ['mathml', mathml, mathmlElements]
]) test(`${name} exposes the same helpers through both import forms`, () => {
  assert.equal(core[name], vocabulary)
  for (const { name, tag } of metadata) {
    const vnode = vocabulary[name]({ id: 'x' }, 'content')
    assert.deepEqual(vnode, [tag, { id: 'x' }, 'content'])
  }
})

test('the core API contains operations and vocabularies without legacy flat exports', () => {
  assert.deepEqual(Object.keys(core).sort(),
    ['DEBUG', 'element', 'fragment', 'html', 'mathml', 'observe', 'project', 'svg', 'toHtmlString'].sort())
})
