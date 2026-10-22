import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { boards, indexFromHash, wrapIndex, parseNotes } from '../public/studio/boards.js'

test('every published board has a unique deep link, original PNG and generation prompt', () => {
  assert.equal(boards.length, 9)
  assert.equal(boards[0].id, 'indigo-line')
  assert.equal(new Set(boards.map(b => b.id)).size, 9)
  for (const [index, board] of boards.entries()) {
    assert.equal(indexFromHash(`#${board.id}`), index)
    const image = new URL(`../public/studio/${board.image}`, import.meta.url)
    assert.equal(readFileSync(image).subarray(1, 4).toString(), 'PNG')
    assert.ok(existsSync(new URL(`../public/studio/${board.prompt}`, import.meta.url)))
    assert.ok(board.alt && board.check && board.opinion)
  }
})
test('invalid or section hashes start safely and both navigation directions wrap', () => {
  assert.equal(indexFromHash('#archive'), 0)
  assert.equal(indexFromHash('#%bad'), 0)
  assert.equal(indexFromHash(''), 0)
  assert.equal(wrapIndex(-1), 8)
  assert.equal(wrapIndex(9), 0)
})
test('corrupt or foreign local storage cannot break notes; only string notes are restored', () => {
  for (const input of [null, 'null', '[]', 'oops', '42']) assert.deepEqual(parseNotes(input), {})
  assert.deepEqual(parseNotes('{"black-knot":"hello","red-thread":42,"unknown":"secret"}'), { 'black-knot': 'hello' })
  assert.equal(parseNotes(JSON.stringify({ 'indigo-line': 'x'.repeat(6000) }))['indigo-line'].length, 5000)
  assert.equal(Object.hasOwn(parseNotes('{"__proto__":{"polluted":true}}'), '__proto__'), false)
})
