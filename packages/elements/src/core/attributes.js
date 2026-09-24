/** Attribute spelling shared by DOM assignment and HTML serialization. */
const enumerated = new Set(['contenteditable', 'draggable', 'spellcheck'])

export const attributeValue = (key, value) =>
  value == null ? null
    : typeof value !== 'boolean' ? String(value)
      : enumerated.has(key) || /^(aria|data)-/.test(key) ? String(value)
        : value ? '' : null

export const validateProps = props => {
  if (Object.hasOwn(props, 'className'))
    throw new TypeError('Invalid prop: className. Use `class`.')
}
