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
export const DEBUG: boolean;
export function render(vtree: any, container?: HTMLElement | null): void;
export function component(fn: (...args: any[]) => any): (...args: any[]) => any;
/**
 * @typedef {Record<string, any>} Props
 * @typedef {any[] | string | number | boolean | null | undefined | Node} Child
 * @typedef {any[]} VNode
 *
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
 *
 * @callback ElementHelper
 * @param {Props | Child} [propsOrChild]
 * @param {...Child} children
 * @returns {VNode}
 *
 * @type {Record<string, ElementHelper>}
 */
export const elements: Record<string, ElementHelper>;
/**
 * <html>
 * Represents the root (top-level element) of an HTML document, so it is also referred to as the root element. All other elements must be descendants of this element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/html
 *
 * @type {ElementHelper}
 */
export const html: ElementHelper;
/**
 * <base>
 * Specifies the base URL to use for all relative URLs in a document. There can be only one such element in a document.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/base
 *
 * @type {ElementHelper}
 */
export const base: ElementHelper;
/**
 * <head>
 * Contains machine-readable information (metadata) about the document, like its title, scripts, and style sheets.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/head
 *
 * @type {ElementHelper}
 */
export const head: ElementHelper;
/**
 * <link>
 * Specifies relationships between the current document and an external resource. This element is most commonly used to link to CSS but is also used to establish site icons (both "favicon" style icons and icons for the home screen and apps on mobile devices) among other things.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/link
 *
 * @type {ElementHelper}
 */
export const link: ElementHelper;
/**
 * <meta>
 * Represents metadata that cannot be represented by other HTML meta-related elements, like <base>, <link>, <script>, <style> and <title>.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta
 *
 * @type {ElementHelper}
 */
export const meta: ElementHelper;
/**
 * <style>
 * Contains style information for a document or part of a document. It contains CSS, which is applied to the contents of the document containing this element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/style
 *
 * @type {ElementHelper}
 */
export const style: ElementHelper;
/**
 * <title>
 * Defines the document's title that is shown in a browser's title bar or a page's tab. It only contains text; HTML tags within the element, if any, are also treated as plain text.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/title
 *
 * @type {ElementHelper}
 */
export const title: ElementHelper;
/**
 * <body>
 * Represents the content of an HTML document. There can be only one such element in a document.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/body
 *
 * @type {ElementHelper}
 */
export const body: ElementHelper;
/**
 * <address>
 * Indicates that the enclosed HTML provides contact information for a person or people, or for an organization.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/address
 *
 * @type {ElementHelper}
 */
export const address: ElementHelper;
/**
 * <article>
 * Represents a self-contained composition in a document, page, application, or site, which is intended to be independently distributable or reusable (e.g., in syndication). Examples include a forum post, a magazine or newspaper article, a blog entry, a product card, a user-submitted comment, an interactive widget or gadget, or any other independent item of content.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/article
 *
 * @type {ElementHelper}
 */
export const article: ElementHelper;
/**
 * <aside>
 * Represents a portion of a document whose content is only indirectly related to the document's main content. Asides are frequently presented as sidebars or call-out boxes.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/aside
 *
 * @type {ElementHelper}
 */
export const aside: ElementHelper;
/**
 * <footer>
 * Represents a footer for its nearest ancestor sectioning content or sectioning root element. A <footer> typically contains information about the author of the section, copyright data, or links to related documents.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/footer
 *
 * @type {ElementHelper}
 */
export const footer: ElementHelper;
/**
 * <header>
 * Represents introductory content, typically a group of introductory or navigational aids. It may contain some heading elements but also a logo, a search form, an author name, and other elements.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/header
 *
 * @type {ElementHelper}
 */
export const header: ElementHelper;
/**
 * <h1>
 * There are six levels of section headings. <h1> is the highest section level and <h6> is the lowest.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/h1
 *
 * @type {ElementHelper}
 */
export const h1: ElementHelper;
/**
 * <h2>
 * There are six levels of section headings. <h1> is the highest section level and <h6> is the lowest.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/h2
 *
 * @type {ElementHelper}
 */
export const h2: ElementHelper;
/**
 * <h3>
 * There are six levels of section headings. <h1> is the highest section level and <h6> is the lowest.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/h3
 *
 * @type {ElementHelper}
 */
export const h3: ElementHelper;
/**
 * <h4>
 * There are six levels of section headings. <h1> is the highest section level and <h6> is the lowest.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/h4
 *
 * @type {ElementHelper}
 */
export const h4: ElementHelper;
/**
 * <h5>
 * There are six levels of section headings. <h1> is the highest section level and <h6> is the lowest.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/h5
 *
 * @type {ElementHelper}
 */
export const h5: ElementHelper;
/**
 * <h6>
 * There are six levels of section headings. <h1> is the highest section level and <h6> is the lowest.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/h6
 *
 * @type {ElementHelper}
 */
export const h6: ElementHelper;
/**
 * <hgroup>
 * Represents a heading grouped with any secondary content, such as subheadings, an alternative title, or a tagline.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/hgroup
 *
 * @type {ElementHelper}
 */
export const hgroup: ElementHelper;
/**
 * <main>
 * Represents the dominant content of the body of a document. The main content area consists of content that is directly related to or expands upon the central topic of a document, or the central functionality of an application.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/main
 *
 * @type {ElementHelper}
 */
