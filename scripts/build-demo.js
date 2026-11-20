import { copyFileSync, mkdirSync } from 'node:fs'
import { createServer } from 'vite'

// Load the same views as the demo, including their Vite raw imports.
const vite = await createServer({
  server: { middlewareMode: true, ws: false, watch: null },
  appType: 'custom'
})
try {
  const { default: config } = await vite.ssrLoadModule('/examples/pages/config.js')
  for (const { href } of config.pages) {
    if (href === '/') continue
    const directory = `dist${href}`
    mkdirSync(directory, { recursive: true })
    copyFileSync('dist/index.html', `${directory}/index.html`)
  }
} finally {
  await vite.close()
}
