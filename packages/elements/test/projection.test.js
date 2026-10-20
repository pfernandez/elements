import { transition } from './transition.js'
import { project } from '../elements.js'
import { a, div, head, pre, span } from '../html.js'
import { svg } from '../svg.js'
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { createFakeDom } from './fake-dom.js'

const makeWindow = extra =>
  ({
    location: { pathname: '/', search: '', hash: '' },
    history: { pushState: () => {} },
    ...extra
  })

describe("projection", () => {
  test('transition() skips identical vnode references without traversing them', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const shared = div({ id: 'shared' }, 'same')
    const container = document.createElement('div')

    transition(div({}, shared), container)

    const sharedEl = container.childNodes[0].childNodes[0]
    const attrCount = sharedEl.__setAttributeCount

    Object.defineProperty(
      shared,
      0,
      { configurable: true,
        get: () => { throw new Error('should not traverse identical vnode') } }
    )

    assert.doesNotThrow(() => transition(div({}, shared), container))
    assert.equal(container.childNodes[0].childNodes[0], sharedEl)
    assert.equal(sharedEl.__setAttributeCount, attrCount)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('project() handles empty and malformed vnodes', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window
    const prevConsoleError = console.error

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()
    console.error = () => {}

    const empty = document.createElement('div')
    project([], empty)
    assert.equal(empty.childNodes[0].nodeType, 8)
    assert.equal(empty.childNodes[0].nodeValue, '')

    const malformed = document.createElement('div')
    project({ not: 'a vnode' }, malformed)
    assert.equal(malformed.childNodes[0].nodeType, 8)
    assert.equal(malformed.childNodes[0].nodeValue, '')

    const nonStringTag = document.createElement('div')
    project([123, {}, 'x'], nonStringTag)
    assert.equal(nonStringTag.childNodes[0].nodeType, 8)
    assert.equal(nonStringTag.childNodes[0].nodeValue, '')

    console.error = prevConsoleError
    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('transition() uses setAttributeNS for SVG elements', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    transition(svg({ width: 100, height: 100 }), container)

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
    transition(div({ innerHTML: '<b>ok</b>' }), container)

    const el = container.childNodes[0]
    assert.equal(el.innerHTML, '<b>ok</b>')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('transition() replaces explicit null child slots', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')

    transition(div(null), container)
    const el = container.childNodes[0]
    assert.equal(el.childNodes.length, 1)
    assert.equal(el.childNodes[0].nodeType, 8)

    transition(div('hi'), container)
    assert.equal(el.childNodes.length, 1)
    assert.equal(el.childNodes[0].nodeType, 3)
    assert.equal(el.childNodes[0].nodeValue, 'hi')

    transition(div(null), container)
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
    transition(div({ value: 'hi', checked: true }), container)

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
    const create = document.createElementNS.bind(document)
    document.createElementNS = (namespace, tag) => {
      const el = create(namespace, tag)
      tag === 'div' && el.__throwOnSetAttribute.set('id', new Error('boom'))
      return el
    }

    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    assert.throws(
      () => transition(div({ id: 'x' }, 'ok'), container),
      /boom/
    )

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('property assignment errors fall through', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    const create = document.createElementNS.bind(document)
    document.createElementNS = (namespace, tag) => {
      const el = create(namespace, tag)
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
      () => transition(div({ value: 'x' }, 'ok'), container),
      /boom/
    )

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('transition() updates attributes in place when vnode tag matches', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    transition(div({ id: 'a' }, 'x'), container)

    const el1 = container.childNodes[0]
    assert.equal(el1.attributes.id, 'a')

    transition(div({ id: 'b' }, 'x'), container)

    const el2 = container.childNodes[0]
    assert.equal(el2, el1)
    assert.equal(el2.attributes.id, 'b')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('transition() preserves child order when a wrapper span is removed', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')

    transition(
      span({ class: 'focus' },
        span('(', 'a', ' ', 'b', ')')),
      container
    )

    const root = container.childNodes[0]

    transition(span('(', 'a', ' ', 'b', ')'), container)

    assert.equal(container.childNodes[0], root)
    assert.equal(
      root.childNodes.map(node => node.nodeValue).join(''),
      '(a b)'
    )

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('transition() updates number text nodes', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    transition(div({}, 0), container)

    const getText = () =>
      container.childNodes[0].childNodes[0].nodeValue

    assert.equal(getText(), '0')

    transition(div({}, 1), container)
    assert.equal(getText(), '1')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('transition() replaces element when vnode tag changes', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    transition(div({ id: 'a' }, 'x'), container)

    const el1 = container.childNodes[0]
    assert.equal(el1.tagName.toLowerCase(), 'div')

    transition(pre({ id: 'b' }, 'x'), container)

    const el2 = container.childNodes[0]
    assert.equal(el2.tagName.toLowerCase(), 'pre')
    assert.notEqual(el2, el1)
    assert.equal(el2.attributes.id, 'b')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('transition() clears removed attributes', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    transition(div({ id: 'a' }, 'x'), container)
    assert.equal(container.childNodes[0].attributes.id, 'a')

    transition(div({}, 'x'), container)
    assert.equal(container.childNodes[0].attributes.id, undefined)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('transition() clears removed style object', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    transition(div({ style: { color: 'red' } }, 'x'), container)
    assert.equal(container.childNodes[0].style.color, 'red')

    transition(div({}, 'x'), container)
    assert.equal(container.childNodes[0].style.color, undefined)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('transition() clears removed innerHTML', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    transition(div({ innerHTML: '<b>ok</b>' }), container)
    assert.equal(container.childNodes[0].innerHTML, '<b>ok</b>')

    transition(div({}), container)
    assert.equal(container.childNodes[0].innerHTML, '')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('transition() clears removed property exceptions', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    transition(div({ value: 'hi', checked: true }, 'x'), container)
    assert.equal(container.childNodes[0].value, 'hi')
    assert.equal(container.childNodes[0].checked, true)

    transition(div({}, 'x'), container)
    assert.equal(container.childNodes[0].value, '')
    assert.equal(container.childNodes[0].checked, false)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('transition() removes children when omitted', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    transition(div({}, div('a'), div('b')), container)
    assert.equal(container.childNodes[0].childNodes.length, 2)

    transition(div({}, div('a')), container)
    assert.equal(container.childNodes[0].childNodes.length, 1)
    const a = container.childNodes[0].childNodes[0].childNodes[0].nodeValue
    assert.equal(a, 'a')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('transition() adds children when introduced', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    transition(div({}, div('a')), container)
    assert.equal(container.childNodes[0].childNodes.length, 1)

    transition(div({}, div('a'), div('b')), container)
    assert.equal(container.childNodes[0].childNodes.length, 2)
    const b = container.childNodes[0].childNodes[1].childNodes[0].nodeValue
    assert.equal(b, 'b')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test(
    'transition() maintains child order across inserts and removals',
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

    transition(describeState(['a', 'b', 'c']), container)
    assert.deepEqual(labels(), ['a', 'b', 'c'])

    // remove middle
    transition(describeState(['a', 'c']), container)
    assert.deepEqual(labels(), ['a', 'c'])

    // insert at head
    transition(describeState(['x', 'a', 'c']), container)
    assert.deepEqual(labels(), ['x', 'a', 'c'])

    // insert in middle and tail
    transition(describeState(['x', 'a', 'y', 'c', 'z']), container)
    assert.deepEqual(labels(), ['x', 'a', 'y', 'c', 'z'])

    // remove head and tail
    transition(describeState(['a', 'y', 'c']), container)
    assert.deepEqual(labels(), ['a', 'y', 'c'])

    globalThis.document = prevDocument
    globalThis.window = prevWindow
    }
  )

  test('transition() does not assign key as an attribute', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    transition(div({ key: 'k', id: 'x' }, 'hi'), container)
    assert.equal(container.childNodes[0].attributes.key, undefined)
    assert.equal(container.childNodes[0].attributes.id, 'x')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('transition() preserves keyed child identity across reorders', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    const describeState = items =>
      div({}, items.map(x => div({ key: x, id: x }, x)))

    transition(describeState(['a', 'b', 'c']), container)
    const root = container.childNodes[0]
    const a = root.childNodes[0]
    const b = root.childNodes[1]
    const c = root.childNodes[2]

    transition(describeState(['c', 'b', 'a']), container)
    const nextRoot = container.childNodes[0]
    assert.equal(nextRoot.childNodes[0], c)
    assert.equal(nextRoot.childNodes[1], b)
    assert.equal(nextRoot.childNodes[2], a)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('transition() preserves unkeyed child identity across reorders when references are reused', () => {
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

    transition(describeState([a, b, c]), container)
    const root = container.childNodes[0]
    const aEl = root.childNodes[0]
    const bEl = root.childNodes[1]
    const cEl = root.childNodes[2]

    transition(describeState([c, b, a]), container)
    const nextRoot = container.childNodes[0]
    assert.equal(nextRoot.childNodes[0], cEl)
    assert.equal(nextRoot.childNodes[1], bEl)
    assert.equal(nextRoot.childNodes[2], aEl)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('transition() inserts keyed children without remounting others', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    const describeState = items =>
      div({}, items.map(x => div({ key: x, id: x }, x)))

    transition(describeState(['a', 'c']), container)
    const root = container.childNodes[0]
    const a = root.childNodes[0]
    const c = root.childNodes[1]

    transition(describeState(['a', 'b', 'c']), container)
    const nextRoot = container.childNodes[0]
    assert.equal(nextRoot.childNodes[0], a)
    assert.equal(nextRoot.childNodes[2], c)
    assert.equal(nextRoot.childNodes[1].attributes.id, 'b')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('transition() does not fall back to index when a keyed child changes identity', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    const describeState = key => div({},
      div({ key: 'controls', id: 'controls' }, 'controls'),
      div({ key, id: key }, key))

    transition(describeState('a'), container)
    const root = container.childNodes[0]
    const controls = root.childNodes[0]
    const scene = root.childNodes[1]

    transition(describeState('b'), container)
    const nextRoot = container.childNodes[0]
    assert.equal(nextRoot.childNodes[0], controls)
    assert.notEqual(nextRoot.childNodes[1], scene)
    assert.equal(nextRoot.childNodes[1].attributes.id, 'b')
    assert.equal(nextRoot.childNodes[1].childNodes[0].nodeValue, 'b')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('transition() clears removed style keys (React-like)', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    transition(div({ style: { marginTop: '8px', color: 'red' } }, 'x'), container)
    assert.equal(container.childNodes[0].style.marginTop, '8px')
    assert.equal(container.childNodes[0].style.color, 'red')

    transition(div({ style: { color: 'blue' } }, 'x'), container)
    assert.equal(container.childNodes[0].style.marginTop, '')
    assert.equal(container.childNodes[0].style.color, 'blue')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('transition() supports null style values to remove keys', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    transition(div({ style: { marginTop: '8px' } }, 'x'), container)
    transition(div({ style: { marginTop: null } }, 'x'), container)
    assert.equal(container.childNodes[0].style.marginTop, '')

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('transition() supports class: null to clear class attribute', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = makeWindow()

    const container = document.createElement('div')
    transition(div({ class: 'x y' }, 'x'), container)
    assert.equal(container.childNodes[0].attributes.class, 'x y')

    transition(div({ class: null }, 'x'), container)
    assert.equal(container.childNodes[0].attributes.class, undefined)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })
})
