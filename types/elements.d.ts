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
export function render(vtree: any, container?: any): void;
export function component(fn: (...args: any[]) => any): (...args: any[]) => any;
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
 *
 * @typedef {function([propsOrChild], ...children): Array} ElementHelper
 *
 * @type {Record<string, ElementHelper>}
 */
export const elements: Record<string, ElementHelper>;
/**
 * <html>
 * Represents the root (top-level element) of an HTML document, so it is also referred to as the root element. All other elements must be descendants of this element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/html
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLHtmlElement}
 */
export const html: (props?: object, ...children: (string | number | Node)[]) => HTMLHtmlElement;
/**
 * <base>
 * Specifies the base URL to use for all relative URLs in a document. There can be only one such element in a document.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/base
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLBaseElement}
 */
export const base: (props?: object, ...children: (string | number | Node)[]) => HTMLBaseElement;
/**
 * <head>
 * Contains machine-readable information (metadata) about the document, like its title, scripts, and style sheets.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/head
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLHeadElement}
 */
export const head: (props?: object, ...children: (string | number | Node)[]) => HTMLHeadElement;
/**
 * <link>
 * Specifies relationships between the current document and an external resource. This element is most commonly used to link to CSS but is also used to establish site icons (both "favicon" style icons and icons for the home screen and apps on mobile devices) among other things.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/link
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLLinkElement}
 */
export const link: (props?: object, ...children: (string | number | Node)[]) => HTMLLinkElement;
/**
 * <meta>
 * Represents metadata that cannot be represented by other HTML meta-related elements, like <base>, <link>, <script>, <style> and <title>.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLMetaElement}
 */
export const meta: (props?: object, ...children: (string | number | Node)[]) => HTMLMetaElement;
/**
 * <style>
 * Contains style information for a document or part of a document. It contains CSS, which is applied to the contents of the document containing this element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/style
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLStyleElement}
 */
export const style: (props?: object, ...children: (string | number | Node)[]) => HTMLStyleElement;
/**
 * <title>
 * Defines the document's title that is shown in a browser's title bar or a page's tab. It only contains text; HTML tags within the element, if any, are also treated as plain text.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/title
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLTitleElement}
 */
export const title: (props?: object, ...children: (string | number | Node)[]) => HTMLTitleElement;
/**
 * <body>
 * Represents the content of an HTML document. There can be only one such element in a document.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/body
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLBodyElement}
 */
export const body: (props?: object, ...children: (string | number | Node)[]) => HTMLBodyElement;
/**
 * <address>
 * Indicates that the enclosed HTML provides contact information for a person or people, or for an organization.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/address
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLAddressElement}
 */
export const address: (props?: object, ...children: (string | number | Node)[]) => HTMLAddressElement;
/**
 * <article>
 * Represents a self-contained composition in a document, page, application, or site, which is intended to be independently distributable or reusable (e.g., in syndication). Examples include a forum post, a magazine or newspaper article, a blog entry, a product card, a user-submitted comment, an interactive widget or gadget, or any other independent item of content.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/article
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLArticleElement}
 */
export const article: (props?: object, ...children: (string | number | Node)[]) => HTMLArticleElement;
/**
 * <aside>
 * Represents a portion of a document whose content is only indirectly related to the document's main content. Asides are frequently presented as sidebars or call-out boxes.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/aside
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLAsideElement}
 */
export const aside: (props?: object, ...children: (string | number | Node)[]) => HTMLAsideElement;
/**
 * <footer>
 * Represents a footer for its nearest ancestor sectioning content or sectioning root element. A <footer> typically contains information about the author of the section, copyright data, or links to related documents.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/footer
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLFooterElement}
 */
export const footer: (props?: object, ...children: (string | number | Node)[]) => HTMLFooterElement;
/**
 * <header>
 * Represents introductory content, typically a group of introductory or navigational aids. It may contain some heading elements but also a logo, a search form, an author name, and other elements.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/header
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLHeaderElement}
 */
export const header: (props?: object, ...children: (string | number | Node)[]) => HTMLHeaderElement;
/**
 * <h1>
 * There are six levels of section headings. <h1> is the highest section level and <h6> is the lowest.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/h1
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLH6Element}
 */
export const h1: (props?: object, ...children: (string | number | Node)[]) => HTMLH6Element;
/**
 * <h2>
 * There are six levels of section headings. <h1> is the highest section level and <h6> is the lowest.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/h2
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLH6Element}
 */
export const h2: (props?: object, ...children: (string | number | Node)[]) => HTMLH6Element;
/**
 * <h3>
 * There are six levels of section headings. <h1> is the highest section level and <h6> is the lowest.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/h3
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLH6Element}
 */
export const h3: (props?: object, ...children: (string | number | Node)[]) => HTMLH6Element;
/**
 * <h4>
 * There are six levels of section headings. <h1> is the highest section level and <h6> is the lowest.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/h4
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLH6Element}
 */
export const h4: (props?: object, ...children: (string | number | Node)[]) => HTMLH6Element;
/**
 * <h5>
 * There are six levels of section headings. <h1> is the highest section level and <h6> is the lowest.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/h5
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLH6Element}
 */
export const h5: (props?: object, ...children: (string | number | Node)[]) => HTMLH6Element;
/**
 * <h6>
 * There are six levels of section headings. <h1> is the highest section level and <h6> is the lowest.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/h6
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLH6Element}
 */
export const h6: (props?: object, ...children: (string | number | Node)[]) => HTMLH6Element;
/**
 * <hgroup>
 * Represents a heading grouped with any secondary content, such as subheadings, an alternative title, or a tagline.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/hgroup
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLHgroupElement}
 */
export const hgroup: (props?: object, ...children: (string | number | Node)[]) => HTMLHgroupElement;
/**
 * <main>
 * Represents the dominant content of the body of a document. The main content area consists of content that is directly related to or expands upon the central topic of a document, or the central functionality of an application.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/main
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLMainElement}
 */
export const main: (props?: object, ...children: (string | number | Node)[]) => HTMLMainElement;
/**
 * <nav>
 * Represents a section of a page whose purpose is to provide navigation links, either within the current document or to other documents. Common examples of navigation sections are menus, tables of contents, and indexes.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/nav
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLNavElement}
 */
