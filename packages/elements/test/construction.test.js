import { a, body, button, element, observe, div, form, head, html, input,
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


describe("construction", () => {
  test('div() returns a vnode with tag "div"', () => {
    const vnode = div({ id: 'test' }, 'hello')
    assert.deepEqual(vnode, ['div', { id: 'test' }, 'hello'])
  })

  test('Nested elements return nested vnode arrays', () => {
    const vnode = div({}, div({}, 'nested'))
    assert.deepEqual(vnode, ['div', {}, ['div', {}, 'nested']])
  })

  test('Child arrays compose without spread syntax', () => {
    const vnode = div([
      span('one'),
      [span('two')]
    ])
    assert.deepEqual(vnode, [
      'div',
      {},
      ['span', {}, 'one'],
      ['span', {}, 'two']
    ])
  })

  test('element() constructs custom vocabularies with the same vnode contract', () => {
    const widget = element('my-widget')
    assert.deepEqual(
      widget({ mode: 'compact' }, [span('one'), span('two')]),
      ['my-widget', { mode: 'compact' },
       ['span', {}, 'one'], ['span', {}, 'two']]
    )
  })

  test('Props are passed as second array element', () => {
    const vnode = div({ class: 'box' }, 'text')
    assert.deepEqual(vnode[1], { class: 'box' })
  })

  test('svg element returns a vnode with tag "svg"', () => {
    const vnode = svg({ width: 100, height: 100 })
    assert.equal(vnode[0], 'svg')
    assert.deepEqual(vnode[1], { width: 100, height: 100 })
  })

  test('Pure construction: same call gives same output', () => {
    const vnode1 = div({ class: 'x' }, 'same')
    const vnode2 = div({ class: 'x' }, 'same')
    assert.deepEqual(vnode1, vnode2)
  })

  test('style object is preserved in props', () => {
    const vnode = div({ style: { color: 'red', fontSize: '12px' } })
    assert.deepEqual(vnode[1].style, { color: 'red', fontSize: '12px' })
  })

  test('class attribute is passed as string', () => {
    const vnode = div({ class: 'hero box' }, 'hello')
    assert.equal(vnode[1].class, 'hero box')
  })

  test('className is invalid (use class)', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    assert.throws(
      () => render(div({ className: 'a' }, 'x'), container),
      /className/
    )

    globalThis.document = prevDocument
    globalThis.window = prevWindow
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

	  test('observe() supports recursion and state threading', () => {
	    const Counter = observe((n = 0) =>
	      div({},
	        pre(n),
	        button({ onclick: () => Counter(n + 1) }, 'inc')
	      )
	    )

	    const first = Counter(0)
	    const inner = first
	    const second = inner[3][1].onclick() // invoke button's onclick

	    assert.equal(inner[0], 'div')
	    assert.equal(inner[2][2], 0)        // pre(n) = 0
	    assert.equal(second[2][2], 1)       // pre(n) = 1 in next render
	  })

  test('vnode return is pure (no mutation of props)', () => {
    const props = { id: 'x' }
    div(props)
    assert.deepEqual(props, { id: 'x' })
  })

  test(
    'multiple projections of one definition update together from events',
    async () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const Counter = observe((n = 0) =>
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
    assert.equal(getCountText(getCounterRoot(1)), '1')

    await click(getCounterRoot(1))
    assert.equal(getCountText(getCounterRoot(0)), '2')
    assert.equal(getCountText(getCounterRoot(1)), '2')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
    }
  )

  test('events run within a rendered html root', async () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()
    let calls = 0

    render(html(body(button({ onclick: () => { calls++ } }, 'go'))))
    await document.body.childNodes[0].onclick({})

    assert.equal(calls, 1)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('boolean props clear attributes when false', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')

    render(div({ hidden: true }, 'x'), container)
    const el = container.childNodes[0]
    assert.equal(el.attributes.hidden, '')

    render(div({ hidden: false }, 'x'), container)
    assert.equal(el.attributes.hidden, undefined)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test(
    'async form handlers claim submission before their result is known',
    async () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container1 = document.createElement('div')

    let prevented = 0
    const event = {
      preventDefault: () => { prevented++ },
      target: { elements: { todo: { value: 'x' } } }
    }

    const App = observe((n = 0) =>
      form({
        onsubmit: async ({ todo: { value } }) =>
          value ? Promise.resolve(App(n + 1)) : undefined
      }, input({ name: 'todo' }), button({ type: 'submit' }, 'go'))
    )

    render(App(0), container1)
    await container1.childNodes[0].onsubmit(event)

    assert.equal(prevented, 1)

    const Passive = observe(() =>
      form({ onsubmit: async () => Promise.resolve(undefined) },
        input({ name: 'todo' }),
        button({ type: 'submit' }, 'go'))
    )

    const container2 = document.createElement('div')
    render(Passive(), container2)
    await container2.childNodes[0].onsubmit(event)

    assert.equal(prevented, 2)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
    }
  )
})
