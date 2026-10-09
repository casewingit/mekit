import { useState } from 'react'
import { ArrowRight, ArrowUpRight, Ruler, Hand, Leaf, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { products, materials } from '../domain/catalog'
import { ConceptImage } from '../components/ConceptImage'
import { ProductCard } from '../components/ProductCard'
import { useFavorites } from '../components/Favorites'

const filters = [
  { id: 'all', name: '모든 컬렉션' },
  { id: 'nature', name: '자연 소재' },
  { id: 'metal', name: '금속의 균형' },
  { id: 'color', name: '빛과 조각' },
]
export function Collections({
  standalone = false,
  favoritesOnly = false,
}: {
  standalone?: boolean
  favoritesOnly?: boolean
}) {
  const [filter, setFilter] = useState('all')
  const { favorites } = useFavorites()
  const visible = products.filter(
    (p) =>
      (filter === 'all' || filter === p.group) && (!favoritesOnly || favorites.includes(p.code)),
  )
  return (
    <section
      className={`collections section-wrap ${standalone ? 'standalone-section' : ''}`}
      id="collections"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">{favoritesOnly ? 'YOUR SELECTION' : 'THE FIRST COLLECTION'}</p>
          {standalone ? (
            <h1>{favoritesOnly ? '마음에 담은 한 줄.' : '서로 다른 소재, 네 가지 스타일.'}</h1>
          ) : (
            <h2>서로 다른 소재, 네 가지 스타일.</h2>
          )}
          <p className="section-description">
            {favoritesOnly
              ? '눈길이 머문 것들을 모아두었어요.'
              : '취향을 고르고, 당신에게 맞는 길이로 완성하세요.'}
          </p>
        </div>
        <span className="collection-count">
          {favoritesOnly ? visible.length : '04'} OBJECTS <span> / </span> MADE FOR YOU
        </span>
      </div>
      {!favoritesOnly && (
        <div className="collection-toolbar">
          <div className="filter-list" aria-label="컬렉션 필터">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={filter === f.id ? 'selected' : ''}
                aria-pressed={filter === f.id}
              >
                {filter === f.id && <span className="filter-dot" />}
                {f.name}
              </button>
            ))}
          </div>
          <span>15~21cm · 모든 길이 동일 가격</span>
        </div>
      )}
      {visible.length ? (
        <div className="product-grid">
          {visible.map((p) => (
            <ProductCard key={p.code} product={p} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <HeartIllustration />
          <h2>아직 마음에 담은 제품이 없어요.</h2>
          <p>컬렉션에서 마음에 드는 팔찌의 하트를 눌러 보세요.</p>
          <Link className="button primary" to="/products">
            컬렉션 둘러보기 <ArrowRight size={16} />
          </Link>
        </div>
      )}
      <p className="collection-note">
        하나하나 다른 자연의 무늬처럼, 당신의 한 줄도 조금씩 다릅니다.
      </p>
    </section>
  )
}
function HeartIllustration() {
  return (
    <svg width="70" height="70" viewBox="0 0 70 70" fill="none" aria-hidden="true">
      <path
        d="M35 53 16 34C0 15 26 4 35 23c9-19 35-8 19 11Z"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  )
}
export function Home() {
  return (
    <>
      <section className="hero section-wrap">
        <div className="hero-copy">
          <div className="hero-overline">
            <span className="line" />
            <span>OBJECTS CONNECTED BY A NEW KNOT</span>
          </div>
          <h1>
            익숙한 매듭,
            <br />
            나만의 스타일로.
          </h1>
          <p className="hero-description">
            전통매듭과 서로 다른 소재가 만나는 곳.
            <br />
            당신의 취향과 손목에 맞는 한 줄을 만듭니다.
          </p>
          <Link className="button primary" to="/products">
            나의 한 줄 찾기 <ArrowUpRight size={18} />
          </Link>
          <div className="hero-bottom">
            <span>MAKE IT YOUR OWN.</span>
            <span>
              EST. 2026 <span className="tiny-dot">•</span> SEOUL
            </span>
          </div>
        </div>
        <div className="hero-image">
          <ConceptImage
            scene="hero"
            alt="거친 돌 위에 놓인 올리브색 전통매듭과 금속 파츠의 MEKIT 콘셉트"
          />
          <div className="hero-image-caption">
            <span>TRADITION, RECONNECTED.</span>
            <span>01 / 04</span>
          </div>
          <span className="hero-concept-label">브랜드 콘셉트 이미지</span>
        </div>
      </section>
      <div className="promise-strip section-wrap">
        <span>
          <Ruler size={18} />내 손목에 맞는 길이
        </span>
        <span>
          <Check size={18} />
          길이 추가금 없는 가격
        </span>
        <span>
          <Hand size={18} />
          주문 후, 손으로 만드는 한 줄
        </span>
      </div>
      <Collections />
      <section className="size-banner section-wrap">
        <div className="size-banner-art">
          <svg viewBox="0 0 270 130" fill="none" aria-hidden="true">
            <path d="M30 85C90 21 184 23 237 86" stroke="#747c60" strokeWidth="1.5" />
            <path
              d="M45 98C95 53 178 53 222 98"
              stroke="#a6ad96"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
            <path
              d="M45 100V40m25 39V30m25 37V23m25 38V19m25 42V19m25 47V22m25 56V31m25 62V44"
              stroke="#7e876b"
            />
            <text x="104" y="109" fill="#394532" fontSize="25" fontFamily="serif">
              17.5
            </text>
            <text x="157" y="109" fill="#647257" fontSize="10">
              CM
            </text>
          </svg>
        </div>
        <div>
          <p className="eyebrow">A FIT THAT FEELS LIKE YOU</p>
          <h2>좋은 팔찌는, 나에게 맞는 팔찌.</h2>
          <p>손목 둘레만 알려주세요. 당신에게 편안한 길이를 함께 찾을게요.</p>
        </div>
        <Link className="text-link" to="/size-guide">
          내 사이즈 알아보기 <ArrowUpRight size={20} />
        </Link>
      </section>
      <section className="story-section section-wrap" id="story">
        <div className="story-visual">
          <ConceptImage
            scene="lifestyle"
            alt="워크웨어 소매와 자연스럽게 어울리는 소재 팔찌 착용 콘셉트"
          />
          <span>WORN IN YOUR OWN WAY.</span>
        </div>
        <div className="story-copy">
          <p className="eyebrow">THE MEKIT PHILOSOPHY</p>
          <h2>
            서로 다른 것들이 만나,
            <br />
            하나의 나다운 균형.
          </h2>
          <p>
            나무의 결, 돌의 시간, 금속의 차가움.
            <br />
            그리고 그 사이를 잇는 손의 온기.
          </p>
          <p>
            MEKIT은 한국 전통매듭의 구조에서 영감을 받아,
            <br />
            오래된 기술을 오늘의 취향으로 엮습니다.
            <br />
            크게 드러내지 않아도, 분명하게 나다운 물건.
          </p>
          <Link className="text-link" to="/materials">
            소재에 담긴 이야기 <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <section className="archive-section section-wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE MATERIAL ARCHIVE</p>
            <h2>소재를 알면, 더 오래 좋아하게 되니까.</h2>
          </div>
          <Link className="text-link" to="/materials">
            모든 소재 보기 <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="material-preview-grid">
          {materials.slice(0, 5).map((material) => (
            <Link to={`/materials#${material.id}`} key={material.id}>
              <div className="material-thumb">
                <ConceptImage scene={material.id} alt={`${material.name} 질감 콘셉트`} />
              </div>
              <span>{material.name}</span>
              <small>{material.en}</small>
            </Link>
          ))}
        </div>
      </section>
      <div className="end-statement section-wrap">
        <Leaf size={23} strokeWidth={1} />
        <p>좋은 소재를, 더 많은 손목에.</p>
        <span>MAKE IT YOUR OWN.</span>
      </div>
    </>
  )
}
