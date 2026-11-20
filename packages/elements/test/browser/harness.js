import { transition } from '../transition.js'

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
  transition(vnode, container)
  return container
}

export const traverse = (delta, window = globalThis.window) =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('History traversal timed out')), 2000)
    window.addEventListener('popstate', () => {
      clearTimeout(timeout)
      queueMicrotask(resolve)
    }, { once: true })
    window.history.go(delta)
  })

export const run = async () => {
  const results = []
  const filter = globalThis.browserCheckFilter
  for (const { name, run } of checks) {
    if (filter && !name.includes(filter)) continue
    try {
      await run()
      results.push({ name })
    } catch (error) {
      results.push({ name, error: error.stack || String(error) })
    }
  }
  return results
}
