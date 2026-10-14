import UIKit
import XCTest
@testable import MEKIT

final class ProductPhotoTests: XCTestCase {
  func testBadImageAndOversizedDataAreRejected() {
    XCTAssertThrowsError(try PhotoProcessor.decode(Data("not an image".utf8)))
    XCTAssertThrowsError(try PhotoProcessor.decode(Data(count: 20 * 1024 * 1024 + 1)))
  }
  func testImportDownsamplesAndNormalizesPhoto() throws {
    let data = try XCTUnwrap(image(size: CGSize(width: 3000, height: 1500)).pngData())
    let value = try PhotoProcessor.decode(data)
    XCTAssertEqual(value.imageOrientation, .up)
    XCTAssertEqual(value.size.width, 2048)
    XCTAssertEqual(value.size.height, 1024)
  }
  func testTransparentPhotoIsCroppedWithoutReplacingPixels() throws {
    let renderer = UIGraphicsImageRenderer(size: CGSize(width: 200, height: 100))
    let original = renderer.image { context in
      UIColor.red.setFill()
      context.fill(CGRect(x: 40, y: 20, width: 120, height: 60))
    }
    let result = try PhotoProcessor.cropTransparency(original)
    XCTAssertEqual(result.size, CGSize(width: 120, height: 60))
  }
  @MainActor func testSavedPhotoRestoresAndDeleteKeepsOtherFiles() async throws {
    let root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
    defer { try? FileManager.default.removeItem(at: root) }
    let store = ProductPhotoStore(directory: root)
    let original = image(size: CGSize(width: 80, height: 40))
    try store.save(original: original, display: original, backgroundRemoved: false)
    let restored = ProductPhotoStore(directory: root)
    XCTAssertEqual(restored.photo?.size, CGSize(width: 80, height: 40))
    XCTAssertNotNil(restored.original)
    XCTAssertFalse(restored.backgroundRemoved)
    let unrelated = root.appendingPathComponent("keep.txt")
    try Data("keep".utf8).write(to: unrelated)
    try restored.remove()
    XCTAssertNil(restored.photo)
    XCTAssertNil(ProductPhotoStore(directory: root).photo)
    XCTAssertTrue(FileManager.default.fileExists(atPath: unrelated.path))
  }
  @MainActor func testCorruptRecordCannotEscapeStorageDirectory() async throws {
    let root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
    defer { try? FileManager.default.removeItem(at: root) }
    try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
    try Data("{\"id\":\"../outside\",\"date\":0,\"backgroundRemoved\":true}".utf8)
      .write(to: root.appendingPathComponent("current.json"))
    let store = ProductPhotoStore(directory: root)
    XCTAssertNil(store.photo)
    XCTAssertNotNil(store.error)
  }
  private func image(size: CGSize) -> UIImage {
    UIGraphicsImageRenderer(size: size, format: {
      let format = UIGraphicsImageRendererFormat()
      format.scale = 1
      return format
    }()).image { context in
      UIColor(red: 0.3, green: 0.4, blue: 0.5, alpha: 1).setFill()
      context.fill(CGRect(origin: .zero, size: size))
    }
  }
}
