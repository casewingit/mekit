#!/usr/bin/env bash
set -euo pipefail
mekit_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$mekit_root"
command -v xcodegen >/dev/null || { echo 'XcodeGen이 필요합니다: brew install xcodegen'; exit 1; }
mekit_simulator="${MEKIT_SIMULATOR_NAME:-iPhone 17 Pro}"
mekit_simulator_os="${MEKIT_SIMULATOR_OS:-26.5}"
mekit_results="$(mktemp -d "${TMPDIR:-/tmp}/mekit-ios.XXXXXX")"
xcodegen generate --spec ios/project.yml
swift test --package-path ios/Core
xcodebuild test -project ios/MEKIT.xcodeproj -scheme MEKIT \
  -destination "platform=iOS Simulator,name=$mekit_simulator,OS=$mekit_simulator_os" \
  -parallel-testing-enabled NO -resultBundlePath "$mekit_results/tests.xcresult" \
  CODE_SIGNING_ALLOWED=NO
xcodebuild build -project ios/MEKIT.xcodeproj -scheme MEKIT \
  -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO
echo "검증 결과: $mekit_results/tests.xcresult"
echo '실기기 카메라·착용 검증 및 Apple 서명·배포는 별도로 필요합니다.'
