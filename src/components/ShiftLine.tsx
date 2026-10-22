import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import '../shift.css'

const variants = {
  cobalt: {
    title: 'Cobalt',
    file: '06-shift-cobalt',
    color: '#2456e8',
    label: '먹색 위, 짧고 선명한 코발트.',
  },
  lime: {
    title: 'Lime',
    file: '07-shift-lime',
    color: '#c8e846',
    label: '같은 먹색, 더 강한 라임의 대비.',
  },
}
const crops = {
  wrist: ['774 0 762 505', '워시드 블랙 데님과 가는 로프 팔찌의 착용 생성 시안'],
  product: ['0 0 764 505', '콘크리트 위 먹색 로프와 작은 무광 블랙 금속 팔찌 생성 시안'],
  detail: ['0 514 764 510', '무광 블랙 금속 옆 짧은 컬러 실 감기를 확대한 생성 시안'],
  texture: ['774 514 762 510', '블랙 데님, 콘크리트와 컬러 실의 소재 생성 시안'],
}
type Variant = keyof typeof variants
function ShiftFrame({ scene, variant }: { scene: keyof typeof crops; variant: Variant }) {
  return (
    <svg
      viewBox={crops[scene][0]}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`${variants[variant].title}: ${crops[scene][1]}`}
      data-shift-scene={scene}
    >
      <image
        href={`${import.meta.env.BASE_URL}studio/images/${variants[variant].file}.png`}
        width="1536"
        height="1024"
      />
    </svg>
  )
}
export function ShiftLine() {
  const [variant, setVariant] = useState<Variant>('cobalt')
  const selected = variants[variant]
  const board = `${import.meta.env.BASE_URL}studio/#shift-${variant}`
  return (
    <section
      className="shift-line"
      id="shift-line"
      aria-labelledby="shift-title"
      data-variant={variant}
    >
      <div className="indigo-wrap">
        <div className="shift-top">
          <span>03 / SHIFT LINE</span>
          <span>CHARCOAL + A COLOUR HIT</span>
        </div>
        <div className="shift-hero">
          <div className="shift-copy">
            <p className="indigo-eyebrow">OFF-CENTRE. ON YOUR TERMS.</p>
            <h2 id="shift-title">
              Small detail.
              <br />
              <em>Different energy.</em>
            </h2>
            <p className="shift-korean">
              한 점의 색,
              <br />
              달라지는 분위기.
            </p>
            <p>
              먹색 로프, 낮고 작은 금속, 살짝 비껴 놓은 컬러.
              <br />
              오버핏 티셔츠와 카고팬츠, 스니커즈 사이에 선명한 한 점을 남깁니다.
            </p>
            <div className="shift-options" role="group" aria-label="SHIFT 색상 비교">
              {(Object.keys(variants) as Variant[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={variant === key}
                  onClick={() => setVariant(key)}
                >
                  <i aria-hidden="true" style={{ background: variants[key].color }} />
                  {variants[key].title}
                </button>
              ))}
            </div>
            <p className="shift-selection" aria-live="polite">
              {selected.label}
            </p>
            <a className="shift-link" href={board}>
              SHIFT {selected.title} 무드보드 <ArrowUpRight size={17} />
            </a>
          </div>
          <figure className="shift-wrist">
            <ShiftFrame scene="wrist" variant={variant} />
            <figcaption>
              <span>01 / WORN WITH BLACK DENIM</span>
              <span>AI CONCEPT</span>
            </figcaption>
          </figure>
        </div>
        <div className="shift-grid">
          <figure>
            <ShiftFrame scene="product" variant={variant} />
            <figcaption>02 / THE WHOLE LINE</figcaption>
          </figure>
          <figure>
            <ShiftFrame scene="detail" variant={variant} />
            <figcaption>03 / A SHORT COLOUR HIT</figcaption>
          </figure>
        </div>
        <div className="shift-bottom">
          <figure>
            <ShiftFrame scene="texture" variant={variant} />
            <figcaption>04 / CONCRETE. DENIM. THREAD.</figcaption>
          </figure>
          <div>
            <p className="indigo-eyebrow">SAME LINE. YOUR OWN EXPRESSION.</p>
            <h3>
              Keep the line.
              <br />
              Shift the accent.
            </h3>
            <p>
              로프 외경 2mm를 목표로, 작은 무광 블랙 포인트와 짧은 컬러 감기를 더합니다. 비대칭
              배치와 드러난 매듭, 짧은 끝단이 만드는 스트리트 감각을 탐색합니다.
            </p>
            <p className="shift-note">
              코발트는 메인 방향, 라임은 색상 비교안입니다. 두 이미지는 별도로 생성한 시안으로
              형태에 차이가 있으며, 실제 소재·치수·조절 구조·내구성은 샘플 검증 전입니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
