import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { element, fragment, html, mathml, observe, project, svg } from '../elements.js'
import { createFakeDom } from './fake-dom.js'

let previousDocument
beforeEach(() => {
  previousDocument = globalThis.document
  globalThis.document = createFakeDom().document
})
afterEach(() => { globalThis.document = previousDocument })
const click = node => node.onclick({})

const makeCounter = () => {
  const counter = observe((n = 0) =>
    html.button({ onclick: () => counter(n + 1) }, n))
  return counter
}

test('each project call appends and leaves existing DOM intact', () => {
  const legacy = document.createElement('aside')
  document.body.appendChild(legacy)
  const graph = html.button({ onclick: () => html.span('next') }, 'first')
  const projected = project(graph, document.body)
  assert.equal(projected, document.body.lastChild)
  project(graph, document.body)
  const [left, right] = document.body.childNodes.slice(1)
  assert.notEqual(left, right)
  click(left)
  assert.equal(document.body.firstChild, legacy)
  assert.equal(document.body.childNodes[1].textContent, 'next')
  assert.equal(right.textContent, 'first')
})

test('parallel projections share observer selections and preserve reused observations', () => {
  const counter = makeCounter()
  const initial = counter()
  project(initial, document.body)
  project(initial, document.body)
  click(document.body.firstChild)
  project(initial, document.body)
  assert.deepEqual(document.body.childNodes.map(node => node.textContent), ['1', '1', '1'])
  project(counter(10), document.body)
  assert.deepEqual(document.body.childNodes.map(node => node.textContent), ['10', '10', '10', '10'])
})

test('fresh selection occurs even when the target is disconnected', () => {
  const counter = makeCounter()
  project(counter(), document.body)
  const detached = document.createElement('section')
  project(counter(5), detached)
  assert.equal(document.body.firstChild.textContent, '5')
  assert.equal(detached.firstChild.textContent, '5')
})

test('omitted targets return detached roots for every vocabulary and document tag', () => {
  for (const graph of [html.div(), html.html(), html.head(), html.body(), svg.svg()]) {
    const node = project(graph)
    assert.equal(node.nodeType, 1)
    assert.equal(node.tagName.toLowerCase(), graph[0])
    assert.equal(node.parentNode, null)
  }
  assert.equal(document.body.childNodes.length, 0)
  for (const invalid of [null, {}, false])
    assert.throws(() => project(html.div(), invalid), /target must be a DOM parent/)
})

test('detached selections update parallel placements before and after insertion', () => {
  const counter = makeCounter()
  const left = project(counter(), document.body)
  const right = project(counter(5))
  assert.equal(left.textContent, '5')
  click(left)
  assert.equal(right.textContent, '6')
  document.body.appendChild(right)
  click(right)
  assert.deepEqual(document.body.childNodes.map(node => node.textContent), ['7', '7'])
})

test('root replacement follows native movement and leaves the returned reference unchanged', () => {
  const state = observe((changed = false) => changed
    ? html.span('next') : html.button({ onclick: () => state(true) }, 'first'))
  const original = project(state())
  const other = document.createElement('section')
  document.body.appendChild(original)
  other.appendChild(original)
  click(original)
  assert.equal(document.body.childNodes.length, 0)
  assert.equal(original.parentNode, null)
  assert.equal(original.tagName, 'BUTTON')
  assert.equal(other.firstChild.tagName, 'SPAN')
})

test('explicit fragments retain live ranges after insertion consumes their vessel', () => {
  const group = observe((n = 0) => fragment(
    Array.from({ length: n }, (_, i) => html.span(i)),
    html.button({ onclick: () => group(n + 1) }, 'next')))
  const initial = group()
  const vessel = project(initial)
  assert.equal(vessel.nodeType, 11)
  click(vessel.childNodes[1])
  assert.equal(vessel.textContent, '0next')
  document.body.appendChild(vessel)
  assert.equal(vessel.childNodes.length, 0)
  click(document.body.childNodes[2])
  assert.equal(document.body.textContent, '01next')
  const appended = project(initial, document.body)
  assert.equal(appended.nodeType, 11)
  assert.equal(appended.childNodes.length, 0)
  click(document.body.childNodes[3])
  assert.equal(document.body.textContent, '012next012next')
})

test('html, head, and body are ordinary projected elements', () => {
  const originalBody = document.body
  const originalHead = document.head
  const target = document.createElement('section')
  project(html.html(html.head(html.title('local')), html.body('local')), target)
  assert.notEqual(target.firstChild, document.documentElement)
  assert.equal(document.body, originalBody)
  assert.equal(document.head, originalHead)
  assert.equal(document.body.textContent, '')
  assert.equal(target.textContent, 'locallocal')
})

test('vocabulary namespaces do not depend on placement or tag-name collisions', () => {
  const target = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  project(svg.circle({ r: 3 }), target)
  project(svg.title('svg'), target)
  project(html.title('html'), target)
  project(mathml.mi('x'), target)
  project(element('custom', 'urn:example')('custom'), target)
  assert.deepEqual(target.childNodes.map(node => node.namespaceURI), [
    'http://www.w3.org/2000/svg', 'http://www.w3.org/2000/svg', 'http://www.w3.org/1999/xhtml',
    'http://www.w3.org/1998/Math/MathML', 'urn:example'
  ])
})

test('observer copies preserve explicit namespaces and replace equal tags across vocabularies', () => {
  const label = observe((foreign = false) =>
    (foreign ? svg.a : html.a)({ onclick: () => label(!foreign) }, 'link'))
  project(label(), document.body)
  const original = document.body.firstChild
  click(original)
  assert.notEqual(document.body.firstChild, original)
  assert.equal(document.body.firstChild.namespaceURI, 'http://www.w3.org/2000/svg')
  click(document.body.firstChild)
  assert.equal(document.body.firstChild.namespaceURI, 'http://www.w3.org/1999/xhtml')
})

test('parallel fragment projections update only their own ranges', () => {
  const group = observe((n = 0) => fragment(
    html.span(n), html.button({ onclick: () => group(n + 1) }, 'next')))
  const initial = group()
  project(html.span('legacy'), document.body)
  project(initial, document.body)
  project(initial, document.body)
  click(document.body.childNodes[3])
  assert.equal(document.body.textContent, 'legacy1next1next')
})

test('independent projection hosts survive outer updates and detach with their host', () => {
  const shell = observe((version = 0, shown = true) => html.div(
    html.button({ onclick: () => shell(version + 1, version === 0) }, 'outer'),
    shown ? html.section({ id: String(version) }) : html.span('gone')))
  project(shell(), document.body)
  const outer = document.body.firstChild
  const host = outer.lastChild
  project(makeCounter()(), host)
  click(outer.firstChild)
  assert.equal(outer.lastChild, host)
  click(host.firstChild)
  assert.equal(host.textContent, '1')
  click(outer.firstChild)
  assert.equal(host.parentNode, null)
  click(host.firstChild)
  assert.equal(host.textContent, '2')
  assert.equal(outer.lastChild.textContent, 'gone')
})

test('detached retained roots cannot break other projections when their tag changes', () => {
  const state = observe((switched = false) => switched
    ? html.span('next') : html.button({ onclick: () => state(true) }, 'switch'))
  const initial = state()
  project(initial, document.body)
  project(initial, document.body)
  const detached = document.body.firstChild
  document.body.removeChild(detached)
  assert.doesNotThrow(() => click(document.body.firstChild))
  assert.equal(document.body.textContent, 'next')
})
