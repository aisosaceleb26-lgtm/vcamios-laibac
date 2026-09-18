# DeepLive Cam

Real-time video call face & body swap with voice changer. Works on any platform for video calling with character swapping.

## Features

- 🎭 **Face Swap**: Real-time face detection and swapping using TensorFlow.js and MediaPipe
- 🏃 **Body Swap**: Full body replacement using pose estimation
- 🎤 **Voice Changer**: Pitch shifting, speed adjustment, and voice effects
- 🌐 **WebRTC**: P2P video streaming with signaling server
- 💻 **Cross-platform**: Works on Mac, Windows, Linux, and browsers
- ⚡ **WebGPU Acceleration**: GPU-accelerated AI models for smooth performance
- 🎯 **Real-time Processing**: Low-latency frame processing

## Tech Stack

- **Backend**: Node.js + TypeScript + Express.js
- **Frontend**: TypeScript + Vanilla JS + WebRTC
- **Video Processing**: Canvas API + OffscreenCanvas
- **AI/ML**: TensorFlow.js, MediaPipe, ONNX Runtime
- **Audio**: Web Audio API + AudioWorklet
- **Signaling**: WebSocket

## Project Structure

```
src/
├── server/              # Backend server
│   ├── index.ts        # Main server entry
│   ├── session/        # Session management
│   ├── signaling/      # WebRTC signaling
│   └── utils/          # Helper utilities
├── client/             # Frontend application
│   ├── lib/            # Core libraries
│   │   ├── webrtc-manager.ts      # WebRTC peer connections
│   │   ├── face-detector.ts       # Face detection
│   │   ├── pose-estimator.ts      # Body pose estimation
│   │   ├── swap-processor.ts      # Video processing/swapping
│   │   ├── voice-changer.ts       # Audio processing
│   │   └── client.ts              # Main client class
│   └── public/         # Static files
│       ├── index.html  # Main HTML
│       └── audio-worklet/
└── shared/             # Shared types and utilities
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev        # Start development server
npm run build      # Build TypeScript
npm run client:dev # Start client dev server
```

## Building

```bash
npm run build
npm start
```

## Environment Variables

```
PORT=3000
LOG_LEVEL=info
```

## API Reference

### HTTP Endpoints

- `GET /api/health` - Health check
- `POST /api/sessions/create` - Create new session
- `GET /api/sessions/:id` - Get session info

### WebSocket Messages

#### Client → Server

```typescript
// Join session
{ type: 'join', sessionId: string }

// WebRTC signaling
{ type: 'offer'|'answer'|'ice-candidate', to?: string, data: any }

// Settings update
{ type: 'settings-update', data: { faceSwapEnabled, bodySwapEnabled, voiceChangerEnabled } }

// Leave session
{ type: 'leave' }
```

#### Server → Client

```typescript
// Join confirmation
{ type: 'join-confirmed', participantId: string, participants: string[] }

// Participant events
{ type: 'participant-joined'|'participant-left', participantId: string }

// WebRTC signaling
{ type: 'offer'|'answer'|'ice-candidate', from: string, data: any }

// Settings
{ type: 'settings-updated', settings: { faceSwapEnabled, bodySwapEnabled, voiceChangerEnabled } }
```

## Client Usage

```typescript
import { DeepLiveCamClient } from './client/lib/client';

const client = new DeepLiveCamClient(
  { serverUrl: 'http://localhost:3000', sessionId: 'my-session' },
  localCanvas
);

await client.initialize();
client.startProcessing();

// Update settings
client.updateVideoSettings({ faceSwapEnabled: true });
client.updateVoiceSettings({ pitch: 5, speed: 1.2 });

// Cleanup
await client.disconnect();
```

## Performance Optimization

- WebGPU backend for TensorFlow.js (falls back to WebAssembly)
- OffscreenCanvas for non-blocking processing
- Adaptive frame rate based on CPU usage
- Efficient memory management with tensor disposal

## Limitations & Future Work

- [ ] Implement actual face detection and swapping algorithms
- [ ] Add body swap with better pose alignment
- [ ] Implement proper pitch shifting algorithm
- [ ] Add more voice effects
- [ ] Support for multiple simultaneous participants
- [ ] Recording and playback features
- [ ] Custom character/face library

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
