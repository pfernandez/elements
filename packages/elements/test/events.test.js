import { a, button, div, input, output } from '../html.js'
import { afterEach, beforeEach, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { createDeclarativeEventHandler } from '../src/core/events.js'
import { createFakeDom } from './fake-dom.js'
import { observe } from '../elements.js'
import { transition } from './transition.js'

describe('events', () => {
  let previousDocument, previousWindow
  beforeEach(() => {
    previousDocument = globalThis.document
    previousWindow = globalThis.window
    globalThis.document = createFakeDom().document
    globalThis.window = undefined
  })
  afterEach(() => {
    globalThis.document = previousDocument
    globalThis.window = previousWindow
  })

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
    transition(Outer(), container)

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
  })

  test('async event handlers may return a vnode to update', async () => {
    const AsyncCounter = observe((n = 0) =>
      div({},
          output(n),
          button({
            onclick: async () => Promise.resolve(AsyncCounter(n + 1))
          }, 'inc')
      )
    )

    const container = document.createElement('div')
    transition(AsyncCounter(0), container)

    const root = container.childNodes[0]
    assert.equal(root.childNodes[0].childNodes[0].nodeValue, '0')

    await root.childNodes[1].onclick({})
    const nextRoot = container.childNodes[0]
    const updated = nextRoot.childNodes[0].childNodes[0].nodeValue
    assert.equal(nextRoot, root)
    assert.equal(updated, '1')
  })

  test('oninput passes the native target and original event', () => {
    const container = document.createElement('div')

    let gotTarget, gotEvent
    let wasPrevented = 0

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

    transition(App('0.1'), container)
    const inputEl = container.childNodes[0].childNodes[0]

    inputEl.value = '0.2'
    const event = {
      target: inputEl,
      preventDefault: () => { wasPrevented++ }
    }
    inputEl.oninput(event)

    assert.equal(gotTarget, inputEl)
    assert.equal(gotEvent, event)
    assert.equal(inputEl.value, '0.2')
    assert.equal(wasPrevented, 0)
  })

  test('<a> onclick returning a vnode prevents default navigation', async () => {
    let wasPrevented = 0

    const container = document.createElement('div')
    transition(a({ href: '/x', onclick: () => div('ok') }, 'go'), container)

    await container.childNodes[0].onclick({
      button: 0,
      preventDefault: () => { wasPrevented++ }
    })

    assert.equal(wasPrevented, 1)
    assert.equal(container.childNodes[0].tagName.toLowerCase(), 'div')
  })

  test('transition() updates event handlers when props change', async () => {
    const container = document.createElement('div')
    transition(button({ onclick: () => div('one') }, 'go'), container)

    const btn1 = container.childNodes[0]
    await btn1.onclick({})
    assert.equal(container.childNodes[0].tagName.toLowerCase(), 'div')
    assert.equal(container.childNodes[0].childNodes[0].nodeValue, 'one')

    transition(button({ onclick: () => div('two') }, 'go'), container)

    const btn2 = container.childNodes[0]
    await btn2.onclick({})
    assert.equal(container.childNodes[0].tagName.toLowerCase(), 'div')
    assert.equal(container.childNodes[0].childNodes[0].nodeValue, 'two')
  })

  test('non-vnode event return is passive (no update)', async () => {
    const container = document.createElement('div')
    transition(div(button({ onclick: () => 'noop' }, 'go')), container)

    const root = container.childNodes[0]
    await root.childNodes[0].onclick({})

    assert.equal(container.childNodes[0], root)
    assert.equal(root.childNodes[0].tagName.toLowerCase(), 'button')
  })

  test('transition() clears removed event handlers', async () => {
    const container = document.createElement('div')
    transition(button({ onclick: () => div('ok') }, 'go'), container)
    assert.equal(typeof container.childNodes[0].onclick, 'function')

    transition(button({}, 'go'), container)
    assert.equal(container.childNodes[0].onclick, null)
  })
})