export const main: ElementHelper;
/**
 * <nav>
 * Represents a section of a page whose purpose is to provide navigation links, either within the current document or to other documents. Common examples of navigation sections are menus, tables of contents, and indexes.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/nav
 *
 * @type {ElementHelper}
 */
export const nav: ElementHelper;
/**
 * <section>
 * Represents a generic standalone section of a document, which doesn't have a more specific semantic element to represent it. Sections should always have a heading, with very few exceptions.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/section
 *
 * @type {ElementHelper}
 */
export const section: ElementHelper;
/**
 * <search>
 * Represents a part that contains a set of form controls or other content related to performing a search or filtering operation.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/search
 *
 * @type {ElementHelper}
 */
export const search: ElementHelper;
/**
 * <blockquote>
 * Indicates that the enclosed text is an extended quotation. Usually, this is rendered visually by indentation. A URL for the source of the quotation may be given using the cite attribute, while a text representation of the source can be given using the <cite> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/blockquote
 *
 * @type {ElementHelper}
 */
export const blockquote: ElementHelper;
/**
 * <dd>
 * Provides the description, definition, or value for the preceding term (<dt>) in a description list (<dl>).
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dd
 *
 * @type {ElementHelper}
 */
export const dd: ElementHelper;
/**
 * <div>
 * The generic container for flow content. It has no effect on the content or layout until styled in some way using CSS (e.g., styling is directly applied to it, or some kind of layout model like flexbox is applied to its parent element).
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/div
 *
 * @type {ElementHelper}
 */
export const div: ElementHelper;
/**
 * <dl>
 * Represents a description list. The element encloses a list of groups of terms (specified using the <dt> element) and descriptions (provided by <dd> elements). Common uses for this element are to implement a glossary or to display metadata (a list of key-value pairs).
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dl
 *
 * @type {ElementHelper}
 */
export const dl: ElementHelper;
/**
 * <dt>
 * Specifies a term in a description or definition list, and as such must be used inside a <dl> element. It is usually followed by a <dd> element; however, multiple <dt> elements in a row indicate several terms that are all defined by the immediate next <dd> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dt
 *
 * @type {ElementHelper}
 */
export const dt: ElementHelper;
/**
 * <figcaption>
 * Represents a caption or legend describing the rest of the contents of its parent <figure> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/figcaption
 *
 * @type {ElementHelper}
 */
export const figcaption: ElementHelper;
/**
 * <figure>
 * Represents self-contained content, potentially with an optional caption, which is specified using the <figcaption> element. The figure, its caption, and its contents are referenced as a single unit.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/figure
 *
 * @type {ElementHelper}
 */
export const figure: ElementHelper;
/**
 * <hr>
 * Represents a thematic break between paragraph-level elements: for example, a change of scene in a story, or a shift of topic within a section.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/hr
 *
 * @type {ElementHelper}
 */
export const hr: ElementHelper;
/**
 * <li>
 * Represents an item in a list. It must be contained in a parent element: an ordered list (<ol>), an unordered list (<ul>), or a menu (<menu>). In menus and unordered lists, list items are usually displayed using bullet points. In ordered lists, they are usually displayed with an ascending counter on the left, such as a number or letter.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/li
 *
 * @type {ElementHelper}
 */
export const li: ElementHelper;
/**
 * <menu>
 * A semantic alternative to <ul>, but treated by browsers (and exposed through the accessibility tree) as no different than <ul>. It represents an unordered list of items (which are represented by <li> elements).
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/menu
 *
 * @type {ElementHelper}
 */
export const menu: ElementHelper;
/**
 * <ol>
 * Represents an ordered list of items — typically rendered as a numbered list.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ol
 *
 * @type {ElementHelper}
 */
export const ol: ElementHelper;
/**
 * <p>
 * Represents a paragraph. Paragraphs are usually represented in visual media as blocks of text separated from adjacent blocks by blank lines and/or first-line indentation, but HTML paragraphs can be any structural grouping of related content, such as images or form fields.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/p
 *
 * @type {ElementHelper}
 */
export const p: ElementHelper;
/** ')
 * <pre>
 * Represents preformatted text which is to be presented exactly as written in the HTML file. The text is typically rendered using a non-proportional, or monospaced, font. Whitespace inside this element is displayed as written.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/pre
 *
 * @type {ElementHelper}
 */
export const pre: ElementHelper;
/**
 * <ul>
 * Represents an unordered list of items, typically rendered as a bulleted list.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ul
 *
 * @type {ElementHelper}
 */
export const ul: ElementHelper;
/**
 * <a>
 * Together with its href attribute, creates a hyperlink to web pages, files, email addresses, locations within the current page, or anything else a URL can address.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a
 *
 * @type {ElementHelper}
 */
export const a: ElementHelper;
/**
 * <abbr>
 * Represents an abbreviation or acronym.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/abbr
 *
 * @type {ElementHelper}
 */
export const abbr: ElementHelper;
/**
 * <b>
 * Used to draw the reader's attention to the element's contents, which are not otherwise granted special importance. This was formerly known as the Boldface element, and most browsers still draw the text in boldface. However, you should not use <b> for styling text or granting importance. If you wish to create boldface text, you should use the CSS font-weight property. If you wish to indicate an element is of special importance, you should use the <strong> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/b
 *
 * @type {ElementHelper}
 */
export const b: ElementHelper;
/**
 * <bdi>
 * Tells the browser's bidirectional algorithm to treat the text it contains in isolation from its surrounding text. It's particularly useful when a website dynamically inserts some text and doesn't know the directionality of the text being inserted.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/bdi
 *
 * @type {ElementHelper}
 */
