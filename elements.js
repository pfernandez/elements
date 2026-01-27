/** expressive/elements.js
 *
 * Minimalist declarative UI framework based on pure functional composition.
 *
 * Purpose:
 * - All UI defined as pure functions that return declarative arrays.
 * - Directly composable into a symbolic tree compatible with Lisp-like dialects.
 * - No internal mutable state required: DOM itself is the substrate for state.
 * - No JSX, no keys, no reconciler heuristics — just pure structure + replacement.
 *
 */

export const DEBUG =
  typeof process !== 'undefined'
  && process.env
  && (process.env.ELEMENTSJS_DEBUG?.toLowerCase() === 'true'
    || process.env.NODE_ENV === 'development')

const svgNS = 'http://www.w3.org/2000/svg'

/**
 * Maps vnode instances to their current root DOM element,
 * allowing accurate replacement when the same vnode is re-invoked.
 */
const rootMap = new WeakMap()

const isNodeEnv = () => typeof document === 'undefined'

let componentUpdateDepth = 0
let currentEventRoot = null

/**
 * Determines whether two nodes have changed enough to require replacement.
 * Compares type, string value, or element tag.
 *
 * @param {*} a - Previous vnode
 * @param {*} b - New vnode
 * @returns {boolean} - True if nodes are meaningfully different
 */
const changed = (a, b) =>
  typeof a !== typeof b
  || typeof a === 'string' && a !== b
  || Array.isArray(a) && Array.isArray(b) && a[0] !== b[0]

/**
 * Computes a patch object describing how to transform tree `a` into tree `b`.
 * Used by `render` to apply minimal updates to the DOM.
 *
 * @param {*} a - Previous vnode
 * @param {*} b - New vnode
 * @returns {Object} - Patch object with type and content
 */
const diffTree = (a, b) => {
  if (!a) return { type: 'CREATE', newNode: b }
  if (!b) return { type: 'REMOVE' }
  if (changed(a, b)) return { type: 'REPLACE', newNode: b }
  if (Array.isArray(a) && Array.isArray(b)) {
    return {
      type: 'UPDATE',
      children: diffChildren(a.slice(2), b.slice(2))
    }
  }
}

/**
 * Compares the children of two vnodes and returns patch list.
 *
 * @param {Array} aChildren - Previous vnode children
 * @param {Array} bChildren - New vnode children
 * @returns {Array} patches - One per child node
 */
const diffChildren = (aChildren, bChildren) => {
  const patches = []
  const len = Math.max(aChildren.length, bChildren.length)
  for (let i = 0; i < len; i++) {
    patches[i] = diffTree(aChildren[i], bChildren[i])
  }
  return patches
}

/**
 * Assigns attributes, styles, and event handlers to a DOM element.
 *
 * - Event listeners may return a vnode array to trigger a subtree replacement.
 * - For `onsubmit`, `oninput`, and `onchange`, `preventDefault()` is called automatically
 *   *if* the listener returns a vnode (to support declarative form updates).
 * - Handlers for these event types receive `(elements, event)` as arguments,
 *   where `elements` is `event.target.elements` if available.
 * - Async handlers are supported: if the listener returns a Promise,
 *   it will be awaited and the resulting vnode (if any) will be rendered.
 *
 * @param {HTMLElement} el - The DOM element to receive props
 * @param {Object} props - Attributes and event listeners to assign
 */
const assignProperties = (el, props) =>
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith('on') && typeof value === 'function') {
      el[key] = async (...args) => {
        let target = el
        while (target && !target.__root) target = target.parentNode
        if (!target) return

        const prevEventRoot = currentEventRoot
        currentEventRoot = target
        try {
          const event = args[0]
          const isFormEvent = /^(oninput|onsubmit|onchange)$/.test(key)
          const elements = isFormEvent && event?.target?.elements || null

          const result = await (isFormEvent
            ? value.call(el, elements, event)
            : value.call(el, event))

          if (isFormEvent && result !== undefined) {
            event.preventDefault()
          }

          if (DEBUG && result === undefined) {
            console.warn(
              `Listener '${key}' on <${el.tagName.toLowerCase()}> returned nothing.\n`
                + 'If you intended a UI update, return a vnode array like: div({}, ...)'
            )
          }

          if (DEBUG && result !== undefined && !Array.isArray(result)) {
            isFormEvent && event.preventDefault()
            DEBUG
              && console.warn(
                `Listener '${key}' on <${el.tagName.toLowerCase()}> returned "${result}".\n`
                  + 'If you intended a UI update, return a vnode array like: div({}, ...).\n'
                  + 'Otherwise, return undefined (or nothing) for native event listener behavior.'
              )
          }

          if (Array.isArray(result)) {
            const parent = target.parentNode
            if (!parent) return

            const replacement = renderTree(result, true)
            parent.replaceChild(replacement, target)

            replacement.__vnode = result
            replacement.__root = true
            rootMap.set(result, replacement)
          }
        } catch (error) {
          console.error(error)
        } finally {
          currentEventRoot = prevEventRoot
        }
      }
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value)
    } else if (key === 'innerHTML') {
      el.innerHTML = value
    } else {
      try {
        if (el.namespaceURI === svgNS) {
          el.setAttributeNS(null, key, value)
        } else {
          el.setAttribute(key, value)
        }
      } catch {
        DEBUG
          && console.warn(
            `Illegal DOM property assignment for ${el.tagName}: ${key}: ${value}`
          )
      }
    }
  })

/**
 * Recursively builds a real DOM tree from a declarative vnode.
 * Marks root nodes and tracks state/element associations.
 *
 * @param {*} node - Vnode to render
 * @param {boolean} isRoot - Whether this is a root component
 * @returns {Node} - Real DOM node
 */
