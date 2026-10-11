import AVFoundation
import SwiftUI
import TryOnCore

enum CaptureStatus: Equatable {
  case ready, requesting, searching, tracking, multipleHands, denied, unavailable, paused,
    interrupted
  case failure(String)
  var text: String {
    switch self {
    case .ready: return "반대편 손과 손목을 함께 비춰 주세요."
    case .requesting: return "카메라를 준비하고 있어요."
    case .searching: return "손가락과 손목이 함께 보이도록 조금 멀리 비춰 주세요."
    case .tracking: return "손목을 천천히 움직여 보세요."
    case .multipleHands: return "반대편 손 하나만 화면에 보여 주세요."
    case .denied: return "카메라 권한이 꺼져 있어요. 설정에서 허용해 주세요."
    case .unavailable: return "실제 iPhone의 후면 카메라가 필요해요."
    case .paused: return "카메라를 일시 정지했어요."
    case .interrupted: return "카메라가 잠시 중단되었어요. 다른 앱의 카메라 사용을 마쳐 주세요."
    case .failure(let message): return message
    }
  }
}

@MainActor
final class PrototypeModel: ObservableObject {
  let camera = CameraController()
  @Published private(set) var status: CaptureStatus = .ready
  @Published private(set) var pose: ScreenPose?
  @Published var length = LengthSelection.referenceLength
  @Published var calibration = Calibration()
  @Published private(set) var wantsCamera = false
  private var viewport = Size2(0, 0)
  private var filter = PoseFilter()
  private var active = true
  private var runID = 0

  init() {
    camera.onEvent = { [weak self] event, generation in
      Task { @MainActor [weak self] in self?.receive(event, generation: generation) }
    }
  }
  func updateViewport(_ size: CGSize) {
    let next = Size2(size.width, size.height)
    if next != viewport {
      viewport = next
      clearPose()
    }
  }
  func startCamera() {
    wantsCamera = true
    resume()
  }
  func pause() {
    wantsCamera = false
    runID += 1
    camera.stop()
    clearPose()
    status = .paused
  }
  func setActive(_ value: Bool) {
    active = value
    if !value {
      runID += 1
      camera.stop()
      clearPose()
      if wantsCamera { status = .paused }
    } else if wantsCamera {
      resume()
    }
  }
  func expire() {
    if pose != nil, filter.current(at: CACurrentMediaTime()) == nil {
      pose = nil
      if status == .tracking { status = .searching }
    }
  }
  func resetCalibration() { calibration.reset() }
  private func clearPose() {
    filter.reset()
    pose = nil
  }
  private func resume() {
    guard active, wantsCamera else { return }
    runID += 1
    let generation = runID
    clearPose()
    #if targetEnvironment(simulator)
      status = .unavailable
      return
    #else
      switch AVCaptureDevice.authorizationStatus(for: .video) {
      case .authorized:
        status = .requesting
        camera.start(runID: generation)
      case .notDetermined:
        status = .requesting
        AVCaptureDevice.requestAccess(for: .video) { [weak self] allowed in
          Task { @MainActor [weak self] in
            guard let self, self.active, self.wantsCamera, self.runID == generation else { return }
            if allowed { self.camera.start(runID: generation) } else { self.status = .denied }
          }
        }
      default: status = .denied
      }
    #endif
  }
  private func receive(_ event: CameraEvent, generation: Int) {
    guard active, wantsCamera, generation == runID else { return }
    switch event {
    case .started:
      clearPose()
      status = .searching
    case .frame(let observation, let image, let timestamp, let multiple):
      let mapped = observation.flatMap { CameraMapping.pose($0, image: image, viewport: viewport) }
      pose = filter.update(mapped, at: timestamp)
      if filter.current(at: CACurrentMediaTime()) == nil { pose = nil }
      status = multiple ? .multipleHands : (pose == nil ? .searching : .tracking)
    case .unavailable:
      clearPose()
      status = .unavailable
    case .interrupted:
      clearPose()
      status = .interrupted
    case .failed(let message):
      clearPose()
      status = .failure(message)
    }
  }
}
