/**
 * Web Speech API Voice Narrator
 * Provides natural text-to-speech for autonomous 3D tour presentations
 * 100% offline, zero external API keys, zero latency.
 */

class VoiceNarrator {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private enabled: boolean = true;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }

      try {
        const saved = localStorage.getItem('memoryscape_voice_enabled');
        if (saved !== null) {
          this.enabled = saved === 'true';
        }
      } catch {
        this.enabled = true;
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public isAvailable(): boolean {
    return !!this.synth;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    try {
      localStorage.setItem('memoryscape_voice_enabled', String(enabled));
    } catch {
      // ignore
    }
    if (!enabled) {
      this.stop();
    }
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  private getBestVoice(): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    // Prefer high-quality English voices
    const preferredNames = [
      'Google US English',
      'Microsoft Zira',
      'Microsoft Jenny Online (Natural)',
      'Samantha',
      'Daniel',
      'Karen',
    ];

    for (const name of preferredNames) {
      const match = this.voices.find(
        (v) => v.name.includes(name) || v.voiceURI.includes(name)
      );
      if (match) return match;
    }

    // Fallback: any en-US or English voice
    const enVoice = this.voices.find(
      (v) => v.lang.startsWith('en-US') || v.lang.startsWith('en')
    );
    return enVoice || this.voices[0] || null;
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.synth || !this.enabled) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      const voice = this.getBestVoice();
      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = 1.02; // crisp, clear educational pace
      utterance.pitch = 1.0;
      utterance.volume = 0.95;

      utterance.onend = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      this.synth.speak(utterance);
    } catch {
      if (onEnd) onEnd();
    }
  }

  public stop() {
    if (!this.synth) return;
    try {
      this.synth.cancel();
      this.currentUtterance = null;
    } catch {
      // ignore
    }
  }

  public pause() {
    if (!this.synth) return;
    try {
      this.synth.pause();
    } catch {
      // ignore
    }
  }

  public resume() {
    if (!this.synth) return;
    try {
      this.synth.resume();
    } catch {
      // ignore
    }
  }
}

export const narrator = new VoiceNarrator();
