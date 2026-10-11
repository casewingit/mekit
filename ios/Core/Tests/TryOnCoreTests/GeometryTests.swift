import XCTest

@testable import TryOnCore

final class GeometryTests: XCTestCase {
  func testPortraitAspectFillCropsHorizontallyAndFlipsVisionY() throws {
    let result = try XCTUnwrap(
      CameraMapping.point(Point2(0.25, 0.75), image: Size2(720, 1280), viewport: Size2(390, 844)))
    XCTAssertEqual(result.x, 76.3125, accuracy: 0.0001)
    XCTAssertEqual(result.y, 211, accuracy: 0.0001)
  }
  func testLandscapeBufferIsNotSilentlyTreatedAsPortrait() throws {
    let result = try XCTUnwrap(
      CameraMapping.point(Point2(0.5, 1), image: Size2(1280, 720), viewport: Size2(390, 844)))
    XCTAssertEqual(result.x, 195, accuracy: 0.001)
    XCTAssertEqual(result.y, 0, accuracy: 0.001)
  }
  func testInvalidDimensionsDoNotProduceVisiblePose() {
    XCTAssertNil(
      CameraMapping.point(Point2(0.5, 0.5), image: Size2(0, 1280), viewport: Size2(390, 844)))
    XCTAssertNil(
      CameraMapping.point(Point2(.nan, 0), image: Size2(720, 1280), viewport: Size2(390, 844)))
  }
  func testScreenPosePreservesCrossWristAngle() throws {
    let pose = try XCTUnwrap(
      CameraMapping.pose(
        WristObservation(center: Point2(0.5, 0.5), left: Point2(0.4, 0.4), right: Point2(0.6, 0.6)),
        image: Size2(100, 100), viewport: Size2(200, 200)))
    XCTAssertEqual(pose.center, Point2(100, 100))
    XCTAssertEqual(pose.width, 56.56854249, accuracy: 0.001)
    XCTAssertEqual(pose.angle, -.pi / 4, accuracy: 0.001)
  }
  func testBraceletCenterIsOnForearmSideOfWrist() throws {
    let observation = try XCTUnwrap(WristEstimator.estimate(hand(), image: Size2(720, 1280)))
    XCTAssertEqual(observation.center.x, 0.5, accuracy: 0.001)
    XCTAssertEqual(observation.center.y, 0.4, accuracy: 0.001)
  }
  func testLowConfidenceOrCollapsedHandDoesNotAnchorBracelet() {
    var value = hand()
    value.wrist.confidence = 0.2
    XCTAssertNil(WristEstimator.estimate(value, image: Size2(720, 1280)))
    value = hand()
    value.middle.point = value.wrist.point
    XCTAssertNil(WristEstimator.estimate(value, image: Size2(720, 1280)))
  }
  func testLostTrackingAndBackgroundResetRemoveOldBracelet() throws {
    var filter = PoseFilter()
    XCTAssertNotNil(filter.update(pose(), at: 1))
    XCTAssertNil(filter.update(nil, at: 1.1))
    XCTAssertNil(filter.current(at: 1.11))
    XCTAssertNotNil(filter.update(pose(), at: 2))
    filter.reset()
    XCTAssertNil(filter.current(at: 2.01))
  }
  func testCameraStallExpiresEvenWithoutAnotherFrame() {
    var filter = PoseFilter()
    XCTAssertNotNil(filter.update(pose(), at: 1))
    XCTAssertNotNil(filter.current(at: 1.24))
    XCTAssertNil(filter.current(at: 1.26))
  }
  func testAngleSmoothingDoesNotSpinWhenCrossingPi() throws {
    var filter = PoseFilter()
    _ = filter.update(pose(angle: 3.13), at: 1)
    let value = try XCTUnwrap(filter.update(pose(angle: -3.13), at: 1.04))
    XCTAssertGreaterThan(abs(value.angle), 3)
  }
  func testOldFramesCannotReplaceNewerPose() throws {
    var filter = PoseFilter()
    _ = filter.update(pose(), at: 2)
    let result = try XCTUnwrap(
      filter.update(ScreenPose(center: Point2(999, 999), width: 40, angle: 0), at: 1))
    XCTAssertEqual(result.center, Point2(100, 200))
  }
  func testCalibrationClampsAndResetsWithoutChangingLength() {
    var value = Calibration()
    value.set(scale: 9, x: -3, y: 3, tilt: 90)
    XCTAssertEqual(value.scale, 1.4)
    XCTAssertEqual(value.x, -0.75)
    XCTAssertEqual(value.y, 0.75)
    XCTAssertEqual(value.tilt, 35)
    value.reset()
    XCTAssertEqual(value, Calibration())
  }
  func testNonFiniteCalibrationCannotBreakRenderer() {
    var value = Calibration()
    value.set(scale: .nan, x: .infinity, y: .nan, tilt: -.infinity)
    XCTAssertEqual(value, Calibration())
  }
  func testLengthSelectionRequiresSupportedHalfCentimeterSteps() {
    XCTAssertTrue(LengthSelection.accepts(15))
    XCTAssertTrue(LengthSelection.accepts(17.5))
    XCTAssertTrue(LengthSelection.accepts(21))
    for value in [14.5, 21.5, 17.25, Double.nan, Double.infinity] {
      XCTAssertFalse(LengthSelection.accepts(value))
    }
  }
  private func hand() -> HandLandmarks {
    HandLandmarks(
      wrist: JointPoint(Point2(0.5, 0.45)), index: JointPoint(Point2(0.4, 0.7)),
      middle: JointPoint(Point2(0.5, 0.7)), little: JointPoint(Point2(0.6, 0.7)))
  }
  private func pose(angle: Double = 0) -> ScreenPose {
    ScreenPose(center: Point2(100, 200), width: 100, angle: angle)
  }
}
