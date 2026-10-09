import { getProduct, type ProductCode } from '../domain/catalog'
import {
  isValidLength,
  quote,
  recommendLength,
  type Fit,
  type SizeSelection,
} from '../domain/sizing'
export type StorageLike = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}
export type OrderAction = 'cancel' | 'return' | 'repair'
export type DemoOrder = {
  id: string
  idempotencyKey: string
  productCode: ProductCode
  productName: string
  price: number
  length: number
  wrist?: number
  fit?: Fit
  createdAt: string
  productionDate: string
  shippingDate: string
  status: 'DEMO_CREATED'
  request?: OrderAction
}
const storageKey = 'mekit.demo-orders.v1'
export function businessDate(start: Date, days: number): string {
  // Use Seoul calendar days regardless of the device's timezone.
  // The demo estimates weekdays only; a production calendar must include holidays.
  const seoul = new Date(start.getTime() + 9 * 60 * 60 * 1000)
  const date = new Date(Date.UTC(seoul.getUTCFullYear(), seoul.getUTCMonth(), seoul.getUTCDate()))
  while (days > 0) {
    date.setUTCDate(date.getUTCDate() + 1)
    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) days -= 1
  }
  return date.toISOString()
}
export function dateLabel(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(value))
}
function recoverOrder(value: unknown): DemoOrder | undefined {
  if (!value || typeof value !== 'object') return
  const v = value as Record<string, unknown>
  const product = typeof v.productCode === 'string' && getProduct(v.productCode)
  if (
    !product ||
    typeof v.id !== 'string' ||
    !/^MK-[A-Za-z0-9-]+$/.test(v.id) ||
    typeof v.idempotencyKey !== 'string' ||
    typeof v.productName !== 'string' ||
    typeof v.price !== 'number' ||
    v.price <= 0 ||
    typeof v.length !== 'number' ||
    !isValidLength(v.length) ||
    v.status !== 'DEMO_CREATED' ||
    ![v.createdAt, v.productionDate, v.shippingDate].every(
      (d) => typeof d === 'string' && Number.isFinite(Date.parse(d)),
    )
  )
    return
  return {
    id: v.id,
    idempotencyKey: v.idempotencyKey,
    productCode: product.code,
    productName: v.productName,
    price: v.price,
    length: v.length,
    createdAt: v.createdAt as string,
    productionDate: v.productionDate as string,
    shippingDate: v.shippingDate as string,
    status: 'DEMO_CREATED',
    ...(typeof v.wrist === 'number' && Number.isFinite(v.wrist) ? { wrist: v.wrist } : {}),
    ...(['snug', 'comfortable', 'loose'].includes(v.fit as string) ? { fit: v.fit as Fit } : {}),
    ...(['cancel', 'return', 'repair'].includes(v.request as string)
      ? { request: v.request as OrderAction }
      : {}),
  }
}
export class DemoService {
  storageAvailable = true
  private orders: DemoOrder[] = []
  constructor(private storage?: StorageLike) {
    if (!storage) this.storageAvailable = false
    try {
      const raw = storage?.getItem(storageKey)
      const data: unknown = raw ? JSON.parse(raw) : []
      if (Array.isArray(data))
        this.orders = data.map(recoverOrder).filter((o): o is DemoOrder => !!o)
    } catch {
      this.storageAvailable = false
    }
  }
  private persist() {
    try {
      this.storage?.setItem(storageKey, JSON.stringify(this.orders))
    } catch {
      this.storageAvailable = false
    }
  }
  createOrder(selection: SizeSelection, key: string): DemoOrder {
    if (!key.trim()) throw new Error('주문 식별자가 필요해요.')
    const product = getProduct(selection.productCode)
    if (!product) throw new Error('제품을 찾을 수 없어요.')
    const price = quote(product, selection.length)
    if (selection.wrist !== undefined || selection.fit !== undefined) {
      if (
        selection.wrist === undefined ||
        selection.fit === undefined ||
        recommendLength(selection.wrist, selection.fit) !== selection.length
      ) {
        throw new Error('손목 둘레와 착용감에 맞는 완성 길이를 다시 확인해 주세요.')
      }
    }
    const previous = this.orders.find((o) => o.idempotencyKey === key)
    if (previous) {
      if (previous.productCode !== product.code || previous.length !== selection.length)
        throw new Error('다른 사양의 주문을 다시 확인해 주세요.')
      return { ...previous }
    }
    const now = new Date()
    const order: DemoOrder = {
      id: `MK-${businessDate(now, 0).slice(0, 10).replaceAll('-', '')}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      idempotencyKey: key,
      productCode: product.code,
      productName: product.name,
      price,
      length: selection.length,
      ...(selection.wrist !== undefined ? { wrist: selection.wrist } : {}),
      ...(selection.fit ? { fit: selection.fit } : {}),
      createdAt: now.toISOString(),
      productionDate: businessDate(now, 3),
      shippingDate: businessDate(now, 5),
      status: 'DEMO_CREATED',
    }
    this.orders.unshift(order)
    this.persist()
    return { ...order }
  }
  readOrders(): DemoOrder[] {
    return this.orders.map((o) => ({ ...o }))
  }
  requestAction(id: string, action: OrderAction): DemoOrder {
    if (!['cancel', 'return', 'repair'].includes(action))
      throw new Error('요청 유형을 확인해 주세요.')
    const order = this.orders.find((o) => o.id === id)
    if (!order) throw new Error('주문을 찾을 수 없어요.')
    if (order.request) throw new Error('이미 기록한 요청이 있어요.')
    order.request = action
    this.persist()
    return { ...order }
  }
}
function browserStorage(): StorageLike | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}
export const demo = new DemoService(browserStorage())

export type LocalInquiry = { id: string; category: string; status: 'LOCAL_ONLY' }
export function createLocalInquiry(category: string, message: string): LocalInquiry {
  if (!['사이즈 상담', '소재·관리', '주문·배송', '교환·반품·수선', '기타'].includes(category)) {
    throw new Error('문의 유형을 선택해 주세요.')
  }
  if (message.trim().length < 10 || message.length > 1500) {
    throw new Error('문의 내용을 10~1,500자 사이로 입력해 주세요.')
  }
  // Intentionally no network call, persistent storage, or retained message text.
  return { id: crypto.randomUUID(), category, status: 'LOCAL_ONLY' }
}
