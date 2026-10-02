import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import { button, observe, div, elements, input, li, render, span,
         textarea, ul } from '../elements.js'
import { createFakeDom } from './fake-dom.js'

// Identity belongs to retained references and observer definitions;
// anonymous children and indistinguishable projections belong to positions.
let previousDocument
beforeEach(() => {
  previousDocument = globalThis.document
  globalThis.document = createFakeDom().document
})
afterEach(() => { globalThis.document = previousDocument })

const mount = vnode => {
  const host = document.createElement('section')
  document.body.appendChild(host)
  render(vnode, host)
  return host
}
const row = name => li(span(name), input())

test('retained row references carry their DOM and edited inputs through reordering', () => {
  const alice = row('Alice'), bob = row('Bob')
  const host = mount(ul(alice, bob))
  const list = host.firstChild
  const [aliceNode, bobNode] = list.childNodes
  aliceNode.lastChild.value = 'Alice draft'
  bobNode.lastChild.value = 'Bob draft'

  render(ul(bob, alice), host)
  assert.ok(host.firstChild === list, 'the list stays mounted')
  assert.ok(list.firstChild === bobNode, 'Bob keeps his row node')
  assert.ok(list.lastChild === aliceNode, 'Alice keeps her row node')
  assert.equal(list.firstChild.lastChild.value, 'Bob draft')
  assert.equal(list.lastChild.lastChild.value, 'Alice draft')

  render(ul(bob), host)
  assert.ok(list.firstChild === bobNode, 'removing Alice does not replace Bob')
  assert.equal(bobNode.lastChild.value, 'Bob draft')
  assert.equal(aliceNode.parentNode, null)
})

test('observer definitions carry row DOM through fresh calls and reordering', () => {
  const alice = observe(() => row('Alice'))
  const bob = observe(() => row('Bob'))
  const host = mount(ul(alice(), bob()))
  const list = host.firstChild
  const [aliceNode, bobNode] = list.childNodes
  aliceNode.lastChild.value = 'Alice draft'
  bobNode.lastChild.value = 'Bob draft'

  // Fresh descriptions of the same definitions, with no keys or retained vnode.
  render(ul(bob(), alice()), host)
  assert.ok(list.firstChild === bobNode, 'Bob should move, not be remounted')
  assert.ok(list.lastChild === aliceNode, 'Alice should move, not be remounted')
  assert.equal(list.firstChild.lastChild.value, 'Bob draft')
  assert.equal(list.lastChild.lastChild.value, 'Alice draft')

  render(ul(bob()), host)
  assert.ok(list.firstChild === bobNode, 'removing Alice retains Bob')
  assert.equal(bobNode.lastChild.value, 'Bob draft')
  assert.equal(aliceNode.parentNode, null)
})

test('observer insertion and replacement preserve the other definitions', () => {
  const alice = observe(() => row('Alice'))
  const bob = observe(() => row('Bob'))
  const carol = observe(() => row('Carol'))
  const host = mount(ul(bob()))
  const bobNode = host.firstChild.firstChild
  bobNode.lastChild.value = 'Bob draft'

  render(ul(alice(), bob()), host)
  const aliceNode = host.firstChild.firstChild
  assert.ok(host.firstChild.lastChild === bobNode)
  render(ul(carol(), bob()), host)
  assert.ok(host.firstChild.firstChild !== aliceNode)
  assert.equal(aliceNode.parentNode, null)
  assert.ok(host.firstChild.lastChild === bobNode)
  assert.equal(bobNode.lastChild.value, 'Bob draft')
})

test('retained references distinguish projections of the same observer during reordering', () => {
  const person = observe(() => row('Shared'))
  const left = person(), right = person()
  const host = mount(ul(left, right))
  const [leftNode, rightNode] = host.firstChild.childNodes
  leftNode.lastChild.value = 'left draft'
  rightNode.lastChild.value = 'right draft'

  render(ul(right, left), host)
  assert.ok(host.firstChild.firstChild === rightNode)
  assert.ok(host.firstChild.lastChild === leftNode)
  assert.equal(rightNode.lastChild.value, 'right draft')
  assert.equal(leftNode.lastChild.value, 'left draft')
})

test('fresh repeated projections remain positional rather than borrowing observer identity', () => {
  const shared = observe(() => row('Shared'))
  const other = observe(() => row('Other'))
  const host = mount(ul(shared(), shared(), other()))
  const [first, second, third] = host.firstChild.childNodes
  second.lastChild.value = 'second draft'

  render(ul(other(), shared(), shared()), host)
  assert.ok(host.firstChild.firstChild === third, 'unique identities move')
  assert.ok(host.firstChild.childNodes[1] === second, 'shared identity retains its slot')
  assert.ok(host.firstChild.lastChild !== first, 'no invented correspondence across slots')
  assert.equal(first.parentNode, null)
  assert.equal(second.lastChild.value, 'second draft')
})

