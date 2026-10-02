import { a, body, button, observe, div, form, head, html, input,
  output, pre, render, span, svg, title } from '../elements.js'
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { createFakeDom } from './fake-dom.js'
import { createDeclarativeEventHandler } from '../src/core/events.js'
import { startTickLoop } from '../src/core/tick.js'

const makeWindow = extra =>
  ({
    location: { pathname: '/', search: '', hash: '' },
    history: { pushState: () => {} },
    ...extra
  })


describe("events", () => {
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

  test(
    'onsubmit returns empty string → treated as passive (no update)',
    () => {
      const f = form({ onsubmit: () => '' })
      const result = f[1].onsubmit({}, {})
      assert.equal(result, '')
    }
  )

  test('passive event returns are valid and do not warn', async () => {
    const prevWarn = console.warn
    const warns = []
    console.warn = (...args) => warns.push(args.join(' '))

    const env = {
      el: { tagName: 'DIV' },
      key: 'onclick',
      handler: () => undefined,
      resume: () => { throw new Error('passive return must not resume') }
    }

    const h1 = createDeclarativeEventHandler(env)
    await h1({})

    env.handler = () => 'ok'
    const h2 = createDeclarativeEventHandler(env)
    await h2({})

    assert.equal(warns.length, 0)

    console.warn = prevWarn
  })

  test('event handler update patches closest observer boundary', async () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const Inner = observe((n = 0) =>
      div({},
        output(n),
        button({ onclick: () => Inner(n + 1) }, 'inc')
      )
    )

    const Outer = observe(() =>
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
    assert.equal(innerRoot2, innerRoot)
    assert.equal(innerRoot2.childNodes[0].childNodes[0].nodeValue, '1')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('async event handlers may return a vnode to update', async () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const AsyncCounter = observe((n = 0) =>
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
    const nextRoot = container.childNodes[0]
    const updated = nextRoot.childNodes[0].childNodes[0].nodeValue
    assert.equal(nextRoot, root)
    assert.equal(updated, '1')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('oninput passes the native target and original event', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')

    let gotTarget, gotEvent
    let prevented = 0

    const App = observe((value = '') =>
      div({},
        input({
          type: 'range',
          value,
          oninput: (target, event) =>
            (gotTarget = target, gotEvent = event, App(target.value))
        })
      )
    )

    render(App('0.1'), container)
    const inputEl = container.childNodes[0].childNodes[0]

    inputEl.value = '0.2'
    const event = {
      target: inputEl,
      preventDefault: () => { prevented++ }
    }
    inputEl.oninput(event)

    assert.equal(gotTarget, inputEl)
    assert.equal(gotEvent, event)
    assert.equal(inputEl.value, '0.2')
    assert.equal(prevented, 0)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('<a> onclick returning a vnode prevents default navigation', async () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = undefined

    let prevented = 0

    const container = document.createElement('div')
    render(a({ href: '/x', onclick: () => div('ok') }, 'go'), container)

    await container.childNodes[0].onclick({
      button: 0,
      preventDefault: () => { prevented++ }
    })

    assert.equal(prevented, 1)
    assert.equal(container.childNodes[0].tagName.toLowerCase(), 'div')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() updates event handlers when props change', async () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

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

  test('non-vnode event return is passive (no update)', async () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    render(div(button({ onclick: () => 'noop' }, 'go')), container)

    const root = container.childNodes[0]
    await root.childNodes[0].onclick({})

    assert.equal(container.childNodes[0], root)
    assert.equal(root.childNodes[0].tagName.toLowerCase(), 'button')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() clears removed event handlers', async () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    render(button({ onclick: () => div('ok') }, 'go'), container)
    assert.equal(typeof container.childNodes[0].onclick, 'function')

    render(button({}, 'go'), container)
    assert.equal(container.childNodes[0].onclick, null)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })
})
