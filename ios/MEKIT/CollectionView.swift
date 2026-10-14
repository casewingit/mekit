import SwiftUI

struct CollectionView: View {
  @Binding var length: Double
  @Binding var saved: Bool
  @Binding var tab: Int

  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 28) {
        HStack(alignment: .firstTextBaseline) {
          Text("MEKIT").font(.system(size: 29, weight: .medium, design: .serif)).tracking(3)
          Spacer()
          Text("Make it your own.").font(.system(size: 10)).foregroundStyle(MEKITStyle.muted)
        }
        VStack(alignment: .leading, spacing: 10) {
          SectionEyebrow(text: "MODERN CRAFT / EDITION 001")
          Text("일상에 남는\n작은 존재감.")
            .font(.system(size: 34, weight: .medium)).tracking(-1)
            .fixedSize(horizontal: false, vertical: true)
          Text("완성된 디자인을 고르고,\n내 손목에서 천천히 확인하세요.")
            .font(.system(size: 14)).foregroundStyle(MEKITStyle.muted).lineSpacing(5)
        }
        NavigationLink {
          EarthDetailView(length: $length, saved: $saved)
        } label: {
          VStack(alignment: .leading, spacing: 0) {
            EarthEditorialCard()
            HStack(alignment: .top) {
              VStack(alignment: .leading, spacing: 6) {
                Text("001 EARTH").font(.system(size: 21, weight: .medium, design: .serif))
                Text("WOOD · STONE · OLIVE CORD")
                  .font(.system(size: 9, weight: .medium)).tracking(1)
                  .foregroundStyle(MEKITStyle.muted)
              }
              Spacer()
              Image(systemName: "arrow.up.right").font(.system(size: 20, weight: .light))
            }.padding(.top, 18)
          }.contentShape(Rectangle())
        }.buttonStyle(.plain).accessibilityIdentifier("earthDetail")
        Divider()
        Button { tab = 1 } label: {
          HStack(spacing: 16) {
            Image(systemName: "viewfinder").font(.system(size: 27, weight: .light))
            VStack(alignment: .leading, spacing: 5) {
              Text("내 손목에서 확인하기").font(.system(size: 16, weight: .medium))
              Text("실물 사진을 가져와 2D로 배치해 보세요.")
                .font(.system(size: 12)).foregroundStyle(MEKITStyle.muted)
            }
            Spacer()
            Image(systemName: "arrow.right").font(.system(size: 14))
          }.padding(.vertical, 4).contentShape(Rectangle())
        }.buttonStyle(.plain)
        SectionEyebrow(text: "DESIGNED TO BE WORN. MADE TO BE YOURS.")
      }.padding(24)
    }.background(MEKITStyle.paper).toolbar(.hidden, for: .navigationBar)
  }
}

private struct EarthEditorialCard: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 18) {
      HStack {
        Text("EARTH").font(.system(size: 11, weight: .medium)).tracking(4)
        Spacer()
        Image(systemName: "arrow.down.right").font(.system(size: 18, weight: .light))
      }
      Text("001").font(.system(size: 110, weight: .regular, design: .serif)).tracking(-5)
        .minimumScaleFactor(0.5).lineLimit(1)
      Rectangle().fill(.white.opacity(0.3)).frame(height: 1)
      HStack(alignment: .top) {
        Text("자연의 재료,\n여백 있는 비율.").font(.system(size: 16, weight: .regular)).lineSpacing(5)
        Spacer()
        Text("실물 공개 준비 중").font(.system(size: 10, weight: .medium))
          .padding(.horizontal, 10).padding(.vertical, 8)
          .overlay(Capsule().stroke(.white.opacity(0.3)))
      }
    }.padding(26).foregroundStyle(.white)
      .frame(maxWidth: .infinity, alignment: .leading)
      .background(MEKITStyle.ink, in: RoundedRectangle(cornerRadius: 22))
  }
}

struct EarthDetailView: View {
  @Binding var length: Double
  @Binding var saved: Bool
  @State private var camera = false
  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 26) {
        EarthEditorialCard()
        HStack(alignment: .top) {
          VStack(alignment: .leading, spacing: 9) {
            SectionEyebrow(text: "THE FIRST EDITION")
            Text("001 EARTH").font(.system(size: 33, weight: .medium, design: .serif))
              .accessibilityIdentifier("earthProductTitle")
            Text("예정 판매가 49,000원 · VAT 포함").font(.system(size: 13))
          }
          Spacer()
          Button { saved.toggle() } label: {
            Image(systemName: saved ? "bookmark.fill" : "bookmark")
              .font(.system(size: 20)).frame(width: 44, height: 44)
          }.accessibilityLabel(saved ? "EARTH 보관 해제" : "EARTH 보관")
            .accessibilityIdentifier("saveEarth").buttonStyle(.plain)
        }
        Text("우드와 천연석 사이에 여백을 두고, 슬림한 올리브 코드로 연결한 첫 번째 브레이슬릿입니다.")
          .font(.system(size: 15)).lineSpacing(6).foregroundStyle(MEKITStyle.muted)
        Divider()
        LengthPicker(length: $length)
        VStack(alignment: .leading, spacing: 8) {
          Text("실물 기반 착용 모델이 필요해요.").font(.system(size: 14, weight: .medium))
            .accessibilityIdentifier("physicalAssetUnavailable")
          Text("EARTH는 실물 샘플을 준비 중입니다. 실제 제품 사진과 3D 모델을 확인한 후 착용 미리보기를 제공합니다.")
            .font(.system(size: 12)).foregroundStyle(MEKITStyle.muted).lineSpacing(4)
        }.padding(18).frame(maxWidth: .infinity, alignment: .leading)
          .background(.white.opacity(0.7), in: RoundedRectangle(cornerRadius: 16))
        Button { camera = true } label: { Label("카메라로 손목 위치 확인", systemImage: "viewfinder") }
          .buttonStyle(StudioButton()).accessibilityIdentifier("openTracking")
        Text("현재는 손목 위치 안내를 제공합니다. 사진 스튜디오 자료는 EARTH 실물 자산과 별도로 보관됩니다.")
          .font(.system(size: 12)).foregroundStyle(MEKITStyle.muted)
        SectionEyebrow(text: "MATERIAL RECORD")
        HStack(alignment: .top, spacing: 24) {
          material("01", "우드 · 천연석", "분산 배열")
          material("02", "올리브 코드", "슬림한 비율")
          material("03", "실버 잠금", "원통형 마감")
        }
      }.padding(24)
    }.background(MEKITStyle.paper).navigationTitle("EARTH").navigationBarTitleDisplayMode(.inline)
      .fullScreenCover(isPresented: $camera) { TryOnView(length: $length) }
  }
  private func material(_ number: String, _ title: String, _ subtitle: String) -> some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(number).font(.system(size: 11)).foregroundStyle(MEKITStyle.muted)
      Text(title).font(.system(size: 12, weight: .medium))
      Text(subtitle).font(.system(size: 11)).foregroundStyle(MEKITStyle.muted)
    }.frame(maxWidth: .infinity, alignment: .leading)
  }
}
