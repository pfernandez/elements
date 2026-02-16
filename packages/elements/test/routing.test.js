import assert from 'node:assert/strict'
import { test } from 'node:test'

import { a, div, onNavigate, render } from '../elements.js'
import { createFakeDom } from './fake-dom.js'

const makeEventClass = name =>
  class {
    constructor(type) {
      this.type = type
      this.name = name
    }
  }

const makeWindow = ({
  origin = 'https://example.test',
  pathname = '/',
  search = '',
  hash = '',
  queueMicrotask = null
} = {}) => {
  /** @type {Record<string, Function[]>} */
  const listeners = {}
  const historyCalls = []

  const window = {
    location: { origin, pathname, search, hash },
    history: {
      pushState: (_state, _title, url) => {
        historyCalls.push(['pushState', url])
        window.location.pathname = url.pathname
        window.location.search = url.search
        window.location.hash = url.hash
      },
      replaceState: (_state, _title, url) => {
        historyCalls.push(['replaceState', url])
        window.location.pathname = url.pathname
        window.location.search = url.search
        window.location.hash = url.hash
      }
    },
    addEventListener: (type, fn) => (listeners[type] ||= []).push(fn),
    removeEventListener: (type, fn) =>
      (listeners[type] = (listeners[type] || []).filter(x => x !== fn)),
    dispatchEvent: e => ((listeners[e.type] || []).forEach(fn => fn(e)), true)
  }

  queueMicrotask && (window.queueMicrotask = queueMicrotask)

  return { window, historyCalls }
}

test('a({ href }) intercepts same-origin left-click when onNavigate() is registered', async () => {
  const prevDocument = globalThis.document
  const prevWindow = globalThis.window
  const prevEvent = globalThis.Event
  const prevPopStateEvent = globalThis.PopStateEvent

  try {
    const { document } = createFakeDom()
    globalThis.document = document

    globalThis.Event = makeEventClass('Event')
    globalThis.PopStateEvent = makeEventClass('PopStateEvent')

    const { window, historyCalls } = makeWindow()
    globalThis.window = window

    let navCalls = 0
    const unsubscribe = onNavigate(() => { navCalls++ })

    const container = document.createElement('div')
    render(a({ href: '/next' }, 'go'), container)

    let prevented = 0
    await container.childNodes[0].onclick({
      button: 0,
      preventDefault: () => { prevented++ }
    })

    await Promise.resolve()

    assert.equal(prevented, 1)
    assert.equal(historyCalls.length, 1)
    assert.equal(historyCalls[0][0], 'pushState')
    assert.equal(window.location.pathname, '/next')
    assert.equal(navCalls, 1)

    unsubscribe()
  } finally {
    globalThis.document = prevDocument
    globalThis.window = prevWindow
    globalThis.Event = prevEvent
    globalThis.PopStateEvent = prevPopStateEvent
  }
})

test('a({ href }) does not intercept modified clicks (ctrl/meta/shift/alt)', async () => {
  const prevDocument = globalThis.document
  const prevWindow = globalThis.window
  const prevEvent = globalThis.Event
  const prevPopStateEvent = globalThis.PopStateEvent

  try {
    const { document } = createFakeDom()
    globalThis.document = document

    globalThis.Event = makeEventClass('Event')
    globalThis.PopStateEvent = makeEventClass('PopStateEvent')

    const { window, historyCalls } = makeWindow()
    globalThis.window = window

    const unsubscribe = onNavigate(() => {})

    const container = document.createElement('div')
    render(div({},
      a({ href: '/x' }, 'go'),
      a({ href: '/y' }, 'go'),
      a({ href: '/z' }, 'go'),
      a({ href: '/w' }, 'go')
    ), container)

    const [ax, ay, az, aw] = container.childNodes[0].childNodes

    let prevented = 0
    await ax.onclick({ button: 0, ctrlKey: true, preventDefault: () => { prevented++ } })
    await ay.onclick({ button: 0, metaKey: true, preventDefault: () => { prevented++ } })
    await az.onclick({ button: 0, shiftKey: true, preventDefault: () => { prevented++ } })
    await aw.onclick({ button: 0, altKey: true, preventDefault: () => { prevented++ } })

    assert.equal(prevented, 0)
    assert.equal(historyCalls.length, 0)

    unsubscribe()
  } finally {
    globalThis.document = prevDocument
    globalThis.window = prevWindow
    globalThis.Event = prevEvent
    globalThis.PopStateEvent = prevPopStateEvent
  }
})

