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


describe("projection", () => {
  test('render() mounts html() into documentElement', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

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

  test('render() creates head/body if document is missing them', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()

    const oldHead = document.head
    const oldBody = document.body
    document.documentElement.removeChild(oldHead)
    document.documentElement.removeChild(oldBody)
    document.head = null
    document.body = null

    globalThis.document = document
    globalThis.window = makeWindow()

    render(
      html(
        head(title('x')),
        body(div('ok'))
      )
    )

    const tags = document.documentElement.childNodes.map(n => n.tagName)
    assert.ok(tags.includes('HEAD'))
    assert.ok(tags.includes('BODY'))

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render(..., { replace: true }) forces a remount', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')

    render(div({ id: 'a' }, 'one'), container)
    const el1 = container.childNodes[0]

    render(div({ id: 'b' }, 'two'), container, { replace: true })
    const el2 = container.childNodes[0]

    assert.notEqual(el2, el1)
    assert.equal(el2.attributes.id, 'b')
    assert.equal(el2.childNodes[0].nodeValue, 'two')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

test('render() requires a container for non-html roots', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    assert.throws(
      () => render(div('x')),
      /requires a container/
    )

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() skips identical vnode references without traversing them', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const shared = div({ id: 'shared' }, 'same')
    const container = document.createElement('div')

    render(div({}, shared), container)

    const sharedEl = container.childNodes[0].childNodes[0]
    const attrCount = sharedEl.__setAttributeCount

    Object.defineProperty(
      shared,
      0,
      { configurable: true,
        get: () => { throw new Error('should not traverse identical vnode') } }
    )

    assert.doesNotThrow(() => render(div({}, shared), container))
    assert.equal(container.childNodes[0].childNodes[0], sharedEl)
    assert.equal(sharedEl.__setAttributeCount, attrCount)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() handles empty and malformed vnodes', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window
    const prevConsoleError = console.error

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()
    console.error = () => {}

    const empty = document.createElement('div')
    render([], empty)
    assert.equal(empty.childNodes[0].nodeType, 8)
    assert.equal(empty.childNodes[0].nodeValue, '')

    const malformed = document.createElement('div')
    render({ not: 'a vnode' }, malformed)
    assert.equal(malformed.childNodes[0].nodeType, 8)
    assert.equal(malformed.childNodes[0].nodeValue, '')

    const nonStringTag = document.createElement('div')
    render([123, {}, 'x'], nonStringTag)
    assert.equal(nonStringTag.childNodes[0].nodeType, 8)
    assert.equal(nonStringTag.childNodes[0].nodeValue, '')

    console.error = prevConsoleError
    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() uses setAttributeNS for SVG elements', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

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
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    render(div({ innerHTML: '<b>ok</b>' }), container)

    const el = container.childNodes[0]
    assert.equal(el.innerHTML, '<b>ok</b>')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() replaces explicit null child slots', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')

    render(div(null), container)
    const el = container.childNodes[0]
    assert.equal(el.childNodes.length, 1)
    assert.equal(el.childNodes[0].nodeType, 8)

    render(div('hi'), container)
    assert.equal(el.childNodes.length, 1)
    assert.equal(el.childNodes[0].nodeType, 3)
    assert.equal(el.childNodes[0].nodeValue, 'hi')

    render(div(null), container)
    assert.equal(el.childNodes.length, 1)
    assert.equal(el.childNodes[0].nodeType, 8)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('property exceptions assign properties (not attributes)', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

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
    globalThis.window = makeWindow()

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
        && Object.defineProperty(
          el,
          'value',
          { set: () => { throw new Error('boom') } }
        )
      return el
    }

    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    assert.throws(
      () => render(div({ value: 'x' }, 'ok'), container),
      /boom/
    )

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() updates attributes in place when vnode tag matches', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

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

  test('render() preserves child order when a wrapper span is removed', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')

    render(
      span({ class: 'focus' },
        span('(', 'a', ' ', 'b', ')')),
      container
    )

    const root = container.childNodes[0]

    render(span('(', 'a', ' ', 'b', ')'), container)

    assert.equal(container.childNodes[0], root)
    assert.equal(
      root.childNodes.map(node => node.nodeValue).join(''),
      '(a b)'
    )

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() updates number text nodes', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    render(div({}, 0), container)

    const getText = () =>
      container.childNodes[0].childNodes[0].nodeValue

    assert.equal(getText(), '0')

    render(div({}, 1), container)
    assert.equal(getText(), '1')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() replaces element when vnode tag changes', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

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

  test('render() clears removed attributes', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    render(div({ id: 'a' }, 'x'), container)
    assert.equal(container.childNodes[0].attributes.id, 'a')

    render(div({}, 'x'), container)
    assert.equal(container.childNodes[0].attributes.id, undefined)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() clears removed style object', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    render(div({ style: { color: 'red' } }, 'x'), container)
    assert.equal(container.childNodes[0].style.color, 'red')

    render(div({}, 'x'), container)
    assert.equal(container.childNodes[0].style.color, undefined)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() clears removed innerHTML', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    render(div({ innerHTML: '<b>ok</b>' }), container)
    assert.equal(container.childNodes[0].innerHTML, '<b>ok</b>')

    render(div({}), container)
    assert.equal(container.childNodes[0].innerHTML, '')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() clears removed property exceptions', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    render(div({ value: 'hi', checked: true }, 'x'), container)
    assert.equal(container.childNodes[0].value, 'hi')
    assert.equal(container.childNodes[0].checked, true)

    render(div({}, 'x'), container)
    assert.equal(container.childNodes[0].value, '')
    assert.equal(container.childNodes[0].checked, false)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() removes children when omitted', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    render(div({}, div('a'), div('b')), container)
    assert.equal(container.childNodes[0].childNodes.length, 2)

    render(div({}, div('a')), container)
    assert.equal(container.childNodes[0].childNodes.length, 1)
    const a = container.childNodes[0].childNodes[0].childNodes[0].nodeValue
    assert.equal(a, 'a')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() adds children when introduced', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    render(div({}, div('a')), container)
    assert.equal(container.childNodes[0].childNodes.length, 1)

    render(div({}, div('a'), div('b')), container)
    assert.equal(container.childNodes[0].childNodes.length, 2)
    const b = container.childNodes[0].childNodes[1].childNodes[0].nodeValue
    assert.equal(b, 'b')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test(
    'render() maintains child order across inserts and removals',
    () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')

    const describeState = items =>
      div({}, items.map(x => div({ id: x }, x)))

    const labels = () =>
      container.childNodes[0].childNodes
        .map(child => child.attributes.id)

    render(describeState(['a', 'b', 'c']), container)
    assert.deepEqual(labels(), ['a', 'b', 'c'])

    // remove middle
    render(describeState(['a', 'c']), container)
    assert.deepEqual(labels(), ['a', 'c'])

    // insert at head
    render(describeState(['x', 'a', 'c']), container)
    assert.deepEqual(labels(), ['x', 'a', 'c'])

    // insert in middle and tail
    render(describeState(['x', 'a', 'y', 'c', 'z']), container)
    assert.deepEqual(labels(), ['x', 'a', 'y', 'c', 'z'])

    // remove head and tail
    render(describeState(['a', 'y', 'c']), container)
    assert.deepEqual(labels(), ['a', 'y', 'c'])

    globalThis.document = prevDocument
    globalThis.window = prevWindow
    }
  )

  test('render() does not assign key as an attribute', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    render(div({ key: 'k', id: 'x' }, 'hi'), container)
    assert.equal(container.childNodes[0].attributes.key, undefined)
    assert.equal(container.childNodes[0].attributes.id, 'x')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() preserves keyed child identity across reorders', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    const describeState = items =>
      div({}, items.map(x => div({ key: x, id: x }, x)))

    render(describeState(['a', 'b', 'c']), container)
    const root = container.childNodes[0]
    const a = root.childNodes[0]
    const b = root.childNodes[1]
    const c = root.childNodes[2]

    render(describeState(['c', 'b', 'a']), container)
    const nextRoot = container.childNodes[0]
    assert.equal(nextRoot.childNodes[0], c)
    assert.equal(nextRoot.childNodes[1], b)
    assert.equal(nextRoot.childNodes[2], a)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() preserves unkeyed child identity across reorders when references are reused', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const a = div({ id: 'a' }, 'a')
    const b = div({ id: 'b' }, 'b')
    const c = div({ id: 'c' }, 'c')
    const container = document.createElement('div')
    const describeState = items => div({}, ...items)

    render(describeState([a, b, c]), container)
    const root = container.childNodes[0]
    const aEl = root.childNodes[0]
    const bEl = root.childNodes[1]
    const cEl = root.childNodes[2]

    render(describeState([c, b, a]), container)
    const nextRoot = container.childNodes[0]
    assert.equal(nextRoot.childNodes[0], cEl)
    assert.equal(nextRoot.childNodes[1], bEl)
    assert.equal(nextRoot.childNodes[2], aEl)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() inserts keyed children without remounting others', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    const describeState = items =>
      div({}, items.map(x => div({ key: x, id: x }, x)))

    render(describeState(['a', 'c']), container)
    const root = container.childNodes[0]
    const a = root.childNodes[0]
    const c = root.childNodes[1]

    render(describeState(['a', 'b', 'c']), container)
    const nextRoot = container.childNodes[0]
    assert.equal(nextRoot.childNodes[0], a)
    assert.equal(nextRoot.childNodes[2], c)
    assert.equal(nextRoot.childNodes[1].attributes.id, 'b')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() does not fall back to index when a keyed child changes identity', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    const describeState = key => div({},
      div({ key: 'controls', id: 'controls' }, 'controls'),
      div({ key, id: key }, key))

    render(describeState('a'), container)
    const root = container.childNodes[0]
    const controls = root.childNodes[0]
    const scene = root.childNodes[1]

    render(describeState('b'), container)
    const nextRoot = container.childNodes[0]
    assert.equal(nextRoot.childNodes[0], controls)
    assert.notEqual(nextRoot.childNodes[1], scene)
    assert.equal(nextRoot.childNodes[1].attributes.id, 'b')
    assert.equal(nextRoot.childNodes[1].childNodes[0].nodeValue, 'b')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() clears removed style keys (React-like)', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    render(div({ style: { marginTop: '8px', color: 'red' } }, 'x'), container)
    assert.equal(container.childNodes[0].style.marginTop, '8px')
    assert.equal(container.childNodes[0].style.color, 'red')

    render(div({ style: { color: 'blue' } }, 'x'), container)
    assert.equal(container.childNodes[0].style.marginTop, '')
    assert.equal(container.childNodes[0].style.color, 'blue')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() supports null style values to remove keys', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    render(div({ style: { marginTop: '8px' } }, 'x'), container)
    render(div({ style: { marginTop: null } }, 'x'), container)
    assert.equal(container.childNodes[0].style.marginTop, '')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('render() supports class: null to clear class attribute', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    render(div({ class: 'x y' }, 'x'), container)
    assert.equal(container.childNodes[0].attributes.class, 'x y')

    render(div({ class: null }, 'x'), container)
    assert.equal(container.childNodes[0].attributes.class, undefined)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })
})
