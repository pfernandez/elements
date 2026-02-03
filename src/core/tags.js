/** @internal */
export const htmlTagNames = [
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

/** @internal */
export const svgTagNames = [
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
