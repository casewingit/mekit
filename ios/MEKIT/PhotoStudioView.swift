import PhotosUI
import SwiftUI
import UniformTypeIdentifiers

struct PhotoStudioView: View {
  @ObservedObject var store: ProductPhotoStore
  @ObservedObject var models: ProductModelStore
  @Binding var length: Double
  @State private var camera = false
  @State private var sourceMenu = false
  @State private var photosPicker = false
  @State private var filePicker = false
  @State private var importingModel = false
  @State private var selectedFileURL: URL?
  @State private var selection: PhotosPickerItem?
  @State private var draft: PhotoDraft?
  @State private var loading = false
  @State private var revision = 0

  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 24) {
        SectionEyebrow(text: "MEKIT / PHOTO STUDIO")
        Text("내 손목 위에서.").font(.system(size: 32, weight: .medium)).tracking(-1)
        Text("실물 사진으로 색과 존재감을 가볍게 살펴보세요.")
          .font(.system(size: 14)).foregroundStyle(MEKITStyle.muted).lineSpacing(5)
        photoCard
        VStack(alignment: .leading, spacing: 12) {
          step("01", "실물 사진 가져오기", "정면 사진이나 배경이 투명한 PNG가 좋아요.")
          step("02", "배경과 제품 확인하기", "배경 분리 후 제품이 잘리지 않았는지 확인하세요.")
          step("03", "손목 위에 배치하기", "크기·위치·각도를 화면에서 조정하세요.")
        }
        Button { sourceMenu = true } label: {
          if loading { ProgressView().tint(.white) }
          else { Label(store.photo == nil ? "실물 사진 가져오기" : "사진 바꾸기", systemImage: "plus") }
        }.buttonStyle(StudioButton()).disabled(loading || models.loading).accessibilityIdentifier("importPhoto")
        Button { camera = true } label: {
          Label(models.asset != nil ? "카메라에서 3D 모델 확인" : (store.photo == nil ? "손목 추적 먼저 확인" : "카메라에서 사진 배치"), systemImage: "viewfinder")
        }.buttonStyle(StudioButton(secondary: true)).accessibilityIdentifier("openTracking")
        Text("사진 스튜디오는 2D 참고 미리보기입니다. 제품 뒷면·손목 뒤 가림·실제 둘레와 착용감은 표현하지 않습니다. 가져온 사진은 EARTH 제품으로 등록되지 않아요.")
          .font(.system(size: 12)).foregroundStyle(MEKITStyle.muted).lineSpacing(4)
        Divider()
        SectionEyebrow(text: "REAL MODEL / 3D STUDY")
        Text(models.asset == nil ? "실물 3D 모델이 있다면." : "보관한 실물 3D 모델")
          .font(.system(size: 20, weight: .medium))
        Text("텍스처가 포함된 USDZ를 가져와 입체 표시와 손목 뒤 가림 근사를 확인할 수 있습니다. 손의 2D 위치를 사용하며 실제 손목 형상이나 둘레를 측정하지 않습니다.")
          .font(.system(size: 12)).foregroundStyle(MEKITStyle.muted).lineSpacing(4)
        Button { importingModel = true; filePicker = true } label: {
          if models.loading { ProgressView() }
          else { Label(models.asset == nil ? "실물 3D 모델 가져오기" : "3D 모델 바꾸기", systemImage: "cube") }
        }.buttonStyle(StudioButton(secondary: true)).disabled(models.loading || loading)
          .accessibilityIdentifier("importModel")
      }.padding(24)
    }.safeAreaPadding(.bottom, 24).accessibilityIdentifier("studioScroll")
      .background(MEKITStyle.paper).navigationTitle("스튜디오").navigationBarTitleDisplayMode(.inline)
      .confirmationDialog("실물 사진 가져오기", isPresented: $sourceMenu, titleVisibility: .visible) {
        Button("사진 보관함에서 선택") { photosPicker = true }
        Button("파일에서 선택") { importingModel = false; filePicker = true }
      }
      .photosPicker(isPresented: $photosPicker, selection: $selection, matching: .images)
      .fullScreenCover(isPresented: $filePicker, onDismiss: {
        guard let url = selectedFileURL else { return }
        selectedFileURL = nil
        if importingModel { Task { await models.stage(url) } }
        else { importFile(url) }
      }) {
        ReferenceFilePicker(types: importingModel ? [.usdz] : [.png, .jpeg, .heic], onSelect: { url in
          selectedFileURL = url
          filePicker = false
        }, onCancel: { filePicker = false })
      }
      .onChange(of: selection) { _, item in
        guard let item else { return }
        revision += 1
        let run = revision
        loading = true
        Task {
          do {
            guard let data = try await item.loadTransferable(type: Data.self) else { throw PhotoError.invalidImage }
            try await prepare(data, run: run)
          } catch { if run == revision { store.error = error.localizedDescription } }
          if run == revision { loading = false; selection = nil }
        }
      }
      .sheet(item: $draft) { value in
        PhotoReviewView(original: value.image, store: store)
      }
      .sheet(isPresented: Binding(get: { models.pending != nil }, set: { if !$0 { models.cancelPending() } })) {
        if let pending = models.pending { ModelReviewView(models: models, asset: pending) }
      }
      .onChange(of: models.error) { _, value in
        if let value { store.error = value; models.error = nil }
      }
      .fullScreenCover(isPresented: $camera) { TryOnView(length: $length, photo: store.photo, asset: models.asset) }
      .alert("사진을 확인해 주세요", isPresented: Binding(
        get: { store.error != nil }, set: { if !$0 { store.error = nil } })) {
          Button("확인") { store.error = nil }
        } message: { Text(store.error ?? "") }
  }

  private var photoCard: some View {
    ZStack {
      RoundedRectangle(cornerRadius: 22).fill(.white.opacity(0.8))
      if let photo = store.photo {
        Image(uiImage: photo).resizable().scaledToFit().padding(24)
          .accessibilityLabel("가져온 실물 사진").accessibilityIdentifier("storedPhoto")
      } else {
        VStack(spacing: 16) {
          Image(systemName: "photo.badge.plus").font(.system(size: 48, weight: .ultraLight))
          Text("실물 사진을 기다리고 있어요.").font(.system(size: 15, weight: .medium))
            .accessibilityIdentifier("studioEmpty")
          Text("임시로 만든 제품은 표시하지 않습니다.")
            .font(.system(size: 12)).foregroundStyle(MEKITStyle.muted)
        }
      }
    }.frame(height: 270)
  }

  private func step(_ number: String, _ title: String, _ text: String) -> some View {
    HStack(alignment: .top, spacing: 14) {
      Text(number).font(.system(size: 12)).foregroundStyle(MEKITStyle.muted).padding(.top, 2)
      VStack(alignment: .leading, spacing: 5) {
        Text(title).font(.system(size: 14, weight: .medium))
        Text(text).font(.system(size: 12)).foregroundStyle(MEKITStyle.muted)
      }
    }
  }

  private func importFile(_ url: URL) {
    revision += 1
    let run = revision
    loading = true
    Task {
      let accessed = url.startAccessingSecurityScopedResource()
      defer { if accessed { url.stopAccessingSecurityScopedResource() } }
      do {
        let size = try url.resourceValues(forKeys: [.fileSizeKey]).fileSize ?? 0
        guard size <= PhotoProcessor.maxBytes else { throw PhotoError.tooLarge }
        let data = try Data(contentsOf: url)
        try await prepare(data, run: run)
      } catch { if run == revision { store.error = error.localizedDescription } }
      if run == revision { loading = false }
    }
  }

  private func prepare(_ data: Data, run: Int) async throws {
    let image = try await Task.detached(priority: .userInitiated) {
      try PhotoProcessor.cropTransparency(PhotoProcessor.decode(data))
    }.value
    guard run == revision else { return }
    draft = PhotoDraft(image: image)
  }
}