export const bdi: ElementHelper;
/**
 * <bdo>
 * Overrides the current directionality of text, so that the text within is rendered in a different direction.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/bdo
 *
 * @type {ElementHelper}
 */
export const bdo: ElementHelper;
/**
 * <br>
 * Produces a line break in text (carriage-return). It is useful for writing a poem or an address, where the division of lines is significant.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/br
 *
 * @type {ElementHelper}
 */
export const br: ElementHelper;
/**
 * <cite>
 * Used to mark up the title of a creative work. The reference may be in an abbreviated form according to context-appropriate conventions related to citation metadata.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/cite
 *
 * @type {ElementHelper}
 */
export const cite: ElementHelper;
/**
 * <code>
 * Displays its contents styled in a fashion intended to indicate that the text is a short fragment of computer code. By default, the content text is displayed using the user agent's default monospace font.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/code
 *
 * @type {ElementHelper}
 */
export const code: ElementHelper;
/**
 * <data>
 * Links a given piece of content with a machine-readable translation. If the content is time- or date-related, the <time> element must be used.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/data
 *
 * @type {ElementHelper}
 */
export const data: ElementHelper;
/**
 * <dfn>
 * Used to indicate the term being defined within the context of a definition phrase or sentence. The ancestor <p> element, the <dt>/<dd> pairing, or the nearest section ancestor of the <dfn> element, is considered to be the definition of the term.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dfn
 *
 * @type {ElementHelper}
 */
export const dfn: ElementHelper;
/**
 * <em>
 * Marks text that has stress emphasis. The <em> element can be nested, with each nesting level indicating a greater degree of emphasis.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/em
 *
 * @type {ElementHelper}
 */
export const em: ElementHelper;
/**
 * <i>
 * Represents a range of text that is set off from the normal text for some reason, such as idiomatic text, technical terms, and taxonomical designations, among others. Historically, these have been presented using italicized type, which is the original source of the <i> naming of this element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/i
 *
 * @type {ElementHelper}
 */
export const i: ElementHelper;
/**
 * <kbd>
 * Represents a span of inline text denoting textual user input from a keyboard, voice input, or any other text entry device. By convention, the user agent defaults to rendering the contents of a <kbd> element using its default monospace font, although this is not mandated by the HTML standard.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/kbd
 *
 * @type {ElementHelper}
 */
export const kbd: ElementHelper;
/**
 * <mark>
 * Represents text which is marked or highlighted for reference or notation purposes due to the marked passage's relevance in the enclosing context.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/mark
 *
 * @type {ElementHelper}
 */
export const mark: ElementHelper;
/**
 * <q>
 * Indicates that the enclosed text is a short inline quotation. Most modern browsers implement this by surrounding the text in quotation marks. This element is intended for short quotations that don't require paragraph breaks; for long quotations use the <blockquote> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/q>
 *
 * @type {ElementHelper}
 */
export const q: ElementHelper;
/**
 * <rp>
 * Used to provide fall-back parentheses for browsers that do not support the display of ruby annotations using the <ruby> element. One <rp> element should enclose each of the opening and closing parentheses that wrap the <rt> element that contains the annotation's text.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/rp
 *
 * @type {ElementHelper}
 */
export const rp: ElementHelper;
/**
 * <rt>
 * Specifies the ruby text component of a ruby annotation, which is used to provide pronunciation, translation, or transliteration information for East Asian typography. The <rt> element must always be contained within a <ruby> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/rt
 *
 * @type {ElementHelper}
 */
export const rt: ElementHelper;
/**
 * <ruby>
 * Represents small annotations that are rendered above, below, or next to base text, usually used for showing the pronunciation of East Asian characters. It can also be used for annotating other kinds of text, but this usage is less common.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ruby
 *
 * @type {ElementHelper}
 */
export const ruby: ElementHelper;
/**
 * <s>
 * Renders text with a strikethrough, or a line through it. Use the <s> element to represent things that are no longer relevant or no longer accurate. However, <s> is not appropriate when indicating document edits; for that, use the <del> and <ins> elements, as appropriate.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/s
 *
 * @type {ElementHelper}
 */
export const s: ElementHelper;
/**
 * <samp>
 * Used to enclose inline text which represents sample (or quoted) output from a computer program. Its contents are typically rendered using the browser's default monospaced font (such as Courier or Lucida Console).
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/samp
 *
 * @type {ElementHelper}
 */
export const samp: ElementHelper;
/**
 * <small>
 * Represents side-comments and small print, like copyright and legal text, independent of its styled presentation. By default, it renders text within it one font size smaller, such as from small to x-small.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/small
 *
 * @type {ElementHelper}
 */
export const small: ElementHelper;
/**
 * <span>
 * A generic inline container for phrasing content, which does not inherently represent anything. It can be used to group elements for styling purposes (using the class or id attributes), or because they share attribute values, such as lang. It should be used only when no other semantic element is appropriate. <span> is very much like a div element, but div is a block-level element whereas a <span> is an inline-level element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/span
 *
 * @type {ElementHelper}
 */
export const span: ElementHelper;
/**
 * <strong>
 * Indicates that its contents have strong importance, seriousness, or urgency. Browsers typically render the contents in bold type.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/strong
 *
 * @type {ElementHelper}
 */
