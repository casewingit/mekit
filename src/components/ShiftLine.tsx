import { ArrowUpRight } from 'lucide-react'
import '../shift.css'

const board = `${import.meta.env.BASE_URL}studio/#shift-lock`
const crops = {
  wrist: ['774 0 762 505', '작은 원석 인레이와 무광 자석 잠금 팔찌의 남성 손목 착용 생성 시안'],
  product: ['0 0 764 505', '먹색 로프와 낮은 블랙 잠금장치의 전체 팔찌 생성 시안'],
  detail: ['0 514 764 510', '열린 자석 잠금과 보조 걸림을 탐색하는 생성 시안, 실제 설계도 아님'],
  texture: [
    '774 514 762 510',
    '닫힌 무광 블랙 잠금장치의 작은 원석 인레이와 스모키 쿼츠 배경 생성 시안',
  ],
}
function ShiftFrame({ scene }: { scene: keyof typeof crops }) {
  return (
    <svg
      viewBox={crops[scene][0]}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={crops[scene][1]}
      data-shift-scene={scene}
    >
      <image
        href={`${import.meta.env.BASE_URL}studio/images/09-shift-lock.png`}
        width="1536"
        height="1024"
      />
    </svg>
  )
}
export function ShiftLine() {
  return (
    <section className="shift-line" id="shift-line" aria-labelledby="shift-title">
      <div className="indigo-wrap">
        <div className="shift-top">
          <span>03 / SHIFT LINE — LOCK STUDY</span>
          <span>STONE / MATTE BLACK / MAGNET</span>
        </div>
        <div className="shift-hero">
          <div className="shift-copy">
            <p className="indigo-eyebrow">A SMALL INLAY. A QUIET CONNECTION.</p>
            <h2 id="shift-title">
              Dark stone.
              <br />
              <em>Clean closure.</em>
            </h2>
            <p className="shift-korean">
              돌은 작게,
              <br />
              잠금은 간결하게.
            </p>
            <p>
              짙은 스모키 쿼츠를 낮은 블랙 금속 안에 작은 인레이로. 먹색 로프와 간결한 잠금의 형태로
              도시적인 인상을 탐색합니다.
            </p>
            <a className="shift-link" href={board}>
              SHIFT Lock 무드보드 <ArrowUpRight size={17} />
            </a>
            <p className="shift-selection">자석 정렬 + 보조 걸림 구조 검토 중</p>
          </div>
          <figure className="shift-wrist">
            <ShiftFrame scene="wrist" />
            <figcaption>
              <span>01 / WORN WITH BLACK DENIM</span>
              <span>AI CONCEPT</span>
            </figcaption>
          </figure>
        </div>
        <div className="shift-grid">
          <figure>
            <ShiftFrame scene="product" />
            <figcaption>02 / THE WHOLE LINE</figcaption>
          </figure>
          <figure>
            <ShiftFrame scene="detail" />
            <figcaption>03 / MAGNETIC CLOSURE STUDY · 구조 검증 전</figcaption>
          </figure>
        </div>
        <div className="shift-bottom">
          <figure>
            <ShiftFrame scene="texture" />
            <figcaption>04 / SMOKY QUARTZ INLAY</figcaption>
          </figure>
          <div>
            <p className="indigo-eyebrow">FROM MATERIAL TO MECHANISM</p>
            <h3>
              A touch of stone.
              <br />A considered connection.
            </h3>
            <p>
              로프 외경 2mm를 목표로, 작은 원석을 금속 표면에 낮게 넣는 방향입니다. 자석이 두 끝의
              정렬을 돕고 작은 걸림이 이탈을 보조하는 잠금 구조를 검토합니다.
            </p>
            <p className="shift-note">
              생성 이미지는 외형 탐색이며 작동 설계도가 아닙니다. 실제 소재·규격·자석 고정력·걸림
              구조·원석 고정·착탈감은 샘플 검증 전입니다.
            </p>
            <a className="shift-link" href={`${import.meta.env.BASE_URL}studio/#shift-smoke`}>
              이전 원석 배열안 비교 <ArrowUpRight size={17} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
