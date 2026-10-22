export const boards = [
  {
    id: 'indigo-line', title: 'INDIGO LINE', korean: '일상에 스며든 쪽빛', type: 'PRODUCT DIRECTION',
    image: 'images/02-indigo-line.png', prompt: 'prompts/02-indigo-line.txt',
    alt: '쪽빛의 가는 매듭 팔찌를 데님 소매, 아이보리 한지, 무광 금속과 함께 보여주는 생성 무드보드',
    line: 'A quiet thread of Korea.',
    description: '짙은 쪽빛, 오래 입은 데님, 밝은 종이. 전통의 연결과 반복을 익숙한 옷차림 속 작은 디테일로 제안합니다.',
    knot: '작은 연결 매듭에 집중한 탐색입니다. 쪽빛은 색의 영감이며, 실제 천연 쪽염색 제품이라는 뜻은 아닙니다.',
    opinion: '2026.10.21 사용자가 선택한 메인 방향입니다. 제품 전체·착용·매듭·소재 네 장면을 새 랜딩페이지에 연결했습니다. 첫 실물 샘플은 이 비율과 색을 기준으로 검토합니다.',
    check: '실제 2mm 다이니마 사용 로프의 색상 수급, 이염, 마감과 매듭의 형태 유지가 미확인입니다.',
    colors: [['Indigo', '#192d40'], ['Ivory', '#e8dfcb'], ['Charcoal', '#333535']],
    tags: ['선택한 메인 방향', '딥 인디고', '네 장면의 랜딩'],
  },
  {
    id: 'field-line', title: 'FIELD LINE', korean: '나무와 돌, 거친 일상의 결', type: 'PRODUCT LINE / CONCEPT',
    image: 'images/05-field-line.png', prompt: 'prompts/05-field-line.txt',
    alt: '가는 갈색 로프에 짙은 목재와 스모키 쿼츠를 배치한 팔찌, 캔버스 재킷 착용, 연결 디테일과 소재 생성 무드보드',
    line: 'A rougher edge. The same restraint.',
    description: '짙은 목재 한 조각과 작은 원석 두 점. 자연의 질감을 가는 선 위에 얹어 워크웨어에 어울리는 남성적인 인상을 탐색합니다.',
    knot: '짧은 매듭은 목재와 원석의 위치를 잡는 시각적 연결점입니다. 전통매듭의 특정 기법을 재현했다고 주장하지 않습니다.',
    opinion: '2026.10.22 추가한 두 번째 라인입니다. INDIGO의 댄디함을 유지하면서 FIELD에는 자연 소재를 허용합니다. 원석 제외 조건은 INDIGO에 유지됩니다.',
    check: '2mm 로프와 약 4mm 장식의 비율은 목표입니다. 원석 구멍과 남는 벽 두께, 충격 파손, 목재 수종·코팅·수분 반응, 금속 소재를 확인해야 합니다. 경도는 완제품 내구성 보증이 아닙니다.',
    colors: [['Walnut', '#59402d'], ['Smoke', '#95816b'], ['Charcoal', '#28251f']],
    tags: ['두 번째 상품 라인', '목재 + 원석', '워크웨어'],
  },
  {
    id: 'shift-cobalt', title: 'SHIFT / COBALT', korean: '먹색 위, 짧고 선명한 코발트.', type: 'PRODUCT LINE / COLOUR STUDY',
    image: 'images/06-shift-cobalt.png', prompt: 'prompts/06-shift-cobalt.txt',
    alt: '먹색 슬림 로프와 무광 블랙 금속, COBALT 컬러 감기의 전체·착용·확대·소재 생성 무드보드',
    line: 'Small detail. Different energy.',
    description: '살짝 비껴 놓은 작은 금속, 짧은 컬러 감기, 드러난 매듭. 워시드 블랙 데님과 콘크리트 사이에서 가는 한 줄을 강조합니다.',
    knot: '짧은 끝단과 조절 매듭을 시각적으로 제안합니다. 실제 조절 범위·매듭 유지·로프 마찰은 검증 전이며 전통매듭 재현 주장을 하지 않습니다.',
    opinion: '2026.10.23 추가한 세 번째 라인. SHIFT의 메인 방향입니다. 차분한 먹색과 짧은 파란색 감기로 스트리트 감각을 더합니다.',
    check: '2mm는 로프 외경 목표입니다. 컬러 실의 이염·보풀·고정, 금속 모서리와 코팅, 짧은 끝단의 조절 여유를 실물로 확인합니다. 원석과 목재는 사용하지 않는 방향입니다.',
    colors: [['Charcoal', '#202320'], ['Cobalt', '#2456e8'], ['Concrete', '#dadcd9']],
    tags: ['세 번째 상품 라인', 'COBALT 포인트', '스트리트'],
  },
  {
    id: 'shift-lime', title: 'SHIFT / LIME', korean: '같은 먹색, 더 강한 라임의 대비.', type: 'PRODUCT LINE / COLOUR STUDY',
    image: 'images/07-shift-lime.png', prompt: 'prompts/07-shift-lime.txt',
    alt: '먹색 슬림 로프와 무광 블랙 금속, LIME 컬러 감기의 전체·착용·확대·소재 생성 무드보드',
    line: 'Small detail. Different energy.',
    description: '살짝 비껴 놓은 작은 금속, 짧은 컬러 감기, 드러난 매듭. 워시드 블랙 데님과 콘크리트 사이에서 가는 한 줄을 강조합니다.',
    knot: '짧은 끝단과 조절 매듭을 시각적으로 제안합니다. 실제 조절 범위·매듭 유지·로프 마찰은 검증 전이며 전통매듭 재현 주장을 하지 않습니다.',
    opinion: '2026.10.23 추가한 세 번째 라인. SHIFT의 색상 비교안입니다. 코발트보다 강한 대비를 제안하며 별도로 생성해 금속과 매듭의 형태에는 차이가 있습니다.',
    check: '2mm는 로프 외경 목표입니다. 컬러 실의 이염·보풀·고정, 금속 모서리와 코팅, 짧은 끝단의 조절 여유를 실물로 확인합니다. 원석과 목재는 사용하지 않는 방향입니다.',
    colors: [['Charcoal', '#202320'], ['Lime', '#c8e846'], ['Concrete', '#dadcd9']],
    tags: ['세 번째 상품 라인', 'LIME 포인트', '스트리트'],
  },
  {
    id: 'black-knot', title: 'BLACK KNOT', korean: '먹빛에 남은 매듭', type: 'PRODUCT DIRECTION',
    image: 'images/01-black-knot.png', prompt: 'prompts/01-black-knot.txt',
    alt: '먹색의 가는 로프, 작은 검은 금속과 매듭을 한지·한옥 질감 및 손목 착용 모습으로 구성한 생성 무드보드',
    line: 'Korean knot, everyday form.',
    description: '검은 로프와 작은 매듭의 반복. 한옥의 먹빛 목재와 한지의 여백을, 일상에 가장 가까운 팔찌로 옮겨봅니다.',
    knot: '도래매듭의 연결 구조에서 출발한 작은 매듭 두 곳. 장식의 부피를 줄이고 금속과의 접점을 강조합니다.',
    opinion: 'INDIGO LINE과 비교해 보관하는 먹색 방향입니다. 작은 금속과 매듭의 비율을 살피는 참고안이며, 현재 메인 방향은 쪽빛입니다.',
    check: '검은 매듭이 사진과 실물에서 충분히 보이는지, 일반 로프 팔찌와 구별되는지 확인해야 합니다.',
    colors: [['Ink', '#262727'], ['Paper', '#b9b0a0'], ['Timber', '#575046']],
    tags: ['도래매듭에서 영감', '매트 블랙', '먹색 비교안'],
  },
  {
    id: 'red-thread', title: 'RED THREAD', korean: '작은 붉음, 분명한 인상', type: 'PRODUCT DIRECTION',
    image: 'images/03-red-thread.png', prompt: 'prompts/03-red-thread.txt',
    alt: '검은 슬림 로프와 무광 금속 옆에 작은 적갈색 매듭을 둔 팔찌와 워크웨어 착용 생성 무드보드',
    line: 'One knot. A distinct signature.',
    description: '전체는 검게, 한 곳만 낮은 적갈색으로. 오래된 목재의 붉은 흔적에서 가져온 색으로 매듭 하나를 기억하게 합니다.',
    knot: '연봉매듭의 응축된 입체감에서 영감을 얻은 포인트. 정확한 전통 기법의 재현은 장인 검증 전입니다.',
    opinion: '브랜드를 기억하게 할 비교안으로 추천합니다. 색을 여러 개 더하기보다 한 점의 비율을 정교하게 다듬습니다.',
    check: '작은 매듭이 과한 장식으로 보이지 않는지 확인합니다. 특정 길상·보호 의미나 전통 색의 효능을 부여하지 않습니다.',
    colors: [['Charcoal', '#252727'], ['Oxide', '#8f3e2e'], ['Hanji', '#e8dfce']],
    tags: ['연봉매듭에서 영감', '적갈색 한 점', '차별화 비교안'],
  },
  {
    id: 'studio-space', title: 'THE STUDIO', korean: '산출물을 살펴보는 공간', type: 'INTERFACE CONCEPT',
    image: 'images/04-studio-space.png', prompt: 'prompts/04-studio-space.txt',
    alt: 'MEKIT STUDIO 갤러리의 생성 UI 시안. 큰 무드보드와 설명, 이전 다음 버튼, 세 장의 썸네일을 배치한 아이보리 화면',
    line: 'A small knot. A wider world.',
    description: '이미지를 크게 보고, 방향을 넘겨 비교하고, 판단을 기록하는 작업실. 이 화면 자체도 이미지로 생성해 디자인 이력에 남깁니다.',
    knot: '앞의 세 장을 참조해 생성한 갤러리 화면 시안입니다. 이 이미지 속 문구와 버튼은 실제 UI가 아닌 디자인 제안입니다.',
    opinion: '첫 갤러리 화면의 생성 이력입니다. 현재는 INDIGO LINE을 첫 보드로 보여주며 새 랜딩과 연결합니다. 이 UI 이미지는 초기 시안으로 보존합니다.',
    check: '이미지 안의 설명은 생성된 예시 문구입니다. 제품의 제작 완료·성능·원산지를 입증하지 않습니다.',
    colors: [['Paper', '#f3efe7'], ['Ink', '#242421'], ['Accent', '#a24c33']],
    tags: ['갤러리 UI 시안', 'GPT 생성 이미지', 'HTML 구현'],
  },
]

export function indexFromHash(hash) {
  const id = hash.replace(/^#/, '')
  const index = boards.findIndex(board => board.id === id)
  return index < 0 ? 0 : index
}

export function wrapIndex(index) {
  return ((index % boards.length) + boards.length) % boards.length
}

export function parseNotes(raw) {
  try {
    const value = JSON.parse(raw)
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
    return Object.fromEntries(boards.filter(board => typeof value[board.id] === 'string')
      .map(board => [board.id, value[board.id].slice(0, 5000)]))
  } catch { return {} }
}
