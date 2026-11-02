/**
 * Web Audio Synthesizer for JEE Command Center
 * Generates procedural audio tones without requiring external asset files.
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.6;
  private activeAlarmOsc: OscillatorNode | null = null;
  private activeAlarmGain: GainNode | null = null;
  private alarmInterval: any = null;

  private getContext(): AudioContext | null {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch (e) {
      console.warn('AudioContext not supported or blocked:', e);
      return null;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAlarm();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  // Play standard tone beep
  public playBeep(frequency: number = 880, durationMs: number = 300, waveType: OscillatorType = 'sine') {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = waveType;
      osc.frequency.setValueAtTime(frequency, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.4, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + durationMs / 1000 + 0.05);
    } catch (e) {
      console.error('Error playing beep:', e);
    }
  }

  // Play harmonic dual-chime for study start or session change
  public playBell() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(this.volume * 0.3, now + idx * 0.06 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 1.25);
      });
    } catch (e) {
      console.error('Error playing bell:', e);
    }
  }

  // Play celebration victory sound for task or schedule completion
  public playVictory() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, i) => {
        const now = ctx.currentTime + i * 0.09;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.volume * 0.45, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.38);
      });
    } catch (e) {
      console.error('Error playing victory:', e);
    }
  }

  // Play subtle analog clock tick for active Pomodoro
  public playTick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);

      gain.gain.setValueAtTime(this.volume * 0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      // ignore subtle tick error
    }
  }

  // Start continuous rhythmic alarm (e.g. daily study time reached or exam timer ended)
  public startAlarm(callbackOnPulse?: () => void) {
    if (this.isMuted) return;
    this.stopAlarm();

    let count = 0;
    const pulse = () => {
      this.playBeep(987.77, 240, 'sawtooth'); // B5 piercing sound
      setTimeout(() => {
        this.playBeep(1174.66, 240, 'sawtooth'); // D6
      }, 260);
      callbackOnPulse?.();
      count++;
      if (count > 25) {
        this.stopAlarm();
      }
    };

    pulse();
    this.alarmInterval = setInterval(pulse, 1200);
  }

  public stopAlarm() {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
    if (this.activeAlarmOsc) {
      try {
        this.activeAlarmOsc.stop();
        this.activeAlarmOsc.disconnect();
      } catch (e) {}
      this.activeAlarmOsc = null;
    }
  }
}

export const soundSynth = new SoundSynthesizer();
