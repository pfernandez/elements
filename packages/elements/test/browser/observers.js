import { a, body, button, observe, div, elements, form, head, html, input,
         option, output, render, select, span, svg, title,
         toHtmlString } from '../../elements.js'
import { annotationXml, math, mi } from '../../mathml.js'
import { assert, equal, mount, test, traverse } from './harness.js'

test('an editable counter preserves its anonymous input, focus and caret during typing', () => {
  const counter = observe((count = 0) =>
    div(input({ value: String(count), oninput: ({ value }) => counter(Number(value)) }),
        output(count),
        button({ onclick: () => counter(count + 1) }, 'increment')))
  const host = mount(counter())
  const field = host.querySelector('input')
  field.focus()
  field.value = '12'
  field.setSelectionRange(1, 1)
  field.dispatchEvent(new Event('input', { bubbles: true }))

  assert(host.querySelector('input') === field, 'typing must not replace the input')
  assert(document.activeElement === field, 'typing must retain focus')
  equal([field.selectionStart, field.selectionEnd], [1, 1])
  equal(host.querySelector('output').textContent, '12')

  host.querySelector('button').click()
  assert(host.querySelector('input') === field, 'incrementing also patches the same input')
  equal(field.value, '13')
  equal(host.querySelector('output').textContent, '13')
})

test('fresh observer calls reorder through events without remounting their controls', () => {
  const createRow = name => {
    const row = observe((count = 0) =>
      div(input(), button({ onclick: () => row(count + 1) }, `${name}: ${count}`)))
    return row
  }
  const alice = createRow('Alice'), bob = createRow('Bob')
  const list = observe((reversed = false) =>
    div(button({ onclick: () => list(!reversed) }, 'reverse'),
        reversed ? [bob(), alice()] : [alice(), bob()]))
  const host = mount(list())
  const [reverse, aliceNode, bobNode] = host.firstChild.children
  aliceNode.firstChild.value = 'Alice draft'
  bobNode.firstChild.value = 'Bob draft'

  reverse.click()
  assert(host.firstChild.children[1] === bobNode)
  assert(host.firstChild.children[2] === aliceNode)
  equal(aliceNode.firstChild.value, 'Alice draft')
  equal(bobNode.firstChild.value, 'Bob draft')
  bobNode.lastChild.click()
  equal(bobNode.lastChild.textContent, 'Bob: 1')
  equal(aliceNode.lastChild.textContent, 'Alice: 0')
  assert(host.firstChild.children[1] === bobNode, 'moved boundary remains subscribed')
})

test('prebuilt graph-style observations update every projection without changing sources', () => {
  const observer = observe(observation => observation)
  const a = Object.freeze(observer(
    div(input(), button({ onclick: () => b }, 'A'))))
  const b = Object.freeze(observer(
    div(input(), button({ onclick: () => a }, 'B'))))
  const host = mount(div(a, a)), other = mount(a)
  const projections = [...host.firstChild.children, other.firstChild]
  const original = [toHtmlString(a), toHtmlString(b)]
  projections.forEach((node, index) => { node.firstChild.value = `draft ${index}` })

  projections[0].lastChild.click()
  equal(projections.map(node => node.lastChild.textContent), ['B', 'B', 'B'])
  projections[2].lastChild.click()
  equal(projections.map(node => node.lastChild.textContent), ['A', 'A', 'A'])
  projections.forEach((node, index) => {
    assert(node.isConnected)
    equal(node.firstChild.value, `draft ${index}`)
  })
  equal([toHtmlString(a), toHtmlString(b)], original)
})

test('event recursion shares one definition while separate definitions stay independent', () => {
  const fib = observe((a = 0, b = 1) =>
    button({ onclick: () => fib(b, a + b) }, a))
  const source = fib()
  const other = observe(() => button('0'))
  const host = mount(div(source, fib(), other()))
  const buttons = () => [...host.querySelectorAll('button')]
  buttons()[0].click()
  buttons()[1].click()
  buttons()[0].click()
  equal(buttons().map(node => node.textContent), ['2', '2', '0'])
  equal(source[2], 0)
  render(div(source), host)
  host.querySelector('button').click()
  equal(host.textContent, '3')
})

test('parent and child continuations retain current observations and local scope', () => {
  const child = observe((n = 0) => div(
    output(n), button({ onclick: () => child(n + 1) }, 'child')))
  const parent = observe((n = 0, inner = child()) =>
    div(output(n), inner,
        button({ onclick: () => parent(n + 1, inner) }, 'outer'),
        button({ onclick: () => parent(10) }, 'reset')))
  const host = mount(parent())
  host.querySelector('button').click()
  host.querySelectorAll('button')[1].click()
  equal([...host.querySelectorAll('output')].map(node => node.textContent), ['1', '1'])
  host.querySelectorAll('button')[2].click()
  equal([...host.querySelectorAll('output')].map(node => node.textContent), ['10', '0'])
})

test('static observations form a reusable finite cycle', () => {
  const a = Object.freeze(button({ onclick: () => b }, 'A'))
  const b = Object.freeze(button({ onclick: () => a }, 'B'))
  const source = observe(() => a)()
  const host = mount(div(source, source))
  const original = host.firstChild.firstChild
  Array.from({ length: 10 }).forEach((_, index) => {
    host.querySelector('button').click()
    equal(host.textContent, index % 2 ? 'AA' : 'BB')
    assert(host.firstChild.firstChild === original)
  })
})

test('sidebar links update only their named page and restore real browser history', async () => {
  history.replaceState({ application: 'kept' }, '', '/initial')
  const count = observe((n = 0) => button({ onclick: () => count(n + 1) }, n))
  const page = observe(path => div(path, count()))
  const sidebar = observe(() => div(
    a({ href: '/one?tab=2', onclick: () => page('one') }, 'one'),
    a({ href: '/two', onclick: () => page('two') }, 'two')))
  const host = mount(div(sidebar(), page('initial')))
  const shell = host.firstChild, side = shell.firstChild
  host.querySelector('button').click()
  const length = history.length
  side.querySelector('a').click()
  equal(location.pathname + location.search, '/one?tab=2')
  equal(history.length, length + 1)
  equal(history.state.application, 'kept')
  equal(shell.lastChild.textContent, 'one0')
  assert(shell.firstChild === side)
  host.querySelector('button').click()
  side.querySelectorAll('a')[1].click()
  equal(shell.lastChild.textContent, 'two0')
  await traverse(-1)
  equal(location.pathname, '/one')
  equal(shell.lastChild.textContent, 'one1')
  await traverse(-1)
  equal(location.pathname, '/initial')
  equal(shell.lastChild.textContent, 'initial1')
  await traverse(2)
  equal(location.pathname, '/two')
  equal(shell.lastChild.textContent, 'two0')
  equal(history.length, length + 2)
  assert(shell.firstChild === side)
})