export const nav: (props?: object, ...children: (string | number | Node)[]) => HTMLNavElement;
/**
 * <section>
 * Represents a generic standalone section of a document, which doesn't have a more specific semantic element to represent it. Sections should always have a heading, with very few exceptions.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/section
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLSectionElement}
 */
export const section: (props?: object, ...children: (string | number | Node)[]) => HTMLSectionElement;
/**
 * <search>
 * Represents a part that contains a set of form controls or other content related to performing a search or filtering operation.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/search
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLSearchElement}
 */
export const search: (props?: object, ...children: (string | number | Node)[]) => HTMLSearchElement;
/**
 * <blockquote>
 * Indicates that the enclosed text is an extended quotation. Usually, this is rendered visually by indentation. A URL for the source of the quotation may be given using the cite attribute, while a text representation of the source can be given using the <cite> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/blockquote
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLBlockquoteElement}
 */
export const blockquote: (props?: object, ...children: (string | number | Node)[]) => HTMLBlockquoteElement;
/**
 * <dd>
 * Provides the description, definition, or value for the preceding term (<dt>) in a description list (<dl>).
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dd
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLDdElement}
 */
export const dd: (props?: object, ...children: (string | number | Node)[]) => HTMLDdElement;
/**
 * <div>
 * The generic container for flow content. It has no effect on the content or layout until styled in some way using CSS (e.g., styling is directly applied to it, or some kind of layout model like flexbox is applied to its parent element).
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/div
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLDivElement}
 */
export const div: (props?: object, ...children: (string | number | Node)[]) => HTMLDivElement;
/**
 * <dl>
 * Represents a description list. The element encloses a list of groups of terms (specified using the <dt> element) and descriptions (provided by <dd> elements). Common uses for this element are to implement a glossary or to display metadata (a list of key-value pairs).
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dl
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLDlElement}
 */
export const dl: (props?: object, ...children: (string | number | Node)[]) => HTMLDlElement;
/**
 * <dt>
 * Specifies a term in a description or definition list, and as such must be used inside a <dl> element. It is usually followed by a <dd> element; however, multiple <dt> elements in a row indicate several terms that are all defined by the immediate next <dd> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dt
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLDtElement}
 */
export const dt: (props?: object, ...children: (string | number | Node)[]) => HTMLDtElement;
/**
 * <figcaption>
 * Represents a caption or legend describing the rest of the contents of its parent <figure> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/figcaption
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLFigcaptionElement}
 */
export const figcaption: (props?: object, ...children: (string | number | Node)[]) => HTMLFigcaptionElement;
/**
 * <figure>
 * Represents self-contained content, potentially with an optional caption, which is specified using the <figcaption> element. The figure, its caption, and its contents are referenced as a single unit.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/figure
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLFigureElement}
 */
export const figure: (props?: object, ...children: (string | number | Node)[]) => HTMLFigureElement;
/**
 * <hr>
 * Represents a thematic break between paragraph-level elements: for example, a change of scene in a story, or a shift of topic within a section.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/hr
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLHrElement}
 */
export const hr: (props?: object, ...children: (string | number | Node)[]) => HTMLHrElement;
/**
 * <li>
 * Represents an item in a list. It must be contained in a parent element: an ordered list (<ol>), an unordered list (<ul>), or a menu (<menu>). In menus and unordered lists, list items are usually displayed using bullet points. In ordered lists, they are usually displayed with an ascending counter on the left, such as a number or letter.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/li
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLLiElement}
 */
export const li: (props?: object, ...children: (string | number | Node)[]) => HTMLLiElement;
/**
 * <menu>
 * A semantic alternative to <ul>, but treated by browsers (and exposed through the accessibility tree) as no different than <ul>. It represents an unordered list of items (which are represented by <li> elements).
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/menu
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLMenuElement}
 */
export const menu: (props?: object, ...children: (string | number | Node)[]) => HTMLMenuElement;
/**
 * <ol>
 * Represents an ordered list of items — typically rendered as a numbered list.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ol
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLOlElement}
 */
export const ol: (props?: object, ...children: (string | number | Node)[]) => HTMLOlElement;
/**
 * <p>
 * Represents a paragraph. Paragraphs are usually represented in visual media as blocks of text separated from adjacent blocks by blank lines and/or first-line indentation, but HTML paragraphs can be any structural grouping of related content, such as images or form fields.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/p
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLPElement}
 */
export const p: (props?: object, ...children: (string | number | Node)[]) => HTMLPElement;
/** ')
 * <pre>
 * Represents preformatted text which is to be presented exactly as written in the HTML file. The text is typically rendered using a non-proportional, or monospaced, font. Whitespace inside this element is displayed as written.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/pre
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLPreElement}
 */
export const pre: (props?: object, ...children: (string | number | Node)[]) => HTMLPreElement;
/**
 * <ul>
 * Represents an unordered list of items, typically rendered as a bulleted list.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ul
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLUlElement}
 */
export const ul: (props?: object, ...children: (string | number | Node)[]) => HTMLUlElement;
/**
 * <a>
 * Together with its href attribute, creates a hyperlink to web pages, files, email addresses, locations within the current page, or anything else a URL can address.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLAElement}
 */
export const a: (props?: object, ...children: (string | number | Node)[]) => HTMLAElement;
/**
 * <abbr>
 * Represents an abbreviation or acronym.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/abbr
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLAbbrElement}
 */
export const abbr: (props?: object, ...children: (string | number | Node)[]) => HTMLAbbrElement;
/**
 * <b>
 * Used to draw the reader's attention to the element's contents, which are not otherwise granted special importance. This was formerly known as the Boldface element, and most browsers still draw the text in boldface. However, you should not use <b> for styling text or granting importance. If you wish to create boldface text, you should use the CSS font-weight property. If you wish to indicate an element is of special importance, you should use the <strong> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/b
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLBElement}
 */
export const b: (props?: object, ...children: (string | number | Node)[]) => HTMLBElement;
/**
 * <bdi>
 * Tells the browser's bidirectional algorithm to treat the text it contains in isolation from its surrounding text. It's particularly useful when a website dynamically inserts some text and doesn't know the directionality of the text being inserted.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/bdi
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLBdiElement}
 */
export const bdi: (props?: object, ...children: (string | number | Node)[]) => HTMLBdiElement;
/**
 * <bdo>
 * Overrides the current directionality of text, so that the text within is rendered in a different direction.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/bdo
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLBdoElement}
 */
