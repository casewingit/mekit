import UIKit
import XCTest

final class PrototypeUITests: XCTestCase {
  override func setUpWithError() throws { continueAfterFailure = false }

  func testSimulatorCameraExplainsNeedForRealDevice() throws {
    #if !targetEnvironment(simulator)
      throw XCTSkip("실제 기기의 카메라 권한·영상 검증은 별도 수동 시나리오로 수행합니다.")
    #endif
    let app = XCUIApplication()
    app.launch()
    app.buttons["startCamera"].tap()
    XCTAssertTrue(app.staticTexts["실제 iPhone의 후면 카메라가 필요해요."].waitForExistence(timeout: 5))
    XCTAssertFalse(app.staticTexts["손목을 천천히 움직여 보세요."].exists)
    app.buttons["startCamera"].tap()
    XCTAssertTrue(app.staticTexts["카메라를 일시 정지했어요."].waitForExistence(timeout: 5))
  }
  func testModelReviewIsLabeledAndCalibrationResetPreservesLength() throws {
    let app = XCUIApplication()
    app.launch()
    app.buttons["modelPreview"].tap()
    XCTAssertTrue(app.staticTexts["카메라 추적 아님 · 3D 모델 검토"].waitForExistence(timeout: 5))
    XCTAssertFalse(app.staticTexts["손목을 천천히 움직여 보세요."].exists)
    let modelImage = XCTAttachment(screenshot: app.screenshot())
    modelImage.name = "EARTH-unoccluded-model-review"
    modelImage.lifetime = .keepAlways
    add(modelImage)
    XCTAssertEqual(app.staticTexts["lengthReadout"].label, "20.0cm")
    for length in ["19.5", "20.0", "20.5"] {
      app.buttons["studyLength" + length].tap()
      XCTAssertEqual(app.staticTexts["lengthReadout"].label, length + "cm")
      XCTAssertEqual(app.buttons["studyLength" + length].value as? String, "선택됨")
    }
    app.buttons["calibrationPanel"].tap()
    XCTAssertEqual(app.buttons["calibrationPanel"].value as? String, "펼침")
    app.scrollViews.firstMatch.swipeUp()
    XCTAssertTrue(app.sliders["scaleSlider"].isHittable)
    app.sliders["scaleSlider"].adjust(toNormalizedSliderPosition: 0.9)
    XCTAssertNotEqual(app.staticTexts["scaleReadout"].label, "100%")
    app.buttons["resetCalibration"].tap()
    XCTAssertEqual(app.staticTexts["scaleReadout"].label, "100%")
    XCTAssertEqual(app.staticTexts["lengthReadout"].label, "20.5cm")
    XCTAssertFalse(app.staticTexts["rendererFailure"].exists)
    let screenshot = XCTAttachment(screenshot: app.screenshot())
    screenshot.name = "EARTH-model-review-not-camera"
    screenshot.lifetime = .keepAlways
    add(screenshot)
  }

  func testApproximateDepthMaskHidesRearBraceletWithoutHidingAllGeometry() throws {
    let app = XCUIApplication()
    app.launch()
    app.buttons["modelPreview"].tap()
    app.buttons["calibrationPanel"].tap()
    app.scrollViews.firstMatch.swipeUp()
    let toggle = app.switches["occlusionToggle"]
    if toggle.value as? String == "1" { toggle.tap() }
    app.scrollViews.firstMatch.swipeDown()
    app.scrollViews.firstMatch.swipeDown()
    let fullImage = XCTAttachment(screenshot: app.screenshot())
    fullImage.name = "EARTH-mask-off"
    fullImage.lifetime = .keepAlways
    add(fullImage)
    let full = try coloredModelPixels(app)
    XCTAssertGreaterThan(full, 500, "3D 모델이 실제로 렌더링되어야 합니다.")
    app.scrollViews.firstMatch.swipeUp()
    toggle.tap()
    XCTAssertEqual(toggle.value as? String, "1", "가림 스위치가 켜져야 합니다.")
    app.scrollViews.firstMatch.swipeDown()
    app.scrollViews.firstMatch.swipeDown()
    // SwiftUI's switch update and Metal's next drawable are asynchronous.
    let maskRendered = XCTNSPredicateExpectation(
      predicate: NSPredicate { _, _ in
        guard let count = try? self.coloredModelPixels(app) else { return false }
        return Double(count) < Double(full) * 0.85 && Double(count) > Double(full) * 0.20
      }, object: nil)
    XCTAssertEqual(XCTWaiter.wait(for: [maskRendered], timeout: 5), .completed)
    let maskedImage = XCTAttachment(screenshot: app.screenshot())
    maskedImage.name = "EARTH-mask-on"
    maskedImage.lifetime = .keepAlways
    add(maskedImage)
    let masked = try coloredModelPixels(app)
    XCTAssertLessThan(Double(masked), Double(full) * 0.85, "뒤쪽 모델 일부가 가려져야 합니다.")
    XCTAssertGreaterThan(Double(masked), Double(full) * 0.20, "앞쪽 모델은 계속 보여야 합니다.")
    let image = XCTAttachment(screenshot: app.screenshot())
    image.name = "EARTH-approximate-mask-not-real-wrist"
    image.lifetime = .keepAlways
    add(image)
  }

  private func coloredModelPixels(_ app: XCUIApplication) throws -> Int {
    let image = try XCTUnwrap(app.screenshot().image.cgImage)
    let scale = Double(image.width) / app.frame.width
    let surface = app.otherElements["renderSurface"].frame
    let area = surface.insetBy(dx: surface.width * 0.05, dy: surface.height * 0.35)
    let crop = try XCTUnwrap(
      image.cropping(
        to: CGRect(
          x: area.minX * scale, y: area.minY * scale,
          width: area.width * scale, height: area.height * scale)))
    var pixels = [UInt8](repeating: 0, count: crop.width * crop.height * 4)
    return try pixels.withUnsafeMutableBytes { data in
      let context = try XCTUnwrap(
        CGContext(
          data: data.baseAddress, width: crop.width, height: crop.height,
          bitsPerComponent: 8, bytesPerRow: crop.width * 4, space: CGColorSpaceCreateDeviceRGB(),
          bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
            | CGBitmapInfo.byteOrder32Big.rawValue))
      context.draw(crop, in: CGRect(x: 0, y: 0, width: crop.width, height: crop.height))
      let bytes = data.bindMemory(to: UInt8.self)
      return stride(from: 0, to: bytes.count, by: 4).filter {
        bytes[$0] < 150 && bytes[$0 + 1] < 170 && bytes[$0 + 2] < 130
      }.count
    }
  }
}
