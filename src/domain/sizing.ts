export type Fit = 'snug' | 'comfortable' | 'loose'
export type SizeSelection = { productCode: string; length: number; wrist?: number; fit?: Fit }
export const fits: { id: Fit; label: string; allowance: number; description: string }[] = [
  { id: 'snug', label: '딱 맞게', allowance: 0.5, description: '손목에 가볍게 밀착' },
  { id: 'comfortable', label: '편안하게', allowance: 1, description: '매일 편안한 여유' },
  { id: 'loose', label: '여유 있게', allowance: 1.5, description: '자연스럽게 흐르는 핏' },
]
export const lengths = Array.from({ length: 13 }, (_, i) => 15 + i * 0.5)
export const wrists = Array.from({ length: 25 }, (_, i) => 12 + i * 0.5)
export function recommendLength(wrist: number, fit: Fit): number {
  if (!Number.isFinite(wrist) || wrist <= 0 || !Number.isInteger(wrist * 2))
    throw new Error('손목 둘레는 0.5cm 단위로 입력해 주세요.')
  const allowance = fits.find((item) => item.id === fit)?.allowance
  if (allowance === undefined) throw new Error('착용감을 선택해 주세요.')
  return wrist + allowance
}
export function isValidLength(length: number): boolean {
  return Number.isFinite(length) && length >= 15 && length <= 21 && Number.isInteger(length * 2)
}
export function quote(product: { price: number }, length: number): number {
  if (!isValidLength(length)) throw new Error('제공 범위를 벗어난 사이즈는 상담이 필요해요.')
  return product.price
}
export const cm = (value: number) => `${value.toFixed(1)}cm`
export const money = (value: number) => `${new Intl.NumberFormat('ko-KR').format(value)}원`