export const bdo: (props?: object, ...children: (string | number | Node)[]) => HTMLBdoElement;
/**
 * <br>
 * Produces a line break in text (carriage-return). It is useful for writing a poem or an address, where the division of lines is significant.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/br
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLBrElement}
 */
export const br: (props?: object, ...children: (string | number | Node)[]) => HTMLBrElement;
/**
 * <cite>
 * Used to mark up the title of a creative work. The reference may be in an abbreviated form according to context-appropriate conventions related to citation metadata.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/cite
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLCiteElement}
 */
export const cite: (props?: object, ...children: (string | number | Node)[]) => HTMLCiteElement;
/**
 * <code>
 * Displays its contents styled in a fashion intended to indicate that the text is a short fragment of computer code. By default, the content text is displayed using the user agent's default monospace font.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/code
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLCodeElement}
 */
export const code: (props?: object, ...children: (string | number | Node)[]) => HTMLCodeElement;
/**
 * <data>
 * Links a given piece of content with a machine-readable translation. If the content is time- or date-related, the <time> element must be used.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/data
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLDataElement}
 */
export const data: (props?: object, ...children: (string | number | Node)[]) => HTMLDataElement;
/**
 * <dfn>
 * Used to indicate the term being defined within the context of a definition phrase or sentence. The ancestor <p> element, the <dt>/<dd> pairing, or the nearest section ancestor of the <dfn> element, is considered to be the definition of the term.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dfn
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLDfnElement}
 */
export const dfn: (props?: object, ...children: (string | number | Node)[]) => HTMLDfnElement;
/**
 * <em>
 * Marks text that has stress emphasis. The <em> element can be nested, with each nesting level indicating a greater degree of emphasis.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/em
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLEmElement}
 */
export const em: (props?: object, ...children: (string | number | Node)[]) => HTMLEmElement;
/**
 * <i>
 * Represents a range of text that is set off from the normal text for some reason, such as idiomatic text, technical terms, and taxonomical designations, among others. Historically, these have been presented using italicized type, which is the original source of the <i> naming of this element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/i
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLIElement}
 */
export const i: (props?: object, ...children: (string | number | Node)[]) => HTMLIElement;
/**
 * <kbd>
 * Represents a span of inline text denoting textual user input from a keyboard, voice input, or any other text entry device. By convention, the user agent defaults to rendering the contents of a <kbd> element using its default monospace font, although this is not mandated by the HTML standard.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/kbd
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLKbdElement}
 */
export const kbd: (props?: object, ...children: (string | number | Node)[]) => HTMLKbdElement;
/**
 * <mark>
 * Represents text which is marked or highlighted for reference or notation purposes due to the marked passage's relevance in the enclosing context.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/mark
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLMarkElement}
 */
export const mark: (props?: object, ...children: (string | number | Node)[]) => HTMLMarkElement;
/**
 * <q>
 * Indicates that the enclosed text is a short inline quotation. Most modern browsers implement this by surrounding the text in quotation marks. This element is intended for short quotations that don't require paragraph breaks; for long quotations use the <blockquote> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/q>
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLQElement}
 */
export const q: (props?: object, ...children: (string | number | Node)[]) => HTMLQElement;
/**
 * <rp>
 * Used to provide fall-back parentheses for browsers that do not support the display of ruby annotations using the <ruby> element. One <rp> element should enclose each of the opening and closing parentheses that wrap the <rt> element that contains the annotation's text.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/rp
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLRpElement}
 */
export const rp: (props?: object, ...children: (string | number | Node)[]) => HTMLRpElement;
/**
 * <rt>
 * Specifies the ruby text component of a ruby annotation, which is used to provide pronunciation, translation, or transliteration information for East Asian typography. The <rt> element must always be contained within a <ruby> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/rt
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLRtElement}
 */
export const rt: (props?: object, ...children: (string | number | Node)[]) => HTMLRtElement;
/**
 * <ruby>
 * Represents small annotations that are rendered above, below, or next to base text, usually used for showing the pronunciation of East Asian characters. It can also be used for annotating other kinds of text, but this usage is less common.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ruby
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLRubyElement}
 */
export const ruby: (props?: object, ...children: (string | number | Node)[]) => HTMLRubyElement;
/**
 * <s>
 * Renders text with a strikethrough, or a line through it. Use the <s> element to represent things that are no longer relevant or no longer accurate. However, <s> is not appropriate when indicating document edits; for that, use the <del> and <ins> elements, as appropriate.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/s
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLSElement}
 */
export const s: (props?: object, ...children: (string | number | Node)[]) => HTMLSElement;
/**
 * <samp>
 * Used to enclose inline text which represents sample (or quoted) output from a computer program. Its contents are typically rendered using the browser's default monospaced font (such as Courier or Lucida Console).
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/samp
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLSampElement}
 */
export const samp: (props?: object, ...children: (string | number | Node)[]) => HTMLSampElement;
/**
 * <small>
 * Represents side-comments and small print, like copyright and legal text, independent of its styled presentation. By default, it renders text within it one font size smaller, such as from small to x-small.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/small
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLSmallElement}
 */
export const small: (props?: object, ...children: (string | number | Node)[]) => HTMLSmallElement;
/**
 * <span>
 * A generic inline container for phrasing content, which does not inherently represent anything. It can be used to group elements for styling purposes (using the class or id attributes), or because they share attribute values, such as lang. It should be used only when no other semantic element is appropriate. <span> is very much like a div element, but div is a block-level element whereas a <span> is an inline-level element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/span
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLSpanElement}
 */
export const span: (props?: object, ...children: (string | number | Node)[]) => HTMLSpanElement;
/**
 * <strong>
 * Indicates that its contents have strong importance, seriousness, or urgency. Browsers typically render the contents in bold type.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/strong
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLStrongElement}
 */
export const strong: (props?: object, ...children: (string | number | Node)[]) => HTMLStrongElement;
/**
 * <sub>
 * Specifies inline text which should be displayed as subscript for solely typographical reasons. Subscripts are typically rendered with a lowered baseline using smaller text.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/sub
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLSubElement}
 */
export const sub: (props?: object, ...children: (string | number | Node)[]) => HTMLSubElement;
/**
 * <sup>
 * Specifies inline text which is to be displayed as superscript for solely typographical reasons. Superscripts are usually rendered with a raised baseline using smaller text.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/sup
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLSupElement}
 */
