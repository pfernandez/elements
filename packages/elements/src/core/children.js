const vnodes = new WeakSet()

const isPropsObject = value =>
  typeof value === 'object'
  && value !== null
  && !Array.isArray(value)

const isVNode = value =>
  Array.isArray(value)
  && (vnodes.has(value)
    || typeof value[0] === 'string' && isPropsObject(value[1]))

const isVNodeGroup = value =>
  Array.isArray(value)
  && !isVNode(value)
  && value.every(child => isVNode(child) || isVNodeGroup(child))

export const markVNode = vnode =>
  (vnodes.add(vnode), vnode)

// Arrays of vnodes compose like argument lists. Other array-valued children
// retain their existing meaning and shape.
export const normalizeChildren = values =>
  values.flatMap(value =>
    isVNodeGroup(value) ? normalizeChildren(value) : [value])
