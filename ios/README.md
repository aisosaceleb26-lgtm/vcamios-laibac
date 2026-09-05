# VcamApp — rootless IPA build

Wraps the web app's `phone.html` in a native iOS `WKWebView` shell and packages it as an **unsigned IPA** installable on rootless-jailbroken devices via **TrollStore**.

The app loads `phone.html` from your desktop Node server over the LAN, so the page's in-page WebSocket (`ws://${location.host}`) works unchanged — no changes to the web app itself.

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
3. Launch **VcamApp**, tap the ⚙ button, and enter your desktop server address (e.g. `192.168.1.10:3000`).
4. Make sure the desktop is running `node virtual-camera-server.js` and open `desktop.html` on it, then pick a photo/video in the app to send a frame.

> The desktop Node server is **not** embedded in the app — both the phone app and the desktop viewer must connect to the same server instance on your LAN.
