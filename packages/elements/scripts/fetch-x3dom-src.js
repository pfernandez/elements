// Manually refresh the declaration inputs from the source matching the engine.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const pkg = path.resolve(import.meta.dirname, '..')
const engine = fs.readFileSync(path.join(pkg, 'vendor/x3dom-full.js'), 'utf8')
const version = engine.match(/X3DOM (\d+\.\d+\.\d+)/)[1]
const revision = engine.match(/Revision: ([0-9a-f]+)/)[1]
const checkout = path.resolve(pkg, '../../.cache', `x3dom-src-${version}`)
const source = path.join(checkout, 'src/nodes')
const metadata = path.join(import.meta.dirname, 'x3dom-nodes.json')

if (!fs.existsSync(checkout)) {
  fs.mkdirSync(path.dirname(checkout), { recursive: true })
  execFileSync('git', ['clone', '--depth', '1', '--branch', version,
                       'https://github.com/x3dom/x3dom', checkout],
               { stdio: 'inherit' })
}
const git = (...args) =>
  execFileSync('git', ['-C', checkout, ...args], { encoding: 'utf8' }).trim()
if (git('rev-parse', 'HEAD') !== revision || git('status', '--porcelain', '--', 'src/nodes'))
  throw new Error(`Refresh requires unmodified X3DOM nodes at ${revision}.`)

const description = node => ts.getTextOfJSDocComment(node?.comment)?.trim()

// Read the actual registrations. Some fields take ctx before their name,
// while child-node fields take the name as their first argument.
const readNode = (name, file) => {
  const ast = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'),
                                  ts.ScriptTarget.Latest, true)
  const registration = ast.statements.map(statement => statement.expression)
    .find(call => call?.expression?.getText() === 'x3dom.registerNodeType'
      && call.arguments[0].text === name)
  if (!registration) throw new Error(`Missing registration for ${name} in ${file}`)
  const [parent, constructor] = registration.arguments[2].arguments
  const fields = {}
  const field = node => {
    if (ts.isCallExpression(node)
        && ts.isPropertyAccessExpression(node.expression)
        && node.expression.expression.kind === ts.SyntaxKind.ThisKeyword
        && node.expression.name.text.startsWith('addField_')) {
      const [first, second] = node.arguments
      const key = ts.isStringLiteral(first) ? first : second
      if (!key || !ts.isStringLiteral(key))
        throw new Error(`Missing field name in ${file}: ${node.getText()}`)
      fields[key.text] = {
        type: node.expression.name.text.slice('addField_'.length),
        description: description(node.parent.jsDoc?.[0])
      }
    }
    ts.forEachChild(node, field)
  }
  field(constructor.body)
  const tags = ts.getJSDocTags(constructor)
  const classDoc = tags.find(tag => tag.tagName.text.toLowerCase() === 'classdesc')
  // Some constructors put the node description below the standard ctx text.
  const context = tags.find(tag => ts.isJSDocParameterTag(tag)
    && tag.name.getText() === 'ctx')
  const continuation = description(context)?.split('\n').slice(1).join('\n')
  return { parent: parent.name?.text,
           description: description(classDoc) || continuation || undefined,
           fields }
}

const files = fs.readdirSync(source, { recursive: true })
  .filter(file => file.endsWith('.js'))
const byName = new Map(files.map(file =>
  [path.basename(file, '.js'), path.join(source, file)]))
const names = Array.from(engine.matchAll(/registerNodeType\("([^"]+)"/g),
                         match => match[1])
const nodes = Object.fromEntries([...new Set(names)].sort().map(name =>
  [name, readNode(name, byName.get(name))]))
fs.writeFileSync(metadata, JSON.stringify({ version, revision, nodes }, null, 2) + '\n')
console.log(`Updated ${Object.keys(nodes).length} node definitions from X3DOM ${version}.`)
