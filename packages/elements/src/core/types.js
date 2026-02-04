import { htmlTagNames, svgTagNames } from './tags.js'

/**
 * Primitive values that can be serialized as HTML/SVG attribute values.
 *
 * Note: the runtime assigns most props via `setAttribute`, so strings are the
 * canonical representation. Numbers/booleans are accepted for convenience and
 * are coerced by the DOM.
 *
 * @typedef {string | number | boolean | null | undefined}
 *   ElementsAttributeValue
 */

/**
 * Inline style object applied via `Object.assign(el.style, style)`.
 *
 * @typedef {Partial<CSSStyleDeclaration> & Record<string, string | number>}
 *   ElementsStyleObject
 */

/**
 * A vnode is a declarative array of the form:
 *
 * ```js
 * [tag, props, ...children]
 * ```
 *
 * @typedef {[tag: string, props: ElementsProps, ...children: ElementsChild[]]}
 *   ElementsVNode
 */

/**
 * Child nodes are plain values, nested arrays, or vnodes.
 *
 * Note: nested arrays are treated as children values (they are not
 * automatically flattened).
 *
 * @typedef {ElementsVNode | string | number | boolean | null | undefined
 *   | any[]} ElementsChild
 */

/**
 * Props for the `ontick` animation hook.
 *
 * `ontick` is not a DOM event. It runs once per animation frame and can thread
 * context across ticks:
 *
 * ```js
 * ontick: (el, ctx = { t: 0 }, dt) => ({ ...ctx, t: ctx.t + dt })
 * ```
 *
 * The handler must be synchronous; thrown errors stop ticking.
 *
 * @callback ElementsOnTick
 * @param {Element} el
 * @param {any} ctx
 * @param {number} dtMs
 * @returns {any | void}
 */

/**
 * If an event handler returns a vnode array, the UI updates by replacing the
 * nearest component boundary. Otherwise the event is treated as passive.
 *
 * @typedef {ElementsVNode | void | null | false | '' | 0} ElementsEventResult
 * @typedef {ElementsEventResult | Promise<ElementsEventResult>}
 *   ElementsMaybeAsyncEventResult
 */

/**
 * @template {Event} Evt
 * @callback ElementsEventHandler
 * @param {Evt} event
 * @returns {ElementsMaybeAsyncEventResult}
 */

/**
 * Form event handlers receive `(elements, event)`.
 *
 * @template {Event} FormEvt
 * @callback ElementsFormEventHandler
 * @param {any} elements
 * @param {FormEvt} event
 * @returns {ElementsMaybeAsyncEventResult}
 */