test('a({ href }) does not intercept when href is not routable', async () => {
  const prevDocument = globalThis.document
  const prevWindow = globalThis.window
  const prevEvent = globalThis.Event
  const prevPopStateEvent = globalThis.PopStateEvent

  try {
    const { document } = createFakeDom()
    globalThis.document = document

    globalThis.Event = makeEventClass('Event')
    globalThis.PopStateEvent = makeEventClass('PopStateEvent')

    const { window, historyCalls } = makeWindow()
    globalThis.window = window

    const unsubscribe = onNavigate(() => {})

    const container = document.createElement('div')
    render(div({},
      a({ href: '#x' }, 'hash'),
      a({ href: 'mailto:test@example.test' }, 'mailto'),
      a({ href: 'https://other.test/x' }, 'cross-origin'),
      a({ href: 123 }, 'non-string')
    ), container)

    let prevented = 0
    for (const el of container.childNodes[0].childNodes) {
      await el.onclick({ button: 0, preventDefault: () => { prevented++ } })
    }

    assert.equal(prevented, 0)
    assert.equal(historyCalls.length, 0)

    unsubscribe()
  } finally {
    globalThis.document = prevDocument
    globalThis.window = prevWindow
    globalThis.Event = prevEvent
    globalThis.PopStateEvent = prevPopStateEvent
  }
})

test('a({ href }) does not intercept when download/target/cancelable block routing', async () => {
  const prevDocument = globalThis.document
  const prevWindow = globalThis.window
  const prevEvent = globalThis.Event
  const prevPopStateEvent = globalThis.PopStateEvent

  try {
    const { document } = createFakeDom()
    globalThis.document = document

    globalThis.Event = makeEventClass('Event')
    globalThis.PopStateEvent = makeEventClass('PopStateEvent')

    const { window, historyCalls } = makeWindow()
    globalThis.window = window

    const unsubscribe = onNavigate(() => {})

    const container = document.createElement('div')
    render(div({},
      a({ href: '/x', download: true }, 'download'),
      a({ href: '/y', target: '_blank' }, 'blank'),
      a({ href: '/z' }, 'not-cancelable')
    ), container)

    const [downloadEl, blankEl, notCancelableEl] = container.childNodes[0].childNodes

    let prevented = 0
    await downloadEl.onclick({ button: 0, preventDefault: () => { prevented++ } })
    await blankEl.onclick({ button: 0, preventDefault: () => { prevented++ } })
    await notCancelableEl.onclick({
      button: 0,
      cancelable: false,
      preventDefault: () => { prevented++ }
    })

    assert.equal(prevented, 0)
    assert.equal(historyCalls.length, 0)

    unsubscribe()
  } finally {
    globalThis.document = prevDocument
    globalThis.window = prevWindow
    globalThis.Event = prevEvent
    globalThis.PopStateEvent = prevPopStateEvent
  }
})

test('a({ href }) does not intercept non-left clicks or already-prevented events', async () => {
  const prevDocument = globalThis.document
  const prevWindow = globalThis.window
  const prevEvent = globalThis.Event
  const prevPopStateEvent = globalThis.PopStateEvent

  try {
    const { document } = createFakeDom()
    globalThis.document = document

    globalThis.Event = makeEventClass('Event')
    globalThis.PopStateEvent = makeEventClass('PopStateEvent')

    const { window, historyCalls } = makeWindow()
    globalThis.window = window

    const unsubscribe = onNavigate(() => {})

    const container = document.createElement('div')
    render(div({},
      a({ href: '/x' }, 'right'),
      a({ href: '/y' }, 'prevented')
    ), container)

    const [rightClickEl, preventedEl] = container.childNodes[0].childNodes

    let prevented = 0
    await rightClickEl.onclick({ button: 2, preventDefault: () => { prevented++ } })
    await preventedEl.onclick({
      button: 0,
      defaultPrevented: true,
      preventDefault: () => { prevented++ }
    })

    assert.equal(prevented, 0)
    assert.equal(historyCalls.length, 0)

    unsubscribe()
  } finally {
    globalThis.document = prevDocument
    globalThis.window = prevWindow
    globalThis.Event = prevEvent
    globalThis.PopStateEvent = prevPopStateEvent
  }
})

test('a({ href }) treats invalid URLs as non-routable', async () => {
  const prevDocument = globalThis.document
  const prevWindow = globalThis.window
  const prevEvent = globalThis.Event
  const prevPopStateEvent = globalThis.PopStateEvent

  try {
    const { document } = createFakeDom()
    globalThis.document = document

    globalThis.Event = makeEventClass('Event')
    globalThis.PopStateEvent = makeEventClass('PopStateEvent')

    const { window, historyCalls } = makeWindow()
    globalThis.window = window

    const unsubscribe = onNavigate(() => {})

    const container = document.createElement('div')
    render(a({ href: 'http://[' }, 'bad'), container)

    let prevented = 0
    await container.childNodes[0].onclick({ button: 0, preventDefault: () => { prevented++ } })

    assert.equal(prevented, 0)
    assert.equal(historyCalls.length, 0)

    unsubscribe()
  } finally {
    globalThis.document = prevDocument
    globalThis.window = prevWindow
    globalThis.Event = prevEvent
    globalThis.PopStateEvent = prevPopStateEvent
  }
})
