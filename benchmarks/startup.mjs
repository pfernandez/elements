import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const driver = path.join(root, '.cache/js-framework-benchmark/webdriver-ts')
const { initializeFrameworks } = await import(pathToFileURL(path.join(driver, 'dist/common.js')))
const { executeBenchmark } = await import(pathToFileURL(path.join(driver, 'dist/forkedBenchmarkRunnerLighthouse.js')))
const options = { host: 'localhost', port: 8080, remoteDebuggingPort: 9999,
  chromeBinaryPath: process.env.CHROME_BIN || '/usr/bin/google-chrome', headless: true }
const names = ['keyed/elements-retained', 'keyed/react-hooks']
const frameworks = await initializeFrameworks(options, name => names.includes(name))
if (frameworks.length !== names.length) throw new Error('Build both comparison adapters first.')
const results = {
  recordedAt: new Date().toISOString(),
  lighthouse: JSON.parse(readFileSync(path.join(driver, 'node_modules/lighthouse/package.json'))).version,
  methodology: 'Pinned harness Lighthouse implementation and defaults; three fresh-browser runs per framework; no warmups.',
  measurements: []
}

// The pinned general runner assigns STARTUP_MAIN zero iterations. Invoke its
// existing Lighthouse implementation directly and retain missing audits as null.
for (const framework of frameworks)
  for (let sample = 0; sample < 3; sample++) {
    // Distinct ports prevent ChromeLauncher from reusing a browser still exiting.
    const response = await executeBenchmark(framework, '30_startup', {
      ...options, remoteDebuggingPort: options.remoteDebuggingPort + results.measurements.length
    })
    if (response.error || !Array.isArray(response.result) || !response.result.length)
      throw new Error(response.error || 'No startup results returned')
    results.measurements.push({ framework: framework.fullNameWithKeyedAndVersion, sample,
      audits: response.result.map(({ benchmark, result }) => ({ id: benchmark.id,
        property: benchmark.property, milliseconds: Number.isFinite(result) ? result : null })) })
  }
const output = path.join(root, '.cache/elements-diagnostics/startup')
mkdirSync(output, { recursive: true })
writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n')
console.log(`Saved ${output}/results.json`)
