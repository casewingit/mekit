import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  Ruler,
  Plus,
  Minus,
  ZoomIn,
  X,
  Info,
} from 'lucide-react'
import { getProduct, getMaterial, type Product } from '../domain/catalog'
import {
  cm,
  money,
  lengths,
  wrists,
  fits,
  recommendLength,
  isValidLength,
  type Fit,
} from '../domain/sizing'
import { savedWrist } from '../domain/preferences'
import { ConceptImage } from '../components/ConceptImage'
import { Bracelet } from '../components/Bracelet'
import { useFavorites } from '../components/Favorites'
import { NotFound } from './NotFound'

export function ProductPage() {
  const { code = '' } = useParams()
  const product = getProduct(code)
  return product ? <ProductConfiguration key={product.code} product={product} /> : <NotFound />
}
function ProductConfiguration({ product }: { product: Product }) {
  const [mode, setMode] = useState<'wrist' | 'length'>('wrist')
  const [wrist, setWrist] = useState(savedWrist)
  const [fit, setFit] = useState<Fit>('comfortable')
  const [directLength, setDirectLength] = useState(17.5)
  const [gallery, setGallery] = useState<'concept' | 'preview'>('concept')
  const { favorites, toggle } = useFavorites()
  const navigate = useNavigate()
  const dialog = useRef<HTMLDialogElement>(null)
  const length = mode === 'wrist' ? recommendLength(wrist, fit) : directLength
  const valid = isValidLength(length)
  const saved = favorites.includes(product.code)
  function order() {
    if (!valid) return
    const query = new URLSearchParams({ product: product.code, length: String(length) })
    if (mode === 'wrist') {
      query.set('wrist', String(wrist))
      query.set('fit', fit)
    }
    navigate(`/checkout?${query}`)
  }
  return (
    <div className="section-wrap product-page">
      <Link className="back-link" to="/products">
        <ArrowLeft size={15} />
        컬렉션으로 돌아가기
      </Link>
      <div className="product-detail-grid">
        <div className="product-gallery">
          <div
            className={`detail-image ${gallery === 'preview' ? 'preview-mode' : ''}`}
            style={{ backgroundColor: product.background }}
          >
            {gallery === 'concept' ? (
              <ConceptImage scene={product.code} alt={`${product.name} 팔찌 콘셉트 이미지`} />
            ) : (
              <Bracelet product={product} length={length} />
            )}
            <span className="gallery-tag">
              NO. {product.number} / {gallery === 'concept' ? 'CONCEPT' : 'PREVIEW'}
            </span>
            <button
              className="zoom-button"
              aria-label="이미지 크게 보기"
              onClick={() => dialog.current?.showModal()}
            >
              <ZoomIn size={19} />
            </button>
          </div>
          <div className="gallery-controls">
            <button
              aria-pressed={gallery === 'concept'}
              className={gallery === 'concept' ? 'active' : ''}
              onClick={() => setGallery('concept')}
            >
              콘셉트 이미지
            </button>
            <button
              aria-pressed={gallery === 'preview'}
              className={gallery === 'preview' ? 'active' : ''}
              onClick={() => setGallery('preview')}
            >
              길이 미리보기
            </button>
            <span>기획 이미지 · 실물과 다를 수 있어요</span>
          </div>
          <div className="product-story">
            <p className="eyebrow">THE STORY OF {product.name}</p>
            <h2>{product.tagline}</h2>
            <p>{product.story}</p>
            <div className="detail-material-list">
              {product.materials.map((id) => (
                <Link key={id} to={`/materials#${id}`}>
                  <ConceptImage scene={id} alt={`${getMaterial(id).name} 소재 예시`} />
                  <span>{getMaterial(id).name}</span>
                  <ArrowRight size={13} />
                </Link>
              ))}
            </div>
            <p className="fine-print">
              소재 조성·등급·처리 방식은 최종 샘플 확정 후 안내합니다. 천연 소재의 색과 무늬에는
              자연스러운 차이가 있어요.
            </p>
          </div>
          <details className="product-accordion">
            <summary>
              오래 함께하기 위한 관리법 <Plus size={16} />
            </summary>
            <div>
              {product.materials.map((id) => (
                <p key={id}>
                  <strong>{getMaterial(id).name}</strong> {getMaterial(id).care}
                </p>
              ))}
            </div>
          </details>
        </div>
        <div className="product-config">
          <p className="eyebrow">THE FIRST COLLECTION / {product.number}</p>
          <div className="detail-title">
            <h1>{product.name}</h1>
            <button
              className="icon-button"
              aria-pressed={saved}
              aria-label={`${product.name} ${saved ? '찜 해제' : '찜하기'}`}
              onClick={() => toggle(product.code)}
            >
              <Heart size={23} fill={saved ? 'currentColor' : 'none'} />
            </button>
          </div>
          <p className="detail-subtitle">{product.subtitle}</p>
          <div className="detail-price">
            <strong>{money(product.price)}</strong>
            <span>15~21cm, 길이 추가금 없이</span>
          </div>
          <div className="config-section">
            <div className="config-heading">
              <h2>
                <span>01</span> 나에게 맞는 길이
              </h2>
              <Link to="/size-guide">
                <Ruler size={14} />
                측정 가이드
              </Link>
            </div>
            <div className="segmented-control">
              <button
                aria-pressed={mode === 'wrist'}
                className={mode === 'wrist' ? 'active' : ''}
                onClick={() => setMode('wrist')}
              >
                손목 둘레로 추천
              </button>
              <button
                aria-pressed={mode === 'length'}
                className={mode === 'length' ? 'active' : ''}
                onClick={() => setMode('length')}
              >
                완성 길이로 선택
              </button>
            </div>
            {mode === 'wrist' ? (
              <>
                <label className="field-label" htmlFor="wrist">
                  손목 둘레 <span>여유 없이 측정한 둘레</span>
                </label>
                <div className="stepper-select">
                  <button
                    aria-label="손목 둘레 줄이기"
                    disabled={wrist <= 12}
                    onClick={() => setWrist(wrist - 0.5)}
                  >
                    <Minus size={16} />
                  </button>
                  <select
                    id="wrist"
                    value={wrist}
                    onChange={(e) => setWrist(Number(e.target.value))}
                  >
                    {wrists.map((v) => (
                      <option key={v} value={v}>
                        {cm(v)}
                      </option>
                    ))}
                  </select>
                  <button
                    aria-label="손목 둘레 늘리기"
                    disabled={wrist >= 24}
                    onClick={() => setWrist(wrist + 0.5)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <p className="field-label">어떤 착용감이 좋으세요?</p>
                <div className="fit-options" role="group" aria-label="착용감 선택">
                  {fits.map((item) => (
                    <button
                      key={item.id}
                      className={fit === item.id ? 'active' : ''}
                      aria-pressed={fit === item.id}
                      onClick={() => setFit(item.id)}
                    >
                      <span>
                        {item.label}
                        {fit === item.id && <Check size={13} />}
                      </span>
                      <small>+{item.allowance.toFixed(1)}cm</small>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <label className="field-label" htmlFor="finished-length">
                  팔찌 완성 길이 <span>팔찌 전체의 길이</span>
                </label>
                <select
                  className="full-select"
                  id="finished-length"
                  value={directLength}
                  onChange={(e) => setDirectLength(Number(e.target.value))}
                >
                  {lengths.map((v) => (
                    <option value={v} key={v}>
                      {cm(v)}
                    </option>
                  ))}
                </select>
              </>
            )}
            <div className={`recommendation ${!valid ? 'out-of-range' : ''}`} aria-live="polite">
              <div>
                <span>{mode === 'wrist' ? '추천 완성 길이' : '선택한 완성 길이'}</span>
                <strong>{cm(length)}</strong>
              </div>
              <p>
                {valid
                  ? mode === 'wrist'
                    ? `손목 ${cm(wrist)} + 여유 ${fits.find((f) => f.id === fit)!.allowance.toFixed(1)}cm`
                    : '15~21cm 범위 내 같은 가격으로 제작해요.'
                  : '15~21cm를 벗어나는 길이는 먼저 상담해 주세요.'}
              </p>
              {!valid && (
                <Link to="/support">
                  사이즈 상담하기 <ArrowRight size={14} />
                </Link>
              )}
            </div>
            <div className="inline-preview">
              <Bracelet product={product} length={length} />
              <p>
                길이에 따른 구성·간격 예시입니다. 실제 크기나 정확한 비즈 수를 보장하지 않습니다.
              </p>
            </div>
          </div>
          <div className="production-note">
            <Info size={16} />
            <div>
              <strong>주문 후, 당신을 위해 만듭니다.</strong>
              <p>
                제작 3영업일 · 출고 5영업일 이내 예상
                <br />
                완성 길이 허용오차 ±0.3cm (제안 기준)
              </p>
            </div>
          </div>
          <div className="purchase-row">
            <div>
              <span>예상 제품 금액</span>
              <strong>{money(product.price)}</strong>
            </div>
            <button className="button primary" disabled={!valid} onClick={order}>
              {product.name} 주문하기 <ArrowRight size={17} />
            </button>
          </div>
          <p className="fine-print demo-product-note">
            데모 주문으로 이어집니다. 실제 결제는 발생하지 않아요.
          </p>
        </div>
      </div>
      <dialog
        ref={dialog}
        className="image-dialog"
        aria-label={`${product.name} 콘셉트 이미지 확대`}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close()
        }}
      >
        <button
          className="dialog-close icon-button"
          aria-label="큰 이미지 닫기"
          onClick={() => dialog.current?.close()}
        >
          <X />
        </button>
        <ConceptImage scene={product.code} alt={`${product.name} 콘셉트 이미지 확대`} />
        <p>콘셉트 이미지 · 실제 제품 사진이 아닙니다.</p>
      </dialog>
    </div>
  )
}
