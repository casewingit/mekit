import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Package, Info, MessageCircle } from 'lucide-react'
import { demo, dateLabel, type OrderAction } from '../services/demo'
import { cm, money } from '../domain/sizing'
import { ConceptImage } from '../components/ConceptImage'
const actionNames = { cancel: '취소', return: '반품', repair: '수선' }

export function Orders() {
  const orders = demo.readOrders()
  return (
    <section className="section-wrap standalone-section orders-page">
      <p className="eyebrow">MADE FOR YOU</p>
      <h1>당신의 한 줄, 만드는 이야기.</h1>
      <p className="section-description">선택한 사양과 제작·출고 예정일을 한곳에서 확인하세요.</p>
      <div className="info-banner">
        <Info size={18} />
        <p>이 기기에서 만든 데모 주문만 표시합니다. 실제 결제나 환불은 발생하지 않습니다.</p>
      </div>
      {!demo.storageAvailable && (
        <p role="status" className="field-error">
          브라우저 저장소를 사용할 수 없어 새로고침하면 주문이 사라질 수 있어요.
        </p>
      )}
      {orders.length ? (
        <div className="order-list">
          {orders.map((order) => (
            <Link key={order.id} className="order-list-item" to={`/orders/${order.id}`}>
              <ConceptImage scene={order.productCode} alt={`${order.productName} 팔찌 예시`} />
              <div>
                <span className="eyebrow">{dateLabel(order.createdAt)} · 데모 주문</span>
                <h2>{order.productName}</h2>
                <p>
                  {cm(order.length)} <span> / </span> {money(order.price)}
                </p>
                <small>{order.id}</small>
              </div>
              <div className="order-list-status">
                <span className="status-badge">
                  {order.request ? `${actionNames[order.request]} 요청 기록` : '데모 주문 생성'}
                </span>
                <ArrowRight size={20} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Package size={52} strokeWidth={1} />
          <h2>아직 엮기 전의 이야기.</h2>
          <p>
            마음에 드는 팔찌를 고르면
            <br />
            당신을 위한 한 줄이 여기서 시작됩니다.
          </p>
          <Link className="button primary" to="/products">
            나의 한 줄 찾기 <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </section>
  )
}

export function OrderDetail() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const [order, setOrder] = useState(() => demo.readOrders().find((o) => o.id === id))
  const [error, setError] = useState('')
  function request(action: OrderAction) {
    try {
      setOrder(demo.requestAction(id, action))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : '요청을 기록하지 못했어요.')
    }
  }
  if (!order)
    return (
      <section className="empty-state section-wrap standalone-section">
        <h1>이 기기에서 주문을 찾지 못했어요.</h1>
        <p>데모 주문은 주문을 만든 브라우저에 저장됩니다.</p>
        <Link to="/orders" className="button primary">
          내 주문 보기 <ArrowRight size={16} />
        </Link>
      </section>
    )
  const timeline = [
    { title: '데모 주문 생성', description: dateLabel(order.createdAt), active: true },
    { title: '제작 대기', description: '실제 주문 확정 후 진행' },
    { title: '매듭과 소재 엮기', description: `${dateLabel(order.productionDate)} 제작 완료 예상` },
    { title: '검수·포장', description: '길이와 매듭, 구성품을 확인해요' },
    { title: '출고·배송', description: `${dateLabel(order.shippingDate)} 출고 예상` },
  ]
  return (
    <section className="section-wrap standalone-section order-detail">
      <Link to="/orders" className="back-link">
        <ArrowLeft size={15} />
        전체 주문 보기
      </Link>
      {params.get('new') === '1' ? (
        <div className="confirmation-heading">
          <div className="confirmation-icon">
            <Check size={32} strokeWidth={1.5} />
          </div>
          <p className="eyebrow">YOUR OWN STORY STARTS HERE</p>
          <h1>
            나만의 한 줄,
            <br />
            준비되었어요.
          </h1>
          <p>선택한 사양으로 데모 주문을 만들었습니다.</p>
        </div>
      ) : (
        <>
          <p className="eyebrow">YOUR ORDER</p>
          <h1>나의 팔찌, 나의 기록.</h1>
        </>
      )}
      <div className="info-banner">
        <Info size={18} />
        <p>
          데모 주문입니다. 실제 결제나 환불은 발생하지 않습니다. 아래 제작·배송 단계는 실제 주문
          시의 흐름과 예상 일정을 보여줍니다.
        </p>
      </div>
      {!demo.storageAvailable && (
        <p role="status" className="field-error">
          저장소를 사용할 수 없어요. 이 주문은 현재 화면에서만 확인할 수 있습니다.
        </p>
      )}
      <div className="order-detail-grid">
        <div>
          <div className="order-spec-card">
            <ConceptImage scene={order.productCode} alt={`${order.productName} 콘셉트 이미지`} />
            <div>
              <span className="status-badge">데모 주문 생성</span>
              <h2>{order.productName}</h2>
              <p>완성 길이 {cm(order.length)} · 수량 1</p>
              <strong>{money(order.price)}</strong>
            </div>
          </div>
          <div className="order-metadata">
            <p>
              <span>주문번호</span>
              <strong>{order.id}</strong>
            </p>
            <p>
              <span>제작 완료 예상</span>
              <strong>{dateLabel(order.productionDate)}</strong>
            </p>
            <p>
              <span>출고 예상</span>
              <strong>{dateLabel(order.shippingDate)}</strong>
            </p>
            <p>
              <span>배송정보</span>
              <strong>데모 입력값은 보관하지 않아요</strong>
            </p>
          </div>
          <div className="order-actions">
            <h2>도움이 필요하신가요?</h2>
            <p>아래 요청은 이 기기에만 기록됩니다. 실제 고객센터 접수나 처리 결과가 아닙니다.</p>
            {order.request ? (
              <div className="request-confirmation" role="status">
                <Check size={18} />
                <div>
                  <strong>{actionNames[order.request]} 요청이 이 기기에 기록되었어요.</strong>
                  <p>운영 연동 후 담당자의 확인을 거쳐 처리할 수 있습니다.</p>
                </div>
              </div>
            ) : (
              <div className="request-buttons">
                {(['cancel', 'return', 'repair'] as const).map((action) => (
                  <button key={action} className="button secondary" onClick={() => request(action)}>
                    {actionNames[action]} 요청
                  </button>
                ))}
              </div>
            )}
            {error && (
              <p role="alert" className="field-error">
                {error}
              </p>
            )}
            <Link to="/support" className="text-link">
              <MessageCircle size={16} />
              주문 관련 문의하기 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <aside className="timeline-card">
          <p className="eyebrow">FROM OUR HANDS TO YOURS</p>
          <h2>한 줄이 완성되는 과정</h2>
          <ol className="timeline">
            {timeline.map((item, i) => (
              <li key={item.title} className={item.active ? 'active' : ''}>
                <span className="timeline-dot">
                  {item.active ? <Check size={13} /> : String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  {item.active && (
                    <span className="fine-print">실제 결제 완료 상태가 아닙니다.</span>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <p className="fine-print">
            제작 3영업일·출고 5영업일은 제안 일정이며, 재고와 제작 상황에 따라 달라질 수 있어요.
          </p>
        </aside>
      </div>
    </section>
  )
}
