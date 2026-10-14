import XCTest

final class PrototypeUITests: XCTestCase {
  override func setUpWithError() throws { continueAfterFailure = false }

  func testUnverifiedModelCannotAppearAsEarthProduct() throws {
    let app = XCUIApplication()
    app.launch()
    app.buttons["earthDetail"].tap()
    app.swipeUp()
    XCTAssertFalse(
      app.buttons["modelPreview"].exists,
      "임시 형상을 EARTH 제품 미리보기로 제공하면 안 됩니다.")
    XCTAssertTrue(app.staticTexts["physicalAssetUnavailable"].exists)
    XCTAssertFalse(app.staticTexts["내 손목 위의 EARTH"].exists)
    app.buttons["openTracking"].tap()
    app.buttons["startCamera"].tap()
    XCTAssertTrue(app.staticTexts["physicalAssetUnavailable"].exists)
    XCTAssertFalse(app.buttons["modelPreview"].exists)
    let image = XCTAttachment(screenshot: app.screenshot())
    image.name = "MEKIT-real-product-asset-required"
    image.lifetime = .keepAlways
    add(image)
  }

  func testSimulatorCameraExplainsNeedForRealDevice() throws {
    #if !targetEnvironment(simulator)
      throw XCTSkip("실제 기기의 카메라 권한·영상 검증은 별도 수동 시나리오로 수행합니다.")
    #endif
    let app = XCUIApplication()
    app.launch()
    app.tabBars.buttons["스튜디오"].tap()
    app.buttons["openTracking"].tap()
    app.buttons["startCamera"].tap()
    XCTAssertTrue(app.staticTexts["실제 iPhone의 후면 카메라가 필요해요."].waitForExistence(timeout: 5))
    XCTAssertFalse(app.staticTexts["손목을 천천히 움직여 보세요."].exists)
    app.buttons["startCamera"].tap()
    XCTAssertTrue(app.staticTexts["카메라를 일시 정지했어요."].waitForExistence(timeout: 5))
  }

  func testStudyLengthsRemainUnconfirmedWithoutProductModel() throws {
    let app = XCUIApplication()
    app.launch()
    app.buttons["earthDetail"].tap()
    app.scrollViews.firstMatch.swipeUp()
    for length in ["19.5", "20.0", "20.5"] {
      app.buttons["studyLength" + length].tap()
      XCTAssertEqual(app.staticTexts["lengthReadout"].label, length + "cm")
      XCTAssertEqual(app.buttons["studyLength" + length].value as? String, "선택됨")
    }
    XCTAssertTrue(app.staticTexts["18cm 손목 기준의 비교 후보예요. 판매 사이즈는 미확정이며, 실물 착용 검증 후 확정합니다."].exists)
    XCTAssertFalse(app.buttons["modelPreview"].exists)
  }
}
