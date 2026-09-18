import express, { Express } from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { SessionManager } from './session/manager.js';
import { SignalingServer } from './signaling/server.js';
import logger from './utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class DeepLiveCamServer {
  private app: Express;
  private httpServer;
  private wss: WebSocketServer;
  private sessionManager: SessionManager;
  private signalingServer: SignalingServer;

  constructor(port: number = 3000) {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.wss = new WebSocketServer({ server: this.httpServer, path: '/ws' });
    this.sessionManager = new SessionManager();
    this.signalingServer = new SignalingServer(this.wss, this.sessionManager);

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();

    this.httpServer.listen(port, () => {
      logger.info(`DeepLive Cam server running on http://localhost:${port}`);
    });
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../client/public')));
  }

  private setupRoutes(): void {
    this.app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    this.app.post('/api/sessions/create', (req, res) => {
      const session = this.sessionManager.createSession();
      res.json({ sessionId: session.getId(), token: session.getToken() });
    });

    this.app.get('/api/sessions/:id', (req, res) => {
      const session = this.sessionManager.getSession(req.params.id);
      if (session) {
        res.json(session.getPublicData());
      } else {
        res.status(404).json({ error: 'Session not found' });
      }
    });
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws) => {
      logger.info('WebSocket connection established');
      this.signalingServer.handleConnection(ws);
    });
  }
}

// Start server if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = parseInt(process.env.PORT || '3000', 10);
  new DeepLiveCamServer(port);
}

export default DeepLiveCamServer;
