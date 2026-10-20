import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

// Publish only the new review space. Never rebuild or replace the existing landing.
const root = fileURLToPath(new URL('../', import.meta.url))
const source = resolve(root, 'public/studio')
function git(args, cwd = root) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(result.stderr || 'Git command failed')
  return result.stdout.trim()
}
function unchangedFiles(dir, prefix = '') {
  const result = []
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!prefix && ['.git', 'studio'].includes(entry.name)) continue
    const name = `${prefix}${entry.name}`, path = resolve(dir, entry.name)
    if (entry.isDirectory()) result.push(...unchangedFiles(path, `${name}/`))
    else result.push([name, createHash('sha256').update(readFileSync(path)).digest('hex')])
  }
  return result
}
for (const file of ['index.html', 'app.js', 'boards.js', 'styles.css', ...['01-black-knot', '02-indigo-line', '03-red-thread', '04-studio-space'].map(id => `images/${id}.png`)]) {
  if (!existsSync(resolve(source, file))) throw new Error(`Missing Studio file: ${file}`)
}
const temporary = mkdtempSync(resolve(tmpdir(), 'mekit-studio-publish-'))
const checkout = resolve(temporary, 'site')
try {
  const remote = git(['remote', 'get-url', 'origin'])
  git(['clone', '--single-branch', '--branch', 'gh-pages', remote, checkout])
  const before = JSON.stringify(unchangedFiles(checkout))
  const target = resolve(checkout, 'studio')
  rmSync(target, { recursive: true, force: true })
  cpSync(source, target, { recursive: true })
  if (JSON.stringify(unchangedFiles(checkout)) !== before) throw new Error('Files outside studio/ changed; refusing publication')
  git(['config', 'user.name', git(['config', 'user.name'])], checkout)
  git(['config', 'user.email', git(['config', 'user.email'])], checkout)
  git(['add', '--', 'studio'], checkout)
  if (git(['diff', '--cached', '--name-only'], checkout)) {
    git(['commit', '-m', `Publish MEKIT Studio ${git(['rev-parse', '--short', 'HEAD'])}`], checkout)
    git(['push', 'origin', 'HEAD:refs/heads/gh-pages'], checkout)
  }
  console.log(`PAGES_COMMIT=${git(['rev-parse', 'HEAD'], checkout)}`)
  console.log(`PRESERVED_LANDING_FILES=${JSON.parse(before).length}`)
  console.log('https://casewingit.github.io/mekit/studio/')
} finally {
  rmSync(temporary, { recursive: true, force: true })
}
