import { copyFileSync, mkdtempSync, rmSync } from 'node:fs'
import assert from 'node:assert/strict'
import { build } from 'vite'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { tmpdir } from 'node:os'
import ts from 'typescript'

const root = path.resolve(import.meta.dirname, '..')
const library = path.join(root, 'packages/elements')
const scratch = mkdtempSync(path.join(tmpdir(), 'elements-consumer-'))
const env = { ...process.env, npm_config_cache: path.join(scratch, '.npm') }
const run = (command, args, cwd = scratch) =>
  execFileSync(command, args, { cwd, env, encoding: 'utf8' })

const checkTypes = () => {
  const entry = path.join(scratch, 'index.ts')
  const program = ts.createProgram([entry], {
    noEmit: true, strict: true, module: ts.ModuleKind.NodeNext,
    target: ts.ScriptTarget.ES2022
  })
  const diagnostics = ts.getPreEmitDiagnostics(program)
  if (diagnostics.length) {
    const host = ts.createCompilerHost({})
    throw new Error(ts.formatDiagnostics(diagnostics, host))
  }

  const checker = program.getTypeChecker()
  const imports = program.getSourceFile(entry).statements
    .filter(ts.isImportDeclaration)
    .map(node => checker.getSymbolAtLocation(node.moduleSpecifier))
  for (const module of new Set(imports)) {
    const exports = checker.getExportsOfModule(module)
    const box = exports.find(symbol => symbol.name === 'BoxProps')
    if (box) {
      const props = checker.getDeclaredTypeOfSymbol(box)
      for (const name of ['size', 'solid']) {
        const field = props.getProperty(name)
        assert.ok(field?.getDocumentationComment(checker).length,
                  `Missing X3D field documentation for BoxProps.${name}`)
      }
    }
    for (const name of ['element', 'fragment', 'observe', 'project', 'toHtmlString']) {
      const symbol = exports.find(symbol => symbol.name === name)
      const definition = symbol?.flags & ts.SymbolFlags.Alias
        ? checker.getAliasedSymbol(symbol) : symbol
      assert.ok(definition?.getDocumentationComment(checker).length,
                `Missing editor documentation for ${module.name}: ${name}`)
    }
  }
}

const checkBundle = async (entry, hasScenes) => {
  const { output } = await build({
    root: scratch, configFile: false, logLevel: 'error',
    build: { write: false,
             rollupOptions: { input: path.join(scratch, entry),
                              preserveEntrySignatures: 'strict' }}
  })
  const modules = output.filter(file => file.type === 'chunk')
    .flatMap(chunk => chunk.moduleIds)
  for (const pattern of [/\/src\/3d\.js$/, /\/src\/x3dom\.js$/])
    assert.equal(modules.some(id => pattern.test(id)), hasScenes, entry)
  for (const asset of ['x3dom-full.js', 'x3dom.css'])
    assert.equal(output.some(file => file.names?.includes(asset)),
                 hasScenes, `${entry}: ${asset}`)
}

try {
  const [pack] = JSON.parse(run('npm', ['pack', '--json', '--pack-destination',
                                        scratch], library))
  for (const file of ['package.json', 'index.ts', 'runtime.mjs', 'app.js'])
    copyFileSync(path.join(library, 'test/consumer', file),
                 path.join(scratch, file))

  run('npm', ['install', '--offline', '--ignore-scripts', '--no-audit',
              '--no-fund', path.join(scratch, pack.filename)])
  run(process.execPath, ['runtime.mjs'])
  checkTypes()

  await checkBundle('app.js', false)
  copyFileSync(path.join(root, 'examples/views/cube.js'),
               path.join(scratch, 'cube.js'))
  await checkBundle('cube.js', true)
  console.log(`${pack.filename} (${pack.size} bytes): imports, editor docs and browser bundles passed.`)
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
