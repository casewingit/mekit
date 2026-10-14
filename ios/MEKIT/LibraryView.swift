import SwiftUI

struct LibraryView: View {
  @ObservedObject var store: ProductPhotoStore
  @ObservedObject var models: ProductModelStore
  @Binding var length: Double
  @Binding var saved: Bool
  @Binding var tab: Int
  @State private var privacy = false
  @State private var delete = false
  @State private var deleteModel = false
  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 24) {
        SectionEyebrow(text: "YOUR SELECTION / ON THIS IPHONE")
        Text("천천히 고른 것들.").font(.system(size: 30, weight: .medium)).tracking(-1)
        if saved {
          NavigationLink { EarthDetailView(length: $length, saved: $saved) } label: {
            HStack {
              VStack(alignment: .leading, spacing: 8) {
                Text("001 EARTH").font(.system(size: 23, weight: .medium, design: .serif))
                Text(String(format: "비교 후보 %.1fcm · 실물 준비 중", length))
                  .font(.system(size: 12)).foregroundStyle(MEKITStyle.muted)
              }
              Spacer()
              Image(systemName: "arrow.up.right")
            }.padding(20).background(.white, in: RoundedRectangle(cornerRadius: 18))
              .contentShape(Rectangle())
          }.buttonStyle(.plain)
        }
        if let photo = store.photo {
          VStack(alignment: .leading, spacing: 16) {
            Image(uiImage: photo).resizable().scaledToFit().frame(height: 220).frame(maxWidth: .infinity)
            Text("내 실물 사진").font(.system(size: 16, weight: .medium))
            Text("사진 스튜디오 참고 자료 · 2D")
              .font(.system(size: 12)).foregroundStyle(MEKITStyle.muted)
            if let date = store.date {
              Text(date, format: .dateTime.year().month().day()).font(.system(size: 11))
                .foregroundStyle(MEKITStyle.muted)
            }
            Button("스튜디오에서 열기") { tab = 1 }.buttonStyle(StudioButton(secondary: true))
            Button("사진 삭제", role: .destructive) { delete = true }
              .font(.system(size: 13)).accessibilityIdentifier("deletePhoto")
          }.padding(20).background(.white, in: RoundedRectangle(cornerRadius: 18))
        }
        if models.asset != nil {
          VStack(alignment: .leading, spacing: 14) {
            Label("내 실물 3D 모델", systemImage: "cube").font(.system(size: 16, weight: .medium))
            Text("스튜디오 참고 자료 · USDZ").font(.system(size: 12)).foregroundStyle(MEKITStyle.muted)
            Button("스튜디오에서 열기") { tab = 1 }.buttonStyle(StudioButton(secondary: true))
            Button("3D 모델 삭제", role: .destructive) { deleteModel = true }.font(.system(size: 13))
          }.padding(20).background(.white, in: RoundedRectangle(cornerRadius: 18))
        }
        if !saved && store.photo == nil && models.asset == nil {
          VStack(spacing: 16) {
            Image(systemName: "bookmark").font(.system(size: 40, weight: .ultraLight))
            Text("아직 보관한 자료가 없어요.").font(.system(size: 16, weight: .medium))
              .accessibilityIdentifier("libraryEmpty")
            Text("EARTH를 보관하거나,\n스튜디오에서 실물 사진을 가져와 보세요.")
              .font(.system(size: 13)).multilineTextAlignment(.center).foregroundStyle(MEKITStyle.muted)
          }.frame(maxWidth: .infinity).padding(.vertical, 55)
          Button("컬렉션 살펴보기") { tab = 0 }.buttonStyle(StudioButton())
        }
        Divider()
        Text("이 iPhone에만 보관됩니다. 계정 동기화나 외부 업로드는 사용하지 않습니다.")
          .font(.system(size: 12)).foregroundStyle(MEKITStyle.muted).lineSpacing(4)
        Button { privacy = true } label: {
          HStack { Label("개인정보와 미리보기 안내", systemImage: "lock"); Spacer(); Image(systemName: "chevron.right") }
            .font(.system(size: 13)).frame(minHeight: 44).contentShape(Rectangle())
        }.buttonStyle(.plain).accessibilityIdentifier("privacyInfo")
      }.padding(24)
    }.background(MEKITStyle.paper).navigationTitle("보관함").navigationBarTitleDisplayMode(.inline)
      .sheet(isPresented: $privacy) { PrivacyView() }
      .confirmationDialog("보관한 실물 사진을 삭제할까요?", isPresented: $delete, titleVisibility: .visible) {
        Button("사진 삭제", role: .destructive) {
          do { try store.remove() } catch { store.error = "사진을 삭제하지 못했어요. 다시 시도해 주세요." }
        }
      } message: { Text("원본과 배경 분리 결과를 앱에서 삭제합니다. 사진 보관함의 원본은 유지됩니다.") }
      .confirmationDialog("보관한 3D 모델을 삭제할까요?", isPresented: $deleteModel, titleVisibility: .visible) {
        Button("3D 모델 삭제", role: .destructive) {
          do { try models.remove() } catch { store.error = "모델을 삭제하지 못했어요. 다시 시도해 주세요." }
        }
      }
      .alert("보관함 안내", isPresented: Binding(get: { store.error != nil }, set: { if !$0 { store.error = nil } })) {
        Button("확인") { store.error = nil }
      } message: { Text(store.error ?? "") }
  }
}

