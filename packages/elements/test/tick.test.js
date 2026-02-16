import assert from 'node:assert/strict'
import { test } from 'node:test'

import { isConnected, startTickLoop, stopTickLoop } from '../src/core/tick.js'

test('isConnected() prefers the isConnected boolean when present', () => {
  assert.equal(isConnected({ isConnected: true, parentNode: null }), true)
  assert.equal(isConnected({ isConnected: false, parentNode: {} }), false)
  assert.equal(isConnected({ parentNode: {} }), true)
  assert.equal(isConnected({ parentNode: null }), false)
})

test('stopTickLoop() is a no-op when no loop exists', () => {
  assert.equal(stopTickLoop({}), undefined)
})

test('startTickLoop() returns early when requestAnimationFrame is unavailable', () => {
  const prevWindow = globalThis.window
  try {
    globalThis.window = undefined
    startTickLoop({}, () => {})
  } finally {
    globalThis.window = prevWindow
  }
})

test('startTickLoop() reuses or replaces existing loops', () => {
  const prevWindow = globalThis.window

  try {
    const rafCalls = []
    const cancelCalls = []

    globalThis.window = {
      requestAnimationFrame: fn => (rafCalls.push(fn), rafCalls.length),
      cancelAnimationFrame: id => cancelCalls.push(id)
    }

    const el = {}
    const ready = () => true
    const handler1 = () => {}
    const handler2 = () => {}

    startTickLoop(el, handler1, { ready })
    startTickLoop(el, handler1, { ready })

    assert.equal(rafCalls.length, 1)
    assert.deepEqual(cancelCalls, [])

    startTickLoop(el, handler2, { ready })

    assert.equal(rafCalls.length, 2)
    assert.deepEqual(cancelCalls, [1])

    stopTickLoop(el)
    assert.deepEqual(cancelCalls, [1, 2])
  } finally {
    globalThis.window = prevWindow
  }
})

