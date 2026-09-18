import { v4 as uuidv4 } from 'uuid';

export interface SessionData {
  id: string;
  token: string;
  createdAt: Date;
  participants: string[];
  settings: {
    faceSwapEnabled: boolean;
    bodySwapEnabled: boolean;
    voiceChangerEnabled: boolean;
  };
}

export class Session {
  private data: SessionData;

  constructor() {
    this.data = {
      id: uuidv4(),
      token: uuidv4(),
      createdAt: new Date(),
      participants: [],
      settings: {
        faceSwapEnabled: true,
        bodySwapEnabled: false,
        voiceChangerEnabled: false,
      },
    };
  }

  getId(): string {
    return this.data.id;
  }

  getToken(): string {
    return this.data.token;
  }

  addParticipant(participantId: string): void {
    if (!this.data.participants.includes(participantId)) {
      this.data.participants.push(participantId);
    }
  }

  removeParticipant(participantId: string): void {
    this.data.participants = this.data.participants.filter(
      (id) => id !== participantId
    );
  }

  getParticipants(): string[] {
    return [...this.data.participants];
  }

  updateSettings(settings: Partial<SessionData['settings']>): void {
    this.data.settings = { ...this.data.settings, ...settings };
  }

  getPublicData() {
    return {
      id: this.data.id,
      createdAt: this.data.createdAt,
      participantCount: this.data.participants.length,
      settings: this.data.settings,
    };
  }
}
