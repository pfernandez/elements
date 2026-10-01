import { sourceOf } from './observer.js'

const keyOf = vnode =>
  Array.isArray(vnode) && vnode[1]?.key != null
    ? String(vnode[1].key) : null

const originOf = vnode =>
  keyOf(vnode) == null ? sourceOf(vnode)?.origin : null

const uniqueIndex = values => {
  const indices = new Map()
  values.forEach((value, index) =>
    value != null && indices.set(value, indices.has(value) ? -1 : index))
  return indices
}

// Match references, explicit keys, unique unkeyed origins, then positions.
// An origin shared by siblings cannot identify their individual projections;
// retained references distinguish them, otherwise they stay positional.
// The maps and used set are local scratch space; inputs remain untouched.
export const matchChildren = (previous, next) => {
  const references = uniqueIndex(previous)
  const keys = uniqueIndex(previous.map(keyOf))
  const origins = uniqueIndex(previous.map(originOf))
  const nextOrigins = next.map(originOf)
  const uniqueOrigins = uniqueIndex(nextOrigins)
  const used = new Set()
  const claim = index =>
    index == null || index < 0 || used.has(index)
      ? -1 : (used.add(index), index)
  const referencesMatched = next.map(value =>
    Array.isArray(value) ? claim(references.get(value)) : -1)
  const keysMatched = referencesMatched.map((index, position) =>
    index !== -1 ? index : claim(keys.get(keyOf(next[position]))))
  const originsMatched = keysMatched.map((index, position) =>
    index !== -1 ? index
      : uniqueOrigins.get(nextOrigins[position]) === position
        ? claim(origins.get(nextOrigins[position])) : -1)

  return originsMatched.map((index, position) =>
    index !== -1 ? index
      : position < previous.length
        && keyOf(previous[position]) == null && keyOf(next[position]) == null
        ? claim(position) : -1)
}