struct PrivacyView: View {
  @Environment(\.dismiss) private var dismiss
  var body: some View {
    NavigationStack {
      ScrollView {
        VStack(alignment: .leading, spacing: 24) {
          SectionEyebrow(text: "MEKIT / PRIVACY & PREVIEW")
          Text("사진은 기기에,\n선택은 나에게.").font(.system(size: 30, weight: .medium))
            .accessibilityIdentifier("privacyTitle")
          section("카메라", "카메라 영상은 저장하거나 전송하지 않습니다.")
          section("사진", "직접 고른 사진만 가져옵니다. 배경 분리는 기기 안에서 처리합니다. 보관한 원본과 표시 결과는 앱의 저장 공간에 남으며 보관함에서 삭제할 수 있습니다. 기기 백업에는 포함될 수 있습니다.")
          section("미리보기", "사진 배치는 색과 화면상의 인상을 확인하는 2D 참고 기능입니다. 실제 조임·촉감·둘레·손목 뒤 가림을 재현하지 않습니다. 길이 비교 값도 실물 검증 전 후보입니다.")
          section("3D 모델", "직접 가져와 확인한 USDZ만 기기에 보관합니다. 손목 위치와 방향은 2D 추적이며 가림은 원통형 근사입니다. 실제 깊이·손목 형상·둘레를 측정하지 않습니다. 보관함에서 모델을 삭제할 수 있습니다.")
          section("EARTH", "실물 샘플과 실제 제품 모델이 아직 없습니다. 다른 브랜드나 사용자가 가져온 사진을 MEKIT의 제품으로 표시하지 않습니다.")
          section("현재 버전", "iPhone 기술 검증 앱입니다. 주문·결제·계정 기능은 제공하지 않습니다. 실물 EARTH 자산 대조·실기기 착용 검증·App Store 배포는 아직 진행하지 않았습니다.")
        }.padding(24)
      }.background(MEKITStyle.paper).navigationTitle("앱 안내").navigationBarTitleDisplayMode(.inline)
        .toolbar { ToolbarItem(placement: .confirmationAction) { Button("닫기") { dismiss() } } }
    }
  }
  private func section(_ title: String, _ text: String) -> some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(title).font(.system(size: 16, weight: .semibold))
      Text(text).font(.system(size: 14)).lineSpacing(5).foregroundStyle(MEKITStyle.muted)
    }
  }
}
