import { afterEach, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { body, button, observe, div, elements, head, html, input,
         output, render, span, title, toHtmlString } from '../elements.js'
import { createFakeDom } from './fake-dom.js'
import { annotationXml, math } from '../mathml.js'

let previousDocument
beforeEach(() => {
  previousDocument = globalThis.document
  globalThis.document = createFakeDom().document
})
afterEach(() => { globalThis.document = previousDocument })

const mount = vnode => {
  const host = document.createElement('section')
  document.body.appendChild(host)
  render(vnode, host)
  return host
}
const click = node => node.onclick({})
const createCounter = () => {
  const counter = observe((n = 0) =>
    button({ onclick: () => counter(n + 1) }, n))
  return counter
}
let counter
beforeEach(() => { counter = createCounter() })
const deferred = () => {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { promise, resolve }
}

test('separate observer definitions establish independent identities', () => {
  const counter2 = createCounter()
  const first = mount(counter())
  const second = mount(counter2(10))
  assert.equal(first.textContent, '0')
  click(first.firstChild)
  assert.equal(first.textContent, '1')
  assert.equal(second.textContent, '10')
})

test('recursive functions can compute a vnode before mounting', () => {
  const fibonacci = observe((steps, a = 0, b = 1) =>
    steps > 0 ? fibonacci(steps - 1, b, a + b) : div(a))
  assert.equal(mount(fibonacci(6)).textContent, '8')
  assert.equal(mount(fibonacci(3)).textContent, '2')
})

test('one identity fans out to duplicate siblings and multiple containers', () => {
  const source = counter()
  const host = mount(div(source, source))
  const other = mount(source)
  const original = toHtmlString(source)
  Object.freeze(source)
  click(host.firstChild.firstChild)
  assert.equal(host.textContent, '11')
  assert.equal(other.textContent, '1')
  assert.equal(toHtmlString(source), original)
  render(div(source), host)
  click(other.firstChild)
  assert.equal(host.textContent, '2')
  render(div('removed'), host)
  click(other.firstChild)
  assert.equal(host.textContent, 'removed')
  assert.equal(other.textContent, '3')
  assert.equal(mount(source).textContent, '3')
})

test('equal observations from different identities do not couple evolution', () => {
  const observation = button({ onclick: () => span('next') }, 'start')
  const left = mount(observe(() => observation)())
  const right = mount(observe(() => observation)())
  click(left.firstChild)
  assert.equal(left.textContent, 'next')
  assert.equal(right.textContent, 'start')
  assert.equal(observation[0], 'button')
})

test('a child can return a parent continuation without replacing itself', () => {
  const child = observe(next => button({ onclick: next }, 'advance'))
  const parent = observe((n = 0) =>
    div(output(n), child(() => parent(n + 1))))
  const host = mount(parent())
  const root = host.firstChild
  const heading = root.firstChild
  click(root.childNodes[1])
  assert.equal(host.firstChild, root)
  assert.equal(root.firstChild, heading)
  assert.equal(heading.textContent, '1')
  assert.equal(root.childNodes[1].textContent, 'advance')
  click(root.childNodes[1])
  assert.equal(heading.textContent, '2')
})

test('parent rerenders preserve referenced children and can explicitly reset them', () => {
  const child = counter()
  const parent = observe((n = 0, selected = child) =>
    div(output(n), selected,
        button({ onclick: () => parent(n + 1, selected) }, 'parent'),
        button({ onclick: () => parent(n, counter()) }, 'reset')))
  const host = mount(parent())
  const root = host.firstChild
  click(root.childNodes[1])
  click(root.childNodes[2])
  assert.equal(root.textContent, '11parentreset')
  click(root.childNodes[1])
  assert.equal(root.textContent, '12parentreset')
  click(root.childNodes[3])
  assert.equal(root.textContent, '10parentreset')
  click(root.childNodes[1])
  assert.equal(root.textContent, '11parentreset')
})

test('plain nested updates diff against current observations after replacement', () => {
  const child = observe(() =>
    button({ onclick: () => span('local') }, 'initial'))
  const value = child()
  const host = mount(div(value, 'before'))
  click(host.firstChild.firstChild)
  render(div(value, 'after'), host)
  assert.equal(host.textContent, 'localafter')
  render(div(child(), 'reset'), host)
  assert.equal(host.textContent, 'initialreset')
})

test('finite preauthored observations cycle without rewriting source values', () => {
  const a = Object.freeze(button({ onclick: () => b }, 'A'))
  const b = Object.freeze(button({ onclick: () => a }, 'B'))
  const identity = observe(() => a)()
  const host = mount(identity), other = mount(identity)
  Array.from({ length: 12 }, (_, index) => {
    click(host.firstChild)
    assert.equal(host.textContent, index % 2 ? 'A' : 'B')
    assert.equal(other.textContent, host.textContent)
  })
  assert.equal(a[2], 'A')
  assert.equal(b[2], 'B')
})

test('out-of-band observer calls only construct values; render applies them explicitly', async () => {
  const wait = deferred()
  const describeState = observe((n = 0) => div(n))
  const later = async () => { await wait.promise; return describeState(8) }
  const source = describeState()
  const host = mount(source), other = mount(source)
  const pending = later()
  wait.resolve()
  const next = await pending
  assert.equal(host.textContent, '0')
  assert.equal(other.textContent, '0')
  render(next, host)
  assert.equal(host.textContent, '8')
  assert.equal(other.textContent, '8')
})

test('overlapping asynchronous events retain their independent event identities', async () => {
  const first = deferred(), second = deferred()
  const create = wait => {
    const describeState = observe((n = 0) =>
      button({ onclick: async () => { await wait.promise; return describeState(n + 1) } }, n))
    return describeState
  }
  const a = mount(create(first)()), b = mount(create(second)(10))
  const pa = click(a.firstChild), pb = click(b.firstChild)
  second.resolve()
  await pb
  assert.equal(b.textContent, '11')
  assert.equal(a.textContent, '0')
  first.resolve()
  await pa
  assert.equal(a.textContent, '1')
  await click(b.firstChild)
  assert.equal(b.textContent, '12')
})

test('constructing a future observer value does not update before the event returns it', async () => {
  const wait = deferred()
  const describeState = observe((n = 0) => button({ onclick: async () => {
    const next = describeState(n + 1)
    await wait.promise
    return next
  } }, n))
  const source = describeState()
  const host = mount(source), shared = mount(source)
  const pending = click(host.firstChild)
  assert.equal(host.textContent, '0')
  assert.equal(shared.textContent, '0')
  render(div('removed'), host)
  wait.resolve()
  await pending
  assert.equal(host.textContent, 'removed')
  assert.equal(shared.textContent, '1')
})

test('an observer value discarded by an event does not update its identity', () => {
  const describeState = observe((n = 0) => button({ onclick: () => { describeState(n + 1) } }, n))
  const host = mount(describeState())
  click(host.firstChild)
  assert.equal(host.textContent, '0')
})

test('pending plain results target their captured identity, even after removal', async () => {
  const wait = deferred()
  const source = observe(() =>
    button({ onclick: () => wait.promise }, 'pending'))()
  const left = mount(source), right = mount(source)
  const pending = click(left.firstChild)
  render(div('removed'), left)
  wait.resolve(span('resolved'))
  await pending
  assert.equal(left.textContent, 'removed')
  assert.equal(right.textContent, 'resolved')
})

test('observer and event failures propagate and do not poison later updates', async () => {
  assert.throws(() => observe(() => null)(), /vnode array/)
  assert.throws(() => observe(() => () => div())(), /vnode array/)
  const describeState = observe((n = 0) => {
    if (n < 0) throw new Error('invalid state')
    return div(output(n),
      button({ onclick: () => describeState(-1) }, 'throw'),
      button({ onclick: async () => { throw new Error('rejected') } }, 'reject'),
      button({ onclick: () => describeState(n + 1) }, 'next'))
  })
  const host = mount(describeState())
  assert.throws(() => click(host.firstChild.childNodes[1]), /invalid state/)
  await assert.rejects(click(host.firstChild.childNodes[2]), /rejected/)
  click(host.firstChild.childNodes[3])
  assert.equal(host.firstChild.firstChild.textContent, '1')
})

test('fragment ranges reconcile, move, replace, and detach together', () => {
  const { fragment } = elements
  const pair = fragment(span('a'), span('b'))
  const host = mount(div(pair, span('c')))
  const first = host.firstChild.childNodes[1]
  render(div(span('c'), pair), host)
  assert.equal(host.textContent, 'cab')
  assert.equal(host.firstChild.childNodes[2], first)
  render(div(fragment(span('d')), span('e')), host)
  assert.equal(host.textContent, 'de')
  render(div(), host)
  assert.equal(host.firstChild.childNodes.length, 0)
  render(fragment('root', fragment('nested')), host)
  assert.equal(host.textContent, 'rootnested')
  render(span('replacement'), host)
  assert.equal(host.childNodes.length, 1)
})

test('observers can project fragment ranges and empty values', () => {
  const describeState = observe((n = 0) =>
    elements.fragment(output(n), button({ onclick: () => describeState(n + 1) }, 'next')))
  const host = mount(describeState())
  click(host.childNodes[2])
  assert.equal(host.textContent, '1next')
  render(elements.fragment(), host)
  assert.equal(host.textContent, '')
  render(div(null, false, [], 0), host)
  assert.equal(host.textContent, '0')
})

test('document shortcuts stay coherent with subsequent whole-document updates', () => {
  const page = text => html(head(title(text)), body(div(text)))
  render(page('first'))
  render(head(title('standalone')))
  render(body(div('shortcut')))
  render(page('last'))
  assert.equal(document.head.textContent, 'last')
  assert.equal(document.body.textContent, 'last')
})

test('document elements are not implicit local event boundaries', () => {
  const page = text => html(head(title(text)), body(
    button({ onclick: () => page('next') }, text)))
  render(page('first'))
  click(document.body.firstChild)
  assert.equal(document.head.textContent, 'next')
  assert.equal(document.body.textContent, 'next')
})

test('unchanged input props retain native editing across parent updates', () => {
  const host = mount(div(input({ value: 'initial' }), 'first'))
  host.firstChild.firstChild.value = 'edited'
  render(div(input({ value: 'initial' }), 'next'), host)
  assert.equal(host.firstChild.firstChild.value, 'edited')
})

test('preconstructed continuations cycle across every projection of their definition', () => {
  const describeState = observe(n => button({ onclick: () => n ? zero : one }, n))
  const zero = Object.freeze(describeState(0)), one = Object.freeze(describeState(1))
  const host = mount(zero), shared = mount(zero)
  click(host.firstChild)
  assert.equal(host.textContent, '1')
  assert.equal(shared.textContent, '1')
  click(shared.firstChild)
  assert.equal(host.textContent, '0')
  assert.equal(shared.textContent, '0')
  assert.equal(zero[2], 0)
  assert.equal(one[2], 1)
})

test('fresh calls of one definition share identity but remain inert until selected', () => {
  const first = mount(counter())
  const next = counter(10)
  assert.equal(first.textContent, '0')
  const second = mount(next)
  assert.equal(first.textContent, '10')
  assert.equal(second.textContent, '10')
  click(first.firstChild)
  assert.equal(first.textContent, '11')
  assert.equal(second.textContent, '11')
})

test('a sidebar selects a precomputed sibling continuation, leaving itself alone', () => {
  const reset = counter(0)
  const sidebar = observe(() => button({ onclick: () => reset }, 'reset'))
  const host = mount(div(sidebar(), counter(10), counter(10)))
  const side = host.firstChild.firstChild
  click(host.firstChild.childNodes[1])
  assert.equal(host.textContent, 'reset1111')
  click(side)
  assert.equal(host.textContent, 'reset00')
  assert.equal(host.firstChild.firstChild, side)
})

test('an original observer snapshot can be selected again without nesting itself', () => {
  const second = button({ onclick: () => original }, 'B')
  const original = observe(() => button({ onclick: () => second }, 'A'))()
  const host = mount(original)
  Array.from({ length: 8 }, (_, index) => {
    click(host.firstChild)
    assert.equal(host.textContent, index % 2 ? 'A' : 'B')
  })
})

test('document adoption can switch between plain and observer-authored pages', () => {
  render(html(head(title('plain')), body('plain')))
  const page = observe((n = 0) =>
    html(head(title(String(n))), body(button({ onclick: () => page(n + 1) }, n))))
  render(page())
  click(document.body.firstChild)
  assert.equal(document.head.textContent, '1')
  assert.equal(document.body.textContent, '1')
  render(html(head(title('plain again')), body('plain again')))
  assert.equal(document.head.textContent, 'plain again')
  assert.equal(document.body.textContent, 'plain again')
})

test('replacing a wrapper with its child can select a new root tag safely', () => {
  const child = observe(tag => tag('child'))
  const wrapper = observe(() => child(div))
  const app = observe((direct = false) =>
    div(button({ onclick: () => app(true) }, 'switch'),
        direct ? child(span) : wrapper()))
  const host = mount(app())
  const other = mount(child(div))
  click(host.firstChild.firstChild)
  assert.equal(host.firstChild.lastChild.tagName, 'SPAN')
  assert.equal(other.firstChild.tagName, 'SPAN')
  assert.equal(host.firstChild.childNodes.length, 2)
  render(child(div), other)
  assert.equal(host.firstChild.lastChild.tagName, 'DIV')
  assert.equal(other.firstChild.tagName, 'DIV')
})

test('namespace replacement can select a new observer root without retaining old subscriptions', () => {
  const child = observe(tag => tag('child'))
  const describeState = (encoding, value) => math(annotationXml({ encoding }, value))
  const host = mount(describeState('text/html', child(div)))
  const other = mount(child(div))
  render(describeState('application/xml', child(span)), host)
  const parent = host.firstChild.firstChild
  assert.equal(parent.firstChild.tagName, 'SPAN')
  assert.equal(parent.firstChild.namespaceURI, 'http://www.w3.org/1998/Math/MathML')
  assert.equal(other.firstChild.tagName, 'SPAN')
  render(child(div), other)
  assert.equal(parent.childNodes.length, 1)
  assert.equal(parent.firstChild.tagName, 'DIV')
  assert.equal(other.firstChild.tagName, 'DIV')
})

test('document adoption updates event ownership even for retained markup and handlers', () => {
  // Reusing the same source must rebind events without rewriting native state.
  let next
  const action = () => next
  const field = input()
  const control = button({ onclick: action }, 'next')
  const content = body(field, control)
  render(content)
  const fieldNode = document.body.firstChild
  fieldNode.value = 'draft'
  render(html(head(title('before')), content))
  next = html(head(title('after')), body(field, control))
  click(document.body.lastChild)
  assert.equal(document.head.textContent, 'after')
  assert.equal(document.body.firstChild, fieldNode)
  assert.equal(fieldNode.value, 'draft')

  render(body(field, control))
  next = body(field, control, span('standalone'))
  click(document.body.childNodes[1])
  assert.equal(document.body.textContent, 'nextstandalone')
  assert.equal(document.head.textContent, 'after')
  assert.equal(document.body.firstChild, fieldNode)
  assert.equal(fieldNode.value, 'draft')
})

test('document ownership changes leave nested observer events local', () => {
  const child = observe(() => button({ onclick: () => span('local') }, 'child'))
  const source = child()
  render(body(source))
  render(html(head(title('page')), body(source)))
  click(document.body.firstChild)
  assert.equal(document.body.textContent, 'local')
  assert.equal(document.head.textContent, 'page')
})

test('pending plain results retain the owner captured before document adoption', async () => {
  const wait = deferred()
  const content = body(button({ onclick: () => wait.promise }, 'pending'))
  render(content)
  const pending = click(document.body.firstChild)
  render(html(head(title('page')), content))
  wait.resolve(body('resolved'))
  await pending
  assert.equal(document.body.textContent, 'resolved')
  assert.equal(document.head.textContent, 'page')
})
