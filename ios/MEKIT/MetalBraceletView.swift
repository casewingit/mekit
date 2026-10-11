import MetalKit
import SwiftUI
import TryOnCore

struct BraceletRenderState {
  var pose: ScreenPose?
  var calibration: Calibration
  var length: Double
  var occlusion: Bool
}

struct MetalBraceletView: UIViewRepresentable {
  let state: BraceletRenderState
  var onFailure: (String) -> Void
  func makeCoordinator() -> Coordinator { Coordinator() }
  func makeUIView(context: Context) -> MTKView {
    let view = MTKView(frame: .zero, device: MTLCreateSystemDefaultDevice())
    view.isOpaque = false
    view.backgroundColor = .clear
    view.clearColor = MTLClearColor(red: 0, green: 0, blue: 0, alpha: 0)
    view.colorPixelFormat = .bgra8Unorm
    view.depthStencilPixelFormat = .depth32Float
    view.preferredFramesPerSecond = 30
    view.isUserInteractionEnabled = false
    do {
      let renderer = try MetalBraceletRenderer(view: view)
      renderer.state = state
      context.coordinator.renderer = renderer
      view.delegate = renderer
    } catch {
      DispatchQueue.main.async { onFailure("이 기기에서 3D 표시를 준비하지 못했습니다.") }
    }
    return view
  }
  func updateUIView(_ view: MTKView, context: Context) {
    context.coordinator.renderer?.state = state
  }
  static func dismantleUIView(_ view: MTKView, coordinator: Coordinator) {
    view.isPaused = true
    view.delegate = nil
    coordinator.renderer = nil
  }
  final class Coordinator { var renderer: MetalBraceletRenderer? }
}

final class MetalBraceletRenderer: NSObject, MTKViewDelegate {
  var state = BraceletRenderState(
    pose: nil, calibration: Calibration(), length: 17.5, occlusion: true)
  private let queue: MTLCommandQueue
  private let braceletPipeline: MTLRenderPipelineState
  private let maskPipeline: MTLRenderPipelineState
  private let depth: MTLDepthStencilState
  private let bracelet: MTLBuffer
  private let mask: MTLBuffer
  private let braceletCount: Int
  private let maskCount: Int
  private struct Uniforms {
    var projection: simd_float4x4
    var model: simd_float4x4
  }

  init(view: MTKView) throws {
    guard let device = view.device, let queue = device.makeCommandQueue(),
      let library = device.makeDefaultLibrary(),
      let vertex = library.makeFunction(name: "braceletVertex"),
      let fragment = library.makeFunction(name: "braceletFragment")
    else { throw RenderError.unavailable }
    self.queue = queue
    func pipeline(maskOnly: Bool) throws -> MTLRenderPipelineState {
      let descriptor = MTLRenderPipelineDescriptor()
      descriptor.vertexFunction = vertex
      descriptor.fragmentFunction = fragment
      descriptor.colorAttachments[0].pixelFormat = view.colorPixelFormat
      descriptor.colorAttachments[0].writeMask = maskOnly ? [] : .all
      descriptor.depthAttachmentPixelFormat = view.depthStencilPixelFormat
      return try device.makeRenderPipelineState(descriptor: descriptor)
    }
    braceletPipeline = try pipeline(maskOnly: false)
    maskPipeline = try pipeline(maskOnly: true)
    let depthDescriptor = MTLDepthStencilDescriptor()
    depthDescriptor.depthCompareFunction = .lessEqual
    depthDescriptor.isDepthWriteEnabled = true
    guard let depth = device.makeDepthStencilState(descriptor: depthDescriptor) else {
      throw RenderError.unavailable
    }
    self.depth = depth
    let braceletVertices = BraceletMesh.bracelet()
    let maskVertices = BraceletMesh.wristMask()
    braceletCount = braceletVertices.count
    maskCount = maskVertices.count
    guard
      let bracelet = device.makeBuffer(
        bytes: braceletVertices, length: braceletCount * MemoryLayout<BraceletVertex>.stride),
      let mask = device.makeBuffer(
        bytes: maskVertices, length: maskCount * MemoryLayout<BraceletVertex>.stride)
    else { throw RenderError.unavailable }
    self.bracelet = bracelet
    self.mask = mask
    super.init()
  }
  func mtkView(_ view: MTKView, drawableSizeWillChange size: CGSize) {}
  func draw(in view: MTKView) {
    guard let pass = view.currentRenderPassDescriptor, let drawable = view.currentDrawable,
      let command = queue.makeCommandBuffer(),
      let encoder = command.makeRenderCommandEncoder(descriptor: pass)
    else { return }
    encoder.setDepthStencilState(depth)
    encoder.setCullMode(.none)
    if let pose = state.pose, view.bounds.width > 0, view.bounds.height > 0,
      LengthSelection.accepts(state.length)
    {
      let width = Float(view.bounds.width)
      let height = Float(view.bounds.height)
      let projection = simd_float4x4(
        columns: (
          SIMD4(2 / width, 0, 0, 0), SIMD4(0, 2 / height, 0, 0),
          SIMD4(0, 0, -1 / 2000, 0), SIMD4(0, 0, 0.5, 1)
        ))
      let calibration = state.calibration
      let center = SIMD3<Float>(
        Float(pose.center.x + calibration.x * pose.width) - width / 2,
        height / 2 - Float(pose.center.y + calibration.y * pose.width), 0)
      let rotation =
        simd_float4x4(simd_quatf(angle: -Float(pose.angle), axis: SIMD3(0, 0, 1)))
        * simd_float4x4(
          simd_quatf(angle: 0.35 + Float(calibration.tilt) * .pi / 180, axis: SIMD3(1, 0, 0)))
      func model(scale: Float) -> simd_float4x4 {
        var translation = matrix_identity_float4x4
        translation.columns.3 = SIMD4(center, 1)
        var scaling = matrix_identity_float4x4
        scaling.columns.0.x = scale
        scaling.columns.1.y = scale
        scaling.columns.2.z = scale
        return translation * rotation * scaling
      }
      func render(_ buffer: MTLBuffer, count: Int, pipeline: MTLRenderPipelineState, scale: Float) {
        var uniforms = Uniforms(projection: projection, model: model(scale: scale))
        encoder.setRenderPipelineState(pipeline)
        encoder.setVertexBuffer(buffer, offset: 0, index: 0)
        encoder.setVertexBytes(&uniforms, length: MemoryLayout<Uniforms>.stride, index: 1)
        encoder.drawPrimitives(type: .triangle, vertexStart: 0, vertexCount: count)
      }
      let scale = Float(pose.width * calibration.scale / 2)
      if state.occlusion { render(mask, count: maskCount, pipeline: maskPipeline, scale: scale) }
      render(
        bracelet, count: braceletCount, pipeline: braceletPipeline,
        scale: scale * Float(state.length / 17.5))
    }
    encoder.endEncoding()
    command.present(drawable)
    command.commit()
  }
  private enum RenderError: Error { case unavailable }
}
