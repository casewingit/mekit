import AVFoundation
import Combine
import SwiftUI
import TryOnCore

struct TryOnView: View {
  @StateObject private var model = PrototypeModel()
  @Environment(\.scenePhase) private var scenePhase
  @State private var calibrationExpanded = false
  @State private var occlusion = true
  private let olive = Color(red: 0.25, green: 0.31, blue: 0.22)
  private let paper = Color(red: 0.96, green: 0.95, blue: 0.92)
  private let tick = Timer.publish(every: 0.05, on: .main, in: .common).autoconnect()

  var body: some View {
    GeometryReader { screen in
      ScrollView {
        VStack(alignment: .leading, spacing: 20) {
          HStack(alignment: .firstTextBaseline) {
            Text("MEKIT").font(.system(size: 28, weight: .medium, design: .serif)).tracking(2)
            Spacer()
            Text("IPHONE · FIT STUDY 01").font(.system(size: 10, weight: .medium)).tracking(1)
          }
          HStack(alignment: .bottom) {
            VStack(alignment: .leading, spacing: 5) {
              Text("001 EARTH").font(.system(size: 11, weight: .semibold)).tracking(2)
              Text("내 손목 위의 EARTH").font(.system(size: 25, weight: .semibold))
            }
            Spacer()
            Text("49,000원").font(.system(size: 15, weight: .medium))
          }
          cameraSurface
            .frame(height: min(440, max(310, screen.size.height * 0.49)))
            .accessibilityElement(children: .contain)
            .accessibilityIdentifier("renderSurface")
          Text(model.modelPreview ? "카메라 추적 아님 · 3D 모델 검토" : model.status.text)
            .font(.system(size: 14, weight: .medium))
            .fixedSize(horizontal: false, vertical: true)
            .accessibilityIdentifier("captureStatus")
          if let error = model.rendererError {
            Text(error).foregroundStyle(.red).accessibilityIdentifier("rendererFailure")
          }
          actionButtons
          lengthSelection
          VStack(alignment: .leading) {
            Button {
              withAnimation { calibrationExpanded.toggle() }
            } label: {
              HStack {
                Text("화면에 맞게 보정하기").font(.system(size: 15, weight: .medium))
                Spacer()
                Image(systemName: calibrationExpanded ? "chevron.up" : "chevron.down")
              }.frame(minHeight: 28).contentShape(Rectangle())
            }.buttonStyle(.plain).accessibilityIdentifier("calibrationPanel")
              .accessibilityValue(calibrationExpanded ? "펼침" : "접힘")
            if calibrationExpanded {
              VStack(spacing: 14) {
                slider(
                  "크기", key: \.scale, range: 0.7...1.4, id: "scale",
                  value: "\(Int((model.calibration.scale * 100).rounded()))%")
                slider(
                  "좌우 위치", key: \.x, range: -0.75...0.75, id: "x",
                  value: String(format: "%.2f", model.calibration.x))
                slider(
                  "위아래 위치", key: \.y, range: -0.75...0.75, id: "y",
                  value: String(format: "%.2f", model.calibration.y))
                slider(
                  "기울기", key: \.tilt, range: -35...35, id: "tilt",
                  value: "\(Int(model.calibration.tilt))°")
                Toggle("손목 뒤 근사 가림", isOn: $occlusion).font(.system(size: 14))
                  .accessibilityIdentifier("occlusionToggle")
                Button("보정 초기화") { model.resetCalibration() }
                  .accessibilityIdentifier("resetCalibration")
                  .frame(maxWidth: .infinity, minHeight: 44)
                  .background(olive.opacity(0.08), in: RoundedRectangle(cornerRadius: 12))
              }.padding(.top, 16)
            }
          }
          .tint(olive)
          .padding(16)
          .background(.white.opacity(0.6), in: RoundedRectangle(cornerRadius: 18))
          VStack(alignment: .leading, spacing: 8) {
            Text("검증용 3D 모델 · 실물 제품과 다를 수 있어요.").fontWeight(.medium)
            Text(
              "손 랜드마크로 위치·방향을 근사합니다. 가림은 타원형 손목 마스크이며 실제 피부 윤곽이 아닙니다. 손목을 크게 돌리면 표시가 부정확할 수 있어요.")
            Text("카메라 화면은 실제 둘레·조임·촉감이나 정확한 핏을 보장하지 않아요. 영상은 저장하거나 전송하지 않습니다.")
          }
          .font(.system(size: 12)).foregroundStyle(.secondary)
          .fixedSize(horizontal: false, vertical: true)
        }
        .padding(20)
      }
      .background(paper)
      .foregroundStyle(olive)
      .preferredColorScheme(.light)
    }
    .onChange(of: scenePhase, initial: true) { _, phase in model.setActive(phase == .active) }
    .onReceive(tick) { _ in model.expire() }
    .onDisappear { model.pause() }
  }
  private var cameraSurface: some View {
    GeometryReader { geometry in
      ZStack {
        Color(red: 0.85, green: 0.85, blue: 0.81)
        if !model.modelPreview { CameraPreview(session: model.camera.session) }
        if model.modelPreview {
          VStack {
            Text("3D MODEL REVIEW").font(.system(size: 10, weight: .semibold)).tracking(2)
            Spacer()
            Text("정적 모델 · 카메라 영상 없음").font(.system(size: 11))
          }.padding(20)
        } else if model.pose == nil {
          VStack(spacing: 14) {
            Image(systemName: "hand.raised").font(.system(size: 80, weight: .ultraLight))
            Text("반대편 손과 손목을\n함께 보여 주세요.")
              .font(.system(size: 14, weight: .medium)).multilineTextAlignment(.center)
          }
          .foregroundStyle(.white)
          .shadow(color: .black.opacity(0.5), radius: 6)
          .accessibilityHidden(true)
        }
        MetalBraceletView(
          state: BraceletRenderState(
            pose: model.modelPreview ? model.previewPose : model.pose,
            calibration: model.calibration, length: model.length,
            occlusion: occlusion)
        ) { model.rendererError = $0 }
        VStack {
          HStack {
            Text(model.modelPreview ? "모델 검토" : (model.pose == nil ? "추적 대기" : "2D 손목 추적"))
              .font(.system(size: 10, weight: .semibold))
              .padding(.horizontal, 10).padding(.vertical, 7)
              .background(.ultraThinMaterial, in: Capsule())
            Spacer()
          }
          Spacer()
        }.padding(16)
      }
      .onChange(of: geometry.size, initial: true) { _, size in model.updateViewport(size) }
    }
    .clipShape(RoundedRectangle(cornerRadius: 24))
  }
  private var actionButtons: some View {
    VStack(spacing: 10) {
      if model.status == .denied {
        Button("카메라 설정 열기") {
          if let url = URL(string: UIApplication.openSettingsURLString) {
            UIApplication.shared.open(url)
          }
        }.buttonStyle(PrimaryButton(color: olive))
      } else {
        Button(model.wantsCamera ? "착용 확인 중지" : "카메라로 착용해 보기") {
          if model.wantsCamera {
            model.pause()
          } else {
            occlusion = true
            model.startCamera()
          }
        }
        .accessibilityIdentifier("startCamera")
        .buttonStyle(PrimaryButton(color: olive))
      }
      Button("3D 모델만 검토하기") {
        occlusion = false
        model.showModelPreview()
      }
      .accessibilityIdentifier("modelPreview")
      .font(.system(size: 13, weight: .medium))
      .frame(maxWidth: .infinity, minHeight: 40)
    }
  }
  private var lengthSelection: some View {
    HStack {
      VStack(alignment: .leading, spacing: 5) {
        Text("완성 길이").font(.system(size: 14, weight: .medium))
        Text("길이 선택 · 둘레 측정 아님").font(.system(size: 11)).foregroundStyle(.secondary)
      }
      Spacer()
      Button {
        model.length -= 0.5
      } label: {
        Image(systemName: "minus")
      }
      .accessibilityLabel("완성 길이 줄이기").accessibilityIdentifier("lengthDecrease")
      .disabled(model.length <= 15).frame(width: 40, height: 44)
      Text(String(format: "%.1fcm", model.length)).monospacedDigit()
        .font(.system(size: 15, weight: .medium)).accessibilityIdentifier("lengthReadout")
      Button {
        model.length += 0.5
      } label: {
        Image(systemName: "plus")
      }
      .accessibilityLabel("완성 길이 늘리기").accessibilityIdentifier("lengthIncrease")
      .disabled(model.length >= 21).frame(width: 40, height: 44)
    }
  }
  private func slider(
    _ title: String, key: WritableKeyPath<Calibration, Double>, range: ClosedRange<Double>,
    id: String, value: String
  ) -> some View {
    VStack(spacing: 4) {
      HStack {
        Text(title)
        Spacer()
        Text(value).monospacedDigit().accessibilityIdentifier("\(id)Readout")
      }.font(.system(size: 12))
      Slider(
        value: Binding(
          get: { model.calibration[keyPath: key] },
          set: { next in
            var copy = model.calibration
            copy[keyPath: key] = next
            copy.set(scale: copy.scale, x: copy.x, y: copy.y, tilt: copy.tilt)
            model.calibration = copy
          }), in: range
      )
      .accessibilityLabel(title).accessibilityIdentifier("\(id)Slider")
    }
  }
}

private struct PrimaryButton: ButtonStyle {
  let color: Color
  func makeBody(configuration: Configuration) -> some View {
    configuration.label.font(.system(size: 15, weight: .semibold))
      .foregroundStyle(.white).frame(maxWidth: .infinity, minHeight: 50)
      .background(
        color.opacity(configuration.isPressed ? 0.75 : 1), in: RoundedRectangle(cornerRadius: 14))
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
    override func layoutSubviews() {
      super.layoutSubviews()
      rotatePortrait()
    }
    func rotatePortrait() {
      guard let connection = preview.connection, connection.isVideoRotationAngleSupported(90) else {
        return
      }
      connection.videoRotationAngle = 90
      connection.automaticallyAdjustsVideoMirroring = false
      connection.isVideoMirrored = false
    }
  }
}
