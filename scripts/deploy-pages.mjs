import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const dist = resolve(root, 'dist')

function git(args, cwd = root) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || 'Git command failed')
  return result.stdout.trim()
}

if (!existsSync(resolve(dist, 'index.html'))) {
  throw new Error('Pages 빌드가 없습니다. npm run deploy:pages를 실행하세요.')
}

const remote = git(['remote', 'get-url', 'origin'])
const branchExists = Boolean(git(['ls-remote', '--heads', remote, 'refs/heads/gh-pages']))
const temporary = mkdtempSync(resolve(tmpdir(), 'mekit-pages-'))
const checkout = resolve(temporary, 'site')

try {
  if (branchExists) {
    git(['clone', '--single-branch', '--branch', 'gh-pages', remote, checkout])
  } else {
    git(['init', '--initial-branch=gh-pages', checkout])
    git(['remote', 'add', 'origin', remote], checkout)
  }
  git(['config', 'user.name', git(['config', 'user.name'])], checkout)
  git(['config', 'user.email', git(['config', 'user.email'])], checkout)

  // Only replace files inside this disposable checkout; preserve the Pages branch history.
  for (const entry of readdirSync(checkout)) {
    if (entry !== '.git') rmSync(resolve(checkout, entry), { recursive: true, force: true })
  }
  cpSync(dist, checkout, { recursive: true })
  writeFileSync(resolve(checkout, '.nojekyll'), '')
  git(['add', '--all'], checkout)
  if (!git(['status', '--porcelain'], checkout)) {
    console.log('게시된 빌드와 동일합니다. 변경 사항이 없습니다.')
  } else {
    const revision = git(['rev-parse', '--short', 'HEAD'])
    git(['commit', '-m', `Deploy MEKIT ${revision}`], checkout)
    git(['push', 'origin', 'HEAD:refs/heads/gh-pages'], checkout)
    console.log('Pages 게시 브랜치를 업데이트했습니다: https://casewingit.github.io/mekit/')
  }
} finally {
  rmSync(temporary, { recursive: true, force: true })
}
