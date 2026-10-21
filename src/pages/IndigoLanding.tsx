import { ArrowDown, ArrowUpRight, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import '../indigo.css'

const studio = `${import.meta.env.BASE_URL}studio/`
const original = `${studio}images/02-indigo-line.png`
const frames = {
  bracelet: {
    crop: '4 251 758 380',
    label: '아이보리 종이 위에 놓인 가는 남색 로프 팔찌의 생성 콘셉트',
  },
  wrist: {
    crop: '784 0 509 631',
    label: '데님 소매와 남색 팔찌를 함께 보여주는 손목 착용 생성 콘셉트',
  },
  knot: { crop: '24 648 841 347', label: '남색 매듭과 작은 무광 블랙 금속을 확대한 생성 콘셉트' },
  texture: { crop: '895 648 638 347', label: '짙은 남색 직물과 거친 도자기 질감의 생성 이미지' },
}
function IndigoFrame({
  scene,
  className = '',
}: {
  scene: keyof typeof frames
  className?: string
}) {
  return (
    <svg
      className={`indigo-photo ${className}`}
      viewBox={frames[scene].crop}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={frames[scene].label}
      data-scene={scene}
    >
      <image href={original} width="1536" height="1024" />
    </svg>
  )
}

export function IndigoLanding() {
  return (
    <div className="indigo-site">
      <Link className="indigo-skip" to="/#indigo-story">
        본문으로 바로 가기
      </Link>
      <div className="indigo-topline">
        <span>A QUIET THREAD OF KOREA</span>
        <span>DESIGN STUDY / 2026</span>
      </div>
      <header className="indigo-header indigo-wrap">
        <Link to="/" className="indigo-logo" aria-label="MEKIT 홈">
          MEKIT<span>MAKE IT YOUR OWN</span>
        </Link>
        <nav aria-label="메인 메뉴">
          <Link to="/#indigo-story">The line</Link>
          <Link to="/#indigo-details">Details</Link>
          <a href={`${studio}#indigo-line`}>
            Studio <ArrowUpRight size={13} />
          </a>
        </nav>
      </header>

      <section className="indigo-hero indigo-wrap" aria-labelledby="indigo-title">
        <div className="indigo-hero-copy">
          <p className="indigo-eyebrow">
            <span className="indigo-dot" /> INDIGO LINE / SELECTED DIRECTION
          </p>
          <h1 id="indigo-title">
            A quiet thread
            <br />
            <em>of Korea.</em>
          </h1>
          <p className="indigo-hero-korean">
            작은 매듭, 깊은 쪽빛.
            <br />
            매일의 옷차림에 스며드는 한 줄.
          </p>
          <Link className="indigo-button" to="/#indigo-story">
            INDIGO LINE 살펴보기 <ArrowDown size={17} />
          </Link>
          <div className="indigo-hero-meta">
            <span>
              SLIM ROPE
              <br />
              SMALL KNOT
            </span>
            <span>
              DEEP INDIGO
              <br />
              MATTE BLACK
            </span>
          </div>
        </div>
        <figure className="indigo-wrist">
          <IndigoFrame scene="wrist" />
          <figcaption>
            <span>01 / WORN WITH DENIM</span>
            <span>AI CONCEPT</span>
          </figcaption>
        </figure>
      </section>

      <section className="indigo-story indigo-wrap" id="indigo-story">
        <div className="indigo-section-top">
          <span className="indigo-eyebrow">THE LINE</span>
          <span>LESS VOLUME. MORE CHARACTER.</span>
        </div>
        <div className="indigo-story-intro">
          <h2>
            가늘게 남는,
            <br />
            <em>분명한 취향.</em>
          </h2>
          <p>
            짙은 남색 로프, 작은 매듭, 빛을 낮춘 금속.
            <br />
            익숙한 데님과 셔츠 사이에 자연스럽게 놓이는 팔찌를 생각합니다. 한국 전통매듭에서 얻은
            영감을 절제된 비율로 풀어낸 MEKIT의 다음 방향입니다.
          </p>
        </div>
        <figure className="indigo-product">
          <IndigoFrame scene="bracelet" />
          <figcaption>
            <span>02 / THE WHOLE LINE</span>
            <span>INDIGO · IVORY · CHARCOAL</span>
          </figcaption>
        </figure>
        <div className="indigo-spec-strip">
          <div>
            <span>01 / PROPORTION</span>
            <strong>2 mm</strong>
            <p>완성 로프 외경 목표</p>
          </div>
          <div>
            <span>02 / DETAIL</span>
            <strong>A small knot</strong>
            <p>전통매듭에서 얻은 영감</p>
          </div>
          <div>
            <span>03 / FINISH</span>
            <strong>Matte black</strong>
            <p>작고 절제된 금속의 인상</p>
          </div>
        </div>
      </section>

      <section className="indigo-details indigo-wrap" id="indigo-details">
        <div className="indigo-detail-row">
          <figure>
            <IndigoFrame scene="knot" />
            <figcaption>03 / THE POINT OF CONNECTION</figcaption>
          </figure>
          <div className="indigo-detail-copy">
            <p className="indigo-eyebrow">THE KNOT</p>
            <h2>
              A little knot.
              <br />
              <em>A lasting impression.</em>
            </h2>
            <p>
              매듭 하나의 크기와 위치가 만드는 인상.
              <br />
              장식을 더하기보다, 로프와 금속이 만나는 작은 부분에 집중합니다.
            </p>
            <span className="indigo-fine">MAEDEUP — KOREAN DECORATIVE KNOTTING</span>
          </div>
        </div>
        <div className="indigo-detail-row indigo-detail-reverse">
          <figure>
            <IndigoFrame scene="texture" />
            <figcaption>04 / A PALETTE FOR EVERY DAY</figcaption>
          </figure>
          <div className="indigo-detail-copy">
            <p className="indigo-eyebrow">THE PALETTE</p>
            <h2>
              Deep blue.
              <br />
              <em>Quiet contrast.</em>
            </h2>
            <p>
              오래 입은 데님의 깊은 색과 밝은 종이의 여백.
              <br />
              차분한 세 가지 색으로, 계절보다 오래 곁에 둘 스타일을 탐색합니다.
            </p>
            <div className="indigo-swatches" aria-label="색상 팔레트">
              <span>
                <i style={{ background: '#192d40' }} />
                Indigo
              </span>
              <span>
                <i style={{ background: '#e8dfcb' }} />
                Ivory
              </span>
              <span>
                <i style={{ background: '#333535' }} />
                Charcoal
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="indigo-notebook" aria-labelledby="notebook-title">
        <div className="indigo-wrap indigo-notebook-inner">
          <div>
            <p className="indigo-eyebrow">MEKIT STUDIO / AN OPEN NOTEBOOK</p>
            <h2 id="notebook-title">
              A direction,
              <br />
              <em>taking shape.</em>
            </h2>
            <p>
              제품의 전체 모습부터 착용 장면, 작은 디테일까지.
              <br />
              무드보드를 넘겨 보고, 다음 선택을 기록하세요.
            </p>
            <a className="indigo-text-link" href={`${studio}#indigo-line`}>
              무드보드 Studio 열기 <ArrowUpRight size={18} />
            </a>
          </div>
          <a
            className="indigo-board-link"
            href={`${studio}#indigo-line`}
            aria-label="INDIGO LINE 무드보드 열기"
          >
            <img
              src={original}
              width="1536"
              height="1024"
              loading="lazy"
              alt="선택된 INDIGO LINE 전체 무드보드: 제품, 착용, 매듭, 소재 네 장면"
            />
            <span>
              VIEW THE COMPLETE STUDY <ArrowRight size={15} />
            </span>
          </a>
        </div>
      </section>

      <section className="indigo-progress indigo-wrap" aria-labelledby="progress-title">
        <div>
          <p className="indigo-eyebrow">FROM CONCEPT TO OBJECT</p>
          <h2 id="progress-title">지금은, 실물을 준비하는 단계.</h2>
        </div>
        <div>
          <p>
            INDIGO LINE은 현재 선택한 디자인 콘셉트입니다. 다이니마 사용 로프와 작은 무광 금속을
            검토하고 있으며, 소재·매듭 구조·잠금장치·착용감을 샘플로 확인한 뒤 판매 사양을 정합니다.
          </p>
          <p className="indigo-fine">
            모든 이미지는 AI 생성 시안입니다. 2mm는 설계 목표이며, 실제 규격·강도·금속 재질·한국
            제조를 보증하지 않습니다. 아직 주문을 받지 않습니다.
          </p>
          <div className="indigo-stages" aria-label="개발 진행 상태">
            <span className="active">01 방향 선택</span>
            <span>02 실물 샘플 준비</span>
            <span>03 착용 검증 예정</span>
          </div>
        </div>
      </section>
      <footer className="indigo-footer indigo-wrap">
        <div>
          <Link to="/" className="indigo-logo">
            MEKIT
          </Link>
          <p>Small details. Your own way.</p>
        </div>
        <div className="indigo-footer-links">
          <a href={studio}>Design archive ↗</a>
          <Link to="/products">이전 커머스 데모 ↗</Link>
          <span>© 2026 MEKIT · CONCEPT STAGE</span>
        </div>
      </footer>
    </div>
  )
}
