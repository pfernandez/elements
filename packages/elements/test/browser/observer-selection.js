import { element, fragment, observe, project } from '../../elements.js'
import { button, div, span } from '../../html.js'
import { assert, equal, test } from './harness.js'

let connected, disconnected
customElements.define('elements-selection-probe', class extends HTMLElement {
  static observedAttributes = ['data-state', 'style']
  attributeChangedCallback(name, _previous, value) {
    name === 'style' ? this.onStyle?.(value) : this.onState?.(value)
  }
  connectedCallback() { connected?.(this) }
  disconnectedCallback() { disconnected?.(this) }
})
const probe = element('elements-selection-probe')

test('custom element callbacks see intermediate selections before an event finishes', () => {
  const child = observe(n => probe({ 'data-state': n }, n))
  const parent = observe(values => div(values.map(child)))
  const initial = parent([0, 0])
  const left = project(initial), right = project(initial)
  document.body.append(left, right)
  const seen = []
  left.firstChild.onState = value => seen.push([value, left.firstChild.textContent])
  const control = project(button({ onclick: () => parent([1, 2]) }))
  control.click()
  equal(seen, [['1', '0'], ['2', '1']])
  equal([...left.children, ...right.children].map(node => node.textContent), ['2', '2', '2', '2'])
  left.remove()
  right.remove()
})

test('a native callback can select another observer synchronously', () => {
  const other = observe(n => span(n))
  const parallel = project(other(0))
  const control = project(button({ onclick: () => other(2) }))
  const view = observe(n => probe({ 'data-state': n }, n))
  const root = project(view(0))
  document.body.append(root, parallel)
  const seen = []
  root.onState = () => {
    control.click()
    seen.push(parallel.textContent)
  }
  project(button({ onclick: () => view(1) })).click()
  equal(seen, ['2'])
  equal(root.textContent, '1')
  root.remove()
  parallel.remove()
})

test('nested selections finish synchronously and superseded attribute patches stop', () => {
  const view = observe(n => probe({ 'data-state': n, title: String(n) }, n))
  const initial = view(0), newer = view(2)
  const left = project(initial), right = project(initial)
  document.body.append(left, right)
  const control = project(button({ onclick: () => newer }))
  const seen = []
  left.onState = value => {
    if (value === '1') {
      control.click()
      seen.push([left.textContent, right.textContent])
    }
  }
  project(button({ onclick: () => view(1) })).click()
  equal(seen, [['2', '2']])
  equal([left.textContent, right.textContent, left.title, right.title], ['2', '2', '2', '2'])
  control.click()
  equal([left.textContent, right.textContent], ['2', '2'])
  left.remove()
  right.remove()
})

test('a nested root replacement is available for focus before its click returns', () => {
  const host = document.body.appendChild(document.createElement('section'))
  const view = observe(n => n === 2 ? div({ tabindex: -1 }, 'warning')
    : probe({ 'data-state': n }, n))
  const root = project(view(0), host)
  const control = project(button({ onclick: () => view(2) }))
  let focused
  root.onState = value => {
    if (value === '1') {
      control.click()
      host.firstChild.focus()
      focused = document.activeElement
    }
  }
  project(button({ onclick: () => view(1) })).click()
  equal(host.textContent, 'warning')
  assert(focused === host.firstChild && document.activeElement === focused)
  project(button({ onclick: () => view(3) })).click()
  equal(host.textContent, '3')
  host.remove()
})

test('connection callbacks can supersede insertion without leaving stale children', () => {
  const host = document.body.appendChild(document.createElement('section'))
  const view = observe(n => div(n ? probe(n) : span('old'), span(`tail${n}`)))
  const root = project(view(0), host)
  const control = project(button({ onclick: () => view(2) }))
  let during
  connected = () => {
    connected = null
    control.click()
    during = root.textContent
  }
  try {
    project(button({ onclick: () => view(1) })).click()
    equal([during, root.textContent], ['2tail2', '2tail2'])
    equal(root.children.length, 2)
  } finally { connected = null; host.remove() }
})

