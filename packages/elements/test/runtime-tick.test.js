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


describe("runtime-tick", () => {
  test('ontick runs and threads context', async () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document

    let rafId = 0
    const rafQueue = new Map()
    globalThis.window = makeWindow({
      requestAnimationFrame: cb => {
        const id = ++rafId
        rafQueue.set(id, cb)
        return id
      },
      cancelAnimationFrame: id => rafQueue.delete(id)
    })

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

    const { document } = createFakeDom()
    globalThis.document = document

    let rafId = 0
    const rafQueue = new Map()
    globalThis.window = makeWindow({
      requestAnimationFrame: cb => {
        const id = ++rafId
        rafQueue.set(id, cb)
        return id
      },
      cancelAnimationFrame: id => rafQueue.delete(id)
    })

    const container = document.createElement('div')
    render(div({ ontick: () => { throw new Error('boom') } }, 'x'), container)

    const [firstId] = rafQueue.keys()
    const firstFrame = rafQueue.get(firstId)
    rafQueue.delete(firstId)
    assert.throws(
      () => firstFrame(0),
      { name: 'Error', message: 'boom' }
    )
    await Promise.resolve()

    assert.equal(rafQueue.size, 0)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('ontick stops ticking if it returns a Promise', async () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document

    let rafId = 0
    const rafQueue = new Map()
    globalThis.window = makeWindow({
      requestAnimationFrame: cb => {
        const id = ++rafId
        rafQueue.set(id, cb)
        return id
      },
      cancelAnimationFrame: id => rafQueue.delete(id)
    })

    const container = document.createElement('div')
    render(
      div({ ontick: () => Promise.resolve({}) }, 'x'),
      container
    )

    const [firstId] = rafQueue.keys()
    const firstFrame = rafQueue.get(firstId)
    rafQueue.delete(firstId)
    assert.throws(
      () => firstFrame(0),
      /ontick must be synchronous/
    )
    await Promise.resolve()

    assert.equal(rafQueue.size, 0)

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

    startTickLoop(
      el,
      (_el, ctx = { n: 0 }, dt) =>
        (calls.push([ctx.n, dt]), ({ n: ctx.n + 1 }))
    )

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

  test('ontick waits for readiness before ticking', async () => {
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

    const el = { isConnected: true }

    let ready = false
    let calls = 0
    const dts = []

    startTickLoop(
      el,
      (_el, ctx = { n: 0 }, dt) => (calls++, dts.push(dt), ({ n: ctx.n + 1 })),
      { ready: () => ready }
    )

    const [f1] = rafQueue.keys()
    rafQueue.get(f1)(0)
    rafQueue.delete(f1)
    await Promise.resolve()

    assert.equal(calls, 0)
    assert.equal(rafQueue.size, 1)

    ready = true
    const [f2] = rafQueue.keys()
    rafQueue.get(f2)(16)
    rafQueue.delete(f2)
    await Promise.resolve()

    assert.equal(calls, 1)
    assert.deepEqual(dts, [0])

    globalThis.window = prevWindow
  })

  test('render() clearing ontick stops ticking', async () => {
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

    const container = document.createElement('div')
    render(div({ ontick: () => {} }, 'x'), container)

    assert.equal(rafQueue.size, 1)

    render(div({}, 'x'), container)
    assert.equal(rafQueue.size, 0)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })
})
