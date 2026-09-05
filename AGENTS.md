# Base44 Dev Environment

## What this app is
A Node.js (Express + `ws`) server that serves static HTML pages and relays WebSocket messages between a phone client (`phone.html`) and a desktop viewer (`desktop.html`) — a virtual-camera gallery prototype. There is no database, no build step, and no external-service dependency.

## Running
- `docker compose -f docker-compose.base44.yml up -d --build`
- The service is a plain `node:22` image with the repo bind-mounted at `/app`; it runs `npm install --omit=dev && node virtual-camera-server.js` on port 3000.
- No secrets are required.

## Verifying
- `curl -sf http://localhost:3000/desktop.html` returns the desktop viewer HTML.
- `curl -sf http://localhost:3000/phone.html` returns the phone sender HTML.
- The root `/` has no index file (only `desktop.html` / `phone.html` are served); the preview entry point is `/desktop.html`.
- WebSocket relay: open `phone.html` and `desktop.html` in two clients; sending a frame from the phone appears on the desktop.

## Notes
- `package.json` was added by Base44 (it did not exist in the original repo) to pin `express` + `ws`.
- The server listens on `0.0.0.0:3000` (Node default), so the preview's external hostname is accepted.