export const sup: (props?: object, ...children: (string | number | Node)[]) => HTMLSupElement;
/**
 * <time>
 * Represents a specific period in time. It may include the datetime attribute to translate dates into machine-readable format, allowing for better search engine results or custom features such as reminders.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/time
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLTimeElement}
 */
export const time: (props?: object, ...children: (string | number | Node)[]) => HTMLTimeElement;
/**
 * <u>
 * Represents a span of inline text which should be rendered in a way that indicates that it has a non-textual annotation. This is rendered by default as a single solid underline but may be altered using CSS.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/u
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLUElement}
 */
export const u: (props?: object, ...children: (string | number | Node)[]) => HTMLUElement;
/**
 * <var>
 * Represents the name of a variable in a mathematical expression or a programming context. It's typically presented using an italicized version of the current typeface, although that behavior is browser-dependent.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/var
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLVarElement}
 */
export const htmlvar: (props?: object, ...children: (string | number | Node)[]) => HTMLVarElement;
/**
 * <wbr>
 * Represents a word break opportunity—a position within text where the browser may optionally break a line, though its line-breaking rules would not otherwise create a break at that location.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/wbr
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLWbrElement}
 */
export const wbr: (props?: object, ...children: (string | number | Node)[]) => HTMLWbrElement;
/**
 * <area>
 * Defines an area inside an image map that has predefined clickable areas. An image map allows geometric areas on an image to be associated with hyperlink.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/area
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLAreaElement}
 */
export const area: (props?: object, ...children: (string | number | Node)[]) => HTMLAreaElement;
/**
 * <audio>
 * Used to embed sound content in documents. It may contain one or more audio sources, represented using the src attribute or the source element: the browser will choose the most suitable one. It can also be the destination for streamed media, using a MediaStream.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/audio
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLAudioElement}
 */
export const audio: (props?: object, ...children: (string | number | Node)[]) => HTMLAudioElement;
/**
 * <img>
 * Embeds an image into the document.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLImgElement}
 */
export const img: (props?: object, ...children: (string | number | Node)[]) => HTMLImgElement;
/**
 * <map>
 * Used with <area> elements to define an image map (a clickable link area).
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/map
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLMapElement}
 */
export const map: (props?: object, ...children: (string | number | Node)[]) => HTMLMapElement;
/**
 * <track>
 * Used as a child of the media elements, audio and video. It lets you specify timed text tracks (or time-based data), for example to automatically handle subtitles. The tracks are formatted in WebVTT format (.vtt files)—Web Video Text Tracks.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/track
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLTrackElement}
 */
export const track: (props?: object, ...children: (string | number | Node)[]) => HTMLTrackElement;
/**
 * <video>
 * Embeds a media player which supports video playback into the document. You can also use <video> for audio content, but the audio element may provide a more appropriate user experience.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLVideoElement}
 */
export const video: (props?: object, ...children: (string | number | Node)[]) => HTMLVideoElement;
/**
 * <embed>
 * Embeds external content at the specified point in the document. This content is provided by an external application or other source of interactive content such as a browser plug-in.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/embed
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLEmbedElement}
 */
export const embed: (props?: object, ...children: (string | number | Node)[]) => HTMLEmbedElement;
/**
 * <iframe>
 * Represents a nested browsing context, embedding another HTML page into the current one.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLIframeElement}
 */
export const iframe: (props?: object, ...children: (string | number | Node)[]) => HTMLIframeElement;
/**
 * <object>
 * Represents an external resource, which can be treated as an image, a nested browsing context, or a resource to be handled by a plugin.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/object
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLObjectElement}
 */
export const object: (props?: object, ...children: (string | number | Node)[]) => HTMLObjectElement;
/**
 * <picture>
 * Contains zero or more <source> elements and one <img> element to offer alternative versions of an image for different display/device scenarios.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLPictureElement}
 */
export const picture: (props?: object, ...children: (string | number | Node)[]) => HTMLPictureElement;
/**
 * <source>
 * Specifies multiple media resources for the picture, the audio element, or the video element. It is a void element, meaning that it has no content and does not have a closing tag. It is commonly used to offer the same media content in multiple file formats in order to provide compatibility with a broad range of browsers given their differing support for image file formats and media file formats.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/source
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLSourceElement}
 */
export const source: (props?: object, ...children: (string | number | Node)[]) => HTMLSourceElement;
/**
 * <canvas>
 * Container element to use with either the canvas scripting API or the WebGL API to draw graphics and animations.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/canvas
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLCanvasElement}
 */
export const canvas: (props?: object, ...children: (string | number | Node)[]) => HTMLCanvasElement;
/**
 * <noscript>
 * Defines a section of HTML to be inserted if a script type on the page is unsupported or if scripting is currently turned off in the browser.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/noscript
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLNoscriptElement}
 */
export const noscript: (props?: object, ...children: (string | number | Node)[]) => HTMLNoscriptElement;
/**
 * <script>
 * Used to embed executable code or data; this is typically used to embed or refer to JavaScript code. The <script> element can also be used with other languages, such as WebGL's GLSL shader programming language and JSON.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLScriptElement}
 */
export const script: (props?: object, ...children: (string | number | Node)[]) => HTMLScriptElement;
/**
 * <del>
 * Represents a range of text that has been deleted from a document. This can be used when rendering "track changes" or source code diff information, for example. The <ins> element can be used for the opposite purpose: to indicate text that has been added to the document.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/del
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLDelElement}
 */
export const del: (props?: object, ...children: (string | number | Node)[]) => HTMLDelElement;
/**
 * <ins>
 * Represents a range of text that has been added to a document. You can use the <del> element to similarly represent a range of text that has been deleted from the document.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ins
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLInsElement}
 */
export const ins: (props?: object, ...children: (string | number | Node)[]) => HTMLInsElement;
/**
 * <caption>
 * Specifies the caption (or title) of a table.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/caption
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLCaptionElement}
 */
export const caption: (props?: object, ...children: (string | number | Node)[]) => HTMLCaptionElement;
/**
 * <col>
 * Defines one or more columns in a column group represented by its implicit or explicit parent <colgroup> element. The <col> element is only valid as a child of a <colgroup> element that has no span attribute defined.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/col
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLColElement}
 */