test('disconnection callbacks can supersede removal and reorder remaining children', () => {
  const host = document.body.appendChild(document.createElement('section'))
  const view = observe(n => div(n === 0 ? probe({ key: 'probe' }, 'old') : null,
    n === 2 ? [span({ key: 'b' }, 'B2'), span({ key: 'a' }, 'A2')]
      : [span({ key: 'a' }, 'A'), span({ key: 'b' }, 'B')]))
  const root = project(view(0), host)
  const control = project(button({ onclick: () => view(2) }))
  let during
  disconnected = () => {
    disconnected = null
    control.click()
    during = root.textContent
  }
  try {
    project(button({ onclick: () => view(1) })).click()
    equal([during, root.textContent], ['B2A2', 'B2A2'])
    equal(root.children.length, 2)
  } finally { disconnected = null; host.remove() }
})

test('style callbacks can restore already-written and not-yet-written style properties', () => {
  for (const removing of [false, true]) {
    const view = observe(n => probe({ style: n === 1
      ? removing ? { backgroundColor: 'blue' } : { color: 'red', backgroundColor: 'blue' }
      : { color: 'black', backgroundColor: 'white' } }, n))
    const initial = view(0), root = project(initial, document.body)
    let fired = false
    root.onStyle = () => {
      if (!fired) {
        fired = true
        project(button({ onclick: () => initial })).click()
        equal([root.style.color, root.style.backgroundColor, root.textContent], ['black', 'white', '0'])
      }
    }
    project(button({ onclick: () => view(1) })).click()
    equal([root.style.color, root.style.backgroundColor, root.textContent], ['black', 'white', '0'])
    root.remove()
  }
})

test('a nested event can replace an active root with a fragment and update it again', () => {
  const host = document.body.appendChild(document.createElement('section'))
  const view = observe(n => n > 1 ? fragment(span(n), span('tail')) : probe({ 'data-state': n }, n))
  const root = project(view(0), host)
  root.onState = value => {
    if (value === '1') {
      project(button({ onclick: () => view(2) })).click()
      equal(host.textContent, '2tail')
    }
  }
  project(button({ onclick: () => view(1) })).click()
  equal(host.textContent, '2tail')
  project(button({ onclick: () => view(3) })).click()
  equal(host.textContent, '3tail')
  host.remove()
})

test('a connection callback can supersede the first projection synchronously', () => {
  const view = observe(n => probe(n))
  const host = document.body.appendChild(document.createElement('section'))
  const control = project(button({ onclick: () => view(2) }))
  let during
  connected = () => {
    connected = null
    control.click()
    during = host.textContent
  }
  try {
    project(view(1), host)
    equal([during, host.textContent], ['2', '2'])
  } finally { connected = null; host.remove() }
})

test('a nested selection finishes a fragment move before reading its new order', () => {
  const host = document.body.appendChild(document.createElement('section'))
  const a = fragment({ key: 'a' }, probe('a1'), span('a2'))
  const b = span({ key: 'b' }, 'b'), c = span({ key: 'c' }, 'c')
  const view = observe(n => div(n === 0 ? [a, b, c] : [b, c, a]))
  const root = project(view(0), host)
  let during
  disconnected = () => {
    disconnected = null
    project(button({ onclick: () => view(2) })).click()
    during = root.textContent
  }
  try {
    project(button({ onclick: () => view(1) })).click()
    equal([during, root.textContent], ['bca1a2', 'bca1a2'])
  } finally { disconnected = null; host.remove() }
})

test('a nested selection finishes removing a fragment without leaving orphaned nodes', () => {
  const host = document.body.appendChild(document.createElement('section'))
  const view = observe(n => div(n === 0
    ? [fragment({ key: 'old' }, probe('old'), span('tail')), span({ key: 'keep' }, n)]
    : span({ key: 'keep' }, n)))
  const root = project(view(0), host)
  let during
  disconnected = () => {
    disconnected = null
    project(button({ onclick: () => view(2) })).click()
    during = root.textContent
  }
  try {
    project(button({ onclick: () => view(1) })).click()
    equal([during, root.textContent, root.childNodes.length], ['2', '2', 1])
  } finally { disconnected = null; host.remove() }
})
