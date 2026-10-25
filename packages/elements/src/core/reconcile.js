import { sourceOf } from './observer.js'

const keyOf = vnode =>
  Array.isArray(vnode) && vnode[1]?.key != null
    ? String(vnode[1].key) : null

const identityOf = vnode =>
  keyOf(vnode) == null ? sourceOf(vnode)?.identity : null

export const matchesSingleChild = (previous, next) =>
  previous === next || keyOf(previous) === keyOf(next)

const uniqueIndex = (values, key = value => value) => {
  let indices = null
  values.forEach((value, index) => {
    const id = key(value)
    if (id != null) {
      indices ||= new Map()
      indices.set(id, indices.has(id) ? -1 : index)
    }
  })
  return indices
}

// Match references, explicit keys, unique unkeyed identities, then positions.
// An identity shared by siblings cannot identify their individual projections;
// retained references distinguish them, otherwise they stay positional.
// The maps and used set are local scratch space; inputs remain untouched.
export const matchChildren = (previous, next) => {
  if (!next.length) return []
  if (!previous.length) return next.map(() => -1)
  if (previous.length === 1 && next.length === 1)
    return [matchesSingleChild(previous[0], next[0]) ? 0 : -1]

  const references = uniqueIndex(previous, value => Array.isArray(value) ? value : null)
  const keys = uniqueIndex(previous, keyOf)
  const identities = uniqueIndex(previous, identityOf)
  // Plain unkeyed children stay positional unless a retained reference moves.
  // Check the entire list before reserving positions for fresh descriptions.
  if (!keys && !identities && next.every((value, index) => {
    const reference = references?.get(value)
    return keyOf(value) == null && (reference == null || reference < 0 || reference === index)
  })) return next.map((_, index) => index < previous.length ? index : -1)

  const nextIdentities = identities && next.map(identityOf)
  const uniqueIdentities = nextIdentities && uniqueIndex(nextIdentities)
  const used = new Set()
  const claim = index =>
    index == null || index < 0 || used.has(index)
      ? -1 : (used.add(index), index)
  const referencesMatched = next.map(value =>
    Array.isArray(value) ? claim(references?.get(value)) : -1)
  const keysMatched = referencesMatched.map((index, position) =>
    index !== -1 ? index : claim(keys?.get(keyOf(next[position]))))
  const identitiesMatched = keysMatched.map((index, position) =>
    index !== -1 ? index
      : uniqueIdentities?.get(nextIdentities[position]) === position
        ? claim(identities.get(nextIdentities[position])) : -1)

  return identitiesMatched.map((index, position) =>
    index !== -1 ? index
      : position < previous.length
        && keyOf(previous[position]) == null && keyOf(next[position]) == null
        ? claim(position) : -1)
}

// Keep a longest increasing sequence of old positions in place. Ordered lists
// (including appends/removals) need no index allocation or retained-node moves.
export const stablePositions = matches => {
  let last = -1
  if (matches.every(index => index < 0 || index > last && (last = index, true)))
    return null

  const tails = [], preceding = new Array(matches.length).fill(-1)
  matches.forEach((value, index) => {
    if (value < 0) return
    let low = 0, high = tails.length
    while (low < high) {
      const middle = low + high >>> 1
      matches[tails[middle]] < value ? low = middle + 1 : high = middle
    }
    if (low) preceding[index] = tails[low - 1]
    tails[low] = index
  })
  const stable = new Set()
  for (let index = tails.at(-1); index !== -1; index = preceding[index])
    stable.add(index)
  return stable
}
