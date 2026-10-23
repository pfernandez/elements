import { readFileSync } from 'node:fs'

// Summarize renderer records by their stable property names. These are shallow
// object/backing-store sizes, not dominator-tree retained sizes or page memory.
const heap = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const { nodes, edges, strings } = heap
const meta = heap.snapshot.meta
const fields = meta.node_fields, edgeFields = meta.edge_fields
const width = fields.length, edgeWidth = edgeFields.length
const kind = fields.indexOf('type'), name = fields.indexOf('name')
const size = fields.indexOf('self_size'), count = fields.indexOf('edge_count')
const edgeType = edgeFields.indexOf('type'), edgeName = edgeFields.indexOf('name_or_index')
const target = edgeFields.indexOf('to_node')
const types = meta.edge_types[edgeType]
const label = node => strings[nodes[node + name]]
const bytes = set => [...set].reduce((sum, node) => sum + nodes[node + size], 0)
const records = [], stores = new Set(), primitiveProps = new Set(), emptyChildren = new Set(), children = new Set()
const sources = new Set()
let start = 0, primitiveRecords = 0
for (let node = 0; node < nodes.length; node += width) {
  const end = start + nodes[node + count] * edgeWidth
  if (meta.node_types[kind][nodes[node + kind]] === 'object' && label(node) === 'Object') {
    const props = new Map(), internal = new Map()
    for (let edge = start; edge < end; edge += edgeWidth) {
      const type = types[edges[edge + edgeType]]
      if (type === 'property' || type === 'internal')
        (type === 'property' ? props : internal).set(strings[edges[edge + edgeName]], edges[edge + target])
    }
    if (['node', 'namespace', 'owner', 'children'].every(key => props.has(key))) {
      records.push(node)
      children.add(props.get('children'))
      if (internal.has('properties')) stores.add(internal.get('properties'))
      const source = props.get('source')
      if (source !== undefined && label(source) === 'Array') sources.add(source)
      if (source === undefined || label(source) !== 'Array') {
        primitiveRecords++
        if (props.has('props')) primitiveProps.add(props.get('props'))
        emptyChildren.add(props.get('children'))
      }
    }
  }
  start = end
}
const elements = new Set(), sourceElements = new Set()
start = 0
for (let node = 0; node < nodes.length; node += width) {
  const end = start + nodes[node + count] * edgeWidth
  if (children.has(node) || sources.has(node)) {
    for (let edge = start; edge < end; edge += edgeWidth)
      if (types[edges[edge + edgeType]] === 'internal' && strings[edges[edge + edgeName]] === 'elements')
        (children.has(node) ? elements : sourceElements).add(edges[edge + target])
  }
  start = end
}
console.log(JSON.stringify({ records: records.length, recordSelfBytes: bytes(new Set(records)),
  propertyBackingBytes: bytes(stores), primitiveRecords,
  children: { count: children.size, bytes: bytes(children), elementBackingBytes: bytes(elements) },
  sources: { count: sources.size, bytes: bytes(sources), elementBackingBytes: bytes(sourceElements) },
  primitiveProps: { count: primitiveProps.size, bytes: bytes(primitiveProps) },
  primitiveChildren: { count: emptyChildren.size, bytes: bytes(emptyChildren) } }, null, 2))
