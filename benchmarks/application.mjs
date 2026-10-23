import { build, preview } from 'vite'
import { createRequire } from 'node:module'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(import.meta.url)
const { default: engines } = await import(pathToFileURL(require.resolve('playwright', {
  paths: [path.join(root, '.cache/js-framework-benchmark/webdriver-ts')]
})))
const profiling = process.env.ELEMENTS_PROFILE_APPLICATION === '1'
const output = path.join(root, '.cache/elements-validation', profiling ? 'application-profile' : 'application')
const config = { root: path.join(root, 'benchmarks/application'), configFile: false, base: './',
  logLevel: 'error', build: { outDir: path.join(output, 'dist'), emptyOutDir: true, minify: profiling ? false : 'esbuild' },
  preview: { host: '127.0.0.1', port: 0 } }
await build(config)
const server = await preview(config)
const address = server.httpServer.address()
const results = []
try {
  for (const name of process.argv.length > 2 ? process.argv.slice(2) : ['chromium', 'firefox', 'webkit']) {
    if (!['chromium', 'firefox', 'webkit'].includes(name)) throw new Error(`Unknown engine: ${name}`)
    let browser
    const result = { engine: name, version: null, errors: [], measurements: null, checks: [] }
    try {
      browser = await engines[name].launch({ headless: true,
        ...name === 'chromium' ? { executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome' } : {} })
      result.version = browser.version()
      const page = await browser.newPage()
      page.on('pageerror', error => result.errors.push(String(error)))
      await page.goto(`http://127.0.0.1:${address.port}/`)
      await page.waitForFunction(() => !!window.application)
      await page.evaluate(() => { window.app = window.application.setup(500) })
      const field = page.locator('[data-row="0"] input')
      await field.focus()
      await page.keyboard.type('Ada')
      if (await field.inputValue() !== 'Ada') throw new Error('Native input lost text')
      if (!await field.evaluate(node => document.activeElement === node && node.selectionStart === 3))
        throw new Error('Input lost focus or caret')
      await page.locator('[data-row="0"] button').click()
      if (await page.locator('[data-row="0"] output').textContent() !== 'Ada')
        throw new Error('Form submission did not select saved state')
      result.checks.push('native typing, focus, caret and form submission')
      await page.locator('[data-shared]').first().click()
      const shared = await page.locator('[data-shared]').allTextContents()
      if (JSON.stringify(shared) !== '["1","1"]') throw new Error('Shared projections diverged')
      result.checks.push('parallel projections update together')
      await page.locator('[data-route="summary"]').click()
      await page.goBack()
      if (await field.inputValue() !== 'Ada') throw new Error('Back did not restore observed form state')
      await page.goForward()
      if (await page.locator('[data-summary]').count() !== 1) throw new Error('Forward did not restore summary')
      await page.goBack()
      result.checks.push('Back and Forward restore observations')
      const client = profiling && name === 'chromium' ? await page.context().newCDPSession(page) : null
      if (client) {
        await client.send('Profiler.enable')
        await client.send('Profiler.start')
      }
      result.measurements = await page.evaluate(() => window.application.measure(window.app))
      if (client) {
        const { profile } = await client.send('Profiler.stop')
        writeFileSync(path.join(output, 'application.cpuprofile'), JSON.stringify(profile))
      }
      result.checks.push('independent updates, navigation, animation pause and reconnection')
      await page.close()
      if (!profiling) {
        const control = await browser.newPage()
        control.on('pageerror', error => result.errors.push(String(error)))
        await control.goto(`http://127.0.0.1:${address.port}/`)
        await control.waitForFunction(() => !!window.application)
        result.measurements.nativeFormMount = await control.evaluate(() => window.application.nativeMount(500))
        await control.close()
      }
    } catch (error) { result.errors.push(String(error)) }
    finally { await browser?.close() }
    results.push(result)
    console.log(name, JSON.stringify(result))
  }
} finally { await new Promise(resolve => server.httpServer.close(resolve)) }
mkdirSync(output, { recursive: true })
writeFileSync(path.join(output, 'results.json'), JSON.stringify({ recordedAt: new Date().toISOString(),
  sourceSHA256: Object.fromEntries(['benchmarks/application/main.js',
    ...readdirSync(path.join(root, 'packages/elements/src/core')).filter(name => name.endsWith('.js'))
      .map(name => `packages/elements/src/core/${name}`)]
    .map(name => [name, createHash('sha256').update(readFileSync(path.join(root, name))).digest('hex')])),
  methodology: 'Production build; 500 independent forms, two shared projections and one animation hook. Five warmups and 15 samples per synchronous case; 60 observed frame intervals.',
  results }, null, 2) + '\n')
process.exitCode = results.some(result => result.errors.length) ? 1 : 0
