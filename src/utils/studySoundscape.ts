export type StudySoundscape = 'white-noise' | 'binaural-40hz' | 'lofi';

class StudySoundscapePlayer {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeSources: AudioScheduledSourceNode[] = [];
  private activeAudioNodes: AudioNode[] = [];
  private playing = false;

  public isPlaying(): boolean {
    return this.playing;
  }

  public async start(soundscape: StudySoundscape, volume: number): Promise<void> {
    this.stop();
    const AudioContextConstructor =
      typeof window !== 'undefined'
        ? window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        : undefined;

    if (!AudioContextConstructor) {
      throw new Error('Study sounds are not supported by this browser.');
    }

    this.context ??= new AudioContextConstructor();
    await this.context.resume();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    this.masterGain.connect(this.context.destination);

    if (soundscape === 'white-noise') {
      this.startWhiteNoise();
    } else if (soundscape === 'binaural-40hz') {
      this.startBinauralBeats();
    } else {
      this.startLofi();
    }
    this.playing = true;
  }

  public setVolume(volume: number): void {
    if (!this.context || !this.masterGain) return;
    this.masterGain.gain.setTargetAtTime(
      Math.max(0, Math.min(1, volume)),
      this.context.currentTime,
      0.08
    );
  }

  public stop(): void {
    if (this.context && this.masterGain) {
      const sources = this.activeSources;
      const audioNodes = this.activeAudioNodes;
      const gainNode = this.masterGain;
      const now = this.context.currentTime;
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
      sources.forEach((node) => {
        try {
          node.stop(now + 0.16);
        } catch {
          // A source may already have stopped.
        }
      });
      window.setTimeout(() => {
        sources.forEach((node) => node.disconnect());
        audioNodes.forEach((node) => node.disconnect());
        gainNode.disconnect();
      }, 200);
      this.activeSources = [];
      this.activeAudioNodes = [];
      this.masterGain = null;
    }
    this.playing = false;
  }

  private startWhiteNoise(): void {
    if (!this.context || !this.masterGain) return;
    const buffer = this.context.createBuffer(1, this.context.sampleRate * 5, this.context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = (Math.random() * 2 - 1) * 0.18;
    }

    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    source.buffer = buffer;
    source.loop = true;
    filter.type = 'lowpass';
    filter.frequency.value = 6500;
    source.connect(filter);
    filter.connect(this.masterGain);
    source.start();
    this.activeSources = [source];
    this.activeAudioNodes = [filter];
  }

  private startBinauralBeats(): void {
    if (!this.context || !this.masterGain) return;
    if (typeof this.context.createStereoPanner !== 'function') {
      throw new Error('40 Hz binaural beats need a browser with stereo audio support.');
    }

    const frequencies = [200, 240];
    const pans = [-1, 1];
    const gains: GainNode[] = [];
    const panners: StereoPannerNode[] = [];

    this.activeSources = frequencies.map((frequency, index) => {
      const oscillator = this.context!.createOscillator();
      const gain = this.context!.createGain();
      const panner = this.context!.createStereoPanner();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.2;
      panner.pan.value = pans[index];
      oscillator.connect(gain);
      gain.connect(panner);
      panner.connect(this.masterGain!);
      oscillator.start();
      gains.push(gain);
      panners.push(panner);
      return oscillator;
    });
    this.activeAudioNodes = [...gains, ...panners];
  }

  private startLofi(): void {
    if (!this.context || !this.masterGain) return;
    const sampleRate = this.context.sampleRate;
    const duration = 8;
    const buffer = this.context.createBuffer(1, sampleRate * duration, sampleRate);
    const channel = buffer.getChannelData(0);
    const beatLength = 0.5;
    const chords = [
      [130.81, 155.56, 196, 233.08],
      [103.83, 130.81, 155.56, 196],
      [116.54, 146.83, 174.61, 220],
      [87.31, 110, 130.81, 164.81],
    ];

    const addNote = (start: number, length: number, frequency: number, amplitude: number, kind: 'pad' | 'pluck') => {
      const startSample = Math.floor(start * sampleRate);
      const endSample = Math.min(channel.length, Math.floor((start + length) * sampleRate));
      const phaseStep = (2 * Math.PI * frequency) / sampleRate;
      for (let sample = startSample; sample < endSample; sample += 1) {
        const time = (sample - startSample) / sampleRate;
        const envelope =
          kind === 'pad'
            ? Math.min(1, time * 5) * Math.exp(-time * 0.8)
            : Math.exp(-time * 5) * Math.min(1, time * 45);
        const phase = phaseStep * (sample - startSample);
        const tone =
          kind === 'pad'
            ? Math.sin(phase) * 0.7 + Math.sin(phase * 2.003) * 0.2
            : Math.sin(phase) * 0.85 + Math.sin(phase * 2) * 0.15;
        channel[sample] += tone * envelope * amplitude;
      }
    };

    for (let bar = 0; bar < 4; bar += 1) {
      const barStart = bar * 2;
      chords[bar].forEach((frequency, noteIndex) => {
        addNote(barStart, 1.9, frequency, noteIndex === 0 ? 0.09 : 0.045, 'pad');
      });
      for (let beat = 0; beat < 4; beat += 1) {
        const beatStart = barStart + beat * beatLength;
        if (beat === 0 || beat === 2) {
          const startSample = Math.floor(beatStart * sampleRate);
          const endSample = Math.min(channel.length, startSample + Math.floor(sampleRate * 0.22));
          for (let sample = startSample; sample < endSample; sample += 1) {
            const time = (sample - startSample) / sampleRate;
            const frequency = 85 * Math.exp(-time * 18) + 38;
            channel[sample] += Math.sin(2 * Math.PI * frequency * time) * Math.exp(-time * 18) * 0.24;
          }
        } else {
          const startSample = Math.floor(beatStart * sampleRate);
          const endSample = Math.min(channel.length, startSample + Math.floor(sampleRate * 0.12));
          for (let sample = startSample; sample < endSample; sample += 1) {
            const time = (sample - startSample) / sampleRate;
            const noise = (Math.random() * 2 - 1) * Math.exp(-time * 24);
            channel[sample] += noise * 0.07;
          }
        }
        if (beat % 2 === 1) {
          addNote(beatStart + 0.25, 0.18, chords[bar][beat], 0.035, 'pluck');
        }
      }
    }

    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    source.buffer = buffer;
    source.loop = true;
    filter.type = 'lowpass';
    filter.frequency.value = 4200;
    source.connect(filter);
    filter.connect(this.masterGain);
    source.start();
    this.activeSources = [source];
    this.activeAudioNodes = [filter];
  }
}

export const studySoundscapePlayer = new StudySoundscapePlayer();
