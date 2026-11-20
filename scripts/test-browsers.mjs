import * as engines from 'playwright'
import { browserServer } from './browser-server.js'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const supported = ['chromium', 'firefox', 'webkit']
const groups = ['projection', 'events', 'observers', 'observer-selection',
                'project', 'integration']
const names = process.argv.slice(2)

for (const name of names.length ? names : supported) {
  if (!supported.includes(name)) throw new Error(`Unknown engine: ${name}`)

  const server = await browserServer(root)
  const errors = []
  let browser
  let checks = 0
  try {
    await server.listen()
    const options = name === 'chromium'
      ? { channel: 'chrome', executablePath: process.env.CHROME_BIN,
          args: ['--js-flags=--expose-gc']}
      : {}
    browser = await engines[name].launch(options)
    const { port } = server.httpServer.address()
    const url = `http://127.0.0.1:${port}/packages/elements/test/browser/`

    // Isolate each group's DOM, session history and one-shot failure fixtures.
    for (const group of groups) {
      const page = await browser.newPage()
      try {
        page.on('pageerror', error => errors.push(String(error)))
        if (name !== 'chromium')
          await page.exposeFunction('gc', () => page.requestGC())
        await page.addInitScript(filter => {
          globalThis.browserCheckFilter = filter
        }, process.env.ELEMENTS_BROWSER_FILTER)
        await page.goto(`${url}index.html?group=${group}`, { waitUntil: 'commit' })
        const output = await page.locator('#results').textContent()
        const results = JSON.parse(decodeURIComponent(output))
        checks += results.length
        for (const { name, error } of results)
          if (error) errors.push(`${name}\n${error}`)
      } finally {
        await page.close()
      }
    }
    if (!checks) errors.push('No browser checks matched.')
    console.log(`${name} ${browser.version()} ran ${checks} checks`)
  } catch (error) {
    errors.push(String(error))
  } finally {
    await browser?.close()
    await server.close()
  }

  if (errors.length) {
    errors.forEach(error => console.error(name, error))
    process.exitCode = 1
  }
}
