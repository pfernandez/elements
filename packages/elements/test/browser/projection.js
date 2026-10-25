import { transition } from '../transition.js'
import { observe, project, toHtmlString, fragment } from '../../elements.js'
import { a, button, div, html, input, option, select, span } from '../../html.js'
import { svg, circle, rect, text as svgText } from '../../svg.js'
import { annotationXml, math, mi } from '../../mathml.js'
import { assert, equal, mount, test } from './harness.js'

test('standalone SVG text can be inserted, updated and replaced in an SVG host', () => {
  const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  document.body.append(host)
  const label = observe(n => n === 2 ? circle({ r: 2 }) : svgText({ x: n }, `Label ${n}`))
  const node = project(label(0))
  host.append(node)
  equal([node.nodeType, node.localName, node.namespaceURI], [1, 'text', host.namespaceURI])
  project(button({ onclick: () => label(1) })).click()
  assert(host.firstChild === node)
  equal([node.getAttribute('x'), node.textContent], ['1', 'Label 1'])
  project(button({ onclick: () => label(2) })).click()
  equal(host.firstChild.localName, 'circle')
  host.remove()
})

test('SVG and MathML insertions retain their namespace', () => {
  const drawing = mount(svg())
  transition(svg(circle({ r: 4 })), drawing)
  equal(drawing.querySelector('circle').namespaceURI, 'http://www.w3.org/2000/svg')
  transition(svg(rect({ width: 4 })), drawing)
  equal(drawing.querySelector('rect').namespaceURI, 'http://www.w3.org/2000/svg')
  const formula = mount(math())
  transition(math(mi('x')), formula)
  equal(formula.querySelector('mi').namespaceURI, 'http://www.w3.org/1998/Math/MathML')
  const native = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  transition(circle({ r: 2 }), native)
  equal(native.firstChild.namespaceURI, native.namespaceURI)
})

test('select value is applied after options exist', () => {
  const describeState = values => select({ value: 'b' }, values.map(value => option({ value }, value)))
  const host = mount(describeState(['a', 'b']))
  equal(host.firstChild.value, 'b')
  transition(describeState(['c', 'b']), host)
  equal(host.firstChild.value, 'b')
})

test('enumerated attributes retain true and false values', () => {
  const host = mount(div({ spellcheck: false, draggable: true, contenteditable: false }))
  equal([host.firstChild.spellcheck, host.firstChild.draggable, host.firstChild.contentEditable],
        [false, true, 'false'])
})

test('style changes clear keys across string and object forms', () => {
  const host = mount(div({ style: 'color: red' }))
  transition(div({ style: { backgroundColor: 'blue' }}), host)
  equal(host.firstChild.style.color, '')
  transition(div({ style: null }), host)
  equal(host.firstChild.style.cssText, '')
})

test('single-child accessors are read once when retaining or replacing their child', () => {
  const host = mount(div(div(span('initial'))))
  for (const key of [undefined, 'replacement', 'replacement']) {
    let reads = 0
    const child = span({ key }, 'next'), nested = ['div', {}]
    Object.defineProperty(nested, 2, { get: () => { reads++; return child } })
    transition(div(nested), host)
    equal([reads, host.textContent], [1, 'next'])
  }
})

test('raw HTML owns its children in both renderers', () => {
  const vnode = div({ innerHTML: '<b>raw</b>' }, span('ignored'))
  const host = mount(vnode)
  equal(host.innerHTML, toHtmlString(vnode))
  transition(div(span('child')), host)
  equal(host.innerHTML, '<div><span>child</span></div>')
  transition(vnode, host)
  equal(host.innerHTML, '<div><b>raw</b></div>')
})

test('reference reordering preserves controls, focus and native state', () => {
  const left = input(), right = input()
  const host = mount(div(left, right))
  const node = host.firstChild.firstChild
  node.value = 'retained'
  node.focus()
  transition(div(right, left), host)
  assert(host.firstChild.lastChild === node)
  equal(node.value, 'retained')
  // Moving a node can affect focus in the platform; patching unchanged position cannot.
  node.focus()
  transition(div(right, left), host)
  assert(document.activeElement === node)
})

