import AVFoundation
import Combine
import SwiftUI
import TryOnCore

struct TryOnView: View {
  @Binding var length: Double
  var photo: UIImage? = nil
  var asset: ProductModelAsset? = nil
  @State private var useModel = true
  @State private var occlusion = false
  @StateObject private var model = PrototypeModel()
  @Environment(\.scenePhase) private var scenePhase
  @Environment(\.dismiss) private var dismiss
  private let tick = Timer.publish(every: 0.05, on: .main, in: .common).autoconnect()
  private var is3D: Bool { asset != nil && useModel }
  private var hasAsset: Bool { photo != nil || asset != nil }

  var body: some View {
    GeometryReader { screen in
      ScrollView {
        VStack(alignment: .leading, spacing: 20) {
          HStack {
            VStack(alignment: .leading, spacing: 6) {
              SectionEyebrow(text: is3D ? "IMPORTED MODEL / 3D STUDY" : (photo == nil ? "WRIST TRACKING" : "REAL PHOTO / 2D PREVIEW"))
              Text(is3D ? "실물 모델 배치" : (photo == nil ? "손목 위치 확인" : "실물 사진 배치"))
                .font(.system(size: 24, weight: .medium))
            }
            Spacer()
            Button { model.pause(); dismiss() } label: {
              Image(systemName: "xmark").font(.system(size: 16))
                .frame(width: 44, height: 44)
                .background(MEKITStyle.ink.opacity(0.06), in: Circle())
            }.buttonStyle(.plain).accessibilityLabel("카메라 닫기").accessibilityIdentifier("closeCamera")
          }
          if photo != nil && asset != nil {
            Picker("표시 자료", selection: $useModel) {
              Text("실물 사진 · 2D").tag(false)
              Text("가져온 모델 · 3D").tag(true)
            }.pickerStyle(.segmented)
          }
          cameraSurface.frame(height: min(450, max(310, screen.size.height * 0.48)))
            .accessibilityElement(children: .contain).accessibilityIdentifier("renderSurface")
          Text(model.status.text).font(.system(size: 14, weight: .medium))
            .fixedSize(horizontal: false, vertical: true).accessibilityIdentifier("captureStatus")
          actions
          if hasAsset { calibrationControls }
          else {
            VStack(alignment: .leading, spacing: 8) {
              Text("실물 기반 착용 모델이 필요해요.").font(.system(size: 14, weight: .medium))
                .accessibilityIdentifier("physicalAssetUnavailable")
              Text("지금은 손목 위치만 안내합니다. EARTH의 실물 사진·치수와 대조한 모델을 준비한 후 제품 착용 표시를 연결합니다.")
                .font(.system(size: 12)).foregroundStyle(MEKITStyle.muted)
            }.padding(16).background(.white, in: RoundedRectangle(cornerRadius: 16))
          }
          LengthPicker(length: $length)
          if is3D {
            Toggle("손목 뒤 가림 근사", isOn: $occlusion).font(.system(size: 13))
            Text("가림은 측정한 손목 형상이 아닌 원통 근사입니다. 모델의 고리 방향과 실물과의 일치를 확인하세요.")
              .font(.system(size: 12)).foregroundStyle(MEKITStyle.muted)
          }
          Text(is3D ? "가져온 실물 모델의 위치·크기는 화면에 맞춘 시각 보정입니다. 실제 손목 둘레·정확한 핏·조임을 측정하지 않습니다. 길이 선택은 모델 크기를 바꾸지 않습니다. 카메라 영상은 저장하거나 전송하지 않습니다." : (photo == nil
            ? "카메라 영상은 저장하거나 전송하지 않습니다. 손목 둘레와 착용감을 측정하지 않아요."
            : "2D 사진은 손목 위치를 따라 이동합니다. 길이 선택은 사진 크기를 바꾸지 않으며, 실제 핏·입체 형태·손목 뒤 가림을 표현하지 않습니다. 카메라 영상은 저장하거나 전송하지 않습니다."))
            .font(.system(size: 12)).foregroundStyle(MEKITStyle.muted).lineSpacing(4)
        }.padding(20)
      }.background(MEKITStyle.paper).foregroundStyle(MEKITStyle.ink)
    }
    .onChange(of: scenePhase, initial: true) { _, phase in model.setActive(phase == .active) }
    .onReceive(tick) { _ in model.expire() }
    .onDisappear { model.pause() }
  }