const renderTree = (node, isRoot = true) => {
  if (typeof node === 'string' || typeof node === 'number') {
    return isNodeEnv() ? node : document.createTextNode(node)
  }

  if (!node || node.length === 0) {
    return document.createComment('Empty vnode')
  }

  if (!Array.isArray(node)) {
    console.error('Malformed vnode (not an array):', node)
    return document.createComment('Invalid vnode')
  }

  if (Array.isArray(node) && node[0] === 'wrap') {
    const [_tag, props = {}, child] = node
    const el = renderTree(child, true)
    if (props && typeof props === 'object' && props.__instance) {
      rootMap.set(props.__instance, el)
    }
    return el
  }

  const [tag, props = {}, ...children] = node

  if (typeof tag !== 'string') {
    console.error('Malformed vnode (non-string tag):', node)
    return document.createComment('Invalid vnode')
  }

  let el =
    tag === 'html'
      ? document.documentElement
      : tag === 'head'
        ? document.head
        : tag === 'body'
          ? document.body
          : svgTagNames.includes(tag)
            ? document.createElementNS(svgNS, tag)
            : document.createElement(tag)

  el.__vnode = node

  if (isRoot && tag !== 'html' && tag !== 'head' && tag !== 'body') {
    el.__root = true
    rootMap.set(node, el)
  }

  assignProperties(el, props)

  children.forEach(child => {
    const childEl = renderTree(child, false)
    el.appendChild(childEl)
  })

  return el
}

/**
 * Applies a patch object to a DOM subtree.
 * Handles creation, removal, replacement, and child updates.
 *
 * @param {HTMLElement} parent - DOM node to mutate
 * @param {Object} patch - Patch object from diffTree
 * @param {number} [index=0] - Child index to apply update to
 */
const applyPatch = (parent, patch, index = 0) => {
  if (!patch) return
  const child = parent.childNodes[index]

  switch (patch.type) {
  case 'CREATE': {
    const newEl = renderTree(patch.newNode)
    parent.appendChild(newEl)
    break
  }
  case 'REMOVE':
    if (child) parent.removeChild(child)
    break
  case 'REPLACE': {
    const newEl = renderTree(patch.newNode)
    parent.replaceChild(newEl, child)
    break
  }
  case 'UPDATE':
    patch.children.forEach((p, i) => applyPatch(child, p, i))
    break
  }
}

/**
 * Renders a new vnode into the DOM. If this vnode was rendered before,
 * reuses the previous root and applies a patch. Otherwise, performs initial mount.
 *
 * @param {any[]} vtree - The declarative vnode array to render
 * @param {HTMLElement} container - The container to render into
 */
export const render = (vtree, container = null) => {
  const target =
    !container && Array.isArray(vtree) && vtree[0] === 'html'
      ? document.documentElement
      : container

  if (!target) {
    throw new Error('render() requires a container for non-html() root')
  }

  const prevVNode = target.__vnode

  if (!prevVNode) {
    const dom = renderTree(vtree)
    if (target === document.documentElement) {
      document.replaceChild(dom, document.documentElement)
    } else {
      target.appendChild(dom)
    }
  } else {
    const patch = diffTree(prevVNode, vtree)
    applyPatch(target, patch)
  }

  target.__vnode = vtree
  rootMap.set(vtree, target)
}

/**
 * Updates the browser URL via the History API (no full page load).
 * No-ops outside the browser.
 *
 * @param {string} to - The target URL (path/search/hash).
 * @param {Object} [options]
 * @param {boolean} [options.replace=false] - Use replaceState instead of pushState.
 * @param {boolean} [options.force=false] - Update even if URL is already `to`.
 * @param {any} [options.state={}] - History state.
 * @param {string} [options.title=''] - History title (mostly ignored by browsers).
 */
export const navigate = (to, {
  replace = false,
  force = false,
  state = {},
  title = ''
} = {}) => {
  if (typeof window === 'undefined') return
  if (typeof to !== 'string' || !to.length) return

  const { pathname, search, hash } = window.location
  const current = `${pathname}${search}${hash}`
  if (!force && current === to) return

  const method = replace ? 'replaceState' : 'pushState'
  window.history[method](state, title, to)
}

/**
 * Wraps a function component so that it participates in reconciliation.
 *
 * @param {(...args: any[]) => any} fn - A pure function that returns a declarative tree (array format).
 * @returns {(...args: any[]) => any} - A callable component that can manage its own subtree.
 */
export const component = fn => {
  const instance = {}
  return (...args) => {
    try {
      const prevEl = rootMap.get(instance)
      const canUpdateInPlace =
        !!prevEl?.parentNode
        && componentUpdateDepth === 0
        && !currentEventRoot

      componentUpdateDepth++
      let vnode
      try {
        vnode = fn(...args)
      } finally {
        componentUpdateDepth--
      }

      if (canUpdateInPlace) {
        const replacement = renderTree(['wrap', { __instance: instance }, vnode], true)
        prevEl.parentNode.replaceChild(replacement, prevEl)
        return replacement.__vnode
      }

      return ['wrap', { __instance: instance }, vnode]
    } catch (err) {
      console.error('Component error:', err)
      return ['div', {}, `Error: ${err.message}`]
    }
  }
}

const htmlTagNames = [
  // Document metadata
  'html',
  'head',
  'base',
  'link',
  'meta',
  'title',

  // Sections
  'body',
  'header',
  'hgroup',
  'nav',
  'main',
  'section',
  'article',
  'aside',
  'footer',
  'address',

  // Text content
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'hr',
  'menu',
  'pre',
  'blockquote',
  'ol',
  'ul',
  'li',
  'dl',
  'dt',
  'dd',
  'figure',
  'figcaption',
  'div',

  // Inline text semantics
  'a',
  'abbr',
  'b',
  'bdi',
  'bdo',
  'br',
  'cite',
  'code',
  'data',
  'dfn',
  'em',
  'i',
  'kbd',
  'mark',
  'q',
  'rb',
  'rp',
  'rt',
  'rtc',
  'ruby',
  's',
  'samp',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'time',
  'u',
  'var',
  'wbr',

  // Edits
  'ins',
  'del',

  // Embedded content
  'img',
  'iframe',
  'embed',
  'object',
  'param',
  'video',
  'audio',
  'source',
  'track',
  'picture',

  // Table content
  'table',
  'caption',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
  'colgroup',
  'col',

  // Forms
  'form',
  'fieldset',
  'legend',
  'label',
  'input',
  'button',
  'select',
  'datalist',
  'optgroup',
  'option',
  'textarea',
  'output',
  'progress',
  'meter',

  // Interactive elements
  'details',
  'search',
  'summary',
  'dialog',
  'slot',
  'template',

  // Scripting and style
  'script',
  'noscript',
  'style',

  // Web components and others
  'canvas',
  'picture',
  'map',
  'area',
  'slot'
]

