import Foundation

/// A screen-space photo placement, never a physical fit measurement or a 3D reconstruction.
public struct PhotoPlacement: Equatable, Sendable {
  public let center: Point2
  public let width: Double
  public let height: Double
  public let angle: Double

  public static func make(pose: ScreenPose?, calibration: Calibration, aspectRatio: Double)
    -> PhotoPlacement?
  {
    guard let pose, pose.width > 0, aspectRatio > 0,
      [pose.center.x, pose.center.y, pose.width, pose.angle, aspectRatio].allSatisfy(\.isFinite)
    else { return nil }
    var safe = Calibration()
    safe.set(scale: calibration.scale, x: calibration.x, y: calibration.y, tilt: calibration.tilt)
    let x = safe.x * pose.width
    let y = safe.y * pose.width
    let width = pose.width * safe.scale
    return PhotoPlacement(
      center: Point2(pose.center.x + x * cos(pose.angle) - y * sin(pose.angle),
                     pose.center.y + x * sin(pose.angle) + y * cos(pose.angle)),
      width: width, height: width / aspectRatio,
      angle: pose.angle + safe.tilt * .pi / 180)
  }
}
