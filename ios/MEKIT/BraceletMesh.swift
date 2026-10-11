import MetalKit

struct BraceletVertex {
  var position: SIMD3<Float>
  var normal: SIMD3<Float>
  var color: SIMD4<Float>
}

enum BraceletMesh {
  // Issue #2 proportions only. Missing original board and real mesh remain release dependencies.
  // A ~200mm ellipse gives roughly 40mm per unit: cord ~1.9mm, beads ~6mm,
  // one clasp ~18x7.6mm. These are visual targets, not manufacturing dimensions.
  static func bracelet() -> [BraceletVertex] {
    let olive = SIMD4<Float>(0.25, 0.30, 0.18, 0)
    // Leave one opening for the clasp, rather than threading a closed cord through it.
    var vertices = surface(
      uSteps: 128, vSteps: 10, color: olive,
      uRange: (Float.pi / 2 + 0.23)...(Float.pi * 2.5 - 0.23)
    ) { u, v in
      let outward = simd_normalize(SIMD3<Float>(cos(u), 0, sin(u) / 0.58))
      let normal = outward * cos(v) + SIMD3<Float>(0, sin(v), 0)
      return (SIMD3(cos(u), 0, 0.58 * sin(u)) + 0.024 * normal, normal)
    }
    let angles: [Float] = [2.12, 2.77, 3.42, 4.07, 4.72, 5.37, 6.02, 6.67, 7.32]
    for (index, angle) in angles.enumerated() {
      let center = SIMD3<Float>(cos(angle), 0, 0.58 * sin(angle))
      let stone = index == 2 || index == 6
      let color: SIMD4<Float> = stone ? SIMD4(0.27, 0.29, 0.23, 2) : SIMD4(0.49, 0.34, 0.22, 1)
      vertices += sphere(center: center, radius: stone ? 0.082 : 0.075, color: color)
      if index == 1 || index == 5 {
        let spacerAngle = angle + 0.19
        vertices += sphere(
          center: SIMD3(cos(spacerAngle), 0, 0.58 * sin(spacerAngle)), radius: 0.032,
          color: SIMD4(0.66, 0.52, 0.28, 3))
      }
    }
    // A single two-piece cylindrical clasp. The joint seam is not a second clasp.
    let silver = SIMD4<Float>(0.65, 0.67, 0.66, 4)
    vertices += cylinder(
      center: SIMD3(0, 0, 0.566), radius: 0.095, halfLength: 0.225,
      color: silver)
    vertices += cylinder(
      center: SIMD3(0, 0, 0.566), radius: 0.0955, halfLength: 0.006,
      color: SIMD4(0.28, 0.30, 0.29, 4))
    // Compact fixed knot accents. A procedural approximation, not a verified traditional knot.
    for side: Float in [-1, 1] {
      for coil in -1...1 {
        let center = SIMD3<Float>(side * 0.30 + Float(coil) * 0.023, 0, 0.554)
        vertices += surface(uSteps: 24, vSteps: 8, color: olive) { u, v in
          let normal = SIMD3<Float>(sin(v), cos(v) * cos(u), cos(v) * sin(u))
          return (
            center + SIMD3(0, 0.034 * cos(u), 0.034 * sin(u)) + 0.014 * normal,
            normal
          )
        }
      }
    }
    return vertices
  }
  private static func cylinder(
    center: SIMD3<Float>, radius: Float, halfLength: Float,
    color: SIMD4<Float>
  ) -> [BraceletVertex] {
    var vertices = surface(uSteps: 40, vSteps: 1, color: color, vRange: -halfLength...halfLength) {
      u, x in
      let normal = SIMD3<Float>(0, cos(u), sin(u))
      return (center + SIMD3(x, radius * cos(u), radius * sin(u)), normal)
    }
    for side: Float in [-1, 1] {
      vertices += surface(uSteps: 40, vSteps: 1, color: color, vRange: 0...radius) { u, r in
        (center + SIMD3(side * halfLength, r * cos(u), r * sin(u)), SIMD3(side, 0, 0))
      }
    }
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
    uRange: ClosedRange<Float> = 0...(2 * Float.pi),
    vRange: ClosedRange<Float> = 0...(2 * Float.pi),
    point: (Float, Float) -> (SIMD3<Float>, SIMD3<Float>)
  ) -> [BraceletVertex] {
    var vertices: [BraceletVertex] = []
    for i in 0..<uSteps {
      for j in 0..<vSteps {
        func vertex(_ du: Int, _ dv: Int) -> BraceletVertex {
          let u =
            uRange.lowerBound + Float(i + du) / Float(uSteps)
            * (uRange.upperBound - uRange.lowerBound)
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
