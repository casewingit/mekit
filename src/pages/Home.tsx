import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { products } from '../domain/catalog'
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
export { IndigoLanding as Home } from './IndigoLanding'
