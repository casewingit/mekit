import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
export function NotFound() {
  return (
    <section className="empty-state section-wrap standalone-section">
      <p className="eyebrow">404 / LOOSE END</p>
      <h1>이 페이지는 아직 엮이지 않았어요.</h1>
      <p>주소를 확인하거나 컬렉션에서 다시 시작해 주세요.</p>
      <Link to="/products" className="button primary">
        <ArrowLeft size={16} />
        컬렉션으로 돌아가기
      </Link>
    </section>
  )
}
