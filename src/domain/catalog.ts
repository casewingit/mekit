export type ProductCode = 'earth' | 'industry' | 'amber' | 'fragment'
export type MaterialId = 'wood' | 'stone' | 'glass' | 'ceramic' | 'brass' | 'steel' | 'titanium'
export type Product = {
  code: ProductCode
  name: string
  subtitle: string
  tagline: string
  story: string
  price: number
  number: string
  group: 'nature' | 'metal' | 'color'
  materials: MaterialId[]
  colors: string[]
  cord: string
  background: string
  label: string
  beadCount: number
}
export const products: Product[] = [
  {
    code: 'earth',
    name: 'EARTH',
    subtitle: '자연을 담은 팔찌',
    tagline: '나무와 돌의 따뜻한 조합',
    story:
      '나무의 따뜻함, 돌의 묵직함. 오랜 시간 만들어진 자연의 물성을 한 줄의 매듭으로 잇습니다. 서로 조금씩 다른 색과 무늬가 나만의 균형을 만듭니다.',
    price: 39000,
    number: '01',
    group: 'nature',
    materials: ['wood', 'stone', 'brass'],
    colors: ['#725038', '#9a7757', '#433e30', '#bca584', '#806249', '#b69a6d'],
    cord: '#514530',
    background: '#e9e5da',
    label: 'WOOD · NATURAL STONE',
    beadCount: 23,
  },
  {
    code: 'industry',
    name: 'INDUSTRY',
    subtitle: '정제된 물성의 균형',
    tagline: '차가운 소재를 손의 구조로 잇다',
    story:
      '차가운 금속과 부드러운 매듭이 만나는 지점. 정밀한 표면과 손으로 만든 구조 사이에서, 일상에 오래 남는 단단한 균형을 찾습니다.',
    price: 49000,
    number: '02',
    group: 'metal',
    materials: ['steel', 'titanium'],
    colors: ['#888d8c', '#b7bcbb', '#52595b', '#ced0cc', '#717978', '#a1a8a6'],
    cord: '#2e3432',
    background: '#e2e5e3',
    label: 'STEEL · TITANIUM',
    beadCount: 27,
  },
  {
    code: 'amber',
    name: 'AMBER',
    subtitle: '머금은 빛의 온도',
    tagline: '빛을 모아 묶은 한 줄',
    story:
      '빛을 통과시키는 유리와 따뜻한 황동. 호박빛 세라믹이 만드는 은은한 리듬을 매듭으로 묶었습니다. 움직일 때마다 다른 빛을 발견하세요.',
    price: 45000,
    number: '03',
    group: 'color',
    materials: ['glass', 'brass', 'ceramic'],
    colors: ['#a96425', '#c59148', '#794824', '#d4aa61', '#92591e', '#bd8033'],
    cord: '#74512c',
    background: '#eee3d2',
    label: 'GLASS · BRASS · CERAMIC',
    beadCount: 24,
  },
  {
    code: 'fragment',
    name: 'FRAGMENT',
    subtitle: '다름이 만드는 하나',
    tagline: '다른 조각이 하나의 균형이 되는 방식',
    story:
      '서로 다른 색, 모양, 질감. 같지 않은 조각들이 만나 새로운 질서를 만듭니다. 완벽한 대칭보다 나다운 리듬을 좋아하는 당신을 위한 한 줄.',
    price: 47000,
    number: '04',
    group: 'color',
    materials: ['ceramic', 'glass', 'stone', 'brass'],
    colors: ['#ece8dd', '#686d61', '#b1724f', '#c3baa4', '#6c726f', '#c7a674'],
    cord: '#676250',
    background: '#e8e6df',
    label: 'CERAMIC · MIXED MATERIALS',
    beadCount: 21,
  },
]
export function getProduct(code: string): Product | undefined {
  return products.find((p) => p.code === code.toLowerCase())
}

export type Material = {
  id: MaterialId
  name: string
  en: string
  color: string
  description: string
  care: string
  note: string
}
export const materials: Material[] = [
  {
    id: 'wood',
    name: '우드',
    en: 'WOOD',
    color: '#896849',
    description: '손끝에 느껴지는 따뜻한 온도. 가볍고 부드러운 나무 고유의 질감을 담습니다.',
    care: '물, 땀, 향수에 오래 노출하지 말고 부드러운 마른 천으로 닦아 주세요.',
    note: '수종·코팅 방식은 샘플 확정 후 안내합니다. 색과 무늬는 서로 다를 수 있어요.',
  },
  {
    id: 'stone',
    name: '천연석',
    en: 'NATURAL STONE',
    color: '#77766a',
    description: '시간이 만든 고유한 무늬. 작은 돌 하나에도 같은 표정은 없습니다.',
    care: '강한 충격을 피하고 산성 세제나 화학 제품이 닿지 않도록 해 주세요.',
    note: '광물명과 염색·처리 여부는 제품 사양 확정 후 안내합니다.',
  },
  {
    id: 'glass',
    name: '유리',
    en: 'GLASS',
    color: '#b5864d',
    description: '빛을 통과시키고 색을 머금는 표면. 손목의 움직임에 따라 빛이 달라집니다.',
    care: '충격에 깨질 수 있어요. 파손된 제품은 착용을 멈춰 주세요.',
    note: '유리는 천연 호박이 아닙니다. 반투명 부품은 유리 소재안이에요.',
  },
  {
    id: 'ceramic',
    name: '세라믹',
    en: 'CERAMIC',
    color: '#c9c2b4',
    description: '흙에서 시작해 단단해진 조각. 담백한 질감과 깊이 있는 색을 만납니다.',
    care: '떨어뜨리거나 단단한 물체에 부딪히지 않게 주의해 주세요.',
    note: '표면 처리와 마감은 최종 사양에 따라 달라질 수 있어요.',
  },
  {
    id: 'brass',
    name: '황동',
    en: 'BRASS',
    color: '#a68b4f',
    description: '시간과 함께 색이 깊어지는 따뜻한 금속. 쓰는 사람의 시간이 쌓입니다.',
    care: '산화와 변색이 생길 수 있어요. 착용 후 닦아 건조한 곳에 보관하세요.',
    note: '도금·코팅 여부는 확정 후 안내합니다. 피부 반응이 생기면 사용을 중단하세요.',
  },
  {
    id: 'steel',
    name: '스테인리스',
    en: 'STAINLESS STEEL',
    color: '#a0a6a5',
    description: '정돈된 광택과 단단한 표면. 일상의 구조를 만드는 차분한 금속입니다.',
    care: '부드러운 천으로 닦고, 염소·강한 세제와의 접촉을 피하세요.',
    note: '써지컬 등급은 공급처 증빙 후 확정합니다. 무알레르기를 보장하지 않습니다.',
  },
  {
    id: 'titanium',
    name: '티타늄',
    en: 'TITANIUM',
    color: '#717774',
    description: '가벼움 속의 단단함. 차분한 회색빛이 매듭의 부드러움을 돋보이게 합니다.',
    care: '거친 연마제는 피하고, 오염은 부드러운 천으로 닦아 주세요.',
    note: '순티타늄·합금·코팅 여부는 공급처 증빙을 기준으로 확정합니다.',
  },
]
export const getMaterial = (id: MaterialId) => materials.find((m) => m.id === id)!
