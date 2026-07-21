Virtual camera -> phone gallery prototype

Goal
- Let a phone send gallery images/videos to a desktop window, then route that window into a virtual webcam (OBS VirtualCam) for video-call apps.

What this prototype contains
- virtual-camera-server.js : Node server that serves the static pages and relays WebSocket messages
- phone.html : open this on your phone, pick an image or short video and "Send to desktop"
- desktop.html : open this on your desktop; it displays incoming frames full-screen

How to run
1. Install Node.js (v14+)
2. From repo root: npm install express ws
3. Run: node virtual-camera-server.js
4. On your phone (same LAN): open http://<desktop-ip>:3000/phone.html
5. On desktop: open http://localhost:3000/desktop.html in a browser and make the window full-screen or sized for your camera aspect ratio
6. In OBS (or similar), add a Window Capture / Browser Capture for the desktop browser window
7. Install and enable the OBS Virtual Camera plugin (or OBS's built-in "Start Virtual Camera") to expose OBS output as a system webcam
8. Select the OBS Virtual Camera in your video-call app

Notes & next steps
- This is an MVP using browser + OBS to avoid building kernel/driver-level virtual camera plugins.
- For lower-latency or direct virtual camera drivers, consider platform-specific implementations (CoreMediaIO on macOS, DirectShow/Media Foundation on Windows, or v4l2loopback on Linux).
- Can be extended to WebRTC for live video streaming from phone (better latency) instead of base64 frames.

Security
- This prototype does not authenticate clients; run only on trusted LAN or add simple token-based auth.
