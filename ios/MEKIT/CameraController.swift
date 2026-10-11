import AVFoundation
import TryOnCore
import Vision

enum CameraEvent: Sendable {
  case started
  case frame(WristObservation?, Size2, Double, multiple: Bool)
  case unavailable
  case interrupted
  case failed(String)
}

// All configuration, session control and Vision work are serialized on queue.
final class CameraController: NSObject, AVCaptureVideoDataOutputSampleBufferDelegate,
  @unchecked Sendable
{
  let session = AVCaptureSession()
  var onEvent: (@Sendable (CameraEvent, Int) -> Void)?
  private let queue = DispatchQueue(label: "com.casewingit.mekit.camera", qos: .userInitiated)
  private let request = VNDetectHumanHandPoseRequest()
  private var configured = false
  private var runID = -1
  private var lastAnalysis: Double = 0
  private var observers: [NSObjectProtocol] = []

  override init() {
    super.init()
    request.maximumHandCount = 2
    for name in [
      AVCaptureSession.wasInterruptedNotification, AVCaptureSession.interruptionEndedNotification,
      AVCaptureSession.runtimeErrorNotification,
    ] {
      observers.append(
        NotificationCenter.default.addObserver(forName: name, object: session, queue: nil) {
          [weak self] notification in
          self?.queue.async { [weak self] in
            guard let self, self.runID >= 0 else { return }
            if notification.name == AVCaptureSession.interruptionEndedNotification {
              self.onEvent?(.started, self.runID)
            } else if notification.name == AVCaptureSession.wasInterruptedNotification {
              self.onEvent?(.interrupted, self.runID)
            } else {
              self.onEvent?(.failed("카메라가 중단되었습니다. 다시 시작해 주세요."), self.runID)
            }
          }
        })
    }
  }
  deinit { observers.forEach(NotificationCenter.default.removeObserver) }

  func start(runID: Int) {
    queue.async { [weak self] in
      guard let self else { return }
      self.runID = runID
      self.lastAnalysis = 0
      #if targetEnvironment(simulator)
        self.onEvent?(.unavailable, runID)
        return
      #else
        do {
          if !self.configured { try self.configure() }
          if !self.session.isRunning { self.session.startRunning() }
          self.onEvent?(self.session.isRunning ? .started : .failed("카메라를 시작하지 못했습니다."), runID)
        } catch {
          self.onEvent?(.failed("후면 카메라를 준비하지 못했습니다. 다시 시작해 주세요."), runID)
        }
      #endif
    }
  }
  func stop() {
    queue.async { [weak self] in
      guard let self else { return }
      self.runID = -1
      if self.session.isRunning { self.session.stopRunning() }
    }
  }
  private func configure() throws {
    guard
      let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back)
    else {
      throw CameraSetupError.unavailable
    }
    let input = try AVCaptureDeviceInput(device: device)
    let output = AVCaptureVideoDataOutput()
    output.alwaysDiscardsLateVideoFrames = true
    output.videoSettings = [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA]
    output.setSampleBufferDelegate(self, queue: queue)
    session.beginConfiguration()
    defer { session.commitConfiguration() }
    session.sessionPreset = .hd1280x720
    guard session.canAddInput(input), session.canAddOutput(output) else {
      throw CameraSetupError.unavailable
    }
    session.addInput(input)
    session.addOutput(output)
    guard let connection = output.connection(with: .video),
      connection.isVideoRotationAngleSupported(90)
    else {
      session.removeInput(input)
      session.removeOutput(output)
      throw CameraSetupError.unavailable
    }
    connection.videoRotationAngle = 90
    connection.automaticallyAdjustsVideoMirroring = false
    connection.isVideoMirrored = false
    configured = true
  }
  func captureOutput(
    _ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer,
    from connection: AVCaptureConnection
  ) {
    let now = CACurrentMediaTime()
    guard runID >= 0, now - lastAnalysis >= 1 / 15,
      let buffer = CMSampleBufferGetImageBuffer(sampleBuffer)
    else { return }
    lastAnalysis = now
    let size = Size2(Double(CVPixelBufferGetWidth(buffer)), Double(CVPixelBufferGetHeight(buffer)))
    do {
      // Connection rotates pixels to portrait, so Vision receives an upright, unmirrored image.
      try VNImageRequestHandler(cvPixelBuffer: buffer, orientation: .up).perform([request])
      let hands = request.results ?? []
      if hands.count > 1 {
        onEvent?(.frame(nil, size, now, multiple: true), runID)
        return
      }
      let observation =
        try hands.first.map { hand -> WristObservation? in
          func joint(_ name: VNHumanHandPoseObservation.JointName) throws -> JointPoint {
            let value = try hand.recognizedPoint(name)
            return JointPoint(
              Point2(value.location.x, value.location.y), confidence: Double(value.confidence))
          }
          return try WristEstimator.estimate(
            HandLandmarks(
              wrist: joint(.wrist), index: joint(.indexMCP),
              middle: joint(.middleMCP), little: joint(.littleMCP)), image: size)
        } ?? nil
      onEvent?(.frame(observation, size, now, multiple: false), runID)
    } catch {
      onEvent?(.frame(nil, size, now, multiple: false), runID)
    }
  }
  private enum CameraSetupError: Error { case unavailable }
}
