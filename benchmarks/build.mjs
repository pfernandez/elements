import { build } from 'vite'
import { mkdirSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const name = process.argv[2] || 'elements'
const sourceRoot = process.argv[3] ? path.resolve(process.argv[3]) : root
if (!/^[a-z0-9-]+$/.test(name)) throw new Error('Use a lowercase framework name.')
const output = path.join(root, '.cache/js-framework-benchmark/frameworks/keyed', name)
const revision = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: sourceRoot, encoding: 'utf8' }).trim()
const dirty = execFileSync('git', ['status', '--porcelain', '--', 'packages/elements'],
                          { cwd: sourceRoot, encoding: 'utf8' }).trim()

await build({
  root: path.join(root, 'benchmarks/keyed/elements'), configFile: false, base: './',
  resolve: { alias: [
    { find: '@pfern/elements/html', replacement: path.join(sourceRoot, 'packages/elements/html.js') },
    { find: '@pfern/elements', replacement: path.join(sourceRoot, 'packages/elements/elements.js') }
  ] },
  build: { outDir: output, emptyOutDir: false }
})
mkdirSync(output, { recursive: true })
writeFileSync(path.join(output, 'package.json'), JSON.stringify({
  name: `js-framework-benchmark-${name}`, version: '0.1.0',
  'js-framework-benchmark': {
    frameworkVersion: `${revision}${dirty ? '-working-tree' : ''}`,
    frameworkHomeURL: 'https://github.com/pfernandez/elements', language: 'JavaScript'
  }
}, null, 2) + '\n')
writeFileSync(path.join(output, 'package-lock.json'), JSON.stringify({
  name: `js-framework-benchmark-${name}`, version: '0.1.0', lockfileVersion: 3,
  packages: {}
}, null, 2) + '\n')
