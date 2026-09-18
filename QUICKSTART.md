# DeepLive Cam - Quick Start Guide

## Prerequisites

- Node.js 18+ and npm
- A modern web browser with WebRTC support
- Webcam and microphone

## Installation & Setup

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build
```

## Development

```bash
# Terminal 1: Start backend server
npm run dev

# Terminal 2: Start client dev server (optional)
npm run client:dev
```

Then open `http://localhost:3000` in your browser.

## Docker Deployment

```bash
# Build and run
docker-compose up --build

# The app will be available at http://localhost:3000
```

## Features to Test

1. **Start Call**: Click "Start Call" button to begin
2. **Face Swap**: Toggle "Face Swap" to enable/disable face swapping
3. **Voice Settings**: Adjust pitch, speed, and effects in real-time
4. **Body Swap**: Toggle "Body Swap" for full body replacement
5. **Voice Changer**: Enable voice effects with different audio effects

## Known Limitations

- Face and body swap algorithms are placeholder implementations
- Requires low-latency network connection
- Best performance on Chrome/Edge browsers
- May require GPU acceleration for smooth operation

## Troubleshooting

### Camera/Microphone not working
- Check browser permissions
- Try a different browser
- Restart the application

### High latency
- Check network connection
- Close other applications
- Reduce video resolution in settings

### Models not loading
- Clear browser cache
- Check console for errors
- Verify internet connection for model downloads

## Next Steps

1. Implement actual face detection using BlazeFace or RetinaFace
2. Add body swap using human segmentation models
3. Implement proper pitch-shifting algorithm
4. Add support for multiple simultaneous calls
5. Implement recording and playback features
