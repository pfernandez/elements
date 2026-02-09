/**
 * Fetch X3DOM source into `.cache/` so `scripts/generate-x3d.js` can extract
 * JSDoc descriptions and fields from upstream node definitions.
 *
 * This is intentionally a manual step: it requires network access.
 *
 * Usage:
 *   node scripts/fetch-x3dom-src.js
 *   node scripts/fetch-x3dom-src.js 1.8.4
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const pkgRoot = path.resolve(import.meta.dirname, '..')
const repoRoot = path.resolve(pkgRoot, '..', '..')

const x3domVendorFullPath = path.join(pkgRoot, 'vendor', 'x3dom-full.js')

const readVendoredVersion = () => {
  if (!fs.existsSync(x3domVendorFullPath)) return null
  const src = fs.readFileSync(x3domVendorFullPath, 'utf8')
  const m = src.match(/X3DOM\s+([0-9]+\.[0-9]+\.[0-9]+)/)
  return m?.[1] || null
}

const version = process.argv[2] || readVendoredVersion()

if (!version) {
  console.error('Could not determine X3DOM version (pass one explicitly).')
  process.exit(1)
}

const cacheDir = path.join(repoRoot, '.cache')
const outDir = path.join(cacheDir, `x3dom-src-${version}`)

if (fs.existsSync(outDir)) {
  console.log(`Already present: ${outDir}`)
  process.exit(0)
}

fs.mkdirSync(cacheDir, { recursive: true })

console.log(`Fetching X3DOM source v${version} into: ${outDir}`)

execFileSync(
  'git',
  ['clone', '--depth', '1', '--branch', version, 'https://github.com/x3dom/x3dom', outDir],
  { stdio: 'inherit' }
)
