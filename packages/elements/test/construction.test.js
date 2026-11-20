import { div, span } from '../html.js'
import { element, observe } from '../elements.js'
import assert from 'node:assert/strict'
import { mi } from '../mathml.js'
import { namespaceOf } from '../src/core/namespaces.js'
import { title as svgTitle } from '../svg.js'
import { test } from 'node:test'

test('empty and scalar children preserve slots, props and vocabulary namespaces', () => {
  for (const helper of [div, svgTitle, mi, element('plain', null)]) {
    const props = Object.freeze({ id: 'test' }), empty = helper()
    assert.equal(empty.length, 2)
    assert.notEqual(empty[1], helper()[1])
    assert.equal(helper(props)[1], props)
    for (const value of [undefined, null, false, 0, '', 'text']) {
      const vnode = helper(props, value)
      assert.deepEqual(vnode, [empty[0], props, value])
      assert.equal(namespaceOf(vnode), namespaceOf(empty))
    }
  }
})

test('Nested groups preserve literal, vocabulary and observer vnode references', () => {
  const props = Object.freeze({ id: 'literal' })
  const literal = Object.freeze(['custom', props, 'text'])
  const observed = observe(() => svgTitle('observed'))()
  const children = [literal, svgTitle('svg'), mi('x'), observed,
                    element('custom', 'urn:custom')(), element('plain', null)()]
  children.forEach(Object.freeze)
  const group = Object.freeze([[], Object.freeze(children), [[span('last')]]])
  const vnode = div(props, group)
  assert.equal(vnode[1], props)
  children.forEach((child, index) => assert.equal(vnode[index + 2], child))
  assert.deepEqual(vnode.at(-1), span('last'))
  assert.deepEqual(children.map(namespaceOf), [undefined,
                                               'http://www.w3.org/2000/svg', 'http://www.w3.org/1998/Math/MathML',
                                               'http://www.w3.org/2000/svg', 'urn:custom', null])
})

test('Mixed arrays stay intact while empty and sparse vnode groups compose', () => {
  const child = span('child')
  const mixed = Object.freeze([child, 'text'])
  const nestedMixed = Object.freeze([[child], mixed])
  const sparse = []
  sparse[2] = child
  const vnode = div([], [[], sparse], mixed, nestedMixed,
                    undefined, null, false, 0)
  assert.deepEqual(vnode, ['div', {}, child, mixed, nestedMixed, undefined, null, false, 0])
  assert.equal(vnode[3], mixed)
  assert.equal(vnode[4], nestedMixed)
  assert.equal(sparse.length, 3)
  assert.equal(0 in sparse, false)
})

test('element() constructs custom vocabularies with the same vnode contract', () => {
  const widget = element('my-widget')
  assert.deepEqual(
    widget({ mode: 'compact' }, [span('one'), span('two')]),
    ['my-widget', { mode: 'compact' },
     ['span', {}, 'one'], ['span', {}, 'two']]
  )
})

test('recursive handlers describe the next state before projection', () => {
  const counter = observe((count = 0) =>
    div({ onclick: () => counter(count + 1) }, count))

  const current = counter()
  assert.deepEqual(current.slice(2), [0])
  assert.deepEqual(current[1].onclick().slice(2), [1])
})
