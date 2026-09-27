import { mkdtempSync, rmSync } from 'node:fs'
import { spawn, spawnSync } from 'node:child_process'
import { createServer } from 'vite'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { tmpdir } from 'node:os'

const root = fileURLToPath(new URL('../', import.meta.url))
const chrome = [process.env.CHROME_BIN, 'google-chrome', 'chromium', 'chromium-browser']
  .filter(Boolean)
  .find(command => spawnSync(command, ['--version']).status === 0)

if (!chrome) throw new Error('Set CHROME_BIN to a Chrome or Chromium executable.')

// Exercise demo dependencies and ?raw imports through the same server as dev.
const server = await createServer({
  root,
  configFile: false,
  logLevel: 'error',
  server: { host: '127.0.0.1', port: 0 }
})
await server.listen()
const address = /** @type {import('node:net').AddressInfo} */ (server.httpServer.address())
const profile = mkdtempSync(path.join(tmpdir(), 'elements-browser-'))
const url = `http://127.0.0.1:${address.port}/packages/elements/test/browser/index.html`

try {
  const output = await new Promise((resolve, reject) => {
    const child = spawn(chrome, [
      '--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
      ...process.env.CI ? ['--no-sandbox'] : [],
      `--user-data-dir=${profile}`, '--dump-dom', '--virtual-time-budget=10000', url
    ])
    let stdout = '', stderr = ''
    const timeout = setTimeout(() => child.kill(), 30000)
    child.stdout.on('data', data => { stdout += data })
    child.stderr.on('data', data => { stderr += data })
    child.on('error', reject)
    child.on('close', code => {
      clearTimeout(timeout)
      code === 0 ? resolve(stdout) : reject(new Error(stderr || `Chrome exited ${code}`))
    })
  })
  const encoded = String(output).match(/<pre id="results">([^<]+)<\/pre>/)?.[1]
  if (!encoded) throw new Error(`Browser suite did not complete.\n${output}`)
  const results = JSON.parse(decodeURIComponent(encoded))
  results.forEach(({ name, error }) => console.log(`${error ? 'FAIL' : 'PASS'} ${name}${error ? `\n${error}` : ''}`))
  console.log(`${results.filter(result => !result.error).length}/${results.length} browser checks passed`)
  process.exitCode = results.some(result => result.error) ? 1 : 0
} finally {
  await server.close()
  rmSync(profile, { recursive: true, force: true })
}