const svgTagNames = [
  // Animation elements
  'animate',
  'animateMotion',
  'animateTransform',
  'mpath',
  'set',

  // Basic shapes
  'circle',
  'ellipse',
  'line',
  'path',
  'polygon',
  'polyline',
  'rect',

  // Container / structural
  'defs',
  'g',
  'marker',
  'mask',
  'pattern',
  'svg',
  'switch',
  'symbol',
  'use',

  // Descriptive
  'desc',
  'metadata',
  'title',

  // Filter primitives
  'filter',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feDistantLight',
  'feDropShadow',
  'feFlood',
  'feFuncA',
  'feFuncB',
  'feFuncG',
  'feFuncR',
  'feGaussianBlur',
  'feImage',
  'feMerge',
  'feMergeNode',
  'feMorphology',
  'feOffset',
  'fePointLight',
  'feSpecularLighting',
  'feSpotLight',
  'feTile',
  'feTurbulence',

  // Gradient / paint servers
  'linearGradient',
  'radialGradient',
  'stop',

  // Graphics elements
  'image',
  'foreignObject', // included in graphics section as non‑standard children

  // Text and text-path
  'text',
  'textPath',
  'tspan',

  // Scripting/style
  'script',
  'style',

  // View
  'view'
]

const tagNames = [...htmlTagNames, ...svgTagNames]
const isPropsObject = x =>
  typeof x === 'object'
  && x !== null
  && !Array.isArray(x)
  && !(typeof Node !== 'undefined' && x instanceof Node)

/**
 * A map of supported HTML and SVG element helpers.
 *
 * Each helper is a function that accepts optional props as first argument
 * and children as subsequent arguments.
 *
 * Example:
 *
 * ```js
 * div({ id: 'foo' }, 'Hello World')
 * ```
 *
 * Produces:
 *
 * ```js
 * ['div', { id: 'foo' }, 'Hello World']
 * ```
 *
 * The following helpers are included:
 * `div`, `span`, `button`, `svg`, `circle`, etc.
 */
export const elements = tagNames.reduce(
  (acc, tag) => ({
    ...acc,
    [tag]: (...args) => {
      const hasFirstArg = args.length > 0
      const [propsOrChild, ...children] = args
      const props = hasFirstArg && isPropsObject(propsOrChild) ? propsOrChild : {}
      const actualChildren = !hasFirstArg
        ? []
        : props === propsOrChild
          ? children
          : [propsOrChild, ...children]
      return [tag, props, ...actualChildren]
    }
  }),
  {
    fragment: (...children) => ['fragment', {}, ...children]
  }
)

/**
 * <html>
 * Represents the root (top-level element) of an HTML document, so it is also referred to as the root element. All other elements must be descendants of this element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/html
 *
 */
export const html = elements.html

/**
 * <base>
 * Specifies the base URL to use for all relative URLs in a document. There can be only one such element in a document.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/base
 *
 */
export const base = elements.base

/**
 * <head>
 * Contains machine-readable information (metadata) about the document, like its title, scripts, and style sheets.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/head
 *
 */
export const head = elements.head

/**
 * <link>
 * Specifies relationships between the current document and an external resource. This element is most commonly used to link to CSS but is also used to establish site icons (both "favicon" style icons and icons for the home screen and apps on mobile devices) among other things.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/link
 *
 */
export const link = elements.link

/**
 * <meta>
 * Represents metadata that cannot be represented by other HTML meta-related elements, like <base>, <link>, <script>, <style> and <title>.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta
 *
 */
export const meta = elements.meta

/**
 * <style>
 * Contains style information for a document or part of a document. It contains CSS, which is applied to the contents of the document containing this element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/style
 *
 */
export const style = elements.style

/**
 * <title>
 * Defines the document's title that is shown in a browser's title bar or a page's tab. It only contains text; HTML tags within the element, if any, are also treated as plain text.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/title
 *
 */
export const title = elements.title

/**
 * <body>
 * Represents the content of an HTML document. There can be only one such element in a document.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/body
 *
 */
export const body = elements.body

/**
 * <address>
 * Indicates that the enclosed HTML provides contact information for a person or people, or for an organization.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/address
 *
 */
export const address = elements.address

/**
 * <article>
 * Represents a self-contained composition in a document, page, application, or site, which is intended to be independently distributable or reusable (e.g., in syndication). Examples include a forum post, a magazine or newspaper article, a blog entry, a product card, a user-submitted comment, an interactive widget or gadget, or any other independent item of content.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/article
 *
 */
export const article = elements.article

/**
 * <aside>
 * Represents a portion of a document whose content is only indirectly related to the document's main content. Asides are frequently presented as sidebars or call-out boxes.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/aside
 *
 */
export const aside = elements.aside

/**
 * <footer>
 * Represents a footer for its nearest ancestor sectioning content or sectioning root element. A <footer> typically contains information about the author of the section, copyright data, or links to related documents.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/footer
 *
 */
export const footer = elements.footer

/**
 * <header>
 * Represents introductory content, typically a group of introductory or navigational aids. It may contain some heading elements but also a logo, a search form, an author name, and other elements.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/header
 *
 */
export const header = elements.header

/**
 * <h1>
 * There are six levels of section headings. <h1> is the highest section level and <h6> is the lowest.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/h1
 *
 */
export const h1 = elements.h1

/**
 * <h2>
 * There are six levels of section headings. <h1> is the highest section level and <h6> is the lowest.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/h2
 *
 */
export const h2 = elements.h2

/**
 * <h3>
 * There are six levels of section headings. <h1> is the highest section level and <h6> is the lowest.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/h3
 *
 */
export const h3 = elements.h3

/**
 * <h4>
 * There are six levels of section headings. <h1> is the highest section level and <h6> is the lowest.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/h4
 *
 */
export const h4 = elements.h4

/**
 * <h5>
 * There are six levels of section headings. <h1> is the highest section level and <h6> is the lowest.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/h5
 *
 */
export const h5 = elements.h5

/**
 * <h6>
 * There are six levels of section headings. <h1> is the highest section level and <h6> is the lowest.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/h6
 *
 */
export const h6 = elements.h6

/**
 * <hgroup>
 * Represents a heading grouped with any secondary content, such as subheadings, an alternative title, or a tagline.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/hgroup
 *
 */
export const hgroup = elements.hgroup

/**
 * <main>
 * Represents the dominant content of the body of a document. The main content area consists of content that is directly related to or expands upon the central topic of a document, or the central functionality of an application.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/main
 *
 */
export const main = elements.main

/**
 * <nav>
 * Represents a section of a page whose purpose is to provide navigation links, either within the current document or to other documents. Common examples of navigation sections are menus, tables of contents, and indexes.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/nav
 *
 */