export const strong: ElementHelper;
/**
 * <sub>
 * Specifies inline text which should be displayed as subscript for solely typographical reasons. Subscripts are typically rendered with a lowered baseline using smaller text.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/sub
 *
 * @type {ElementHelper}
 */
export const sub: ElementHelper;
/**
 * <sup>
 * Specifies inline text which is to be displayed as superscript for solely typographical reasons. Superscripts are usually rendered with a raised baseline using smaller text.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/sup
 *
 * @type {ElementHelper}
 */
export const sup: ElementHelper;
/**
 * <time>
 * Represents a specific period in time. It may include the datetime attribute to translate dates into machine-readable format, allowing for better search engine results or custom features such as reminders.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/time
 *
 * @type {ElementHelper}
 */
export const time: ElementHelper;
/**
 * <u>
 * Represents a span of inline text which should be rendered in a way that indicates that it has a non-textual annotation. This is rendered by default as a single solid underline but may be altered using CSS.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/u
 *
 * @type {ElementHelper}
 */
export const u: ElementHelper;
/**
 * <var>
 * Represents the name of a variable in a mathematical expression or a programming context. It's typically presented using an italicized version of the current typeface, although that behavior is browser-dependent.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/var
 *
 * @type {ElementHelper}
 */
export const htmlvar: ElementHelper;
/**
 * <wbr>
 * Represents a word break opportunity—a position within text where the browser may optionally break a line, though its line-breaking rules would not otherwise create a break at that location.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/wbr
 *
 * @type {ElementHelper}
 */
export const wbr: ElementHelper;
/**
 * <area>
 * Defines an area inside an image map that has predefined clickable areas. An image map allows geometric areas on an image to be associated with hyperlink.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/area
 *
 * @type {ElementHelper}
 */
export const area: ElementHelper;
/**
 * <audio>
 * Used to embed sound content in documents. It may contain one or more audio sources, represented using the src attribute or the source element: the browser will choose the most suitable one. It can also be the destination for streamed media, using a MediaStream.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/audio
 *
 * @type {ElementHelper}
 */
export const audio: ElementHelper;
/**
 * <img>
 * Embeds an image into the document.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img
 *
 * @type {ElementHelper}
 */
export const img: ElementHelper;
/**
 * <map>
 * Used with <area> elements to define an image map (a clickable link area).
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/map
 *
 * @type {ElementHelper}
 */
export const map: ElementHelper;
/**
 * <track>
 * Used as a child of the media elements, audio and video. It lets you specify timed text tracks (or time-based data), for example to automatically handle subtitles. The tracks are formatted in WebVTT format (.vtt files)—Web Video Text Tracks.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/track
 *
 * @type {ElementHelper}
 */
export const track: ElementHelper;
/**
 * <video>
 * Embeds a media player which supports video playback into the document. You can also use <video> for audio content, but the audio element may provide a more appropriate user experience.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video
 *
 * @type {ElementHelper}
 */
export const video: ElementHelper;
/**
 * <embed>
 * Embeds external content at the specified point in the document. This content is provided by an external application or other source of interactive content such as a browser plug-in.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/embed
 *
 * @type {ElementHelper}
 */
export const embed: ElementHelper;
/**
 * <iframe>
 * Represents a nested browsing context, embedding another HTML page into the current one.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe
 *
 * @type {ElementHelper}
 */
export const iframe: ElementHelper;
/**
 * <object>
 * Represents an external resource, which can be treated as an image, a nested browsing context, or a resource to be handled by a plugin.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/object
 *
 * @type {ElementHelper}
 */
export const object: ElementHelper;
/**
 * <picture>
 * Contains zero or more <source> elements and one <img> element to offer alternative versions of an image for different display/device scenarios.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture
 *
 * @type {ElementHelper}
 */
export const picture: ElementHelper;
/**
 * <source>
 * Specifies multiple media resources for the picture, the audio element, or the video element. It is a void element, meaning that it has no content and does not have a closing tag. It is commonly used to offer the same media content in multiple file formats in order to provide compatibility with a broad range of browsers given their differing support for image file formats and media file formats.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/source
 *
 * @type {ElementHelper}
 */
export const source: ElementHelper;
/**
 * <canvas>
 * Container element to use with either the canvas scripting API or the WebGL API to draw graphics and animations.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/canvas
 *
 * @type {ElementHelper}
 */
export const canvas: ElementHelper;
/**
 * <noscript>
 * Defines a section of HTML to be inserted if a script type on the page is unsupported or if scripting is currently turned off in the browser.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/noscript
 *
 * @type {ElementHelper}
 */
export const noscript: ElementHelper;
/**
 * <script>
 * Used to embed executable code or data; this is typically used to embed or refer to JavaScript code. The <script> element can also be used with other languages, such as WebGL's GLSL shader programming language and JSON.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script
 *
 * @type {ElementHelper}
 */
export const script: ElementHelper;
/**
 * <del>
 * Represents a range of text that has been deleted from a document. This can be used when rendering "track changes" or source code diff information, for example. The <ins> element can be used for the opposite purpose: to indicate text that has been added to the document.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/del
 *
 * @type {ElementHelper}
 */
export const del: ElementHelper;
/**
 * <ins>
 * Represents a range of text that has been added to a document. You can use the <del> element to similarly represent a range of text that has been deleted from the document.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ins
 *
 * @type {ElementHelper}
 */
export const ins: ElementHelper;
/**
 * <caption>
 * Specifies the caption (or title) of a table.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/caption
 *
 * @type {ElementHelper}
 */
