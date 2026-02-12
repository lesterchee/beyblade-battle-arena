'use client';

// Simple Audio Synthesizer for Retro Game Sounds
// Author: Antigravity

class AudioSynthesizer {
    ctx: AudioContext | null = null;
    gainNode: GainNode | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.gainNode = this.ctx.createGain();
            this.gainNode.connect(this.ctx.destination);
            this.gainNode.gain.value = 0.3; // Master volume
        }
    }

    private playTone(freq: number, type: OscillatorType, duration: number, startTime = 0) {
        if (!this.ctx || !this.gainNode) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

        // Envelope
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(this.gainNode);

        osc.start(this.ctx.currentTime + startTime);
        osc.stop(this.ctx.currentTime + startTime + duration);
    }

    playClash() {
        // Metallic hit: high frequency noise burst + metal ping
        this.playTone(800, 'square', 0.1);
        this.playTone(1200, 'sawtooth', 0.1);
        // "Noise" simulation using random frequencies rapidly
        for (let i = 0; i < 5; i++) {
            this.playTone(200 + Math.random() * 1000, 'sawtooth', 0.05, i * 0.01);
        }
    }

    playCritical() {
        // Power up sound: rapid ascending arpeggio
        this.playTone(440, 'sine', 0.1, 0);
        this.playTone(554, 'sine', 0.1, 0.05);
        this.playTone(659, 'sine', 0.1, 0.1);
        this.playTone(880, 'square', 0.2, 0.15);
    }

    playWin() {
        // Victory fanfare
        const now = 0;
        this.playTone(523.25, 'triangle', 0.2, now);       // C5
        this.playTone(659.25, 'triangle', 0.2, now + 0.2); // E5
        this.playTone(783.99, 'triangle', 0.2, now + 0.4); // G5
        this.playTone(1046.50, 'square', 0.6, now + 0.6);  // C6
    }

    playStart() {
        // "3, 2, 1, Go!" type feel - descending tones then high
        this.playTone(440, 'sine', 0.3, 0); // 3
        this.playTone(440, 'sine', 0.3, 0.5); // 2
        this.playTone(440, 'sine', 0.3, 1.0); // 1
        this.playTone(880, 'square', 0.8, 1.5); // GO!
    }
}

export const audioManager = new AudioSynthesizer();
