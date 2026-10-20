// Vocabulary identity stays off the authored [tag, props, ...children] arrays.
const namespaces = new WeakMap()

export const htmlNS = 'http://www.w3.org/1999/xhtml'
export const svgNS = 'http://www.w3.org/2000/svg'
export const mathNS = 'http://www.w3.org/1998/Math/MathML'

export const namespaceOf = vnode => namespaces.get(vnode)
export const withNamespace = (vnode, namespace) =>
  (namespace !== undefined && namespaces.set(vnode, namespace), vnode)

// Literal arrays inherit their graph context. Vocabulary helpers are explicit.
export const namespaceAt = (source, parent = htmlNS) =>
  namespaceOf(source) !== undefined ? namespaceOf(source)
    : source?.[0] === 'svg' ? svgNS : source?.[0] === 'math' ? mathNS : parent
export const childNamespace = (tag, props, namespace) =>
  namespace === svgNS && tag === 'foreignObject'
  || namespace === mathNS && tag === 'annotation-xml'
    && /^(text\/html|application\/xhtml\+xml)$/i.test(props.encoding)
    ? htmlNS : namespace
