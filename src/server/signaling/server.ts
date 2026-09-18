import { WebSocket, WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { SessionManager } from '../session/manager.js';
import logger from '../utils/logger.js';

interface SignalingMessage {
  type:
    | 'join'
    | 'offer'
    | 'answer'
    | 'ice-candidate'
    | 'leave'
    | 'settings-update';
  sessionId?: string;
  participantId?: string;
  data?: any;
}

export class SignalingServer {
  private clients: Map<string, WebSocket> = new Map();
  private participantSessions: Map<string, string> = new Map(); // participantId -> sessionId

  constructor(
    private wss: WebSocketServer,
    private sessionManager: SessionManager
  ) {}

  handleConnection(ws: WebSocket): void {
    const participantId = uuidv4();
    this.clients.set(participantId, ws);

    logger.info(`Participant ${participantId} connected`);

    ws.on('message', (data: string) => {
      this.handleMessage(participantId, data);
    });

    ws.on('close', () => {
      this.handleDisconnect(participantId);
    });

    ws.on('error', (error) => {
      logger.error({ error }, `WebSocket error for participant ${participantId}`);
    });
  }

  private handleMessage(participantId: string, data: string): void {
    try {
      const message: SignalingMessage = JSON.parse(data);

      switch (message.type) {
        case 'join':
          this.handleJoin(participantId, message);
          break;
        case 'offer':
        case 'answer':
        case 'ice-candidate':
          this.forwardToSession(participantId, message);
          break;
        case 'settings-update':
          this.handleSettingsUpdate(participantId, message);
          break;
        case 'leave':
          this.handleLeave(participantId, message);
          break;
      }
    } catch (error) {
      logger.error({ error }, `Failed to parse message from ${participantId}`);
    }
  }

  private handleJoin(participantId: string, message: SignalingMessage): void {
    const sessionId = message.sessionId;
    if (!sessionId) return;

    const session = this.sessionManager.getSession(sessionId);
    if (!session) {
      this.sendToClient(participantId, {
        type: 'error',
        message: 'Session not found',
      });
      return;
    }

    session.addParticipant(participantId);
    this.participantSessions.set(participantId, sessionId);

    // Send join confirmation
    this.sendToClient(participantId, {
      type: 'join-confirmed',
      participantId,
      participants: session.getParticipants(),
    });

    // Notify other participants
    this.broadcastToSession(sessionId, {
      type: 'participant-joined',
      participantId,
    });
  }

  private forwardToSession(
    participantId: string,
    message: SignalingMessage
  ): void {
    const sessionId = this.participantSessions.get(participantId);
    if (!sessionId) return;

    const session = this.sessionManager.getSession(sessionId);
    if (!session) return;

    // Forward to all other participants in the session
    session.getParticipants().forEach((otherId) => {
      if (otherId !== participantId) {
        this.sendToClient(otherId, {
          ...message,
          from: participantId,
        });
      }
    });
  }

  private handleSettingsUpdate(
    participantId: string,
    message: SignalingMessage
  ): void {
    const sessionId = this.participantSessions.get(participantId);
    if (!sessionId) return;

    const session = this.sessionManager.getSession(sessionId);
    if (!session) return;

    if (message.data) {
      session.updateSettings(message.data);
    }

    // Broadcast updated settings to all participants
    this.broadcastToSession(sessionId, {
      type: 'settings-updated',
      settings: session.getPublicData().settings,
    });
  }

  private handleLeave(participantId: string, message: SignalingMessage): void {
    const sessionId = this.participantSessions.get(participantId);
    if (!sessionId) return;

    const session = this.sessionManager.getSession(sessionId);
    if (session) {
      session.removeParticipant(participantId);
      this.broadcastToSession(sessionId, {
        type: 'participant-left',
        participantId,
      });
    }

    this.participantSessions.delete(participantId);
  }

  private handleDisconnect(participantId: string): void {
    this.handleLeave(participantId, { type: 'leave' });
    this.clients.delete(participantId);
    logger.info(`Participant ${participantId} disconnected`);
  }

  private sendToClient(participantId: string, message: any): void {
    const ws = this.clients.get(participantId);
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private broadcastToSession(sessionId: string, message: any): void {
    const session = this.sessionManager.getSession(sessionId);
    if (!session) return;

    session.getParticipants().forEach((participantId) => {
      this.sendToClient(participantId, message);
    });
  }
}