  private var cameraSurface: some View {
    GeometryReader { geometry in
      ZStack {
        Color(red: 0.12, green: 0.14, blue: 0.12)
        CameraPreview(session: model.camera.session)
        if [.ready, .paused, .denied, .unavailable, .interrupted].contains(model.status)
          || !model.wantsCamera {
          MEKITStyle.ink
        }
        if is3D, let asset {
          WristModelView(asset: asset, pose: model.pose, calibration: model.calibration,
                         viewport: geometry.size, occlusion: occlusion)
            .allowsHitTesting(false)
        }
        if !is3D, let photo, let placement = PhotoPlacement.make(
          pose: model.pose, calibration: model.calibration,
          aspectRatio: photo.size.width / photo.size.height) {
          Image(uiImage: photo).resizable().scaledToFit()
            .frame(width: placement.width, height: placement.height)
            .rotationEffect(.radians(placement.angle))
            .position(x: placement.center.x, y: placement.center.y)
            .accessibilityLabel("가져온 실물 사진의 2D 배치")
        } else if !is3D, let pose = model.pose {
          Path { path in
            let dx = cos(pose.angle) * pose.width / 2
            let dy = sin(pose.angle) * pose.width / 2
            path.move(to: CGPoint(x: pose.center.x - dx, y: pose.center.y - dy))
            path.addLine(to: CGPoint(x: pose.center.x + dx, y: pose.center.y + dy))
          }.stroke(.white, style: StrokeStyle(lineWidth: 2, dash: [6, 5]))
          Circle().stroke(.white, lineWidth: 2).frame(width: 12, height: 12)
            .position(x: pose.center.x, y: pose.center.y)
        } else if model.pose == nil {
          VStack(spacing: 16) {
            Image(systemName: "hand.raised").font(.system(size: 75, weight: .ultraLight))
            Text("반대편 손과 손목을\n함께 보여 주세요.")
              .font(.system(size: 14, weight: .medium)).multilineTextAlignment(.center).lineSpacing(5)
          }.foregroundStyle(.white).shadow(color: .black.opacity(0.4), radius: 6)
            .accessibilityHidden(true)
        }
        VStack {
          HStack {
            Text(model.pose == nil ? "추적 대기" : (is3D ? "3D 모델 배치" : (photo == nil ? "손목 위치" : "2D 사진 배치")))
              .font(.system(size: 10, weight: .semibold)).padding(.horizontal, 10).padding(.vertical, 7)
              .background(.ultraThinMaterial, in: Capsule())
            Spacer()
          }
          Spacer()
          if hasAsset {
            Text(is3D ? "가져온 3D 모델 · 실물 검증 필요" : "실물 사진 · 입체 착용 모델이 아닙니다")
              .font(.system(size: 10)).foregroundStyle(.white)
              .padding(10).background(.black.opacity(0.5), in: Capsule())
          }
        }.padding(16)
      }.onChange(of: geometry.size, initial: true) { _, size in model.updateViewport(size) }
    }.clipShape(RoundedRectangle(cornerRadius: 24))
  }

  private var actions: some View {
    VStack(spacing: 10) {
      if model.status == .denied {
        Button("카메라 설정 열기") {
          if let url = URL(string: UIApplication.openSettingsURLString) { UIApplication.shared.open(url) }
        }.buttonStyle(StudioButton())
      }
      Button(model.wantsCamera ? "추적 확인 중지" : "카메라 시작") {
        if model.wantsCamera { model.pause() } else { model.startCamera() }
      }.buttonStyle(StudioButton(secondary: model.status == .denied)).accessibilityIdentifier("startCamera")
    }
  }

  private var calibrationControls: some View {
    VStack(alignment: .leading, spacing: 14) {
      HStack {
        Text(is3D ? "모델 위치 보정" : "사진 위치 보정").font(.system(size: 15, weight: .semibold))
        Spacer()
        Button("초기화") { model.resetCalibration() }.font(.system(size: 12))
          .accessibilityIdentifier("resetCalibration")
      }
      adjustment("크기", value: \.scale, range: 0.7...1.4)
      adjustment("좌우", value: \.x, range: -0.75...0.75)
      adjustment("위아래", value: \.y, range: -0.75...0.75)
      adjustment("각도", value: \.tilt, range: -35...35)
    }.padding(16).background(.white, in: RoundedRectangle(cornerRadius: 16))
  }

  private func adjustment(_ title: String, value: WritableKeyPath<Calibration, Double>,
                          range: ClosedRange<Double>) -> some View {
    HStack(spacing: 12) {
      Text(title).font(.system(size: 12)).frame(width: 44, alignment: .leading)
      Slider(value: Binding(get: { model.calibration[keyPath: value] }, set: { next in
        var calibration = model.calibration
        calibration[keyPath: value] = next
        calibration.set(scale: calibration.scale, x: calibration.x, y: calibration.y, tilt: calibration.tilt)
        model.calibration = calibration
      }), in: range).tint(MEKITStyle.olive).accessibilityLabel(title + " 보정")
      Text(String(format: "%.2f", model.calibration[keyPath: value]))
        .font(.system(size: 11)).monospacedDigit().frame(width: 44, alignment: .trailing)
    }
  }
}

private struct CameraPreview: UIViewRepresentable {
  let session: AVCaptureSession
  func makeUIView(context: Context) -> PreviewView {
    let view = PreviewView()
    view.preview.videoGravity = .resizeAspectFill
    view.preview.session = session
    return view
  }
  func updateUIView(_ view: PreviewView, context: Context) { view.rotatePortrait() }
  final class PreviewView: UIView {
    override class var layerClass: AnyClass { AVCaptureVideoPreviewLayer.self }
    var preview: AVCaptureVideoPreviewLayer { layer as! AVCaptureVideoPreviewLayer }
    override func layoutSubviews() { super.layoutSubviews(); rotatePortrait() }
    func rotatePortrait() {
      guard let connection = preview.connection, connection.isVideoRotationAngleSupported(90) else { return }
      connection.videoRotationAngle = 90
      connection.automaticallyAdjustsVideoMirroring = false
      connection.isVideoMirrored = false
    }
  }
}
