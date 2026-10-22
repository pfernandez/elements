import { build, preview } from 'vite'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import os from 'node:os'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(import.meta.url)
const { default: puppeteer } = await import(pathToFileURL(require.resolve('puppeteer-core', {
  paths: [path.join(root, '.cache/js-framework-benchmark/webdriver-ts')]
})))
const profiling = process.argv.includes('--profile')
const output = path.join(root, '.cache/elements-diagnostics', profiling ? 'profile' : 'timing')
const config = {
  root: path.join(root, 'benchmarks/diagnostics'), configFile: false, base: './',
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
    environment: { browser: await browser.version(), node: process.version,
      cpu: os.cpus()[0].model, platform: os.platform(), kernel: os.release() },
    methodology: 'Synchronous JS and DOM only; 5 warmups, 15 samples, no CPU throttling. Fresh page per case.',
    sourceSHA256: Object.fromEntries(['benchmarks/diagnostics/main.js',
      ...['children', 'element', 'observer', 'dom', 'reconcile', 'namespaces']
        .map(name => `packages/elements/src/core/${name}.js`)]
      .map(name => [name, createHash('sha256').update(readFileSync(path.join(root, name))).digest('hex')])),
    measurements: []
  }
  if (profiling) {
    await reset()
    await client.send('Profiler.enable')
    await client.send('Profiler.setSamplingInterval', { interval: 100 })
    await client.send('Profiler.start')
    await page.evaluate(() => window.diagnostics.freshTable(10000))
    const { profile } = await client.send('Profiler.stop')
    writeFileSync(path.join(output, 'fresh-table.cpuprofile'), JSON.stringify(profile))
    const totals = new Map()
    for (const node of profile.nodes) {
      const name = node.callFrame.functionName || '(anonymous)'
      totals.set(name, (totals.get(name) || 0) + (node.hitCount || 0))
    }
    results.profile = { minified: false, sampleIntervalMicroseconds: 100,
      topSelfSamples: [...totals].sort((a, b) => b[1] - a[1]).slice(0, 30) }
  } else {
    for (const [name, args] of [
      ['freshTable', [1000]], ['freshTable', [10000]],
      ['independent', [1000]], ['independent', [10000]],
      ...[100, 500].flatMap(count => [false, true].map(fresh => ['fanout', [count, fresh]]))
    ]) {
      const result = await run(name, args)
      results.measurements.push({ name, args, result })
      console.log(name, args, JSON.stringify(result))
    }
    for (const retain of [false, true]) {
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
