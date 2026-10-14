import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const candidates = process.env.MEKIT_RENDER_PYTHON
  ? [process.env.MEKIT_RENDER_PYTHON]
  : [
      join(root, '.venv-reference/bin/python3'),
      'python3',
      join(
        homedir(),
        '.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',
      ),
    ]
const python = candidates.find(
  (path) =>
    (path === 'python3' || existsSync(path)) &&
    spawnSync(path, ['-c', 'import PIL, numpy'], { stdio: 'ignore' }).status === 0,
)
if (!python) {
  console.error(
    'Python 3 + Pillow + NumPy가 필요합니다.\npython3 -m venv .venv-reference\n.venv-reference/bin/python3 -m pip install -r scripts/requirements-render.txt\n또는 MEKIT_RENDER_PYTHON 환경변수로 준비된 Python 경로를 지정하세요.',
  )
  process.exit(1)
}
const args = process.argv.slice(2)
const test = args[0] === '--test'
const result = spawnSync(
  python,
  test
    ? ['-m', 'unittest', 'discover', '-s', 'scripts/tests']
    : [join(root, 'scripts/render_reference.py'), ...args],
  { cwd: root, stdio: 'inherit' },
)
if (result.error) console.error(result.error.message)
process.exit(result.status ?? 1)
