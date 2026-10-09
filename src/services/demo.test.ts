import { describe, expect, it } from 'vitest'
import { DemoService, businessDate, createLocalInquiry, type StorageLike } from './demo'

class MemoryStorage implements StorageLike {
  value: string | null = null
  getItem() {
    return this.value
  }
  setItem(_key: string, value: string) {
    this.value = value
  }
}

describe('demo order lifecycle', () => {
  it('records a catalog-priced snapshot and recovers it after reload', () => {
    const storage = new MemoryStorage()
    const service = new DemoService(storage)
    const order = service.createOrder({ productCode: 'earth', length: 17.5 }, 'once')
    expect(order.price).toBe(39000)
    expect(order.length).toBe(17.5)
    expect(order.productName).toBe('EARTH')
    expect(new DemoService(storage).readOrders()[0].id).toBe(order.id)
  })
  it('makes the same submission idempotent', () => {
    const service = new DemoService(new MemoryStorage())
    const first = service.createOrder({ productCode: 'amber', length: 18 }, 'same')
    const second = service.createOrder({ productCode: 'amber', length: 18 }, 'same')
    expect(second.id).toBe(first.id)
    expect(service.readOrders()).toHaveLength(1)
  })
  it('rejects invalid product and size before storing an order', () => {
    const service = new DemoService(new MemoryStorage())
    expect(() => service.createOrder({ productCode: 'fake', length: 18 }, 'one')).toThrow()
    expect(() => service.createOrder({ productCode: 'earth', length: 22 }, 'two')).toThrow()
    expect(service.readOrders()).toEqual([])
  })
  it('rejects inconsistent wrist recommendations rather than persisting a different specification', () => {
    const service = new DemoService(new MemoryStorage())
    expect(() =>
      service.createOrder({ productCode: 'earth', length: 20, wrist: 16, fit: 'snug' }, 'one'),
    ).toThrow()
    expect(() =>
      service.createOrder({ productCode: 'earth', length: 17, fit: 'comfortable' }, 'two'),
    ).toThrow()
    expect(service.readOrders()).toEqual([])
  })
  it('does not persist extra delivery data passed at runtime', () => {
    const storage = new MemoryStorage()
    const service = new DemoService(storage)
    service.createOrder(
      {
        productCode: 'earth',
        length: 17,
        recipient: 'PRIVATE_NAME',
        phone: 'PRIVATE_PHONE',
        address: 'PRIVATE_ADDRESS',
      } as Parameters<DemoService['createOrder']>[0],
      'private',
    )
    expect(storage.value).not.toContain('PRIVATE_')
  })
  it('recovers from malformed storage without crashing', () => {
    const storage = new MemoryStorage()
    storage.value = 'not-json'
    expect(new DemoService(storage).readOrders()).toEqual([])
    storage.value = '[null,{"id":"fake"}]'
    expect(new DemoService(storage).readOrders()).toEqual([])
  })
  it('keeps orders in memory when browser storage is unavailable', () => {
    const service = new DemoService({
      getItem() {
        throw Error('blocked')
      },
      setItem() {
        throw Error('blocked')
      },
    })
    service.createOrder({ productCode: 'industry', length: 21 }, 'one')
    expect(service.readOrders()).toHaveLength(1)
    expect(service.storageAvailable).toBe(false)
  })
  it('records a request without falsely claiming a refund', () => {
    const service = new DemoService(new MemoryStorage())
    const order = service.createOrder({ productCode: 'fragment', length: 16 }, 'one')
    const updated = service.requestAction(order.id, 'cancel')
    expect(updated.request).toBe('cancel')
    expect(updated.status).toBe('DEMO_CREATED')
    expect(() => service.requestAction(order.id, 'repair')).toThrow()
  })
})

describe('Seoul production dates', () => {
  it.each([
    ['2026-10-09T16:00:00.000Z', 1, '2026-10-12T00:00:00.000Z'],
    ['2026-10-09T16:00:00.000Z', 3, '2026-10-14T00:00:00.000Z'],
    ['2026-10-11T16:00:00.000Z', 1, '2026-10-13T00:00:00.000Z'],
  ])('uses the Korean calendar and skips weekends for %s', (start, days, expected) => {
    expect(businessDate(new Date(start), Number(days))).toBe(expected)
  })
})

describe('local support inquiry', () => {
  it('marks a valid inquiry as local only without returning or storing its message', () => {
    const result = createLocalInquiry('사이즈 상담', '내 손목에 맞는 길이가 궁금합니다.')
    expect(result.status).toBe('LOCAL_ONLY')
    expect(result.category).toBe('사이즈 상담')
    expect(result).not.toHaveProperty('message')
  })
  it('rejects incomplete messages and unsupported categories', () => {
    expect(() => createLocalInquiry('사이즈 상담', ' ')).toThrow()
    expect(() => createLocalInquiry('unknown', '내 손목에 맞는 길이가 궁금합니다.')).toThrow()
  })
})