export const caption: ElementHelper;
/**
 * <col>
 * Defines one or more columns in a column group represented by its implicit or explicit parent <colgroup> element. The <col> element is only valid as a child of a <colgroup> element that has no span attribute defined.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/col
 *
 * @type {ElementHelper}
 */
export const col: ElementHelper;
/**
 * <colgroup>
 * Defines a group of columns within a table.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/colgroup
 *
 * @type {ElementHelper}
 */
export const colgroup: ElementHelper;
/**
 * <table>
 * Represents tabular data—that is, information presented in a two-dimensional table comprised of rows and columns of cells containing data.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/table
 *
 * @type {ElementHelper}
 */
export const table: ElementHelper;
/**
 * <tbody>
 * Encapsulates a set of table rows (<tr> elements), indicating that they comprise the body of a table's (main) data.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tbody
 *
 * @type {ElementHelper}
 */
export const tbody: ElementHelper;
/**
 * <td>
 * A child of the <tr> element, it defines a cell of a table that contains data.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/td
 *
 * @type {ElementHelper}
 */
export const td: ElementHelper;
/**
 * <tfoot>
 * Encapsulates a set of table rows (<tr> elements), indicating that they comprise the foot of a table with information about the table's columns. This is usually a summary of the columns, e.g., a sum of the given numbers in a column.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tfoot
 *
 * @type {ElementHelper}
 */
export const tfoot: ElementHelper;
/**
 * <th>
 * A child of the <tr> element, it defines a cell as the header of a group of table cells. The nature of this group can be explicitly defined by the scope and headers attributes.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/th
 *
 * @type {ElementHelper}
 */
export const th: ElementHelper;
/**
 * <thead>
 * Encapsulates a set of table rows (<tr> elements), indicating that they comprise the head of a table with information about the table's columns. This is usually in the form of column headers (<th> elements).
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/thead
 *
 * @type {ElementHelper}
 */
export const thead: ElementHelper;
/**
 * <tr>
 * Defines a row of cells in a table. The row's cells can then be established using a mix of <td> (data cell) and <th> (header cell) elements.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tr
 *
 * @type {ElementHelper}
 */
export const tr: ElementHelper;
/**
 * <button>
 * An interactive element activated by a user with a mouse, keyboard, finger, voice command, or other assistive technology. Once activated, it performs an action, such as submitting a form or opening a dialog.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button
 *
 * @type {ElementHelper}
 */
export const button: ElementHelper;
/**
 * <datalist>
 * Contains a set of <option> elements that represent the permissible or recommended options available to choose from within other controls.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/datalist
 *
 * @type {ElementHelper}
 */
export const datalist: ElementHelper;
/**
 * <fieldset>
 * Used to group several controls as well as labels (<label>) within a web form.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fieldset
 *
 * @type {ElementHelper}
 */
export const fieldset: ElementHelper;
/**
 * <form>
 * Represents a document section containing interactive controls for submitting information.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form
 *
 * @type {ElementHelper}
 */
export const form: ElementHelper;
/**
 * <input>
 * Used to create interactive controls for web-based forms to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent. The <input> element is one of the most powerful and complex in all of HTML due to the sheer number of combinations of input types and attributes.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input
 *
 * @type {ElementHelper}
 */
export const input: ElementHelper;
/**
 * <label>
 * Represents a caption for an item in a user interface.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label
 *
 * @type {ElementHelper}
 */
export const label: ElementHelper;
/**
 * <legend>
 * Represents a caption for the content of its parent <fieldset>.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/legend
 *
 * @type {ElementHelper}
 */
export const legend: ElementHelper;
/**
 * <meter>
 * Represents either a scalar value within a known range or a fractional value.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meter
 *
 * @type {ElementHelper}
 */
export const meter: ElementHelper;
/**
 * <optgroup>
 * Creates a grouping of options within a <select> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/optgroup
 *
 * @type {ElementHelper}
 */
export const optgroup: ElementHelper;
/**
 * <option>
 * Used to define an item contained in a select, an <optgroup>, or a <datalist> element. As such, <option> can represent menu items in popups and other lists of items in an HTML document.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/option
 *
 * @type {ElementHelper}
 */
export const option: ElementHelper;
/**
 * <output>
 * Container element into which a site or app can inject the results of a calculation or the outcome of a user action.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/output
 *
 * @type {ElementHelper}
 */
export const output: ElementHelper;
/**
 * <progress>
 * Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress
 *
 * @type {ElementHelper}
 */
export const progress: ElementHelper;
/**
 * <select>
 * Represents a control that provides a menu of options.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select
 *
 * @type {ElementHelper}
 */
export const select: ElementHelper;
/**
 * <textarea>
 * Represents a multi-line plain-text editing control, useful when you want to allow users to enter a sizeable amount of free-form text, for example, a comment on a review or feedback form.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/textarea
 *
 * @type {ElementHelper}
 */
export const textarea: ElementHelper;
/**
 * <details>
 * Creates a disclosure widget in which information is visible only when the widget is toggled into an "open" state. A summary or label must be provided using the <summary> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details
 *
 * @type {ElementHelper}
 */
export const details: ElementHelper;
/**
 * <dialog>
 * Represents a dialog box or other interactive component, such as a dismissible alert, inspector, or subwindow.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog
 *
 * @type {ElementHelper}
 */
