export const createFakeDom = () => {
  class FakeNode {
    constructor(nodeType, nodeName) {
      this.nodeType = nodeType
      this.nodeName = nodeName
      this.parentNode = null
      this.childNodes = []
    }

    appendChild(child) {
      if (child == null) return child
      child.parentNode?.removeChild(child)
      this.childNodes.push(child)
      child.parentNode = this
      return child
    }

    insertBefore(next, ref) {
      if (next == null) return next
      if (!ref) return this.appendChild(next)
      if (next === ref) return next
      next.parentNode?.removeChild(next)
      const index = this.childNodes.indexOf(ref)
      if (index === -1) throw new Error('insertBefore: reference child not found')
      this.childNodes.splice(index, 0, next)
      next.parentNode = this
      return next
    }

    replaceChild(next, prev) {
      if (next === prev) return prev
      next.parentNode?.removeChild(next)
      const index = this.childNodes.indexOf(prev)
      if (index === -1)
        throw new Error('replaceChild: previous child not found')
      this.childNodes[index] = next
      next.parentNode = this
      prev.parentNode = null
      return prev
    }

    removeChild(child) {
      const index = this.childNodes.indexOf(child)
      if (index === -1) throw new Error('removeChild: child not found')
      this.childNodes.splice(index, 1)
      child.parentNode = null
      return child
    }

    get firstChild() { return this.childNodes[0] || null }
    get lastChild() { return this.childNodes.at(-1) || null }
    get nextSibling() {
      return this.parentNode?.childNodes[this.parentNode.childNodes.indexOf(this) + 1] || null
    }

    get textContent() {
      return this.nodeType === 3 || this.nodeType === 8
        ? this.nodeValue
        : this.childNodes.filter(child => child.nodeType !== 8)
          .map(child => child.textContent).join('')
    }
  }

  class FakeText extends FakeNode {
    constructor(text) {
      super(3, '#text')
      this.nodeValue = String(text)
    }
  }

  class FakeComment extends FakeNode {
    constructor(text) {
      super(8, '#comment')
      this.nodeValue = String(text)
    }
  }

  class FakeStyle {
    setProperty(key, value) {
      this[String(key)] = String(value)
    }

    removeProperty(key) {
      delete this[String(key)]
    }
  }

  class FakeElement extends FakeNode {
    constructor(tagName, namespaceURI = null) {
      super(1, String(tagName).toUpperCase())
      this.tagName = String(tagName).toUpperCase()
      this.namespaceURI = namespaceURI
      this.attributes = {}
      this.style = new FakeStyle()
      this.innerHTML = ''
      this.value = ''
      this.checked = false
      this.selected = false
      this.disabled = false
      this.multiple = false
      this.muted = false
      this.volume = 1
      this.currentTime = 0
      this.playbackRate = 1
      this.open = false
      this.indeterminate = false
      this.__setAttributeCount = 0
      this.__setAttributeNSCount = 0
      this.__throwOnSetAttribute = new Map()
    }

    setAttribute(key, value) {
      const err = this.__throwOnSetAttribute.get(String(key))
      if (err) throw err
      this.__setAttributeCount++
      this.attributes[key] = String(value)
    }

    setAttributeNS(_ns, key, value) {
      this.__setAttributeNSCount++
      this.setAttribute(key, value)
    }

    removeAttribute(key) {
      delete this.attributes[String(key)]
    }

    getAttribute(key) { return this.attributes[String(key)] ?? null }
    hasAttribute(key) { return Object.hasOwn(this.attributes, String(key)) }
    closest(selector) {
      return (selector === 'a[href]' ? this.tagName === 'A' && this.hasAttribute('href')
        : this.tagName.toLowerCase() === selector)
        ? this : this.parentNode?.closest?.(selector) || null
    }

    get innerHTML() { return this._innerHTML || '' }
    set innerHTML(value) {
      this.childNodes.forEach(child => { child.parentNode = null })
      this.childNodes = []
      this._innerHTML = String(value)
    }
  }

  class FakeDocument extends FakeNode {
    constructor() {
      super(9, '#document')
      this.documentElement = new FakeElement('html')
      this.head = new FakeElement('head')
      this.body = new FakeElement('body')
      this.documentElement.appendChild(this.head)
      this.documentElement.appendChild(this.body)
      this.appendChild(this.documentElement)
    }

    createElement(tag) {
      return new FakeElement(tag)
    }

    createElementNS(ns, tag) {
      return new FakeElement(tag, ns)
    }

    createTextNode(text) {
      return new FakeText(text)
    }

    createComment(text) {
      return new FakeComment(text)
    }

  }

  const document = new FakeDocument()
  return { document }
}
