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


describe("observers", () => {
  test('render() explicitly selects a newly constructed observer value', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const Counter = observe((n = 0) =>
      div(output(n))
    )

    const container = document.createElement('div')
    render(div({}, Counter(0)), container)
    assert.equal(container.childNodes[0].childNodes.length, 1)
    const getCountText = () =>
      container.childNodes[0]
        .childNodes[0]
        .childNodes[0]
        .childNodes[0]
        .nodeValue
    assert.equal(getCountText(), '0')

    render(div({}, Counter(1)), container)
    assert.equal(container.childNodes[0].childNodes.length, 1)
    assert.equal(getCountText(), '1')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('observe() propagates errors to its caller', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window
    const prevConsoleError = console.error

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()
    console.error = () => {}

    const Broken = observe(() => { throw new Error('boom') })

    assert.throws(() => Broken(), /boom/)

    console.error = prevConsoleError
    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })
})
