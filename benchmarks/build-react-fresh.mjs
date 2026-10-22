import { copyFileSync, existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const frameworks = path.join(root, '.cache/js-framework-benchmark/frameworks/keyed')
const source = path.join(frameworks, 'react-hooks')
const output = path.join(frameworks, 'react-hooks-fresh')
const original = readFileSync(path.join(source, 'src/main.jsx'), 'utf8')
const comparison = ', (prevProps, nextProps) => prevProps.selected === nextProps.selected && prevProps.item === nextProps.item)'
if (!original.includes('const Row = memo(') || !original.includes(comparison))
  throw new Error('The upstream Row implementation changed; review this experiment before building.')
const fresh = original.replace('const Row = memo(', 'const Row = ').replace(comparison, '')
mkdirSync(path.join(output, 'src'), { recursive: true })
writeFileSync(path.join(output, 'src/main.jsx'), fresh)
for (const name of ['index.html', 'webpack.config.js', 'package-lock.json'])
  copyFileSync(path.join(source, name), path.join(output, name))
copyFileSync(path.join(root, '.cache/js-framework-benchmark/LICENSE'), path.join(output, 'LICENSE'))
const metadata = JSON.parse(readFileSync(path.join(source, 'package.json')))
metadata.name = 'js-framework-benchmark-react-hooks-fresh'
writeFileSync(path.join(output, 'package.json'), JSON.stringify(metadata, null, 2) + '\n')
if (!existsSync(path.join(output, 'node_modules')))
  symlinkSync(path.join(source, 'node_modules'), path.join(output, 'node_modules'), 'dir')
execFileSync('npm', ['run', 'build-prod'], { cwd: output, stdio: 'inherit' })
