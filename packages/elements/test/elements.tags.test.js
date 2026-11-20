import * as core from '../elements.js'
import * as html from '../html.js'
import * as mathml from '../mathml.js'
import * as svg from '../svg.js'
import assert from 'node:assert/strict'
import { test } from 'node:test'

test('namespace and subpath imports expose the same helpers', () => {
  assert.equal(core.html, html)
  assert.equal(core.svg, svg)
  assert.equal(core.mathml, mathml)
  assert.equal(html.htmlvar()[0], 'var')
  assert.equal(svg.svgswitch()[0], 'switch')
  assert.equal(mathml.annotationXml()[0], 'annotation-xml')
})