export const col: (props?: object, ...children: (string | number | Node)[]) => HTMLColElement;
/**
 * <colgroup>
 * Defines a group of columns within a table.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/colgroup
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLColgroupElement}
 */
export const colgroup: (props?: object, ...children: (string | number | Node)[]) => HTMLColgroupElement;
/**
 * <table>
 * Represents tabular data—that is, information presented in a two-dimensional table comprised of rows and columns of cells containing data.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/table
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLTableElement}
 */
export const table: (props?: object, ...children: (string | number | Node)[]) => HTMLTableElement;
/**
 * <tbody>
 * Encapsulates a set of table rows (<tr> elements), indicating that they comprise the body of a table's (main) data.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tbody
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLTbodyElement}
 */
export const tbody: (props?: object, ...children: (string | number | Node)[]) => HTMLTbodyElement;
/**
 * <td>
 * A child of the <tr> element, it defines a cell of a table that contains data.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/td
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLTdElement}
 */
export const td: (props?: object, ...children: (string | number | Node)[]) => HTMLTdElement;
/**
 * <tfoot>
 * Encapsulates a set of table rows (<tr> elements), indicating that they comprise the foot of a table with information about the table's columns. This is usually a summary of the columns, e.g., a sum of the given numbers in a column.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tfoot
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLTfootElement}
 */
export const tfoot: (props?: object, ...children: (string | number | Node)[]) => HTMLTfootElement;
/**
 * <th>
 * A child of the <tr> element, it defines a cell as the header of a group of table cells. The nature of this group can be explicitly defined by the scope and headers attributes.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/th
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLThElement}
 */
export const th: (props?: object, ...children: (string | number | Node)[]) => HTMLThElement;
/**
 * <thead>
 * Encapsulates a set of table rows (<tr> elements), indicating that they comprise the head of a table with information about the table's columns. This is usually in the form of column headers (<th> elements).
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/thead
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLTheadElement}
 */
export const thead: (props?: object, ...children: (string | number | Node)[]) => HTMLTheadElement;
/**
 * <tr>
 * Defines a row of cells in a table. The row's cells can then be established using a mix of <td> (data cell) and <th> (header cell) elements.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tr
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLTrElement}
 */
export const tr: (props?: object, ...children: (string | number | Node)[]) => HTMLTrElement;
/**
 * <button>
 * An interactive element activated by a user with a mouse, keyboard, finger, voice command, or other assistive technology. Once activated, it performs an action, such as submitting a form or opening a dialog.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLButtonElement}
 */
export const button: (props?: object, ...children: (string | number | Node)[]) => HTMLButtonElement;
/**
 * <datalist>
 * Contains a set of <option> elements that represent the permissible or recommended options available to choose from within other controls.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/datalist
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLDatalistElement}
 */
export const datalist: (props?: object, ...children: (string | number | Node)[]) => HTMLDatalistElement;
/**
 * <fieldset>
 * Used to group several controls as well as labels (<label>) within a web form.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fieldset
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLFieldsetElement}
 */
export const fieldset: (props?: object, ...children: (string | number | Node)[]) => HTMLFieldsetElement;
/**
 * <form>
 * Represents a document section containing interactive controls for submitting information.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLFormElement}
 */
export const form: (props?: object, ...children: (string | number | Node)[]) => HTMLFormElement;
/**
 * <input>
 * Used to create interactive controls for web-based forms to accept data from the user; a wide variety of types of input data and control widgets are available, depending on the device and user agent. The <input> element is one of the most powerful and complex in all of HTML due to the sheer number of combinations of input types and attributes.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLInputElement}
 */
export const input: (props?: object, ...children: (string | number | Node)[]) => HTMLInputElement;
/**
 * <label>
 * Represents a caption for an item in a user interface.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLLabelElement}
 */
export const label: (props?: object, ...children: (string | number | Node)[]) => HTMLLabelElement;
/**
 * <legend>
 * Represents a caption for the content of its parent <fieldset>.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/legend
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLLegendElement}
 */
export const legend: (props?: object, ...children: (string | number | Node)[]) => HTMLLegendElement;
/**
 * <meter>
 * Represents either a scalar value within a known range or a fractional value.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meter
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLMeterElement}
 */
export const meter: (props?: object, ...children: (string | number | Node)[]) => HTMLMeterElement;
/**
 * <optgroup>
 * Creates a grouping of options within a <select> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/optgroup
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLOptgroupElement}
 */
export const optgroup: (props?: object, ...children: (string | number | Node)[]) => HTMLOptgroupElement;
/**
 * <option>
 * Used to define an item contained in a select, an <optgroup>, or a <datalist> element. As such, <option> can represent menu items in popups and other lists of items in an HTML document.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/option
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLOptionElement}
 */
export const option: (props?: object, ...children: (string | number | Node)[]) => HTMLOptionElement;
/**
 * <output>
 * Container element into which a site or app can inject the results of a calculation or the outcome of a user action.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/output
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLOutputElement}
 */
export const output: (props?: object, ...children: (string | number | Node)[]) => HTMLOutputElement;
/**
 * <progress>
 * Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLProgressElement}
 */
export const progress: (props?: object, ...children: (string | number | Node)[]) => HTMLProgressElement;
/**
 * <select>
 * Represents a control that provides a menu of options.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLSelectElement}
 */
export const select: (props?: object, ...children: (string | number | Node)[]) => HTMLSelectElement;
/**
 * <textarea>
 * Represents a multi-line plain-text editing control, useful when you want to allow users to enter a sizeable amount of free-form text, for example, a comment on a review or feedback form.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/textarea
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLTextareaElement}
 */
export const textarea: (props?: object, ...children: (string | number | Node)[]) => HTMLTextareaElement;
/**
 * <details>
 * Creates a disclosure widget in which information is visible only when the widget is toggled into an "open" state. A summary or label must be provided using the <summary> element.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLDetailsElement}
 */
export const details: (props?: object, ...children: (string | number | Node)[]) => HTMLDetailsElement;
/**
 * <dialog>
 * Represents a dialog box or other interactive component, such as a dismissible alert, inspector, or subwindow.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLDialogElement}
 */
export const dialog: (props?: object, ...children: (string | number | Node)[]) => HTMLDialogElement;
/**
 * <summary>
 * Specifies a summary, caption, or legend for a details element's disclosure box. Clicking the <summary> element toggles the state of the parent <details> element open and closed.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/summary
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLSummaryElement}
 */
