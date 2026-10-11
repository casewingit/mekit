# MEKIT iPhone 기술 프로토타입

MEKIT의 출시 플랫폼은 독립 iPhone 앱으로 확정했습니다. 현재는 실물 기반 EARTH 모델 확보 전의 카메라·손목 추적 검증 단계입니다. [이슈 #2 반영과 출시 방향](../docs/iphone-release-direction-2026-10-11.md)을 참고하세요. 웹과 GitHub Pages는 기존 상태로 유지합니다. 제품 기준은 **001 EARTH · 49,000원 · 완성 디자인과 길이 선택**입니다.

## 시작

`MEKIT.xcodeproj`를 Xcode에서 열고 MEKIT 스킴을 선택하세요. 생성 원본은 `project.yml`이며 XcodeGen으로 다시 만들 수 있습니다.

```sh
xcodegen generate --spec ios/project.yml
swift test --package-path ios/Core
xcodebuild build -project ios/MEKIT.xcodeproj -scheme MEKIT \
  -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO
```

Metal 도구가 없다면 `xcodebuild -downloadComponent MetalToolchain`을 실행합니다. 실제 기기에는 서명이 필요합니다. 연결된 iPhone을 잠금 해제하고 신뢰·개발자 모드를 사용자가 설정한 뒤, Xcode의 Signing & Capabilities에서 본인 Team을 선택하고 실행하세요. 번들 ID 기본값은 `com.casewingit.mekit.prototype`입니다.

최소 배포 버전은 iOS 17, 화면은 세로, 카메라는 후면 광각입니다. 지원 기기를 실제로 검증했다는 의미는 아닙니다. 현재 결과는 [검증 기록](../docs/iphone-validation-2026-10-11.md)에 구분합니다.

## 실물 제품 기준과 현재 화면

최신 사용자 요청에 따라 **실제 제품에 근거한 자산만 제품 화면에 표시합니다.** [실물 제품 기준](../docs/real-product-policy-2026-10-11.md)을 참고하세요. 실물 샘플의 사진·치수·배열과 대조한 EARTH 모델은 아직 확보하지 못했으므로, 앱에서 임시 팔찌 합성과 정적 모델 검토를 제외했습니다. 지금은 “실물 기반 착용 모델이 필요해요”를 안내하며 카메라·손목 위치 확인을 제공합니다. 실물 기반 3D 자산을 확보한 뒤 제품 착용 표시·보정·가림을 다시 연결해야 합니다.

- `Core`: 좌표 변환·2D 손목 포즈 근사·추적 평활화·250ms 만료·보정 계산·미확정 길이 비교 규칙.
- `CameraController`: AVFoundation 후면 카메라, 90도 회전된 픽셀, Vision 단일 손 포즈, 약 15Hz 분석, 프레임 폐기.
- `PrototypeModel`: 권한·카메라 중단·앱 비활성화·재개 상태. 이전 실행의 비동기 응답은 버립니다.
- `TryOnView`: 실물 모델 미확보 안내, 촬영 가이드, 손목 위치 표시, 미확정 길이 비교. 제품용 3D 렌더러는 호출하지 않습니다.
- `MetalBraceletView` / `BraceletMesh` / `BraceletShaders`: 이전 기술 검증 코드를 보존합니다. 절차적 메시와 타원형 가림 마스크는 실물 제품 자산이 아니며 현재 화면에서 사용하지 않습니다.

카메라와 분석 영상은 저장·전송하지 않으며 마이크 권한도 사용하지 않습니다. 쇼핑·결제·계정은 없습니다.

## 현재 확인할 순서

1. 카메라로 손목 위치 확인 버튼을 누르고 권한을 허용합니다. 거절 시 안내와 설정 이동을 확인합니다.
2. 반대편 손의 손가락과 손목이 모두 보이도록 비춥니다. 손목 위치·방향의 안내선만 표시하며 팔찌는 표시하지 않습니다.
3. 손목 이동·회전, 두 손·일부 가림·추적 손실과 복구를 실제 기기에서 확인합니다.
4. 앱 전환·화면 잠금·카메라 사용 중단 후 위치 표시가 숨겨지고 복귀 시 새 프레임부터 재개되는지 확인합니다.
5. 19.5·20.0·20.5cm 비교 후보를 선택합니다. 기본은 20.0cm이며 실제 판매 사이즈나 착용감을 확정하는 동작이 아닙니다.

시뮬레이터는 실제 카메라 추적을 제공하지 않습니다. 현재 실기기 검증은 하지 않았습니다. 이전 정적 모델·GPU 화면은 렌더러 실험의 과거 기록이며 실제 제품이나 현재 화면의 증거가 아닙니다.

## 제품 자산을 확보한 뒤

이슈 #2 원문과 MATERIAL WRAP 보드는 [참고 폴더](../docs/references/github-issue-2-2026-10-11.md)에 있습니다. 모두 실물 촬영 자료나 실제 3D 제품 모델로 간주하지 않습니다. 실물 사진·측정값과 맞춘 모델 및 실제 텍스처를 확보하고 대조한 버전을 제품 화면에 연결합니다.

Vision의 손 랜드마크는 2D입니다. 실제 손목 둘레·3D 형태를 복원하지 않습니다. 실물 기반 자산을 쓰더라도 카메라 합성이 실제 조임·촉감·정확한 핏을 보장하지 않습니다. 가림·부착·질감은 실기기 영상으로 검증합니다.

## UI 자동 검증

```sh
xcodebuild test -project ios/MEKIT.xcodeproj -scheme MEKIT \
  -destination 'platform=iOS Simulator,name=iPhone 18 Pro' \
  CODE_SIGNING_ALLOWED=NO
```

이는 시뮬레이터의 실물 모델 미확보 안내·임시 모델 미노출·카메라 제어·길이 비교 UI 검증입니다. 실제 카메라·손 추적·자연스러운 착용·가림 정확도 시험을 대신하지 않습니다.
