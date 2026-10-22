import { namespaceOf } from './namespaces.js'

const isPropsObject = value =>
  typeof value === 'object'
  && value !== null
  && !Array.isArray(value)

const isVNode = value =>
  Array.isArray(value)
  && (namespaceOf(value) !== undefined
    || typeof value[0] === 'string' && isPropsObject(value[1]))

const isVNodeGroup = value =>
  Array.isArray(value)
  && !isVNode(value)
  && value.every(child => isVNode(child) || isVNodeGroup(child))

// Arrays of vnodes compose like argument lists. Other array-valued children
// retain their existing meaning and shape.
export const normalizeChildren = (values, children = []) => {
  values.forEach(value =>
    isVNodeGroup(value) ? normalizeChildren(value, children) : children.push(value))
  return children
}
