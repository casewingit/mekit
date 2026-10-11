# MEKIT

MEKIT은 완성된 팔찌 디자인과 길이를 선택하고 내 손목에 착용한 모습을 확인하는 독립 iPhone 앱으로 개발합니다. 이 저장소에는 iPhone 기술 프로토타입과 기존 한국어 웹 커머스 데모가 함께 있습니다.

2026-10-11 최신 요청에 따라 **출시 플랫폼은 독립 iPhone 앱**, 웹은 랜딩/기존 데모로 유지합니다. [이슈 #2](https://github.com/casewingit/mekit/issues/2)의 기준은 001 EARTH · 49,000원입니다. [iPhone 프로젝트](ios/README.md), [출시 방향](docs/iphone-release-direction-2026-10-11.md), [검증 기록](docs/iphone-validation-2026-10-11.md)을 참고하세요. 현재는 기술 프로토타입이며 실기기 검증과 App Store 출시는 아직 진행하지 않았습니다. 아래 웹의 이전 제품 가격·구성은 최신 제품 기준이 아닙니다.

## 실행

Node.js 22.12 이상 또는 호환되는 최신 버전에서 실행합니다.

```sh
npm ci
npm run dev
```

브라우저에서 http://127.0.0.1:5173 을 엽니다.

```sh
npm test
npm run build
npm run test:e2e
```

브라우저 검증은 설치된 Google Chrome을 사용합니다. Chrome이 없는 환경에서는 Playwright Chromium 설치 후 `playwright.config.ts`의 `channel: 'chrome'`을 제거하세요. 서버가 없으면 테스트가 5173 포트의 개발 서버를 자동 실행합니다.

## 구현한 흐름

- 홈, 네 컬렉션 비교·필터, 찜과 복구.
- 제품 상세, 콘셉트 이미지 확대, 길이에 따라 비즈 구성이 달라지는 SVG 미리보기.
- 손목 둘레 / 완성 길이 선택, 세 가지 착용감, 추천 사이즈 기억.
- 15~21cm, 0.5cm 단위 검증과 범위 밖 주문 차단. 제품별 모든 길이 동일 가격.
- 배송정보 검증, 별도 필수 동의, 데모 주문 생성, 주문번호·예정일·사양 스냅샷.
- 주문 목록·상세·새로고침 복구, 취소·반품·수선 요청의 로컬 기록.
- 일곱 가지 소재 아카이브와 관리법, FAQ, 데모 문의, 정책 초안.
- 모바일 내비게이션, 키보드 포커스, 라벨·오류 연결, 이미지 확대 다이얼로그.

## 현재 데모와 실제 연동의 차이

실제 Toss 로그인·결제, 서버 주문, 제작·배송, 환불, 고객센터 전송은 연결되어 있지 않습니다. 화면에서 이를 데모로 명시합니다. 토스페이 가맹 승인과 서버 자격증명 없이 결제 성공을 흉내 내지 않습니다.

수령인 이름, 전화번호, 우편번호와 주소는 주문서 입력 상태에서만 사용하며 서버·로컬 저장소에 저장하지 않습니다. 실제 개인정보 대신 예시 정보를 입력하세요. 비민감 제품 사양·가격·데모 주문 식별자와 찜만 `localStorage`에 저장하며, 손목 가이드 값은 `sessionStorage`에 저장합니다. 브라우저 저장소가 차단되면 주문을 현재 세션의 메모리에 유지하고 안내합니다.

주문·문의 기능은 실제 지원 처리로 이어지지 않습니다. 취소·반품·수선 버튼은 요청 유형만 로컬에 기록하며, 환불 완료나 실제 접수를 표시하지 않습니다.

제안 가격, 소재 사양, ±0.3cm 허용오차, 제작 3영업일·출고 5영업일, 데모 배송비 0원과 정책은 실제 판매 전에 확정해야 합니다.

데모 예정일은 한국 시간의 날짜를 기준으로 주말을 제외해 계산합니다. 공휴일·휴무일·실제 제작 용량은 반영하지 않으며, 판매 전 서버 운영 캘린더로 교체해야 합니다.

## 콘셉트 이미지

사용자가 지정한 [GitHub 이슈 #1 댓글](https://github.com/casewingit/mekit/issues/1#issuecomment-6089609572)의 보드를 참조합니다. 원본을 `public/images/concept-1.png`부터 `concept-4.png`까지 보존하고, `ConceptImage.tsx`의 SVG 뷰포트로 해당 영역을 표시합니다. 주요 홈·제품·소재 영역에는 MEKIT 보드 3, 착용 예시에는 보드 1을 사용합니다. ROOTED와 GYEOL의 브랜드 표기는 앱 UI에 사용하지 않습니다.

콘셉트 이미지는 실물 제품 사진이 아닙니다. 실제 판매 전 승인된 제품 사진과 사양으로 교체해야 합니다.

## 코드 구조

```text
src/
  domain/       제품·소재 데이터, 사이즈 규칙, 배송 입력 검증
  services/     비민감 데모 주문 저장, 중복 요청 방지, 요청 기록
  components/   공통 레이아웃, 콘셉트 이미지, SVG 미리보기, 찜
  pages/        홈·제품·사이즈·소재·주문·고객지원
tests/          데스크톱·모바일 고객 여정 검증
docs/           승인 설계와 구현 계획
```

실서비스 연결 시 `services/demo.ts`를 인증된 서버 어댑터로 교체하고 서버에서 가격·소유권·재고·결제 상태를 검증해야 합니다. App in Toss WebView SDK/TDS, 토스 로그인 코드 교환, 토스페이 준비·승인·조회·복구·환불 대사는 서버와 플랫폼 설정이 준비된 뒤 연결합니다. 프로덕션 개인정보 저장·암호화와 운영 어드민도 별도 후속 범위입니다.

## 라우트

`/`, `/products`, `/products/:code`, `/size-guide`, `/materials`, `/favorites`, `/checkout`, `/orders`, `/orders/:id`, `/support`, `/policies/:type`.

로컬 개발에서는 일반 URL 라우팅을 사용합니다. 다른 정적 호스팅에 기본 빌드를 배포한다면 존재하지 않는 파일 경로를 `index.html`로 보내는 SPA fallback 설정이 필요합니다.

## GitHub Pages 배포

공개 데모 주소: [https://casewingit.github.io/mekit/](https://casewingit.github.io/mekit/).

GitHub 저장소의 Pages Source는 **Deploy from a branch**, 게시 브랜치는 **gh-pages / (root)**입니다. 빌드 결과와 `.nojekyll`을 별도 게시 브랜치에 올리며 소스는 `main`에서 관리합니다. 현재 GitHub 인증에 `workflow` 권한이 없어 사용자 정의 Actions 대신 브랜치 게시를 사용합니다.

업데이트를 배포하려면 다음 명령을 실행합니다. 단위 테스트와 Pages 빌드가 성공한 뒤 임시 체크아웃에서 게시 브랜치를 갱신하고, GitHub가 해당 결과를 자동 게시합니다. Git 인증과 커밋 사용자 설정이 필요합니다. `main`만 푸시하면 공개 사이트는 갱신되지 않습니다.

```sh
npm run deploy:pages
```

Pages 빌드는 `/mekit/` 경로와 해시 라우팅을 사용해 제품 상세 등에서 새로고침해도 열립니다. 예: `https://casewingit.github.io/mekit/#/products/earth`. 이미지와 글꼴에도 같은 경로가 적용됩니다.

```sh
npm run build:pages
npm run preview -- --mode pages
```

로컬 미리보기 주소는 `http://localhost:4173/mekit/`입니다. Pages 전용 데스크톱·모바일 검증은 `npm run test:pages`로 실행합니다.
