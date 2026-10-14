import SceneKit
import Metal
import XCTest
import TryOnCore
@testable import MEKIT

final class ProductModelTests: XCTestCase {
  @MainActor func testRendererShowsFrontAndOccludesRearGeometry() async throws {
    guard let device = MTLCreateSystemDefaultDevice() else { throw XCTSkip("Metal 기기가 없습니다.") }
    let root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
    defer { try? FileManager.default.removeItem(at: root) }
    try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
    let source = root.appendingPathComponent("depth-fixture.usdz")
    let scene = SCNScene()
    for (x, z, color) in [(-0.2, 0.4, UIColor.red), (0.2, -0.4, UIColor.blue)] {
      let node = SCNNode(geometry: SCNBox(width: 0.2, height: 0.2, length: 0.1, chamferRadius: 0))
      node.position = SCNVector3(x, 0, z)
      node.geometry?.firstMaterial?.diffuse.contents = color
      scene.rootNode.addChildNode(node)
    }
    XCTAssertTrue(scene.write(to: source, options: nil, delegate: nil, progressHandler: nil))
    let asset = try ProductModelAsset(id: UUID(), url: source)
    let coordinator = WristModelView.Coordinator(asset: asset)
    let renderer = SCNRenderer(device: device, options: nil)
    renderer.scene = coordinator.scene
    renderer.pointOfView = coordinator.camera
    renderer.autoenablesDefaultLighting = true
    let pose = ScreenPose(center: Point2(100, 100), width: 100, angle: 0)
    coordinator.update(pose: pose, calibration: Calibration(), viewport: CGSize(width: 200, height: 200), occlusion: false)
    let visible = renderer.snapshot(atTime: 0, with: CGSize(width: 200, height: 200), antialiasingMode: .none)
    let blue = pixel(visible, x: 133, y: 100)
    XCTAssertGreaterThan(blue[2], blue[0] + 40)
    coordinator.update(pose: pose, calibration: Calibration(), viewport: CGSize(width: 200, height: 200), occlusion: true)
    let masked = renderer.snapshot(atTime: 0, with: CGSize(width: 200, height: 200), antialiasingMode: .none)
    let front = pixel(masked, x: 67, y: 100)
    let rear = pixel(masked, x: 133, y: 100)
    XCTAssertGreaterThan(front[0], front[2] + 40)
    XCTAssertLessThan(rear[2], blue[2] - 40)
    coordinator.update(pose: nil, calibration: Calibration(), viewport: CGSize(width: 200, height: 200), occlusion: true)
    XCTAssertTrue(coordinator.anchor.isHidden)
  }

  private func pixel(_ image: UIImage, x: Int, y: Int) -> [Int] {
    guard let cg = image.cgImage else { return [0, 0, 0, 0] }
    var pixels = [UInt8](repeating: 0, count: cg.width * cg.height * 4)
    pixels.withUnsafeMutableBytes { bytes in
      let context = CGContext(data: bytes.baseAddress, width: cg.width, height: cg.height,
        bitsPerComponent: 8, bytesPerRow: cg.width * 4, space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue | CGBitmapInfo.byteOrder32Big.rawValue)
      context?.draw(cg, in: CGRect(x: 0, y: 0, width: cg.width, height: cg.height))
    }
    let offset = (y * cg.width + x) * 4
    return pixels[offset..<(offset + 4)].map(Int.init)
  }
  func testEmptyModelCannotBeDisplayed() {
    XCTAssertThrowsError(try ProductModelAsset.normalize(SCNNode()))
  }
  func testModelIsCenteredAndNormalizedWithoutChangingSource() throws {
    let source = SCNNode()
    let geometry = SCNNode(geometry: SCNBox(width: 8, height: 2, length: 6, chamferRadius: 0))
    geometry.position = SCNVector3(10, -5, 3)
    source.addChildNode(geometry)
    let normalized = try ProductModelAsset.normalize(source)
    // Bounds of the normalized node converted to its parent's coordinates.
    let bounds = normalized.boundingBox
    let left = normalized.convertPosition(bounds.min, to: nil)
    let right = normalized.convertPosition(bounds.max, to: nil)
    XCTAssertEqual(right.x - left.x, 1, accuracy: 0.0001)
    XCTAssertEqual((right.x + left.x) / 2, 0, accuracy: 0.0001)
    XCTAssertEqual((right.y + left.y) / 2, 0, accuracy: 0.0001)
    XCTAssertEqual(geometry.position.x, 10)
  }
  func testFlatModelCannotPretendToBeThreeDimensional() {
    let source = SCNNode(geometry: SCNPlane(width: 1, height: 1))
    XCTAssertThrowsError(try ProductModelAsset.normalize(source))
  }
  @MainActor func testUSDZImportPersistsAndCancelKeepsSavedModel() async throws {
    let root = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
    defer { try? FileManager.default.removeItem(at: root) }
    try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
    let source = root.appendingPathComponent("fixture.usdz")
    let scene = SCNScene()
    scene.rootNode.addChildNode(SCNNode(geometry: SCNBox(width: 2, height: 1, length: 2, chamferRadius: 0)))
    XCTAssertTrue(scene.write(to: source, options: nil, delegate: nil, progressHandler: nil))
    let store = ProductModelStore(directory: root.appendingPathComponent("library"))
    await store.stage(source)
    XCTAssertNotNil(store.pending, store.error ?? "USDZ 가져오기 실패")
    try store.accept()
    let saved = try XCTUnwrap(store.asset)
    await store.stage(source)
    let cancelled = try XCTUnwrap(store.pending)
    store.cancelPending()
    XCTAssertFalse(FileManager.default.fileExists(atPath: cancelled.url.path))
    XCTAssertEqual(store.asset?.id, saved.id)
    let restored = ProductModelStore(directory: root.appendingPathComponent("library"))
    XCTAssertEqual(restored.asset?.id, saved.id)
    try restored.remove()
    XCTAssertFalse(FileManager.default.fileExists(atPath: saved.url.path))
    XCTAssertNil(ProductModelStore(directory: root.appendingPathComponent("library")).asset)
    XCTAssertTrue(FileManager.default.fileExists(atPath: source.path))
  }
}
