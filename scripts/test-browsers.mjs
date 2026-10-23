import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import { browserServer } from './browser-server.js'

const root = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(import.meta.url)
const { default: engines } = await import(pathToFileURL(require.resolve('playwright', {
  paths: [path.join(root, '.cache/js-framework-benchmark/webdriver-ts')]
})))
const names = process.argv.slice(2)
const results = []
for (const name of names.length ? names : ['chromium', 'firefox', 'webkit']) {
  if (!['chromium', 'firefox', 'webkit'].includes(name)) throw new Error(`Unknown engine: ${name}`)
  const server = await browserServer(root)
  let browser
  const result = { engine: name, version: null, checks: [], errors: [] }
  try {
    console.log(`${name}: launching`)
    await server.listen()
    browser = await engines[name].launch({ headless: true,
      ...name === 'chromium' ? { executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome',
        args: ['--js-flags=--expose-gc'] } : {} })
    result.version = browser.version()
    const address = server.httpServer.address()
    // Separate pages prevent one group's synthetic history entries from
    // becoming another group's Back/Forward destinations.
    for (const group of ['projection', 'events', 'observers', 'observer-selection', 'project', 'integration']) {
      const page = await browser.newPage()
      try {
        await page.addInitScript(filter => {
          window.browserCheckFilter = filter
          window.reportBrowserCheck = name => console.info('CHECK', name)
        }, process.env.ELEMENTS_BROWSER_FILTER)
        page.on('console', message => {
          if (message.text().startsWith('CHECK')) console.log(name, message.text())
        })
        page.on('pageerror', error => result.errors.push(String(error)))
        if (name !== 'chromium') await page.exposeFunction('gc', () => page.requestGC())
        await page.goto(`http://127.0.0.1:${address.port}/packages/elements/test/browser/index.html?group=${group}`,
                        { waitUntil: 'commit' })
        await page.waitForSelector('#results', { timeout: 30000 })
        result.checks.push(...JSON.parse(decodeURIComponent(await page.locator('#results').textContent())))
      } finally { await page.close() }
    }
  } catch (error) { result.errors.push(String(error)); console.error(name, String(error)) }
  finally { await browser?.close(); await server.close() }
  results.push(result)
  for (const check of result.checks.filter(check => check.error)) console.error(name, check)
  for (const error of result.errors) console.error(name, error)
  console.log(`${name} ${result.version}: ${result.checks.filter(check => !check.error).length}/${result.checks.length} passed`)
}
const output = path.join(root, '.cache/elements-validation')
mkdirSync(output, { recursive: true })
writeFileSync(path.join(output, 'browsers.json'), JSON.stringify({ recordedAt: new Date().toISOString(), results }, null, 2) + '\n')
process.exitCode = results.some(result => result.errors.length || !result.checks.length
  || result.checks.some(check => check.error)) ? 1 : 0
