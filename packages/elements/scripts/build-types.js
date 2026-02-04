import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const run = args => {
  const result = spawnSync('node', args, { stdio: 'inherit' })
  if (result.status) process.exit(result.status)
}

const runTsc = () => {
  const tsc = require.resolve('typescript/bin/tsc')
  const result = spawnSync('node', [tsc, '-p', 'tsconfig.json'], {
    stdio: 'inherit'
  })
  if (result.status) process.exit(result.status)
}

run(['scripts/clean-types.js'])
runTsc()
