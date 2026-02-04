import { spawnSync } from 'node:child_process'

const args = [
  '--test',
  '--experimental-test-coverage',
  '--test-reporter',
  'spec',
  '--test-coverage-lines=90',
  '--test-coverage-branches=75',
  '--test-coverage-functions=85',
  '--test-coverage-include=3d.js',
  '--test-coverage-include=src/**',
  '--test-coverage-exclude=vendor/**',
  '--test-coverage-exclude=src/core/elements-3d.js',
  'test/*.test.*'
]

const result = spawnSync('node', args, { stdio: 'inherit' })
process.exit(result.status ?? 1)
