const frame = document.querySelector('iframe')
const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}
const visit = path => new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error(`Timed out loading ${path}`)), 5000)
  frame.onload = () => { clearTimeout(timeout); resolve(frame.contentDocument) }
  frame.src = path
})

const check = async () => {
  const home = await visit('/elements/')
  assert(home.querySelector('h1')?.textContent === 'Elements.js Demo', 'The built demo must mount')
  const links = [...home.querySelectorAll('nav a')]
  assert(links.length === 5, 'Every demo route must be present')
  assert(links.every(link => link.pathname.startsWith('/elements/')), 'Links must stay under /elements/')
  assert(frame.contentWindow.getComputedStyle(home.body).display === 'grid', 'The bundled stylesheet must load')

  home.querySelector('a[href="/elements/writing"]').click()
  assert(home.querySelector('.markdown h2')?.textContent === 'A component as a recursive state observer',
         'Navigation must render the bundled Markdown')
  assert(frame.contentWindow.location.pathname === '/elements/writing', 'Navigation must record the prefixed URL')
  assert(home.querySelector('.markdown pre code')?.textContent.includes('const describe = count'),
         'The article must include its code examples')

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Back did not restore the home page')), 3000)
    frame.contentWindow.addEventListener('popstate', () => {
      clearTimeout(timeout)
      queueMicrotask(resolve)
    }, { once: true })
    frame.contentWindow.history.back()
  })
  assert(home.querySelector('section h2')?.textContent === 'Home', 'Back must restore the home observation')

  for (const [route, selector, heading] of [
    ['writing', '.markdown h2', 'A component as a recursive state observer'],
    ['todos', 'section h2', 'Todos App'],
    ['scope', 'section h2', 'Component Scope'],
    ['x3dom', 'section h2', 'X3D / X3DOM Scene']
  ]) {
    const page = await visit(`/elements/${route}/`)
    assert(page.querySelector(selector)?.textContent === heading, `Direct ${route} visits must mount the correct page`)
    assert(page.querySelector(`nav a[href="/elements/${route}"]`)?.classList.contains('active'),
           `Direct ${route} visits must select the current navigation link`)
    if (route === 'scope') {
      page.querySelectorAll('.scope button')[1].click()
      assert([...page.querySelectorAll('.scope output')].map(node => node.textContent).join(',') === '1,0',
             'The built observers must keep independent state')
    }
  }
}

try {
  await check()
  document.body.append(Object.assign(document.createElement('pre'), { id: 'results', textContent: 'PASS' }))
} catch (error) {
  document.body.append(Object.assign(document.createElement('pre'), { id: 'results', textContent: error.stack }))
}
