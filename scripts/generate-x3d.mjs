import fs from 'node:fs'
import path from 'node:path'

const repoRoot = path.resolve(import.meta.dirname, '..')
const x3domVendorCorePath = path.join(repoRoot, 'vendor', 'x3dom.js')
const x3domVendorFullPath = path.join(repoRoot, 'vendor', 'x3dom-full.js')

const parseRegistry = source => {
  const re = /registerNodeType\(\s*\"([^\"]+)\"\s*,\s*\"([^\"]+)\"/g
  const byName = new Map()
  let match
  while ((match = re.exec(source))) byName.set(match[1], match[2])
  return byName
}

const loadVendoredX3domVersion = () => {
  if (!fs.existsSync(x3domVendorCorePath)) return null
  const src = fs.readFileSync(x3domVendorCorePath, 'utf8')
  const m = src.match(/X3DOM\s+([0-9]+\.[0-9]+\.[0-9]+)/)
  return m?.[1] || null
}

const toHelperName = pascal => {
  if (pascal === 'LOD') return 'lod'
  // X3DOM nodes are authored in PascalCase (e.g. ArcClose2D) but in HTML the tag name
  // is effectively lowercase. We keep helper names aligned with the lowercase tag.
  return pascal.toLowerCase()
}

const toExportName = tag => {
  if (tag === 'switch') return 'x3dswitch'
  if (tag === 'text') return 'x3dtext'
  if (tag === 'param') return 'x3dparam'
  return tag
}

const makeDocUrl = (component, pascal) =>
  `https://doc.x3dom.org/author/${component}/${pascal}.html`

const normalizeDocText = text =>
  text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim()

const wrapDoc = (text, { indent = ' * ' } = {}) => {
  if (!text) return []
  const normalized = normalizeDocText(text)
  const lines = normalized.split('\n')
  return lines.map(line => `${indent}${line}`.trimEnd())
}

const extractClassDescFromFile = fileText => {
  // Prefer @classdesc content from the constructor JSDoc block.
  // Typical shape:
  //   /**
  //    * ...
  //    * @classdesc Some text...
  //    * More text...
  //    */
  const blockRe = /\/\*\*([\s\S]*?)\*\//g
  let match
  while ((match = blockRe.exec(fileText))) {
    const block = match[1]
    const classdescIdx = block.indexOf('@classdesc')
    if (classdescIdx === -1) continue

    const after = block.slice(classdescIdx + '@classdesc'.length)
    const lines = after
      .split('\n')
      .map(l => l.replace(/^\s*\*\s?/, ''))

    // Stop when we hit another @tag at the start of a line.
    const out = []
    for (const line of lines) {
      const trimmed = line.trimEnd()
      if (/^\s*@\w+/.test(trimmed)) break
      out.push(trimmed)
    }

    const text = out.join('\n').trim()
    if (text) return text
  }

  return null
}

const extractFieldsFromFile = fileText => {
  // Extract addField_* calls.
  // Typical: this.addField_SFString( ctx, "title", "" );
  // Some nodes use addField_... (ctx, "name", ...) with whitespace/newlines.
  const re = /this\.addField_([A-Za-z0-9]+)\(\s*ctx\s*,\s*\"([^\"]+)\"/g
  const fields = []
  let match
  while ((match = re.exec(fileText))) {
    const fieldType = match[1]
    const name = match[2]
    fields.push({ name, fieldType })
  }
  return fields
}

const loadX3domSourceDocs = version => {
  if (!version) return new Map()
  const srcRoot = path.join(repoRoot, '.cache', `x3dom-src-${version}`, 'src', 'nodes')
  if (!fs.existsSync(srcRoot)) return new Map()

  const docsByPascal = new Map()
  const stack = [srcRoot]

  while (stack.length) {
    const dir = stack.pop()
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) stack.push(fullPath)
      else if (entry.isFile() && entry.name.endsWith('.js')) {
        const txt = fs.readFileSync(fullPath, 'utf8')
        const m = txt.match(/registerNodeType\(\s*\"([^\"]+)\"/)
        if (!m) continue
        const pascal = m[1]
        const desc = extractClassDescFromFile(txt)
        if (desc) docsByPascal.set(pascal, desc)
      }
    }
  }

  return docsByPascal
}

const loadX3domSourceFields = version => {
  if (!version) return new Map()
  const srcRoot = path.join(repoRoot, '.cache', `x3dom-src-${version}`, 'src', 'nodes')
  if (!fs.existsSync(srcRoot)) return new Map()

  const fieldsByPascal = new Map()
  const stack = [srcRoot]

  while (stack.length) {
    const dir = stack.pop()
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) stack.push(fullPath)
      else if (entry.isFile() && entry.name.endsWith('.js')) {
        const txt = fs.readFileSync(fullPath, 'utf8')
        const m = txt.match(/registerNodeType\(\s*\"([^\"]+)\"/)
        if (!m) continue
        const pascal = m[1]
        const fields = extractFieldsFromFile(txt)
        if (fields.length) fieldsByPascal.set(pascal, fields)
      }
    }
  }

  return fieldsByPascal
}

const fieldTypeToTs = fieldType => {
  // Keep values permissive: X3DOM accepts HTML attribute strings; users may also pass numbers/arrays.
  switch (fieldType) {
  case 'SFBool': return 'X3DBool'
  case 'SFInt32':
  case 'SFFloat':
  case 'SFDouble':
  case 'SFTime': return 'X3DNumber'
  case 'SFString': return 'string'
  case 'MFString': return 'string | string[]'
  case 'MFInt32':
  case 'MFFloat':
  case 'MFDouble': return 'string | X3DNumber[]'
  case 'SFVec2f': return 'X3DVec2'
  case 'SFVec3f': return 'X3DVec3'
  case 'SFVec4f': return 'X3DVec4'
  case 'MFVec2f': return 'string | X3DVec2[]'
  case 'MFVec3f': return 'string | X3DVec3[]'
  case 'MFVec4f': return 'string | X3DVec4[]'
  case 'SFColor': return 'X3DColor'
  case 'SFColorRGBA': return 'X3DColorRGBA'
  case 'MFColor': return 'string | X3DColor[]'
  case 'MFColorRGBA': return 'string | X3DColorRGBA[]'
  case 'SFRotation': return 'X3DRotation'
  case 'MFRotation': return 'string | X3DRotation[]'
  case 'SFMatrix4f': return 'X3DMatrix4'
  case 'MFMatrix4f': return 'string | X3DMatrix4[]'
  case 'SFImage': return 'string | X3DNumber[]'
  case 'MFNode':
  case 'SFNode': return 'any'
  default: return 'any'
  }
}

const safePropKey = name =>
  /^[A-Za-z_\$][A-Za-z0-9_\$]*$/.test(name) ? name : JSON.stringify(name)

const writeX3DTagsRuntime = byName => {
  const concreteTags = [...byName.keys()]
    .filter(name => !name.startsWith('X3D'))
    .map(toHelperName)

  // Ensure top-level <x3d> is always present.
  const tags = ['x3d', ...concreteTags]

  const lines = []
  lines.push('// This file is generated. Do not edit by hand.')
  lines.push('// Generated by scripts/generate-x3d.mjs')
  lines.push('')
  lines.push('export const x3dTagNames = [')
  for (const tag of tags) lines.push(`  '${tag}',`)
  lines.push(']')
  lines.push('')

  const outPath = path.join(repoRoot, 'src', 'x3d-tags.js')
  fs.writeFileSync(outPath, lines.join('\n'))
}

const writeX3DHelpersRuntime = byName => {
  const concrete = [...byName.entries()]
    .filter(([name]) => !name.startsWith('X3D'))
    .map(([pascal, component]) => ({
      pascal,
      component,
      tag: toHelperName(pascal)
    }))

  // Generate explicit exports so tree-shaking works well.
  const exportsList = [
    { exportName: 'x3d', tag: 'x3d', pascal: 'X3D', component: 'Core' },
    ...concrete.map(({ pascal, component, tag }) => ({
      exportName: toExportName(tag),
      tag,
      pascal,
      component
    }))
  ]

  // Keep stable order by export name for easier diffs.
  exportsList.sort((a, b) => a.exportName.localeCompare(b.exportName))

  const lines = []
  lines.push('// This file is generated. Do not edit by hand.')
  lines.push('// Generated by scripts/generate-x3d.mjs')
  lines.push('')
  lines.push('/**')
  lines.push(' * X3DOM loading strategy (Option B: core-first + full fallback)')
  lines.push(' *')
  lines.push(' * Goals:')
  lines.push(' * - Keep the consumer experience simple: users import node helpers from @pfern/elements only.')
  lines.push(' * - Avoid loading heavy 3D code for apps that never use X3D.')
  lines.push(' * - Avoid loading the full X3DOM distribution unless it is actually needed.')
  lines.push(' *')
  lines.push(' * Implementation:')
  lines.push(' * - On first use of any 3D helper, load vendor `x3dom.js` + `x3dom.css` via DOM injection.')
  lines.push(' * - When a helper is called for a node that is not registered after loading core,')
  lines.push(' *   load vendor `x3dom-full.js` (same pinned version) and then reload the scene.')
  lines.push(' *')
  lines.push(' * Why vendor scripts instead of ESM importing `x3dom`?')
  lines.push(' * - X3DOM’s distributed bundles are written as classic scripts that establish globals')
  lines.push(' *   and assume certain symbols exist in the same global scope. Injecting script tags')
  lines.push(' *   preserves this behavior across bundlers and avoids scope/interop surprises.')
  lines.push(' *')
  lines.push(' * Future (Option C): component-level lazy loading')
  lines.push(' * - If we want to be even more selective than “core vs full”, we can build and ship per-component')
  lines.push(' *   chunks (e.g., `Geospatial`, `Geometry2D`, `VolumeRendering`, `RigidBodyPhysics`, …).')
  lines.push(' * - The generator already knows each node’s component from `registerNodeType`.')
  lines.push(' * - A future loader could map `tag -> component -> chunk` and only load what a given scene uses.')
  lines.push(' */')
  lines.push('')
  lines.push('let x3domCorePromise = null')
  lines.push('let x3domFullPromise = null')
  lines.push('let x3domLoadedFull = false')
  lines.push('let x3domLoadFailed = false')
  lines.push('')
  lines.push('const injectStyleTextOnce = (id, cssText) => {')
  lines.push('  if (typeof document === \'undefined\') return')
  lines.push('  const existing = document.querySelector(`style[data-x3dom=\"${id}\"]`)')
  lines.push('  if (existing) return')
  lines.push('  const style = document.createElement(\'style\')')
  lines.push('  style.setAttribute(\'data-x3dom\', id)')
  lines.push('  style.textContent = cssText')
  lines.push('  document.head.appendChild(style)')
  lines.push('}')
  lines.push('')
  lines.push('const injectScriptTextOnce = (id, jsText) => {')
  lines.push('  if (typeof document === \'undefined\') return')
  lines.push('  const existing = document.querySelector(`script[data-x3dom=\"${id}\"]`)')
  lines.push('  if (existing) return')
  lines.push('  const script = document.createElement(\'script\')')
  lines.push('  script.setAttribute(\'data-x3dom\', id)')
  lines.push('  script.text = jsText')
  lines.push('  document.head.appendChild(script)')
  lines.push('}')
  lines.push('')
  lines.push('const loadStyleOnce = href => {')
  lines.push('  if (typeof document === \'undefined\') return Promise.resolve()')
  lines.push('  const existing = document.querySelector(`link[rel=\"stylesheet\"][href=\"${href}\"]`)')
  lines.push('  if (existing) return Promise.resolve()')
  lines.push('  return new Promise((resolve, reject) => {')
  lines.push('    const link = document.createElement(\'link\')')
  lines.push('    link.rel = \'stylesheet\'')
  lines.push('    link.href = href')
  lines.push('    link.onload = () => resolve()')
  lines.push('    link.onerror = err => reject(err)')
  lines.push('    document.head.appendChild(link)')
  lines.push('  })')
  lines.push('}')
  lines.push('')
  lines.push('const loadScriptOnce = src => {')
  lines.push('  if (typeof document === \'undefined\') return Promise.resolve()')
  lines.push('  const existing = document.querySelector(`script[src=\"${src}\"]`)')
  lines.push('  if (existing) return Promise.resolve()')
  lines.push('  return new Promise((resolve, reject) => {')
  lines.push('    const script = document.createElement(\'script\')')
  lines.push('    script.src = src')
  lines.push('    script.defer = true')
  lines.push('    script.onload = () => resolve()')
  lines.push('    script.onerror = err => reject(err)')
  lines.push('    document.head.appendChild(script)')
  lines.push('  })')
  lines.push('}')
  lines.push('')
  lines.push('const getX3DOM = () => globalThis?.x3dom || null')
  lines.push('')
  lines.push('const reloadX3DOM = () => {')
  lines.push('  try {')
  lines.push('    getX3DOM()?.reload?.()')
  lines.push('  } catch (err) {')
  lines.push('    console.warn(\'x3dom.reload() failed\', err)')
  lines.push('  }')
  lines.push('}')
  lines.push('')
  lines.push('const ensureX3DOMCore = () => {')
  lines.push('  if (typeof window === \'undefined\' || x3domLoadFailed) return null')
  lines.push('  if (getX3DOM()?.reload) return Promise.resolve(getX3DOM())')
  lines.push('  if (x3domCorePromise) return x3domCorePromise')
  lines.push('')
  lines.push('  x3domCorePromise = (async () => {')
  lines.push('    // Vite/linked-workspace friendly path: avoid requesting /@fs/ absolute paths by inlining.')
  lines.push('    try {')
  lines.push('      const [{ default: cssText }, { default: jsText }] = await Promise.all([')
  lines.push('        import(\'../vendor/x3dom.css?raw\'),')
  lines.push('        import(\'../vendor/x3dom.js?raw\')')
  lines.push('      ])')
  lines.push('      injectStyleTextOnce(\'css\', cssText)')
  lines.push('      injectScriptTextOnce(\'core\', jsText)')
  lines.push('      return getX3DOM()')
  lines.push('    } catch (err) {')
  lines.push('      // Fallback path: load via URL <link>/<script>.')
  lines.push('      const cssUrl = new URL(\'../vendor/x3dom.css\', import.meta.url).toString()')
  lines.push('      const coreUrl = new URL(\'../vendor/x3dom.js\', import.meta.url).toString()')
  lines.push('      await Promise.all([loadStyleOnce(cssUrl), loadScriptOnce(coreUrl)])')
  lines.push('      return getX3DOM()')
  lines.push('    }')
  lines.push('  })()')
    lines.push('    .then(() => {')
    lines.push('      reloadX3DOM()')
    lines.push('      return getX3DOM()')
    lines.push('    })')
  lines.push('    .catch(err => {')
  lines.push('      x3domLoadFailed = true')
  lines.push('      console.warn(\'x3dom core failed to load\', err)')
  lines.push('      return null')
  lines.push('    })')
  lines.push('')
  lines.push('  return x3domCorePromise')
  lines.push('}')
  lines.push('')
  lines.push('const ensureX3DOMFull = async () => {')
  lines.push('  if (typeof window === \'undefined\' || x3domLoadFailed) return null')
  lines.push('  await ensureX3DOMCore()')
  lines.push('  if (x3domFullPromise) return x3domFullPromise')
  lines.push('  x3domLoadedFull = true')
  lines.push('')
  lines.push('  const fullUrl = new URL(\'../vendor/x3dom-full.js\', import.meta.url).toString()')
  lines.push('  x3domFullPromise = (async () => {')
  lines.push('    try {')
  lines.push('      const { default: jsText } = await import(\'../vendor/x3dom-full.js?raw\')')
  lines.push('      injectScriptTextOnce(\'full\', jsText)')
  lines.push('      return getX3DOM()')
  lines.push('    } catch (err) {')
  lines.push('      await loadScriptOnce(fullUrl)')
  lines.push('      return getX3DOM()')
  lines.push('    }')
  lines.push('  })()')
    lines.push('    .then(() => {')
    lines.push('      reloadX3DOM()')
    lines.push('      return getX3DOM()')
    lines.push('    })')
  lines.push('    .catch(err => {')
  lines.push('      console.warn(\'x3dom full failed to load\', err)')
  lines.push('      return getX3DOM()')
  lines.push('    })')
  lines.push('')
  lines.push('  return x3domFullPromise')
  lines.push('}')
  lines.push('')
  lines.push('const ensureX3DOMForTag = async tag => {')
  lines.push('  const x3dom = await ensureX3DOMCore()')
  lines.push('  if (!x3dom) return null')
  lines.push('  if (tag === \'x3d\') return x3dom')
  lines.push('  const lc = String(tag).toLowerCase()')
  lines.push('  const hasNode = !!x3dom?.nodeTypesLC?.[lc]')
  lines.push('  if (hasNode) return x3dom')
  lines.push('  if (!x3domLoadedFull && (typeof process !== \'undefined\') && process?.env?.NODE_ENV !== \'production\') {')
  lines.push('    console.warn(`[elements] Loading x3dom-full.js because <${tag}> is not present in core x3dom.js`)')
  lines.push('  }')
  lines.push('  return ensureX3DOMFull()')
  lines.push('}')
  lines.push('')
  lines.push('const isPropsObject = x =>')
  lines.push('  typeof x === \'object\'')
  lines.push('  && x !== null')
  lines.push('  && !Array.isArray(x)')
  lines.push('  && !(typeof Node !== \'undefined\' && x instanceof Node)')
  lines.push('')
  lines.push('const createTagHelper = tag => (...args) => {')
  lines.push('  const hasFirstArg = args.length > 0')
  lines.push('  const [propsOrChild, ...children] = args')
  lines.push('  const props = hasFirstArg && isPropsObject(propsOrChild) ? propsOrChild : {}')
  lines.push('  const actualChildren = !hasFirstArg')
  lines.push('    ? []')
  lines.push('    : props === propsOrChild')
  lines.push('      ? children')
  lines.push('      : [propsOrChild, ...children]')
  lines.push('  return [tag, props, ...actualChildren]')
  lines.push('}')
  lines.push('')
  lines.push('const withX3DOM = (tag, fn) => (...args) => {')
  lines.push('  // Fire-and-forget: we want vnode creation to stay synchronous.')
  lines.push('  // X3DOM will (re)parse after load via reloadX3DOM().')
  lines.push('  ensureX3DOMForTag(tag)')
  lines.push('  return fn(...args)')
  lines.push('}')
  lines.push('')

  for (const e of exportsList) {
    lines.push('/**')
    lines.push(` * @see https://doc.x3dom.org/author/${e.component}/${e.pascal}.html`)
    if (e.exportName !== e.tag) {
      lines.push(` * Exported as \`${e.exportName}\` to avoid colliding with the HTML/SVG \`${e.tag}\` helper.`)
    }
    lines.push(' */')
    lines.push(`export const ${e.exportName} = withX3DOM('${e.tag}', createTagHelper('${e.tag}'))`)
    lines.push('')
  }

  const outPath = path.join(repoRoot, 'src', '3d.js')
  fs.writeFileSync(outPath, lines.join('\n'))
}

const writeX3DTypes = byName => {
  const version = loadVendoredX3domVersion()
  const docsByPascal = loadX3domSourceDocs(version)
  const fieldsByPascal = loadX3domSourceFields(version)

  const concrete = [...byName.entries()]
    .filter(([name]) => !name.startsWith('X3D'))
    .map(([pascal, component]) => ({
      pascal,
      component,
      tag: toHelperName(pascal)
    }))

  const lines = []
  lines.push('/**')
  lines.push(' * X3D tag helpers (concrete nodes supported by X3DOM).')
  lines.push(' *')
  lines.push(' * Note: Some X3D node names overlap with HTML/SVG tags (e.g. `param`, `text`).')
  lines.push(' * This library exports those with an `x3d`-prefix (e.g. `x3dparam`, `x3dtext`).')
  lines.push(' *')
  lines.push(' * Descriptions are sourced from the X3DOM project’s node JSDoc (when available) and')
  lines.push(' * augmented with @see links to the official X3DOM docs pages.')
  lines.push(' */')
  lines.push('')
  lines.push('export type X3DNumber = number | string;')
  lines.push('export type X3DBool = boolean | string;')
  lines.push('export type X3DVec2 = string | [X3DNumber, X3DNumber] | X3DNumber[];')
  lines.push('export type X3DVec3 = string | [X3DNumber, X3DNumber, X3DNumber] | X3DNumber[];')
  lines.push('export type X3DVec4 = string | [X3DNumber, X3DNumber, X3DNumber, X3DNumber] | X3DNumber[];')
  lines.push('export type X3DColor = string | [X3DNumber, X3DNumber, X3DNumber] | X3DNumber[];')
  lines.push('export type X3DColorRGBA = string | [X3DNumber, X3DNumber, X3DNumber, X3DNumber] | X3DNumber[];')
  lines.push('export type X3DRotation = string | [X3DNumber, X3DNumber, X3DNumber, X3DNumber] | X3DNumber[];')
  lines.push('export type X3DMatrix4 = string | X3DNumber[];')
  lines.push('')
  lines.push('export type X3DProps = Record<string, any>;')
  lines.push('export type X3DVNode<P extends X3DProps = X3DProps> = [tag: string, props: P, ...children: any[]];')
  lines.push('export type ElementHelper<P extends X3DProps = X3DProps> = {')
  lines.push('  (props: P, ...children: any[]): X3DVNode<P>;')
  lines.push('  (...children: any[]): X3DVNode<P>;')
  lines.push('};')
  lines.push('')
  lines.push('/**')
  const x3dDesc = docsByPascal.get('X3D') || 'The <x3d> element is the top-level container for an X3D scene.'
  lines.push(...wrapDoc(x3dDesc))
  lines.push(' * @see https://doc.x3dom.org/author/Core/X3D.html')
  lines.push(' */')
  lines.push('export const x3d: ElementHelper;')
  lines.push('')

  for (const { pascal, component, tag } of concrete) {
    const exp = toExportName(tag)
    const url = makeDocUrl(component, pascal)
    const tagLabel = tag === 'lod' ? '<lod> (LOD)' : `<${tag}>`
    const desc = docsByPascal.get(pascal) || `${tagLabel} node (X3DOM ${component} component).`
    const fields = fieldsByPascal.get(pascal) || []
    const propsName = `${pascal}Props`

    lines.push(`export interface ${propsName} extends X3DProps {`)
    for (const f of fields) {
      lines.push(`  ${safePropKey(f.name)}?: ${fieldTypeToTs(f.fieldType)};`)
    }
    lines.push('}')
    lines.push('')

    lines.push('/**')
    lines.push(...wrapDoc(desc))
    if (exp !== tag) {
      lines.push(` *`)
      lines.push(` * Exported as \`${exp}\` to avoid colliding with the HTML/SVG \`${tag}\` helper.`)
    }
    lines.push(` * @see ${url}`)
    lines.push(' */')
    lines.push(`export const ${exp}: ElementHelper<${propsName}>;`)
    lines.push('')
  }

  const outPath = path.join(repoRoot, 'types', 'x3d.d.ts')
  fs.writeFileSync(outPath, lines.join('\n'))
}

const writeX3DBaseTypes = byName => {
  const version = loadVendoredX3domVersion()
  const docsByPascal = loadX3domSourceDocs(version)

  const base = [...byName.entries()]
    .filter(([name]) => name.startsWith('X3D'))
    .map(([name, component]) => ({ name, component }))

  const lines = []
  lines.push('/**')
  lines.push(' * Abstract base types for X3D nodes (not tag helpers).')
  lines.push(' *')
  lines.push(' * These are exported as `type` aliases to enable typing and documentation lookups,')
  lines.push(' * without implying that each base type is a concrete tag helper.')
  lines.push(' *')
  lines.push(' * Descriptions are sourced from the X3DOM project’s node JSDoc (when available).')
  lines.push(' */')
  lines.push('')
  lines.push('type X3DBaseNode = [tag: string, props: Record<string, any>, ...children: any[]];')
  lines.push('')
  lines.push('/**')
  const x3dNodeDesc =
    docsByPascal.get('X3DNode')
    || 'Abstract base type that all concrete X3D nodes derive from.'
  lines.push(...wrapDoc(x3dNodeDesc))
  lines.push(' * @see https://doc.x3dom.org/author/Core/X3DNode.html')
  lines.push(' */')
  lines.push('export type X3DNode = X3DBaseNode;')
  lines.push('')

  for (const { name, component } of base) {
    if (name === 'X3DNode') continue
    const url = makeDocUrl(component, name)
    const desc = docsByPascal.get(name) || 'Abstract base node type.'
    lines.push('/**')
    lines.push(...wrapDoc(desc))
    lines.push(` * @see ${url}`)
    lines.push(' */')
    lines.push(`export type ${name} = X3DNode;`)
    lines.push('')
  }

  const outPath = path.join(repoRoot, 'types', 'x3d-base.d.ts')
  fs.writeFileSync(outPath, lines.join('\n'))
}

const main = () => {
  if (!fs.existsSync(x3domVendorCorePath)) {
    console.error(`Could not find vendored x3dom core at: ${x3domVendorCorePath}`)
    process.exit(1)
  }

  const coreSource = fs.readFileSync(x3domVendorCorePath, 'utf8')
  const coreRegistry = parseRegistry(coreSource)

  const fullRegistry = fs.existsSync(x3domVendorFullPath)
    ? parseRegistry(fs.readFileSync(x3domVendorFullPath, 'utf8'))
    : coreRegistry

  const byName = fullRegistry

  writeX3DTagsRuntime(byName)
  writeX3DHelpersRuntime(byName)
  writeX3DTypes(byName)
  writeX3DBaseTypes(byName)
}

main()
