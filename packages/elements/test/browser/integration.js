
import { toHtmlString } from '../../elements.js'
import { a, body, button, div, form, input, output } from '../../html.js'

import { assert, equal, mount, test, traverse } from './harness.js'

// Document-level integration runs after the focused browser contracts.
const checkX3DOM = async page => {
  const frame = document.createElement('iframe')
  try {
    await new Promise((resolve, reject) => {
      const finish = error => {
        clearTimeout(timeout)
        window.removeEventListener('message', receive)
        error ? reject(error) : resolve()
      }
      const receive = event => {
        if (event.source !== frame.contentWindow || event.origin !== location.origin || !event.data.x3domCheck) return
        finish(event.data.x3domCheck === 'PASS' ? null : new Error(event.data.x3domCheck))
      }
      const timeout = setTimeout(() => finish(new Error('X3DOM integration timed out')), 8000)
      window.addEventListener('message', receive)
      frame.src = `/packages/elements/test/browser/${page}`
      document.body.append(frame)
    })
  } finally { frame.remove() }
}

test('real X3DOM reconnects and initializes later scenes after stylesheet failure', () =>
  checkX3DOM('x3dom-failure.html'))

test('real X3DOM waits for connection and survives head replacement and reconnection', () =>
  checkX3DOM('x3dom.html'))

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
  const previousRoot = document.documentElement
  history.replaceState({}, '', '/scope')
  await import('/examples/index.js')
  assert(document.documentElement !== previousRoot, 'the demo replaces the document root')
  equal(document.documentElement.lang, 'en')
  equal(document.title, 'Elements.js')
  equal(document.body.className, 'container')
  equal(document.head.querySelector('meta[name="viewport"]').content,
        'width=device-width, initial-scale=1.0')
  assert(document.doctype?.name === 'html', 'root replacement preserves the doctype')
  assert(document.head.querySelector('style')?.textContent.includes('grid-template-rows'),
         'the projected head contains the demo stylesheet')
  assert(!document.head.querySelector('style[data-vite-dev-id]'), 'demo CSS needs no Vite injection')
  equal(getComputedStyle(document.body).display, 'grid')
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