export const summary: (props?: object, ...children: (string | number | Node)[]) => HTMLSummaryElement;
/**
 * <slot>
 * Part of the Web Components technology suite, this element is a placeholder inside a web component that you can fill with your own markup, which lets you create separate DOM trees and present them together.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/slot
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLSlotElement}
 */
export const slot: (props?: object, ...children: (string | number | Node)[]) => HTMLSlotElement;
/**
 * <template>
 * A mechanism for holding HTML that is not to be rendered immediately when a page is loaded but may be instantiated subsequently during runtime using JavaScript.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/template
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLTemplateElement}
 */
export const template: (props?: object, ...children: (string | number | Node)[]) => HTMLTemplateElement;
/**
 * <image>
 * An ancient and poorly supported precursor to the <img> element. It should not be used.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/image
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLImageElement}
 */
export const image: (props?: object, ...children: (string | number | Node)[]) => HTMLImageElement;
/**
 * <rb>
 * Used to delimit the base text component of a ruby annotation, i.e., the text that is being annotated. One <rb> element should wrap each separate atomic segment of the base text.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/rb
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLRbElement}
 */
export const rb: (props?: object, ...children: (string | number | Node)[]) => HTMLRbElement;
/**
 * <rtc>
 * Embraces semantic annotations of characters presented in a ruby of <rb> elements used inside of <ruby> element. <rb> elements can have both pronunciation (<rt>) and semantic (<rtc>) annotations.
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/rtc
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => HTMLRtcElement}
 */
export const rtc: (props?: object, ...children: (string | number | Node)[]) => HTMLRtcElement;
/**
 * The <animate> SVG element provides a way to animate an attribute of an element over time.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animate
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGAnimateElement }
 */
export const animate: (props?: object, ...children: (string | number | Node)[]) => SVGAnimateElement;
/**
 * The <animateMotion> SVG element provides a way to define how an element moves along a motion path.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animateMotion
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGAnimateMotionElement }
 */
export const animateMotion: (props?: object, ...children: (string | number | Node)[]) => SVGAnimateMotionElement;
/**
 * The <animateTransform> SVG element animates a transformation attribute on its target element, thereby allowing animations to control translation, scaling, rotation, and/or skewing.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animateTransform
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGAnimateTransformElement }
 */
export const animateTransform: (props?: object, ...children: (string | number | Node)[]) => SVGAnimateTransformElement;
/**
 * The <mpath> SVG sub-element for the <animateMotion> element provides the ability to reference an external <path> element as the definition of a motion path.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/mpath
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGMpathElement }
 */
export const mpath: (props?: object, ...children: (string | number | Node)[]) => SVGMpathElement;
/**
 * The <set> SVG element provides a method of setting the value of an attribute for a specified duration.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/set
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGSetElement }
 */
export const set: (props?: object, ...children: (string | number | Node)[]) => SVGSetElement;
/**
 * The <circle> SVG element is an SVG basic shape, used to draw circles based on a center point and a radius.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/circle
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGCircleElement }
 */
export const circle: (props?: object, ...children: (string | number | Node)[]) => SVGCircleElement;
/**
 * The <ellipse> SVG element is an SVG basic shape, used to create ellipses based on a center coordinate, and both their x and y radius.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/ellipse
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGEllipseElement }
 */
export const ellipse: (props?: object, ...children: (string | number | Node)[]) => SVGEllipseElement;
/**
 * The <line> SVG element is an SVG basic shape used to create a line connecting two points.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/line
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGLineElement }
 */
export const line: (props?: object, ...children: (string | number | Node)[]) => SVGLineElement;
/**
 * The <path> SVG element is the generic element to define a shape. All the basic shapes can be created with a path element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/path
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGPathElement }
 */
export const path: (props?: object, ...children: (string | number | Node)[]) => SVGPathElement;
/**
 * The <polygon> SVG element defines a closed shape consisting of a set of connected straight line segments. The last point is connected to the first point.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/polygon
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGPolygonElement }
 */
export const polygon: (props?: object, ...children: (string | number | Node)[]) => SVGPolygonElement;
/**
 * The <polyline> SVG element is an SVG basic shape that creates straight lines connecting several points. Typically a polyline is used to create open shapes as the last point doesn't have to be connected to the first point. For closed shapes see the <polygon> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/polyline
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGPolylineElement }
 */
export const polyline: (props?: object, ...children: (string | number | Node)[]) => SVGPolylineElement;
/**
 * The <rect> SVG element is a basic SVG shape that draws rectangles, defined by their position, width, and height. The rectangles may have their corners rounded.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/rect
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGRectElement }
 */
export const rect: (props?: object, ...children: (string | number | Node)[]) => SVGRectElement;
/**
 * The <defs> SVG element is used to store graphical objects that will be used at a later time. Objects created inside a <defs> element are not rendered directly. To display them you have to reference them (with a <use> element for example).
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/defs
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGDefsElement }
 */
export const defs: (props?: object, ...children: (string | number | Node)[]) => SVGDefsElement;
/**
 * The <g> SVG element is a container used to group other SVG elements.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/g
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGGElement }
 */
export const g: (props?: object, ...children: (string | number | Node)[]) => SVGGElement;
/**
 * The <marker> SVG element defines a graphic used for drawing arrowheads or polymarkers on a given <path>, <line>, <polyline> or <polygon> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/marker
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGMarkerElement }
 */
export const marker: (props?: object, ...children: (string | number | Node)[]) => SVGMarkerElement;
/**
 * The <mask> SVG element defines a mask for compositing the current object into the background. A mask is used/referenced using the mask property and CSS mask-image property.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/mask
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGMaskElement }
 */
export const mask: (props?: object, ...children: (string | number | Node)[]) => SVGMaskElement;
/**
 * The <pattern> SVG element defines a graphics object which can be redrawn at repeated x- and y-coordinate intervals ("tiled") to cover an area.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/pattern
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGPatternElement }
 */
export const pattern: (props?: object, ...children: (string | number | Node)[]) => SVGPatternElement;
/**
 * The <svg> SVG element is a container that defines a new coordinate system and viewport. It is used as the outermost element of SVG documents, but it can also be used to embed an SVG fragment inside an SVG or HTML document.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/svg
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGSvgElement }
 */
