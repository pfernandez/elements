import { a, body, button, observe, div, elements, form, head, html, input,
         option, output, render, select, span, svg, title,
         toHtmlString } from '../../elements.js'
import { annotationXml, math, mi } from '../../mathml.js'
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


test('document roots update the actual root and support head/body shortcuts', () => {
  const describeState = name => html({ lang: name }, head(title(name)), body(div(name)))
  render(describeState('first'))
  render(describeState('second'))
  equal(document.documentElement.lang, 'second')
  equal(document.head.getAttribute('lang'), null)
  equal(document.title, 'second')
  equal(document.body.textContent, 'second')
  render(head(title('head')))
  equal(document.title, 'head')
  render(body(div('body')))
  equal(document.body.textContent, 'body')
})

test('document adoption rebinds retained handlers without resetting inputs or child identities', () => {
  let next
  const child = observe(() => button({ onclick: () => span('local') }, 'child'))
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

  document.querySelector('a[href="/writing"]').click()
  equal(location.pathname, '/writing')
  equal(document.querySelector('.markdown h2').textContent,
        'Recursive state observers')
  assert(document.querySelector('.markdown pre code').textContent.includes('const view = count'))
  assert(document.querySelector('.markdown').textContent.includes('examples/content/introduction.md'))
  assert(document.querySelector('a[href="/writing"]').classList.contains('active'))
  await traverse(-1)
  equal(location.pathname, '/scope')
  equal(counters(), ['0', '0'])
  await traverse(1)
  equal(document.querySelector('.markdown h2').textContent,
        'Recursive state observers')
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
