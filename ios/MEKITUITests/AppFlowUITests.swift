import XCTest

final class AppFlowUITests: XCTestCase {
  override func setUpWithError() throws { continueAfterFailure = false }

  func testCollectionOpensEarthDetailAndRemembersLength() {
    let app = XCUIApplication()
    app.launch()
    let screenshot = XCTAttachment(screenshot: app.screenshot())
    screenshot.name = "MEKIT-collection"
    screenshot.lifetime = .keepAlways
    add(screenshot)
    app.buttons["earthDetail"].tap()
    XCTAssertTrue(app.staticTexts["earthProductTitle"].waitForExistence(timeout: 5))
    app.swipeUp()
    app.buttons["studyLength19.5"].tap()
    XCTAssertEqual(app.buttons["studyLength19.5"].value as? String, "선택됨")
    app.terminate()
    app.launch()
    app.buttons["earthDetail"].tap()
    app.swipeUp()
    XCTAssertEqual(app.buttons["studyLength19.5"].value as? String, "선택됨")
    app.buttons["studyLength20.0"].tap()
  }

  func testStudioDoesNotInventProductPhotoAndExplainsCamera() {
    let app = XCUIApplication()
    app.launch()
    app.tabBars.buttons["스튜디오"].tap()
    XCTAssertTrue(app.buttons["importPhoto"].exists)
    XCTAssertTrue(app.staticTexts["studioEmpty"].exists)
    app.buttons["openTracking"].tap()
    app.buttons["startCamera"].tap()
    XCTAssertTrue(app.staticTexts["실제 iPhone의 후면 카메라가 필요해요."].waitForExistence(timeout: 5))
    app.buttons["startCamera"].tap()
    XCTAssertTrue(app.staticTexts["카메라를 일시 정지했어요."].exists)
    app.buttons["closeCamera"].tap()
    XCTAssertTrue(app.staticTexts["studioEmpty"].exists)
  }

  func testLibraryAndPrivacyCanBeOpenedWithoutPermissions() {
    let app = XCUIApplication()
    app.launch()
    app.tabBars.buttons["보관함"].tap()
    XCTAssertTrue(app.staticTexts["libraryEmpty"].exists)
    app.buttons["privacyInfo"].tap()
    XCTAssertTrue(app.staticTexts["privacyTitle"].waitForExistence(timeout: 5))
    XCTAssertTrue(app.staticTexts["카메라 영상은 저장하거나 전송하지 않습니다."].exists)
    let image = XCTAttachment(screenshot: app.screenshot())
    image.name = "MEKIT-privacy"
    image.lifetime = .keepAlways
    add(image)
  }

  func testPhotoAndModelFilePickersCanBeCancelled() {
    let app = XCUIApplication()
    app.launch()
    app.tabBars.buttons["스튜디오"].tap()
    app.buttons["importPhoto"].tap()
    app.buttons["파일에서 선택"].tap()
    cancelFilePicker(app)
    XCTAssertTrue(app.staticTexts["studioEmpty"].exists)
    app.scrollViews["studioScroll"].swipeUp()
    if !app.buttons["importModel"].isHittable { app.scrollViews["studioScroll"].swipeUp() }
    app.buttons["importModel"].tap()
    cancelFilePicker(app)
    app.tabBars.buttons["보관함"].tap()
    XCTAssertTrue(app.staticTexts["libraryEmpty"].exists)
  }

  private func cancelFilePicker(_ app: XCUIApplication) {
    XCTAssertTrue(app.navigationBars["FullDocumentManagerViewControllerNavigationBar"].waitForExistence(timeout: 10))
    let image = XCTAttachment(screenshot: app.screenshot())
    image.name = "MEKIT-file-import"
    image.lifetime = .keepAlways
    add(image)
    let cancel = app.buttons.matching(NSPredicate(format: "label IN %@", ["취소", "Cancel", "닫기"])).firstMatch
    let exists = cancel.waitForExistence(timeout: 5)
    if !exists { print(app.debugDescription) }
    XCTAssertTrue(exists)
    cancel.tap()
    XCTAssertTrue(cancel.waitForNonExistence(timeout: 5))
  }
}