export const nav = elements.nav

/**
 * <section>
 * Represents a generic standalone section of a document, which doesn't have a more specific semantic element to represent it. Sections should always have a heading, with very few exceptions.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/section
 *
 */
export const section = elements.section

/**
 * <search>
 * Represents a part that contains a set of form controls or other content related to performing a search or filtering operation.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/search
 *
 */
export const search = elements.search

/**
 * <blockquote>
 * Indicates that the enclosed text is an extended quotation. Usually, this is rendered visually by indentation. A URL for the source of the quotation may be given using the cite attribute, while a text representation of the source can be given using the <cite> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/blockquote
 *
 */
export const blockquote = elements.blockquote

/**
 * <dd>
 * Provides the description, definition, or value for the preceding term (<dt>) in a description list (<dl>).
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dd
 *
 */
export const dd = elements.dd

/**
 * <div>
 * The generic container for flow content. It has no effect on the content or layout until styled in some way using CSS (e.g., styling is directly applied to it, or some kind of layout model like flexbox is applied to its parent element).
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/div
 *
 */
export const div = elements.div

/**
 * <dl>
 * Represents a description list. The element encloses a list of groups of terms (specified using the <dt> element) and descriptions (provided by <dd> elements). Common uses for this element are to implement a glossary or to display metadata (a list of key-value pairs).
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dl
 *
 */
export const dl = elements.dl

/**
 * <dt>
 * Specifies a term in a description or definition list, and as such must be used inside a <dl> element. It is usually followed by a <dd> element; however, multiple <dt> elements in a row indicate several terms that are all defined by the immediate next <dd> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dt
 *
 */
export const dt = elements.dt

/**
 * <figcaption>
 * Represents a caption or legend describing the rest of the contents of its parent <figure> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/figcaption
 *
 */
export const figcaption = elements.figcaption

/**
 * <figure>
 * Represents self-contained content, potentially with an optional caption, which is specified using the <figcaption> element. The figure, its caption, and its contents are referenced as a single unit.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/figure
 *
 */
export const figure = elements.figure

/**
 * <hr>
 * Represents a thematic break between paragraph-level elements: for example, a change of scene in a story, or a shift of topic within a section.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/hr
 *
 */
export const hr = elements.hr

/**
 * <li>
 * Represents an item in a list. It must be contained in a parent element: an ordered list (<ol>), an unordered list (<ul>), or a menu (<menu>). In menus and unordered lists, list items are usually displayed using bullet points. In ordered lists, they are usually displayed with an ascending counter on the left, such as a number or letter.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/li
 *
 */
export const li = elements.li

/**
 * <menu>
 * A semantic alternative to <ul>, but treated by browsers (and exposed through the accessibility tree) as no different than <ul>. It represents an unordered list of items (which are represented by <li> elements).
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/menu
 *
 */
export const menu = elements.menu

/**
 * <ol>
 * Represents an ordered list of items — typically rendered as a numbered list.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ol
 *
 */
export const ol = elements.ol

/**
 * <p>
 * Represents a paragraph. Paragraphs are usually represented in visual media as blocks of text separated from adjacent blocks by blank lines and/or first-line indentation, but HTML paragraphs can be any structural grouping of related content, such as images or form fields.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/p
 *
 */
export const p = elements.p

/** ')
 * <pre>
 * Represents preformatted text which is to be presented exactly as written in the HTML file. The text is typically rendered using a non-proportional, or monospaced, font. Whitespace inside this element is displayed as written.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/pre
 *
 */
export const pre = elements.pre

/**
 * <ul>
 * Represents an unordered list of items, typically rendered as a bulleted list.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ul
 *
 */
export const ul = elements.ul

/**
 * <a>
 * Together with its href attribute, creates a hyperlink to web pages, files, email addresses, locations within the current page, or anything else a URL can address.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a
 *
 */
export const a = elements.a

/**
 * <abbr>
 * Represents an abbreviation or acronym.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/abbr
 *
 */
export const abbr = elements.abbr

/**
 * <b>
 * Used to draw the reader's attention to the element's contents, which are not otherwise granted special importance. This was formerly known as the Boldface element, and most browsers still draw the text in boldface. However, you should not use <b> for styling text or granting importance. If you wish to create boldface text, you should use the CSS font-weight property. If you wish to indicate an element is of special importance, you should use the <strong> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/b
 *
 */
export const b = elements.b

/**
 * <bdi>
 * Tells the browser's bidirectional algorithm to treat the text it contains in isolation from its surrounding text. It's particularly useful when a website dynamically inserts some text and doesn't know the directionality of the text being inserted.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/bdi
 *
 */
export const bdi = elements.bdi

/**
 * <bdo>
 * Overrides the current directionality of text, so that the text within is rendered in a different direction.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/bdo
 *
 */
export const bdo = elements.bdo

/**
 * <br>
 * Produces a line break in text (carriage-return). It is useful for writing a poem or an address, where the division of lines is significant.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/br
 *
 */
export const br = elements.br

/**
 * <cite>
 * Used to mark up the title of a creative work. The reference may be in an abbreviated form according to context-appropriate conventions related to citation metadata.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/cite
 *
 */
export const cite = elements.cite

/**
 * <code>
 * Displays its contents styled in a fashion intended to indicate that the text is a short fragment of computer code. By default, the content text is displayed using the user agent's default monospace font.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/code
 *
 */
export const code = elements.code

/**
 * <data>
 * Links a given piece of content with a machine-readable translation. If the content is time- or date-related, the <time> element must be used.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/data
 *
 */
export const data = elements.data

/**
 * <dfn>
 * Used to indicate the term being defined within the context of a definition phrase or sentence. The ancestor <p> element, the <dt>/<dd> pairing, or the nearest section ancestor of the <dfn> element, is considered to be the definition of the term.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dfn
 *
 */
export const dfn = elements.dfn

/**
 * <em>
 * Marks text that has stress emphasis. The <em> element can be nested, with each nesting level indicating a greater degree of emphasis.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/em
 *
 */
export const em = elements.em

/**
 * <i>
 * Represents a range of text that is set off from the normal text for some reason, such as idiomatic text, technical terms, and taxonomical designations, among others. Historically, these have been presented using italicized type, which is the original source of the <i> naming of this element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/i
 *
 */
export const i = elements.i

