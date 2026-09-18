export interface VoiceSettings {
  pitch: number; // -12 to 12 semitones
  speed: number; // 0.5 to 2.0
  gender: 'male' | 'female' | 'neutral';
  effect: 'none' | 'robot' | 'echo' | 'reverb';
}

export class VoiceChanger {
  private audioContext: AudioContext;
  private pitchShift: PitchShiftProcessor | null = null;
  private settings: VoiceSettings;

  constructor(settings: VoiceSettings = this.getDefaultSettings()) {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.settings = settings;
    this.initializeAudio();
  }

  private getDefaultSettings(): VoiceSettings {
    return {
      pitch: 0,
      speed: 1.0,
      gender: 'neutral',
      effect: 'none',
    };
  }

  private async initializeAudio(): Promise<void> {
    try {
      // Load and initialize pitch shifting processor
      await this.audioContext.audioWorklet.addModule(
        '/audio-worklet/pitch-shift-processor.js'
      );
      this.pitchShift = new (window as any).PitchShiftProcessor(this.audioContext);
    } catch (error) {
      console.warn('Failed to load pitch shift processor:', error);
    }
  }

  /**
   * Process audio stream with voice modifications
   */
  async processAudio(
    inputBuffer: AudioBuffer
  ): Promise<AudioBuffer> {
    const offlineContext = new OfflineAudioContext(
      inputBuffer.numberOfChannels,
      inputBuffer.length,
      inputBuffer.sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = inputBuffer;

    let destination: AudioNode = offlineContext.destination;

    // Apply pitch shift
    if (this.settings.pitch !== 0 && this.pitchShift) {
      // Connect through pitch shifter
      source.connect(this.pitchShift.getInputNode());
      this.pitchShift.getOutputNode().connect(destination);
      destination = offlineContext.destination;
    } else {
      source.connect(destination);
    }

    // Apply additional effects
    switch (this.settings.effect) {
      case 'robot':
        destination = this.applyRobotEffect(offlineContext, destination);
        source.disconnect();
        source.connect(destination);
        break;
      case 'echo':
        destination = this.applyEchoEffect(offlineContext, destination);
        source.disconnect();
        source.connect(destination);
        break;
      case 'reverb':
        destination = this.applyReverbEffect(offlineContext, destination);
        source.disconnect();
        source.connect(destination);
        break;
    }

    source.start(0);
    return offlineContext.startRendering();
  }

  private applyRobotEffect(
    context: OfflineAudioContext,
    destination: AudioNode
  ): AudioNode {
    const bitCrusher = context.createWaveShaper();
    const samples = 8;
    const curve = new Float32Array(samples * 2);
    for (let i = 0; i < samples; i++) {
      curve[i * 2] = -1 + (i / samples) * 2;
      curve[i * 2 + 1] = -1 + (i / samples) * 2;
    }
    bitCrusher.curve = curve;
    bitCrusher.connect(destination);
    return bitCrusher;
  }

  private applyEchoEffect(
    context: OfflineAudioContext,
    destination: AudioNode
  ): AudioNode {
    const delay = context.createDelay(1);
    const feedback = context.createGain();
    const wet = context.createGain();

    delay.delayTime.value = 0.5;
    feedback.gain.value = 0.5;
    wet.gain.value = 0.5;

    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(destination);

    return delay;
  }

  private applyReverbEffect(
    context: OfflineAudioContext,
    destination: AudioNode
  ): AudioNode {
    const convolver = context.createConvolver();
    // Would load a proper impulse response file
    convolver.connect(destination);
    return convolver;
  }

  updateSettings(settings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  dispose(): void {
    if (this.pitchShift) {
      this.pitchShift = null;
    }
    this.audioContext.close();
  }
}
