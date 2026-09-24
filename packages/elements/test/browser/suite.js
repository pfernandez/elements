import { a, body, button, component, div, elements, form, head, html, input,
         option, output, render, select, span, svg, title,
         toHtmlString } from '../../elements.js'
import { annotationXml, math, mi } from '../../mathml.js'

const checks = []
const test = (name, run) => checks.push({ name, run })
const assert = (condition, message = 'Assertion failed') => {
  if (!condition) throw new Error(message)
}
const equal = (actual, expected) =>
  assert(JSON.stringify(actual) === JSON.stringify(expected),
         `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
const mount = vnode => {
  const container = document.createElement('section')
  document.body.append(container)
  render(vnode, container)
  return container
}
const traverse = delta => new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error('History traversal timed out')), 2000)
  window.addEventListener('popstate', () => {
    clearTimeout(timeout)
    // Let all history listeners finish before checking the projection.
    queueMicrotask(resolve)
  }, { once: true })
  history.go(delta)
})

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
  const view = values => select({ value: 'b' }, ...values.map(value => option({ value }, value)))
  const host = mount(view(['a', 'b']))
  equal(host.firstChild.value, 'b')
  render(view(['c', 'b']), host)
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

test('an editable counter preserves its anonymous input, focus and caret during typing', () => {
  const counter = component((count = 0) =>
    div(input({ value: String(count), oninput: ({ value }) => counter(Number(value)) }),
        output(count),
        button({ onclick: () => counter(count + 1) }, 'increment')))
  const host = mount(counter())
  const field = host.querySelector('input')
  field.focus()
  field.value = '12'
  field.setSelectionRange(1, 1)
  field.dispatchEvent(new Event('input', { bubbles: true }))

  assert(host.querySelector('input') === field, 'typing must not replace the input')
  assert(document.activeElement === field, 'typing must retain focus')
  equal([field.selectionStart, field.selectionEnd], [1, 1])
  equal(host.querySelector('output').textContent, '12')

  host.querySelector('button').click()
  assert(host.querySelector('input') === field, 'incrementing also patches the same input')
  equal(field.value, '13')
  equal(host.querySelector('output').textContent, '13')
})

test('fresh component calls reorder through events without remounting their controls', () => {
  const createRow = name => {
    const row = component((count = 0) =>
      div(input(), button({ onclick: () => row(count + 1) }, `${name}: ${count}`)))
    return row
  }
  const alice = createRow('Alice'), bob = createRow('Bob')
  const list = component((reversed = false) =>
    div(button({ onclick: () => list(!reversed) }, 'reverse'),
        ...(reversed ? [bob(), alice()] : [alice(), bob()])))
  const host = mount(list())
  const [reverse, aliceNode, bobNode] = host.firstChild.children
  aliceNode.firstChild.value = 'Alice draft'
  bobNode.firstChild.value = 'Bob draft'

  reverse.click()
  assert(host.firstChild.children[1] === bobNode)
  assert(host.firstChild.children[2] === aliceNode)
  equal(aliceNode.firstChild.value, 'Alice draft')
  equal(bobNode.firstChild.value, 'Bob draft')
  bobNode.lastChild.click()
  equal(bobNode.lastChild.textContent, 'Bob: 1')
  equal(aliceNode.lastChild.textContent, 'Alice: 0')
  assert(host.firstChild.children[1] === bobNode, 'moved boundary remains subscribed')
})

test('prebuilt graph-style observations update every projection without changing sources', () => {
  const observer = component(observation => observation)
  const a = Object.freeze(observer(
    div(input(), button({ onclick: () => b }, 'A'))))
  const b = Object.freeze(observer(
    div(input(), button({ onclick: () => a }, 'B'))))
  const host = mount(div(a, a)), other = mount(a)
  const projections = [...host.firstChild.children, other.firstChild]
  const original = [toHtmlString(a), toHtmlString(b)]
  projections.forEach((node, index) => { node.firstChild.value = `draft ${index}` })

  projections[0].lastChild.click()
  equal(projections.map(node => node.lastChild.textContent), ['B', 'B', 'B'])
  projections[2].lastChild.click()
  equal(projections.map(node => node.lastChild.textContent), ['A', 'A', 'A'])
  projections.forEach((node, index) => {
    assert(node.isConnected)
    equal(node.firstChild.value, `draft ${index}`)
  })
  equal([toHtmlString(a), toHtmlString(b)], original)
})

test('form handlers receive native controls while input and change receive targets', () => {
  let controls, submittedEvent, inputTarget, inputEvent, changeTarget, changeEvent
  const host = mount(form({ onsubmit: (value, event) => {
    controls = value
    submittedEvent = event
  } }, input({ name: 'todo', value: 'native value',
               oninput: (target, event) => { inputTarget = target; inputEvent = event },
               onchange: (target, event) => { changeTarget = target; changeEvent = event } })))
  const node = host.firstChild, field = node.elements.namedItem('todo')
  node.dispatchEvent(new Event('submit', { cancelable: true }))
  assert(controls === node.elements)
  assert(controls.todo === field)
  assert(submittedEvent.target === node)
  equal(controls.todo.value, 'native value')
  const editing = new Event('input', { bubbles: true })
  const changing = new Event('change', { bubbles: true })
  field.dispatchEvent(editing)
  field.dispatchEvent(changing)
  assert(inputTarget === field && changeTarget === field)
  assert(inputEvent === editing && changeEvent === changing)
  equal(inputTarget.value, 'native value')
})

test('input targets support terse value and checked destructuring', () => {
  const greeting = component((name = '') =>
    div(input({ value: name, oninput: ({ value }) => greeting(value) }),
        output(`Hello, ${name}!`)))
  const host = mount(greeting())
  const field = host.querySelector('input')
  field.value = 'Paul'
  field.dispatchEvent(new Event('input', { bubbles: true }))
  equal(host.querySelector('output').textContent, 'Hello, Paul!')
  assert(host.querySelector('input') === field)
  const toggle = component((enabled = false) =>
    div(input({ type: 'checkbox', checked: enabled,
                onchange: ({ checked }) => toggle(checked) }),
        output(String(enabled))))
  const checkbox = mount(toggle())
  checkbox.querySelector('input').click()
  equal(checkbox.querySelector('output').textContent, 'true')
  checkbox.querySelector('input').click()
  equal(checkbox.querySelector('output').textContent, 'false')
})

test('passive submit values do not cancel native submission', () => {
  ;[undefined, null, false, '', 0].forEach(value => {
    const host = mount(form({ onsubmit: () => value }))
    const event = new Event('submit', { cancelable: true })
    host.firstChild.dispatchEvent(event)
    equal(event.defaultPrevented, false)
  })
})

test('async submit cancellation is decided before dispatch ends', async () => {
  let resume
  const pending = new Promise(resolve => { resume = resolve })
  const host = mount(form({ onsubmit: async () => { await pending; return div('done') } }))
  const event = new Event('submit', { cancelable: true })
  equal(host.firstChild.dispatchEvent(event), false)
  assert(event.defaultPrevented)
  resume()
  await pending
  await Promise.resolve()
  equal(host.textContent, 'done')
})

test('link updates respect native opt-outs and relative paths', () => {
  const initial = location.href
  try {
    history.replaceState({}, '', '/nested/page')
    const host = mount(a({ href: 'next', onclick: () => div('next page') }, 'next'))
    host.firstChild.click()
    equal(location.pathname, '/nested/next')
    equal(host.textContent, 'next page')
    const native = mount(a({ href: '/native', 'data-elements-native': '' }, 'native'))
    let preventedAtWindow
    window.addEventListener('click', event => {
      preventedAtWindow = event.defaultPrevented
      event.preventDefault()
    }, { once: true })
    native.firstChild.click()
    equal(preventedAtWindow, false)
  } finally {
    history.replaceState({}, '', initial)
  }
})

test('event recursion shares one definition while separate definitions stay independent', () => {
  const fib = component((a = 0, b = 1) =>
    button({ onclick: () => fib(b, a + b) }, a))
  const source = fib()
  const other = component(() => button('0'))
  const host = mount(div(source, fib(), other()))
  const buttons = () => [...host.querySelectorAll('button')]
  buttons()[0].click()
  buttons()[1].click()
  buttons()[0].click()
  equal(buttons().map(node => node.textContent), ['2', '2', '0'])
  equal(source[2], 0)
  render(div(source), host)
  host.querySelector('button').click()
  equal(host.textContent, '3')
})

test('parent and child continuations retain current observations and local scope', () => {
  const child = component((n = 0) => div(
    output(n), button({ onclick: () => child(n + 1) }, 'child')))
  const parent = component((n = 0, inner = child()) =>
    div(output(n), inner,
        button({ onclick: () => parent(n + 1, inner) }, 'outer'),
        button({ onclick: () => parent(10) }, 'reset')))
  const host = mount(parent())
  host.querySelector('button').click()
  host.querySelectorAll('button')[1].click()
  equal([...host.querySelectorAll('output')].map(node => node.textContent), ['1', '1'])
  host.querySelectorAll('button')[2].click()
  equal([...host.querySelectorAll('output')].map(node => node.textContent), ['10', '0'])
})

test('static observations form a reusable finite cycle', () => {
  const a = Object.freeze(button({ onclick: () => b }, 'A'))
  const b = Object.freeze(button({ onclick: () => a }, 'B'))
  const source = component(() => a)()
  const host = mount(div(source, source))
  const original = host.firstChild.firstChild
  Array.from({ length: 10 }).forEach((_, index) => {
    host.querySelector('button').click()
    equal(host.textContent, index % 2 ? 'AA' : 'BB')
    assert(host.firstChild.firstChild === original)
  })
})

test('fragments are DOM ranges, including shared component projections', () => {
  const group = component((n = 0) => elements.fragment(
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
  const view = encoding => math(annotationXml({ encoding }, source))
  const host = mount(view('text/html'))
  equal(host.querySelector('div').namespaceURI, 'http://www.w3.org/1999/xhtml')
  render(view('application/xml'), host)
  equal(host.querySelector('div').namespaceURI, 'http://www.w3.org/1998/Math/MathML')
  render(view('text/html'), host)
  equal(host.querySelector('div').namespaceURI, 'http://www.w3.org/1999/xhtml')
})

test('replacing a wrapper safely selects its shared child with a different root tag', () => {
  const child = component(tag => tag('child'))
  const wrapper = component(() => child(div))
  const app = component((direct = false) =>
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
  const child = component(tag => tag('child'))
  const view = (encoding, source) => math(annotationXml({ encoding }, source))
  const host = mount(view('text/html', child(div)))
  const other = mount(child(div))
  render(view('application/xml', child(span)), host)
  const node = host.querySelector('annotation-xml').firstChild
  equal(node.localName, 'span')
  equal(node.namespaceURI, 'http://www.w3.org/1998/Math/MathML')
  equal(other.firstChild.namespaceURI, 'http://www.w3.org/1999/xhtml')
  render(child(div), other)
  equal(host.querySelector('annotation-xml').children.length, 1)
  equal(host.querySelector('annotation-xml').firstChild.localName, 'div')
})

test('events on an anchor descendant record navigation before replacing themselves', () => {
  const host = mount(a({ href: '/must-not-navigate' },
                       span({ onclick: () => div('done') }, 'click')))
  const event = new MouseEvent('click', { button: 0, bubbles: true, cancelable: true })
  host.querySelector('span').dispatchEvent(event)
  assert(event.defaultPrevented)
  equal(host.textContent, 'done')
  equal(location.pathname, '/must-not-navigate')
})

test('overlapping async continuations complete independently', async () => {
  const waits = []
  const create = () => {
    const view = component((n = 0) =>
      button({ onclick: async () => {
        await new Promise(resolve => waits.push(resolve))
        return view(n + 1)
      } }, n))
    return view
  }
  const host = mount(div(create()(), create()(10)))
  const buttons = [...host.querySelectorAll('button')]
  const first = buttons[0].onclick(new MouseEvent('click'))
  const second = buttons[1].onclick(new MouseEvent('click'))
  waits[1]()
  await second
  equal(host.textContent, '011')
  waits[0]()
  await first
  equal(host.textContent, '111')
})

test('sidebar links update only their named page and restore real browser history', async () => {
  history.replaceState({ application: 'kept' }, '', '/initial')
  const count = component((n = 0) => button({ onclick: () => count(n + 1) }, n))
  const page = component(path => div(path, count()))
  const sidebar = component(() => div(
    a({ href: '/one?tab=2', onclick: () => page('one') }, 'one'),
    a({ href: '/two', onclick: () => page('two') }, 'two')))
  const host = mount(div(sidebar(), page('initial')))
  const shell = host.firstChild, side = shell.firstChild
  host.querySelector('button').click()
  const length = history.length
  side.querySelector('a').click()
  equal(location.pathname + location.search, '/one?tab=2')
  equal(history.length, length + 1)
  equal(history.state.application, 'kept')
  equal(shell.lastChild.textContent, 'one0')
  assert(shell.firstChild === side)
  host.querySelector('button').click()
  side.querySelectorAll('a')[1].click()
  equal(shell.lastChild.textContent, 'two0')
  await traverse(-1)
  equal(location.pathname, '/one')
  equal(shell.lastChild.textContent, 'one1')
  await traverse(-1)
  equal(location.pathname, '/initial')
  equal(shell.lastChild.textContent, 'initial1')
  await traverse(2)
  equal(location.pathname, '/two')
  equal(shell.lastChild.textContent, 'two0')
  equal(history.length, length + 2)
  assert(shell.firstChild === side)
})

test('modified link clicks leave the current component and native default untouched', () => {
  const page = component(n => div(n))
  const host = mount(div(a({ href: '/elsewhere', onclick: () => page(1) }, 'link'), page(0)))
  const initial = location.href
  let prevented
  window.addEventListener('click', event => {
    prevented = event.defaultPrevented
    event.preventDefault() // Avoid actually opening another tab in the test.
  }, { once: true })
  host.querySelector('a').dispatchEvent(new MouseEvent('click', { button: 0, ctrlKey: true, bubbles: true, cancelable: true }))
  equal(prevented, false)
  equal(location.href, initial)
  equal(host.textContent, 'link0')
})

test('a document base target keeps continuation links native', () => {
  const base = document.createElement('base')
  base.target = '_blank'
  document.head.append(base)
  const page = component(n => div(n))
  const host = mount(div(a({ href: '/native', onclick: () => page(1) }, 'link'), page(0)))
  let prevented
  window.addEventListener('click', event => {
    prevented = event.defaultPrevented
    event.preventDefault()
  }, { once: true })
  try {
    host.querySelector('a').click()
    equal(prevented, false)
    equal(host.textContent, 'link0')
  } finally { base.remove() }
})

// Document mounting runs last so it can exercise the actual head/body nodes.
test('document roots update the actual root and support head/body shortcuts', () => {
  const view = name => html({ lang: name }, head(title(name)), body(div(name)))
  render(view('first'))
  render(view('second'))
  equal(document.documentElement.lang, 'second')
  equal(document.head.getAttribute('lang'), null)
  equal(document.title, 'second')
  equal(document.body.textContent, 'second')
  render(head(title('head')))
  equal(document.title, 'head')
  render(body(div('body')))
  equal(document.body.textContent, 'body')
})

test('document adoption rebinds retained handlers without resetting inputs or child origins', () => {
  let next
  const child = component(() => button({ onclick: () => span('local') }, 'child'))
  const source = child()
  const field = input()
  const control = button({ onclick: () => next }, 'next')
  const content = body(field, control, source)
  render(content)
  const fieldNode = document.body.firstChild
  fieldNode.value = 'draft'
  fieldNode.focus()
  fieldNode.setSelectionRange(2, 2)

  render(html(head(title('before')), content))
  assert(document.activeElement === fieldNode)
  equal([fieldNode.selectionStart, fieldNode.selectionEnd], [2, 2])
  next = html(head(title('after')), body(field, control, source))
  document.body.children[1].onclick(new MouseEvent('click'))
  equal(document.title, 'after')
  assert(document.body.firstChild === fieldNode)
  equal(fieldNode.value, 'draft')
  document.body.lastChild.onclick(new MouseEvent('click'))
  equal(document.body.lastChild.textContent, 'local')
  equal(document.title, 'after')

  render(body(field, control, source))
  next = body(field, control, source, span('standalone'))
  document.body.children[1].onclick(new MouseEvent('click'))
  equal(document.body.textContent, 'nextlocalstandalone')
  equal(document.title, 'after')
  assert(document.body.firstChild === fieldNode)
  equal(fieldNode.value, 'draft')
})

test('the demo navigates and its counters and todos continue through events', async () => {
  history.replaceState({}, '', '/scope')
  await import('/examples/index.js')
  const scope = () => document.querySelector('.scope')
  const counters = () => [...scope().querySelectorAll('output')].map(node => node.textContent)
  scope().querySelectorAll('button')[1].click()
  equal(counters(), ['1', '0'])
  scope().querySelectorAll('button')[2].click()
  equal(counters(), ['1', '1'])
  scope().querySelector('button').click()
  equal(counters(), ['0', '0'])
  document.querySelector('a[href="/todos"]').click()
  await Promise.resolve()
  equal(location.pathname, '/todos')
  const todo = document.querySelector('.todos input')
  todo.value = 'event recursion works'
  document.querySelector('.todos form').dispatchEvent(new Event('submit', { cancelable: true }))
  assert(document.querySelector('.todos').textContent.includes('event recursion works'))
  document.querySelector('a[href="/scope"]').click()
  await Promise.resolve()
  equal(counters(), ['0', '0'])
  assert(document.querySelector('h1').textContent === 'Elements.js Demo')
})

const results = await checks.reduce(async (pending, { name, run }) => {
  const results = await pending
  try { await run(); return [...results, { name }] }
  catch (error) { return [...results, { name, error: error.stack || String(error) }] }
}, Promise.resolve([]))

const report = document.createElement('pre')
report.id = 'results'
report.textContent = encodeURIComponent(JSON.stringify(results))
document.body.replaceChildren(report)
