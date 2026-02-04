import fs from 'node:fs'
import path from 'node:path'

const readJson = filePath =>
  JSON.parse(fs.readFileSync(filePath, 'utf8'))

const isDirectory = filePath =>
  fs.statSync(filePath).isDirectory()

const listFilesRecursive = dirPath =>
  fs.readdirSync(dirPath, { withFileTypes: true })
    .flatMap(entry => {
      const fullPath = path.join(dirPath, entry.name)
      if (entry.isDirectory()) return listFilesRecursive(fullPath)
      return [fullPath]
    })

const toWorkspaceRelative = filePath =>
  path.relative(process.cwd(), filePath)

const dedupe = xs => Array.from(new Set(xs))

const sum = xs => xs.reduce((a, b) => a + b, 0)

const formatBytes = bytes =>
  bytes < 1024 ? `${bytes} B`
    : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(2)} MB`

const main = () => {
  const pkgDir = path.resolve(process.argv[2] || '.')
  const pkg = readJson(path.join(pkgDir, 'package.json'))
  const included = dedupe([
    'package.json',
    'README.md',
    'LICENSE',
    ...(pkg.files || [])
  ])

  const expanded = dedupe(
    included.flatMap(entry => {
      const fullPath = path.resolve(pkgDir, entry)
      if (!fs.existsSync(fullPath)) return []
      return isDirectory(fullPath)
        ? listFilesRecursive(fullPath)
        : [fullPath]
    })
  )

  const rows =
    expanded
      .filter(filePath =>
        !filePath.includes(`${path.sep}node_modules${path.sep}`)
      )
      .map(filePath => {
        const bytes = fs.statSync(filePath).size
        return { file: toWorkspaceRelative(filePath), bytes }
      })

  const totalBytes = sum(rows.map(r => r.bytes))
  const largest = [...rows].sort((a, b) => b.bytes - a.bytes).slice(0, 20)

  console.log(`name: ${pkg.name}`)
  pkg.version && console.log(`version: ${pkg.version}`)
  console.log(`files: ${rows.length}`)
  console.log(`bytes: ${totalBytes} (${formatBytes(totalBytes)})`)
  console.log('')
  console.log('largest:')
  for (const r of largest) console.log(`- ${formatBytes(r.bytes)}\t${r.file}`)
}

main()
