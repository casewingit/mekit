# MEKIT iPhone Prototype Implementation Plan

> 실행 방식: 이 대화에서 순차 구현한다. 사용자의 인수인계와 구현 요청을 승인된 범위로 사용하고 제품 결정을 다시 논의하지 않는다.

**Goal:** EARTH 한 모델의 후면 카메라 착용 합성 기술 검증용 iPhone 프로젝트를 만든다.

**Architecture:** AVFoundation이 세로 회전된 프레임을 Vision에 전달한다. 독립 Swift 패키지가 랜드마크 품질, aspect-fill 좌표, 화면상 손목 포즈, 보정 범위, 추적 만료를 계산한다. SwiftUI 화면 위 Metal 깊이 버퍼 렌더러가 고정 완성 디자인과 근사 손목 가림을 합성한다.

**Tech Stack:** Swift, SwiftUI, AVFoundation, Vision, MetalKit, XcodeGen, Swift Testing/XCTest.

## Global Constraints

- iPhone, iOS 17 이상, 세로 화면, 후면 카메라, EARTH 한 모델.
- 실제 길이 측정·정확한 3D 손목 복원·실제 제품 복제라고 표현하지 않는다.
- 49,000원은 제품 참고 표시이며 결제 흐름은 만들지 않는다.
- 웹 앱과 Pages 배포는 유지한다.
- 원본 자료 미확보와 실제 iPhone 미연결은 검증 결과에 별도로 기록한다.

## 작업

1. **좌표·포즈·보정 핵심** — `ios/Core/Package.swift`, `Sources/TryOnCore/Geometry.swift`, `Tests/TryOnCoreTests/GeometryTests.swift`.
   - [x] 독립 기대값으로 종횡비 크롭·Y축 반전·회전 각도·저신뢰 제거·추적 만료·보정 초기화 테스트를 먼저 실행한다.
   - [x] `CameraMapping`, `WristEstimator`, `PoseFilter`, `Calibration`을 구현하고 `swift test --package-path ios/Core`로 검증한다.
2. **카메라·앱 수명주기** — `ios/MEKIT/CameraController.swift`, `PrototypeModel.swift`, `TryOnView.swift`, `MEKITApp.swift`, `ios/project.yml`.
   - [x] 카메라 권한 설명, 후면 카메라·프레임 회전·단일 손 가이드, 비활성화 중지·재개·중단 안내를 구현한다.
   - [x] 카메라 없는 시뮬레이터는 카메라 불가 상태로 표시한다. 3D 검토 화면은 추적과 분리한다.
3. **3D 합성·근사 가림** — `ios/MEKIT/BraceletMesh.swift`, `MetalBraceletView.swift`, `BraceletShaders.metal`.
   - [x] 슬림 올리브 코드와 분산 비즈를 갖춘 검증용 고정 모델을 만든다. 고객 조립 UI는 없다.
   - [x] 깊이만 쓰는 손목 마스크를 먼저 렌더링하고 팔찌를 렌더링한다. 길이·위치·크기·기울기 보정을 적용한다.
   - [x] 프레임 만료 시 즉시 숨기고, 마스크는 기하학적 근사임을 화면에 표시한다.
4. **빌드·검증 기록** — `ios/README.md`, `ios/MEKITUITests/PrototypeUITests.swift`, `docs/iphone-validation-2026-10-11.md`.
   - [x] XcodeGen으로 프로젝트를 만들고 unsigned 기기 빌드와 시뮬레이터 UI 테스트를 실행한다.
   - [x] 연결된 실제 iPhone이 있으면 사용자 서명·신뢰 설정 후 설치·카메라 추적 검증한다. 없으면 그 단계는 미검증으로 남긴다.
   - [x] 원본 자료와 실제 기기 검증이 필요한 항목, 재현 명령과 알려진 한계를 기록한다.
