import { ArrowUpRight, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '../domain/catalog'
import { money } from '../domain/sizing'
import { ConceptImage } from './ConceptImage'
import { useFavorites } from './Favorites'

export function ProductCard({ product }: { product: Product }) {
  const { favorites, toggle } = useFavorites()
  const saved = favorites.includes(product.code)
  return (
    <article className="product-card">
      <div className="product-visual">
        <Link to={`/products/${product.code}`} aria-label={`${product.name} 자세히 보기`}>
          <ConceptImage scene={product.code} alt={`${product.name} 팔찌 콘셉트 이미지`} />
          <span className="product-number">NO. {product.number}</span>
          <span className="concept-label">콘셉트 이미지</span>
          <span className="product-open">
            <ArrowUpRight size={20} />
          </span>
        </Link>
        <button
          className={`favorite-button ${saved ? 'is-saved' : ''}`}
          aria-label={`${product.name} ${saved ? '찜 해제' : '찜하기'}`}
          aria-pressed={saved}
          onClick={() => toggle(product.code)}
        >
          <Heart size={19} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="product-card-title">
        <Link to={`/products/${product.code}`}>
          <h3>{product.name}</h3>
        </Link>
        <span>{money(product.price)}</span>
      </div>
      <p>{product.subtitle}</p>
      <span className="material-caption">{product.label}</span>
    </article>
  )
}
