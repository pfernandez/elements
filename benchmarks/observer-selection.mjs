import { createServer } from 'vite'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
const root = fileURLToPath(new URL('../', import.meta.url)).replace(/\/$/, '')
const require = createRequire(root + '/.cache/js-framework-benchmark/webdriver-ts/package.json')
const { default: puppeteer } = await import(require.resolve('puppeteer-core'))
const server = await createServer({ root, configFile: false, logLevel: 'error', server: { host: '127.0.0.1', port: 0 } })
await server.listen()
let browser
try {
  browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true })
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(String(error)))
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/packages/elements/test/browser/empty.html`)
  const result = await page.evaluate(async () => {
    const { element, observe, project, html } = await import('/packages/elements/elements.js')
    customElements.define('reentry-probe', class extends HTMLElement {
      static observedAttributes = ['data-state']
      attributeChangedCallback(_name, _previous, value) { this.onState?.(value) }
    })
    const probe = element('reentry-probe')
    const view = observe(n => probe({ 'data-state': n }, n))
    const initial = view(0), newer = view(2)
    const left = project(initial), right = project(initial)
    document.body.append(left, right)
    const read = () => [left.textContent, right.textContent]
    const nested = project(html.button({ onclick: () => newer }))
    const trace = []
    left.onState = value => {
      if (value === '1') {
        nested.click()
        trace.push({ point: 'inside callback after nested event', text: read() })
      }
    }
    project(html.button({ onclick: () => view(1) })).click()
    trace.push({ point: 'after outer event', text: read(),
      attributes: [left.getAttribute('data-state'), right.getAttribute('data-state')] })
    nested.click()
    trace.push({ point: 'after replaying the same newer source', text: read() })
    project(html.button({ onclick: () => view(2) })).click()
    trace.push({ point: 'after a fresh newer source', text: read() })
    return trace
  })
  const evidence = { browser: await browser.version(), recordedAt: new Date().toISOString(), result, errors }
  if (errors.length) throw new Error(errors.join('\n'))
  mkdirSync(root + '/.cache/elements-diagnostics', { recursive: true })
  writeFileSync(root + '/.cache/elements-diagnostics/observer-selection.json', JSON.stringify(evidence, null, 2) + '\n')
  console.log(JSON.stringify(evidence, null, 2))
} finally {
  await browser?.close()
  await server.close()
}
