import assert from 'node:assert/strict'
import { test } from 'node:test'

import { navigate } from '../elements.js'

const makeEvent = name =>
  class {
    constructor(type) {
      this.type = type
      this.name = name
    }
  }

test('navigate() pushes history and dispatches popstate', () => {
  const prevWindow = globalThis.window
  const prevEvent = globalThis.Event
  const prevPopStateEvent = globalThis.PopStateEvent

  const events = []
  const historyCalls = []

  globalThis.Event = makeEvent('Event')
  globalThis.PopStateEvent = makeEvent('PopStateEvent')

  globalThis.window = {
    location: {
      origin: 'https://example.test',
      pathname: '/',
      search: '',
      hash: ''
    },
    history: {
      pushState: (...args) => historyCalls.push(['pushState', ...args]),
      replaceState: (...args) => historyCalls.push(['replaceState', ...args]),
    },
    dispatchEvent: e => (events.push(e), true)
  }

  navigate('/next')

  assert.equal(historyCalls.length, 1)
  assert.equal(historyCalls[0][0], 'pushState')
  assert.equal(historyCalls[0][3].pathname, '/next')

  assert.equal(events.length, 1)
  assert.equal(events[0].type, 'popstate')
  assert.equal(events[0].name, 'PopStateEvent')

  globalThis.window = prevWindow
  globalThis.Event = prevEvent
  globalThis.PopStateEvent = prevPopStateEvent
})

test('navigate() does nothing when URL is unchanged', () => {
  const prevWindow = globalThis.window

  const historyCalls = []
  const events = []

  globalThis.window = {
    location: {
      origin: 'https://example.test',
      pathname: '/same',
      search: '?q=1',
      hash: '#x'
    },
    history: {
      pushState: () => historyCalls.push('push'),
      replaceState: () => historyCalls.push('replace'),
    },
    dispatchEvent: e => (events.push(e), true)
  }

  navigate('/same?q=1#x')

  assert.equal(historyCalls.length, 0)
  assert.equal(events.length, 0)

  globalThis.window = prevWindow
})

test(
  'navigate() can replaceState and falls back when PopStateEvent throws',
  () => {
  const prevWindow = globalThis.window
  const prevEvent = globalThis.Event
  const prevPopStateEvent = globalThis.PopStateEvent

  const historyCalls = []
  const events = []

  globalThis.Event = makeEvent('Event')
  globalThis.PopStateEvent =
    class {
      constructor() { throw new Error('no PopStateEvent') }
    }

  globalThis.window = {
    location: {
      origin: 'https://example.test',
      pathname: '/',
      search: '',
      hash: ''
    },
    history: {
      pushState: (...args) => historyCalls.push(['pushState', ...args]),
      replaceState: (...args) => historyCalls.push(['replaceState', ...args]),
    },
    dispatchEvent: e => (events.push(e), true)
  }

  navigate('/r', { replace: true })

  assert.equal(historyCalls.length, 1)
  assert.equal(historyCalls[0][0], 'replaceState')
  assert.equal(events.length, 1)
  assert.equal(events[0].type, 'popstate')
  assert.equal(events[0].name, 'Event')

  globalThis.window = prevWindow
  globalThis.Event = prevEvent
  globalThis.PopStateEvent = prevPopStateEvent
  }
)
