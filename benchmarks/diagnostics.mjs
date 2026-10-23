import { build, preview } from 'vite'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import os from 'node:os'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(import.meta.url)
const { default: puppeteer } = await import(pathToFileURL(require.resolve('puppeteer-core', {
  paths: [path.join(root, '.cache/js-framework-benchmark/webdriver-ts')]
})))
const profiling = process.argv.includes('--profile')
const memoryOnly = process.argv.includes('--memory')
const option = name => {
  const index = process.argv.indexOf(name)
  if (index !== -1 && !process.argv[index + 1]) throw new Error(`Missing value for ${name}`)
  return index === -1 ? undefined : process.argv[index + 1]
}
const sourceRoot = path.resolve(option('--source-root') || root)
const diagnosticCase = option('--case')
if (diagnosticCase && !['freshTable', 'independent', 'fanout'].includes(diagnosticCase))
  throw new Error(`Unknown diagnostic case: ${diagnosticCase}`)
const profileCase = option('--profile-case') || 'fresh-table'
if (!['fresh-table', 'fanout'].includes(profileCase))
  throw new Error(`Unknown profile case: ${profileCase}`)
const output = path.resolve(option('--output')
  || path.join(root, '.cache/elements-diagnostics', profiling ? 'profile' : memoryOnly ? 'memory' : 'timing'))
