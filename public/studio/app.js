import { boards, indexFromHash, wrapIndex, parseNotes } from './boards.js?v=20261023-2'

const $ = id => document.getElementById(id)
const storageKey = 'mekit-studio-review-v1'
let notes = {}
let storageAvailable = true
try { notes = parseNotes(localStorage.getItem(storageKey)) } catch { storageAvailable = false }
let current = indexFromHash(location.hash)
const dialog = $('lightbox')
const thumbnails = []

for (const [index, board] of boards.entries()) {
  const button = document.createElement('button')
  button.className = 'thumb'
  button.setAttribute('aria-label', `${String(index + 1).padStart(2, '0')} ${board.title} 보기`)
  const image = document.createElement('img')
  image.src = board.image
  image.alt = ''
  image.width = 1536
  image.height = 1024
  image.loading = 'lazy'
  const title = document.createElement('span')
  title.className = 'thumb-title'
  const number = document.createElement('small')
  number.textContent = String(index + 1).padStart(2, '0')
  title.append(number, document.createTextNode(board.title))
  const subtitle = document.createElement('span')
  subtitle.className = 'thumb-sub'
  subtitle.textContent = board.korean
  button.append(image, title, subtitle)
  button.addEventListener('click', () => { show(index); $('gallery').scrollIntoView({ block: 'start' }) })
  $('thumbnails').append(button)
  thumbnails.push(button)
}

function show(index, updateHash = true) {
  current = wrapIndex(index)
  const board = boards[current]
  $('board-image').src = board.image
  $('board-image').alt = board.alt
  $('image-error').hidden = true
  $('board-type').textContent = board.type
  $('counter').textContent = `${String(current + 1).padStart(2, '0')} / ${String(boards.length).padStart(2, '0')}`
  $('board-title').textContent = board.title
  $('board-korean').textContent = board.korean
  $('board-line').textContent = board.line
  $('board-description').textContent = board.description
  $('knot-note').textContent = board.knot
  $('opinion-note').textContent = board.opinion
  $('check-note').textContent = board.check
  $('original').href = $('download').href = board.image
  $('download').download = `mekit-${board.id}.png`
  $('prompt-link').href = board.prompt
  $('note-label').textContent = `${board.title} 검토 메모`
  $('review-note').value = notes[board.id] || ''
  $('note-status').textContent = storageAvailable ? (notes[board.id] ? '저장된 메모' : '이 브라우저에 저장') : '임시 메모 · 내보내기 필요'
  $('palette').replaceChildren(...board.colors.map(([name, color]) => {
    const swatch = document.createElement('span')
    swatch.className = 'swatch'
    swatch.style.setProperty('--color', color)
    const chip = document.createElement('i')
    chip.setAttribute('aria-hidden', 'true')
    swatch.append(chip, document.createTextNode(name))
    swatch.title = `${name} ${color}`
    return swatch
  }))
  $('tags').replaceChildren(...board.tags.map(text => {
    const tag = document.createElement('span'); tag.textContent = text; return tag
  }))
  thumbnails.forEach((button, i) => button.setAttribute('aria-current', String(i === current)))
  document.title = `${board.title} — MEKIT STUDIO`
  if (dialog.open) updateLightbox()
  if (updateHash) history.replaceState(null, '', `#${board.id}`)
}

function updateLightbox() {
  const board = boards[current]
  $('lightbox-image').src = board.image
  $('lightbox-image').alt = board.alt
  $('lightbox-title').textContent = `${String(current + 1).padStart(2, '0')} / ${board.title}`
}

function move(delta) { show(current + delta) }
$('previous').addEventListener('click', () => move(-1))
$('next').addEventListener('click', () => move(1))
$('lightbox-prev').addEventListener('click', () => move(-1))
$('lightbox-next').addEventListener('click', () => move(1))
$('image-open').addEventListener('click', () => {
  if (suppressClick) { suppressClick = false; return }
  updateLightbox(); dialog.showModal()
})
$('close-lightbox').addEventListener('click', () => dialog.close())
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return
  const rect = dialog.getBoundingClientRect()
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close()
})
document.addEventListener('keydown', event => {
  if (event.target.closest('textarea, input, select, [contenteditable="true"]') || event.altKey || event.metaKey || event.ctrlKey) return
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1)
  }
})
window.addEventListener('hashchange', () => {
  if (boards.some(board => `#${board.id}` === location.hash)) show(indexFromHash(location.hash), false)
})
$('board-image').addEventListener('error', () => { $('image-error').hidden = false })

let gesture = null
let suppressClick = false
$('stage').addEventListener('pointerdown', event => {
  suppressClick = false
  if (event.pointerType !== 'mouse') gesture = { x: event.clientX, y: event.clientY }
})
$('stage').addEventListener('pointercancel', () => { gesture = null })
$('stage').addEventListener('pointerup', event => {
  if (!gesture) return
  const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y
  gesture = null
  if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    suppressClick = true; move(dx < 0 ? 1 : -1)
  }
})

$('review-note').addEventListener('input', event => {
  notes[boards[current].id] = event.target.value.slice(0, 5000)
  try {
    localStorage.setItem(storageKey, JSON.stringify(notes)); storageAvailable = true
    $('note-status').textContent = '자동 저장됨 · 현재 브라우저'
  } catch {
    storageAvailable = false
    $('note-status').textContent = '저장 불가 · 내보내기로 보관하세요'
  }
})
$('export-notes').addEventListener('click', () => {
  const body = ['# MEKIT Studio — 검토 메모', '', 'Series 001 / Global Maedeup', '', ...boards.flatMap(board => [`## ${board.title}`, notes[board.id] || '(메모 없음)', ''])].join('\n')
  const blob = new Blob([body], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url; link.download = 'mekit-studio-review.md'
  document.body.append(link); link.click(); link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  $('export-status').textContent = '검토 메모 파일 다운로드를 요청했습니다.'
})

show(current, false)
