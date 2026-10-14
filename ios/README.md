# MEKIT iPhone 앱 · 0.2.0

독립 iPhone 앱의 컬렉션 → EARTH 상세·길이 선택 → 실물 자료 스튜디오 → 보관함 흐름을 구현했습니다. 웹·GitHub Pages는 그대로 유지합니다. 제품 기준은 **001 EARTH / 예정 가격 49,000원(VAT 포함)**입니다.

## 실행·검증

`ios/MEKIT.xcodeproj`를 Xcode에서 열고 `MEKIT` 스킴을 선택하세요. 프로젝트 생성 원본은 `ios/project.yml`입니다.

```sh
xcodegen generate --spec ios/project.yml
swift test --package-path ios/Core
xcodebuild test -project ios/MEKIT.xcodeproj -scheme MEKIT \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro,OS=26.5' \
  -parallel-testing-enabled NO CODE_SIGNING_ALLOWED=NO
xcodebuild build -project ios/MEKIT.xcodeproj -scheme MEKIT \
  -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO
```

최소 버전은 iOS 17, iPhone 세로 화면, 후면 광각 카메라입니다. 실제 기기에 설치하려면 사용자가 Xcode Signing & Capabilities에서 본인 Team을 설정하고 기기 신뢰·개발자 모드를 완료해야 합니다. 번들 ID는 `com.casewingit.mekit.prototype`이며 서명 계정은 비어 있습니다.

## 사용할 수 있는 기능

- 컬렉션·EARTH 상세, 찜과 비교 길이 저장. 19.5 / 20.0 / 20.5cm는 **판매 사이즈 미확정인 비교 후보**이며 기본값은 20.0cm입니다.
- 사진 보관함 또는 파일에서 실물 사진 가져오기. PNG·JPEG·HEIC, 20MiB 제한, 최대 2048px 다운샘플과 EXIF 방향 정규화.
- 기기 내 Vision 배경 분리, 원본과 결과 전환·검토, 실물 사진 확인 후 보관. 실패하면 원본 또는 투명 PNG를 사용할 수 있습니다.
- 후면 카메라·Vision 손 포즈로 손목 위치·방향 안내. 사진은 손목을 따라 이동하는 **2D 배치**입니다.
- 실제 제품에서 만든 USDZ 가져오기, 입체 미리보기·대조 후 보관. 40MiB / 30만 정점 / 2048 노드 제한. 제품 고리 X–Z 평면, 팔 방향 Y 축 모델을 사용합니다. 2.5D 사진 메시·평면 사진은 실물 3D 자산으로 등록하지 마세요.
- 가져온 3D 모델을 SceneKit으로 카메라 위에 표시. 2D 손목 포즈, 위치·크기·각도 보정과 초기화, 선택 가능한 원통형 손목 뒤 가림 근사.
- 추적 손실·250ms 만료·두 손·권한 거절·카메라 중단·앱 이탈 처리. 정지·앱 이탈 시 표시와 포즈를 지웁니다.
- 원본·표시용 사진 및 모델의 앱 내 로컬 저장·복원·삭제. 개인정보·미리보기 안내와 앱 아이콘, UserDefaults 개인정보 매니페스트.

카메라는 자동으로 시작하지 않습니다. 스튜디오에서 카메라 화면을 연 뒤 시작 버튼을 누르세요. 시뮬레이터에서는 실제 iPhone 카메라가 필요하다는 안내를 표시합니다.

## 실제 제품과 참고 자료

**EARTH 실물 샘플·제품 사진·실물과 대조한 정확한 3D 모델이 아직 없습니다.** EARTH 상세에는 제품 사진과 착용 모델을 표시하지 않습니다. 크롬하츠 등 외부 제품 사진, 이전 절차적 메시, 사진 렌더링 스크립트의 추정 GLB는 앱 상품 자산에 포함하지 않았습니다.

사용자가 가져온 사진·USDZ는 별도의 스튜디오 참고 자료입니다. 사용자 확인을 받지만 앱이 실제 제품 진위를 검증하지는 않습니다. 가져온 자료를 EARTH 자산으로 자동 연결하지 않습니다. USDZ 로딩은 파일·입체 형상의 기술적 유효성을 확인하며 실물과의 일치까지 인증하지 않습니다.

사진은 뒷면·손목 뒤 가림을 표현하지 않습니다. 3D 모드의 가림은 손목 깊이를 측정한 결과가 아니라 원통형 근사입니다. 손 랜드마크는 2D이므로 둘레·정확한 3D 손목 형태·조임·촉감·핏을 보장하지 않습니다. 비교 길이 선택은 사진·모델의 시각 크기를 바꾸지 않습니다.

## 개인정보

카메라 프레임은 저장·전송하지 않습니다. 선택한 실물 자료만 앱 저장 공간에 보관합니다. 네트워크 업로드·계정·분석 SDK·마이크 접근은 없습니다. 가져온 사진과 USDZ 파일에는 파일 보호를 적용합니다. 기기 백업에는 포함될 수 있으며 보관함에서 삭제할 수 있습니다. 사진 선택에는 시스템 PhotosPicker를 사용하므로 사진 보관함 전체 권한을 요구하지 않습니다.

UserDefaults는 앱 내부의 길이·찜 상태만 저장합니다. 사용 이유 `CA92.1`을 `PrivacyInfo.xcprivacy`에 선언했습니다. [Apple 개인정보 매니페스트 안내](https://developer.apple.com/documentation/technotes/tn3183-adding-required-reason-api-entries-to-your-privacy-manifest).

## 코드

- `MEKITApp`, `CollectionView`, `LibraryView`, `DesignSystem`: 탐색·제품 상세·보관함·일관된 화면 구성.
- `PhotoStudioView`, `ReferenceFilePicker`, `PhotoProcessor`, `ProductPhotoStore`: 선택·배경 분리·검토·저장과 오류 처리. 파일은 UIKit의 시스템 문서 선택기를 정상 모달로 연다.
- `ProductModelAsset`, `WristModelView`: USDZ 유효성·정규화·보관, SceneKit 표시·깊이 가림 근사.
- `CameraController`, `PrototypeModel`, `TryOnView`: 카메라 생명주기·손 추적·배치·보정.
- `Core`: 좌표·추적·보정·사진 배치·비교 길이 규칙.
- 기존 `BraceletMesh` / Metal 파일은 과거 실험 코드로 보존하며 현재 UI에서 호출하지 않습니다.

## 검증·출시 상태

현재 기록은 [네이티브 앱 검증](../docs/iphone-validation-2026-10-14.md)에 구분합니다. 단위 테스트의 임시 박스 USDZ는 테스트 안에서 생성·삭제하는 기술적 입력이며 앱 제품 모델로 표시하지 않습니다.

연결된 실제 iPhone이 없어 카메라·착용·가림 품질은 실기기 미검증입니다. 시뮬레이터 UI와 좌표 테스트를 실제 착용 시험으로 표현하지 않습니다. 실제 EARTH 자산, 실기기 검증, Apple Developer 서명·App Store Connect 설정·TestFlight 배포는 남아 있습니다. 초기 범위대로 주문·결제·계정·Android는 구현하지 않습니다.
