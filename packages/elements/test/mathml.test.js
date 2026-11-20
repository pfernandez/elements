import { afterEach, beforeEach, describe, test } from 'node:test'
import { annotationXml, apply, ci, math, semantics } from '../mathml.js'
import { circle, svg } from '../svg.js'
import assert from 'node:assert/strict'
import { createFakeDom } from './fake-dom.js'
import { transition } from './transition.js'

const mathNS = 'http://www.w3.org/1998/Math/MathML'
const svgNS = 'http://www.w3.org/2000/svg'

describe('MathML helpers + runtime', () => {
  let previousDocument
  beforeEach(() => {
    previousDocument = globalThis.document
    globalThis.document = createFakeDom().document
  })
  afterEach(() => { globalThis.document = previousDocument })

  test('tag helpers return vnodes', () => {
    assert.deepEqual(apply({ id: 'x' }, [ci('f'), ci('y')]), [
      'apply',
      { id: 'x' },
      ['ci', {}, 'f'],
      ['ci', {}, 'y']
    ])
  })

  test('transition() creates MathML elements in the MathML namespace', () => {
    const container = document.createElement('div')
    transition(
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
  })

  test('annotation-xml can switch children to the HTML namespace', () => {
    const container = document.createElement('div')
    transition(
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
    assert.equal(innerDivEl.namespaceURI, 'http://www.w3.org/1999/xhtml')
  })

  test('svg inside math switches to the SVG namespace', () => {
    const container = document.createElement('div')
    transition(
      math(
        svg({ width: 10, height: 10 }, circle({ r: 5 }))
      ),
      container
    )

    const mathEl = container.childNodes[0]
    const svgEl = mathEl.childNodes[0]
    assert.equal(svgEl.tagName.toLowerCase(), 'svg')
    assert.equal(svgEl.namespaceURI, svgNS)
  })
})
