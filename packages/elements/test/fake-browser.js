import { createFakeDom } from './fake-dom.js'

/** A small History API model; real-browser tests verify native traversal too. */
export const createFakeBrowser = (href = 'https://example.test/nested/page') => {
  const { document } = createFakeDom()
  const location = new URL(href)
  const reloads = []
  location.reload = () => reloads.push(location.href)
  const listeners = new Map()
  const entries = [{ url: href, state: null }]
  let index = 0
  const entry = (state, url) =>
    ({ url: new URL(url ?? location.href, location).href, state: structuredClone(state) })
  const window = {
    document, location,
    addEventListener: (name, fn) => {
      const handlers = listeners.get(name) || new Set()
      handlers.add(fn)
      listeners.set(name, handlers)
    },
    removeEventListener: (name, fn) => listeners.get(name)?.delete(fn),
    dispatchEvent: event => {
      Array.from(listeners.get(event.type) || []).forEach(fn => fn(event))
      return !event.defaultPrevented
    },
    history: {
      get state() { return structuredClone(entries[index].state) },
      get length() { return entries.length },
      pushState: (state, _title, url) => {
        const next = entry(state, url)
        entries.splice(index + 1, Infinity, next)
        index++
        location.href = next.url
      },
      replaceState: (state, _title, url) => {
        entries[index] = entry(state, url)
        location.href = entries[index].url
      },
      go: delta => {
        const next = index + delta
        if (next >= 0 && next < entries.length && next !== index) {
          index = next
          location.href = entries[index].url
          window.dispatchEvent({ type: 'popstate', state: window.history.state })
        }
      },
      back: () => window.history.go(-1),
      forward: () => window.history.go(1)
    }
  }
  return { window, document, location, history: window.history, reloads }
}

export const withBrowser = async run => {
  const previous = { document: globalThis.document, window: globalThis.window }
  const browser = createFakeBrowser()
  Object.assign(globalThis, { document: browser.document, window: browser.window })
  try { await run(browser) }
  finally { Object.assign(globalThis, previous) }
}

export const click = (node, props = {}) => {
  const event = { type: 'click', target: node, button: 0, cancelable: true,
    defaultPrevented: false,
    preventDefault() { this.defaultPrevented = true }, ...props }
  const result = node.onclick?.(event)
  window.dispatchEvent(event)
  return { event, result }
}
