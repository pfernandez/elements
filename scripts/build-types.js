import { spawnSync } from 'node:child_process'

const run = args => {
  const result = spawnSync('npm', ['run', '-s', ...args], { stdio: 'inherit' })
  if (result.status) process.exit(result.status)
}

run(['clean:types'])
run(['gen:x3d:runtime'])
run(['typecheck'])
run(['gen:x3d:types'])

