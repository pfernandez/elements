import { box, scene, x3d } from '../../3d.js'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { watchDocument } from '../../src/x3dom.js'

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

const fixture = async run => {
  const nodes = [], scenes = []
  let sync, watched, reloads = 0
  class Asset extends EventTarget {
    constructor(tag) { super(); this.tag = tag; this.attributes = {} }
    setAttribute(key, value) { this.attributes[key] = value }
    loaded() {
      this.tag === 'link' ? this.sheet = {} : window.x3dom = { reload: () => reloads++ }
      this.dispatchEvent(new Event('load'))
    }
  }
  const window = {
    MutationObserver: class {
      constructor(callback) { sync = callback }
      observe(node) { watched = node }
    }
  }
  const document = {
    defaultView: window,
    head: { appendChild: node => (nodes.push(node), node) },
    createElement: tag => new Asset(tag),
    querySelectorAll: () => scenes,
    querySelector: selector => selector === 'x3d' ? scenes[0] || null
      : nodes.find(node => selector === `${node.tag}[${node.tag === 'link' ? 'href' : 'src'}="${node.attributes.href || node.attributes.src}"]`) || null
  }
  watchDocument(document)
  assert.equal(watched, document)
  await run({ nodes, scenes, sync: () => sync(), reloads: () => reloads })
}

test('X3DOM helpers construct descriptions without accessing the DOM', async () => {
  const previous = globalThis.document
  globalThis.document = new Proxy({}, { get: () => { throw new Error('DOM access during construction') } })
  try {
    assert.deepEqual(x3d(scene(box())), ['x3d', {}, ['scene', {}, ['box', {}]]])
    await flush()
  } finally { globalThis.document = previous }
})

test('connections load full X3DOM once and reconnection restores missing styles', () =>
  fixture(async ({ nodes, scenes, sync, reloads }) => {
    assert.equal(nodes.length, 0)
    const original = () => {}
    const scene = { hasRuntime: true,
                    __setAttribute: original,
                    runtime: { canvas: {}}}
    scenes.push(scene)
    sync()
    assert.equal(nodes.length, 2)
    assert.match(nodes[1].attributes.src, /x3dom-full\.js$/)
    sync()
    assert.equal(nodes.length, 2)
    nodes.forEach(node => node.loaded())
    await flush()
    assert.equal(reloads(), 1)
    scenes.splice(0)
    sync()
    nodes.splice(0, 1)
    delete scene.runtime
    scenes.push(scene)
    sync()
    assert.equal(nodes.length, 2)
    assert.equal(nodes.filter(node => node.tag === 'script').length, 1)
    nodes.find(node => node.tag === 'link').loaded()
    await flush()
    assert.equal(reloads(), 2)
    assert.equal(scene.setAttribute, original)
    assert.equal(scene.hasRuntime, undefined)
  }))

test('removal during loading does not initialize a disconnected scene', () =>
  fixture(async ({ nodes, scenes, sync, reloads }) => {
    scenes.push({})
    sync()
    scenes.splice(0)
    sync()
    nodes.forEach(node => node.loaded())
    await flush()
    assert.equal(reloads(), 0)
    scenes.push({})
    sync()
    await flush()
    assert.equal(reloads(), 1)
  }))

test('head replacement shares the pending script without waiting for CSS', () =>
  fixture(async ({ nodes, scenes, sync, reloads }) => {
    scenes.push({})
    sync()
    const old = nodes.splice(0)
    sync()
    assert.equal(nodes.filter(node => node.tag === 'script').length, 0,
                 'head replacement must share the pending vendor script')
    old.forEach(node => node.loaded())
    await flush()
    assert.equal(reloads(), 1)
    nodes.forEach(node => node.loaded())
    await flush()
    assert.equal(reloads(), 1)
  }))

test('stylesheet failure does not block scenes or replacing the stylesheet', () =>
  fixture(async ({ nodes, scenes, sync, reloads }) => {
    const warn = console.warn, warnings = []
    console.warn = (...args) => warnings.push(args)
    try {
      scenes.push({})
      sync()
      nodes[0].dispatchEvent(new Event('error'))
      nodes[1].loaded()
      await flush()
      assert.equal(warnings.length, 1)
      assert.equal(reloads(), 1)
      nodes.splice(0, 1)
      sync()
      nodes.find(node => node.tag === 'link').loaded()
      await flush()
      assert.equal(reloads(), 2)
    } finally { console.warn = warn }
  }))
