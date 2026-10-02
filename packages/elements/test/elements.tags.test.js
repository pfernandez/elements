import * as elements from '../elements.js'
import assert from 'node:assert/strict'
import { test } from 'node:test'

test('all exported element functions return valid vnodes', () => {
  const skip = new Set([
    'render',
    'observe',
    'elements',
    'element',
    'DEBUG',
    'toHtmlString'
  ])
  for (let [tag, fn] of Object.entries(elements)) {
    if (skip.has(tag)) continue

    // Avoid reserved keywords
    if (tag === 'svgswitch') tag = 'switch'
    if (tag === 'x3dswitch') tag = 'switch'
    if (tag === 'htmlvar') tag = 'var'
    if (tag === 'x3dtext') tag = 'text'
    if (tag === 'x3dparam') tag = 'param'

    assert.equal(typeof fn, 'function', `export ${tag} should be a function`)
    const vnode = fn({ id: 'x' }, 'content')
    assert.ok(Array.isArray(vnode), `${tag} should return an array`)
    assert.equal(vnode[0], tag, `${tag} vnode tag should be "${tag}"`)
    assert.deepEqual(vnode[1], { id: 'x' }, `${tag} props should match input`)
  }
})

test('the public API does not expose the removed URL-first router', () => {
  for (const name of ['navigate', 'onNavigate', 'hasNavigateHandler'])
    assert.equal(name in elements, false)
})
