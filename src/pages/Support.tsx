import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Plus, ArrowUpRight, Check, Info } from 'lucide-react'
import { NotFound } from './NotFound'
import { createLocalInquiry } from '../services/demo'

const questions = [
  {
    q: '손목 둘레와 팔찌 완성 길이는 어떻게 다른가요?',
    a: '손목 둘레는 줄자를 손목에 여유 없이 감아 잰 값이고, 완성 길이는 팔찌 전체의 길이예요. 손목 둘레에 딱 맞게 +0.5cm, 편안하게 +1.0cm, 여유 있게 +1.5cm를 더하는 것을 제안합니다.',
    link: '/size-guide',
    label: '사이즈 가이드 보기',
  },
  {
    q: '길이가 길어지면 가격도 달라지나요?',
    a: '같은 제품은 15~21cm 제공 범위 내에서 길이 추가금 없이 같은 가격이에요. 제품별 소재와 공정에 따라 네 컬렉션의 가격은 서로 다릅니다.',
  },
  {
    q: '언제 만들어지고 배송되나요?',
    a: '주문 후 제작을 기준으로 제작 완료 3영업일, 출고 5영업일 이내를 제안하고 있어요. 실제 운영 시 재고와 제작 상황에 따라 결제 전에 예정일을 안내합니다. 현재 데모에서는 실제 제작·배송이 진행되지 않습니다.',
  },
  {
    q: '금속 알레르기가 있어도 착용할 수 있나요?',
    a: '무알레르기를 보장하지 않습니다. 금속 등급과 코팅·합금 여부는 공급처 증빙을 기준으로 확정할 예정이에요. 알레르기가 있다면 최종 소재 사양을 확인하고 피부 반응이 생기면 착용을 중단하세요.',
    link: '/materials',
    label: '소재별 안내 보기',
  },
  {
    q: '사진과 소재의 무늬가 다를 수 있나요?',
    a: '우드와 천연석은 색과 무늬에 자연적인 차이가 있을 수 있어요. 현재 이미지 역시 콘셉트 이미지이며 실제 제품을 보장하지 않습니다. 판매 전 실물 사진과 허용 편차를 안내할 예정이에요.',
  },
  {
    q: '교환·반품이나 길이 수선은 어떻게 요청하나요?',
    a: '내 주문에서 취소·반품·수선 요청을 기록할 수 있어요. 현재는 로컬 데모 기록으로, 실제 고객센터에 접수되지 않습니다. 최종 운영 정책과 처리 비용은 판매 전에 안내합니다.',
    link: '/policies/returns',
    label: '교환·반품 안내 보기',
  },
]