export const dialog: ElementHelper;
/**
 * <summary>
 * Specifies a summary, caption, or legend for a details element's disclosure box. Clicking the <summary> element toggles the state of the parent <details> element open and closed.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/summary
 *
 * @type {ElementHelper}
 */
export const summary: ElementHelper;
/**
 * <slot>
 * Part of the Web Components technology suite, this element is a placeholder inside a web component that you can fill with your own markup, which lets you create separate DOM trees and present them together.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/slot
 *
 * @type {ElementHelper}
 */
export const slot: ElementHelper;
/**
 * <template>
 * A mechanism for holding HTML that is not to be rendered immediately when a page is loaded but may be instantiated subsequently during runtime using JavaScript.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/template
 *
 * @type {ElementHelper}
 */
export const template: ElementHelper;
/**
 * <image>
 * An ancient and poorly supported precursor to the <img> element. It should not be used.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/image
 *
 * @type {ElementHelper}
 */
export const image: ElementHelper;
/**
 * <rb>
 * Used to delimit the base text component of a ruby annotation, i.e., the text that is being annotated. One <rb> element should wrap each separate atomic segment of the base text.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/rb
 *
 * @type {ElementHelper}
 */
export const rb: ElementHelper;
/**
 * <rtc>
 * Embraces semantic annotations of characters presented in a ruby of <rb> elements used inside of <ruby> element. <rb> elements can have both pronunciation (<rt>) and semantic (<rtc>) annotations.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/rtc
 *
 * @type {ElementHelper}
 */
export const rtc: ElementHelper;
/**
 * The <animate> SVG element provides a way to animate an attribute of an element over time.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animate
 *
 * @type {ElementHelper}
 */
export const animate: ElementHelper;
/**
 * The <animateMotion> SVG element provides a way to define how an element moves along a motion path.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animateMotion
 *
 * @type {ElementHelper}
 */
export const animateMotion: ElementHelper;
/**
 * The <animateTransform> SVG element animates a transformation attribute on its target element, thereby allowing animations to control translation, scaling, rotation, and/or skewing.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animateTransform
 *
 * @type {ElementHelper}
 */
export const animateTransform: ElementHelper;
/**
 * The <mpath> SVG sub-element for the <animateMotion> element provides the ability to reference an external <path> element as the definition of a motion path.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/mpath
 *
 * @type {ElementHelper}
 */
export const mpath: ElementHelper;
/**
 * The <set> SVG element provides a method of setting the value of an attribute for a specified duration.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/set
 *
 * @type {ElementHelper}
 */
export const set: ElementHelper;
/**
 * The <circle> SVG element is an SVG basic shape, used to draw circles based on a center point and a radius.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/circle
 *
 * @type {ElementHelper}
 */
export const circle: ElementHelper;
/**
 * The <ellipse> SVG element is an SVG basic shape, used to create ellipses based on a center coordinate, and both their x and y radius.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/ellipse
 *
 * @type {ElementHelper}
 */
export const ellipse: ElementHelper;
/**
 * The <line> SVG element is an SVG basic shape used to create a line connecting two points.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/line
 *
 * @type {ElementHelper}
 */
export const line: ElementHelper;
/**
 * The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/path
 *
 * @type {ElementHelper}
 */
export const path: ElementHelper;
/**
 * The <polygon> SVG element defines a closed shape consisting of a set of connected straight line segments. The last point is connected to the first point.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/polygon
 *
 * @type {ElementHelper}
 */
export const polygon: ElementHelper;
/**
 * The <polyline> SVG element is an SVG basic shape that creates straight lines connecting several points. Typically a polyline is used to create open shapes as the last point doesn't have to be connected to the first point. For closed shapes see the <polygon> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/polyline
 *
 * @type {ElementHelper}
 */
export const polyline: ElementHelper;
/**
 * The <rect> SVG element is a basic SVG shape that draws rectangles, defined by their position, width, and height. The rectangles may have their corners rounded.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/rect
 *
 * @type {ElementHelper}
 */
export const rect: ElementHelper;
/**
 * The <defs> SVG element is used to store graphical objects that will be used at a later time. Objects created inside a <defs> element are not rendered directly. To display them you have to reference them (with a <use> element for example).
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/defs
 *
 * @type {ElementHelper}
 */
export const defs: ElementHelper;
/**
 * The <g> SVG element is a container used to group other SVG elements.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/g
 *
 * @type {ElementHelper}
 */
export const g: ElementHelper;
/**
 * The <marker> SVG element defines a graphic used for drawing arrowheads or polymarkers on a given <path>, <line>, <polyline> or <polygon> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/marker
 *
 * @type {ElementHelper}
 */
export const marker: ElementHelper;
/**
 * The <mask> SVG element defines a mask for compositing the current object into the background. A mask is used/referenced using the mask property and CSS mask-image property.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/mask
 *
 * @type {ElementHelper}
 */
export const mask: ElementHelper;
/**
 * The <pattern> SVG element defines a graphics object which can be redrawn at repeated x- and y-coordinate intervals ("tiled") to cover an area.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/pattern
 *
 * @type {ElementHelper}
 */
export const pattern: ElementHelper;
/**
 * The <svg> SVG element is a container that defines a new coordinate system and viewport. It is used as the outermost element of SVG documents, but it can also be used to embed an SVG fragment inside an SVG or HTML document.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/svg
 *
 * @type {ElementHelper}
 */
