import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Info, LockKeyhole } from 'lucide-react'
import { getProduct } from '../domain/catalog'
import { isValidLength, cm, money, fits, type Fit } from '../domain/sizing'
import { validateDelivery, type DeliveryInput } from '../domain/checkout'
import { demo, businessDate, dateLabel } from '../services/demo'
import { ConceptImage } from '../components/ConceptImage'

export function Checkout() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const product = getProduct(params.get('product') ?? '')
  const length = Number(params.get('length'))
  const wrist = params.has('wrist') ? Number(params.get('wrist')) : undefined
  const fit = fits.some((f) => f.id === params.get('fit')) ? (params.get('fit') as Fit) : undefined
  const [input, setInput] = useState<DeliveryInput>({
    recipient: '',
    phone: '',
    postalCode: '',
    address: '',
    detail: '',
    terms: false,
    privacy: false,
    production: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const locked = useRef(false)
  const key = useRef(crypto.randomUUID())
  const form = useRef<HTMLFormElement>(null)
  const productionDate = dateLabel(businessDate(new Date(), 3))
  const shippingDate = dateLabel(businessDate(new Date(), 5))
  function field(name: keyof DeliveryInput, value: string | boolean) {
    setInput((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[name]
      return next
    })
  }
  function submit(e: FormEvent) {
    e.preventDefault()
    if (locked.current || !product || !isValidLength(length)) return
    const next = validateDelivery(input)
    setErrors(next)
    if (Object.keys(next).length) {
      const name = Object.keys(next)[0]
      form.current?.querySelector<HTMLInputElement>(`[name="${name}"]`)?.focus()
      return
    }
    locked.current = true
    setBusy(true)
    try {
      const order = demo.createOrder(
        {
          productCode: product.code,
          length,
          ...(wrist && Number.isFinite(wrist) && Number.isInteger(wrist * 2) ? { wrist } : {}),
          ...(fit ? { fit } : {}),
        },
        key.current,
      )
      setInput({
        recipient: '',
        phone: '',
        postalCode: '',
        address: '',
        detail: '',
        terms: false,
        privacy: false,
        production: false,
      })
      navigate(`/orders/${order.id}?new=1`, { replace: true })
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error ? error.message : '주문을 만들지 못했어요. 다시 시도해 주세요.',
      })
      locked.current = false
      setBusy(false)
    }
  }
  if (!product || !isValidLength(length))
    return (
      <section className="empty-state section-wrap standalone-section">
        <h1>먼저 나의 팔찌를 선택해 주세요.</h1>
        <p>제품과 제작 가능한 길이를 선택하면 주문서를 만들 수 있어요.</p>
        <Link className="button primary" to="/products">
          컬렉션 보기 <ArrowRight size={16} />
        </Link>
      </section>
    )
  const fields: {
    name: 'recipient' | 'phone' | 'postalCode' | 'address' | 'detail'
    label: string
    placeholder: string
    maxLength: number
    inputMode?: 'tel' | 'numeric'
  }[] = [
    {
      name: 'recipient',
      label: '받는 분',
      placeholder: '데모 이름을 입력해 주세요',
      maxLength: 40,
    },
    {
      name: 'phone',
      label: '휴대전화',
      placeholder: '010-0000-0000',
      maxLength: 15,
      inputMode: 'tel',
    },
    {
      name: 'postalCode',
      label: '우편번호',
      placeholder: '우편번호 5자리',
      maxLength: 5,
      inputMode: 'numeric',
    },
    {
      name: 'address',
      label: '기본 주소',
      placeholder: '데모 주소를 입력해 주세요',
      maxLength: 120,
    },
    { name: 'detail', label: '상세 주소 (선택)', placeholder: '동·호수 등', maxLength: 80 },
  ]
  const agreements: { name: 'terms' | 'privacy' | 'production'; label: string; path: string }[] = [
    { name: 'terms', label: '이용약관에 동의합니다', path: '/policies/terms' },
    { name: 'privacy', label: '배송정보 사용 안내에 동의합니다', path: '/policies/privacy' },
    { name: 'production', label: '제작 사양과 예정일을 확인했습니다', path: '/policies/returns' },
  ]
  return (
    <section className="section-wrap standalone-section checkout-page">
      <Link className="back-link" to={`/products/${product.code}`}>
        <ArrowLeft size={15} />
        길이 다시 선택하기
      </Link>
      <p className="eyebrow">ONE STEP CLOSER TO YOUR OWN</p>
      <h1>나만의 한 줄을 완성해요.</h1>
      <div className="info-banner">
        <Info size={18} />
        <p>
          <strong>데모 주문입니다.</strong> 실제 결제·배송은 발생하지 않아요. 실제 개인정보 대신
          예시 정보를 입력해 주세요. 배송지 정보는 저장되지 않습니다.
        </p>
      </div>
      <form ref={form} noValidate onSubmit={submit} className="checkout-grid">
        <div className="checkout-form">
          <h2>
            <span className="step-number">01</span>배송정보
          </h2>
          <div className="form-field-grid">
            {fields.map((item) => (
              <div
                key={item.name}
                className={`form-field ${item.name === 'address' || item.name === 'detail' ? 'wide' : ''}`}
              >
                <label htmlFor={`delivery-${item.name}`}>{item.label}</label>
                <input
                  id={`delivery-${item.name}`}
                  name={item.name}
                  value={input[item.name]}
                  onChange={(e) => field(item.name, e.target.value)}
                  placeholder={item.placeholder}
                  autoComplete="off"
                  maxLength={item.maxLength}
                  inputMode={item.inputMode}
                  aria-invalid={!!errors[item.name]}
                  aria-describedby={errors[item.name] ? `${item.name}-error` : undefined}
                />
                {errors[item.name] && (
                  <p role="alert" className="field-error" id={`${item.name}-error`}>
                    {errors[item.name]}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="privacy-note">
            <LockKeyhole size={15} />
            <span>입력한 이름·전화·주소는 데모 확인에만 사용하고 보관하지 않아요.</span>
          </div>
          <h2 className="agreement-heading">
            <span className="step-number">02</span>주문 전 확인
          </h2>
          <div className="spec-check">
            <p>
              선택한 완성 길이 <strong>{cm(length)}</strong>
            </p>
            <p>
              제작 완료 예상 <strong>{productionDate}</strong>
            </p>
            <p>
              출고 예상 <strong>{shippingDate}</strong>
            </p>
            <small>주문 후 제작 · 길이 허용오차 ±0.3cm (제안 기준)</small>
          </div>
          <div className="agreements">
            {agreements.map((item) => (
              <div key={item.name}>
                <div className="agreement-row">
                  <label>
                    <input
                      type="checkbox"
                      name={item.name}
                      checked={input[item.name]}
                      onChange={(e) => field(item.name, e.target.checked)}
                      aria-invalid={!!errors[item.name]}
                      aria-describedby={errors[item.name] ? `${item.name}-error` : undefined}
                    />
                    <span>
                      <small>[필수]</small> {item.label}
                    </span>
                  </label>
                  <Link
                    to={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${item.label} 내용 보기 (새 탭)`}
                  >
                    보기
                  </Link>
                </div>
                {errors[item.name] && (
                  <p className="field-error" role="alert" id={`${item.name}-error`}>
                    {errors[item.name]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
        <aside className="order-summary">
          <p className="eyebrow">YOUR SELECTION</p>
          <ConceptImage scene={product.code} alt={`${product.name} 주문 제품 콘셉트 이미지`} />
          <div className="summary-product">
            <h2>{product.name}</h2>
            <p>{product.subtitle}</p>
            <span>{cm(length)} / 수량 1</span>
          </div>
          <div className="summary-prices">
            <p>
              <span>제품 금액</span>
              <strong>{money(product.price)}</strong>
            </p>
            <p>
              <span>길이 추가금</span>
              <strong>0원</strong>
            </p>
            <p>
              <span>
                배송비 <small>(데모 기준)</small>
              </span>
              <strong>0원</strong>
            </p>
          </div>
          <div className="summary-total">
            <span>합계</span>
            <strong>{money(product.price)}</strong>
          </div>
          {errors.submit && (
            <p className="field-error" role="alert">
              {errors.submit}
            </p>
          )}
          <button type="submit" className="button primary" disabled={busy}>
            {busy ? '주문을 만드는 중…' : `${money(product.price)} 데모 주문 만들기`}
            <ArrowRight size={16} />
          </button>
          <p className="fine-print">
            실제 토스페이 연동은 가맹 승인 후 제공됩니다.
            <br />
            지금은 주문 흐름을 체험할 수 있어요.
          </p>
        </aside>
      </form>
    </section>
  )
}
