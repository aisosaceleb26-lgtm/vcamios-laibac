/**
 * Pitch Shift Audio Worklet Processor
 * Handles real-time pitch shifting for voice modification
 */
class PitchShiftProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.pitchShift = 0;
    this.buffer = new Float32Array(4096);
    this.bufferIndex = 0;
  }

  static get parameterDescriptors() {
    return [
      {
        name: 'pitch',
        defaultValue: 0,
        minValue: -12,
        maxValue: 12,
      },
    ];
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    const pitchParam = parameters.pitch;

    if (input.length > 0) {
      const inputChannel = input[0];
      const outputChannel = output[0];

      const pitchFactor = Math.pow(2, pitchParam[0] / 12);

      for (let i = 0; i < inputChannel.length; i++) {
        const sampleIndex = (this.bufferIndex + i) / pitchFactor;
        const intPart = Math.floor(sampleIndex);
        const fracPart = sampleIndex - intPart;

        const sample1 = this.buffer[intPart % this.buffer.length];
        const sample2 = this.buffer[(intPart + 1) % this.buffer.length];
        outputChannel[i] = sample1 * (1 - fracPart) + sample2 * fracPart;
      }

      for (let i = 0; i < inputChannel.length; i++) {
        this.buffer[this.bufferIndex] = inputChannel[i];
        this.bufferIndex = (this.bufferIndex + 1) % this.buffer.length;
      }
    }

    return true;
  }
}

registerProcessor('pitch-shift-processor', PitchShiftProcessor);
