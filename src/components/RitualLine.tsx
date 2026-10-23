import { ArrowUpRight } from 'lucide-react'
import '../ritual.css'

const variants = [
  {
    name: 'SMOKE',
    id: 'ritual-line',
    image: '10-ritual-line.png',
    material: 'Dark wood / Smoky quartz',
    copy: '짙은 나뭇결 사이로 비치는 연갈색. RITUAL의 첫 번째 표정.',
  },
  {
    name: 'ONYX',
    id: 'ritual-onyx',
    image: '11-ritual-onyx.png',
    material: 'Dark wood / Matte onyx',
    copy: '빛을 낮춘 검정 원석. 블랙 데님과 함께하는 가장 차분한 조합.',
  },
  {
    name: 'EMBER',
    id: 'ritual-ember',
    image: '12-ritual-ember.png',
    material: 'Dark wood / Tiger’s eye',
    copy: '어두운 갈색에 남은 호안석의 결. 캔버스와 가죽에 어울리는 온기.',
  },
]
const scenes = {
  product: ['0 0 760 504', '짙은 목재와 스모키 쿼츠 구슬이 전체를 감싸는 팔찌 생성 시안'],
  wrist: ['776 0 760 504', '올리브 워크웨어와 목재·원석 구슬 팔찌의 남성 손목 착용 생성 시안'],
  grain: ['0 519 760 505', '목재 나뭇결과 스모키 쿼츠, 얇은 검은 스페이서의 확대 생성 시안'],
  clasp: ['776 519 760 505', '목재 구슬 사이 원통형 무광 블랙 자석 잠금 외형 생성 시안'],
}
function RitualFrame({ scene }: { scene: keyof typeof scenes }) {
  return (
    <svg
      viewBox={scenes[scene][0]}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={scenes[scene][1]}
      data-ritual-scene={scene}
    >
      <image
        href={`${import.meta.env.BASE_URL}studio/images/10-ritual-line.png`}
        width="1536"
        height="1024"
      />
    </svg>
  )
}
export function RitualLine() {
  return (
    <section className="ritual-line" id="ritual-line" aria-labelledby="ritual-title">
      <div className="indigo-wrap">
        <div className="ritual-heading">
          <span>04 / RITUAL LINE</span>
          <span>WOOD / SMOKY QUARTZ</span>
        </div>
        <div className="ritual-hero">
          <div className="ritual-copy">
            <p className="indigo-eyebrow">A RHYTHM OF WOOD & STONE</p>
            <h2 id="ritual-title">
              Quiet rhythm.
              <br />
              <em>Grounded presence.</em>
            </h2>
            <p className="ritual-korean">
              손목을 감싸는,
              <br />
              나무와 돌의 묵직함.
            </p>
            <p>
              짙은 목재 구슬의 반복 사이, 스모키 쿼츠를 한 구간에 모았습니다. 묵주와 염주의 차분한
              리듬에서 출발해 거친 워크웨어에 어울리는 한 줄을 그립니다.
            </p>
            <a className="indigo-text-link" href={`${import.meta.env.BASE_URL}studio/#ritual-line`}>
              RITUAL LINE 무드보드 <ArrowUpRight size={18} />
            </a>
          </div>
          <figure>
            <RitualFrame scene="wrist" />
            <figcaption>
              01 / WORN WITH OLIVE CANVAS <span>AI CONCEPT</span>
            </figcaption>
          </figure>
        </div>
        <figure className="ritual-product">
          <RitualFrame scene="product" />
          <figcaption>
            02 / ONE CONTINUOUS RHYTHM <span>DESIGN STUDY</span>
          </figcaption>
        </figure>
        <div className="ritual-materials">
          <article>
            <span>01 / THE GRAIN</span>
            <h3>Dark wood</h3>
            <p>전체의 약 ⅔를 짙은 월넛 계열 목재로. 광택을 낮춘 나뭇결이 중심을 잡습니다.</p>
          </article>
          <article>
            <span>02 / THE DEPTH</span>
            <h3>Smoky quartz</h3>
            <p>앞쪽에 모은 어두운 원석 구슬. 얇은 블랙 스페이서로 목재와의 경계를 정리합니다.</p>
          </article>
          <article>
            <span>03 / THE CONNECTION</span>
            <h3>A quiet clasp</h3>
            <p>뒤쪽에 작게 숨긴 원통형 자석 잠금. 구슬 지름은 약 6mm를 목표로 비율을 탐색합니다.</p>
          </article>
        </div>
        <div className="ritual-detail-grid">
          <figure>
            <RitualFrame scene="grain" />
            <figcaption>03 / GRAIN MEETS STONE</figcaption>
          </figure>
          <figure>
            <RitualFrame scene="clasp" />
            <figcaption>04 / MAGNETIC CLOSURE STUDY</figcaption>
          </figure>
        </div>
        <section className="ritual-series" id="ritual-series" aria-labelledby="ritual-series-title">
          <div className="ritual-series-heading">
            <div>
              <p className="indigo-eyebrow">THREE MATERIAL EXPRESSIONS</p>
              <h3 id="ritual-series-title">One rhythm. Three characters.</h3>
            </div>
            <p>
              같은 비율, 서로 다른 돌의 표정.
              <br />약 6mm 구슬 · 목재와 원석 · 블랙 잠금
            </p>
          </div>
          <div className="ritual-series-grid">
            {variants.map((variant) => (
              <article key={variant.id}>
                <a
                  href={`${import.meta.env.BASE_URL}studio/#${variant.id}`}
                  aria-label={`RITUAL ${variant.name} 시안 보기`}
                >
                  <svg
                    viewBox="0 170 760 334"
                    preserveAspectRatio="xMidYMid slice"
                    role="img"
                    aria-label={`${variant.name} 목재·원석 팔찌 전체 생성 시안`}
                    data-ritual-variant={variant.name}
                  >
                    <image
                      href={`${import.meta.env.BASE_URL}studio/images/${variant.image}`}
                      width="1536"
                      height="1024"
                    />
                  </svg>
                  <div className="ritual-series-name">
                    <h4>{variant.name}</h4>
                    <ArrowUpRight size={18} />
                  </div>
                </a>
                <p className="ritual-series-material">{variant.material}</p>
                <p>{variant.copy}</p>
              </article>
            ))}
          </div>
          <div className="ritual-price">
            <span>국내 출시 목표가 / 전 모델 동일</span>
            <strong>₩69,000</strong>
            <p>
              부가세·국내 일반 배송 포함 목표 · 실물 검증 후 확정
              <br />
              AI 디자인 시안이며 아직 판매하지 않습니다.
            </p>
          </div>
          <p className="ritual-durability">
            오래 쓰기 위한 설계 방향: 구슬에 맞는 내부 줄, 마모를 줄이는 끝단, 의도치 않은 이탈을
            막는 잠금. 코팅 와이어와 보조 걸림 구조를 샘플에서 비교합니다.
          </p>
        </section>
        <p className="ritual-note">
          구슬의 반복에서 영감을 얻은 디자인 콘셉트입니다. 실물의 목재 수종·원석 처리·구슬 크기·내부
          줄·잠금 구조는 샘플 검증 전이며, 이미지가 내구성을 보증하지 않습니다.
        </p>
      </div>
    </section>
  )
}
