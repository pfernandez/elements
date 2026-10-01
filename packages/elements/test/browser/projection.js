import { a, body, button, observe, div, elements, form, head, html, input,
         option, output, render, select, span, svg, title,
         toHtmlString } from '../../elements.js'
import { annotationXml, math, mi } from '../../mathml.js'
import { assert, equal, mount, test, traverse } from './harness.js'

test('SVG and MathML insertions retain their namespace', () => {
  const drawing = mount(svg())
  render(svg(elements.circle({ r: 4 })), drawing)
  equal(drawing.querySelector('circle').namespaceURI, 'http://www.w3.org/2000/svg')
  render(svg(elements.rect({ width: 4 })), drawing)
  equal(drawing.querySelector('rect').namespaceURI, 'http://www.w3.org/2000/svg')
  const formula = mount(math())
  render(math(mi('x')), formula)
  equal(formula.querySelector('mi').namespaceURI, 'http://www.w3.org/1998/Math/MathML')
  const native = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  render(elements.circle({ r: 2 }), native)
  equal(native.firstChild.namespaceURI, native.namespaceURI)
})

test('select value is applied after options exist', () => {
  const describeState = values => select({ value: 'b' }, values.map(value => option({ value }, value)))
  const host = mount(describeState(['a', 'b']))
  equal(host.firstChild.value, 'b')
  render(describeState(['c', 'b']), host)
  equal(host.firstChild.value, 'b')
})

test('enumerated attributes retain true and false values', () => {
  const host = mount(div({ spellcheck: false, draggable: true, contenteditable: false }))
  equal([host.firstChild.spellcheck, host.firstChild.draggable, host.firstChild.contentEditable],
        [false, true, 'false'])
})

test('style changes clear keys across string and object forms', () => {
  const host = mount(div({ style: 'color: red' }))
  render(div({ style: { backgroundColor: 'blue' }}), host)
  equal(host.firstChild.style.color, '')
  render(div({ style: null }), host)
  equal(host.firstChild.style.cssText, '')
})

test('raw HTML owns its children in both renderers', () => {
  const vnode = div({ innerHTML: '<b>raw</b>' }, span('ignored'))
  const host = mount(vnode)
  equal(host.innerHTML, toHtmlString(vnode))
  render(div(span('child')), host)
  equal(host.innerHTML, '<div><span>child</span></div>')
  render(vnode, host)
  equal(host.innerHTML, '<div><b>raw</b></div>')
})

test('reference reordering preserves controls, focus and native state', () => {
  const left = input(), right = input()
  const host = mount(div(left, right))
  const node = host.firstChild.firstChild
  node.value = 'retained'
  node.focus()
  render(div(right, left), host)
  assert(host.firstChild.lastChild === node)
  equal(node.value, 'retained')
  // Moving a node can affect focus in the platform; patching unchanged position cannot.
  node.focus()
  render(div(right, left), host)
  assert(document.activeElement === node)
})

test('fragments are DOM ranges, including shared observer projections', () => {
  const group = observe((n = 0) => elements.fragment(
    span(n), button({ onclick: () => group(n + 1) }, 'next')))
  const source = group()
  const host = mount(div(source, input(), source))
  host.querySelector('button').click()
  equal([...host.querySelectorAll('span')].map(node => node.textContent), ['1', '1'])
  assert(!host.querySelector('fragment'))
  render(div(source), host)
  host.querySelector('button').click()
  equal(host.textContent, '2next')
})

test('namespace integration changes recreate affected descendants', () => {
  const source = div('text')
  const describeState = encoding => math(annotationXml({ encoding }, source))
  const host = mount(describeState('text/html'))
  equal(host.querySelector('div').namespaceURI, 'http://www.w3.org/1999/xhtml')
  render(describeState('application/xml'), host)
  equal(host.querySelector('div').namespaceURI, 'http://www.w3.org/1998/Math/MathML')
  render(describeState('text/html'), host)
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
  render(child(div), other)
  equal(host.firstChild.lastChild.localName, 'div')
  equal(other.firstChild.localName, 'div')
})

test('namespace replacement retires a shared projection before selecting its new root', () => {
  const child = observe(tag => tag('child'))
  const describeState = (encoding, source) => math(annotationXml({ encoding }, source))
  const host = mount(describeState('text/html', child(div)))
  const other = mount(child(div))
  render(describeState('application/xml', child(span)), host)
  const node = host.querySelector('annotation-xml').firstChild
  equal(node.localName, 'span')
  equal(node.namespaceURI, 'http://www.w3.org/1998/Math/MathML')
  equal(other.firstChild.namespaceURI, 'http://www.w3.org/1999/xhtml')
  render(child(div), other)
  equal(host.querySelector('annotation-xml').children.length, 1)
  equal(host.querySelector('annotation-xml').firstChild.localName, 'div')
})