private struct PhotoDraft: Identifiable {
  let id = UUID()
  let image: UIImage
}

private struct PhotoReviewView: View {
  let original: UIImage
  @ObservedObject var store: ProductPhotoStore
  @Environment(\.dismiss) private var dismiss
  @State private var cutout: UIImage?
  @State private var useCutout = true
  @State private var working = false
  @State private var message: String?
  @State private var confirmed = false
  @State private var task: Task<Void, Never>?

  var body: some View {
    NavigationStack {
      ScrollView {
        VStack(alignment: .leading, spacing: 22) {
          SectionEyebrow(text: "REAL PHOTO / REVIEW")
          Text("사진 그대로,\n제품 그대로.").font(.system(size: 30, weight: .medium))
          Image(uiImage: useCutout ? (cutout ?? original) : original)
            .resizable().scaledToFit().frame(maxWidth: .infinity).frame(height: 300).padding(20)
            .background(.white, in: RoundedRectangle(cornerRadius: 20))
          if let message { Text(message).font(.system(size: 13)).foregroundStyle(MEKITStyle.muted) }
          if cutout != nil {
            Toggle("배경 분리 결과 사용", isOn: $useCutout).font(.system(size: 14))
          }
          Button { separateBackground() } label: {
            if working { ProgressView() }
            else { Label("기기에서 배경 분리", systemImage: "sparkle") }
          }.buttonStyle(StudioButton(secondary: true)).disabled(working)
          Text("배경 분리는 사진의 일부를 놓칠 수 있어요. 비즈·체인·잠금장치가 모두 남았는지 확인하세요. 화면에 보이는 결과만 보관합니다.")
            .font(.system(size: 12)).foregroundStyle(MEKITStyle.muted).lineSpacing(4)
          Toggle("실물 제품 사진이며, 표시된 결과를 확인했어요.", isOn: $confirmed)
            .font(.system(size: 13)).accessibilityIdentifier("confirmPhoto")
          Button {
            do {
              try store.save(original: original, display: useCutout ? (cutout ?? original) : original,
                             backgroundRemoved: useCutout && cutout != nil)
              dismiss()
            } catch { message = "사진을 보관하지 못했어요. 저장 공간을 확인하고 다시 시도해 주세요." }
          } label: { Text("이 사진 보관하기") }
            .buttonStyle(StudioButton()).disabled(!confirmed || working)
            .opacity(!confirmed || working ? 0.45 : 1).accessibilityIdentifier("savePhoto")
        }.padding(24)
      }.background(MEKITStyle.paper).navigationTitle("사진 확인").navigationBarTitleDisplayMode(.inline)
        .toolbar { ToolbarItem(placement: .cancellationAction) { Button("취소") { dismiss() } } }
        .onDisappear { task?.cancel() }
    }
  }

  private func separateBackground() {
    working = true
    message = nil
    task = Task {
      do {
        let value = try await Task.detached(priority: .userInitiated) {
          try PhotoProcessor.removeBackground(original)
        }.value
        guard !Task.isCancelled else { return }
        cutout = value
        useCutout = true
        confirmed = false
      } catch {
        guard !Task.isCancelled else { return }
        message = "배경을 분리하지 못했어요. 원본이나 투명 PNG로 계속할 수 있습니다."
      }
      working = false
    }
  }
}