export const svg: (props?: object, ...children: (string | number | Node)[]) => SVGSvgElement;
/**
 * The <switch> SVG element evaluates any requiredFeatures, requiredExtensions and systemLanguage attributes on its direct child elements in order, and then renders the first child where these attributes evaluate to true.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/switch
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGSwitchElement }
 */
export const svgswitch: (props?: object, ...children: (string | number | Node)[]) => SVGSwitchElement;
/**
 * The <symbol> SVG element is used to define graphical template objects which can be instantiated by a <use> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/symbol
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGSymbolElement }
 */
export const symbol: (props?: object, ...children: (string | number | Node)[]) => SVGSymbolElement;
/**
 * The <use> element takes nodes from within an SVG document, and duplicates them somewhere else. The effect is the same as if the nodes were deeply cloned into a non-exposed DOM, then pasted where the <use> element is, much like cloned <template> elements.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/use
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGUseElement }
 */
export const use: (props?: object, ...children: (string | number | Node)[]) => SVGUseElement;
/**
 * The <desc> SVG element provides an accessible, long-text description of any SVG container element or graphics element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/desc
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGDescElement }
 */
export const desc: (props?: object, ...children: (string | number | Node)[]) => SVGDescElement;
/**
 * The <metadata> SVG element adds metadata to SVG content. Metadata is structured information about data. The contents of <metadata> should be elements from other XML namespaces such as RDF, FOAF, etc.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/metadata
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGMetadataElement }
 */
export const metadata: (props?: object, ...children: (string | number | Node)[]) => SVGMetadataElement;
/**
 * The <filter> SVG element defines a custom filter effect by grouping atomic filter primitives. It is never rendered itself, but must be used by the filter attribute on SVG elements, or the filter CSS property for SVG/HTML elements.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/filter
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFilterElement }
 */
export const filter: (props?: object, ...children: (string | number | Node)[]) => SVGFilterElement;
/**
 * The <feBlend> SVG filter primitive composes two objects together ruled by a certain blending mode. This is similar to what is known from image editing software when blending two layers. The mode is defined by the mode attribute.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feBlend
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeBlendElement }
 */
export const feBlend: (props?: object, ...children: (string | number | Node)[]) => SVGFeBlendElement;
/**
 * The <feColorMatrix> SVG filter element changes colors based on a transformation matrix. Every pixel's color value [R,G,B,A] is matrix multiplied by a 5 by 5 color matrix to create new color [R',G',B',A'].
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feColorMatrix
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeColorMatrixElement }
 */
export const feColorMatrix: (props?: object, ...children: (string | number | Node)[]) => SVGFeColorMatrixElement;
/**
 * The <feComponentTransfer> SVG filter primitive performs color-component-wise remapping of data for each pixel. It allows operations like brightness adjustment, contrast adjustment, color balance or thresholding.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feComponentTransfer
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeComponentTransferElement }
 */
export const feComponentTransfer: (props?: object, ...children: (string | number | Node)[]) => SVGFeComponentTransferElement;
/**
 * The <feComposite> SVG filter primitive performs the combination of two input images pixel-wise in image space using one of the Porter-Duff compositing operations: over, in, atop, out, xor, lighter, or arithmetic.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feComposite
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeCompositeElement }
 */
export const feComposite: (props?: object, ...children: (string | number | Node)[]) => SVGFeCompositeElement;
/**
 * The <feConvolveMatrix> SVG filter primitive applies a matrix convolution filter effect. A convolution combines pixels in the input image with neighboring pixels to produce a resulting image. A wide variety of imaging operations can be achieved through convolutions, including blurring, edge detection, sharpening, embossing and beveling.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feConvolveMatrix
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeConvolveMatrixElement }
 */
export const feConvolveMatrix: (props?: object, ...children: (string | number | Node)[]) => SVGFeConvolveMatrixElement;
/**
 * The <feDiffuseLighting> SVG filter primitive lights an image using the alpha channel as a bump map. The resulting image, which is an RGBA opaque image, depends on the light color, light position and surface geometry of the input bump map.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDiffuseLighting
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeDiffuseLightingElement }
 */
export const feDiffuseLighting: (props?: object, ...children: (string | number | Node)[]) => SVGFeDiffuseLightingElement;
/**
 * The <feDisplacementMap> SVG filter primitive uses the pixel values from the image from in2 to spatially displace the image from in.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDisplacementMap
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeDisplacementMapElement }
 */
export const feDisplacementMap: (props?: object, ...children: (string | number | Node)[]) => SVGFeDisplacementMapElement;
/**
 * The <feDistantLight> SVG filter primitive defines a distant light source that can be used within a lighting filter primitive: <feDiffuseLighting> or <feSpecularLighting>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDistantLight
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeDistantLightElement }
 */
export const feDistantLight: (props?: object, ...children: (string | number | Node)[]) => SVGFeDistantLightElement;
/**
 * The <feDropShadow> SVG filter primitive creates a drop shadow of the input image. It can only be used inside a <filter> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDropShadow
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeDropShadowElement }
 */
export const feDropShadow: (props?: object, ...children: (string | number | Node)[]) => SVGFeDropShadowElement;
/**
 * The <feFlood> SVG filter primitive fills the filter subregion with the color and opacity defined by flood-color and flood-opacity.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFlood
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeFloodElement }
 */
export const feFlood: (props?: object, ...children: (string | number | Node)[]) => SVGFeFloodElement;
/**
 * The <feFuncA> SVG filter primitive defines the transfer function for the alpha component of the input graphic of its parent <feComponentTransfer> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFuncA
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeFuncAElement }
 */
export const feFuncA: (props?: object, ...children: (string | number | Node)[]) => SVGFeFuncAElement;
/**
 * The <feFuncB> SVG filter primitive defines the transfer function for the blue component of the input graphic of its parent <feComponentTransfer> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFuncB
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeFuncBElement }
 */
export const feFuncB: (props?: object, ...children: (string | number | Node)[]) => SVGFeFuncBElement;
/**
 * The <feFuncG> SVG filter primitive defines the transfer function for the green component of the input graphic of its parent <feComponentTransfer> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFuncG
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeFuncGElement }
 */
export const feFuncG: (props?: object, ...children: (string | number | Node)[]) => SVGFeFuncGElement;
/**
 * The <feFuncR> SVG filter primitive defines the transfer function for the red component of the input graphic of its parent <feComponentTransfer> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFuncR
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeFuncRElement }
 */
