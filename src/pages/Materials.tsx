import { Link } from 'react-router-dom'
import { ArrowUpRight, Info } from 'lucide-react'
import { materials } from '../domain/catalog'
import { ConceptImage } from '../components/ConceptImage'

export function Materials() {
  return (
    <section className="section-wrap standalone-section">
      <p className="eyebrow">THE MATERIAL ARCHIVE</p>
      <h1>
        일곱 가지 물성,
        <br />
        무한한 표정.
      </h1>
      <p className="section-description">
        소재는 그 자체로 이야기가 됩니다.
        <br />
        각각의 시간과 흔적을 알고, 더 오래 함께하세요.
      </p>
      <div className="info-banner">
        <Info size={18} />
        <p>
          기획 단계의 소재 아카이브입니다. 정확한 조성·등급·코팅·처리 여부는 최종 제품 사양과 공급처
          증빙을 기준으로 확정합니다.
        </p>
      </div>
      <div className="archive-grid">
        {materials.map((material, i) => (
          <article key={material.id} id={material.id} className="archive-card">
            <div className="archive-photo">
              <ConceptImage scene={material.id} alt={`${material.name} 표면 콘셉트 이미지`} />
              <span>
                0{i + 1} / {material.en}
              </span>
            </div>
            <h2>{material.name}</h2>
            <p>{material.description}</p>
            <div className="care-block">
              <span>CARE & CHARACTER</span>
              <p>{material.care}</p>
              <small>{material.note}</small>
            </div>
          </article>
        ))}
      </div>
      <div className="archive-end">
        <h2>다른 소재가 만나는 새로운 균형.</h2>
        <Link className="button primary" to="/products">
          컬렉션에서 만나기 <ArrowUpRight size={17} />
        </Link>
      </div>
    </section>
  )
}
