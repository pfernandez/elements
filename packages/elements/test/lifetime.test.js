import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

test('subscriptions, history, and scheduled ticks allow discarded projections to be collected', () => {
  const result = spawnSync(process.execPath,
    ['--expose-gc', fileURLToPath(new URL('./fixtures/lifetime.js', import.meta.url))],
    { encoding: 'utf8', timeout: 15000 })
  assert.equal(result.status, 0, result.stderr || String(result.error))
})
