import assert from 'node:assert/strict'
import { setTimeout as delay } from 'node:timers/promises'
import { html, observe, project } from '../../elements.js'
import { snapshot, resume } from '../../src/core/observer.js'
import { createFakeDom } from '../fake-dom.js'

// This fixture runs in a separate process with --expose-gc. No browser or
// observer registry should retain discarded nodes, even with an outstanding RAF.
globalThis.document = createFakeDom().document
const frames = []
globalThis.window = {
  requestAnimationFrame: callback => (frames.push(callback), frames.length),
  cancelAnimationFrame: () => {}
}
const counter = observe((n = 0) => html.button({ onclick: () => counter(n + 1) }, n))
const wrap = observe(value => value)
const initial = counter()
const abandoned = () => {
  project(wrap(initial), document.body)
  const root = document.body.lastChild
  document.body.removeChild(root)
  return new WeakRef(root)
}
const discarded = abandoned()
const ticking = () => {
  const root = project(html.div({ ontick: el => ({ element: el }) }))
  // Initialize context referencing the node, then pause after disconnection.
  root.isConnected = true
  frames.at(-1)(0)
  root.isConnected = false
  frames.at(-1)(16)
  return new WeakRef(root)
}
const discardedTick = ticking()
project(initial, document.body)
const connected = new WeakRef(document.body.firstChild)
const retained = () => {
  project(initial, document.body)
  return document.body.removeChild(document.body.lastChild)
}
const kept = retained()
// Persist history observations too: their identity must not own old DOM.
const history = snapshot(document)
for (let i = 0; i < 30; i++) {
  await delay(0)
  globalThis.gc()
  await delay(0)
  if (!discarded.deref() && !discardedTick.deref()) break
}
assert.equal(discarded.deref(), undefined, 'observer/history retained discarded DOM')
assert.equal(discardedTick.deref(), undefined, 'pending tick retained discarded DOM')
assert.ok(connected.deref(), 'live DOM lost its projection')
resume(counter(7))
assert.equal(document.body.firstChild.textContent, '7')
assert.equal(kept.textContent, '7', 'a retained detached projection must follow selections')
assert.ok(history.size > 0)
frames.forEach(callback => callback(0))
console.log('Discarded DOM collected; connected and retained projections stay live.')
