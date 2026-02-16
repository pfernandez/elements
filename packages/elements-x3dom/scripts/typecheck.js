import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const tsc = require.resolve('typescript/bin/tsc')

const result =
  spawnSync('node', [tsc, '-p', 'tsconfig.json', '--noEmit'], {
    stdio: 'inherit'
  })

process.exit(result.status ?? 1)