export const svg: ElementHelper;
/**
 * The <switch> SVG element evaluates any requiredFeatures, requiredExtensions and systemLanguage attributes on its direct child elements in order, and then renders the first child where these attributes evaluate to true.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/switch
 *
 * @type {ElementHelper}
 */
export const svgswitch: ElementHelper;
/**
 * The <symbol> SVG element is used to define graphical template objects which can be instantiated by a <use> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/symbol
 *
 * @type {ElementHelper}
 */
export const symbol: ElementHelper;
/**
 * The <use> element takes nodes from within an SVG document, and duplicates them somewhere else. The effect is the same as if the nodes were deeply cloned into a non-exposed DOM, then pasted where the <use> element is, much like cloned <template> elements.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/use
 *
 * @type {ElementHelper}
 */
export const use: ElementHelper;
/**
 * The <desc> SVG element provides an accessible, long-text description of any SVG container element or graphics element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/desc
 *
 * @type {ElementHelper}
 */
export const desc: ElementHelper;
/**
 * The <metadata> SVG element adds metadata to SVG content. Metadata is structured information about data. The contents of <metadata> should be elements from other XML namespaces such as RDF, FOAF, etc.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/metadata
 *
 * @type {ElementHelper}
 */
export const metadata: ElementHelper;
/**
 * The <filter> SVG element defines a custom filter effect by grouping atomic filter primitives. It is never rendered itself, but must be used by the filter attribute on SVG elements, or the filter CSS property for SVG/HTML elements.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/filter
 *
 * @type {ElementHelper}
 */
export const filter: ElementHelper;
/**
 * The <feBlend> SVG filter primitive composes two objects together ruled by a certain blending mode. This is similar to what is known from image editing software when blending two layers. The mode is defined by the mode attribute.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feBlend
 *
 * @type {ElementHelper}
 */
export const feBlend: ElementHelper;
/**
 * The <feColorMatrix> SVG filter element changes colors based on a transformation matrix. Every pixel's color value [R,G,B,A] is matrix multiplied by a 5 by 5 color matrix to create new color [R',G',B',A'].
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feColorMatrix
 *
 * @type {ElementHelper}
 */
export const feColorMatrix: ElementHelper;
/**
 * The <feComponentTransfer> SVG filter primitive performs color-component-wise remapping of data for each pixel. It allows operations like brightness adjustment, contrast adjustment, color balance or thresholding.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feComponentTransfer
 *
 * @type {ElementHelper}
 */
export const feComponentTransfer: ElementHelper;
/**
 * The <feComposite> SVG filter primitive performs the combination of two input images pixel-wise in image space using one of the Porter-Duff compositing operations: over, in, atop, out, xor, lighter, or arithmetic.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feComposite
 *
 * @type {ElementHelper}
 */
export const feComposite: ElementHelper;
/**
 * The <feConvolveMatrix> SVG filter primitive applies a matrix convolution filter effect. A convolution combines pixels in the input image with neighboring pixels to produce a resulting image. A wide variety of imaging operations can be achieved through convolutions, including blurring, edge detection, sharpening, embossing and beveling.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feConvolveMatrix
 *
 * @type {ElementHelper}
 */
export const feConvolveMatrix: ElementHelper;
/**
 * The <feDiffuseLighting> SVG filter primitive lights an image using the alpha channel as a bump map. The resulting image, which is an RGBA opaque image, depends on the light color, light position and surface geometry of the input bump map.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDiffuseLighting
 *
 * @type {ElementHelper}
 */
export const feDiffuseLighting: ElementHelper;
/**
 * The <feDisplacementMap> SVG filter primitive uses the pixel values from the image from in2 to spatially displace the image from in.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDisplacementMap
 *
 * @type {ElementHelper}
 */
export const feDisplacementMap: ElementHelper;
/**
 * The <feDistantLight> SVG filter primitive defines a distant light source that can be used within a lighting filter primitive: <feDiffuseLighting> or <feSpecularLighting>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDistantLight
 *
 * @type {ElementHelper}
 */
export const feDistantLight: ElementHelper;
/**
 * The <feDropShadow> SVG filter primitive creates a drop shadow of the input image. It can only be used inside a <filter> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDropShadow
 *
 * @type {ElementHelper}
 */
export const feDropShadow: ElementHelper;
/**
 * The <feFlood> SVG filter primitive fills the filter subregion with the color and opacity defined by flood-color and flood-opacity.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFlood
 *
 * @type {ElementHelper}
 */
export const feFlood: ElementHelper;
/**
 * The <feFuncA> SVG filter primitive defines the transfer function for the alpha component of the input graphic of its parent <feComponentTransfer> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFuncA
 *
 * @type {ElementHelper}
 */
export const feFuncA: ElementHelper;
/**
 * The <feFuncB> SVG filter primitive defines the transfer function for the blue component of the input graphic of its parent <feComponentTransfer> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFuncB
 *
 * @type {ElementHelper}
 */
export const feFuncB: ElementHelper;
/**
 * The <feFuncG> SVG filter primitive defines the transfer function for the green component of the input graphic of its parent <feComponentTransfer> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFuncG
 *
 * @type {ElementHelper}
 */
export const feFuncG: ElementHelper;
/**
 * The <feFuncR> SVG filter primitive defines the transfer function for the red component of the input graphic of its parent <feComponentTransfer> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFuncR
 *
 * @type {ElementHelper}
 */
