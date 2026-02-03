import { spawnSync } from 'node:child_process'

const run = args => {
  const result = spawnSync('npm', ['run', '-s', ...args], { stdio: 'inherit' })
  if (result.status) process.exit(result.status)
}

const runTsc = () => {
  const bin = process.platform === 'win32'
    ? 'node_modules/.bin/tsc.cmd'
    : 'node_modules/.bin/tsc'
  const result = spawnSync(bin, ['-p', 'tsconfig.json'], { stdio: 'inherit' })
  if (result.status) process.exit(result.status)
}

run(['clean:types'])
run(['gen:x3d:runtime'])
runTsc()
run(['gen:x3d:types'])
