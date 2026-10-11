import Foundation

public struct Point2: Equatable, Sendable {
  public var x: Double
  public var y: Double
  public init(_ x: Double, _ y: Double) {
    self.x = x
    self.y = y
  }
}
public struct Size2: Equatable, Sendable {
  public var width: Double
  public var height: Double
  public init(_ width: Double, _ height: Double) {
    self.width = width
    self.height = height
  }
}
public struct JointPoint: Sendable {
  public var point: Point2
  public var confidence: Double
  public init(_ point: Point2, confidence: Double = 1) {
    self.point = point
    self.confidence = confidence
  }
}
public struct HandLandmarks: Sendable {
  public var wrist: JointPoint
  public var index: JointPoint
  public var middle: JointPoint
  public var little: JointPoint
  public init(wrist: JointPoint, index: JointPoint, middle: JointPoint, little: JointPoint) {
    self.wrist = wrist
    self.index = index
    self.middle = middle
    self.little = little
  }
}
public struct WristObservation: Sendable {
  public var center: Point2
  public var left: Point2
  public var right: Point2
  public init(center: Point2, left: Point2, right: Point2) {
    self.center = center
    self.left = left
    self.right = right
  }
}
public struct ScreenPose: Equatable, Sendable {
  public var center: Point2
  public var width: Double
  public var angle: Double
  public init(center: Point2, width: Double, angle: Double) {
    self.center = center
    self.width = width
    self.angle = angle
  }
}
public enum CameraMapping {
  public static func point(_ point: Point2, image: Size2, viewport: Size2) -> Point2? {
    guard
      [point.x, point.y, image.width, image.height, viewport.width, viewport.height].allSatisfy(
        \.isFinite),
      image.width > 0, image.height > 0, viewport.width > 0, viewport.height > 0
    else { return nil }
    let scale = max(viewport.width / image.width, viewport.height / image.height)
    return Point2(
      point.x * image.width * scale + (viewport.width - image.width * scale) / 2,
      (1 - point.y) * image.height * scale + (viewport.height - image.height * scale) / 2)
  }
  public static func pose(_ observation: WristObservation, image: Size2, viewport: Size2)
    -> ScreenPose?
  {
    guard let center = point(observation.center, image: image, viewport: viewport),
      let left = point(observation.left, image: image, viewport: viewport),
      let right = point(observation.right, image: image, viewport: viewport)
    else { return nil }
    let width = hypot(right.x - left.x, right.y - left.y)
    guard width > 8, center.x >= 0, center.x <= viewport.width,
      center.y >= 0, center.y <= viewport.height
    else { return nil }
    return ScreenPose(
      center: center, width: width, angle: atan2(right.y - left.y, right.x - left.x))
  }
}
public enum WristEstimator {
  public static func estimate(_ hand: HandLandmarks, image: Size2) -> WristObservation? {
    guard image.width > 0, image.height > 0, image.width.isFinite, image.height.isFinite else {
      return nil
    }
    let joints = [hand.wrist, hand.index, hand.middle, hand.little]
    guard
      joints.allSatisfy({
        $0.confidence.isFinite && $0.confidence >= 0.55 && $0.point.x.isFinite
          && $0.point.y.isFinite && (0...1).contains($0.point.x) && (0...1).contains($0.point.y)
      })
    else { return nil }
    let dx = (hand.middle.point.x - hand.wrist.point.x) * image.width
    let dy = (hand.middle.point.y - hand.wrist.point.y) * image.height
    let palmLength = hypot(dx, dy)
    let palmWidth = hypot(
      (hand.index.point.x - hand.little.point.x) * image.width,
      (hand.index.point.y - hand.little.point.y) * image.height)
    let shortSide = min(image.width, image.height)
    guard palmLength > shortSide * 0.06, palmWidth > shortSide * 0.045,
      palmWidth < shortSide * 0.8
    else { return nil }
    let center = Point2(
      hand.wrist.point.x - dx * 0.2 / image.width,
      hand.wrist.point.y - dy * 0.2 / image.height)
    let halfWidth = palmWidth * 0.9 / 2
    let across = Point2(
      dy / palmLength * halfWidth / image.width,
      -dx / palmLength * halfWidth / image.height)
    return WristObservation(
      center: center, left: Point2(center.x - across.x, center.y - across.y),
      right: Point2(center.x + across.x, center.y + across.y))
  }
}
public struct PoseFilter {
  private var value: ScreenPose?
  private var updatedAt: Double?
  public init() {}
  public mutating func update(_ pose: ScreenPose?, at timestamp: Double) -> ScreenPose? {
    guard timestamp.isFinite else {
      reset()
      return nil
    }
    if let updatedAt, timestamp < updatedAt { return value }
    guard let pose, pose.width > 0,
      [pose.center.x, pose.center.y, pose.width, pose.angle].allSatisfy(\.isFinite)
    else {
      reset()
      return nil
    }
    if let previous = value, let previousTime = updatedAt, timestamp - previousTime <= 0.25 {
      let alpha = 1 - exp(-(timestamp - previousTime) / 0.075)
      let delta = atan2(sin(pose.angle - previous.angle), cos(pose.angle - previous.angle))
      value = ScreenPose(
        center: Point2(
          previous.center.x + (pose.center.x - previous.center.x) * alpha,
          previous.center.y + (pose.center.y - previous.center.y) * alpha),
        width: previous.width + (pose.width - previous.width) * alpha,
        angle: previous.angle + delta * alpha)
    } else {
      value = pose
    }
    updatedAt = timestamp
    return value
  }
  public mutating func current(at timestamp: Double) -> ScreenPose? {
    guard let updatedAt, timestamp.isFinite, timestamp >= updatedAt, timestamp - updatedAt <= 0.25
    else {
      reset()
      return nil
    }
    return value
  }
  public mutating func reset() {
    value = nil
    updatedAt = nil
  }
}
public struct Calibration: Equatable, Sendable {
  public var scale: Double = 1
  public var x: Double = 0
  public var y: Double = 0
  public var tilt: Double = 0
  public init() {}
  public mutating func set(scale: Double, x: Double, y: Double, tilt: Double) {
    self.scale = scale.isFinite ? min(1.4, max(0.7, scale)) : 1
    self.x = x.isFinite ? min(0.75, max(-0.75, x)) : 0
    self.y = y.isFinite ? min(0.75, max(-0.75, y)) : 0
    self.tilt = tilt.isFinite ? min(35, max(-35, tilt)) : 0
  }
  public mutating func reset() { self = Calibration() }
}
public enum LengthSelection {
  public static func accepts(_ length: Double) -> Bool {
    length.isFinite && (15...21).contains(length)
      && abs(length * 2 - (length * 2).rounded()) < 0.00001
  }
}
