import { element, fragment, html, mathml, observe, project, svg } from '../../elements.js'
import { assert, equal, test } from './harness.js'
import { snapshot, resume } from '../../src/core/observer.js'

const host = () => document.body.appendChild(document.createElement('section'))
const pause = () => new Promise(resolve => setTimeout(resolve, 0))

test('project appends independent placements with shared observations and native state', () => {
  const target = host()
  target.append(document.createElement('aside'))
  const counter = observe((n = 0) => html.div(
    html.input(), html.output(n), html.button({ onclick: () => counter(n + 1) }, 'next')))
  const initial = counter()
  project(initial, target)
  project(initial, target)
  const [left, right] = target.querySelectorAll('input')
  left.value = 'draft'
  left.focus()
  left.setSelectionRange(2, 2)
  target.querySelector('button').click()
  project(initial, target)
  equal([...target.querySelectorAll('output')].map(node => node.textContent), ['1', '1', '1'])
  equal([left.value, right.value], ['draft', ''])
  assert(document.activeElement === left)
  equal([left.selectionStart, left.selectionEnd], [2, 2])
  const detached = document.createElement('section')
  project(counter(9), detached)
  equal([...target.querySelectorAll('output')].map(node => node.textContent), ['9', '9', '9'])
  assert(target.firstChild.localName === 'aside')
})

test('standalone vocabularies create correct namespaces regardless of destination', () => {
  const target = host()
  const drawing = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  target.append(drawing)
  project(svg.circle({ r: 5 }), drawing)
  project(svg.title('drawing'), drawing)
  project(html.a({ href: '/' }, 'HTML'), drawing)
  project(mathml.mi('x'), target)
  project(svg.foreignObject(html.div('HTML child')), drawing)
  project(element('item', 'urn:example')(), target)
  assert(drawing.firstChild instanceof SVGCircleElement)
  equal(drawing.querySelector('title').namespaceURI, drawing.namespaceURI)
  assert(drawing.querySelector('a') instanceof HTMLAnchorElement)
  equal(target.querySelector('mi').namespaceURI, 'http://www.w3.org/1998/Math/MathML')
  assert(drawing.querySelector('div') instanceof HTMLDivElement)
  equal(target.querySelector('item').namespaceURI, 'urn:example')
})

test('vocabularies retain their namespaces in XML documents', () => {
  const xml = document.implementation.createDocument(null, 'root')
  project(html.div('HTML'), xml.documentElement)
  project(svg.circle({ r: 5 }), xml.documentElement)
  equal([...xml.documentElement.children].map(node => node.namespaceURI), [
    'http://www.w3.org/1999/xhtml', 'http://www.w3.org/2000/svg'
  ])
  assert(xml.documentElement.firstChild.ownerDocument === xml)
  equal(snapshot(xml).size, 2)
})

test('equal tag names from different vocabularies replace nodes on observer selection', () => {
  const target = host()
  const label = observe((foreign = false) =>
    (foreign ? svg.a : html.a)({ onclick: () => label(!foreign) }, 'link'))
  project(label(), target)
  const original = target.firstChild
  original.onclick(new MouseEvent('click'))
  assert(target.firstChild !== original)
  assert(target.firstChild instanceof SVGAElement)
  target.firstChild.onclick(new MouseEvent('click'))
  assert(target.firstChild instanceof HTMLAnchorElement)
})

test('parallel fragment ranges and independent nested hosts retain their boundaries', () => {
  const target = host()
  const outer = observe((shown = true) => fragment(
    html.button({ onclick: () => outer(!shown) }, 'toggle'),
    shown ? html.section() : html.span('gone')))
  const counter = observe((n = 0) => html.button({ onclick: () => counter(n + 1) }, n))
  const initial = outer()
  project(initial, target)
  project(initial, target)
  const slot = target.querySelector('section')
  project(counter(), slot)
  slot.firstChild.click()
  equal(slot.textContent, '1')
  equal(target.querySelectorAll('section')[1].textContent, '')
  target.querySelector('button').click()
  assert(!slot.isConnected)
  slot.firstChild.click()
  equal(slot.textContent, '2')
  equal([...target.querySelectorAll('span')].map(node => node.textContent), ['gone', 'gone'])
})

test('document tags create local elements without adopting the document shell', () => {
  const target = host(), body = document.body, head = document.head
  project(html.html(html.head(html.title('local')), html.body('local')), target)
  assert(target.firstChild !== document.documentElement)
  assert(document.body === body && document.head === head)
  equal(target.querySelector('body').textContent, 'local')
  let missing = false
  try { project(html.body()) } catch (error) { missing = error instanceof TypeError }
  assert(missing, 'document tags require an explicit target too')
})

test('native removal permits collection while retained DOM and observer state survive', async () => {
  assert(typeof globalThis.gc === 'function', 'The runner must enable --expose-gc')
  const target = host()
  const counter = observe((n = 0) => html.button({ onclick: () => counter(n + 1) }, n))
  const wrapper = observe(value => value)
  const initial = counter()
  const discard = () => {
    project(wrapper(initial), target)
    const node = target.lastChild
    node.remove()
    return new WeakRef(node)
  }
  const abandoned = discard()
  const discardTick = () => {
    const detached = document.createElement('section')
    project(html.div({ ontick: el => ({ element: el }) }), detached)
    return new WeakRef(detached.firstChild)
  }
  const ticking = discardTick()
  project(initial, target)
  const kept = target.lastChild
  kept.remove()
  project(initial, target)
  const history = snapshot(document)
  for (let i = 0; i < 30; i++) {
    await pause()
    globalThis.gc()
    await pause()
    if (!abandoned.deref() && !ticking.deref()) break
  }
  assert(!abandoned.deref(), 'observer/history must not retain discarded DOM')
  assert(!ticking.deref(), 'a waiting tick must not retain discarded DOM')
  resume(counter(8))
  equal([kept.textContent, target.lastChild.textContent], ['8', '8'])
  assert(history.size > 0)
})
