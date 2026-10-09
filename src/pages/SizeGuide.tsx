import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Ruler } from 'lucide-react'
import { wrists, fits, cm, recommendLength, isValidLength, type Fit } from '../domain/sizing'
import { savedWrist, saveWrist } from '../domain/preferences'

export function SizeGuide() {
  const [wrist, setWrist] = useState(savedWrist)
  const [fit, setFit] = useState<Fit>('comfortable')
  const [saved, setSaved] = useState(false)
  const length = recommendLength(wrist, fit)
  const valid = isValidLength(length)
  return (
    <section className="section-wrap standalone-section size-guide">
      <p className="eyebrow">FIND YOUR OWN FIT</p>
      <h1>
        당신의 손목에,
        <br />딱 좋은 한 줄.
      </h1>
      <p className="section-description">
        손목 둘레와 팔찌 길이는 달라요.
        <br />
        먼저 손목을 재고, 원하는 여유를 더해 주세요.
      </p>
      <div className="guide-grid">
        <div>
          <div className="measurement-art">
            <svg
              viewBox="0 0 560 320"
              role="img"
              aria-label="손목의 가장 가는 부분에 줄자를 여유 없이 감는 방법"
            >
              <defs>
                <linearGradient id="arm-color" x2="0" y2="1">
                  <stop stopColor="#ddc9ac" />
                  <stop offset="1" stopColor="#bea78b" />
                </linearGradient>
              </defs>
              <path
                d="M45 140C121 139 166 113 230 109L360 112C410 115 448 80 496 105C517 116 519 139 502 151L486 167C527 199 502 224 477 225L367 221C287 212 166 203 45 228Z"
                fill="url(#arm-color)"
              />
              <path
                d="M283 102C242 124 238 198 285 217L317 220C273 198 277 122 317 111Z"
                fill="#f8f5eb"
                stroke="#7c816b"
                strokeWidth="2"
              />
              <path
                d="M287 112L302 117M278 127L290 131M273 145L285 147M272 163H287M275 180L289 178M280 196L295 190M290 208L303 201"
                stroke="#54614b"
                strokeWidth="2"
              />
              <path d="M327 243V277H426" fill="none" stroke="#758366" />
              <rect x="332" y="250" width="100" height="30" fill="#eaece1" />
              <text x="340" y="272" fontSize="13" fill="#4b5a40">
                여유 없이 밀착
              </text>
              <circle cx="282" cy="149" r="36" fill="none" stroke="#778165" strokeDasharray="3 5" />
            </svg>
          </div>
          <div className="measurement-steps">
            {[
              {
                title: '손목의 가장 가는 곳을 찾아요.',
                text: '평소 팔찌를 착용할 위치를 기준으로 측정하세요.',
              },
              {
                title: '줄자를 여유 없이 감아 주세요.',
                text: '꽉 조이지 않고 피부에 가볍게 닿도록 재세요. 줄자가 없다면 종이띠와 자를 사용해도 좋아요.',
              },
              {
                title: '측정한 둘레에 착용감을 더해요.',
                text: '아래에서 원하는 핏을 고르면 완성 길이를 계산해 드려요.',
              },
            ].map((step, i) => (
              <div key={step.title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="guide-calculator">
          <Ruler size={25} strokeWidth={1.3} />
          <h2>나의 길이 찾기</h2>
          <label className="field-label" htmlFor="guide-wrist">
            내 손목 둘레
          </label>
          <select
            id="guide-wrist"
            className="full-select"
            value={wrist}
            onChange={(e) => {
              setWrist(Number(e.target.value))
              setSaved(false)
            }}
          >
            {wrists.map((v) => (
              <option value={v} key={v}>
                {cm(v)}
              </option>
            ))}
          </select>
          <p className="field-label">원하는 착용감</p>
          <div className="fit-options">
            {fits.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setFit(f.id)
                  setSaved(false)
                }}
                aria-pressed={fit === f.id}
                className={fit === f.id ? 'active' : ''}
              >
                <span>{f.label}</span>
                <small>+{f.allowance.toFixed(1)}cm</small>
              </button>
            ))}
          </div>
          <div className={`recommendation ${valid ? '' : 'out-of-range'}`} aria-live="polite">
            <div>
              <span>추천 완성 길이</span>
              <strong>{cm(length)}</strong>
            </div>
            <p>
              {valid
                ? '자연스러운 여유가 있는 나만의 한 줄.'
                : '제공 범위 밖 사이즈예요. 먼저 상담해 주세요.'}
            </p>
          </div>
          {valid ? (
            <button
              className="button primary"
              onClick={() => {
                saveWrist(wrist)
                setSaved(true)
              }}
            >
              {saved ? (
                <>
                  <Check size={16} />
                  손목 둘레를 기억했어요
                </>
              ) : (
                '이 손목 둘레 기억하기'
              )}
            </button>
          ) : (
            <Link className="button primary" to="/support">
              사이즈 상담하기 <ArrowRight size={16} />
            </Link>
          )}
          <Link className="text-link" to="/products">
            나에게 맞는 컬렉션 보기 <ArrowRight size={16} />
          </Link>
          <p className="fine-print">
            손목 둘레는 현재 브라우저 세션에서만 기억합니다.
            <br />
            완성 길이 15~21cm · 0.5cm 단위 · 허용오차 ±0.3cm (제안)
          </p>
        </div>
      </div>
    </section>
  )
}
