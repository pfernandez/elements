import { a, body, button, observe, div, elements, form, head, html, input,
         option, output, render, select, span, svg, title,
         toHtmlString } from '../../elements.js'
import { annotationXml, math, mi } from '../../mathml.js'
import { assert, equal, mount, test, traverse } from './harness.js'

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
  const greeting = observe((name = '') =>
    div(input({ value: name, oninput: ({ value }) => greeting(value) }),
        output(`Hello, ${name}!`)))
  const host = mount(greeting())
  const field = host.querySelector('input')
  field.value = 'Paul'
  field.dispatchEvent(new Event('input', { bubbles: true }))
  equal(host.querySelector('output').textContent, 'Hello, Paul!')
  assert(host.querySelector('input') === field)
  const toggle = observe((enabled = false) =>
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
    const describeState = observe((n = 0) =>
      button({ onclick: async () => {
        await new Promise(resolve => waits.push(resolve))
        return describeState(n + 1)
      } }, n))
    return describeState
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

test('modified link clicks leave the current observer and native default untouched', () => {
  const page = observe(n => div(n))
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
  const page = observe(n => div(n))
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
