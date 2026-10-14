import XCTest
@testable import TryOnCore

final class PhotoPlacementTests: XCTestCase {
  func testPhotoFollowsWristAndRotatesOffsetsWithIt() throws {
    var calibration = Calibration()
    calibration.set(scale: 1.2, x: 0.25, y: -0.5, tilt: 10)
    let placement = try XCTUnwrap(PhotoPlacement.make(
      pose: ScreenPose(center: Point2(100, 200), width: 80, angle: .pi / 2),
      calibration: calibration, aspectRatio: 2))
    XCTAssertEqual(placement.center.x, 140, accuracy: 0.001)
    XCTAssertEqual(placement.center.y, 220, accuracy: 0.001)
    XCTAssertEqual(placement.width, 96, accuracy: 0.001)
    XCTAssertEqual(placement.height, 48, accuracy: 0.001)
    XCTAssertEqual(placement.angle, .pi / 2 + .pi / 18, accuracy: 0.001)
  }
  func testMissingOrInvalidTrackingCannotShowPhoto() {
    XCTAssertNil(PhotoPlacement.make(pose: nil, calibration: Calibration(), aspectRatio: 2))
    for width in [0, -1, Double.nan, Double.infinity] {
      XCTAssertNil(PhotoPlacement.make(pose: ScreenPose(center: Point2(20, 20), width: width, angle: 0), calibration: Calibration(), aspectRatio: 2))
    }
    XCTAssertNil(PhotoPlacement.make(pose: ScreenPose(center: Point2(20, 20), width: 80, angle: 0), calibration: Calibration(), aspectRatio: 0))
  }
  func testCorruptPreferencesRestoreDefaultLength() {
    for length in [20.25, 0, Double.nan, Double.infinity] {
      XCTAssertEqual(LengthSelection.restored(length), 20)
    }
    XCTAssertEqual(LengthSelection.restored(19.5), 19.5)
  }
}
