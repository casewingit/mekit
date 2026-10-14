import SwiftUI
import TryOnCore

@main
struct MEKITApp: App {
  var body: some Scene {
    WindowGroup { AppRootView() }
  }
}

struct AppRootView: View {
  @AppStorage("earthStudyLength") private var length = LengthSelection.referenceLength
  @AppStorage("earthSaved") private var saved = false
  @State private var tab = 0
  @StateObject private var photos = ProductPhotoStore()
  @StateObject private var models = ProductModelStore()

  var body: some View {
    TabView(selection: $tab) {
      NavigationStack { CollectionView(length: $length, saved: $saved, tab: $tab) }
        .tabItem { Label("컬렉션", systemImage: "square.grid.2x2") }.tag(0)
      NavigationStack { PhotoStudioView(store: photos, models: models, length: $length) }
        .tabItem { Label("스튜디오", systemImage: "viewfinder") }.tag(1)
      NavigationStack { LibraryView(store: photos, models: models, length: $length, saved: $saved, tab: $tab) }
        .tabItem { Label("보관함", systemImage: "bookmark") }.tag(2)
    }.tint(MEKITStyle.ink).foregroundStyle(MEKITStyle.ink).preferredColorScheme(.light)
      .onAppear { length = LengthSelection.restored(length) }
  }
}
