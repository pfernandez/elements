import assert from 'node:assert/strict'
import { test } from 'node:test'

import { createTagHelper, withX3DOM } from '../src/core/elements-3d.js'

test(
  'withX3DOM does not throw when window+document exist in Node',
  async () => {
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