const core = 'packages/elements/src/core'
const config = {
  root: path.join(root, 'benchmarks/diagnostics'), configFile: false, base: './',
  resolve: { alias: {
    '@pfern/elements/html': path.join(sourceRoot, 'packages/elements/html.js'),
    '../../packages/elements/src/core/observer.js': path.join(sourceRoot, core, 'observer.js')
  } },
  build: { outDir: path.join(output, 'dist'), emptyOutDir: true, minify: profiling ? false : 'esbuild' },
  preview: { host: '127.0.0.1', port: 0 }, logLevel: 'error'
}
await build(config)
const server = await preview(config)
let browser
try {
  browser = await puppeteer.launch({ executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome',
    headless: true, args: ['--js-flags=--expose-gc', ...process.env.CI ? ['--no-sandbox'] : []] })
  const page = await browser.newPage()
  const client = await page.createCDPSession()
  const errors = []
  page.on('pageerror', error => errors.push(String(error)))
  const address = server.httpServer.address()
  const reset = async () => {
    await page.goto(`http://127.0.0.1:${address.port}/`)
    await page.waitForFunction(() => !!window.diagnostics)
    await client.send('HeapProfiler.collectGarbage')
  }
  const run = async (name, args) => {
    await reset()
    return page.evaluate(({ name, args }) => window.diagnostics[name](...args), { name, args })
  }
  const results = {
    recordedAt: new Date().toISOString(),
    revision: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    revisionNote: 'Revision identifies the runner checkout; sourceRoot and sourceSHA256 identify the measured runtime.',
    sourceRoot,
    environment: { browser: await browser.version(), node: process.version,
      cpu: os.cpus()[0].model, platform: os.platform(), kernel: os.release() },
    methodology: 'Synchronous JS and DOM only; 5 warmups, 15 samples, no CPU throttling. Fresh page per case.',
    sourceSHA256: Object.fromEntries([
      ['benchmarks/diagnostics/main.js', root],
      ...readdirSync(path.join(sourceRoot, core)).filter(name => name.endsWith('.js'))
        .map(name => [`${core}/${name}`, sourceRoot])
    ].map(([name, directory]) =>
      [name, createHash('sha256').update(readFileSync(path.join(directory, name))).digest('hex')])),
    measurements: []
  }
  if (profiling) {
    await reset()
    await client.send('Profiler.enable')
    await client.send('Profiler.setSamplingInterval', { interval: 100 })
    await client.send('Profiler.start')
    await page.evaluate(name => name === 'fanout'
      ? window.diagnostics.fanout(500, true)
      : window.diagnostics.freshTable(10000), profileCase)
    const { profile } = await client.send('Profiler.stop')
    writeFileSync(path.join(output, `${profileCase}.cpuprofile`), JSON.stringify(profile))
    const totals = new Map()
    for (const node of profile.nodes) {
      const name = node.callFrame.functionName || '(anonymous)'
      totals.set(name, (totals.get(name) || 0) + (node.hitCount || 0))
    }
    results.profile = { case: profileCase, minified: false, sampleIntervalMicroseconds: 100,
      topSelfSamples: [...totals].sort((a, b) => b[1] - a[1]).slice(0, 30) }
  } else if (memoryOnly) {
    results.methodology = 'Three fresh-page samples; 1,000-row single-observer table; forced GC before and after mount. JS heap and embedder memory are separate from the framework benchmark page-memory estimates.'
    for (let sample = 0; sample < 3; sample++) {
      await reset()
      const before = await client.send('Runtime.getHeapUsage')
      const state = await page.evaluate(() => window.diagnostics.setupTableMemory(1000))
      if (state.elements !== 6002 || state.subscriptions !== 2)
        throw new Error(`Unexpected mounted table: ${JSON.stringify(state)}`)
      await client.send('HeapProfiler.collectGarbage')
      const mounted = await client.send('Runtime.getHeapUsage')
      if (sample === 0 && process.argv.includes('--heap')) {
        const chunks = []
        const receive = ({ chunk }) => chunks.push(chunk)
        client.on('HeapProfiler.addHeapSnapshotChunk', receive)
        await client.send('HeapProfiler.takeHeapSnapshot')
        client.off('HeapProfiler.addHeapSnapshotChunk', receive)
        writeFileSync(path.join(output, 'mounted.heapsnapshot'), chunks.join(''))
      }
      await page.evaluate(() => window.diagnostics.detachMemory(false))
      for (let i = 0; i < 5; i++) {
        await client.send('HeapProfiler.collectGarbage')
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 0)))
      }
      const detached = await client.send('Runtime.getHeapUsage')
      const lifetime = await page.evaluate(() => window.diagnostics.inspectMemory())
      if (lifetime.rootAlive || lifetime.subscriptions) throw new Error(`Unexpected lifetime: ${JSON.stringify(lifetime)}`)
      results.measurements.push({ name: 'mounted-table', sample, state, before, mounted, detached, lifetime })
    }
  } else {
    for (const [name, args] of [
      ['freshTable', [1000]], ['freshTable', [10000]],
      ['independent', [1000]], ['independent', [10000]],
      ...[100, 500].flatMap(count => [false, true].map(fresh => ['fanout', [count, fresh]]))
    ].filter(([name]) => !diagnosticCase || name === diagnosticCase)) {
      const result = await run(name, args)
      results.measurements.push({ name, args, result })
      console.log(name, args, JSON.stringify(result))
    }
    for (const retain of diagnosticCase ? [] : [false, true]) {
      await reset()
      const before = await client.send('Runtime.getHeapUsage')
      const mountedSubscriptions = await page.evaluate(() => window.diagnostics.setupMemory(10000))
      await client.send('HeapProfiler.collectGarbage')
      const mounted = await client.send('Runtime.getHeapUsage')
      await page.evaluate(retain => window.diagnostics.detachMemory(retain), retain)
      for (let attempt = 0; attempt < 5; attempt++) {
        await client.send('HeapProfiler.collectGarbage')
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 0)))
      }
      const detached = await client.send('Runtime.getHeapUsage')
      const state = await page.evaluate(() => window.diagnostics.inspectMemory())
      if (state.rootAlive !== retain || state.subscriptions !== (retain ? mountedSubscriptions : 0))
        throw new Error(`Unexpected detached lifetime: ${JSON.stringify(state)}`)
      results.measurements.push({ name: 'memory', retain, before, mounted, detached, mountedSubscriptions, state })
    }
  }
  if (errors.length) throw new Error(errors.join('\n'))
  mkdirSync(output, { recursive: true })
  writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n')
  console.log(`Saved ${output}/results.json`)
  if (profiling) console.log(results.profile)
} finally {
  await browser?.close()
  await new Promise(resolve => server.httpServer.close(resolve))
}