/**
 * Common global HTML attributes.
 *
 * This is a permissive shared set: some attributes only apply to certain
 * elements in the HTML spec, but Elements.js accepts them everywhere because
 * the underlying DOM will ignore irrelevant attributes.
 *
 * This is not exhaustive; `data-*` and `aria-*` are supported via template
 * keys below.
 *
 * @typedef {{
 *   id?: string,
 *   class?: string,
 *   title?: string,
 *   role?: string,
 *   name?: string,
 *   part?: string,
 *   slot?: string,
 *   exportparts?: string,
 *   nonce?: string,
 *   elementtiming?: string,
 *   contentsecuritypolicy?: string,
 *   popovertarget?: string,
 *   popovertargetaction?: 'toggle' | 'show' | 'hide',
 *   autocapitalize?:
 *     | 'none'
 *     | 'sentences'
 *     | 'words'
 *     | 'characters'
 *     | 'on'
 *     | 'off',
 *   enterkeyhint?:
 *     | 'enter'
 *     | 'done'
 *     | 'go'
 *     | 'next'
 *     | 'previous'
 *     | 'search'
 *     | 'send',
 *   inputmode?:
 *     | 'none'
 *     | 'text'
 *     | 'tel'
 *     | 'url'
 *     | 'email'
 *     | 'numeric'
 *     | 'decimal'
 *     | 'search',
 *   virtualkeyboardpolicy?: 'auto' | 'manual',
 *   draggable?: boolean,
 *   hidden?: boolean,
 *   inert?: boolean,
 *   spellcheck?: boolean,
 *   tabindex?: number | string,
 *   accesskey?: string,
 *   translate?: 'yes' | 'no',
 *   autocorrect?: 'on' | 'off',
 *   autocomplete?: string,
 *   lang?: string,
 *   dir?: 'ltr' | 'rtl' | 'auto',
 *   is?: string,
 *   writingsuggestions?: 'true' | 'false' | boolean,
 *   contenteditable?: 'true' | 'false' | 'plaintext-only' | boolean,
 *   autofocus?: boolean,
 *   popover?: 'auto' | 'manual',
 *   label?: string,
 *   itemscope?: boolean,
 *   itemtype?: string,
 *   itemid?: string,
 *   itemprop?: string,
 *   itemref?: string,
 *   vocab?: string,
 *   typeof?: string,
 *   property?: string,
 *   resource?: string,
 *   prefix?: string,
 *   href?: string,
 *   hreflang?: string,
 *   referrerpolicy?: string,
 *   target?: string,
 *   rel?: string,
 *   download?: string,
 *   ping?: string,
 *   src?: string,
 *   srcset?: string,
 *   sizes?: string,
 *   imagesrcset?: string,
 *   imagesizes?: string,
 *   alt?: string,
 *   width?: number | string,
 *   height?: number | string,
 *   type?: string,
 *   content?: string,
 *   placeholder?: string,
 *   required?: boolean,
 *   readonly?: boolean,
 *   minlength?: number | string,
 *   maxlength?: number | string,
 *   min?: number | string,
 *   max?: number | string,
 *   step?: number | string,
 *   pattern?: string,
 *   accept?: string,
 *   for?: string,
 *   action?: string,
 *   method?: string,
 *   enctype?: string,
 *   novalidate?: boolean,
 *   formaction?: string,
 *   formenctype?: string,
 *   formmethod?: string,
 *   formnovalidate?: boolean,
 *   formtarget?: string,
 *   rows?: number | string,
 *   cols?: number | string,
 *   wrap?: string,
 *   list?: string,
 *   async?: boolean,
 *   defer?: boolean,
 *   nomodule?: boolean,
 *   crossorigin?: '' | 'anonymous' | 'use-credentials',
 *   integrity?: string,
 *   fetchpriority?: 'auto' | 'high' | 'low',
 *   loading?: 'lazy' | 'eager',
 *   decoding?: 'sync' | 'async' | 'auto',
 *   media?: string,
 *   as?: string,
 *   controls?: boolean,
 *   controlslist?: string,
 *   autoplay?: boolean,
 *   loop?: boolean,
 *   playsinline?: boolean,
 *   preload?: 'none' | 'metadata' | 'auto',
 *   poster?: string
 * }} ElementsGlobalAttributes
 */

/**
 * @typedef {{ [key: `data-${string}`]: ElementsAttributeValue }}
 *   ElementsDataAttributes
 */

/**
 * @typedef {{ [key: `aria-${string}`]: ElementsAttributeValue }}
 *   ElementsAriaAttributes
 */

/**
 * Dash-cased attributes commonly used by custom elements and utilities.
 *
 * @typedef {{ [key: `${string}-${string}`]: ElementsAttributeValue }}
 *   ElementsDashedAttributes
 */

/**
 * DOM event handler props.
 *
 * @typedef {Omit<{
 *   [K in keyof GlobalEventHandlersEventMap as `on${K}`]?:
 *     ElementsEventHandler<GlobalEventHandlersEventMap[K]>
 * }, 'oninput' | 'onsubmit' | 'onchange'> & {
 *   oninput?: ElementsFormEventHandler<InputEvent | Event>,
 *   onsubmit?: ElementsFormEventHandler<SubmitEvent | Event>,
 *   onchange?: ElementsFormEventHandler<Event>
 * }} ElementsEventProps
 */

