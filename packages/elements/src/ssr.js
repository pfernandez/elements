import { attributeValue, validateProps } from './core/attributes.js'
import { childNamespace, htmlNS, namespaceAt } from './core/namespaces.js'

const voidTags = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
])

const isObject = x =>
  typeof x === 'object'
  && x !== null
  && !Array.isArray(x)

const escapeText = s =>
  String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

const escapeAttr = s =>
  escapeText(s)
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&#39;')

const toKebab = s =>
  String(s)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replaceAll('_', '-')
    .toLowerCase()

const styleToString = style => {
  if (!isObject(style)) return ''
  const keys = Object.keys(style)
  if (keys.length === 0) return ''

  return keys
    .filter(k => style[k] != null && style[k] !== false)
    .map(k => `${k.startsWith('--') ? k : toKebab(k)}:${String(style[k])}`)
    .join(';')
}

const shouldDropProp = (key, value) =>
  key === 'key'
  || key === 'innerHTML'
  || key === 'ontick'
  || key.startsWith('__')
  || typeof value === 'function'

const attribute = (key, value) =>
  value == null ? ''
    : value === '' ? ` ${key}`
      : ` ${key}="${escapeAttr(value)}"`

const attrsToString = props => {
  if (!isObject(props)) return ''

  validateProps(props)

  const keys = Object.keys(props)
    .filter(k => !shouldDropProp(k, props[k]))
    .sort()

  return keys.map(key =>
    attribute(key,
              key === 'style' && isObject(props[key])
                ? styleToString(props[key]) || null
                : attributeValue(key, props[key]))).join('')
}

const toHtmlStringInner = (vnode, parentNamespace = htmlNS) => {
  const type = typeof vnode
  if (vnode == null || vnode === false) return ''
  if (type === 'string' || type === 'number') return escapeText(vnode)

  if (!Array.isArray(vnode) || vnode.length === 0) return ''

  const tag = vnode[0]

  if (typeof tag !== 'string') return ''

  /** @type {Record<string, any>} */
  const props = isObject(vnode[1]) ? vnode[1] : {}
  const children = namespace => {
    let text = ''
    for (let i = 2; i < vnode.length; i++)
      text += toHtmlStringInner(vnode[i], namespace)
    return text
  }
  if (tag === 'fragment') return children(parentNamespace)
  const namespace = namespaceAt(vnode, parentNamespace)
  const attrs = attrsToString(props)

  if (namespace === htmlNS && voidTags.has(tag)) return `<${tag}${attrs}>`

  const inner = 'innerHTML' in props ? String(props.innerHTML ?? '')
    : children(childNamespace(tag, props, namespace))

  return `<${tag}${attrs}>${inner}</${tag}>`
}

/**
 * Serialize a vnode tree to an HTML string (SSR/SSG).
 *
 * @param {import('./core/types.js').ElementsVNode | string | number
 *   | null | undefined | false} vnode
 * @param {{ doctype?: boolean }} [options]
 * @returns {string}
 */
export const toHtmlString = (vnode, { doctype: hasDoctype = false } = {}) =>
  `${hasDoctype ? '<!doctype html>' : ''}${toHtmlStringInner(vnode)}`
