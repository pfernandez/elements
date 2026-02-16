/** @fileoverview Server-side rendering / static site generation helpers.
 *
 * Elements.js treats UI as a pure function tree that produces declarative
 * “vnode” arrays:
 *
 *   ['div', { id: 'x' }, 'Hello']
 *
 * In the browser, `render()` evaluates this AST into real DOM nodes. For
 * build-time prerendering (SSG) or server-side rendering (SSR),
 * `toHtmlString()` walks the same AST and prints HTML.
 *
 * Design notes:
 * - This is intentionally “dumb printing”, not hydration. Event handlers and
 *   other imperative props (functions) are dropped.
 * - `innerHTML` is treated as an explicit escape hatch: it is inserted verbatim
 *   and children are ignored.
 * - Boolean attribute rules mirror DOM assignment in `core/props.js`: -
 *   `aria-*` / `data-*` booleans become `"true"` / `"false"`.  - other booleans
 *   are present when true, omitted when false.
 *
 * The long-term goal is that vnode arrays act as a small, Lisp-like
 * cons-structure / AST: they can be evaluated into DOM, or serialized back into
 * markup, or translated into other equivalent encodings.
 */

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
  String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
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

const shouldDropProp = (key, value) => {
  if (key == null) return true
  if (key === 'innerHTML') return true
  if (String(key).startsWith('__')) return true
  if (typeof value === 'function') return true
  if (key === 'ontick') return true
  return false
}

const attrsToString = props => {
  if (!isObject(props)) return ''

  if (props.className != null && props.className !== false)
    throw new TypeError('Invalid prop: className. Use `class`.')

  const keys = Object.keys(props)
    .filter(k => !shouldDropProp(k, props[k]))
    .sort()

  let out = ''
  for (const key of keys) {
    const value = props[key]
    if (value == null || value === false) {
      // Preserve `aria-*` / `data-*` boolean semantics for false.
      if (typeof value === 'boolean'
        && (key.startsWith('aria-') || key.startsWith('data-')))
        out += ` ${key}="false"`
      continue
    }

    if (key === 'style' && isObject(value)) {
      const cssText = styleToString(value)
      cssText && (out += ` style="${escapeAttr(cssText)}"`)
      continue
    }

    if (typeof value === 'boolean') {
      if (key.startsWith('aria-') || key.startsWith('data-')) {
        out += ` ${key}="${value ? 'true' : 'false'}"`
      } else if (value) {
        out += ` ${key}`
      }
      continue
    }

    out += ` ${key}="${escapeAttr(value)}"`
  }
  return out
}

const toHtmlStringInner = vnode => {
  const type = typeof vnode
  if (vnode == null || vnode === false) return ''
  if (type === 'string' || type === 'number') return escapeText(vnode)

  if (!Array.isArray(vnode) || vnode.length === 0) return ''

  const tag = vnode[0]

  // Explicit fragments render children without a wrapper tag.
  if (tag === 'fragment') {
    let out = ''
    for (let i = 2; i < vnode.length; i++) out += toHtmlStringInner(vnode[i])
    return out
  }

  if (typeof tag !== 'string') return ''

  /** @type {Record<string, any>} */
  const props = isObject(vnode[1]) ? vnode[1] : {}
  const attrs = attrsToString(props)

  if (voidTags.has(tag)) return `<${tag}${attrs}>`

  const hasInnerHtml = 'innerHTML' in props
  const inner = hasInnerHtml
    ? String(props.innerHTML ?? '')
    : (() => {
      let out = ''
      for (let i = 2; i < vnode.length; i++) out += toHtmlStringInner(vnode[i])
      return out
    })()

  return `<${tag}${attrs}>${inner}</${tag}>`
}

/**
 * Serialize a vnode tree to an HTML string (SSR/SSG).
 *
 * @param {import('./core/types.js').ElementsVNode | string | number | null | undefined | false} vnode
 * @param {{ doctype?: boolean }} [options]
 * @returns {string}
 */
export const toHtmlString = (vnode, { doctype = false } = {}) =>
  `${doctype ? '<!doctype html>' : ''}${toHtmlStringInner(vnode)}`