test('a distant keyed swap moves only two rows and keeps middle controls focused', () => {
  const sources = Array.from({ length: 1000 }, (_, key) => div({ key }, input()))
  const host = mount(div(sources)), parent = host.firstChild
  const original = [...parent.children], focused = original[500].firstChild
  focused.value = 'draft'
  focused.focus()
  const insert = parent.insertBefore
  let moves = 0
  parent.insertBefore = function(node, before) {
    if (node.parentNode === this) moves++
    return insert.call(this, node, before)
  }
  const next = sources.slice()
  ;[next[1], next[998]] = [next[998], next[1]]
  transition(div(next), host)
  equal(moves, 2)
  assert(parent.children[1] === original[998] && parent.children[998] === original[1])
  assert(document.activeElement === focused)
  equal(focused.value, 'draft')
  moves = 0
  const rotated = [...next.slice(1), next[0]]
  transition(div(rotated), host)
  equal(moves, 1)
  assert(document.activeElement === focused)
  moves = 0
  transition(div(rotated, div({ key: 1000 }, input())), host)
  transition(div(rotated.slice(1)), host)
  equal(moves, 0)
  assert(document.activeElement === focused)
})

test('range placement handles rotations, insertions, removals and root replacements', () => {
  const groups = Array.from({ length: 5 }, (_, key) =>
    fragment({ key }, span(String(key)), input({ value: String(key) })))
  const host = mount(fragment(div(groups), span('outside')))
  const parent = host.querySelector('div'), controls = [...parent.querySelectorAll('input')]
  const orders = [[4, 0, 1, 2, 3], [3, 2, 1, 0, 4], [1, 3, 0], [4, 2, 0, 1, 3]]
  for (const order of orders) {
    transition(fragment(div(order.map(index => groups[index])), span('outside')), host)
    equal([...parent.querySelectorAll('span')].map(node => node.textContent), order.map(String))
    equal([...parent.querySelectorAll('input')].map(node => node.value), order.map(String))
    assert([...parent.querySelectorAll('input')].find(node => node.value === '0') === controls[0])
    equal(host.lastChild.previousSibling.textContent, 'outside')
  }
  // A matched key may replace a range with one element while other ranges move.
  transition(fragment(div(groups[3], span({ key: 0 }, 'replaced'), groups[1]), span('outside')), host)
  equal(parent.textContent, '3replaced1')
  equal(parent.querySelectorAll('input').length, 2)
})

test('fragments are DOM ranges, including shared observer projections', () => {
  const group = observe((n = 0) => fragment(
    span(n), button({ onclick: () => group(n + 1) }, 'next')))
  const source = group()
  const host = mount(div(source, input(), source))
  host.querySelector('button').click()
  equal([...host.querySelectorAll('span')].map(node => node.textContent), ['1', '1'])
  assert(!host.querySelector('fragment'))
  transition(div(source), host)
  host.querySelector('button').click()
  equal(host.textContent, '2next')
})

test('namespace integration changes recreate affected descendants', () => {
  const source = ['div', {}, 'text']
  const describeState = encoding => math(annotationXml({ encoding }, source))
  const host = mount(describeState('text/html'))
  equal(host.querySelector('div').namespaceURI, 'http://www.w3.org/1999/xhtml')
  transition(describeState('application/xml'), host)
  equal(host.querySelector('div').namespaceURI, 'http://www.w3.org/1998/Math/MathML')
  transition(describeState('text/html'), host)
  equal(host.querySelector('div').namespaceURI, 'http://www.w3.org/1999/xhtml')
})

test('replacing a wrapper safely selects its shared child with a different root tag', () => {
  const child = observe(tag => tag('child'))
  const wrapper = observe(() => child(div))
  const app = observe((direct = false) =>
    div(button({ onclick: () => app(true) }, 'switch'),
        direct ? child(span) : wrapper()))
  const host = mount(app()), other = mount(child(div))
  host.querySelector('button').onclick(new MouseEvent('click'))
  equal(host.firstChild.lastChild.localName, 'span')
  equal(other.firstChild.localName, 'span')
  equal(host.firstChild.children.length, 2)
  transition(child(div), other)
  equal(host.firstChild.lastChild.localName, 'div')
  equal(other.firstChild.localName, 'div')
})

test('namespace replacement retires a shared projection before selecting its new root', () => {
  const child = observe(tag => [tag === span ? 'span' : 'div', {}, 'child'])
  const describeState = (encoding, source) => math(annotationXml({ encoding }, source))
  const host = mount(describeState('text/html', child(div)))
  const other = mount(child(div))
  transition(describeState('application/xml', child(span)), host)
  const node = host.querySelector('annotation-xml').firstChild
  equal(node.localName, 'span')
  equal(node.namespaceURI, 'http://www.w3.org/1998/Math/MathML')
  equal(other.firstChild.namespaceURI, 'http://www.w3.org/1999/xhtml')
  transition(child(div), other)
  equal(host.querySelector('annotation-xml').children.length, 1)
  equal(host.querySelector('annotation-xml').firstChild.localName, 'div')
})
