let active = null
let mutation = null

// A nested update can supersede the frame that triggered a native callback.
export const checkpoint = () => {
  if (active?.isCancelled) throw active
}

// Finish moving the fragment before a nested update reads its child order.
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
  if (boundary.update) boundary.update.isCancelled = true
  const frame = { isCancelled: false }
  boundary.update = active = frame
  try {
    finishMutation()
    checkpoint()
    apply()
  } catch (error) {
    if (error !== frame) throw error
  } finally {
    if (boundary.update === frame) boundary.update = null
    active = previous
  }
}
