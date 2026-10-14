import SwiftUI
import UniformTypeIdentifiers

struct ReferenceFilePicker: UIViewControllerRepresentable {
  let types: [UTType]
  let onSelect: (URL) -> Void
  let onCancel: () -> Void
  func makeCoordinator() -> Coordinator { Coordinator(onSelect: onSelect, onCancel: onCancel) }
  func makeUIViewController(context: Context) -> Presenter {
    let picker = UIDocumentPickerViewController(forOpeningContentTypes: types, asCopy: true)
    picker.allowsMultipleSelection = false
    picker.delegate = context.coordinator
    picker.modalPresentationStyle = .fullScreen
    return Presenter(picker: picker)
  }
  func updateUIViewController(_ controller: Presenter, context: Context) {}
  final class Presenter: UIViewController {
    private let picker: UIDocumentPickerViewController
    private var presentedPicker = false
    init(picker: UIDocumentPickerViewController) {
      self.picker = picker
      super.init(nibName: nil, bundle: nil)
    }
    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }
    override func viewDidLoad() { super.viewDidLoad(); view.backgroundColor = .systemBackground }
    override func viewDidAppear(_ animated: Bool) {
      super.viewDidAppear(animated)
      guard !presentedPicker else { return }
      presentedPicker = true
      // Document browser requires modal presentation to attach its remote file-provider view.
      present(picker, animated: false)
    }
  }
  final class Coordinator: NSObject, UIDocumentPickerDelegate {
    let onSelect: (URL) -> Void
    let onCancel: () -> Void
    init(onSelect: @escaping (URL) -> Void, onCancel: @escaping () -> Void) {
      self.onSelect = onSelect
      self.onCancel = onCancel
    }
    func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
      if let url = urls.first { onSelect(url) } else { onCancel() }
    }
    func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) { onCancel() }
  }
}
