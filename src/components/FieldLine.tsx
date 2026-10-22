import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import '../field.css'

const image = `${import.meta.env.BASE_URL}studio/images/05-field-line.png`
const board = `${import.meta.env.BASE_URL}studio/#field-line`
const frames = {
  wrist: ['835 8 502 572', '워크웨어 소매와 목재·원석 포인트 팔찌를 함께 보여주는 착용 생성 시안'],
  product: [
    '12 197 806 383',
    '가는 로프에 목재 한 조각과 스모키 쿼츠 두 점을 배치한 팔찌 생성 시안',
  ],
  detail: ['16 596 878 408', '목재의 결과 스모키 쿼츠, 작은 매듭의 연결을 확대한 생성 시안'],
  materials: ['912 596 607 408', '짙은 목재와 연갈색 원석, 캔버스를 조합한 소재 생성 시안'],
}
function FieldFrame({ scene }: { scene: keyof typeof frames }) {
  return (
    <svg
      viewBox={frames[scene][0]}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={frames[scene][1]}
      data-field-scene={scene}
    >
      <image href={image} width="1536" height="1024" />
    </svg>
  )
}
export function LineSelector() {
  return (
    <nav className="line-selector indigo-wrap" aria-label="제품 라인 탐색">
      <span>ONE BRAND. THREE EXPRESSIONS.</span>
      <Link to="/#indigo-story">
        <small>01 / INDIGO LINE</small>쪽빛의 단정함 <ArrowDown size={16} />
      </Link>
      <Link to="/#field-line">
        <small>02 / FIELD LINE</small>나무와 돌의 묵직함 <ArrowDown size={16} />
      </Link>
      <Link to="/#shift-line">
        <small>03 / SHIFT LINE</small>원석과 간결한 잠금 <ArrowDown size={16} />
      </Link>
    </nav>
  )
}
export function FieldLine() {
  return (
    <section className="field-line" id="field-line" aria-labelledby="field-title">
      <div className="indigo-wrap">
        <div className="field-heading">
          <p className="indigo-eyebrow">02 / FIELD LINE</p>
          <span>WOOD / STONE / CORD</span>
        </div>
        <div className="field-hero">
          <div className="field-copy">
            <p className="indigo-eyebrow">A DIFFERENT SIDE OF MEKIT</p>
            <h2 id="field-title">
              A rougher edge.
              <br />
              <em>The same restraint.</em>
            </h2>
            <p className="field-korean">
              나무와 돌,
              <br />
              거친 일상의 결.
            </p>
            <p>
              짙은 목재의 결, 연갈색 원석의 깊이.
              <br />
              가는 로프 위에 자연의 질감을 짧게 남깁니다. 캔버스 재킷과 오래 입은 워크웨어에
              어울리는, 조금 더 묵직한 MEKIT.
            </p>
            <a href={board} className="indigo-text-link">
              FIELD LINE 무드보드 <ArrowUpRight size={18} />
            </a>
            <div className="field-colors" aria-label="FIELD 색상">
              <span>WALNUT</span>
              <span>SMOKE</span>
              <span>CHARCOAL</span>
            </div>
          </div>
          <figure className="field-wrist">
            <FieldFrame scene="wrist" />
            <figcaption>
              01 / WORN WITH CANVAS <span>AI CONCEPT</span>
            </figcaption>
          </figure>
        </div>
        <figure className="field-product">
          <FieldFrame scene="product" />
          <figcaption>
            02 / ONE WOOD PIECE. TWO STONES. <span>DESIGN STUDY</span>
          </figcaption>
        </figure>
        <div className="field-materials">
          <article>
            <span>01 / WOOD</span>
            <h3>Dark walnut</h3>
            <p>짧고 둥근 목재 포인트 하나. 짙은 갈색과 드러난 나뭇결을 디자인의 중심에 둡니다.</p>
          </article>
          <article>
            <span>02 / STONE</span>
            <h3>Smoky quartz</h3>
            <p>과한 반짝임을 줄인 작은 원석 두 점. 목재 양옆에 연갈색의 깊이를 더합니다.</p>
          </article>
          <article>
            <span>03 / PROPORTION</span>
            <h3>Keep it slender</h3>
            <p>로프 외경 2mm, 장식 폭 약 4mm를 목표로 탐색합니다. 가는 선 위에 질감만 더합니다.</p>
          </article>
        </div>
        <div className="field-detail-grid">
          <figure>
            <FieldFrame scene="detail" />
            <figcaption>03 / GRAIN & CONNECTION</figcaption>
          </figure>
          <figure>
            <FieldFrame scene="materials" />
            <figcaption>04 / MATERIAL PALETTE</figcaption>
          </figure>
        </div>
        <div className="field-footnote">
          <p>
            FIELD LINE은 자연 소재를 더한 두 번째 디자인 콘셉트입니다. 목재 수종·원석 처리·금속
            마감·치수는 실물 샘플 전 후보이며, 이미지가 소재나 강도를 증명하지 않습니다.
          </p>
          <a href={board}>
            전체 보드 보기 <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}
