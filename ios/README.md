# VcamApp — rootless IPA build (iOS = viewer)

Wraps the web app's `desktop.html` (the frame **viewer**) in a native iOS `WKWebView` shell and packages it as an **unsigned IPA** installable on rootless-jailbroken devices via **TrollStore**.

## Roles
- **Android (sender):** opens `phone.html` in its browser, picks a gallery photo/video or streams from the camera, and sends frames to the server.
- **iOS (viewer):** runs this **VcamApp**, which loads `desktop.html` from the Node server and displays the incoming frames.

The app loads `desktop.html` from the Node server over the LAN, so the page's in-page WebSocket (`ws://${location.host}`) works unchanged — no changes to the web pages themselves.

## Project layout

- `project.yml` — [XcodeGen](https://github.com/yonaskolb/XcodeGen) spec (generates the `.xcodeproj`, so no fragile hand-written `project.pbxproj` is committed).
- `VcamApp/` — Swift sources + `Info.plist`.
- `.github/workflows/build-ipa.yml` — builds the unsigned IPA on a macOS runner and uploads it as a download artifact.

## Building the IPA

### Option A — GitHub Actions (no Mac required)
Push to `main` (or run the workflow manually). The **Build IPA** workflow:
1. Installs XcodeGen via Homebrew.
2. Generates the Xcode project.
3. `xcodebuild` an unsigned, code-signing-disabled Release build for `iphoneos`.
4. Packages the `.app` into a `Payload/` and zips it into `VcamApp-unsigned.ipa`.
5. Uploads the `.ipa` as a downloadable artifact.

Download the artifact `VcamApp-unsigned` from the workflow run.

### Option B — locally on a Mac
```bash
brew install xcodegen
cd ios
xcodegen generate
xcodebuild -project VcamApp.xcodeproj -scheme VcamApp -configuration Release \
  -sdk iphoneos -derivedDataPath build \
  CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED=NO
APP=$(find build -name "VcamApp.app" -type d | head -1)
mkdir Payload && cp -r "$APP" Payload/
zip -r VcamApp-unsigned.ipa Payload
```

## Installing on a rootless device
1. Transfer `VcamApp-unsigned.ipa` to the jailbroken device.
2. Open it with **TrollStore** (the unsigned IPA installs without an App Store signing identity — exactly what TrollStore expects on rootless jailbreaks such as Dopamine/palera1n).
3. Launch **VcamApp**, tap the ⚙ button, and enter your server address (e.g. `192.168.1.10:3000`).
4. On the **Android** phone, open `http://<server-ip>:3000/phone.html` in a browser and pick a photo/video (or stream from the camera) — the frames appear on the iOS viewer.

> The Node server is **not** embedded in the app — the Android sender and the iOS viewer must connect to the same server instance on your LAN. The server can run on any machine (a desktop, a laptop, or even the Android phone itself).
