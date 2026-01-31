import fs from 'node:fs'

fs.rmSync(
  new URL('../types', import.meta.url),
  { recursive: true, force: true })

