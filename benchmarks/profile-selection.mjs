import { build } from 'vite'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(import.meta.url)
const { default: puppeteer } = await import(pathToFileURL(require.resolve('puppeteer-core', {
  paths: [path.join(root, '.cache/js-framework-benchmark/webdriver-ts')]
})))
const output = path.join(root, '.cache/elements-diagnostics/selection-profile')
const adapter = 'benchmarks/keyed/elements/main.js'
const core = 'packages/elements/src/core'
mkdirSync(output, { recursive: true })
await build({
  root: path.join(root, 'benchmarks/keyed/elements'), configFile: false, base: './',
  define: { 'import.meta.env.ELEMENTS_FRESH_ROWS': true },
  resolve: { alias: [
    { find: '@pfern/elements/html', replacement: path.join(root, 'packages/elements/html.js') },
    { find: '@pfern/elements', replacement: path.join(root, 'packages/elements/elements.js') }
  ] },
  build: { outDir: path.join(root, '.cache/js-framework-benchmark/frameworks/keyed/elements-profile-selection'),
    emptyOutDir: true, minify: false }, logLevel: 'error'
})
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome',
  headless: true, args: process.env.CI ? ['--no-sandbox'] : [] })
try {
  const page = await browser.newPage(), client = await page.createCDPSession(), errors = []
  page.on('pageerror', error => errors.push(String(error)))
  await page.goto('http://127.0.0.1:8080/frameworks/keyed/elements-profile-selection/index.html')
  await page.click('#run')
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 1000)
  const select = count => page.evaluate(count => {
    const links = [...document.querySelectorAll('tbody tr:nth-child(-n+2) td:nth-child(2) a')]
    for (let index = 0; index < count; index++) links[index % 2].click()
    return document.querySelectorAll('tr.danger').length
  }, count)
  await select(20)
  await client.send('HeapProfiler.collectGarbage')
  await client.send('Profiler.enable')
  await client.send('Profiler.setSamplingInterval', { interval: 100 })
  await client.send('Profiler.start')
  const selected = await select(100)
  const { profile } = await client.send('Profiler.stop')
  if (selected !== 1 || errors.length) throw new Error(`Selection profile failed: ${errors.join('\n')}`)
  writeFileSync(path.join(output, 'selection.cpuprofile'), JSON.stringify(profile))
  const totals = new Map(), anonymous = new Map()
  for (const node of profile.nodes) {
    const frame = node.callFrame, name = frame.functionName || '(anonymous)', samples = node.hitCount || 0
    totals.set(name, (totals.get(name) || 0) + samples)
    if (!frame.functionName) {
      const key = `${frame.url}:${frame.lineNumber}:${frame.columnNumber}`
      const entry = anonymous.get(key) || { frame, samples: 0 }
      entry.samples += samples
      anonymous.set(key, entry)
    }
  }
  const result = {
    recordedAt: new Date().toISOString(), browser: await browser.version(),
    methodology: 'Actual fresh-row adapter; 1,000 rows; 20 selection warmups, GC, then 100 alternating synchronous selections of the first two rows. Unminified CPU profile at 100 microseconds, no throttling. Diagnostic sample counts, not production timings.',
    sourceSHA256: Object.fromEntries([adapter, ...readdirSync(path.join(root, core))
      .filter(name => name.endsWith('.js')).map(name => `${core}/${name}`)]
      .map(file => [file, createHash('sha256').update(readFileSync(path.join(root, file))).digest('hex')])),
    topSelfSamples: [...totals].sort((a, b) => b[1] - a[1]).slice(0, 35),
    topAnonymousFrames: [...anonymous.values()].sort((a, b) => b.samples - a.samples).slice(0, 8)
  }
  writeFileSync(path.join(output, 'results.json'), JSON.stringify(result, null, 2) + '\n')
  console.log(`Saved ${output}/selection.cpuprofile and results.json`)
} finally {
  await browser.close()
}