/**
 * <kbd>
 * Represents a span of inline text denoting textual user input from a keyboard, voice input, or any other text entry device. By convention, the user agent defaults to rendering the contents of a <kbd> element using its default monospace font, although this is not mandated by the HTML standard.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/kbd
 *
 */
export const kbd = elements.kbd

/**
 * <mark>
 * Represents text which is marked or highlighted for reference or notation purposes due to the marked passage's relevance in the enclosing context.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/mark
 *
 */
export const mark = elements.mark

/**
 * <q>
 * Indicates that the enclosed text is a short inline quotation. Most modern browsers implement this by surrounding the text in quotation marks. This element is intended for short quotations that don't require paragraph breaks; for long quotations use the <blockquote> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/q>
 *
 */
export const q = elements.q

/**
 * <rp>
 * Used to provide fall-back parentheses for browsers that do not support the display of ruby annotations using the <ruby> element. One <rp> element should enclose each of the opening and closing parentheses that wrap the <rt> element that contains the annotation's text.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/rp
 *
 */
export const rp = elements.rp

/**
 * <rt>
 * Specifies the ruby text component of a ruby annotation, which is used to provide pronunciation, translation, or transliteration information for East Asian typography. The <rt> element must always be contained within a <ruby> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/rt
 *
 */
export const rt = elements.rt

/**
 * <ruby>
 * Represents small annotations that are rendered above, below, or next to base text, usually used for showing the pronunciation of East Asian characters. It can also be used for annotating other kinds of text, but this usage is less common.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ruby
 *
 */
export const ruby = elements.ruby

/**
 * <s>
 * Renders text with a strikethrough, or a line through it. Use the <s> element to represent things that are no longer relevant or no longer accurate. However, <s> is not appropriate when indicating document edits; for that, use the <del> and <ins> elements, as appropriate.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/s
 *
 */
export const s = elements.s

/**
 * <samp>
 * Used to enclose inline text which represents sample (or quoted) output from a computer program. Its contents are typically rendered using the browser's default monospaced font (such as Courier or Lucida Console).
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/samp
 *
 */
export const samp = elements.samp

/**
 * <small>
 * Represents side-comments and small print, like copyright and legal text, independent of its styled presentation. By default, it renders text within it one font size smaller, such as from small to x-small.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/small
 *
 */
export const small = elements.small

/**
 * <span>
 * A generic inline container for phrasing content, which does not inherently represent anything. It can be used to group elements for styling purposes (using the class or id attributes), or because they share attribute values, such as lang. It should be used only when no other semantic element is appropriate. <span> is very much like a div element, but div is a block-level element whereas a <span> is an inline-level element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/span
 *
 */
export const span = elements.span

/**
 * <strong>
 * Indicates that its contents have strong importance, seriousness, or urgency. Browsers typically render the contents in bold type.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/strong
 *
 */
export const strong = elements.strong

/**
 * <sub>
 * Specifies inline text which should be displayed as subscript for solely typographical reasons. Subscripts are typically rendered with a lowered baseline using smaller text.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/sub
 *
 */
export const sub = elements.sub

/**
 * <sup>
 * Specifies inline text which is to be displayed as superscript for solely typographical reasons. Superscripts are usually rendered with a raised baseline using smaller text.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/sup
 *
 */
export const sup = elements.sup

/**
 * <time>
 * Represents a specific period in time. It may include the datetime attribute to translate dates into machine-readable format, allowing for better search engine results or custom features such as reminders.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/time
 *
 */
export const time = elements.time

/**
 * <u>
 * Represents a span of inline text which should be rendered in a way that indicates that it has a non-textual annotation. This is rendered by default as a single solid underline but may be altered using CSS.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/u
 *
 */
export const u = elements.u

/**
 * <var>
 * Represents the name of a variable in a mathematical expression or a programming context. It's typically presented using an italicized version of the current typeface, although that behavior is browser-dependent.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/var
 *
 */
export const htmlvar = elements.var

/**
 * <wbr>
 * Represents a word break opportunity—a position within text where the browser may optionally break a line, though its line-breaking rules would not otherwise create a break at that location.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/wbr
 *
 */
export const wbr = elements.wbr

/**
 * <area>
 * Defines an area inside an image map that has predefined clickable areas. An image map allows geometric areas on an image to be associated with hyperlink.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/area
 *
 */
export const area = elements.area

/**
 * <audio>
 * Used to embed sound content in documents. It may contain one or more audio sources, represented using the src attribute or the source element: the browser will choose the most suitable one. It can also be the destination for streamed media, using a MediaStream.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/audio
 *
 */
export const audio = elements.audio

/**
 * <img>
 * Embeds an image into the document.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img
 *
 */
export const img = elements.img

/**
 * <map>
 * Used with <area> elements to define an image map (a clickable link area).
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/map
 *
 */
export const map = elements.map

/**
 * <track>
 * Used as a child of the media elements, audio and video. It lets you specify timed text tracks (or time-based data), for example to automatically handle subtitles. The tracks are formatted in WebVTT format (.vtt files)—Web Video Text Tracks.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/track
 *
 */
export const track = elements.track

/**
 * <video>
 * Embeds a media player which supports video playback into the document. You can also use <video> for audio content, but the audio element may provide a more appropriate user experience.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video
 *
 */
export const video = elements.video

/**
 * <embed>
 * Embeds external content at the specified point in the document. This content is provided by an external application or other source of interactive content such as a browser plug-in.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/embed
 *
 */
export const embed = elements.embed

/**
 * <iframe>
 * Represents a nested browsing context, embedding another HTML page into the current one.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe
 *
 */
export const iframe = elements.iframe

/**
 * <object>
 * Represents an external resource, which can be treated as an image, a nested browsing context, or a resource to be handled by a plugin.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/object
 *
 */
export const object = elements.object

/**
 * <picture>
 * Contains zero or more <source> elements and one <img> element to offer alternative versions of an image for different display/device scenarios.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture
 *
 */
export const picture = elements.picture

/**
 * <source>
 * Specifies multiple media resources for the picture, the audio element, or the video element. It is a void element, meaning that it has no content and does not have a closing tag. It is commonly used to offer the same media content in multiple file formats in order to provide compatibility with a broad range of browsers given their differing support for image file formats and media file formats.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/source
 *
 */
export const source = elements.source

/**
 * <canvas>
 * Container element to use with either the canvas scripting API or the WebGL API to draw graphics and animations.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/canvas
 *
 */
