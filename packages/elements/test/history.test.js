import assert from 'node:assert/strict'
import { test } from 'node:test'
import { a, button, observe, div, render } from '../elements.js'
import { click, withBrowser } from './fake-browser.js'

const mount = vnode => {
  const host = document.createElement('section')
  document.body.appendChild(host)
  render(vnode, host)
  return host
}

test('sidebar links target page projections without registration or rerendering the shell', () =>
  withBrowser(({ history, location }) => {
    const page = observe(path => div(path))
    const sidebar = observe(() => a({ href: '/about', onclick: () => page('about') }, 'About'))
    const host = mount(div(sidebar(), page('home'), page('home')))
    const root = host.firstChild, link = root.firstChild
    const event = click(link).event
    assert.equal(event.defaultPrevented, true)
    assert.equal(location.pathname, '/about')
    assert.equal(host.textContent, 'Aboutaboutabout')
    assert.equal(host.firstChild, root)
    assert.equal(root.firstChild, link)
    assert.equal(history.length, 2)
    history.back()
    assert.equal(location.pathname, '/nested/page')
    assert.equal(host.textContent, 'Abouthomehome')
    history.forward()
    assert.equal(host.textContent, 'Aboutaboutabout')
    assert.equal(history.length, 2)
  }))

test('history retains local state on departure and restores nested observations', () =>
  withBrowser(({ history }) => {
    const counter = observe((n = 0) => button({ onclick: () => counter(n + 1) }, n))
    const page = observe(path => path === 'home' ? div('home', counter()) : div('about'))
    const host = mount(div(
      a({ href: '/about', onclick: () => page('about') }, 'About'), page('home')))
    click(host.firstChild.childNodes[1].childNodes[1])
    click(host.firstChild.firstChild)
    assert.equal(host.textContent, 'Aboutabout')
    history.back()
    assert.equal(host.textContent, 'Abouthome1')
    click(host.firstChild.childNodes[1].childNodes[1])
    history.forward()
    assert.equal(host.textContent, 'Aboutabout')
    history.back()
    assert.equal(host.textContent, 'Abouthome2')
  }))

test('successive links to different component identities restore a coherent observation', () =>
  withBrowser(({ history }) => {
    const left = observe(n => div(n)), right = observe(n => div(n))
    const host = mount(div(
      a({ href: '/left', onclick: () => left(1) }, 'L'),
      a({ href: '/right', onclick: () => right(2) }, 'R'), left(0), right(0)))
    click(host.firstChild.firstChild)
    click(host.firstChild.childNodes[1])
    assert.equal(host.textContent, 'LR12')
    history.go(-2)
    assert.equal(host.textContent, 'LR00')
    history.go(2)
    assert.equal(host.textContent, 'LR12')
  }))

test('same-URL selection avoids duplicate entries and a new branch drops forward history', () =>
  withBrowser(({ history, location }) => {
    const page = observe(n => div(n))
    const host = mount(div(
      a({ href: '/one', onclick: () => page(1) }, 'one'),
      a({ href: '/two', onclick: () => page(2) }, 'two'), page(0)))
    history.replaceState({ application: 'retained' }, '', location.href)
    click(host.firstChild.firstChild)
    click(host.firstChild.firstChild)
    assert.equal(history.length, 2)
    assert.equal(history.state.application, 'retained')
    click(host.firstChild.childNodes[1])
    history.go(-2)
    click(host.firstChild.childNodes[1])
    assert.equal(history.length, 2)
    history.forward()
    assert.equal(host.textContent, 'onetwo2')
    history.back()
    assert.equal(host.textContent, 'onetwo0')
  }))

test('async links cancel immediately but select URL and observation only on a vnode result', () =>
  withBrowser(async ({ history, location }) => {
    let resolve
    const pending = new Promise(done => { resolve = done })
    const page = observe(n => div(n))
    const host = mount(div(a({ href: '/later', onclick: () => pending }, 'later'), page(0)))
    const { event, result } = click(host.firstChild.firstChild)
    assert.equal(event.defaultPrevented, true)
    assert.equal(history.length, 1)
    assert.equal(location.pathname, '/nested/page')
    const next = page(1)
    assert.equal(host.textContent, 'later0')
    resolve(next)
    await result
    assert.equal(location.pathname, '/later')
    assert.equal(host.textContent, 'later1')
    history.back()
    assert.equal(host.textContent, 'later0')
    const passive = mount(a({ href: '/passive', onclick: async () => undefined }, 'passive'))
    await click(passive.firstChild).result
    assert.equal(location.pathname, '/nested/page')
    assert.equal(history.length, 2)
    const broken = mount(a({ href: '/broken', onclick: async () => { throw new Error('broken') } }, 'broken'))
    await assert.rejects(click(broken.firstChild).result, /broken/)
    assert.equal(location.pathname, '/nested/page')
  }))

test('native link gestures neither select continuations nor claim history', () =>
  withBrowser(({ history }) => {
    const page = observe(n => div(n))
    const host = mount(page(0))
    const check = (props, event = {}) => {
      const link = mount(a({ href: '/next', onclick: () => page(1), ...props }, 'next'))
      assert.equal(click(link.firstChild, event).event.defaultPrevented,
                   event.defaultPrevented || false)
      assert.equal(host.textContent, '0')
    }
    ;['metaKey', 'ctrlKey', 'shiftKey', 'altKey'].forEach(key => check({}, { [key]: true }))
    check({}, { button: 1 })
    check({}, { defaultPrevented: true, preventDefault() {} })
    assert.equal(history.length, 1)
  }))

test('native destinations, passive links and opt-outs do not record observations', () =>
  withBrowser(({ history }) => {
    const page = observe(n => div(n))
    const host = mount(page(0))
    let calls = 0
    ;[{ target: '_blank' }, { download: '' }, { 'data-elements-native': '' },
      { href: 'https://elsewhere.test/' }, { href: 'mailto:a@example.test' },
      { href: '#section' }, { href: 'http://[' }].forEach(props => {
      const link = mount(a({ href: '/next', onclick: () => { calls++; return page(1) }, ...props }, 'next'))
      assert.equal(click(link.firstChild).event.defaultPrevented, false)
    })
    const passive = mount(a({ href: '/next', onclick: () => false }, 'next'))
    assert.equal(click(passive.firstChild).event.defaultPrevented, false)
    assert.equal(host.textContent, '0')
    assert.equal(history.length, 1)
    assert.equal(calls, 7)
  }))

test('unavailable history observations fall back to the URL; hash-only traversal stays native', () =>
  withBrowser(({ history, location, reloads }) => {
    history.replaceState({ __elements_history: { session: 'previous-document', id: 1 } }, '', '/old')
    history.pushState({}, '', '/new')
    mount(div('new'))
    history.back()
    assert.deepEqual(reloads, ['https://example.test/old'])
    history.replaceState({}, '', location.href)
    history.pushState({}, '', '#section')
    history.back()
    assert.equal(reloads.length, 1)
  }))
