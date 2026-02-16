import { annotationXml, apply, ci, csymbol, math, mfenced, mi, mrow, mspace,
         semantics } from '../../packages/elements/mathml.js'
import { appearance, billboard, box, coordinate, fontStyle, indexedLineSet,
         material, scene, shape, sphere, transform, viewpoint, x3d, x3dtext }
  from '../../packages/elements-x3dom/x3dom.js'
import { button, component, div, p, pre }
  from '../../packages/elements/elements.js'

const sym = (id, name) => ({ type: 'sym', id: String(id), name: String(name) })
const app = (id, fn, arg) => ({ type: 'app', id: String(id), fn, arg })

const makeIdGen = start => {
  let n = start
  return { next: () => n++, value: () => n }
}

const isSym = (e, name) =>
  e?.type === 'sym'
  && (name == null || e.name === name)

const isApp = e => e?.type === 'app'

const reduceOnce = (expr, nextIdStart) => {
  const ids = makeIdGen(nextIdStart)

  const step = e => {
    if (!e) return { expr: e, changed: false }

    // I x -> x
    if (isApp(e) && isSym(e.fn, 'I'))
      return { expr: e.arg, changed: true }

    // K x y -> x
    if (isApp(e) && isApp(e.fn) && isSym(e.fn.fn, 'K'))
      return { expr: e.fn.arg, changed: true }

    // S x y z -> x z (y z)
    if (isApp(e) && isApp(e.fn) && isApp(e.fn.fn) && isSym(e.fn.fn.fn, 'S')) {
      const x = e.fn.fn.arg
      const y = e.fn.arg
      const z = e.arg
      return { expr: app(ids.next(),
                         app(ids.next(), x, z),
                         app(ids.next(), y, z)),
               changed: true }
    }

    if (!isApp(e)) return { expr: e, changed: false }

    const left = step(e.fn)
    if (left.changed) return { expr: app(e.id, left.expr, e.arg), changed: true }

    const right = step(e.arg)
    return right.changed
      ? { expr: app(e.id, e.fn, right.expr), changed: true }
      : { expr: e, changed: false }
  }

  const { expr: nextExpr, changed } = step(expr)
  return { expr: nextExpr, changed, nextId: ids.value() }
}

const hasId = (expr, id) =>
  !expr || id == null
    ? false
    : expr.id === id
      ? true
      : expr.type === 'app'
        ? hasId(expr.fn, id) || hasId(expr.arg, id)
        : false

const collectTree = (expr, occ = 'r', depth = 0, nodes = [], edges = []) => {
  if (!expr) return { nodes, edges }

  nodes.push({ occ, id: expr.id, type: expr.type, name: expr.name, depth })

  if (expr.type === 'app') {
    const left = `${occ}L`
    const right = `${occ}R`
    edges.push([occ, left], [occ, right])
    collectTree(expr.fn, left, depth + 1, nodes, edges)
    collectTree(expr.arg, right, depth + 1, nodes, edges)
  }

  return { nodes, edges }
}

const toContentMathML = expr =>
  !expr
    ? ci('')
    : expr.type === 'sym'
      ? csymbol({ cd: 'ski' }, expr.name)
      : apply(
        csymbol({ cd: 'ski' }, 'app'),
        toContentMathML(expr.fn),
        toContentMathML(expr.arg))

const toPresentationMathML = ({ expr, select, selectedId, parens = false }) => {
  if (!expr) return mi('')

  const style = expr.id === selectedId
    ? { backgroundColor: 'rgba(255, 230, 150, 0.65)', borderRadius: '4px' }
    : null

  const wrap = (...children) =>
    mrow({ style,
           onclick: () => select(expr.id),
           'data-node-id': expr.id },
         ...children)

  if (expr.type === 'sym')
    return wrap(mi(expr.name))

  const left = toPresentationMathML(
    { expr: expr.fn, select, selectedId, parens: true })
  const right = toPresentationMathML(
    { expr: expr.arg, select, selectedId, parens: true })
  const inner = mrow(left, mspace({ width: '0.35em' }), right)

  return parens
    ? wrap(mfenced(inner))
    : wrap(inner)
}

const nodePos = ({ depth, index }) =>
  ({ x: index % 9 * 1.0 - 4.0,
     y: 2.0 - depth * 0.8,
     z: -Math.floor(index / 9) * 1.2 })

const posToString = ({ x, y, z }) => `${x} ${y} ${z}`

const x3dLabel = ({ text, selected }) =>
  billboard(
    { axisOfRotation: '0 0 0' },
    transform(
      { translation: '0 0.55 0' },
      shape(
        appearance(
          material({ emissiveColor: selected ? '0.2 0.2 0.2' : '0.3 0.3 0.3' })),
        x3dtext(
          { string: text },
          fontStyle({ size: 0.35, family: 'SANS', justify: 'MIDDLE' })))))