export const canvas = elements.canvas

/**
 * <noscript>
 * Defines a section of HTML to be inserted if a script type on the page is unsupported or if scripting is currently turned off in the browser.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/noscript
 *
 */
export const noscript = elements.noscript

/**
 * <script>
 * Used to embed executable code or data; this is typically used to embed or refer to JavaScript code. The <script> element can also be used with other languages, such as WebGL's GLSL shader programming language and JSON.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script
 *
 */
export const script = elements.script

/**
 * <del>
 * Represents a range of text that has been deleted from a document. This can be used when rendering "track changes" or source code diff information, for example. The <ins> element can be used for the opposite purpose: to indicate text that has been added to the document.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/del
 *
 */
export const del = elements.del

/**
 * <ins>
 * Represents a range of text that has been added to a document. You can use the <del> element to similarly represent a range of text that has been deleted from the document.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ins
 *
 */
export const ins = elements.ins

/**
 * <caption>
 * Specifies the caption (or title) of a table.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/caption
 *
 */
export const caption = elements.caption

/**
 * <col>
 * Defines one or more columns in a column group represented by its implicit or explicit parent <colgroup> element. The <col> element is only valid as a child of a <colgroup> element that has no span attribute defined.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/col
 *
 */
export const col = elements.col

/**
 * <colgroup>
 * Defines a group of columns within a table.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/colgroup
 *
 */
export const colgroup = elements.colgroup

/**
 * <table>
 * Represents tabular data—that is, information presented in a two-dimensional table comprised of rows and columns of cells containing data.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/table
 *
 */
export const table = elements.table

/**
 * <tbody>
 * Encapsulates a set of table rows (<tr> elements), indicating that they comprise the body of a table's (main) data.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tbody
 *
 */
export const tbody = elements.tbody

/**
 * <td>
 * A child of the <tr> element, it defines a cell of a table that contains data.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/td
 *
 */
export const td = elements.td

/**
 * <tfoot>
 * Encapsulates a set of table rows (<tr> elements), indicating that they comprise the foot of a table with information about the table's columns. This is usually a summary of the columns, e.g., a sum of the given numbers in a column.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tfoot
 *
 */
export const tfoot = elements.tfoot

/**
 * <th>
 * A child of the <tr> element, it defines a cell as the header of a group of table cells. The nature of this group can be explicitly defined by the scope and headers attributes.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/th
 *
 */
export const th = elements.th

/**
 * <thead>
 * Encapsulates a set of table rows (<tr> elements), indicating that they comprise the head of a table with information about the table's columns. This is usually in the form of column headers (<th> elements).
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/thead
 *
 */
export const thead = elements.thead

/**
 * <tr>
 * Defines a row of cells in a table. The row's cells can then be established using a mix of <td> (data cell) and <th> (header cell) elements.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tr
 *
 */
export const tr = elements.tr

/**
 * <button>
 * An interactive element activated by a user with a mouse, keyboard, finger, voice command, or other assistive technology. Once activated, it performs an action, such as submitting a form or opening a dialog.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button
 *
 */
export const button = elements.button

/**
 * <datalist>
 * Contains a set of <option> elements that represent the permissible or recommended options available to choose from within other controls.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/datalist
 *
 */
export const datalist = elements.datalist

/**
 * <fieldset>
 * Used to group several controls as well as labels (<label>) within a web form.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fieldset
 *
 */
export const fieldset = elements.fieldset

/**
 * <form>
 * Represents a document section containing interactive controls for submitting information.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form
 *
 */
export const form = elements.form

/**
 * <input>
 * Used to create interactive controls for web-based forms to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent. The <input> element is one of the most powerful and complex in all of HTML due to the sheer number of combinations of input types and attributes.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input
 *
 */
export const input = elements.input

/**
 * <label>
 * Represents a caption for an item in a user interface.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label
 *
 */
export const label = elements.label

/**
 * <legend>
 * Represents a caption for the content of its parent <fieldset>.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/legend
 *
 */
export const legend = elements.legend

/**
 * <meter>
 * Represents either a scalar value within a known range or a fractional value.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meter
 *
 */
export const meter = elements.meter

/**
 * <optgroup>
 * Creates a grouping of options within a <select> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/optgroup
 *
 */
export const optgroup = elements.optgroup

/**
 * <option>
 * Used to define an item contained in a select, an <optgroup>, or a <datalist> element. As such, <option> can represent menu items in popups and other lists of items in an HTML document.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/option
 *
 */
export const option = elements.option

/**
 * <output>
 * Container element into which a site or app can inject the results of a calculation or the outcome of a user action.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/output
 *
 */
export const output = elements.output

/**
 * <progress>
 * Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress
 *
 */
export const progress = elements.progress

/**
 * <select>
 * Represents a control that provides a menu of options.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select
 *
 */
export const select = elements.select

/**
 * <textarea>
 * Represents a multi-line plain-text editing control, useful when you want to allow users to enter a sizeable amount of free-form text, for example, a comment on a review or feedback form.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/textarea
 *
 */
export const textarea = elements.textarea

/**
 * <details>
 * Creates a disclosure widget in which information is visible only when the widget is toggled into an "open" state. A summary or label must be provided using the <summary> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details
 *
 */
export const details = elements.details

/**
 * <dialog>
 * Represents a dialog box or other interactive component, such as a dismissible alert, inspector, or subwindow.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog
 *
 */
export const dialog = elements.dialog

/**
 * <summary>
 * Specifies a summary, caption, or legend for a details element's disclosure box. Clicking the <summary> element toggles the state of the parent <details> element open and closed.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/summary
 *
 */
export const summary = elements.summary

/**
 * <slot>
 * Part of the Web Components technology suite, this element is a placeholder inside a web component that you can fill with your own markup, which lets you create separate DOM trees and present them together.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/slot
 *
 */
export const slot = elements.slot

/**
 * <template>
 * A mechanism for holding HTML that is not to be rendered immediately when a page is loaded but may be instantiated subsequently during runtime using JavaScript.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/template
 *
 */
export const template = elements.template

/**
 * <image>
 * An ancient and poorly supported precursor to the <img> element. It should not be used.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/image
 *
 */
export const image = elements.image

/**
 * <rb>
 * Used to delimit the base text component of a ruby annotation, i.e., the text that is being annotated. One <rb> element should wrap each separate atomic segment of the base text.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/rb
 *
 */