test('a newly duplicated identity does not arbitrarily move the previous projection', () => {
  const shared = observe(() => row('Shared'))
  const host = mount(ul(span('before'), shared()))
  const original = host.firstChild.lastChild
  original.lastChild.value = 'retained draft'

  render(ul(shared(), shared()), host)
  assert.ok(host.firstChild.lastChild === original)
  assert.ok(host.firstChild.firstChild !== original)
  assert.equal(original.lastChild.value, 'retained draft')
})

test('explicit keys still distinguish fresh projections and can request replacement', () => {
  const shared = observe(key => li({ key }, input()))
  const host = mount(ul(shared('left'), shared('right')))
  const [left, right] = host.firstChild.childNodes
  render(ul(shared('right'), shared('left')), host)
  assert.ok(host.firstChild.firstChild === right)
  assert.ok(host.firstChild.lastChild === left)

  const single = mount(ul(shared('before')))
  const replaced = single.firstChild.firstChild
  render(ul(shared('after')), single)
  assert.ok(single.firstChild.firstChild !== replaced)
})

test('observer fragment ranges move as a unit through fresh calls', () => {
  const alice = observe(() => elements.fragment(span('Alice'), input()))
  const bob = observe(() => elements.fragment(span('Bob'), input()))
  const host = mount(div(alice(), bob()))
  const nodes = Array.from(host.firstChild.childNodes)
  nodes[2].value = 'Alice draft'
  nodes[6].value = 'Bob draft'

  render(div(bob(), alice()), host)
  assert.deepEqual(Array.from(host.firstChild.childNodes), [...nodes.slice(4), ...nodes.slice(0, 4)])
  assert.equal(nodes[2].value, 'Alice draft')
  assert.equal(nodes[6].value, 'Bob draft')
})

test('retained graph-style continuations select one origin across separate projections', () => {
  // An adapter retains one observer per origin and one vnode per observation.
  // Event callbacks select existing values; they never reconstruct the graph.
  const observer = observe(observation => observation)
  const a = Object.freeze(observer(div(span('A'), input(), button({ onclick: () => b }, 'next'))))
  const b = Object.freeze(observer(div(span('B'), input(), button({ onclick: () => a }, 'next'))))
  const host = mount(div(a, a))
  const [left, right] = host.firstChild.childNodes
  left.childNodes[1].value = 'left draft'
  right.childNodes[1].value = 'right draft'
  const sourceA = [...a], sourceB = [...b]

  left.lastChild.onclick({})
  assert.equal(left.firstChild.textContent, 'B')
  assert.equal(right.firstChild.textContent, 'B')
  render(div(a, a), host)
  assert.equal(left.firstChild.textContent, 'B', 'reprojecting a retained source does not reset it')
  right.lastChild.onclick({})
  assert.equal(left.firstChild.textContent, 'A')
  assert.equal(right.firstChild.textContent, 'A')
  assert.ok(host.firstChild.firstChild === left)
  assert.ok(host.firstChild.lastChild === right)
  assert.equal(left.childNodes[1].value, 'left draft')
  assert.equal(right.childNodes[1].value, 'right draft')
  assert.deepEqual(a, sourceA)
  assert.deepEqual(b, sourceB)
})

test('fresh anonymous rows currently preserve slot state, not inferred person identity', () => {
  const people = names => ul(names.map(row))
  const host = mount(people(['Alice', 'Bob']))
  const list = host.firstChild
  const [firstSlot, secondSlot] = list.childNodes
  firstSlot.lastChild.value = 'Alice draft'
  secondSlot.lastChild.value = 'Bob draft'

  render(people(['Bob']), host)
  assert.ok(list.firstChild === firstSlot, 'the first slot is reused')
  assert.equal(list.firstChild.firstChild.textContent, 'Bob')
  // This is the visible cost of slot identity: changing a label is not moving
  // the person previously associated with it. The renderer cannot know that.
  assert.equal(list.firstChild.lastChild.value, 'Alice draft')
  assert.equal(secondSlot.parentNode, null)
})

test('an incompatible anonymous element replaces only its own slot', () => {
  const host = mount(div(input(), input()))
  const root = host.firstChild
  const [replaced, retained] = root.childNodes
  replaced.value = 'discarded draft'
  retained.value = 'retained draft'

  render(div(textarea(), input()), host)
  assert.ok(host.firstChild === root, 'the parent stays mounted')
  assert.ok(root.firstChild !== replaced, 'a textarea is not the old input')
  assert.equal(root.firstChild.tagName.toLowerCase(), 'textarea')
  assert.equal(root.firstChild.value, '')
  assert.equal(replaced.parentNode, null)
  assert.ok(root.lastChild === retained, 'the compatible second slot is reused')
  assert.equal(retained.value, 'retained draft')
})
