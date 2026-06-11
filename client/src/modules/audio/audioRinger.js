/**
 * client/src/modules/audio/audioRinger.js
 * Play audible tone when device is rung
 */

class AudioRinger {
  constructor() {
    this.audioContext = null;
    this.isPlaying = false;
  }

  /**
   * Initialize Web Audio API
   */
  initialize() {
    if (!this.audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  /**
   * Play ring tone
   * Creates a pleasant dual-frequency tone
   */
  play(duration = 3000) {
    if (this.isPlaying) return;

    const ctx = this.initialize();
    this.isPlaying = true;

    const now = ctx.currentTime;
    const endTime = now + duration / 1000;

    // Create oscillators for two frequencies
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.frequency.value = 800; // Hz
    osc2.frequency.value = 1200; // Hz
    osc1.type = 'sine';
    osc2.type = 'sine';

    // Connect to gain and then to speakers
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    // Ramping volume envelope
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, endTime);

    // Start and stop
    osc1.start(now);
    osc2.start(now);
    osc1.stop(endTime);
    osc2.stop(endTime);

    // Reset flag when done
    setTimeout(() => {
      this.isPlaying = false;
    }, duration);

    console.log('[AUDIO] Ring tone played');
  }

  /**
   * Play pulse pattern
   * Creates attention-grabbing pattern
   */
  playPulse(pulses = 3, interval = 500) {
    if (this.isPlaying) return;

    this.isPlaying = true;

    for (let i = 0; i < pulses; i++) {
      setTimeout(() => {
        this.playTone(300); // Short 300ms tone per pulse
      }, i * interval);
    }

    setTimeout(() => {
      this.isPlaying = false;
    }, pulses * interval);
  }

  /**
   * Play simple tone
   */
  playTone(duration = 300, frequency = 800) {
    const ctx = this.initialize();
    const now = ctx.currentTime;
    const endTime = now + duration / 1000;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.value = frequency;
    osc.type = 'sine';

    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, endTime);

    osc.start(now);
    osc.stop(endTime);
  }

  /**
   * Stop playing
   */
  stop() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.isPlaying = false;
    }
  }
}

export const audioRinger = new AudioRinger();