/**
 * Special (non-attribute) props supported by Elements.js.
 *
 * Note: some props are assigned as DOM properties (when present on the target
 * element) rather than attributes: `value`, `checked`, `selected`, `disabled`,
 * `multiple`, `muted`, `volume`, `currentTime`, `playbackRate`, `open`,
 * `indeterminate`.
 *
 * @typedef {{
 *   style?: ElementsStyleObject,
 *   innerHTML?: string,
 *   ontick?: ElementsOnTick,
 *   value?: string | number,
 *   checked?: boolean,
 *   selected?: boolean,
 *   disabled?: boolean,
 *   multiple?: boolean,
 *   muted?: boolean,
 *   volume?: number,
 *   currentTime?: number,
 *   playbackRate?: number,
 *   open?: boolean,
 *   indeterminate?: boolean
 * }} ElementsSpecialProps
 */

/**
 * Props accepted by all Elements.js tag helpers.
 *
 * @typedef {ElementsGlobalAttributes
 *   & ElementsDataAttributes
 *   & ElementsAriaAttributes
 *   & ElementsDashedAttributes
 *   & ElementsEventProps
 *   & ElementsSpecialProps
 * } ElementsProps
 */

/**
 * @template {ElementsProps} P
 * @callback ElementsElementHelper
 * @param {P | ElementsChild} [propsOrChild]
 * @param {...ElementsChild} children
 * @returns {ElementsVNode}
 */

/**
 * @typedef {typeof htmlTagNames[number]} ElementsHtmlTagName
 */

/**
 * @typedef {typeof svgTagNames[number]} ElementsSvgTagName
 */

/**
 * @typedef {ElementsHtmlTagName | ElementsSvgTagName} ElementsTagName
 */

/**
 * Props for `<a>`.
 *
 * @typedef {ElementsProps & {
 *   href?: string,
 *   target?: string,
 *   rel?: string,
 *   download?: string
 * }} ElementsAnchorProps
 */

/**
 * Props for `<img>`.
 *
 * @typedef {ElementsProps & {
 *   src?: string,
 *   alt?: string,
 *   loading?: 'lazy' | 'eager',
 *   decoding?: 'sync' | 'async' | 'auto',
 *   referrerpolicy?: string
 * }} ElementsImgProps
 */

/**
 * Props for `<input>`.
 *
 * @typedef {ElementsProps & {
 *   type?: string,
 *   name?: string,
 *   placeholder?: string,
 *   required?: boolean,
 *   readonly?: boolean,
 *   minlength?: number | string,
 *   maxlength?: number | string,
 *   min?: number | string,
 *   max?: number | string,
 *   step?: number | string,
 *   pattern?: string,
 *   accept?: string,
 *   autocomplete?: string
 * }} ElementsInputProps
 */

/**
 * Props for `<form>`.
 *
 * @typedef {ElementsProps & {
 *   action?: string,
 *   method?: string,
 *   enctype?: string,
 *   novalidate?: boolean
 * }} ElementsFormProps
 */

/**
 * Props for `<button>`.
 *
 * @typedef {ElementsProps & {
 *   type?: 'button' | 'submit' | 'reset' | string,
 *   name?: string,
 *   value?: string | number,
 *   disabled?: boolean
 * }} ElementsButtonProps
 */

/**
 * Props for `<textarea>`.
 *
 * @typedef {ElementsProps & {
 *   name?: string,
 *   rows?: number | string,
 *   cols?: number | string,
 *   wrap?: string,
 *   placeholder?: string,
 *   required?: boolean,
 *   readonly?: boolean,
 *   minlength?: number | string,
 *   maxlength?: number | string
 * }} ElementsTextareaProps
 */

/**
 * Props for `<select>`.
 *
 * @typedef {ElementsProps & {
 *   name?: string,
 *   required?: boolean,
 *   multiple?: boolean
 * }} ElementsSelectProps
 */

/**
 * Props for `<option>`.
 *
 * @typedef {ElementsProps & {
 *   value?: string | number,
 *   selected?: boolean,
 *   disabled?: boolean
 * }} ElementsOptionProps
 */

