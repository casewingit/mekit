import Combine
import SceneKit

final class ProductModelAsset: Identifiable, @unchecked Sendable {
  let id: UUID
  let url: URL
  let node: SCNNode
  init(id: UUID, url: URL) throws {
    self.id = id
    self.url = url
    let scene = try SCNScene(url: url, options: [.checkConsistency: true])
    node = try Self.normalize(scene.rootNode)
  }

  static func normalize(_ source: SCNNode) throws -> SCNNode {
    let copy = source.clone()
    var vertices = 0, nodes = 0
    func inspect(_ node: SCNNode) {
      nodes += 1
      vertices += node.geometry?.sources(for: .vertex).first?.vectorCount ?? 0
      // Imported cameras/lights must not override the camera composition.
      node.camera = nil; node.light = nil
      node.removeAllAnimations()
    }
    inspect(copy)
    copy.enumerateChildNodes { node, _ in inspect(node) }
    let centered = SCNNode()
    centered.addChildNode(copy)
    let bounds = centered.boundingBox
    let width = bounds.max.x - bounds.min.x
    let height = bounds.max.y - bounds.min.y
    let depth = bounds.max.z - bounds.min.z
    guard vertices > 0, vertices <= 300_000, nodes <= 2048,
      [width, height, depth, bounds.min.x, bounds.min.y, bounds.min.z,
       bounds.max.x, bounds.max.y, bounds.max.z].allSatisfy(\.isFinite),
      width > 0.000001, height > 0.000001, depth > 0.000001,
      height / width < 10, depth / width < 10
    else { throw ModelAssetError.invalid }
    centered.position = SCNVector3(-(bounds.min.x + bounds.max.x) / 2,
      -(bounds.min.y + bounds.max.y) / 2, -(bounds.min.z + bounds.max.z) / 2)
    let normalized = SCNNode()
    normalized.addChildNode(centered)
    normalized.scale = SCNVector3(1 / width, 1 / width, 1 / width)
    return normalized
  }
}

enum ModelAssetError: LocalizedError {
  case invalid, tooLarge
  var errorDescription: String? {
    switch self {
    case .invalid: return "입체 모델을 읽지 못했어요. 텍스처가 포함된 USDZ와 제품 방향을 확인해 주세요."
    case .tooLarge: return "40MB 이하, 30만 정점 이하의 USDZ를 사용해 주세요."
    }
  }
}

@MainActor final class ProductModelStore: ObservableObject {
  @Published private(set) var asset: ProductModelAsset?
  @Published var pending: ProductModelAsset?
  @Published var error: String?
  @Published private(set) var loading = false
  private let directory: URL
  init(directory: URL? = nil) {
    self.directory = directory ?? FileManager.default.urls(for: .applicationSupportDirectory,
      in: .userDomainMask)[0].appendingPathComponent("MEKITModels", isDirectory: true)
    let record = self.directory.appendingPathComponent("current.txt")
    if let idText = try? String(contentsOf: record), let id = UUID(uuidString: idText) {
      do { asset = try ProductModelAsset(id: id, url: self.directory.appendingPathComponent(id.uuidString + ".usdz")) }
      catch { self.error = "보관한 3D 모델을 읽지 못했어요. 다시 가져와 주세요." }
    }
  }
  func stage(_ url: URL) async {
    guard !loading else { return }
    loading = true
    let access = url.startAccessingSecurityScopedResource()
    defer { if access { url.stopAccessingSecurityScopedResource() }; loading = false }
    let id = UUID()
    let destination = directory.appendingPathComponent(id.uuidString + ".usdz")
    do {
      guard url.pathExtension.lowercased() == "usdz" else { throw ModelAssetError.invalid }
      let size = try url.resourceValues(forKeys: [.fileSizeKey]).fileSize ?? 0
      guard size > 0, size <= 40 * 1024 * 1024 else { throw ModelAssetError.tooLarge }
      try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
      try FileManager.default.copyItem(at: url, to: destination)
      try FileManager.default.setAttributes([.protectionKey: FileProtectionType.complete], ofItemAtPath: destination.path)
      pending = try await Task.detached(priority: .userInitiated) {
        try ProductModelAsset(id: id, url: destination)
      }.value
    } catch {
      try? FileManager.default.removeItem(at: destination)
      self.error = error.localizedDescription
    }
  }
  func accept() throws {
    guard let pending else { return }
    try pending.id.uuidString.write(to: directory.appendingPathComponent("current.txt"),
                                     atomically: true, encoding: .utf8)
    let previous = asset
    asset = pending
    self.pending = nil
    if let previous { try? FileManager.default.removeItem(at: previous.url) }
  }
  func cancelPending() {
    if let pending { try? FileManager.default.removeItem(at: pending.url) }
    pending = nil
  }
  func remove() throws {
    let record = directory.appendingPathComponent("current.txt")
    if FileManager.default.fileExists(atPath: record.path) { try FileManager.default.removeItem(at: record) }
    if let asset, FileManager.default.fileExists(atPath: asset.url.path) { try FileManager.default.removeItem(at: asset.url) }
    asset = nil
  }
}
