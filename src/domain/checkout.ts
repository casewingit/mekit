export type DeliveryInput = {
  recipient: string
  phone: string
  postalCode: string
  address: string
  detail: string
  terms: boolean
  privacy: boolean
  production: boolean
}
export function validateDelivery(input: DeliveryInput): Record<string, string> {
  const errors: Record<string, string> = {}
  if (input.recipient.trim().length < 2)
    errors.recipient = '받는 분 이름을 두 글자 이상 입력해 주세요.'
  if (!/^01[016789]\d{7,8}$/.test(input.phone.replace(/[\s-]/g, '')))
    errors.phone = '휴대전화 번호를 확인해 주세요.'
  if (!/^\d{5}$/.test(input.postalCode.trim()))
    errors.postalCode = '우편번호 다섯 자리를 입력해 주세요.'
  if (input.address.trim().length < 5) errors.address = '도로명 또는 지번 주소를 입력해 주세요.'
  if (!input.terms) errors.terms = '이용약관에 동의해 주세요.'
  if (!input.privacy) errors.privacy = '배송정보 사용 안내에 동의해 주세요.'
  if (!input.production) errors.production = '제작 사양과 예정일을 확인해 주세요.'
  return errors
}