/**
 * Props for `<script>`.
 *
 * @typedef {ElementsProps & {
 *   src?: string,
 *   type?: string,
 *   async?: boolean,
 *   defer?: boolean,
 *   nomodule?: boolean,
 *   crossorigin?: '' | 'anonymous' | 'use-credentials',
 *   integrity?: string
 * }} ElementsScriptProps
 */

/**
 * Props for `<link>`.
 *
 * @typedef {ElementsProps & {
 *   href?: string,
 *   rel?: string,
 *   as?: string,
 *   type?: string,
 *   media?: string,
 *   crossorigin?: '' | 'anonymous' | 'use-credentials',
 *   integrity?: string,
 *   referrerpolicy?: string,
 *   fetchpriority?: 'auto' | 'high' | 'low'
 * }} ElementsLinkProps
 */

/**
 * Props for `<meta>`.
 *
 * @typedef {ElementsProps & {
 *   name?: string,
 *   content?: string,
 *   charset?: string,
 *   'http-equiv'?: string
 * }} ElementsMetaProps
 */

/**
 * Props for `<video>` and `<audio>`.
 *
 * @typedef {ElementsProps & {
 *   src?: string,
 *   controls?: boolean,
 *   controlslist?: string,
 *   autoplay?: boolean,
 *   loop?: boolean,
 *   muted?: boolean,
 *   playsinline?: boolean,
 *   preload?: 'none' | 'metadata' | 'auto'
 * }} ElementsMediaProps
 */

/**
 * Props for `<source>`.
 *
 * @typedef {ElementsProps & {
 *   src?: string,
 *   type?: string,
 *   srcset?: string,
 *   sizes?: string,
 *   media?: string
 * }} ElementsSourceProps
 */

/**
 * Props for `<svg>`.
 *
 * @typedef {ElementsProps & {
 *   viewBox?: string,
 *   xmlns?: string,
 *   fill?: string,
 *   stroke?: string,
 *   'stroke-width'?: number | string
 * }} ElementsSvgProps
 */

/**
 * Props for `<path>`.
 *
 * @typedef {ElementsProps & {
 *   d?: string,
 *   fill?: string,
 *   stroke?: string,
 *   'stroke-width'?: number | string
 * }} ElementsPathProps
 */

/**
 * Props for `<circle>`.
 *
 * @typedef {ElementsProps & {
 *   cx?: number | string,
 *   cy?: number | string,
 *   r?: number | string,
 *   fill?: string,
 *   stroke?: string,
 *   'stroke-width'?: number | string
 * }} ElementsCircleProps
 */

/**
 * Props for `<rect>`.
 *
 * @typedef {ElementsProps & {
 *   x?: number | string,
 *   y?: number | string,
 *   rx?: number | string,
 *   ry?: number | string,
 *   width?: number | string,
 *   height?: number | string,
 *   fill?: string,
 *   stroke?: string,
 *   'stroke-width'?: number | string
 * }} ElementsRectProps
 */

/**
 * Props for `<line>`.
 *
 * @typedef {ElementsProps & {
 *   x1?: number | string,
 *   y1?: number | string,
 *   x2?: number | string,
 *   y2?: number | string,
 *   stroke?: string,
 *   'stroke-width'?: number | string
 * }} ElementsLineProps
 */

/**
 * Props for `<text>` (SVG).
 *
 * Note: X3D also has a `text` node; it is exported as `x3dtext` in `/3d`.
 *
 * @typedef {ElementsProps & {
 *   x?: number | string,
 *   y?: number | string,
 *   dx?: number | string,
 *   dy?: number | string,
 *   rotate?: number | string,
 *   'text-anchor'?: string
 * }} ElementsSvgTextProps
 */

/**
 * Props for `<label>`.
 *
 * @typedef {ElementsProps & {
 *   for?: string,
 *   form?: string
 * }} ElementsLabelProps
 */

/**
 * Props for `<dialog>`.
 *
 * @typedef {ElementsProps & {
 *   open?: boolean
 * }} ElementsDialogProps
 */

