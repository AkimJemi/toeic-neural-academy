/* eslint-disable @typescript-eslint/no-explicit-any */
// import { Howl } from 'howler';

class NeuralAudio {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private enabled: boolean = true;

    constructor() {
        try {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            this.masterGain.gain.value = 0.3; // Default volume
        } catch (e) {
            console.warn("Neural Audio Initialization Failed:", e);
        }
    }

    public toggle(state: boolean) {
        this.enabled = state;
        if (!state && this.ctx) {
            this.ctx.suspend();
        } else if (state && this.ctx) {
            this.ctx.resume();
        }
    }

    private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0) {
        if (!this.enabled || !this.ctx || !this.masterGain) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(this.ctx.currentTime + startTime);
        osc.stop(this.ctx.currentTime + startTime + duration);
    }

    public hover() {
        // High pitched short blip
        this.playTone(800, 'sine', 0.05);
    }

    public click() {
        // Mechanical confirm
        this.playTone(400, 'square', 0.1);
        this.playTone(600, 'square', 0.1, 0.05);
    }

    public success() {
        // Uplifting triad
        this.playTone(440, 'sine', 0.3); // A4
        this.playTone(554, 'sine', 0.3, 0.1); // C#5
        this.playTone(659, 'sine', 0.4, 0.2); // E5
    }

    public error() {
        // Low buzzer
        this.playTone(150, 'sawtooth', 0.4);
        this.playTone(140, 'sawtooth', 0.4, 0.1);
    }

    public async init() {
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
        this.playTone(200, 'sine', 0.5);
    }
}

export const soundManager = new NeuralAudio();

// Critical: Resume AudioContext on first user interaction to satisfy browser policies
if (typeof window !== 'undefined') {
    const resumeAudio = () => {
        soundManager.init();
        window.removeEventListener('mousedown', resumeAudio);
        window.removeEventListener('touchstart', resumeAudio);
    };
    window.addEventListener('mousedown', resumeAudio);
    window.addEventListener('touchstart', resumeAudio);
}
