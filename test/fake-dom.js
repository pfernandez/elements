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
      this.childNodes.push(child)
      child.parentNode = this
      return child
    }

    replaceChild(next, prev) {
      const index = this.childNodes.indexOf(prev)
      if (index === -1)
        throw new Error('replaceChild: previous child not found')
      this.childNodes[index] = next
      next.parentNode = this
      prev.parentNode = null
      return prev
    }
  }

  class FakeText extends FakeNode {
    constructor(text) {
      super(3, '#text')
      this.nodeValue = String(text)
      this.textContent = this.nodeValue
    }
  }

  class FakeComment extends FakeNode {
    constructor(text) {
      super(8, '#comment')
      this.nodeValue = String(text)
      this.textContent = this.nodeValue
    }
  }

  class FakeElement extends FakeNode {
    constructor(tagName, namespaceURI = null) {
      super(1, String(tagName).toUpperCase())
      this.tagName = String(tagName).toUpperCase()
      this.namespaceURI = namespaceURI
      this.attributes = {}
      this.style = {}
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
  }

  class FakeDocument {
    constructor() {
      this.documentElement = new FakeElement('html')
      this.head = new FakeElement('head')
      this.body = new FakeElement('body')
      this.documentElement.appendChild(this.head)
      this.documentElement.appendChild(this.body)
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

    replaceChild(next, prev) {
      return this.documentElement.replaceChild(next, prev)
    }
  }

  const document = new FakeDocument()
  return { document }
}
