import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { tmpdir } from 'node:os'

const root = fileURLToPath(new URL('../', import.meta.url))
const chrome = [process.env.CHROME_BIN, 'google-chrome', 'chromium', 'chromium-browser']
  .filter(Boolean).find(command => spawnSync(command, ['--version']).status === 0)
if (!chrome) throw new Error('Set CHROME_BIN to a Chrome or Chromium executable.')

const missing = []
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }
// Serve only built files, with directory indexes and no SPA fallback or transforms.
const server = createServer((request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname
  const base = pathname.startsWith('/elements/') ? '/elements/' : '/checks/'
  const directory = path.join(root, base === '/elements/' ? 'dist' : 'packages/elements/test/browser')
  let file = path.resolve(directory, `.${pathname.slice(base.length - 1)}`)
  try {
    if (!pathname.startsWith(base) || file !== directory && !file.startsWith(`${directory}/`))
      throw new Error('Unknown path')
    if (statSync(file).isDirectory()) file = path.join(file, 'index.html')
    response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream')
    response.end(readFileSync(file))
  } catch {
    missing.push(pathname)
    response.writeHead(404).end('Not found')
  }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const profile = mkdtempSync(path.join(tmpdir(), 'elements-pages-'))

try {
  const output = await new Promise((resolve, reject) => {
    const child = spawn(chrome, [
      '--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
      ...process.env.CI ? ['--no-sandbox'] : [],
      `--user-data-dir=${profile}`, '--dump-dom', '--virtual-time-budget=15000',
      `http://127.0.0.1:${server.address().port}/checks/pages.html`
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
  const failures = missing.filter(url => url !== '/favicon.ico')
  if (!String(output).includes('<pre id="results">PASS</pre>') || failures.length)
    throw new Error(`Pages build failed. Missing assets: ${failures.join(', ')}\n${output}`)
  console.log('Pages build passes: Markdown, CSS, prefixed links, history, direct routes, and state transitions.')
} finally {
  await new Promise(resolve => server.close(resolve))
  rmSync(profile, { recursive: true, force: true })
}