export function Support() {
  const [category, setCategory] = useState('사이즈 상담')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [complete, setComplete] = useState(false)
  function submit(e: FormEvent) {
    e.preventDefault()
    try {
      createLocalInquiry(category, message)
      setError('')
      setComplete(true)
      setMessage('')
    } catch (e) {
      setError(e instanceof Error ? e.message : '문의 내용을 확인해 주세요.')
    }
  }
  return (
    <section className="section-wrap standalone-section support-page">
      <p className="eyebrow">WE ARE HERE TO HELP</p>
      <h1>
        작은 궁금함까지,
        <br />
        함께 풀어갈게요.
      </h1>
      <p className="section-description">
        사이즈부터 소재, 관리와 주문까지.
        <br />
        오래 좋아할 수 있도록 자세히 안내합니다.
      </p>
      <div className="support-grid">
        <div>
          <h2>자주 묻는 이야기</h2>
          <div className="faq-list">
            {questions.map((item) => (
              <details key={item.q}>
                <summary>
                  {item.q}
                  <Plus size={18} />
                </summary>
                <p>{item.a}</p>
                {item.link && (
                  <Link className="text-link" to={item.link}>
                    {item.label}
                    <ArrowUpRight size={16} />
                  </Link>
                )}
              </details>
            ))}
          </div>
          <div className="support-links">
            <Link to="/policies/returns">
              교환·반품·수선
              <ArrowUpRight size={17} />
            </Link>
            <Link to="/policies/privacy">
              개인정보 안내
              <ArrowUpRight size={17} />
            </Link>
            <Link to="/policies/business">
              사업자 정보
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
        <div className="inquiry-card">
          <p className="eyebrow">A CONVERSATION, UNKNOTTED</p>
          <h2>1:1 문의</h2>
          <p>
            응답 목표: 영업일 24시간 이내
            <br />
            <small>운영 시작 후 적용되는 제안 기준입니다.</small>
          </p>
          <div className="small-demo-note">
            <Info size={15} />
            <span>
              데모 문의 · 고객센터로 전송되지 않아요.
              <br />
              실제 개인정보는 입력하지 마세요.
            </span>
          </div>
          {complete ? (
            <div className="inquiry-confirmation" role="status">
              <Check size={30} />
              <h3>문의 내용을 확인했어요.</h3>
              <p>데모 화면이므로 고객센터에 전송되지 않았습니다.</p>
              <button className="button secondary" onClick={() => setComplete(false)}>
                다른 문의 작성하기
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <label className="field-label" htmlFor="inquiry-category">
                문의 유형
              </label>
              <select
                id="inquiry-category"
                className="full-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {['사이즈 상담', '소재·관리', '주문·배송', '교환·반품·수선', '기타'].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <label className="field-label" htmlFor="inquiry-message">
                문의 내용
              </label>
              <textarea
                id="inquiry-message"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  setError('')
                }}
                placeholder="궁금한 내용을 10자 이상 적어 주세요."
                maxLength={1500}
                rows={6}
                aria-invalid={!!error}
                aria-describedby={error ? 'inquiry-error' : undefined}
              />
              <span className="character-count">{message.length} / 1,500</span>
              {error && (
                <p id="inquiry-error" role="alert" className="field-error">
                  {error}
                </p>
              )}
              <button className="button primary" type="submit">
                데모 문의 작성 완료
                <ArrowUpRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

const policies: Record<
  string,
  { name: string; subtitle: string; sections: { title: string; text: string }[] }
> = {
  terms: {
    name: '이용약관',
    subtitle: '데모 서비스 이용 안내 · 정식 판매 약관은 확정 전입니다.',
    sections: [
      {
        title: '서비스의 범위',
        text: 'MEKIT MVP는 제품 탐색, 사이즈 추천, 데모 주문 흐름을 체험하는 브라우저 앱입니다. 현재 상품 판매 계약이나 실물 결제·제작·배송은 이루어지지 않습니다.',
      },
      {
        title: '제품과 가격 정보',
        text: '제품 이미지, 가격, 소재 조성, 제작 예정일은 기획 문서에 기반한 예시입니다. 실제 판매 전 확정된 정보로 교체합니다.',
      },
      {
        title: '주문과 문의 기록',
        text: '데모 주문은 현재 브라우저의 로컬 저장소에 기록됩니다. 고객센터 문의와 요청은 실제 담당자에게 전송되지 않으며 처리 결과를 보장하지 않습니다.',
      },
      {
        title: '정식 출시 전 확정 사항',
        text: '사업자·고객센터 정보, 판매 계약·취소 절차, 분쟁 처리, 토스페이와 운영 정책을 확정하고 관련 검토를 완료한 뒤 판매를 시작합니다.',
      },
    ],
  },
  privacy: {
    name: '개인정보 안내',
    subtitle: '현재 데모의 정보 사용 안내 · 정식 개인정보처리방침 초안',
    sections: [
      {
        title: '배송정보 입력',
        text: '받는 분 이름, 전화번호, 우편번호와 주소는 데모 주문서 검증에만 사용합니다. 서버로 전송하거나 로컬 저장소에 보관하지 않으며 주문 생성 후 입력 상태를 비웁니다. 실제 개인정보 대신 예시 정보를 입력하세요.',
      },
      {
        title: '기기에 저장하는 정보',
        text: '제품명·제품 코드, 선택 길이·손목 둘레·착용감, 예시 가격, 데모 주문번호·생성일·예정일·요청 유형과 찜한 제품을 저장합니다. 손목 측정 가이드 값은 현재 세션에만 기억합니다.',
      },
      {
        title: '정보 삭제',
        text: '브라우저의 이 사이트 저장 데이터 삭제 기능을 사용하면 데모 주문과 찜 목록이 삭제됩니다. 서버에 저장된 개인정보는 없습니다.',
      },
      {
        title: '정식 출시 전 안내',
        text: '운영 인프라, 결제·택배·고객센터 공급자가 확정되면 수집 항목과 목적, 보유기간, 위탁, 권리 행사 방법과 담당자를 정식 정책에 명시합니다.',
      },
    ],
  },
  returns: {
    name: '교환·반품·수선 안내',
    subtitle: '운영 정책 초안 · 최종 비용과 처리 조건은 출시 전 확정합니다.',
    sections: [
      {
        title: '불량과 오배송',
        text: '불량·오배송·표시와 다른 상품은 사업자 부담의 교환·환불을 원칙으로 제안합니다. 사진과 주문 사양을 확인해 처리하는 절차를 마련할 예정입니다.',
      },
      {
        title: '단순 변심과 주문제작',
        text: '주문제작이라는 이유만으로 일괄 교환·환불 불가를 고지하지 않습니다. 미사용 일반 규격 상품과 개별 제작 상품의 처리 조건을 구분하고, 관련 법과 플랫폼 정책 검토 후 정식 약관으로 안내합니다.',
      },
      {
        title: '사이즈 선택과 수선',
        text: '사이즈 선택 오류에 대한 리사이징 횟수와 유·무상 조건, 배송비와 수선 비용은 최종 운영 정책에서 안내합니다. 15~21cm 범위 밖 사이즈는 주문 전에 상담이 필요합니다.',
      },
      {
        title: '데모 요청 기능',
        text: '내 주문의 취소·반품·수선 버튼은 이 기기에 요청 유형을 기록하는 예시입니다. 실제 접수·환불·배송 회수는 발생하지 않습니다.',
      },
    ],
  },
  business: {
    name: '사업자·고객센터 정보',
    subtitle: '정식 판매 준비 중 · 확정되지 않은 사업자 정보를 임의로 표시하지 않습니다.',
    sections: [
      { title: '브랜드', text: 'MEKIT — Make it your own. 소재와 매듭을, 나답게.' },
      {
        title: '사업자 정보',
        text: '사업자명, 대표자, 사업자등록번호, 통신판매 관련 신고 정보와 사업장 주소는 출시 전 확정·등록 후 안내합니다. 현재 데모에서는 실물 상품 판매를 진행하지 않습니다.',
      },
      {
        title: '고객센터',
        text: '현재 FAQ와 데모 문의 작성 기능을 제공합니다. 실제 전화번호·이메일·운영 시간은 출시 전 등록합니다. 영업일 24시간 이내 1차 응답을 목표로 제안합니다.',
      },
      {
        title: '공식 판매와 정품 확인',
        text: '공식 판매 채널과 주문번호 기반 제품 확인, 소재·제작 기록 카드를 출시 전에 마련할 예정입니다. 현재 이미지와 데모 주문은 정품 구매 증명이 아닙니다.',
      },
    ],
  },
}
export function Policy() {
  const { type = '' } = useParams()
  const policy = policies[type]
  if (!policy) return <NotFound />
  return (
    <section className="section-wrap standalone-section policy-page">
      <p className="eyebrow">MEKIT / SERVICE INFORMATION</p>
      <h1>{policy.name}</h1>
      <p className="section-description">{policy.subtitle}</p>
      <div className="info-banner">
        <Info size={18} />
        <p>
          확정된 판매 약관이 아닌 데모 안내입니다. 실제 판매 전에 최종 검토와 고지를 진행합니다.
        </p>
      </div>
      {policy.sections.map((section) => (
        <article key={section.title}>
          <h2>{section.title}</h2>
          <p>{section.text}</p>
        </article>
      ))}
      <Link className="text-link" to="/support">
        고객지원으로 돌아가기
        <ArrowUpRight size={16} />
      </Link>
    </section>
  )
}
