import { spawnSync } from 'node:child_process'

const args = [
  '--test',
  '--experimental-test-coverage',
  '--test-reporter',
  'spec',
  '--test-coverage-lines=95',
  '--test-coverage-branches=85',
  '--test-coverage-functions=90',
  '--test-coverage-include=elements.js',
  '--test-coverage-include=src/**',
  '--test-coverage-exclude=vendor/**',
  '--test-coverage-exclude=src/core/elements-3d.js',
  '--test-coverage-exclude=src/core/types.js',
  'test/*.test.*'
]

const result = spawnSync('node', args, { stdio: 'inherit' })
process.exit(result.status ?? 1)
