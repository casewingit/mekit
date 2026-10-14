import CoreImage
import ImageIO
import UIKit
import Vision

enum PhotoProcessor {
  static let maxBytes = 20 * 1024 * 1024

  static func decode(_ data: Data) throws -> UIImage {
    guard data.count <= maxBytes else { throw PhotoError.tooLarge }
    guard let source = CGImageSourceCreateWithData(data as CFData, nil),
      CGImageSourceGetCount(source) > 0,
      let image = CGImageSourceCreateThumbnailAtIndex(source, 0, [
        kCGImageSourceCreateThumbnailFromImageAlways: true,
        kCGImageSourceCreateThumbnailWithTransform: true,
        kCGImageSourceThumbnailMaxPixelSize: 2048,
        kCGImageSourceShouldCacheImmediately: true,
      ] as CFDictionary)
    else { throw PhotoError.invalidImage }
    return UIImage(cgImage: image)
  }

  static func removeBackground(_ image: UIImage) throws -> UIImage {
    guard let cgImage = image.cgImage else { throw PhotoError.invalidImage }
    let handler = VNImageRequestHandler(cgImage: cgImage, orientation: .up)
    let request = VNGenerateForegroundInstanceMaskRequest()
    try handler.perform([request])
    guard let result = request.results?.first, !result.allInstances.isEmpty else {
      throw PhotoError.noForeground
    }
    let buffer = try result.generateMaskedImage(ofInstances: result.allInstances, from: handler,
                                                croppedToInstancesExtent: true)
    let value = CIImage(cvPixelBuffer: buffer)
    guard let cropped = CIContext().createCGImage(value, from: value.extent) else {
      throw PhotoError.noForeground
    }
    return try cropTransparency(UIImage(cgImage: cropped))
  }

  static func cropTransparency(_ image: UIImage) throws -> UIImage {
    guard let cg = image.cgImage else { throw PhotoError.invalidImage }
    let width = cg.width, height = cg.height
    var pixels = [UInt8](repeating: 0, count: width * height * 4)
    let bounds: CGRect? = pixels.withUnsafeMutableBytes { bytes in
      guard let context = CGContext(data: bytes.baseAddress, width: width, height: height,
        bitsPerComponent: 8, bytesPerRow: width * 4, space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue | CGBitmapInfo.byteOrder32Big.rawValue)
      else { return nil }
      // Use a top-left coordinate system, matching CGImage cropping coordinates.
      context.translateBy(x: 0, y: CGFloat(height))
      context.scaleBy(x: 1, y: -1)
      context.draw(cg, in: CGRect(x: 0, y: 0, width: width, height: height))
      guard let base = bytes.baseAddress?.assumingMemoryBound(to: UInt8.self) else { return nil }
      var minX = width, minY = height, maxX = -1, maxY = -1
      for y in 0..<height {
        for x in 0..<width where base[(y * width + x) * 4 + 3] > 8 {
          minX = min(minX, x); minY = min(minY, y)
          maxX = max(maxX, x); maxY = max(maxY, y)
        }
      }
      guard maxX >= minX, maxY >= minY else { return nil }
      return CGRect(x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1)
    }
    guard let bounds, let cropped = cg.cropping(to: bounds) else { throw PhotoError.noForeground }
    return UIImage(cgImage: cropped, scale: image.scale, orientation: .up)
  }
}
