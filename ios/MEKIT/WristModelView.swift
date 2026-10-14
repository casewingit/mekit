import SceneKit
import SwiftUI
import TryOnCore

struct WristModelView: UIViewRepresentable {
  let asset: ProductModelAsset
  let pose: ScreenPose?
  let calibration: Calibration
  let viewport: CGSize
  var occlusion: Bool

  func makeCoordinator() -> Coordinator { Coordinator(asset: asset) }
  func makeUIView(context: Context) -> SCNView {
    let view = SCNView()
    view.backgroundColor = .clear
    view.isOpaque = false
    view.scene = context.coordinator.scene
    view.pointOfView = context.coordinator.camera
    view.autoenablesDefaultLighting = true
    view.antialiasingMode = .multisampling4X
    view.isUserInteractionEnabled = false
    return view
  }
  func updateUIView(_ view: SCNView, context: Context) {
    context.coordinator.update(pose: pose, calibration: calibration, viewport: viewport, occlusion: occlusion)
  }
  final class Coordinator {
    let scene = SCNScene()
    let camera = SCNNode()
    let anchor = SCNNode()
    let product = SCNNode()
    let mask: SCNNode
    func update(pose: ScreenPose?, calibration: Calibration, viewport: CGSize, occlusion: Bool) {
      camera.camera?.orthographicScale = max(1, viewport.height / 2)
      guard let placement = PhotoPlacement.make(pose: pose, calibration: calibration, aspectRatio: 1) else {
        anchor.isHidden = true
        return
      }
      SCNTransaction.begin()
      SCNTransaction.animationDuration = 0
      anchor.isHidden = false
      anchor.position = SCNVector3(
        Float(placement.center.x - viewport.width / 2),
        Float(viewport.height / 2 - placement.center.y), 0)
      anchor.eulerAngles.z = Float(-placement.angle)
      product.scale = SCNVector3(Float(placement.width), Float(placement.width), Float(placement.width))
      let width = Float(pose?.width ?? 1)
      mask.scale = SCNVector3(width, width, width * 0.65)
      mask.isHidden = !occlusion
      SCNTransaction.commit()
    }
    init(asset: ProductModelAsset) {
      camera.camera = SCNCamera()
      camera.camera?.usesOrthographicProjection = true
      camera.camera?.zNear = 1
      camera.camera?.zFar = 3000
      camera.position = SCNVector3(0, 0, 1500)
      scene.rootNode.addChildNode(camera)
      scene.rootNode.addChildNode(anchor)
      product.addChildNode(asset.node.clone())
      anchor.addChildNode(product)
      // A depth-only wrist volume is an adjustable visual approximation, not measured geometry.
      let cylinder = SCNCylinder(radius: 0.46, height: 2.5)
      let material = SCNMaterial()
      material.colorBufferWriteMask = []
      material.writesToDepthBuffer = true
      material.readsFromDepthBuffer = true
      material.isDoubleSided = true
      cylinder.materials = [material]
      mask = SCNNode(geometry: cylinder)
      mask.renderingOrder = -10
      anchor.addChildNode(mask)
      anchor.isHidden = true
    }
  }
}

struct ModelReviewView: View {
  @ObservedObject var models: ProductModelStore
  let asset: ProductModelAsset
  @Environment(\.dismiss) private var dismiss
  @State private var confirmed = false
  @State private var message: String?
  private var scene: SCNScene {
    let scene = SCNScene()
    scene.rootNode.addChildNode(asset.node.clone())
    return scene
  }
  var body: some View {
    NavigationStack {
      ScrollView {
        VStack(alignment: .leading, spacing: 22) {
          SectionEyebrow(text: "IMPORTED MODEL / REVIEW")
          Text("실물 모델 확인").font(.system(size: 28, weight: .medium))
          SceneView(scene: scene, options: [.allowsCameraControl, .autoenablesDefaultLighting])
            .frame(height: 310).clipShape(RoundedRectangle(cornerRadius: 20))
          Text("화면을 돌려 실물 사진과 형태·배열·텍스처를 비교하세요. 손목을 감싸는 고리는 X–Z 평면, 팔 길이는 Y 방향인 모델을 사용합니다.")
            .font(.system(size: 13)).foregroundStyle(MEKITStyle.muted).lineSpacing(4)
          Text("가져온 모델은 스튜디오 참고 자료입니다. EARTH 제품으로 등록하거나 실제 치수를 확정하지 않습니다. 카메라의 가림은 손목 형상을 근사합니다.")
            .font(.system(size: 12)).foregroundStyle(MEKITStyle.muted)
          Toggle("실물에 근거한 모델이며 표시 결과를 확인했어요.", isOn: $confirmed).font(.system(size: 13))
          if let message { Text(message).font(.system(size: 12)).foregroundStyle(.red) }
          Button("이 모델 보관하기") {
            do { try models.accept(); dismiss() }
            catch { message = "모델을 저장하지 못했어요. 저장 공간을 확인해 주세요." }
          }.buttonStyle(StudioButton()).disabled(!confirmed).opacity(confirmed ? 1 : 0.45)
        }.padding(24)
      }.background(MEKITStyle.paper).navigationTitle("3D 확인").navigationBarTitleDisplayMode(.inline)
        .toolbar { ToolbarItem(placement: .cancellationAction) {
          Button("취소") { models.cancelPending(); dismiss() }
        } }
        .onDisappear { models.cancelPending() }
    }
  }
}
