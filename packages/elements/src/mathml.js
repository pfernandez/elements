/**
 * MathML tag helpers (curated).
 *
 * This module is intentionally small and focused on the subset that’s useful
 * for building expression visualizers and teaching tools (e.g. Content MathML
 * trees with `<apply>`, plus a handful of Presentation MathML helpers).
 *
 * The Elements.js runtime supports rendering *any* MathML tag name as a vnode
 * (e.g. `['apply', {}, ...]`). These helpers exist for ergonomics and docs.
 */

const isPropsObject = x =>
  typeof x === 'object'
  && x !== null
  && !Array.isArray(x)
  && !(typeof Node !== 'undefined' && x instanceof Node)

/**
 * @param {string} tag
 * @returns {import('./core/types.js').ElementsElementHelper<any>}
 */
const createTagHelper = tag => (...args) => {
  const hasFirstArg = args.length > 0
  const [propsOrChild, ...children] = args
  const props = hasFirstArg && isPropsObject(propsOrChild) ? propsOrChild : {}
  const actualChildren = !hasFirstArg
    ? []
    : props === propsOrChild
      ? children
      : [propsOrChild, ...children]
  return /** @type {import('./core/types.js').ElementsVNode} */ (
    [tag, props, ...actualChildren]
  )
}

/**
 * <math>
 * The root element of a MathML expression.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/math
 */
export const math = createTagHelper('math')

/**
 * <mrow>
 * Groups sub-expressions without introducing visible separators.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mrow
 */
export const mrow = createTagHelper('mrow')

/**
 * <mi>
 * Identifier (variable/function name).
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mi
 */
export const mi = createTagHelper('mi')

/**
 * <mo>
 * Operator (e.g. "+", "→", parentheses).
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mo
 */
export const mo = createTagHelper('mo')

/**
 * <mn>
 * Number literal.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mn
 */
export const mn = createTagHelper('mn')

/**
 * <mtext>
 * Text inside math layout.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mtext
 */
export const mtext = createTagHelper('mtext')

/**
 * <mspace>
 * Spacing control.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mspace
 */
export const mspace = createTagHelper('mspace')

/**
 * <mstyle>
 * Styling wrapper for MathML subtree.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mstyle
 */
export const mstyle = createTagHelper('mstyle')

/**
 * <menclose>
 * Encloses content (e.g. boxes, circles).
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/menclose
 */
export const menclose = createTagHelper('menclose')

/**
 * <mfenced>
 * Convenience fencing wrapper (parentheses, brackets).
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mfenced
 */
export const mfenced = createTagHelper('mfenced')

/**
 * <msup>
 * Superscript.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/msup
 */
export const msup = createTagHelper('msup')

/**
 * <msub>
 * Subscript.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/msub
 */
export const msub = createTagHelper('msub')

/**
 * <msubsup>
 * Subscript + superscript.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/msubsup
 */
export const msubsup = createTagHelper('msubsup')

/**
 * <mfrac>
 * Fraction.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mfrac
 */
export const mfrac = createTagHelper('mfrac')

/**
 * <msqrt>
 * Square root.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/msqrt
 */
export const msqrt = createTagHelper('msqrt')

/**
 * <mroot>
 * Root with explicit index.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mroot
 */
export const mroot = createTagHelper('mroot')

/**
 * <munder>
 * Under-script.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/munder
 */
export const munder = createTagHelper('munder')

/**
 * <mover>
 * Over-script.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mover
 */
export const mover = createTagHelper('mover')

/**
 * <munderover>
 * Under + over script.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/munderover
 */
export const munderover = createTagHelper('munderover')

/**
 * <mtable>
 * Table layout.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mtable
 */
export const mtable = createTagHelper('mtable')

/**
 * <mtr>
 * Table row.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mtr
 */
export const mtr = createTagHelper('mtr')

/**
 * <mtd>
 * Table cell.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/mtd
 */
export const mtd = createTagHelper('mtd')

/**
 * <semantics>
 * Attach semantic annotations to a presentation tree.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/semantics
 */
export const semantics = createTagHelper('semantics')

/**
 * <annotation>
 * A textual annotation inside <semantics>.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/annotation
 */
export const annotation = createTagHelper('annotation')

/**
 * <annotation-xml>
 * An XML annotation inside <semantics>.
 *
 * Exported as `annotationXml` because of the dash in the tag name.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/annotation-xml
 */
export const annotationXml = createTagHelper('annotation-xml')

/**
 * <apply>
 * Content MathML application node: first child is the operator, remaining
 * children are arguments.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/apply
 */
export const apply = createTagHelper('apply')

/**
 * <ci>
 * Content MathML identifier.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/ci
 */
export const ci = createTagHelper('ci')

/**
 * <cn>
 * Content MathML number.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/cn
 */
export const cn = createTagHelper('cn')

/**
 * <csymbol>
 * Content MathML symbol (often with a content dictionary via `cd`).
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/csymbol
 */
export const csymbol = createTagHelper('csymbol')

/**
 * <bind>
 * Content MathML binding node (e.g. lambda).
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/bind
 */
export const bind = createTagHelper('bind')

/**
 * <bvar>
 * Bound variable (used under <bind>).
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/bvar
 */
export const bvar = createTagHelper('bvar')

/**
 * <lambda>
 * Lambda binder operator (typically inside <bind>).
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/lambda
 */
export const lambda = createTagHelper('lambda')

/**
 * <set>
 * Content MathML set constructor (often under <apply>).
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/set
 */
export const set = createTagHelper('set')

/**
 * <list>
 * Content MathML list constructor (often under <apply>).
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/list
 */
export const list = createTagHelper('list')

/**
 * <vector>
 * Content MathML vector constructor.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/vector
 */
export const vector = createTagHelper('vector')

/**
 * <matrix>
 * Content MathML matrix constructor.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/matrix
 */
export const matrix = createTagHelper('matrix')

/**
 * <matrixrow>
 * Content MathML matrix row.
 * https://developer.mozilla.org/en-US/docs/Web/MathML/Element/matrixrow
 */
export const matrixrow = createTagHelper('matrixrow')

/**
 * A map of curated MathML helpers.
 */
export const mathml = /** @type {const} */ ({
  math,
  mrow,
  mi,
  mo,
  mn,
  mtext,
  mspace,
  mstyle,
  menclose,
  mfenced,
  msup,
  msub,
  msubsup,
  mfrac,
  msqrt,
  mroot,
  munder,
  mover,
  munderover,
  mtable,
  mtr,
  mtd,
  semantics,
  annotation,
  annotationXml,
  apply,
  ci,
  cn,
  csymbol,
  bind,
  bvar,
  lambda,
  set,
  list,
  vector,
  matrix,
  matrixrow
})

