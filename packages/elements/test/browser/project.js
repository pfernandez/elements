import { element, fragment, html, mathml, observe, project, svg } from '../../elements.js'
import { assert, equal, test } from './harness.js'
import { snapshot, resume } from '../../src/core/observer.js'

const host = () => document.body.appendChild(document.createElement('section'))
const pause = () => new Promise(resolve => setTimeout(resolve, 0))

test('detached roots support native insertion, movement and subsequent root replacement', () => {
  const target = host(), other = host()
  const view = observe((n = 0) => n === 2 ? html.span('done')
    : html.button({ onclick: () => view(n + 1) }, n))
  const initial = view()
  const root = project(initial)
  assert(root instanceof HTMLButtonElement && root.parentNode === null)
  const parallel = project(initial, target)
  assert(parallel === target.firstChild)
  parallel.click()
  equal(root.textContent, '1')
  const placeholder = document.createElement('div')
  target.prepend(placeholder)
  placeholder.replaceWith(root)
  equal(target.childNodes.length, 2)
  other.append(root)
  root.click()
  equal([target.textContent, other.textContent], ['done', 'done'])
  assert(other.firstChild instanceof HTMLSpanElement)
  assert(root instanceof HTMLButtonElement && root.parentNode === null)
  const circle = project(svg.circle({ r: 3 }))
  assert(circle instanceof SVGCircleElement)
  const drawing = project(svg.svg(), target)
  drawing.append(circle)
  assert(circle.parentNode === drawing)
})

test('explicit fragment ranges update after native insertion and movement', () => {
  const target = host(), other = host()
  const group = observe((n = 0) => n === 4 ? html.strong('done') : fragment(
    Array.from({ length: n }, (_, i) => html.span(i)),
    html.button({ onclick: () => group(n + 1) }, 'next')))
  const initial = group()
  const vessel = project(initial)
  assert(vessel instanceof DocumentFragment)
  vessel.querySelector('button').click()
  equal(vessel.textContent, '0next')
  target.append(vessel)
  equal(vessel.childNodes.length, 0)
  target.querySelector('button').click()
  equal(target.textContent, '01next')
  const appended = project(initial, target)
  assert(appended instanceof DocumentFragment && appended.childNodes.length === 0)
  // Move the entire range, including its boundary markers.
  other.append(...target.childNodes)
  other.querySelector('button').click()
  equal(other.textContent, '012next012next')
  equal(target.textContent, '')
  other.querySelector('button').click()
  equal(other.textContent, 'donedone')
  equal(other.childNodes.length, 2)
})

test('ticks wait for insertion and resume retained context after reconnection', () => {
  const request = window.requestAnimationFrame, cancel = window.cancelAnimationFrame
  const pending = new Map()
  let id = 0
  window.requestAnimationFrame = callback => (pending.set(++id, callback), id)
  window.cancelAnimationFrame = id => pending.delete(id)
  const frame = time => {
    const callbacks = [...pending.values()]
    pending.clear()
    callbacks.forEach(callback => callback(time))
  }
  try {
    const target = host(), calls = []
    const root = project(html.div({ ontick: (_el, n = 0, dt) =>
      (calls.push([n, dt]), n + 1) }))
    frame(0)
    equal(calls.length, 0)
    target.append(root)
    frame(16)
    frame(32)
    equal(calls, [[0, 0], [1, 16]])
    root.remove()
    frame(48)
    frame(1000)
    equal(calls.length, 2)
    target.append(root)
    frame(2000)
    equal(calls[2], [2, 0])
    frame(2016)
    equal(calls[3], [3, 16])
    root.remove()
  } finally {
    window.requestAnimationFrame = request
    window.cancelAnimationFrame = cancel
  }
})

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
  const detached = project(html.body())
  assert(detached instanceof HTMLBodyElement && detached.parentNode === null)
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
  const discardTick = () =>
    new WeakRef(project(html.div({ ontick: el => ({ element: el }) })))
  const ticking = discardTick()
  const move = () => {
    const previous = document.createElement('section')
    const node = project(initial, previous)
    target.append(node)
    return new WeakRef(previous)
  }
  const previousParent = move()
  project(initial, target)
  const kept = target.lastChild
  kept.remove()
  project(initial, target)
  const history = snapshot(document)
  for (let i = 0; i < 30; i++) {
    await pause()
    globalThis.gc()
    await pause()
    if (!abandoned.deref() && !ticking.deref() && !previousParent.deref()) break
  }
  assert(!abandoned.deref(), 'observer/history must not retain discarded DOM')
  assert(!ticking.deref(), 'a waiting tick must not retain discarded DOM')
  assert(!previousParent.deref(), 'a moved projection must not retain its former parent')
  resume(counter(8))
  equal([kept.textContent, target.lastChild.textContent], ['8', '8'])
  assert(history.size > 0)
})