export const feFuncR: (props?: object, ...children: (string | number | Node)[]) => SVGFeFuncRElement;
/**
 * The <feGaussianBlur> SVG filter primitive blurs the input image by the amount specified in stdDeviation, which defines the bell-curve.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feGaussianBlur
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeGaussianBlurElement }
 */
export const feGaussianBlur: (props?: object, ...children: (string | number | Node)[]) => SVGFeGaussianBlurElement;
/**
 * The <feImage> SVG filter primitive fetches image data from an external source and provides the pixel data as output (meaning if the external source is an SVG image, it is rasterized.)
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feImage
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeImageElement }
 */
export const feImage: (props?: object, ...children: (string | number | Node)[]) => SVGFeImageElement;
/**
 * The <feMerge> SVG element allows filter effects to be applied concurrently instead of sequentially. This is achieved by other filters storing their output via the result attribute and then accessing it in a <feMergeNode> child.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feMerge
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeMergeElement }
 */
export const feMerge: (props?: object, ...children: (string | number | Node)[]) => SVGFeMergeElement;
/**
 * The <feMergeNode> SVG takes the result of another filter to be processed by its parent <feMerge>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feMergeNode
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeMergeNodeElement }
 */
export const feMergeNode: (props?: object, ...children: (string | number | Node)[]) => SVGFeMergeNodeElement;
/**
 * The <feMorphology> SVG filter primitive is used to erode or dilate the input image. Its usefulness lies especially in fattening or thinning effects.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feMorphology
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeMorphologyElement }
 */
export const feMorphology: (props?: object, ...children: (string | number | Node)[]) => SVGFeMorphologyElement;
/**
 * The <feOffset> SVG filter primitive enables offsetting an input image relative to its current position. The input image as a whole is offset by the values specified in the dx and dy attributes.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feOffset
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeOffsetElement }
 */
export const feOffset: (props?: object, ...children: (string | number | Node)[]) => SVGFeOffsetElement;
/**
 * The <fePointLight> SVG filter primitive defines a light source which allows to create a point light effect. It that can be used within a lighting filter primitive: <feDiffuseLighting> or <feSpecularLighting>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/fePointLight
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFePointLightElement }
 */
export const fePointLight: (props?: object, ...children: (string | number | Node)[]) => SVGFePointLightElement;
/**
 * The <feSpecularLighting> SVG filter primitive lights a source graphic using the alpha channel as a bump map. The resulting image is an RGBA image based on the light color. The lighting calculation follows the standard specular component of the Phong lighting model. The resulting image depends on the light color, light position and surface geometry of the input bump map. The result of the lighting calculation is added. The filter primitive assumes that the viewer is at infinity in the z direction.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feSpecularLighting
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeSpecularLightingElement }
 */
export const feSpecularLighting: (props?: object, ...children: (string | number | Node)[]) => SVGFeSpecularLightingElement;
/**
 * The <feSpotLight> SVG filter primitive defines a light source that can be used to create a spotlight effect. It is used within a lighting filter primitive: <feDiffuseLighting> or <feSpecularLighting>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feSpotLight
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeSpotLightElement }
 */
export const feSpotLight: (props?: object, ...children: (string | number | Node)[]) => SVGFeSpotLightElement;
/**
 * The <feTile> SVG filter primitive allows to fill a target rectangle with a repeated, tiled pattern of an input image. The effect is similar to the one of a <pattern>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTile
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeTileElement }
 */
export const feTile: (props?: object, ...children: (string | number | Node)[]) => SVGFeTileElement;
/**
 * The <feTurbulence> SVG filter primitive creates an image using the Perlin turbulence function. It allows the synthesis of artificial textures like clouds or marble. The resulting image will fill the entire filter primitive subregion.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGFeTurbulenceElement }
 */
export const feTurbulence: (props?: object, ...children: (string | number | Node)[]) => SVGFeTurbulenceElement;
/**
 * The <linearGradient> SVG element lets authors define linear gradients to apply to other SVG elements.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/linearGradient
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGLinearGradientElement }
 */
export const linearGradient: (props?: object, ...children: (string | number | Node)[]) => SVGLinearGradientElement;
/**
 * The <radialGradient> SVG element lets authors define radial gradients that can be applied to fill or stroke of graphical elements.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/radialGradient
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGRadialGradientElement }
 */
export const radialGradient: (props?: object, ...children: (string | number | Node)[]) => SVGRadialGradientElement;
/**
 * The <stop> SVG element defines a color and its position to use on a gradient. This element is always a child of a <linearGradient> or <radialGradient> element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/stop
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGStopElement }
 */
export const stop: (props?: object, ...children: (string | number | Node)[]) => SVGStopElement;
/**
 * The <foreignObject> SVG element includes elements from a different XML namespace. In the context of a browser, it is most likely (X)HTML.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/foreignObject
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGForeignObjectElement }
 */
export const foreignObject: (props?: object, ...children: (string | number | Node)[]) => SVGForeignObjectElement;
/**
 * The <text> SVG element draws a graphics element consisting of text. It's possible to apply a gradient, pattern, clipping path, mask, or filter to <text>, like any other SVG graphics element.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/text
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGTextElement }
 */
export const text: (props?: object, ...children: (string | number | Node)[]) => SVGTextElement;
/**
 * The <textPath> SVG element is used to render text along the shape of a <path> element. The text must be enclosed in the <textPath> element and its href attribute is used to reference the desired <path>.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/textPath
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGTextPathElement }
 */
export const textPath: (props?: object, ...children: (string | number | Node)[]) => SVGTextPathElement;
/**
 * The <tspan> SVG element defines a subtext within a <text> element or another <tspan> element. It allows for adjustment of the style and/or position of that subtext as needed.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/tspan
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGTspanElement }
 */
export const tspan: (props?: object, ...children: (string | number | Node)[]) => SVGTspanElement;
/**
 * The <view> SVG element defines a particular view of an SVG document. A specific view can be displayed by referencing the <view> element's id as the target fragment of a URL.
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/view
 *
 * @type {(props?: object, ...children: (string | number | Node)[]) => SVGViewElement }
 */
export const view: (props?: object, ...children: (string | number | Node)[]) => SVGViewElement;
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
export type ElementHelper = (arg0: [propsOrChild], ...args: children[]) => any[];
