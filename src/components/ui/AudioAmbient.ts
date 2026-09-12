// Web Audio API procedural museum hum and melodic transition chimes

class GalleryAudioEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private isMuted: boolean = true;
  private oscillators: OscillatorNode[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.initContext();
    this.isMuted = !this.isMuted;

    if (!this.ctx) return !this.isMuted;

    if (!this.isMuted) {
      this.startAmbient();
      this.playChime(440, 'sine', 0.2);
    } else {
      this.stopAmbient();
    }

    return !this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  private startAmbient() {
    if (!this.ctx || this.isMuted) return;

    this.stopAmbient();

    try {
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.04, this.ctx.currentTime + 3);
      this.ambientGain.connect(this.ctx.destination);

      // Warm low frequency museum drone
      const freqs = [55, 110, 164.81]; // A1, A2, E3 harmonic drone
      this.oscillators = freqs.map((f, i) => {
        const osc = this.ctx!.createOscillator();
        osc.type = i === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(f, this.ctx!.currentTime);

        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, this.ctx!.currentTime);

        osc.connect(filter);
        filter.connect(this.ambientGain!);
        osc.start();
        return osc;
      });
    } catch {
      // Audio fallback
    }
  }

  private stopAmbient() {
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
      } catch {
        // Safe fail
      }
    }
    setTimeout(() => {
      this.oscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore
        }
      });
      this.oscillators = [];
    }, 900);
  }

  public playChime(freq: number = 523.25, type: OscillatorType = 'sine', duration: number = 1.2) {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    } catch {
      // Audio fallback
    }
  }

  public playPieceChange(index: number) {
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C D E G A C pentatonic
    const note = scale[index % scale.length];
    this.playChime(note, 'sine', 1.5);
    setTimeout(() => {
      this.playChime(note * 1.5, 'triangle', 1.0);
    }, 120);
  }
}

export const galleryAudio = new GalleryAudioEngine();