const x3dNode =
  ({ occ, id, type, name, select, selectedId, position, showLabels }) => {
    const selected = id === selectedId

    const base = type === 'app'
      ? '0.25 0.65 1.0'
      : '0.35 0.9 0.45'

    const color = selected ? '1.0 0.75 0.2' : base
    const geom = type === 'app'
      ? box({ size: '0.6 0.35 0.6' })
      : sphere({ radius: 0.28 })

    return transform({ translation: posToString(position),
                       onclick: () => select(id),
                       'data-node-id': id,
                       'data-occ-id': occ },
                     shape(
                       appearance(
                         material({ diffuseColor: color })),
                       geom),
                     showLabels && type === 'sym'
                       ? x3dLabel({ text: name, selected })
                       : undefined)
  }

const initialExpr = () => {
  const ids = makeIdGen(1)
  const S = sym(ids.next(), 'S')
  const K1 = sym(ids.next(), 'K')
  const K2 = sym(ids.next(), 'K')
  const x = sym(ids.next(), 'x')

  const expr = app(ids.next(),
                   app(ids.next(),
                       app(ids.next(),
                           S,
                           K1),
                       K2),
                   x)

  return { expr, nextId: ids.value() }
}

export const skiMathmlX3dom = component(
  (expr = initialExpr().expr,
   selectedId = null,
   nextId = initialExpr().nextId,
   showLabels = true) => {
    const select = id => skiMathmlX3dom(expr, id, nextId, showLabels)

    const reset = () => {
      const init = initialExpr()
      return skiMathmlX3dom(init.expr, null, init.nextId, showLabels)
    }

    const step = () => {
      const reduced = reduceOnce(expr, nextId)
      const nextSelected = hasId(reduced.expr, selectedId) ? selectedId : null
      return reduced.changed
        ? skiMathmlX3dom(reduced.expr, nextSelected, reduced.nextId, showLabels)
        : skiMathmlX3dom(expr, nextSelected, nextId, showLabels)
    }

    const toggleLabels = () =>
      skiMathmlX3dom(expr, selectedId, nextId, !showLabels)

    const { nodes, edges } = collectTree(expr)
    const nodesWithPos = nodes.map((n, index) =>
      ({ ...n, position: nodePos({ depth: n.depth, index }) }))

    const posByOcc = nodesWithPos.reduce(
      (acc, n) => (acc[n.occ] = n.position, acc), {})

    const linePoints = []
    const lineIndex = []
    for (let i = 0; i < edges.length; i++) {
      const [from, to] = edges[i]
      const a = posByOcc[from]
      const b = posByOcc[to]
      if (!a || !b) continue

      const ai = linePoints.length
      linePoints.push(a, b)
      lineIndex.push(ai, ai + 1, -1)
    }

    const lines =
      linePoints.length === 0
        ? undefined
        : shape(
          appearance(
            material({ emissiveColor: '0.25 0.25 0.25' })),
          indexedLineSet(
            { coordIndex: lineIndex.join(' ') },
            coordinate({ point: linePoints.map(posToString).join(' ') })))

    const presentation =
      toPresentationMathML({ expr, select, selectedId, parens: false })

    const content = toContentMathML(expr)

    return div(
      { class: 'ski' },
      p('Legend: blue boxes = application, green spheres = symbols. '
          + 'Click nodes in MathML or 3D to highlight. Step reduces '
          + '((S K K) x) → x.'),

      div({ style: { display: 'flex', gap: '1rem', alignItems: 'flex-start' }},
          div({ style: { flex: '1 1 0', minWidth: '280px' }},
              div(
                { style: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }},
                button({ onclick: step }, 'Step'),
                button({ onclick: reset }, 'Reset'),
                button({ onclick: toggleLabels },
                       showLabels ? 'Labels: on' : 'Labels: off')),
              pre({ style: { fontSize: '0.9em', marginTop: '0.5rem' }},
                  `selected: ${selectedId ?? '(none)'}`),
              math({ display: 'block', style: { cursor: 'pointer' }},
                   semantics(
                     presentation,
                     annotationXml(
                       { encoding: 'application/mathml-content+xml' },
                       content)))),

          div({ style: { flex: '1 1 0', minWidth: '320px' }},
              x3d({ width: '100%', height: '320px' },
                  scene(
                    viewpoint({ position: '0 0 10',
                                description: 'Default View' }),
                    transform(
                      { translation: '0 0 0' },
                      lines,
                      ...nodesWithPos.map(n =>
                        x3dNode({ ...n, select, selectedId, showLabels }))))))))
  })
