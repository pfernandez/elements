import assert from 'node:assert/strict'
import { test } from 'node:test'
import { a, div, render } from '../elements.js'
import { createFakeBrowser } from './fake-browser.js'

const withBrowser = async run => {
  const previous = { document: globalThis.document, window: globalThis.window }
  const browser = createFakeBrowser()
  const { window, document, location } = browser
  const history = []
  const pushState = window.history.pushState
  window.history.pushState = (state, title, url) => {
    history.push(url)
    pushState(state, title, url)
  }
  Object.assign(globalThis, { document, window })
  const click = (props, eventProps = {}) => {
    const container = document.createElement('section')
    render(a(props, div('link')), container)
    const anchor = container.firstChild
    const event = {
      type: 'click', target: anchor.firstChild, button: 0, defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true }, ...eventProps
    }
    anchor.onclick?.(event)
    window.dispatchEvent(event)
    return event
  }
  try { await run({ click, history, location }) }
  finally { Object.assign(globalThis, previous) }
}

test('link handlers support relative URLs and nested click targets', () =>
  withBrowser(({ click, history, location }) => {
    assert.equal(click({ href: 'next', onclick: () => div('next page') }).defaultPrevented, true)
    assert.equal(location.pathname, '/nested/next')
    assert.equal(history.length, 1)
  }))

test('link handlers respect native links and event cancellation', () =>
  withBrowser(({ click, history }) => {
    const props = [
      { href: '#section' }, { href: '' }, {},
      { href: 'mailto:test@example.test' }, { href: 'https://other.test/x' },
      { href: 'http://[' }, { href: '/x', download: '' },
      { href: '/x', download: 'file.txt' }, { href: '/x', target: '_blank' },
      { href: '/x', 'data-elements-native': '' }
    ]
    const modifiers = ['ctrlKey', 'metaKey', 'altKey', 'shiftKey']
    props.forEach(value =>
      assert.equal(click({ onclick: () => div('ignored'), ...value }).defaultPrevented, false))
    modifiers.forEach(key =>
      assert.equal(click({ href: '/x', onclick: () => div() }, { [key]: true }).defaultPrevented, false))
    assert.equal(click({ href: '/x', onclick: () => div() }, { button: 2 }).defaultPrevented, false)
    assert.equal(click({ href: '/x', onclick: () => div() }, { cancelable: false }).defaultPrevented, false)
    click({ href: '/x', onclick: () => div() }, { defaultPrevented: true })
    assert.equal(history.length, 0)
  }))

test('a link handler records exactly one history entry', () =>
  withBrowser(({ click, history }) => {
    assert.equal(click({ href: '/x', onclick: () => div('selected') }).defaultPrevented, true)
    assert.equal(history.length, 1)
  }))

test('link construction is pure and links without handlers remain native', () =>
  withBrowser(({ click, history }) => {
    const props = { href: '/x' }
    assert.deepEqual(a(props, 'x'), ['a', props, 'x'])
    assert.equal(click(props).defaultPrevented, false)
    assert.equal(history.length, 0)
  }))
