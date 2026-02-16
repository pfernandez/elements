import { apply, ci, math, semantics, annotationXml } from '../mathml.js'
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { render, svg, circle } from '../elements.js'
import { createFakeDom } from './fake-dom.js'

const mathNS = 'http://www.w3.org/1998/Math/MathML'
const svgNS = 'http://www.w3.org/2000/svg'

describe('MathML helpers + runtime', () => {
  test('tag helpers return vnodes', () => {
    assert.deepEqual(apply({ id: 'x' }, ci('f'), ci('y')), [
      'apply',
      { id: 'x' },
      ['ci', {}, 'f'],
      ['ci', {}, 'y']
    ])
  })

  test('render() creates MathML elements in the MathML namespace', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = { requestAnimationFrame: () => 0, cancelAnimationFrame: () => {} }

    const container = document.createElement('div')
    render(
      math(
        apply(ci('f'), ci('x'))
      ),
      container
    )

    const el = container.childNodes[0]
    assert.equal(el.tagName.toLowerCase(), 'math')
    assert.equal(el.namespaceURI, mathNS)

    const applyEl = el.childNodes[0]
    assert.equal(applyEl.tagName.toLowerCase(), 'apply')
    assert.equal(applyEl.namespaceURI, mathNS)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('annotation-xml can switch children to the HTML namespace', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = { requestAnimationFrame: () => 0, cancelAnimationFrame: () => {} }

    const container = document.createElement('div')
    render(
      math(
        semantics(
          ci('x'),
          annotationXml(
            { encoding: 'application/xhtml+xml' },
            ['div', { id: 'inside' }, 'ok']
          )
        )
      ),
      container
    )

    const mathEl = container.childNodes[0]
    const semanticsEl = mathEl.childNodes[0]
    const annotationXmlEl = semanticsEl.childNodes[1]
    const innerDivEl = annotationXmlEl.childNodes[0]

    assert.equal(annotationXmlEl.tagName.toLowerCase(), 'annotation-xml')
    assert.equal(annotationXmlEl.namespaceURI, mathNS)
    assert.equal(innerDivEl.tagName.toLowerCase(), 'div')
    assert.equal(innerDivEl.namespaceURI, null)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })

  test('svg inside math switches to the SVG namespace', () => {
    const prevDocument = globalThis.document
    const prevWindow = globalThis.window

    const { document } = createFakeDom()
    globalThis.document = document
    globalThis.window = { requestAnimationFrame: () => 0, cancelAnimationFrame: () => {} }

    const container = document.createElement('div')
    render(
      math(
        svg({ width: 10, height: 10 }, circle({ r: 5 }))
      ),
      container
    )

    const mathEl = container.childNodes[0]
    const svgEl = mathEl.childNodes[0]
    assert.equal(svgEl.tagName.toLowerCase(), 'svg')
    assert.equal(svgEl.namespaceURI, svgNS)

    globalThis.document = prevDocument
    globalThis.window = prevWindow
  })
})
