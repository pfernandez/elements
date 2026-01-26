import { button, component, div, form, input, pre, svg } from '../elements.js'
import { navigate } from '../elements.js'
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'

describe('Elements.js - Pure Data Contracts', () => {
  test('div() returns a vnode with tag "div"', () => {
    const vnode = div({ id: 'test' }, 'hello')
    assert.deepEqual(vnode, ['div', { id: 'test' }, 'hello'])
  })

  test('Nested elements return nested vnode arrays', () => {
    const vnode = div({}, div({}, 'nested'))
    assert.deepEqual(vnode, ['div', {}, ['div', {}, 'nested']])
  })

  test('Props are passed as second array element', () => {
    const vnode = div({ class: 'box' }, 'text')
    assert.deepEqual(vnode[1], { class: 'box' })
  })

  test('form onsubmit handler receives elements and event', () => {
    let receivedElements, receivedEvent
    const handler = (elements, event) => {
      receivedElements = elements
      receivedEvent = event
      return ['div', {}, 'submitted']
    }

    const fakeElements = { task: { value: 'buy milk' } }
    const fakeEvent = { type: 'submit', foo: 'bar' }

    const f = form({ onsubmit: handler }, input({ name: 'task' }))
    const result = f[1].onsubmit(fakeElements, fakeEvent)

    assert.equal(receivedElements.task.value, 'buy milk')
    assert.equal(receivedEvent.foo, 'bar')
    assert.deepEqual(result, ['div', {}, 'submitted'])
  })

  test('onsubmit returning nothing does not trigger preventDefault', () => {
    const handler = () => undefined
    const f = form({ onsubmit: handler })

    let prevented = false
    const event = {
      preventDefault: () => { prevented = true },
      target: { elements: {} }
    }

    f[1].onsubmit(event.target.elements, event)
    assert.equal(prevented, false)
  })

  test('onsubmit handler that returns nothing does not trigger update', () => {
    const handler = () => {}
    const f = form({ onsubmit: handler })
    const result = f[1].onsubmit({ target: {}, preventDefault: () => {} })
    assert.equal(result, undefined)
  })

  test('form onsubmit handler returns a vnode', () => {
    const handler = () => ['div', {}, 'submitted']
    const f = form({ onsubmit: handler })
    const result = f[1].onsubmit({}, {})  // simulate elements and event
    assert.deepEqual(result, ['div', {}, 'submitted'])
  })

  test('button with onclick handler returns new vnode', () => {
    const handler = () => ['span', {}, 'clicked']
    const b = button({ onclick: handler }, 'Click Me')
    const result = b[1].onclick()
    assert.deepEqual(result, ['span', {}, 'clicked'])
  })

  test('svg element returns a vnode with tag "svg"', () => {
    const vnode = svg({ width: 100, height: 100 })
    assert.equal(vnode[0], 'svg')
    assert.deepEqual(vnode[1], { width: 100, height: 100 })
  })

  test('Stateless reuse: same call gives same output', () => {
    const vnode1 = div({ class: 'x' }, 'same')
    const vnode2 = div({ class: 'x' }, 'same')
    assert.deepEqual(vnode1, vnode2)
  })

  test('onsubmit returns null → treated as passive (no update)', () => {
    const f = form({ onsubmit: () => null })
    const result = f[1].onsubmit({}, {})
    assert.equal(result, null)
  })

  test('onsubmit returns false → treated as passive (no update)', () => {
    const f = form({ onsubmit: () => false })
    const result = f[1].onsubmit({}, {})
    assert.equal(result, false)
  })

  test('onsubmit returns empty string → treated as passive (no update)', () => {
    const f = form({ onsubmit: () => '' })
    const result = f[1].onsubmit({}, {})
    assert.equal(result, '')
  })

  test('style object is preserved in props', () => {
    const vnode = div({ style: { color: 'red', fontSize: '12px' } })
    assert.deepEqual(vnode[1].style, { color: 'red', fontSize: '12px' })
  })

  test('class attribute is passed as string', () => {
    const vnode = div({ class: 'hero box' }, 'hello')
    assert.equal(vnode[1].class, 'hero box')
  })

  test('boolean attributes are passed as true/false', () => {
    const vnode = input({ required: true, disabled: false })
    assert.deepEqual(vnode[1], { required: true, disabled: false })
  })

  test('null child is preserved in vnode children', () => {
    const vnode = div({}, null)
    assert.deepEqual(vnode, ['div', {}, null])
  })

  test('undefined child is preserved in children array', () => {
    const vnode = div({}, [undefined, 'text'])
    assert.deepEqual(vnode, ['div', {}, [undefined, 'text']])
  })

  test('mixed falsy children are allowed', () => {
    const vnode = div({}, [null, false, 0, '', 'x'])
    assert.deepEqual(vnode, ['div', {}, [null, false, 0, '', 'x']])
  })

  test('component() supports recursion and state threading', () => {
    const Counter = component((n = 0) =>
      div({},
        pre(n),
        button({ onclick: () => Counter(n + 1) }, 'inc')
      )
    )

    const first = Counter(0)
    const inner = first[2]              // unwrap from ['wrap', {}, vnode]
    const second = inner[3][1].onclick() // invoke button's onclick

    assert.equal(inner[0], 'div')
    assert.equal(inner[2][2], 0)        // pre(n) = 0
    assert.equal(second[2][2][2], 1)    // pre(n) = 1 in next render
  })

  test('vnode return is pure (no mutation of props)', () => {
    const props = { id: 'x' }
    div(props)
    assert.deepEqual(props, { id: 'x' })
  })

  test('navigate() uses History API when available', () => {
    const prevWindow = globalThis.window

    const calls = []
    const setLocation = url => {
      const hashIndex = url.indexOf('#')
      const searchIndex = url.indexOf('?')
      const pathnameEnd =
        Math.min(
          searchIndex === -1 ? url.length : searchIndex,
          hashIndex === -1 ? url.length : hashIndex
        )

      globalThis.window.location.pathname = url.slice(0, pathnameEnd) || '/'
      globalThis.window.location.search =
        searchIndex === -1 ? '' : url.slice(searchIndex, hashIndex === -1 ? url.length : hashIndex)
      globalThis.window.location.hash =
        hashIndex === -1 ? '' : url.slice(hashIndex)
    }

    globalThis.window = {
      location: { pathname: '/', search: '', hash: '' },
      history: {
        pushState: (...args) => {
          calls.push(['pushState', ...args])
          setLocation(args[2])
        },
        replaceState: (...args) => {
          calls.push(['replaceState', ...args])
          setLocation(args[2])
        }
      }
    }

    navigate('/md/home')
    assert.equal(calls.length, 1)
    assert.equal(calls[0][0], 'pushState')
    assert.equal(calls[0][3], '/md/home')

    navigate('/md/home')
    assert.equal(calls.length, 1)

    navigate('/md/home', { force: true })
    assert.equal(calls.length, 2)

    navigate('/md/home', { replace: true, force: true })
    assert.equal(calls.length, 3)
    assert.equal(calls[2][0], 'replaceState')

    globalThis.window = prevWindow
  })
})
