import Combine
import Foundation
import UIKit

/// User-provided reference photos are kept separate from the EARTH product catalogue.
@MainActor final class ProductPhotoStore: ObservableObject {
  @Published private(set) var photo: UIImage?
  @Published private(set) var original: UIImage?
  @Published private(set) var backgroundRemoved = false
  @Published private(set) var date: Date?
  @Published var error: String?
  private let directory: URL
  private var record: Record?

  private struct Record: Codable {
    let id: UUID
    let date: Date
    let backgroundRemoved: Bool
  }

  init(directory: URL? = nil) {
    self.directory = directory ?? FileManager.default.urls(for: .applicationSupportDirectory,
      in: .userDomainMask)[0].appendingPathComponent("MEKITPhotos", isDirectory: true)
    restore()
  }

  func save(original: UIImage, display: UIImage, backgroundRemoved: Bool) throws {
    guard let originalData = original.pngData(), let displayData = display.pngData() else {
      throw PhotoError.invalidImage
    }
    let next = Record(id: UUID(), date: Date(), backgroundRemoved: backgroundRemoved)
    let folder = directory.appendingPathComponent(next.id.uuidString, isDirectory: true)
    try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
    do {
      try originalData.write(to: folder.appendingPathComponent("original.png"),
                             options: [.atomic, .completeFileProtection])
      try displayData.write(to: folder.appendingPathComponent("display.png"),
                            options: [.atomic, .completeFileProtection])
      // Publish the record last. A failed save cannot replace the previous photo.
      try JSONEncoder().encode(next).write(to: directory.appendingPathComponent("current.json"),
                                           options: [.atomic, .completeFileProtection])
    } catch {
      try? FileManager.default.removeItem(at: folder)
      throw error
    }
    let previous = record
    self.original = original
    photo = display
    self.backgroundRemoved = backgroundRemoved
    date = next.date
    record = next
    error = nil
    if let previous { try? FileManager.default.removeItem(at: directory.appendingPathComponent(previous.id.uuidString)) }
  }

  func remove() throws {
    let manifest = directory.appendingPathComponent("current.json")
    if FileManager.default.fileExists(atPath: manifest.path) {
      try FileManager.default.removeItem(at: manifest)
    }
    if let record {
      let folder = directory.appendingPathComponent(record.id.uuidString)
      if FileManager.default.fileExists(atPath: folder.path) { try FileManager.default.removeItem(at: folder) }
    }
    record = nil
    photo = nil
    original = nil
    date = nil
    backgroundRemoved = false
  }

  private func restore() {
    let manifest = directory.appendingPathComponent("current.json")
    guard FileManager.default.fileExists(atPath: manifest.path) else { return }
    do {
      let restored = try JSONDecoder().decode(Record.self, from: Data(contentsOf: manifest))
      let folder = directory.appendingPathComponent(restored.id.uuidString)
      let original = try PhotoProcessor.decode(Data(contentsOf: folder.appendingPathComponent("original.png")))
      let display = try PhotoProcessor.decode(Data(contentsOf: folder.appendingPathComponent("display.png")))
      record = restored
      self.original = original
      photo = display
      backgroundRemoved = restored.backgroundRemoved
      date = restored.date
    } catch {
      self.error = "보관한 사진을 읽지 못했어요. 실물 사진을 다시 가져와 주세요."
    }
  }
}

enum PhotoError: LocalizedError {
  case invalidImage, tooLarge, noForeground
  var errorDescription: String? {
    switch self {
    case .invalidImage: return "사진을 읽지 못했어요. PNG·JPEG·HEIC 파일을 선택해 주세요."
    case .tooLarge: return "20MB 이하의 사진을 선택해 주세요."
    case .noForeground: return "제품을 분리하지 못했어요. 배경이 단순한 사진이나 투명 PNG를 사용해 주세요."
    }
  }
}
