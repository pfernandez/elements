import assert from 'node:assert/strict'
import { test } from 'node:test'

const loadX3DOMModule = () =>
  import(
    `${new URL('../src/core/elements-3d.js', import.meta.url).href}`
      + `?t=${Math.random()}`
  )

test(
  'withX3DOM does not throw when window+document exist in Node',
  async () => {
  const { createTagHelper, withX3DOM } = await loadX3DOMModule()
  const prevWindow = globalThis.window
  const prevDocument = globalThis.document
  const prevX3dom = globalThis.x3dom

  const headChildren = []

  globalThis.document = {
    head: {
      appendChild: el => {
        headChildren.push(el)
        typeof el.onload === 'function' && el.onload()
        return el
      }
    },
    createElement: tag => {
      const el = {
        tagName: String(tag).toUpperCase(),
        attributes: {}
      }
      el.setAttribute = (k, v) => { el.attributes[k] = String(v) }
      return el
    },
    querySelector: () => null
  }

  globalThis.window = {
    requestAnimationFrame: cb => cb(0),
    cancelAnimationFrame: () => {}
  }

  globalThis.x3dom = null

  const x3d = withX3DOM('x3d', createTagHelper('x3d'))
  assert.deepEqual(x3d({ id: 'x' }), ['x3d', { id: 'x' }])

  // Allow the async loader to attempt imports and fall back to URL loading.
  await new Promise(resolve => setTimeout(resolve, 0))

  const linkCount = headChildren.filter(x => x.tagName === 'LINK').length
  const scriptCount = headChildren.filter(x => x.tagName === 'SCRIPT').length
  assert.ok(linkCount >= 1)
  assert.ok(scriptCount >= 1)

  globalThis.window = prevWindow
  globalThis.document = prevDocument
  globalThis.x3dom = prevX3dom
  }
)

test(
  'withX3DOM loads x3dom-full (and never core)',
  async () => {
  const { createTagHelper, withX3DOM } = await loadX3DOMModule()
  const prevWindow = globalThis.window
  const prevDocument = globalThis.document
  const prevX3dom = globalThis.x3dom
  const prevWarn = console.warn

  const headChildren = []
  console.warn = () => {}

  globalThis.document = {
    head: {
      appendChild: el => {
        headChildren.push(el)

        typeof el.onload === 'function' && el.onload()
        return el
      }
    },
    createElement: tag => {
      const el = {
        tagName: String(tag).toUpperCase(),
        attributes: {}
      }
      el.setAttribute = (k, v) => { el.attributes[k] = String(v) }
      return el
    },
    querySelector: () => null
  }

  globalThis.window = {
    requestAnimationFrame: cb => cb(0),
    cancelAnimationFrame: () => {},
    x3dom: null
  }

  globalThis.x3dom = null

  const arc2d = withX3DOM('arc2d', createTagHelper('arc2d'))
  assert.deepEqual(arc2d({ id: 'x' }), ['arc2d', { id: 'x' }])

  await new Promise(resolve => setTimeout(resolve, 0))

  const scriptSrcs =
    headChildren
      .filter(x => x.tagName === 'SCRIPT')
      .map(x => String(x.src))

  const hasFull = scriptSrcs.some(s => s.includes('x3dom-full.js'))
  assert.equal(hasFull, true)
  assert.equal(scriptSrcs.some(s => s.includes('x3dom.js')), false)

  console.warn = prevWarn
  globalThis.window = prevWindow
  globalThis.document = prevDocument
  globalThis.x3dom = prevX3dom
  }
)

test(
  'withX3DOM is a no-op when document is missing (SSR)',
  async () => {
  const { createTagHelper, withX3DOM } = await loadX3DOMModule()
  const prevWindow = globalThis.window
  const prevDocument = globalThis.document
  const prevX3dom = globalThis.x3dom

  globalThis.window = undefined
  globalThis.document = undefined
  globalThis.x3dom = undefined

  const x3d = withX3DOM('x3d', createTagHelper('x3d'))
  assert.deepEqual(x3d({ id: 'x' }), ['x3d', { id: 'x' }])

  await new Promise(resolve => setTimeout(resolve, 0))

  globalThis.window = prevWindow
  globalThis.document = prevDocument
  globalThis.x3dom = prevX3dom
  }
)
