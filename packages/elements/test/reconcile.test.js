import { matchChildren, stablePositions } from '../src/core/reconcile.js'
import assert from 'node:assert/strict'
import { div } from '../html.js'
import { observe } from '../elements.js'
import { test } from 'node:test'

test('small child lists preserve key, reference and positional matching', () => {
  const retained = div({ key: 'a' })
  assert.deepEqual(matchChildren([], [retained]), [-1])
  assert.deepEqual(matchChildren([retained], []), [])
  assert.deepEqual(matchChildren([retained], [retained]), [0])
  assert.deepEqual(matchChildren([retained], [div({ key: 'a' })]), [0])
  assert.deepEqual(matchChildren([retained], [div({ key: 'b' })]), [-1])
  assert.deepEqual(matchChildren([retained], [div()]), [-1])
  assert.deepEqual(matchChildren([div()], [retained]), [-1])
  assert.deepEqual(matchChildren(['before'], [div()]), [0])
  assert.deepEqual(matchChildren([div({ key: 1 })], [div({ key: '1' })]), [0])
})

test('matching reserves references before keys and rejects ambiguous identities', () => {
  const shared = observe(() => div())
  const unique = observe(() => div())
  const retained = div({ key: 'a' })
  assert.deepEqual(matchChildren([retained, div({ key: 'a' })],
                                 [div({ key: 'a' }), retained]), [-1, 0])
  assert.deepEqual(matchChildren([shared(), shared(), unique()],
                                 [unique(), shared(), shared()]), [2, 1, -1])
  assert.deepEqual(matchChildren([retained, retained], [retained]), [-1])
  assert.deepEqual(matchChildren(['a', 'b'], ['b', 'a']), [0, 1])
  assert.deepEqual(matchChildren([div(), div()], [div(), div()]), [0, 1])
})

const permutations = values => values.length
  ? values.flatMap((value, index) => permutations(values.filter((_, i) => i !== index))
    .map(rest => [value, ...rest])) : [[]]

test('plain child matching reserves moved references before filling positions', () => {
  const left = div(), right = div(), fresh = () => div()
  assert.deepEqual(matchChildren([left, right], [fresh(), fresh()]), [0, 1])
  assert.deepEqual(matchChildren([left, right], [left, fresh(), fresh()]), [0, 1, -1])
  assert.deepEqual(matchChildren([left, right], [right, fresh()]), [1, -1])
  assert.deepEqual(matchChildren([left, right], [fresh(), left]), [-1, 0])
  assert.deepEqual(matchChildren([left, right], [left, left]), [0, 1])
  assert.deepEqual(matchChildren([left, left], [left, fresh()]), [0, 1])
  assert.deepEqual(matchChildren([left, right], [fresh(), div({ key: 'new' })]), [0, -1])
  const observed = observe(() => div())
  assert.deepEqual(matchChildren([observed(), right], [fresh(), observed()]), [-1, 0])
})

test('placement retains a maximum ordered subsequence for every five-child permutation', () => {
  for (const values of permutations([0, 1, 2, 3, 4])) {
    // Exhaustive subsets form an independent oracle for the minimum move count.
    const ordered = Array.from({ length: 1 << values.length }, (_, mask) =>
      values.filter((_, index) => mask & 1 << index))
      .filter(subset => subset.every((value, index) => !index || value > subset[index - 1]))
    const maximum = Math.max(...ordered.map(subset => subset.length))
    const stable = stablePositions(values)
    const retained = stable ? values.filter((_, index) => stable.has(index)) : values
    assert.equal(retained.length, maximum)
    assert.ok(retained.every((value, index) => !index || value > retained[index - 1]))
  }
  assert.equal(stablePositions([-1, 0, -1, 2]), null)
  assert.equal(stablePositions([]), null)
  assert.equal(stablePositions([-1, -1]), null)
  const stable = stablePositions([2, -1, 0, 1])
  assert.deepEqual([...stable].sort(), [2, 3])
})