export const feFuncR: ElementHelper;
/**
 * The <feGaussianBlur> SVG filter primitive blurs the input image by the amount specified in stdDeviation, which defines the bell-curve.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feGaussianBlur
 *
 * @type {ElementHelper}
 */
export const feGaussianBlur: ElementHelper;
/**
 * The <feImage> SVG filter primitive fetches image data from an external source and provides the pixel data as output (meaning if the external source is an SVG image, it is rasterized.)
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feImage
 *
 * @type {ElementHelper}
 */
export const feImage: ElementHelper;
/**
 * The <feMerge> SVG element allows filter effects to be applied concurrently instead of sequentially. This is achieved by other filters storing their output via the result attribute and then accessing it in a <feMergeNode> child.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feMerge
 *
 * @type {ElementHelper}
 */
export const feMerge: ElementHelper;
/**
 * The <feMergeNode> SVG takes the result of another filter to be processed by its parent <feMerge>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feMergeNode
 *
 * @type {ElementHelper}
 */
export const feMergeNode: ElementHelper;
/**
 * The <feMorphology> SVG filter primitive is used to erode or dilate the input image. Its usefulness lies especially in fattening or thinning effects.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feMorphology
 *
 * @type {ElementHelper}
 */
export const feMorphology: ElementHelper;
/**
 * The <feOffset> SVG filter primitive enables offsetting an input image relative to its current position. The input image as a whole is offset by the values specified in the dx and dy attributes.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feOffset
 *
 * @type {ElementHelper}
 */
export const feOffset: ElementHelper;
/**
 * The <fePointLight> SVG filter primitive defines a light source which allows to create a point light effect. It that can be used within a lighting filter primitive: <feDiffuseLighting> or <feSpecularLighting>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/fePointLight
 *
 * @type {ElementHelper}
 */
export const fePointLight: ElementHelper;
/**
 * The <feSpecularLighting> SVG filter primitive lights a source graphic using the alpha channel as a bump map. The resulting image is an RGBA image based on the light color. The lighting calculation follows the standard specular component of the Phong lighting model. The resulting image depends on the light color, light position and surface geometry of the input bump map. The result of the lighting calculation is added. The filter primitive assumes that the viewer is at infinity in the z direction.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feSpecularLighting
 *
 * @type {ElementHelper}
 */
export const feSpecularLighting: ElementHelper;
/**
 * The <feSpotLight> SVG filter primitive defines a light source that can be used to create a spotlight effect. It is used within a lighting filter primitive: <feDiffuseLighting> or <feSpecularLighting>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feSpotLight
 *
 * @type {ElementHelper}
 */
export const feSpotLight: ElementHelper;
/**
 * The <feTile> SVG filter primitive allows to fill a target rectangle with a repeated, tiled pattern of an input image. The effect is similar to the one of a <pattern>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTile
 *
 * @type {ElementHelper}
 */
export const feTile: ElementHelper;
/**
 * The <feTurbulence> SVG filter primitive creates an image using the Perlin turbulence function. It allows the synthesis of artificial textures like clouds or marble. The resulting image will fill the entire filter primitive subregion.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence
 *
 * @type {ElementHelper}
 */
export const feTurbulence: ElementHelper;
/**
 * The <linearGradient> SVG element lets authors define linear gradients to apply to other SVG elements.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/linearGradient
 *
 * @type {ElementHelper}
 */
export const linearGradient: ElementHelper;
/**
 * The <radialGradient> SVG element lets authors define radial gradients that can be applied to fill or stroke of graphical elements.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/radialGradient
 *
 * @type {ElementHelper}
 */
export const radialGradient: ElementHelper;
/**
 * The <stop> SVG element defines a color and its position to use on a gradient. This element is always a child of a <linearGradient> or <radialGradient> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/stop
 *
 * @type {ElementHelper}
 */
export const stop: ElementHelper;
/**
 * The <foreignObject> SVG element includes elements from a different XML namespace. In the context of a browser, it is most likely (X)HTML.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/foreignObject
 *
 * @type {ElementHelper}
 */
export const foreignObject: ElementHelper;
/**
 * The <text> SVG element draws a graphics element consisting of text. It's possible to apply a gradient, pattern, clipping path, mask, or filter to <text>, like any other SVG graphics element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/text
 *
 * @type {ElementHelper}
 */
export const text: ElementHelper;
/**
 * The <textPath> SVG element is used to render text along the shape of a <path> element. The text must be enclosed in the <textPath> element and its href attribute is used to reference the desired <path>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/textPath
 *
 * @type {ElementHelper}
 */
export const textPath: ElementHelper;
/**
 * The <tspan> SVG element defines a subtext within a <text> element or another <tspan> element. It allows for adjustment of the style and/or position of that subtext as needed.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/tspan
 *
 * @type {ElementHelper}
 */
export const tspan: ElementHelper;
/**
 * The <view> SVG element defines a particular view of an SVG document. A specific view can be displayed by referencing the <view> element's id as the target fragment of a URL.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/view
 *
 * @type {ElementHelper}
 */
export const view: ElementHelper;
/**
 * Maps vnode instances to their current root DOM element,
 * allowing accurate replacement when the same vnode is re-invoked.
 */
export type ElementsInternalNode = {
    [k: string]: any;
    __root?: boolean;
    __vnode?: any[];
};
export type Props = Record<string, any>;
export type Child = any[] | string | number | boolean | null | undefined | Node;
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
export type VNode = any[];
export type ElementHelper = (propsOrChild?: Props | Child, ...children: Child[]) => VNode;
