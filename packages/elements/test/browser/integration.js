
import { toHtmlString } from '../../elements.js'
import { a, body, button, div, form, input, output } from '../../html.js'

import { assert, equal, mount, test, traverse } from './harness.js'

// Document-level integration runs after the focused browser contracts.
test('the demo Markdown helper renders independent prose and leaves HTML inert', async () => {
  const { markdown } = await import('/examples/views/markdown.js')
  const text = '## Prose\n\nA **small** example.\n\n- One\n- Two\n\n```js\ndiv("hello")\n```'
  equal(toHtmlString(markdown(text)), toHtmlString(markdown(text)))
  const host = mount(div(markdown(text), markdown('## Another view')))
  equal([...host.querySelectorAll('h2')].map(node => node.textContent), ['Prose', 'Another view'])
  equal(host.querySelector('strong').textContent, 'small')
  equal(host.querySelectorAll('li').length, 2)
  equal(host.querySelector('pre code').textContent.trim(), 'div("hello")')

  const raw = '<script>window.markdownExecuted = true</script>\n\n<strong>Literal HTML</strong>'
  const literal = mount(markdown(raw))
  assert(!literal.querySelector('script, strong'))
  assert(literal.textContent.includes('<strong>Literal HTML</strong>'))
  assert(window.markdownExecuted === undefined)
  const links = mount(markdown('[Read more](https://example.com)'))
  equal(links.querySelector('a').getAttribute('href'), 'https://example.com')
  assert(links.querySelector('a').onclick === null, 'prose links remain native')
})

test('the demo navigates and its counters and todos continue through events', async () => {
  document.body.replaceChildren()
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

  document.querySelector('a[href="/writing"]').click()
  equal(location.pathname, '/writing')
  equal(document.querySelector('.markdown h2').textContent,
        'Fixed Points, Recursive State Observers, and the Transition Graph')
  assert([...document.querySelectorAll('.markdown pre code')].some(node => node.textContent.includes('const view = count')))
  assert(document.querySelector('.markdown').textContent.includes('examples/content/introduction.md'))
  assert(document.querySelector('a[href="/writing"]').classList.contains('active'))
  await traverse(-1)
  equal(location.pathname, '/scope')
  equal(counters(), ['0', '0'])
  await traverse(1)
  equal(document.querySelector('.markdown h2').textContent,
        'Fixed Points, Recursive State Observers, and the Transition Graph')
})

test('the ontick demo carries frame state, waits for readiness and stops on navigation', () => {
  const request = window.requestAnimationFrame
  const cancel = window.cancelAnimationFrame
  const pending = new Map()
  let id = 0
  window.requestAnimationFrame = callback => (pending.set(++id, callback), id)
  window.cancelAnimationFrame = id => pending.delete(id)
  const frame = time => {
    const callbacks = [...pending.values()]
    pending.clear()
    callbacks.forEach(callback => callback(time))
  }

  try {
    document.querySelector('a[href="/x3dom"]').click()
    equal(location.pathname, '/x3dom')
    const [still, animated] = document.querySelectorAll('.cube-demos transform')
    assert(still && animated, 'both cube demos should be present')
    assert(document.querySelector('pre code').textContent.includes('ontick: rotate'))
    frame(1000)
    equal(animated.getAttribute('rotation'), '0 1 0 0.5')

    // Stand in for WebGL readiness; frame timing is controlled, the DOM is real.
    animated.closest('x3d').runtime = {}
    frame(2000)
    equal(animated.getAttribute('rotation'), '0 1 0 0.5')
    frame(2250)
    equal(animated.getAttribute('rotation'), '0 1 0 0.75')
    frame(2500)
    equal(animated.getAttribute('rotation'), '0 1 0 1')
    equal(still.getAttribute('rotation'), '0 1 0 0.5')

    document.querySelector('a[href="/writing"]').click()
    frame(3000)
    assert(!animated.isConnected)
    equal(animated.getAttribute('rotation'), '0 1 0 1')
    equal(pending.size, 0)
  } finally {
    // Also disconnect the demo if an assertion failed before navigating away.
    document.querySelector('a[href="/writing"]').click()
    window.requestAnimationFrame = request
    window.cancelAnimationFrame = cancel
  }
})
