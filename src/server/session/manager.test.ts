import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SessionManager } from '../src/server/session/manager';

describe('SessionManager', () => {
  let sessionManager: SessionManager;

  beforeAll(() => {
    sessionManager = new SessionManager();
  });

  it('should create a new session', () => {
    const session = sessionManager.createSession();
    expect(session).toBeDefined();
    expect(session.getId()).toBeDefined();
    expect(session.getToken()).toBeDefined();
  });

  it('should retrieve a session by ID', () => {
    const session = sessionManager.createSession();
    const retrieved = sessionManager.getSession(session.getId());
    expect(retrieved).toEqual(session);
  });

  it('should manage participants', () => {
    const session = sessionManager.createSession();
    session.addParticipant('participant1');
    session.addParticipant('participant2');

    expect(session.getParticipants()).toHaveLength(2);
    expect(session.getParticipants()).toContain('participant1');

    session.removeParticipant('participant1');
    expect(session.getParticipants()).toHaveLength(1);
  });

  it('should update settings', () => {
    const session = sessionManager.createSession();
    session.updateSettings({
      faceSwapEnabled: false,
      bodySwapEnabled: true,
    });

    const data = session.getPublicData();
    expect(data.settings.faceSwapEnabled).toBe(false);
    expect(data.settings.bodySwapEnabled).toBe(true);
  });

  it('should delete a session', () => {
    const session = sessionManager.createSession();
    const id = session.getId();

    expect(sessionManager.getSession(id)).toBeDefined();
    expect(sessionManager.deleteSession(id)).toBe(true);
    expect(sessionManager.getSession(id)).toBeUndefined();
  });

  afterAll(() => {
    // Cleanup if needed
  });
});