/**
 * Props for `<details>`.
 *
 * @typedef {ElementsProps & {
 *   open?: boolean
 * }} ElementsDetailsProps
 */

/**
 * Props for `<progress>`.
 *
 * @typedef {ElementsProps & {
 *   value?: number | string,
 *   max?: number | string
 * }} ElementsProgressProps
 */

/**
 * Props for `<meter>`.
 *
 * @typedef {ElementsProps & {
 *   value?: number | string,
 *   min?: number | string,
 *   max?: number | string,
 *   low?: number | string,
 *   high?: number | string,
 *   optimum?: number | string
 * }} ElementsMeterProps
 */

/**
 * Props for `<iframe>`.
 *
 * @typedef {ElementsProps & {
 *   src?: string,
 *   srcdoc?: string,
 *   name?: string,
 *   allow?: string,
 *   sandbox?: string,
 *   referrerpolicy?: string,
 *   loading?: 'lazy' | 'eager',
 *   allowfullscreen?: boolean
 * }} ElementsIframeProps
 */

/**
 * Props for `<canvas>`.
 *
 * @typedef {ElementsProps & {
 *   width?: number | string,
 *   height?: number | string
 * }} ElementsCanvasProps
 */

/**
 * @template {ElementsTagName} Tag
 * @typedef {Tag extends 'a' ? ElementsAnchorProps
 *   : Tag extends 'img' ? ElementsImgProps
 *     : Tag extends 'input' ? ElementsInputProps
 *       : Tag extends 'form' ? ElementsFormProps
 *         : Tag extends 'button' ? ElementsButtonProps
 *           : Tag extends 'textarea' ? ElementsTextareaProps
 *             : Tag extends 'select' ? ElementsSelectProps
 *               : Tag extends 'option' ? ElementsOptionProps
 *                 : Tag extends 'script' ? ElementsScriptProps
 *                   : Tag extends 'link' ? ElementsLinkProps
 *                     : Tag extends 'meta' ? ElementsMetaProps
 *                       : Tag extends 'video' ? ElementsMediaProps
 *                         : Tag extends 'audio' ? ElementsMediaProps
 *                           : Tag extends 'source' ? ElementsSourceProps
 *                             : Tag extends 'svg' ? ElementsSvgProps
 *                               : Tag extends 'path' ? ElementsPathProps
 *                                 : Tag extends 'circle' ? ElementsCircleProps
 *                                   : Tag extends 'rect' ? ElementsRectProps
 *                                     : Tag extends 'line' ? ElementsLineProps
 *                                       : Tag extends 'text'
 *                                         ? ElementsSvgTextProps
 *                                         : Tag extends 'label'
 *                                           ? ElementsLabelProps
 *                                           : Tag extends 'dialog'
 *                                             ? ElementsDialogProps
 *                                             : Tag extends 'details'
 *                                               ? ElementsDetailsProps
 *                                               : Tag extends 'progress'
 *                                                 ? ElementsProgressProps
 *                                                 : Tag extends 'meter'
 *                                                   ? ElementsMeterProps
 *                                                   : Tag extends 'iframe'
 *                                                     ? ElementsIframeProps
 *                                                     : Tag extends 'canvas'
 *                                                       ? ElementsCanvasProps
 *                             : ElementsProps} ElementsPropsForTag
 */

/**
 * All tag helpers, with per-tag prop typing when known.
 *
 * @typedef {{ fragment: ElementsElementHelper<ElementsProps> } & {
 *   [K in ElementsTagName]: ElementsElementHelper<ElementsPropsForTag<K>>
 * }} ElementsElementMap
 */

/**
 * Aliases (short names) for Types-as-Docs.
 *
 * These are convenience names for editor DX. The `Elements*` names remain the
 * canonical internal names.
 *
 * @typedef {ElementsProps} ElementProps
 */

/**
 * @template {ElementProps} P
 * @typedef {ElementsElementHelper<P>} ElementHelper
 */

/**
 * @typedef {ElementsElementMap} ElementMap
 */