export const rb = elements.rb

/**
 * <rtc>
 * Embraces semantic annotations of characters presented in a ruby of <rb> elements used inside of <ruby> element. <rb> elements can have both pronunciation (<rt>) and semantic (<rtc>) annotations.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/rtc
 *
 */
export const rtc = elements.rtc

/**
 * The <animate> SVG element provides a way to animate an attribute of an element over time.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animate
 *
 */
export const animate = elements.animate

/**
 * The <animateMotion> SVG element provides a way to define how an element moves along a motion path.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animateMotion
 *
 */
export const animateMotion = elements.animateMotion

/**
 * The <animateTransform> SVG element animates a transformation attribute on its target element, thereby allowing animations to control translation, scaling, rotation, and/or skewing.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animateTransform
 *
 */
export const animateTransform = elements.animateTransform

/**
 * The <mpath> SVG sub-element for the <animateMotion> element provides the ability to reference an external <path> element as the definition of a motion path.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/mpath
 *
 */
export const mpath = elements.mpath

/**
 * The <set> SVG element provides a method of setting the value of an attribute for a specified duration.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/set
 *
 */
export const set = elements.set

/**
 * The <circle> SVG element is an SVG basic shape, used to draw circles based on a center point and a radius.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/circle
 *
 */
export const circle = elements.circle

/**
 * The <ellipse> SVG element is an SVG basic shape, used to create ellipses based on a center coordinate, and both their x and y radius.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/ellipse
 *
 */
export const ellipse = elements.ellipse

/**
 * The <line> SVG element is an SVG basic shape used to create a line connecting two points.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/line
 *
 */
export const line = elements.line

/**
 * The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/path
 *
 */
export const path = elements.path

/**
 * The <polygon> SVG element defines a closed shape consisting of a set of connected straight line segments. The last point is connected to the first point.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/polygon
 *
 */
export const polygon = elements.polygon

/**
 * The <polyline> SVG element is an SVG basic shape that creates straight lines connecting several points. Typically a polyline is used to create open shapes as the last point doesn't have to be connected to the first point. For closed shapes see the <polygon> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/polyline
 *
 */
export const polyline = elements.polyline

/**
 * The <rect> SVG element is a basic SVG shape that draws rectangles, defined by their position, width, and height. The rectangles may have their corners rounded.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/rect
 *
 */
export const rect = elements.rect

/**
 * The <defs> SVG element is used to store graphical objects that will be used at a later time. Objects created inside a <defs> element are not rendered directly. To display them you have to reference them (with a <use> element for example).
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/defs
 *
 */
export const defs = elements.defs

/**
 * The <g> SVG element is a container used to group other SVG elements.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/g
 *
 */
export const g = elements.g

/**
 * The <marker> SVG element defines a graphic used for drawing arrowheads or polymarkers on a given <path>, <line>, <polyline> or <polygon> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/marker
 *
 */
export const marker = elements.marker

/**
 * The <mask> SVG element defines a mask for compositing the current object into the background. A mask is used/referenced using the mask property and CSS mask-image property.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/mask
 *
 */
export const mask = elements.mask

/**
 * The <pattern> SVG element defines a graphics object which can be redrawn at repeated x- and y-coordinate intervals ("tiled") to cover an area.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/pattern
 *
 */
export const pattern = elements.pattern

/**
 * The <svg> SVG element is a container that defines a new coordinate system and viewport. It is used as the outermost element of SVG documents, but it can also be used to embed an SVG fragment inside an SVG or HTML document.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/svg
 *
 */
export const svg = elements.svg

/**
 * The <switch> SVG element evaluates any requiredFeatures, requiredExtensions and systemLanguage attributes on its direct child elements in order, and then renders the first child where these attributes evaluate to true.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/switch
 *
 */
export const svgswitch = elements.switch

/**
 * The <symbol> SVG element is used to define graphical template objects which can be instantiated by a <use> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/symbol
 *
 */
export const symbol = elements.symbol

/**
 * The <use> element takes nodes from within an SVG document, and duplicates them somewhere else. The effect is the same as if the nodes were deeply cloned into a non-exposed DOM, then pasted where the <use> element is, much like cloned <template> elements.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/use
 *
 */
export const use = elements.use

/**
 * The <desc> SVG element provides an accessible, long-text description of any SVG container element or graphics element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/desc
 *
 */
export const desc = elements.desc

/**
 * The <metadata> SVG element adds metadata to SVG content. Metadata is structured information about data. The contents of <metadata> should be elements from other XML namespaces such as RDF, FOAF, etc.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/metadata
 *
 */
export const metadata = elements.metadata

/**
 * The <filter> SVG element defines a custom filter effect by grouping atomic filter primitives. It is never rendered itself, but must be used by the filter attribute on SVG elements, or the filter CSS property for SVG/HTML elements.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/filter
 *
 */
export const filter = elements.filter

/**
 * The <feBlend> SVG filter primitive composes two objects together ruled by a certain blending mode. This is similar to what is known from image editing software when blending two layers. The mode is defined by the mode attribute.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feBlend
 *
 */
export const feBlend = elements.feBlend

/**
 * The <feColorMatrix> SVG filter element changes colors based on a transformation matrix. Every pixel's color value [R,G,B,A] is matrix multiplied by a 5 by 5 color matrix to create new color [R',G',B',A'].
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feColorMatrix
 *
 */
export const feColorMatrix = elements.feColorMatrix

/**
 * The <feComponentTransfer> SVG filter primitive performs color-component-wise remapping of data for each pixel. It allows operations like brightness adjustment, contrast adjustment, color balance or thresholding.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feComponentTransfer
 *
 */
export const feComponentTransfer = elements.feComponentTransfer

/**
 * The <feComposite> SVG filter primitive performs the combination of two input images pixel-wise in image space using one of the Porter-Duff compositing operations: over, in, atop, out, xor, lighter, or arithmetic.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feComposite
 *
 */
export const feComposite = elements.feComposite

/**
 * The <feConvolveMatrix> SVG filter primitive applies a matrix convolution filter effect. A convolution combines pixels in the input image with neighboring pixels to produce a resulting image. A wide variety of imaging operations can be achieved through convolutions, including blurring, edge detection, sharpening, embossing and beveling.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feConvolveMatrix
 *
 */
export const feConvolveMatrix = elements.feConvolveMatrix

