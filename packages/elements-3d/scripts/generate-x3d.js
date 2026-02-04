import fs from 'node:fs'
import path from 'node:path'

const pkgRoot = path.resolve(import.meta.dirname, '..')
const repoRoot = path.resolve(pkgRoot, '..', '..')

const x3domVendorCorePath = path.join(pkgRoot, 'vendor', 'x3dom.js')
const x3domVendorFullPath = path.join(pkgRoot, 'vendor', 'x3dom-full.js')
const typesDir = path.join(pkgRoot, 'types')
const typesSrcDir = path.join(typesDir, 'src')

const ensureDir = dir => fs.mkdirSync(dir, { recursive: true })

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
  // X3DOM nodes are authored in PascalCase (e.g. ArcClose2D) but in HTML the
  // tag name is effectively lowercase. We keep helper names aligned with the
  // lowercase tag.
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
  const srcRoot = path.join(
    repoRoot,
    '.cache',
    `x3dom-src-${version}`,
    'src',
    'nodes'
  )
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
  const srcRoot = path.join(
    repoRoot,
    '.cache',
    `x3dom-src-${version}`,
    'src',
    'nodes'
  )
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
  // Keep values permissive: X3DOM accepts HTML attribute strings; users may
  // also pass numbers/arrays.
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

const writeX3DEntrypointTypes = () => {
  ensureDir(typesDir)
  const outPath = path.join(typesDir, '3d.d.ts')
  fs.writeFileSync(
    outPath,
    [
      "export * from './src/x3d-base.d.ts';",
      "export * from './src/x3d.d.ts';",
      ''
    ].join('\n')
  )
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
  lines.push('// Generated by scripts/generate-x3d.js')
  lines.push('')
  lines.push(
    'import { createTagHelper, withX3DOM } from \'./core/elements-3d.js\''
  )
  lines.push('')
  for (const e of exportsList) {
    lines.push(
      `/** @see https://doc.x3dom.org/author/${e.component}/${e.pascal}.html`
    )
    if (e.exportName !== e.tag) lines.push(
      ` * Exported as \`${e.exportName}\` to avoid colliding with the `
        + `HTML/SVG \`${e.tag}\` helper.`
    )
    lines.push(' */')
    lines.push(
      `export const ${e.exportName} = withX3DOM('${e.tag}', `
        + `createTagHelper('${e.tag}'))`
    )
    lines.push('')
  }
  const outPath = path.join(pkgRoot, 'src', '3d.js')
  fs.writeFileSync(outPath, lines.join('\n'))
}

