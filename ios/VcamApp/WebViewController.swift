import UIKit
import WebKit

/// Wraps the web app's `desktop.html` (the frame viewer) in a native iOS shell.
/// Android is the sender (`phone.html`); iOS is the viewer. The page is loaded
/// from the Node server, so the in-page WebSocket keeps working unchanged.
final class WebViewController: UIViewController {
    private let serverKey = "serverURL"
    private var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()
        title = "Vcam Viewer"
        navigationItem.rightBarButtonItem = UIBarButtonItem(
            image: UIImage(systemName: "gearshape"),
            style: .plain, target: self, action: #selector(configure)
        )
        view.backgroundColor = .black

        let webView = WKWebView(frame: view.bounds)
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(webView)
        self.webView = webView

        if let saved = UserDefaults.standard.string(forKey: serverKey), !saved.isEmpty {
            loadWeb(saved)
        } else {
            configure()
        }
    }

    @objc private func configure() {
        let alert = UIAlertController(
            title: "Connect to Server",
            message: "Enter your desktop server address (e.g. 192.168.1.10:3000)",
            preferredStyle: .alert
        )
        alert.addTextField { tf in
            tf.placeholder = "192.168.1.10:3000"
            tf.keyboardType = .URL
            tf.autocapitalizationType = .none
            tf.autocorrectionType = .no
            tf.text = UserDefaults.standard.string(forKey: self.serverKey)
        }
        alert.addAction(UIAlertAction(title: "Connect", style: .default) { [weak self] _ in
            guard let self = self else { return }
            let raw = (alert.textFields?.first?.text ?? "")
                .trimmingCharacters(in: .whitespacesAndNewlines)
            guard !raw.isEmpty else { return }
            let url = raw.hasPrefix("http") ? raw : "http://\(raw)"
            UserDefaults.standard.set(url, forKey: self.serverKey)
            self.loadWeb(url)
        })
        present(alert, animated: true)
    }

    private func loadWeb(_ host: String) {
        let base = host.hasSuffix("/") ? String(host.dropLast()) : host
        guard let url = URL(string: "\(base)/desktop.html") else { return }
        webView.load(URLRequest(url: url))
    }
}
