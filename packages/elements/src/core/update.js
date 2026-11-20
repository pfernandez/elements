// A native DOM callback may finish a newer update before the current one resumes.
// Only our own superseded frame is caught; assignment and callback errors propagate.
let active = null
let mutation = null

export const checkpoint = () => {
  if (active?.cancelled) throw active
}

// A fragment is one logical range but several native operations. Complete its
// current move/removal before a reentrant patch reads the published child order.
const finishMutation = () => {
  const current = mutation
  while (current && current.index < current.nodes.length) {
    current.apply(current.nodes[current.index++])
    checkpoint()
  }
}

export const mutateRange = (nodes, apply) => {
  const previous = mutation
  mutation = { nodes, apply, index: 0 }
  try { finishMutation() }
  finally { mutation = previous }
}

export const updating = (boundary, apply) => {
  const previous = active
  if (boundary.update) boundary.update.cancelled = true
  const frame = { cancelled: false }
  boundary.update = active = frame
  try { finishMutation(); checkpoint(); apply() }
  catch (error) { if (error !== frame) throw error }
  finally {
    if (boundary.update === frame) boundary.update = null
    active = previous
  }
}