const writeX3DTypes = byName => {
  ensureDir(typesSrcDir)
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
  lines.push(
    ' * Note: Some X3D node names overlap with HTML/SVG tags '
      + '(e.g. `param`, `text`).'
  )
  lines.push(
    ' * This library exports those with an `x3d`-prefix '
      + '(e.g. `x3dparam`, `x3dtext`).'
  )
  lines.push(' *')
  lines.push(
    ' * Descriptions are sourced from the X3DOM project’s node JSDoc '
      + '(when available) and'
  )
  lines.push(' * augmented with @see links to the official X3DOM docs pages.')
  lines.push(' */')
  lines.push('')
  lines.push('export type X3DNumber = number | string;')
  lines.push('export type X3DBool = boolean | string;')
  lines.push(
    'export type X3DVec2 = string | [X3DNumber, X3DNumber] '
      + '| X3DNumber[];'
  )
  lines.push(
    'export type X3DVec3 = string | [X3DNumber, X3DNumber, X3DNumber] '
      + '| X3DNumber[];'
  )
  lines.push(
    'export type X3DVec4 = string | '
      + '[X3DNumber, X3DNumber, X3DNumber, X3DNumber] | X3DNumber[];'
  )
  lines.push(
    'export type X3DColor = string | [X3DNumber, X3DNumber, X3DNumber] '
      + '| X3DNumber[];'
  )
  lines.push(
    'export type X3DColorRGBA = string | '
      + '[X3DNumber, X3DNumber, X3DNumber, X3DNumber] | X3DNumber[];'
  )
  lines.push(
    'export type X3DRotation = string | '
      + '[X3DNumber, X3DNumber, X3DNumber, X3DNumber] | X3DNumber[];'
  )
  lines.push('export type X3DMatrix4 = string | X3DNumber[];')
  lines.push('')
  lines.push('export type X3DProps = Record<string, any>;')
  lines.push(
    'export type X3DVNode<P extends X3DProps = X3DProps> = '
      + '[tag: string, props: P, ...children: any[]];'
  )
  lines.push('export type ElementHelper<P extends X3DProps = X3DProps> = {')
  lines.push('  (props: P, ...children: any[]): X3DVNode<P>;')
  lines.push('  (...children: any[]): X3DVNode<P>;')
  lines.push('};')
  lines.push('')
  lines.push('/**')
  const x3dDesc =
    docsByPascal.get('X3D')
    || 'The <x3d> element is the top-level container for an X3D scene.'
  lines.push(...wrapDoc(x3dDesc))
  lines.push(' * @see https://doc.x3dom.org/author/Core/X3D.html')
  lines.push(' */')
  lines.push('export const x3d: ElementHelper;')
  lines.push('')

  for (const { pascal, component, tag } of concrete) {
    const exp = toExportName(tag)
    const url = makeDocUrl(component, pascal)
    const tagLabel = tag === 'lod' ? '<lod> (LOD)' : `<${tag}>`
    const desc =
      docsByPascal.get(pascal)
      || `${tagLabel} node (X3DOM ${component} component).`
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
      lines.push(
        ` * Exported as \`${exp}\` to avoid colliding with the `
          + `HTML/SVG \`${tag}\` helper.`
      )
    }
    lines.push(` * @see ${url}`)
    lines.push(' */')
    lines.push(`export const ${exp}: ElementHelper<${propsName}>;`)
    lines.push('')
  }

  const outPath = path.join(typesSrcDir, 'x3d.d.ts')
  fs.writeFileSync(outPath, lines.join('\n'))
}

const writeX3DBaseTypes = byName => {
  ensureDir(typesSrcDir)
  const version = loadVendoredX3domVersion()
  const docsByPascal = loadX3domSourceDocs(version)

  const base = [...byName.entries()]
    .filter(([name]) => name.startsWith('X3D'))
    .map(([name, component]) => ({ name, component }))

  const lines = []
  lines.push('/**')
  lines.push(' * Abstract base types for X3D nodes (not tag helpers).')
  lines.push(' *')
  lines.push(
    ' * These are exported as `type` aliases to enable typing and '
      + 'documentation lookups,'
  )
  lines.push(
    ' * without implying that each base type is a concrete tag helper.'
  )
  lines.push(' *')
  lines.push(
    ' * Descriptions are sourced from the X3DOM project’s node JSDoc '
      + '(when available).'
  )
  lines.push(' */')
  lines.push('')
  lines.push(
    'type X3DBaseNode = '
      + '[tag: string, props: Record<string, any>, ...children: any[]];'
  )
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

  const outPath = path.join(typesSrcDir, 'x3d-base.d.ts')
  fs.writeFileSync(outPath, lines.join('\n'))
}

const main = () => {
  const args = new Set(process.argv.slice(2))
  const wantsRuntime = args.size === 0 || args.has('--runtime')
  const wantsTypes = args.size === 0 || args.has('--types')

  if (!fs.existsSync(x3domVendorCorePath)) {
    console.error(
      `Could not find vendored x3dom core at: ${x3domVendorCorePath}`
    )
    process.exit(1)
  }

  const coreSource = fs.readFileSync(x3domVendorCorePath, 'utf8')
  const coreRegistry = parseRegistry(coreSource)

  const fullRegistry = fs.existsSync(x3domVendorFullPath)
    ? parseRegistry(fs.readFileSync(x3domVendorFullPath, 'utf8'))
    : coreRegistry

  const byName = fullRegistry

  wantsRuntime && writeX3DHelpersRuntime(byName)
  wantsTypes && writeX3DEntrypointTypes()
  wantsTypes && writeX3DTypes(byName)
  wantsTypes && writeX3DBaseTypes(byName)
}

main()

