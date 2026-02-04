import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

const run = args => {
  const result = spawnSync('npm', ['run', '-s', ...args], { stdio: 'inherit' })
  if (result.status) process.exit(result.status)
}

const runTsc = () => {
  const require = createRequire(import.meta.url)
  const tsc = require.resolve('typescript/bin/tsc')
  const result = spawnSync('node', [tsc, '-p', 'tsconfig.json'], {
    stdio: 'inherit'
  })
  if (result.status) process.exit(result.status)
}

run(['clean:types'])
run(['gen:x3d:runtime'])
runTsc()
run(['gen:x3d:types'])

