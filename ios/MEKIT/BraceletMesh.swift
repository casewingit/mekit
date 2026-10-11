import MetalKit

struct BraceletVertex {
  var position: SIMD3<Float>
  var normal: SIMD3<Float>
  var color: SIMD4<Float>
}

enum BraceletMesh {
  // Procedural validation asset, not a reproduction of the missing original product board.
  static func bracelet() -> [BraceletVertex] {
    var vertices = surface(uSteps: 128, vSteps: 10, color: SIMD4(0.29, 0.34, 0.22, 0)) { u, v in
      let radius: Float = 1 + 0.019 * cos(v)
      return (
        SIMD3(radius * cos(u), 0.019 * sin(v), 0.58 * radius * sin(u)),
        simd_normalize(SIMD3(cos(v) * cos(u), sin(v), cos(v) * sin(u) / 0.58))
      )
    }
    let angles: [Float] = [-2.85, -2.25, -1.5, -0.88, -0.25, 0.48, 1.15, 1.85, 2.45]
    for (index, angle) in angles.enumerated() {
      let center = SIMD3<Float>(cos(angle), 0, 0.58 * sin(angle))
      let stone = index == 2 || index == 6
      let color: SIMD4<Float> = stone ? SIMD4(0.27, 0.29, 0.23, 2) : SIMD4(0.49, 0.34, 0.22, 1)
      vertices += sphere(center: center, radius: stone ? 0.095 : 0.082, color: color)
      if index == 1 || index == 5 {
        let spacerAngle = angle + 0.19
        vertices += sphere(
          center: SIMD3(cos(spacerAngle), 0, 0.58 * sin(spacerAngle)), radius: 0.036,
          color: SIMD4(0.66, 0.52, 0.28, 3))
      }
    }
    // Small fixed knot accents; no customer bead assembly controls.
    vertices += sphere(
      center: SIMD3(0.05, 0, -0.58), radius: 0.043, color: SIMD4(0.29, 0.34, 0.22, 0))
    vertices += sphere(
      center: SIMD3(-0.05, 0, -0.58), radius: 0.043, color: SIMD4(0.29, 0.34, 0.22, 0))
    return vertices
  }
  static func wristMask() -> [BraceletVertex] {
    surface(uSteps: 64, vSteps: 1, color: SIMD4(1, 1, 1, 0), vRange: 0...1) { angle, t in
      (
        SIMD3(0.86 * cos(angle), (t - 0.5) * 5, 0.46 * sin(angle)),
        simd_normalize(SIMD3(cos(angle) / 0.86, 0, sin(angle) / 0.46))
      )
    }
  }
  private static func sphere(center: SIMD3<Float>, radius: Float, color: SIMD4<Float>)
    -> [BraceletVertex]
  {
    surface(uSteps: 24, vSteps: 12, color: color, vRange: 0...Float.pi) { u, v in
      let normal = SIMD3<Float>(sin(v) * cos(u), cos(v), sin(v) * sin(u))
      return (center + radius * normal, normal)
    }
  }
  private static func surface(
    uSteps: Int, vSteps: Int, color: SIMD4<Float>,
    vRange: ClosedRange<Float> = 0...(2 * Float.pi),
    point: (Float, Float) -> (SIMD3<Float>, SIMD3<Float>)
  ) -> [BraceletVertex] {
    var vertices: [BraceletVertex] = []
    for i in 0..<uSteps {
      for j in 0..<vSteps {
        func vertex(_ du: Int, _ dv: Int) -> BraceletVertex {
          let u = Float(i + du) / Float(uSteps) * 2 * .pi
          let v =
            vRange.lowerBound + Float(j + dv) / Float(vSteps)
            * (vRange.upperBound - vRange.lowerBound)
          let sample = point(u, v)
          return BraceletVertex(position: sample.0, normal: sample.1, color: color)
        }
        let a = vertex(0, 0)
        let b = vertex(1, 0)
        let c = vertex(1, 1)
        let d = vertex(0, 1)
        vertices += [a, b, c, a, c, d]
      }
    }
    return vertices
  }
}
