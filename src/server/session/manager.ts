import { Session } from './model.js';

export class SessionManager {
  private sessions: Map<string, Session> = new Map();

  createSession(): Session {
    const session = new Session();
    this.sessions.set(session.getId(), session);
    return session;
  }

  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  getSessionCount(): number {
    return this.sessions.size;
  }
}
