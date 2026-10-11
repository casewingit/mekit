// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "TryOnCore",
    platforms: [.iOS(.v17), .macOS(.v13)],
    products: [.library(name: "TryOnCore", targets: ["TryOnCore"])],
    targets: [
        .target(name: "TryOnCore"),
        .testTarget(name: "TryOnCoreTests", dependencies: ["TryOnCore"])
    ]
)
