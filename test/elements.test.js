import { body, button, component, div, form, head, html, input,
  output, pre, render, svg, title } from '../elements.js'
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { createFakeDom } from './fake-dom.js'
import { startTickLoop } from '../src/core/tick.js'

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

  test('multiple component mounts update independently from events', async () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = { location: { pathname: '/', search: '', hash: '' }, history: { pushState: () => {} } }

    const Counter = component((n = 0) =>
      div({},
        output(n),
        button({ onclick: () => Counter(n + 1) }, 'inc')
      )
    )

    const container = document.createElement('div')
    render(div({}, Counter(0), Counter(0)), container)

    const getCounterRoot = index => container.childNodes[0].childNodes[index]
    const getCountText = root => root.childNodes[0].childNodes[0].nodeValue
    const click = root => root.childNodes[1].onclick({})

    const first = getCounterRoot(0)
    const second = getCounterRoot(1)

    assert.equal(getCountText(first), '0')
    assert.equal(getCountText(second), '0')

    await click(first)
    assert.equal(getCountText(getCounterRoot(0)), '1')
    assert.equal(getCountText(getCounterRoot(1)), '0')

    await click(getCounterRoot(1))
    assert.equal(getCountText(getCounterRoot(0)), '1')
    assert.equal(getCountText(getCounterRoot(1)), '1')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('ontick runs and threads context', async () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document

    let rafId = 0
    const rafQueue = new Map()
    globalThis.window = {
      requestAnimationFrame: cb => {
        const id = ++rafId
        rafQueue.set(id, cb)
        return id
      },
      cancelAnimationFrame: id => rafQueue.delete(id),
      location: { pathname: '/', search: '', hash: '' },
      history: { pushState: () => {} }
    }

    const dts = []
    const counts = []

    const container = document.createElement('div')
    render(
      div(
        {
          ontick: (_el, ctx = { count: 0 }, dt) => {
            dts.push(dt)
            counts.push(ctx.count)
            return { count: ctx.count + 1 }
          }
        },
        'x'
      ),
      container
    )

    // Connect the rendered root element so the tick loop runs in fake-dom.
    const el = container.childNodes[0]
    assert.ok(el, 'expected a rendered element')

    // Frame 1
    const [firstId] = rafQueue.keys()
    rafQueue.get(firstId)(0)
    rafQueue.delete(firstId)
    await Promise.resolve()

    // Frame 2
    const [secondId] = rafQueue.keys()
    rafQueue.get(secondId)(16)
    rafQueue.delete(secondId)
    await Promise.resolve()

    assert.equal(counts[0], 0)
    assert.equal(counts[1], 1)
    assert.equal(dts[0], 0)
    assert.equal(dts[1], 16)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('ontick stops ticking if it throws', async () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window
    const prevConsoleError = console.error

    const { document } = createFakeDom()
    globalThis.document = document

    let rafId = 0
    const rafQueue = new Map()
    globalThis.window = {
      requestAnimationFrame: cb => {
        const id = ++rafId
        rafQueue.set(id, cb)
        return id
      },
      cancelAnimationFrame: id => rafQueue.delete(id),
      location: { pathname: '/', search: '', hash: '' },
      history: { pushState: () => {} }
    }

    let errors = 0
    console.error = () => { errors++ }

    const container = document.createElement('div')
    render(div({ ontick: () => { throw new Error('boom') } }, 'x'), container)

    const [firstId] = rafQueue.keys()
    rafQueue.get(firstId)(0)
    rafQueue.delete(firstId)
    await Promise.resolve()

    assert.equal(errors, 1)
    assert.equal(rafQueue.size, 0)

    console.error = prevConsoleError
    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('ontick stops ticking if it returns a Promise', async () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window
    const prevConsoleError = console.error

    const { document } = createFakeDom()
    globalThis.document = document

    let rafId = 0
    const rafQueue = new Map()
    globalThis.window = {
      requestAnimationFrame: cb => {
        const id = ++rafId
        rafQueue.set(id, cb)
        return id
      },
      cancelAnimationFrame: id => rafQueue.delete(id),
      location: { pathname: '/', search: '', hash: '' },
      history: { pushState: () => {} }
    }

    let errors = 0
    console.error = () => { errors++ }

    const container = document.createElement('div')
    render(
      div({ ontick: () => Promise.resolve({}) }, 'x'),
      container
    )

    const [firstId] = rafQueue.keys()
    rafQueue.get(firstId)(0)
    rafQueue.delete(firstId)
    await Promise.resolve()

    assert.equal(errors, 1)
    assert.equal(rafQueue.size, 0)

    console.error = prevConsoleError
    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('ontick waits for connection and stops on disconnect', async () => {
    const prevWindow = globalThis.window

    let rafId = 0
    const rafQueue = new Map()
    globalThis.window = {
      requestAnimationFrame: cb => {
        const id = ++rafId
        rafQueue.set(id, cb)
        return id
      },
      cancelAnimationFrame: id => rafQueue.delete(id),
    }

    const calls = []
    const el = { isConnected: false }

    startTickLoop(el, (_el, ctx = { n: 0 }, dt) => (calls.push([ctx.n, dt]), ({ n: ctx.n + 1 })))

    const [f1] = rafQueue.keys()
    rafQueue.get(f1)(0)
    rafQueue.delete(f1)
    await Promise.resolve()

    assert.equal(calls.length, 0)
    assert.equal(rafQueue.size, 1)

    el.isConnected = true
    const [f2] = rafQueue.keys()
    rafQueue.get(f2)(16)
    rafQueue.delete(f2)
    await Promise.resolve()

    assert.equal(calls.length, 1)
    assert.deepEqual(calls[0], [0, 0])
    assert.equal(rafQueue.size, 1)

    el.isConnected = false
    const [f3] = rafQueue.keys()
    rafQueue.get(f3)(32)
    rafQueue.delete(f3)
    await Promise.resolve()

    assert.equal(rafQueue.size, 0)

    globalThis.window = prevWindow
  })

  test('render() mounts html() into documentElement', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = { location: { pathname: '/', search: '', hash: '' }, history: { pushState: () => {} } }

    render(
      html(
        head(title('Hello')),
        body(div('ok'))
      )
    )

    const bodyEl = document.body
    assert.equal(bodyEl.childNodes[0].tagName.toLowerCase(), 'div')
    assert.equal(bodyEl.childNodes[0].childNodes[0].nodeValue, 'ok')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() uses setAttributeNS for SVG elements', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = { location: { pathname: '/', search: '', hash: '' }, history: { pushState: () => {} } }

    const container = document.createElement('div')
    render(svg({ width: 100, height: 100 }), container)

    const el = container.childNodes[0]
    assert.equal(el.tagName.toLowerCase(), 'svg')
    assert.equal(el.__setAttributeCount > 0, true)
    assert.equal(el.__setAttributeNSCount > 0, true)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('innerHTML prop assigns directly', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = { location: { pathname: '/', search: '', hash: '' }, history: { pushState: () => {} } }

    const container = document.createElement('div')
    render(div({ innerHTML: '<b>ok</b>' }), container)

    const el = container.childNodes[0]
    assert.equal(el.innerHTML, '<b>ok</b>')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('property exceptions assign properties (not attributes)', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = { location: { pathname: '/', search: '', hash: '' }, history: { pushState: () => {} } }

    const container = document.createElement('div')
    render(div({ value: 'hi', checked: true }), container)

    const el = container.childNodes[0]
    assert.equal(el.value, 'hi')
    assert.equal(el.checked, true)
    assert.equal(el.attributes.value, undefined)
    assert.equal(el.attributes.checked, undefined)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('attribute assignment errors fall through', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    const create = document.createElement.bind(document)
    document.createElement = tag => {
      const el = create(tag)
      tag === 'div' && el.__throwOnSetAttribute.set('id', new Error('boom'))
      return el
    }

    globalThis.document = document
    globalThis.window = { location: { pathname: '/', search: '', hash: '' }, history: { pushState: () => {} } }

    const container = document.createElement('div')
    assert.throws(
      () => render(div({ id: 'x' }, 'ok'), container),
      /boom/
    )

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('property assignment errors fall through', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    const create = document.createElement.bind(document)
    document.createElement = tag => {
      const el = create(tag)
      tag === 'div'
        && Object.defineProperty(el, 'value', { set: () => { throw new Error('boom') } })
      return el
    }

    globalThis.document = document
    globalThis.window = { location: { pathname: '/', search: '', hash: '' }, history: { pushState: () => {} } }

    const container = document.createElement('div')
    assert.throws(
      () => render(div({ value: 'x' }, 'ok'), container),
      /boom/
    )

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('event handler update replaces closest component boundary', async () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = { location: { pathname: '/', search: '', hash: '' }, history: { pushState: () => {} } }

    const Inner = component((n = 0) =>
      div({},
        output(n),
        button({ onclick: () => Inner(n + 1) }, 'inc')
      )
    )

    const Outer = component(() =>
      div({},
        div({ id: 'sentinel' }, 'outer'),
        Inner(0)
      )
    )

    const container = document.createElement('div')
    render(Outer(), container)

    const outerRoot = container.childNodes[0]
    const sentinel = outerRoot.childNodes[0]
    const innerRoot = outerRoot.childNodes[1]

    assert.equal(sentinel.attributes.id, 'sentinel')
    assert.equal(sentinel.childNodes[0].nodeValue, 'outer')
    assert.equal(innerRoot.childNodes[0].childNodes[0].nodeValue, '0')

    await innerRoot.childNodes[1].onclick({})

    const outerRoot2 = container.childNodes[0]
    const sentinel2 = outerRoot2.childNodes[0]
    const innerRoot2 = outerRoot2.childNodes[1]

    assert.equal(sentinel2.attributes.id, 'sentinel')
    assert.equal(sentinel2.childNodes[0].nodeValue, 'outer')
    assert.equal(innerRoot2.childNodes[0].childNodes[0].nodeValue, '1')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('async event handlers may return a vnode to update', async () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = { location: { pathname: '/', search: '', hash: '' }, history: { pushState: () => {} } }

    const AsyncCounter = component((n = 0) =>
      div({},
        output(n),
        button({
          onclick: async () => Promise.resolve(AsyncCounter(n + 1))
        }, 'inc')
      )
    )

    const container = document.createElement('div')
    render(AsyncCounter(0), container)

    const root = container.childNodes[0]
    assert.equal(root.childNodes[0].childNodes[0].nodeValue, '0')

    await root.childNodes[1].onclick({})
    assert.equal(container.childNodes[0].childNodes[0].childNodes[0].nodeValue, '1')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('async form handlers preventDefault only when returning a vnode', async () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = { location: { pathname: '/', search: '', hash: '' }, history: { pushState: () => {} } }

    const container1 = document.createElement('div')

    let prevented = 0
    const event = {
      preventDefault: () => { prevented++ },
      target: { elements: { todo: { value: 'x' } } }
    }

    const App = component((n = 0) =>
      form({
        onsubmit: async ({ todo: { value } }) =>
          value ? Promise.resolve(App(n + 1)) : undefined
      }, input({ name: 'todo' }), button({ type: 'submit' }, 'go'))
    )

    render(App(0), container1)
    await container1.childNodes[0].onsubmit(event)

    assert.equal(prevented, 1)

    const Passive = component(() =>
      form({ onsubmit: async () => Promise.resolve(undefined) },
        input({ name: 'todo' }),
        button({ type: 'submit' }, 'go'))
    )

    const container2 = document.createElement('div')
    render(Passive(), container2)
    await container2.childNodes[0].onsubmit(event)

    assert.equal(prevented, 1)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() updates attributes in place when vnode tag matches', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = { location: { pathname: '/', search: '', hash: '' }, history: { pushState: () => {} } }

    const container = document.createElement('div')
    render(div({ id: 'a' }, 'x'), container)

    const el1 = container.childNodes[0]
    assert.equal(el1.attributes.id, 'a')

    render(div({ id: 'b' }, 'x'), container)

    const el2 = container.childNodes[0]
    assert.equal(el2, el1)
    assert.equal(el2.attributes.id, 'b')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() replaces element when vnode tag changes', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = { location: { pathname: '/', search: '', hash: '' }, history: { pushState: () => {} } }

    const container = document.createElement('div')
    render(div({ id: 'a' }, 'x'), container)

    const el1 = container.childNodes[0]
    assert.equal(el1.tagName.toLowerCase(), 'div')

    render(pre({ id: 'b' }, 'x'), container)

    const el2 = container.childNodes[0]
    assert.equal(el2.tagName.toLowerCase(), 'pre')
    assert.notEqual(el2, el1)
    assert.equal(el2.attributes.id, 'b')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() updates event handlers when props change', async () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = { location: { pathname: '/', search: '', hash: '' }, history: { pushState: () => {} } }

    const container = document.createElement('div')
    render(button({ onclick: () => div('one') }, 'go'), container)

    const btn1 = container.childNodes[0]
    await btn1.onclick({})
    assert.equal(container.childNodes[0].tagName.toLowerCase(), 'div')
    assert.equal(container.childNodes[0].childNodes[0].nodeValue, 'one')

    render(button({ onclick: () => div('two') }, 'go'), container)

    const btn2 = container.childNodes[0]
    await btn2.onclick({})
    assert.equal(container.childNodes[0].tagName.toLowerCase(), 'div')
    assert.equal(container.childNodes[0].childNodes[0].nodeValue, 'two')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('non-vnode event return is passive (no replacement)', async () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = { location: { pathname: '/', search: '', hash: '' }, history: { pushState: () => {} } }

    const container = document.createElement('div')
    render(div(button({ onclick: () => 'noop' }, 'go')), container)

    const root = container.childNodes[0]
    await root.childNodes[0].onclick({})

    assert.equal(container.childNodes[0], root)
    assert.equal(root.childNodes[0].tagName.toLowerCase(), 'button')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })
})
