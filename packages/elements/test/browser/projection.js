import { transition } from '../transition.js'
import { observe, toHtmlString, fragment } from '../../elements.js'
import { a, button, div, html, input, option, select, span } from '../../html.js'
import { svg, circle, rect } from '../../svg.js'
import { annotationXml, math, mi } from '../../mathml.js'
import { assert, equal, mount, test } from './harness.js'

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
