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

