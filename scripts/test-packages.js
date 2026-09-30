import { copyFileSync, mkdtempSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { tmpdir } from 'node:os'

const root = fileURLToPath(new URL('../', import.meta.url))
const scratch = mkdtempSync(path.join(tmpdir(), 'elements-packages-'))
const env = { ...process.env, npm_config_cache: path.join(scratch, '.npm'),
              npm_config_loglevel: 'notice' }
const run = (command, args, cwd = root) =>
  execFileSync(command, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe']}).toString()

try {
  const archives = ['elements', 'elements-x3dom'].map(name => {
    const output = run('npm', ['pack', '--json', '--pack-destination', scratch],
                       path.join(root, 'packages', name))
    const [pack] = JSON.parse(output)
    if (!pack.files.some(file => file.path === `types/${name === 'elements' ? 'elements' : 'x3dom'}.d.ts`))
      throw new Error(`${name} package is missing its declarations`)
    return path.join(scratch, pack.filename)
  })
  const fixtures = path.join(root, 'packages/elements/test/consumer')
  ;['package.json', 'index.ts'].forEach(name =>
    copyFileSync(path.join(fixtures, name), path.join(scratch, name)))
  run('npm', ['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', ...archives], scratch)
  run(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'),
                         '--noEmit', '--strict', '--module', 'nodenext', '--target', 'es2022', 'index.ts'], scratch)
  run(process.execPath, ['--input-type=module', '-e',
                         'import { observe, div, toHtmlString } from \'@pfern/elements\'; '
    + 'import { math, mi } from \'@pfern/elements/mathml\'; '
    + 'import { box } from \'@pfern/elements-x3dom\'; '
    + 'if (toHtmlString(observe(() => div(math(mi(\'x\')), box()))()) !== '
    + '\'<div><math><mi>x</mi></math><box></box></div>\') throw Error(\'Packed runtime mismatch\')'], scratch)
  console.log('Both packed packages pass strict consumer typechecking and runtime imports.')
} catch (error) {
  console.error(error.stderr?.toString() || error.stdout?.toString() || error)
  process.exitCode = 1
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
