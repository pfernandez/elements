import { copyFileSync, mkdirSync } from 'node:fs'
import { runnerImport } from 'vite'

// The page config imports the demo views, including their Vite raw imports.
const { module } = await runnerImport('/examples/pages/config.js')
for (const { href } of module.default.pages) {
  if (href === '/') continue
  const directory = `dist${href}`
  mkdirSync(directory, { recursive: true })
  copyFileSync('dist/index.html', `${directory}/index.html`)
}