/**
 * The <feDiffuseLighting> SVG filter primitive lights an image using the alpha channel as a bump map. The resulting image, which is an RGBA opaque image, depends on the light color, light position and surface geometry of the input bump map.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDiffuseLighting
 *
 */
export const feDiffuseLighting = elements.feDiffuseLighting

/**
 * The <feDisplacementMap> SVG filter primitive uses the pixel values from the image from in2 to spatially displace the image from in.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDisplacementMap
 *
 */
export const feDisplacementMap = elements.feDisplacementMap

/**
 * The <feDistantLight> SVG filter primitive defines a distant light source that can be used within a lighting filter primitive: <feDiffuseLighting> or <feSpecularLighting>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDistantLight
 *
 */
export const feDistantLight = elements.feDistantLight

/**
 * The <feDropShadow> SVG filter primitive creates a drop shadow of the input image. It can only be used inside a <filter> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDropShadow
 *
 */
export const feDropShadow = elements.feDropShadow

/**
 * The <feFlood> SVG filter primitive fills the filter subregion with the color and opacity defined by flood-color and flood-opacity.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFlood
 *
 */
export const feFlood = elements.feFlood

/**
 * The <feFuncA> SVG filter primitive defines the transfer function for the alpha component of the input graphic of its parent <feComponentTransfer> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFuncA
 *
 */
export const feFuncA = elements.feFuncA

/**
 * The <feFuncB> SVG filter primitive defines the transfer function for the blue component of the input graphic of its parent <feComponentTransfer> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFuncB
 *
 */
export const feFuncB = elements.feFuncB

/**
 * The <feFuncG> SVG filter primitive defines the transfer function for the green component of the input graphic of its parent <feComponentTransfer> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFuncG
 *
 */
export const feFuncG = elements.feFuncG

/**
 * The <feFuncR> SVG filter primitive defines the transfer function for the red component of the input graphic of its parent <feComponentTransfer> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFuncR
 *
 */
export const feFuncR = elements.feFuncR

/**
 * The <feGaussianBlur> SVG filter primitive blurs the input image by the amount specified in stdDeviation, which defines the bell-curve.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feGaussianBlur
 *
 */
export const feGaussianBlur = elements.feGaussianBlur

/**
 * The <feImage> SVG filter primitive fetches image data from an external source and provides the pixel data as output (meaning if the external source is an SVG image, it is rasterized.)
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feImage
 *
 */
export const feImage = elements.feImage

/**
 * The <feMerge> SVG element allows filter effects to be applied concurrently instead of sequentially. This is achieved by other filters storing their output via the result attribute and then accessing it in a <feMergeNode> child.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feMerge
 *
 */
export const feMerge = elements.feMerge

/**
 * The <feMergeNode> SVG takes the result of another filter to be processed by its parent <feMerge>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feMergeNode
 *
 */
export const feMergeNode = elements.feMergeNode

/**
 * The <feMorphology> SVG filter primitive is used to erode or dilate the input image. Its usefulness lies especially in fattening or thinning effects.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feMorphology
 *
 */
export const feMorphology = elements.feMorphology

/**
 * The <feOffset> SVG filter primitive enables offsetting an input image relative to its current position. The input image as a whole is offset by the values specified in the dx and dy attributes.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feOffset
 *
 */
export const feOffset = elements.feOffset

/**
 * The <fePointLight> SVG filter primitive defines a light source which allows to create a point light effect. It that can be used within a lighting filter primitive: <feDiffuseLighting> or <feSpecularLighting>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/fePointLight
 *
 */
export const fePointLight = elements.fePointLight

/**
 * The <feSpecularLighting> SVG filter primitive lights a source graphic using the alpha channel as a bump map. The resulting image is an RGBA image based on the light color. The lighting calculation follows the standard specular component of the Phong lighting model. The resulting image depends on the light color, light position and surface geometry of the input bump map. The result of the lighting calculation is added. The filter primitive assumes that the viewer is at infinity in the z direction.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feSpecularLighting
 *
 */
export const feSpecularLighting = elements.feSpecularLighting

/**
 * The <feSpotLight> SVG filter primitive defines a light source that can be used to create a spotlight effect. It is used within a lighting filter primitive: <feDiffuseLighting> or <feSpecularLighting>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feSpotLight
 *
 */
export const feSpotLight = elements.feSpotLight

/**
 * The <feTile> SVG filter primitive allows to fill a target rectangle with a repeated, tiled pattern of an input image. The effect is similar to the one of a <pattern>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTile
 *
 */
export const feTile = elements.feTile

/**
 * The <feTurbulence> SVG filter primitive creates an image using the Perlin turbulence function. It allows the synthesis of artificial textures like clouds or marble. The resulting image will fill the entire filter primitive subregion.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence
 *
 */
export const feTurbulence = elements.feTurbulence

/**
 * The <linearGradient> SVG element lets authors define linear gradients to apply to other SVG elements.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/linearGradient
 *
 */
export const linearGradient = elements.linearGradient

/**
 * The <radialGradient> SVG element lets authors define radial gradients that can be applied to fill or stroke of graphical elements.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/radialGradient
 *
 */
export const radialGradient = elements.radialGradient

/**
 * The <stop> SVG element defines a color and its position to use on a gradient. This element is always a child of a <linearGradient> or <radialGradient> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/stop
 *
 */
export const stop = elements.stop

/**
 * The <foreignObject> SVG element includes elements from a different XML namespace. In the context of a browser, it is most likely (X)HTML.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/foreignObject
 *
 */
export const foreignObject = elements.foreignObject

/**
 * The <text> SVG element draws a graphics element consisting of text. It's possible to apply a gradient, pattern, clipping path, mask, or filter to <text>, like any other SVG graphics element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/text
 *
 */
export const text = elements.text

/**
 * The <textPath> SVG element is used to render text along the shape of a <path> element. The text must be enclosed in the <textPath> element and its href attribute is used to reference the desired <path>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/textPath
 *
 */
export const textPath = elements.textPath

/**
 * The <tspan> SVG element defines a subtext within a <text> element or another <tspan> element. It allows for adjustment of the style and/or position of that subtext as needed.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/tspan
 *
 */
export const tspan = elements.tspan

/**
 * The <view> SVG element defines a particular view of an SVG document. A specific view can be displayed by referencing the <view> element's id as the target fragment of a URL.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/view
 *
 */
export const view = elements.view

// TODO: MathML
// https://developer.mozilla.org/en-US/docs/Web/MathML/Reference/Element
