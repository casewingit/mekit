import SwiftUI
import TryOnCore

enum MEKITStyle {
  static let ink = Color(red: 0.12, green: 0.14, blue: 0.12)
  static let olive = Color(red: 0.28, green: 0.34, blue: 0.24)
  static let paper = Color(red: 0.96, green: 0.95, blue: 0.92)
  static let muted = Color(red: 0.46, green: 0.47, blue: 0.43)
}

struct StudioButton: ButtonStyle {
  var secondary = false
  func makeBody(configuration: Configuration) -> some View {
    configuration.label.font(.system(size: 15, weight: .semibold))
      .frame(maxWidth: .infinity, minHeight: 52)
      .foregroundStyle(secondary ? MEKITStyle.ink : .white)
      .background(secondary ? MEKITStyle.ink.opacity(0.06) : MEKITStyle.ink,
                  in: RoundedRectangle(cornerRadius: 16))
      .opacity(configuration.isPressed ? 0.7 : 1)
  }
}

struct LengthPicker: View {
  @Binding var length: Double
  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack {
        Text("완성 길이 비교").font(.system(size: 15, weight: .semibold))
        Spacer()
        Text(String(format: "%.1fcm", length)).monospacedDigit()
          .accessibilityIdentifier("lengthReadout")
      }
      HStack(spacing: 8) {
        ForEach(LengthSelection.studyLengths, id: \.self) { value in
          Button { length = value } label: {
            Text(String(format: "%.1fcm", value)).font(.system(size: 14, weight: .medium))
              .monospacedDigit().frame(maxWidth: .infinity, minHeight: 48)
              .foregroundStyle(length == value ? .white : MEKITStyle.ink)
              .background(length == value ? MEKITStyle.ink : MEKITStyle.ink.opacity(0.06),
                          in: RoundedRectangle(cornerRadius: 12))
          }.buttonStyle(.plain)
            .accessibilityIdentifier(String(format: "studyLength%.1f", value))
            .accessibilityValue(length == value ? "선택됨" : "선택 안 됨")
        }
      }
      Text("18cm 손목 기준의 비교 후보예요. 판매 사이즈는 미확정이며, 실물 착용 검증 후 확정합니다.")
        .font(.system(size: 12)).foregroundStyle(MEKITStyle.muted)
        .fixedSize(horizontal: false, vertical: true)
    }
  }
}

struct SectionEyebrow: View {
  let text: String
  var body: some View {
    Text(text).font(.system(size: 10, weight: .semibold)).tracking(2)
      .foregroundStyle(MEKITStyle.muted)
  }
}
