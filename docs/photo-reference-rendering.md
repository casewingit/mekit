# 사진 참고 렌더링 재실행

최신 사용자 요청에 따라 [Chrome Hearts Fancy Link Bracelet](https://justinreed.com/products/chrome-hearts-fancy-link-bracelet-1415)의 Justin Reed 판매 사진을 기본 입력으로 사용합니다. 묵직한 실버 링크와 크로스 디테일을 참고합니다. 사진은 실제 제품의 판매처 자료이며 **MEKIT EARTH 사진이 아닙니다.** 실제 촬영 방식이나 수정 이력을 독립 검증한 것은 아닙니다.

## 한 번의 명령으로 다시 만들기

프로젝트 루트에서 실행합니다.

```sh
npm run render:reference
```

첫 실행에 입력이 없으면 프로필에 기록한 HTTPS 원본 URL에서 다운로드하고 SHA-256을 확인합니다. 이후에는 저장한 사진을 사용하므로 재검색·재다운로드·AI 이미지 API 호출이 없습니다. 원본이 바뀌면 해시 불일치로 중지합니다.

이 Mac에서는 Codex가 제공한 Python/Pillow/NumPy 런타임을 자동 선택했습니다. 다른 Mac에서는 Python 3.11 이상을 준비하고 다음 설치를 한 번 수행합니다.

```sh
python3 -m venv .venv-reference
.venv-reference/bin/python3 -m pip install -r scripts/requirements-render.txt
npm run render:reference
```

별도 Python은 `MEKIT_RENDER_PYTHON=/절대/경로/python3 npm run render:reference`로 지정할 수 있습니다. Blender·GPU·유료 API는 필요하지 않습니다.

## 출력

`output/reference-render/chrome-hearts-fancy-link/`에 생성합니다. 같은 입력과 옵션의 재실행은 해당 출력 파일을 갱신합니다. 다른 실행을 보존하려면 `--out`을 지정합니다.

| 파일            | 내용                                              |
| --------------- | ------------------------------------------------- |
| `front.png`     | 정면 텍스처 렌더                                  |
| `angled.png`    | 사선 텍스처 렌더                                  |
| `texture.png`   | 배경 윤곽을 제거한 원본 픽셀 텍스처               |
| `reference.glb` | 텍스처를 내장한 glTF 2.0 참고 메시                |
| `review.html`   | 사진·두 렌더·각도 조절·출처를 담은 독립 검토 화면 |
| `manifest.json` | 입력 해시·출처·추정 깊이·처리 설정·정점 수        |

`review.html`은 파일 자체로 열 수 있습니다. 외부 JavaScript나 이미지 서버가 필요하지 않습니다. WebGL2가 없으면 아래 PNG를 확인할 수 있습니다. 대화형 각도는 ±40도로 제한하여 없는 뒷면을 제품처럼 보여 주지 않습니다.

새 사진으로 실행하려면 출처를 함께 지정합니다. 직접 지정한 사진에는 기본 제품의 배경 RGB를 적용하지 않고 기존 색 추출을 사용합니다.

```sh
npm run render:reference -- \
  --input /절대/경로/팔찌사진.jpg \
  --source-page '사진의 원본 URL 또는 직접 촬영한 샘플 설명' \
  --out output/reference-render/my-reference
```

현재 크롬하츠 프로필은 원본의 모서리에서 측정한 배경 RGB `[242,241,237]`과의 차이를 기준으로 추출하므로 밝은 실버도 보존합니다. `assets/render-references/chrome-hearts-fancy-link.json`의 `renderSettings`에 색 차이·윤곽 정리·검토 배경색을 저장했습니다. 프로필을 바꾸면 설정과 기본 출력 폴더도 함께 바뀝니다. 다른 사진은 원본 배경과 제품의 색 차이에 맞춘 별도 프로필을 사용하세요. 색이 비슷한 배경이나 얇은 코드는 자동 추출이 부정확할 수 있습니다. `--min-saturation`, `--max-dark`, `--min-component-area`, `--max-hole-area`, `--clean-radius`로 조절합니다. 얇은 코드를 보존할 때는 `--clean-radius 0`으로 확인합니다. 완성 이미지의 윤곽을 직접 확인하세요.

```sh
npm run render:reference -- --grid 384 --relief 0.04 --out output/reference-render/detail
npm run test:render-reference
```

## 렌더링의 의미와 제품 연결

사진에서 윤곽과 원본 색을 가져와 높이 필드 형태의 **2.5D 참고 메시**를 만듭니다. 원본 조명을 포함한 픽셀을 사용하며 새로운 재질·사진을 AI로 생성하지 않습니다. 깊이는 윤곽으로 추정한 값이고, 뒷면·전체 3D 구조·실제 크기·잠금 구조를 복원하지 않습니다. GLB의 80mm 기준 폭도 표시용 설정이며 실측값이 아닙니다.

GLB와 메타데이터에는 `verifiedEarthProduct: false`, `physicalScaleVerified: false`, `geometryKind: photo-relief-2.5d`를 기록합니다. 이 결과를 실물 EARTH 자산으로 승인하거나 iPhone 판매·착용 화면에 연결하지 않습니다. 외부 실물 사진으로 렌더링 개발을 반복하라는 최신 요청을 반영한 별도 기술 실험입니다.

원본 JPG와 결과는 로컬 참고 자료입니다. 공개 재배포 라이선스는 확인하지 않았으므로 Git/웹 배포 대상에서 제외했고, 출처 프로필과 재실행 코드만 보존합니다. 실제 제품 사진 확보 후에는 직접 촬영한 자료로 입력을 바꿉니다.

## 검증

- 배경·투명 픽셀 제거, 작은 하이라이트 구멍 보정과 손목 구멍 보존, 작은 배경 조각과 붙은 천 가장자리 제거, 메시가 손목 구멍을 덮지 않는지, GLB 텍스처·출처·미검증 상태를 테스트합니다.
- 실제 사진으로 정면·사선 PNG, GLB, 독립 HTML을 생성하고 시각적으로 확인합니다.
- 같은 입력과 옵션을 다른 출력 폴더에 재실행해 여섯 산출물의 SHA-256이 모두 같은지 확인합니다.
- [Khronos glTF 2.0](https://github.com/KhronosGroup/glTF/blob/main/specification/2.0/Specification.adoc) 형식을 사용하며 공식 `gltf-validator`로 GLB를 점검합니다. PNG 텍스처가 2의 거듭제곱 크기가 아니라는 정보 항목은 있을 수 있습니다.

웹·iPhone 소스와 실기기 검증 상태는 이번 도구 추가로 바뀌지 않습니다.

이전 Sitti 실험 결과: 정점 19,469개·삼각형 36,876개. 당시 자동 테스트 6개 통과, GLB 검증 오류 0·경고 0(2의 거듭제곱이 아닌 텍스처 크기 정보 1개), 재실행 산출물 6개 해시 동일, 브라우저 WebGL 표시·좌우/상하 각도·정면 초기화 동작을 확인했습니다. 입력이 없는 첫 실행의 자동 다운로드·해시 확인도 실행했습니다.

최신 기본 레퍼런스는 Chrome Hearts Fancy Link입니다. 이는 렌더링 참고 사진의 변경이며, MEKIT의 실제 제품 사양·브랜드명·가격을 크롬하츠 제품으로 바꾼 것이 아닙니다.

크롬하츠 입력 실행 결과: 정점 51,782개·삼각형 99,058개. 실버 보존 회귀 테스트를 포함한 자동 테스트 7개가 통과했고 GLB 검증 오류·경고는 0개입니다. 금속 하이라이트를 보존하도록 원본 배경과의 색 차이 허용값을 3으로 맞췄습니다.
