import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import os from 'node:os'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const harness = path.join(root, '.cache/js-framework-benchmark')
const driver = path.join(harness, 'webdriver-ts')
const output = path.resolve(process.argv[2] || path.join(root, '.cache/elements-validation/release'))
const names = ['elements-release-retained', 'elements-release-fresh', 'react-hooks', 'react-hooks-fresh']
const cpu = ['01_', '02_', '03_', '04_', '05_', '06_', '07_', '08_', '09_']
const memory = ['21_', '22_', '25_']
const chrome = process.env.CHROME_BIN || '/usr/bin/google-chrome'
const read = file => JSON.parse(readFileSync(file, 'utf8'))
const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex')
mkdirSync(output, { recursive: true })
const bundles = Object.fromEntries(names.map(name => {
  const directory = path.join(harness, 'frameworks/keyed', name)
  const index = readFileSync(path.join(directory, 'index.html'), 'utf8')
  const files = [...index.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(match => match[1])
  if (!files.length) throw new Error(`No bundled scripts for ${name}`)
  return [name, files.map(file => {
    const full = path.join(directory, file)
    const bytes = readFileSync(full)
    return { file, bytes: bytes.length, gzipBytes: gzipSync(bytes).length, sha256: hash(full) }
  })]
}))
const runtimeRevision = read(path.join(harness, 'frameworks/keyed', names[0], 'package.json'))
  ['js-framework-benchmark'].frameworkVersion
if (!/^[0-9a-f]+$/.test(runtimeRevision)) throw new Error('Build release adapters from a clean committed checkout.')
if (read(path.join(harness, 'frameworks/keyed', names[1], 'package.json'))
  ['js-framework-benchmark'].frameworkVersion !== runtimeRevision)
  throw new Error('Both Elements adapters must use the same revision.')
const evidenceFile = path.join(output, 'results.json')
const evidence = existsSync(evidenceFile) ? read(evidenceFile) : {
  recordedAt: new Date().toISOString(),
  runtimeRevision,
  harnessRevision: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: harness, encoding: 'utf8' }).trim(),
  environment: { chrome: execFileSync(chrome, ['--version'], { encoding: 'utf8' }).trim(),
    node: process.version, cpu: os.cpus()[0].model, platform: os.platform(), kernel: os.release() },
  methodology: { cpu: 'Two passes in opposite framework order; ten samples per operation, twenty for selection; pinned harness warmups and throttling, no trimming.',
    memory: 'Three samples per state; pinned harness GC and page-memory estimator.',
    size: 'Entry JavaScript bytes and gzip bytes, including application code; excludes shared harness CSS.',
    limitations: 'One local machine and Chrome version; sessions run sequentially without concurrent builds/tests. System noise uncontrolled.' },
  bundles, steps: []
}
if (JSON.stringify(evidence.bundles) !== JSON.stringify(bundles))
  throw new Error('Bundles changed since this output directory was measured; use a new directory.')
const save = () => writeFileSync(evidenceFile, JSON.stringify(evidence, null, 2) + '\n')
const execute = (id, args, cwd = driver) => {
  const started = Date.now()
  console.log(`${new Date().toISOString()} START ${id}`)
  const fd = openSync(path.join(output, `${id}.log`), 'w')
  try { execFileSync(process.execPath, args, { cwd, stdio: ['ignore', fd, fd] }) }
  finally { closeSync(fd) }
  console.log(`${new Date().toISOString()} DONE ${id}`)
  return started
}
const collect = (name, cases, since) => {
  const data = readdirSync(path.join(driver, 'results'))
    .filter(file => file.startsWith(`${name}-v`) && file.endsWith('.json'))
    .filter(file => statSync(path.join(driver, 'results', file)).mtimeMs >= since)
    .map(file => read(path.join(driver, 'results', file)))
    .filter(result => cases.some(id => result.benchmark.startsWith(id)))
  if (data.length !== cases.length) throw new Error(`Expected ${cases.length} results for ${name}, got ${data.length}`)
  return data
}
save()
for (let pass = 1; pass <= 2; pass++) {
  for (const name of pass === 1 ? names : [...names].reverse()) {
    const id = `cpu-${pass}-${name}`
    if (evidence.steps.some(step => step.id === id)) continue
    const since = execute(id, ['dist/benchmarkRunner.js', '--headless', '--chromeBinary', chrome,
      '--framework', `keyed/${name}`, '--benchmark', ...cpu, '--count', '10'])
    const results = collect(name, cpu, since)
    for (const result of results) {
      const count = result.benchmark.startsWith('04_') ? 20 : 10
      if (result.values.total.values.length !== count) throw new Error(`Unexpected sample count for ${result.benchmark}`)
    }
    evidence.steps.push({ id, name, pass, results }); save()
  }
}
for (const name of names) {
  const id = `memory-${name}`
  if (evidence.steps.some(step => step.id === id)) continue
  const since = execute(id, ['dist/benchmarkRunner.js', '--headless', '--chromeBinary', chrome,
    '--framework', `keyed/${name}`, '--benchmark', ...memory, '--count', '3'])
  evidence.steps.push({ id, name, results: collect(name, memory, since) }); save()
}
if (!evidence.steps.some(step => step.id === 'startup')) {
  const destination = path.join(output, 'startup')
  execute('startup', ['benchmarks/startup.mjs', '--output', destination, ...names.map(name => `keyed/${name}`)], root)
  evidence.steps.push({ id: 'startup', results: read(path.join(destination, 'results.json')) }); save()
}
console.log(`Saved ${evidenceFile}`)
