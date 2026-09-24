import { mkdtempSync, rmSync } from 'node:fs'
import { spawn, spawnSync } from 'node:child_process'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'

const root = fileURLToPath(new URL('../', import.meta.url))
const chrome = [process.env.CHROME_BIN, 'google-chrome', 'chromium', 'chromium-browser']
  .filter(Boolean)
  .find(command => spawnSync(command, ['--version']).status === 0)

if (!chrome) throw new Error('Set CHROME_BIN to a Chrome or Chromium executable.')

const types = { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css' }
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname
  const filename = path.resolve(root, `.${decodeURIComponent(pathname)}`)
  try {
    if (!filename.startsWith(root)) throw new Error('Outside test root')
    const data = await readFile(filename)
    response.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'text/plain' })
    response.end(data)
  } catch {
    response.writeHead(404)
    response.end()
  }
})

await new Promise((resolve, reject) => {
  server.once('error', reject)
  server.listen(0, '127.0.0.1', () => resolve())
})
const address = /** @type {import('node:net').AddressInfo} */ (server.address())
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
  server.close()
  rmSync(profile, { recursive: true, force: true })
}
