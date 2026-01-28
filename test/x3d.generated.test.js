import assert from 'node:assert/strict'
import fs from 'node:fs'
import { test } from 'node:test'

import * as x3d from '../src/3d.js'
import { x3dTagNames } from '../src/x3d-tags.js'

const x3domVendorCorePath = new URL('../vendor/x3dom.js', import.meta.url)
const x3domVendorFullPath = new URL('../vendor/x3dom-full.js', import.meta.url)

const parseRegistry = source => {
  const re = /registerNodeType\(\s*\"([^\"]+)\"\s*,\s*\"([^\"]+)\"/g
  const byName = new Map()
  let match
  while (match = re.exec(source)) byName.set(match[1], match[2])
  return byName
}

const toHelperName = pascal => {
  if (pascal === 'LOD') return 'lod'
  return pascal.toLowerCase()
}

const toExportName = tag => {
  if (tag === 'switch') return 'x3dswitch'
  if (tag === 'text') return 'x3dtext'
  if (tag === 'param') return 'x3dparam'
  return tag
}

test('x3dTagNames matches installed x3dom registerNodeType list', () => {
  const registrySource = fs.readFileSync(
    fs.existsSync(x3domVendorFullPath) ? x3domVendorFullPath : x3domVendorCorePath,
    'utf8'
  )
  const byName = parseRegistry(registrySource)

  const expectedTags = [
    'x3d',
    ...[...byName.keys()]
      .filter(name => !name.startsWith('X3D'))
      .map(toHelperName)
  ]

  assert.equal(x3dTagNames[0], 'x3d')
  assert.deepEqual(new Set(x3dTagNames), new Set(expectedTags))
})

test('3d.js exports helpers for every concrete x3dom node', () => {
  const registrySource = fs.readFileSync(
    fs.existsSync(x3domVendorFullPath) ? x3domVendorFullPath : x3domVendorCorePath,
    'utf8'
  )
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
    const tag = toHelperName(name)
    const exportName = toExportName(tag)
    const fn = x3d[exportName]
    assert.equal(typeof fn, 'function', `missing export: ${exportName} (tag <${tag}>)`)
    const vnode = fn({ id: 'x' })
    assert.ok(Array.isArray(vnode))
    assert.equal(vnode[0], tag)
    assert.deepEqual(vnode[1], { id: 'x' })
  }
})
