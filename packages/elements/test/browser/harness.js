import { render } from '../../elements.js'

const checks = []

export const test = (name, run) => checks.push({ name, run })

export const assert = (condition, message = 'Assertion failed') => {
  if (!condition) throw new Error(message)
}

export const equal = (actual, expected) =>
  assert(JSON.stringify(actual) === JSON.stringify(expected),
         `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)

export const mount = vnode => {
  const container = document.createElement('section')
  document.body.append(container)
  render(vnode, container)
  return container
}

export const traverse = delta => new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error('History traversal timed out')), 2000)
  window.addEventListener('popstate', () => {
    clearTimeout(timeout)
    queueMicrotask(resolve)
  }, { once: true })
  history.go(delta)
})

export const run = async () =>
  checks.reduce(async (pending, { name, run }) => {
    const results = await pending
    try { await run(); return [...results, { name }] }
    catch (error) { return [...results, { name, error: error.stack || String(error) }] }
  }, Promise.resolve([]))
