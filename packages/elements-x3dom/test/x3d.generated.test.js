import assert from 'node:assert/strict'
import fs from 'node:fs'
import { test } from 'node:test'

import * as x3d from '../src/3d.js'

const x3domVendorFullPath = new URL('../vendor/x3dom-full.js', import.meta.url)

const parseRegistry = source => {
  const re = /registerNodeType\(\s*\"([^\"]+)\"\s*,\s*\"([^\"]+)\"/g
  const byName = new Map()
  let match
  while (match = re.exec(source)) byName.set(match[1], match[2])
  return byName
}

const toTagName = pascal => {
  if (pascal === 'LOD') return 'lod'
  return pascal.toLowerCase()
}

const toHelperName = pascal => {
  if (pascal === 'LOD') return 'lod'
  return pascal[0].toLowerCase() + pascal.slice(1)
}

const toExportName = tag => {
  if (tag === 'switch') return 'x3dswitch'
  if (tag === 'text') return 'x3dtext'
  if (tag === 'param') return 'x3dparam'
  return tag
}

test('3d.js exports helpers for every concrete x3dom node', () => {
  assert.equal(fs.existsSync(x3domVendorFullPath), true)
  const registrySource = fs.readFileSync(x3domVendorFullPath, 'utf8')
  const byName = parseRegistry(registrySource)

  // Ensure collision-prone names are not exported directly.
  assert.equal('switch' in x3d, false)
  assert.equal('text' in x3d, false)
  assert.equal('param' in x3d, false)

  // <x3d> is not in registerNodeType.
  assert.equal(typeof x3d.x3d, 'function')
  assert.equal(x3d.x3d({})[0], 'x3d')

  for (const name of byName.keys()) {
    if (name.startsWith('X3D')) continue
    const tag = toTagName(name)
    const helperName = toHelperName(name)
    const exportName = toExportName(helperName)
    const fn = x3d[exportName]
    const missing = `missing export: ${exportName} (tag <${tag}>)`
    assert.equal(typeof fn, 'function', missing)
    const vnode = fn({ id: 'x' })
    assert.ok(Array.isArray(vnode))
    assert.equal(vnode[0], tag)
    assert.deepEqual(vnode[1], { id: 'x' })
  }

  // ROUTE is supported as a tag helper, but is not in registerNodeType.
  assert.equal(typeof x3d.route, 'function')
  assert.equal(x3d.route({ fromNode: 'a' })[0], 'route')
})
