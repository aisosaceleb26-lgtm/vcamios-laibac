import { WebRTCManager } from './webrtc-manager.js';
import { FaceDetector } from './face-detector.js';
import { PoseEstimator } from './pose-estimator.js';
import { SwapProcessor } from './swap-processor.js';
import { VoiceChanger, VoiceSettings } from './voice-changer.js';

export interface ClientConfig {
  serverUrl: string;
  sessionId: string;
}

export interface VideoSettings {
  faceSwapEnabled: boolean;
  bodySwapEnabled: boolean;
  voiceChangerEnabled: boolean;
}

export class DeepLiveCamClient {
  private config: ClientConfig;
  private ws: WebSocket | null = null;
  private webrtcManager: WebRTCManager;
  private faceDetector: FaceDetector;
  private poseEstimator: PoseEstimator;
  private swapProcessor: SwapProcessor;
  private voiceChanger: VoiceChanger | null = null;
  private videoSettings: VideoSettings = {
    faceSwapEnabled: true,
    bodySwapEnabled: false,
    voiceChangerEnabled: false,
  };
  private animationFrameId: number | null = null;
  private localCanvas: HTMLCanvasElement;
  private remoteCanvases: Map<string, HTMLCanvasElement> = new Map();

  constructor(
    config: ClientConfig,
    localCanvas: HTMLCanvasElement
  ) {
    this.config = config;
    this.localCanvas = localCanvas;
    this.webrtcManager = new WebRTCManager();
    this.faceDetector = new FaceDetector();
    this.poseEstimator = new PoseEstimator();
    this.swapProcessor = new SwapProcessor();
  }

  async initialize(): Promise<void> {
    await this.faceDetector.initialize();
    await this.poseEstimator.initialize();
    await this.setupWebSocket();
    await this.setupLocalStream();
  }

  private async setupWebSocket(): Promise<void> {
    const wsUrl = new URL(this.config.serverUrl);
    wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    wsUrl.pathname = '/ws';

    this.ws = new WebSocket(wsUrl.toString());

    this.ws.onopen = () => {
      console.log('Connected to signaling server');
      this.sendMessage({
        type: 'join',
        sessionId: this.config.sessionId,
      });
    };

    this.ws.onmessage = (event) => {
      this.handleSignalingMessage(JSON.parse(event.data));
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('Disconnected from signaling server');
    };
  }

  private async setupLocalStream(): Promise<void> {
    const stream = await this.webrtcManager.getLocalStream();
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    this.localCanvas.parentElement?.appendChild(video);
  }

  private handleSignalingMessage(message: any): void {
    switch (message.type) {
      case 'join-confirmed':
        this.onJoinConfirmed(message);
        break;
      case 'participant-joined':
        this.onParticipantJoined(message);
        break;
      case 'offer':
        this.onRemoteOffer(message);
        break;
      case 'answer':
        this.onRemoteAnswer(message);
        break;
      case 'ice-candidate':
        this.onIceCandidate(message);
        break;
      case 'settings-updated':
        this.updateVideoSettings(message.settings);
        break;
    }
  }

  private async onJoinConfirmed(message: any): Promise<void> {
    console.log('Joined session with participants:', message.participants);

    // Create peer connections for existing participants
    for (const participantId of message.participants) {
      if (participantId !== message.participantId) {
        await this.initiateConnection(participantId);
      }
    }
  }

  private async onParticipantJoined(message: any): Promise<void> {
    const peerId = message.participantId;
    console.log('Participant joined:', peerId);
    await this.initiateConnection(peerId);
  }

  private async initiateConnection(peerId: string): Promise<void> {
    const peerConnection = await this.webrtcManager.createPeerConnection(peerId);
    const offer = await this.webrtcManager.createOffer(peerId);

    this.sendMessage({
      type: 'offer',
      to: peerId,
      data: offer,
    });
  }

  private async onRemoteOffer(message: any): Promise<void> {
    const peerId = message.from;
    const peerConnection = await this.webrtcManager.createPeerConnection(peerId);

    await this.webrtcManager.handleOffer(peerId, message.data);
    const answer = await this.webrtcManager.createAnswer(peerId);

    this.sendMessage({
      type: 'answer',
      to: peerId,
      data: answer,
    });
  }

  private async onRemoteAnswer(message: any): Promise<void> {
    const peerId = message.from;
    await this.webrtcManager.handleAnswer(peerId, message.data);
  }

  private async onIceCandidate(message: any): Promise<void> {
    const peerId = message.from;
    await this.webrtcManager.addIceCandidate(peerId, message.data);
  }

  private sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  updateVideoSettings(settings: Partial<VideoSettings>): void {
    this.videoSettings = { ...this.videoSettings, ...settings };

    if (this.videoSettings.voiceChangerEnabled && !this.voiceChanger) {
      this.voiceChanger = new VoiceChanger();
    } else if (!this.videoSettings.voiceChangerEnabled && this.voiceChanger) {
      this.voiceChanger.dispose();
      this.voiceChanger = null;
    }
  }

  updateVoiceSettings(settings: Partial<VoiceSettings>): void {
    if (this.voiceChanger) {
      this.voiceChanger.updateSettings(settings);
    }
  }

  startProcessing(): void {
    this.animationFrameId = requestAnimationFrame(() => this.processFrame());
  }

  stopProcessing(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private async processFrame(): Promise<void> {
    try {
      if (this.videoSettings.faceSwapEnabled || this.videoSettings.bodySwapEnabled) {
        // Process and swap faces/bodies
        // This would involve:
        // 1. Detecting faces using faceDetector
        // 2. Estimating poses using poseEstimator
        // 3. Processing swaps using swapProcessor
        // 4. Rendering to canvas
      }

      this.animationFrameId = requestAnimationFrame(() => this.processFrame());
    } catch (error) {
      console.error('Error processing frame:', error);
      this.animationFrameId = requestAnimationFrame(() => this.processFrame());
    }
  }

  async disconnect(): Promise<void> {
    this.stopProcessing();
    this.webrtcManager.closeAllConnections();

    if (this.voiceChanger) {
      this.voiceChanger.dispose();
    }

    this.faceDetector.dispose();
    this.poseEstimator.dispose();
    this.swapProcessor.dispose();

    if (this.ws) {
      this.sendMessage({ type: 'leave' });
      this.ws.close();
    }
  }
}
