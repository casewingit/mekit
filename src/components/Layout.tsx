import {
  ArrowUpRight,
  Heart,
  Package,
  Ruler,
  Grid2X2,
  MessageCircle,
  ArrowRight,
} from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useFavorites } from './Favorites'

export function Layout() {
  const { favorites } = useFavorites()
  const { pathname } = useLocation()
  if (pathname === '/') return <main id="main-content" tabIndex={-1}><Outlet /></main>
  return (
    <>
      <a href="#main-content" className="skip-link">
        본문으로 바로 가기
      </a>
      <div className="announcement">
        <span>내 손목에 맞게, 길이 추가금 없이.</span>
        <Link to="/size-guide">
          나의 사이즈 찾기 <ArrowRight size={12} />
        </Link>
      </div>
      <header className="site-header">
        <Link className="wordmark" to="/" aria-label="MEKIT 홈">
          MEKIT<span>MAKE IT YOUR OWN</span>
        </Link>
        <nav className="desktop-nav" aria-label="메인 메뉴">
          <NavLink to="/products">컬렉션</NavLink>
          <NavLink to="/materials">소재 아카이브</NavLink>
          <Link to="/#story">우리의 이야기</Link>
          <NavLink to="/support">고객지원</NavLink>
        </nav>
        <div className="header-actions">
          <NavLink
            className="icon-link"
            to="/favorites"
            aria-label={`찜한 제품 ${favorites.length}개`}
          >
            <Heart size={20} />
            {favorites.length > 0 && <span className="count">{favorites.length}</span>}
          </NavLink>
          <NavLink className="order-link" to="/orders">
            <Package size={20} />
            <span>내 주문</span>
          </NavLink>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="footer-top">
          <div>
            <Link to="/" className="wordmark">
              MEKIT
            </Link>
            <p>
              서로 다른 것들을 엮어,
              <br />
              나의 방식으로 완성하는 물건.
            </p>
          </div>
          <Link to="/support" className="footer-contact">
            도움이 필요하신가요? <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="footer-bottom">
          <span>© 2026 MEKIT. Make it your own.</span>
          <div>
            <Link to="/policies/terms">이용약관</Link>
            <Link to="/policies/privacy">개인정보 안내</Link>
            <Link to="/policies/returns">교환·반품</Link>
            <Link to="/policies/business">사업자 정보</Link>
          </div>
        </div>
        <p className="demo-footnote">
          <span className="status-dot" />
          MVP 데모 · 실제 결제와 배송은 진행되지 않습니다. 제품 이미지와 가격은 기획 단계의
          예시입니다.
        </p>
      </footer>
      <nav className="mobile-nav" aria-label="모바일 메뉴">
        <NavLink to="/products">
          <Grid2X2 size={20} />
          <span>컬렉션</span>
        </NavLink>
        <NavLink to="/size-guide">
          <Ruler size={20} />
          <span>사이즈</span>
        </NavLink>
        <NavLink to="/orders">
          <Package size={20} />
          <span>내 주문</span>
        </NavLink>
        <NavLink to="/support">
          <MessageCircle size={20} />
          <span>고객지원</span>
        </NavLink>
      </nav>
    </>
  )
}
