import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { element, observe, project } from '../elements.js'
import { button, div, span } from '../html.js'
import { text as svgText } from '../svg.js'
import { createFakeDom } from './fake-dom.js'

let previousDocument
beforeEach(() => {
  previousDocument = globalThis.document
  globalThis.document = createFakeDom().document
})
afterEach(() => { globalThis.document = previousDocument })
const select = vnode => project(button({ onclick: () => vnode })).onclick({})

test('SVG text and ordinary element names do not collide with internal node kinds', () => {
  const empty = element('empty')
  const view = observe(n => div(n === 0 ? 'plain' : n === 1 ? svgText('label') : empty('content')))
  const root = project(view(0))
  assert.equal(root.firstChild.nodeType, 3)
  select(view(1))
  assert.equal(root.firstChild.nodeType, 1)
  assert.equal(root.firstChild.namespaceURI, 'http://www.w3.org/2000/svg')
  assert.equal(root.firstChild.tagName.toLowerCase(), 'text')
  assert.equal(root.textContent, 'label')
  select(view(2))
  assert.equal(root.firstChild.nodeType, 1)
  assert.equal(root.firstChild.tagName.toLowerCase(), 'empty')
  assert.equal(root.textContent, 'content')
  select(view(0))
  assert.equal(root.firstChild.nodeType, 3)
})

test('a failed root replacement can be corrected with a fresh observation', () => {
  const view = observe(n => n === 0 ? div('old')
    : span(n === 1 ? { className: 'invalid' } : { title: 'fixed' }, 'new'))
  const host = document.createElement('section')
  project(view(0), host)
  assert.throws(() => select(view(1)), TypeError)
  select(view(2))
  assert.equal(host.childNodes.length, 1)
  assert.equal(host.firstChild.tagName, 'SPAN')
  assert.equal(host.firstChild.getAttribute('title'), 'fixed')
  assert.equal(host.textContent, 'new')
})
