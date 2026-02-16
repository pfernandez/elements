import assert from 'node:assert/strict'
import { test } from 'node:test'

import { div, input, toHtmlString } from '../elements.js'

test('toHtmlString() renders basic elements and escapes text', () => {
  const html = toHtmlString(div({ id: 'x' }, 'a & < b'))
  assert.equal(html, '<div id="x">a &amp; &lt; b</div>')
})

test('toHtmlString() renders void tags without closing', () => {
  const html = toHtmlString(input({ type: 'checkbox' }))
  assert.equal(html, '<input type="checkbox">')
})

test('toHtmlString() matches boolean attribute rules', () => {
  const html =
    toHtmlString(input({
      disabled: true,
      checked: false,
      'aria-hidden': false,
      'data-enabled': true
    }))

  assert.equal(
    html,
    '<input aria-hidden="false" data-enabled="true" disabled>'
  )
})

test('toHtmlString() drops function props', () => {
  const html = toHtmlString(div({ onclick: () => {}, id: 'x' }, 'ok'))
  assert.equal(html, '<div id="x">ok</div>')
})

test('toHtmlString() uses innerHTML verbatim and ignores children', () => {
  const html = toHtmlString(div({ innerHTML: '<span>raw</span>' }, 'ignored'))
  assert.equal(html, '<div><span>raw</span></div>')
})

test('toHtmlString() can emit a doctype', () => {
  const html = toHtmlString(div('x'), { doctype: true })
  assert.equal(html, '<!doctype html><div>x</div>')
})

test('toHtmlString() serializes style objects (kebab-case + CSS vars)', () => {
  const html =
    toHtmlString(div({
      style: { '--x': 1, backgroundColor: 'red' }
    }, 'x'))

  assert.equal(html, '<div style="--x:1;background-color:red">x</div>')
})

test('toHtmlString() does not emit empty style attributes', () => {
  const html = toHtmlString(div({ style: { color: null } }, 'x'))
  assert.equal(html, '<div>x</div>')
})

test('toHtmlString() rejects className (use class)', () => {
  assert.throws(
    () => toHtmlString(div({ className: 'box' }, 'x')),
    /className/
  )
})

test('toHtmlString() rejects className even if class is present', () => {
  assert.throws(
    () => toHtmlString(div({ class: 'a', className: 'b' }, 'x')),
    /className/
  )
})

test('toHtmlString() renders fragment children without a wrapper', () => {
  const html =
    toHtmlString(['fragment', {}, 'a', div('b')])
  assert.equal(html, 'a<div>b</div>')
})
