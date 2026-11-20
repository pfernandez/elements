import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { observe, project } from '../elements.js'
import { button, div, option, select, span } from '../html.js'
import { createFakeDom } from './fake-dom.js'

let previousDocument
beforeEach(() => {
  previousDocument = globalThis.document
  globalThis.document = createFakeDom().document
})
afterEach(() => { globalThis.document = previousDocument })
const click = node => node.onclick({})
const selectWithEvent = source => click(project(button({ onclick: () => source })))
const texts = node => node.childNodes.map(child => child.textContent)

test('fresh sibling observations select in projection order, not construction order', () => {
  const child = observe(n => span(n))
  const last = child(2), first = child(1)
  const graph = div(first, last)
  assert.deepEqual(texts(project(graph)), ['2', '2'])
  // Already-presented sources follow the identity rather than selecting again.
  assert.deepEqual(texts(project(div(last, first))), ['2', '2'])
})

test('fresh descendants select in traversal order across parallel parent projections', () => {
  const child = observe(n => span(n))
  const wrapper = observe(n => div(child(n)))
  const parent = observe((a, b, c) => div(child(a), wrapper(b), child(c)))
  const initial = parent(0, 0, 0)
  const left = project(initial), right = project(initial)
  selectWithEvent(parent(1, 2, 3))
  assert.deepEqual(texts(left), ['3', '3', '3'])
  assert.deepEqual(texts(right), ['3', '3', '3'])
  selectWithEvent(parent(4, 5, 6))
  assert.deepEqual(texts(left), ['6', '6', '6'])
  assert.deepEqual(texts(right), ['6', '6', '6'])
})

test('a retained source after a fresh selection does not reset it, but an event can', () => {
  const child = observe(n => span(n))
  const retained = child(0)
  const parent = observe(source => div(source, retained))
  const root = project(parent(retained))
  selectWithEvent(parent(child(1)))
  assert.deepEqual(texts(root), ['1', '1'])
  selectWithEvent(retained)
  assert.deepEqual(texts(root), ['0', '0'])
})

test('a fresh call with identical arguments can reset the current observation', () => {
  const child = observe((n = 0) => button({ onclick: () => child(n + 1) }, n))
  const initial = child()
  const left = project(initial), right = project(initial)
  click(left)
  const reset = child()
  assert.deepEqual([left.textContent, right.textContent], ['1', '1'])
  project(reset)
  assert.deepEqual([left.textContent, right.textContent], ['0', '0'])
})

test('a reentrant event can synchronously update a different observer', () => {
  const other = observe(n => span(n))
  const parallel = project(other(0))
  const control = project(button({ onclick: () => other(2) }))
  const view = observe(n => div({ 'data-state': n }, n))
  const root = project(view(0))
  const setAttribute = root.setAttribute.bind(root)
  const seen = []
  root.setAttribute = (key, value) => {
    setAttribute(key, value)
    click(control)
    seen.push(parallel.textContent)
  }
  selectWithEvent(view(1))
  assert.deepEqual(seen, ['2'])
  assert.equal(root.textContent, '1')
})

test('a reentrant selection of the same observer leaves every projection current', () => {
  const view = observe(n => div({ 'data-state': n }, n))
  const initial = view(0), newer = view(2)
  const left = project(initial), right = project(initial)
  const control = project(button({ onclick: () => newer }))
  const setAttribute = left.setAttribute.bind(left)
  left.setAttribute = (key, value) => {
    setAttribute(key, value)
    if (value === '1') click(control)
  }
  selectWithEvent(view(1))
  assert.deepEqual([left.textContent, right.textContent], ['2', '2'])
})

test('a nested event can restore the source whose patch is still in flight', () => {
  const view = observe(n => div({ 'data-state': n, title: String(n) }, n))
  const initial = view(0)
  const root = project(initial)
  const setAttribute = root.setAttribute.bind(root)
  root.setAttribute = (key, value) => {
    setAttribute(key, value)
    if (key === 'data-state' && value === '1') selectWithEvent(initial)
  }
  selectWithEvent(view(1))
  assert.equal(root.textContent, '0')
  assert.equal(root.getAttribute('data-state'), '0')
  assert.equal(root.getAttribute('title'), '0')
})

test('a nested root replacement supersedes the active patch and remains live', () => {
  const view = observe(n => (n === 2 ? span : div)({ 'data-state': n }, n))
  const host = document.createElement('section')
  const root = project(view(0), host)
  const control = project(button({ onclick: () => view(2) }))
  const setAttribute = root.setAttribute.bind(root)
  root.setAttribute = (key, value) => {
    setAttribute(key, value)
    if (value === '1') click(control)
  }
  selectWithEvent(view(1))
  assert.equal(host.firstChild.tagName, 'SPAN')
  assert.equal(host.textContent, '2')
  selectWithEvent(view(3))
  assert.equal(host.firstChild.tagName, 'DIV')
  assert.equal(host.textContent, '3')
})

test('a nested parent update can remove the active observer without resuming its patch', () => {
  const child = observe(n => div({ 'data-state': n, title: String(n) }, n))
  const parent = observe(shown => div(shown ? child(0) : span('removed')))
  const host = project(parent(true))
  const root = host.firstChild
  const control = project(button({ onclick: () => parent(false) }))
  const setAttribute = root.setAttribute.bind(root)
  root.setAttribute = (key, value) => {
    setAttribute(key, value)
    if (key === 'data-state' && value === '1') click(control)
  }
  selectWithEvent(child(1))
  assert.equal(host.textContent, 'removed')
  assert.equal(root.textContent, '0')
  assert.equal(root.getAttribute('title'), '0')
})

test('assignment errors propagate without making a retry skip the failed property', () => {
  const view = observe(n => div({ 'data-state': n }, n))
  const root = project(view(0))
  const error = new Error('assignment failed')
  root.__throwOnSetAttribute.set('data-state', error)
  assert.throws(() => selectWithEvent(view(1)), candidate => candidate === error)
  root.__throwOnSetAttribute.clear()
  selectWithEvent(view(1))
  assert.equal(root.getAttribute('data-state'), '1')
  assert.equal(root.textContent, '1')
})

test('reapplying select values does not write to authored props', () => {
  const props = Object.freeze({ value: 'a' })
  const view = observe(n => select(props, option({ value: 'a' }, n)))
  const root = project(view(0))
  selectWithEvent(view(1))
  assert.equal(root.textContent, '1')
  assert.equal(root.value, 'a')
})

test('fresh text leaves retain native edits until their authored value changes', () => {
  const view = observe(n => span(n))
  const root = project(view(0)), text = root.firstChild
  text.nodeValue = 'native'
  selectWithEvent(view(0))
  assert.equal(root.textContent, 'native')
  selectWithEvent(view(1))
  assert.equal(root.firstChild, text)
  assert.equal(root.textContent, '1')
  root.removeChild(text)
  selectWithEvent(view(2))
  assert.equal(root.firstChild, text)
  assert.equal(root.textContent, '2')
})
