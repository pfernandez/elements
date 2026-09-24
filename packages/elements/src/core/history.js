import { snapshot, restore } from './component.js'

const sessions = new WeakMap()
const stateKey = '__elements_history'
const marker = (session, id) => ({ session: session.token, id })
const entryId = (session, state) =>
  state?.[stateKey]?.session === session.token ? state[stateKey].id : null
const historyState = (window, session, id) =>
  ({ ...window.history.state, [stateKey]: marker(session, id) })

const sessionFor = window => {
  let session = sessions.get(window)
  if (!session) {
    session = { token: Math.random().toString(36).slice(2),
                entries: new Map(), current: null, next: 0, url: window.location.href }
    sessions.set(window, session)
    window.addEventListener('popstate', event => {
      const id = entryId(session, event.state)
      const previousURL = new URL(session.url)
      const nextURL = new URL(window.location.href)
      // Save edits made since arriving, then restore the selected entry.
      session.entries.has(session.current)
        && session.entries.set(session.current, snapshot(window.document))
      session.current = id
      session.url = nextURL.href
      if (session.entries.has(id)) restore(session.entries.get(id))
      else if (event.state?.[stateKey]
               || previousURL.pathname !== nextURL.pathname
               || previousURL.search !== nextURL.search)
        window.location.reload()
    })
  }
  return session
}

// Mounting installs only a listener, not a route registration or history entry.
// After a reload, old entries have no in-memory continuations: load their URL.
export const watchHistory = () =>
  typeof window !== 'undefined' && window.document === globalThis.document
    && sessionFor(window)

/** Commit a link's URL and observation together; construction never visits. */
export const visit = (url, select) => {
  const session = sessionFor(window)
  const previous = entryId(session, window.history.state)
  const current = previous ?? session.next++
  // Seed the initial entry too, so the first Back has an observation to select.
  previous == null && window.history.replaceState(
    historyState(window, session, current), '', window.location.href)
  session.current = current
  session.entries.set(current, snapshot(window.document))

  const sameURL = url.href === window.location.href
  const next = sameURL ? current : session.next++
  if (!sameURL) {
    window.history.pushState(historyState(window, session, next), '', url.href)
    // A new branch makes the old forward entries unreachable.
    Array.from(session.entries.keys()).forEach(id =>
      id > current && session.entries.delete(id))
  }
  session.current = next
  session.url = url.href
  select()
  session.entries.set(next, snapshot(window.document))
}
