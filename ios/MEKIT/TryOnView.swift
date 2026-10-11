import AVFoundation
import Combine
import SwiftUI
import TryOnCore

struct TryOnView: View {
  @StateObject private var model = PrototypeModel()
  @Environment(\.scenePhase) private var scenePhase
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
            Text("IPHONE · PROTOTYPE").font(.system(size: 10, weight: .medium)).tracking(1)
          }
          HStack(alignment: .bottom) {
            VStack(alignment: .leading, spacing: 5) {
              Text("001 EARTH").font(.system(size: 11, weight: .semibold)).tracking(2)
              Text("손목 추적 확인").font(.system(size: 25, weight: .semibold))
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 4) {
              Text("예정 판매가").font(.system(size: 10))
              Text("49,000원").font(.system(size: 15, weight: .medium))
            }
          }
          VStack(alignment: .leading, spacing: 8) {
            Text("실물 기반 착용 모델이 필요해요.").font(.system(size: 15, weight: .medium))
              .accessibilityIdentifier("physicalAssetUnavailable")
            Text("실물 사진·치수와 대조한 EARTH 모델을 확보하면 착용 모습을 보여 드릴게요.")
              .font(.system(size: 12)).foregroundStyle(.secondary)
              .fixedSize(horizontal: false, vertical: true)
          }.padding(16)
            .background(.white.opacity(0.6), in: RoundedRectangle(cornerRadius: 16))
          cameraSurface
            .frame(height: min(440, max(310, screen.size.height * 0.49)))
            .accessibilityElement(children: .contain)
            .accessibilityIdentifier("renderSurface")
          Text(model.status.text)
            .font(.system(size: 14, weight: .medium))
            .fixedSize(horizontal: false, vertical: true)
            .accessibilityIdentifier("captureStatus")
          actionButtons
          lengthSelection
          VStack(alignment: .leading, spacing: 8) {
            Text("지금은 손목 위치만 확인할 수 있어요.").fontWeight(.medium)
            Text("실물 확인 전의 임시 팔찌는 표시하지 않습니다. 카메라의 위치 안내는 손목 둘레나 착용감을 측정하지 않아요.")
            Text("영상은 저장하거나 전송하지 않습니다.")
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
        CameraPreview(session: model.camera.session)
        if let pose = model.pose {
          Path { path in
            let dx = cos(pose.angle) * pose.width / 2
            let dy = sin(pose.angle) * pose.width / 2
            path.move(to: CGPoint(x: pose.center.x - dx, y: pose.center.y - dy))
            path.addLine(to: CGPoint(x: pose.center.x + dx, y: pose.center.y + dy))
          }.stroke(.white, style: StrokeStyle(lineWidth: 2, dash: [6, 5]))
          Circle().stroke(.white, lineWidth: 2).frame(width: 12, height: 12)
            .position(x: pose.center.x, y: pose.center.y)
        } else {
          VStack(spacing: 14) {
            Image(systemName: "hand.raised").font(.system(size: 80, weight: .ultraLight))
            Text("반대편 손과 손목을\n함께 보여 주세요.")
              .font(.system(size: 14, weight: .medium)).multilineTextAlignment(.center)
          }
          .foregroundStyle(.white)
          .shadow(color: .black.opacity(0.5), radius: 6)
          .accessibilityHidden(true)
        }
        VStack {
          HStack {
            Text(model.pose == nil ? "추적 대기" : "손목 위치")
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
        Button(model.wantsCamera ? "추적 확인 중지" : "카메라로 손목 위치 확인") {
          if model.wantsCamera {
            model.pause()
          } else {
            model.startCamera()
          }
        }
        .accessibilityIdentifier("startCamera")
        .buttonStyle(PrimaryButton(color: olive))
      }
    }
  }
  private var lengthSelection: some View {
    VStack(alignment: .leading, spacing: 10) {
      HStack {
        Text("완성 길이 비교").font(.system(size: 14, weight: .medium))
        Spacer()
        Text(String(format: "%.1fcm", model.length)).monospacedDigit()
          .font(.system(size: 15, weight: .medium)).accessibilityIdentifier("lengthReadout")
      }
      HStack(spacing: 8) {
        ForEach(LengthSelection.studyLengths, id: \.self) { length in
          Button {
            model.length = length
          } label: {
            Text(String(format: "%.1fcm", length))
              .font(.system(size: 14, weight: .medium)).monospacedDigit()
              .frame(maxWidth: .infinity, minHeight: 44)
              .foregroundStyle(model.length == length ? .white : olive)
              .background(
                model.length == length ? olive : olive.opacity(0.08),
                in: RoundedRectangle(cornerRadius: 12))
          }.buttonStyle(.plain)
            .accessibilityIdentifier(String(format: "studyLength%.1f", length))
            .accessibilityValue(model.length == length ? "선택됨" : "선택 안 됨")
        }
      }
      Text("18cm 손목 기준의 비교 후보예요. 판매 사이즈는 미확정이며, 실물 착용 검증 후 확정합니다.")
        .font(.system(size: 11)).foregroundStyle(.secondary)
        .fixedSize(horizontal: false, vertical: true)
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
