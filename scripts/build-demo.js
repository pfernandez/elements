import { copyFileSync, mkdirSync } from 'node:fs'
import { routes } from '../examples/routes.js'

// Each demo URL must also work on a static host after a reload or direct visit.
routes.filter(([route]) => route !== '/').forEach(([route]) => {
  const directory = `dist${route}`
  mkdirSync(directory, { recursive: true })
  copyFileSync('dist/index.html', `${directory}/index.html`)
})
