import { useState, useEffect, useRef, useCallback } from 'react';

interface TTSOptions {
    rate?: number;
    pitch?: number;
    volume?: number;
    voiceURI?: string;
    lang?: string;
}

interface TTSState {
    isPlaying: boolean;
    isPaused: boolean;
    progress: number;
    currentWord: string;
}

export const useTextToSpeech = () => {
    const [state, setState] = useState<TTSState>({
        isPlaying: false,
        isPaused: false,
        progress: 0,
        currentWord: ''
    });

    const synth = useRef<SpeechSynthesis | null>(null);
    const utterance = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            synth.current = window.speechSynthesis;
        }
    }, []);

    const speak = useCallback((text: string, options: TTSOptions = {}) => {
        if (!synth.current) return;

        synth.current.cancel();

        utterance.current = new SpeechSynthesisUtterance(text);

        utterance.current.rate = options.rate || 1.0;
        utterance.current.pitch = options.pitch || 1.0;
        utterance.current.volume = options.volume || 1.0;
        utterance.current.lang = options.lang || 'en-US';

        const voices = synth.current.getVoices();
        const preferredVoice = voices.find(v =>
            (v.name.includes('Google') && v.lang.includes(options.lang || 'en')) ||
            v.name.includes('Samantha') ||
            v.lang === (options.lang || 'en-US')
        );
        if (preferredVoice) {
            utterance.current.voice = preferredVoice;
        }

        utterance.current.onstart = () => {
            setState(prev => ({ ...prev, isPlaying: true, isPaused: false, progress: 0 }));
        };

        utterance.current.onend = () => {
            setState(prev => ({ ...prev, isPlaying: false, isPaused: false, progress: 1, currentWord: '' }));
        };

        utterance.current.onpause = () => {
            setState(prev => ({ ...prev, isPaused: true }));
        };

        utterance.current.onresume = () => {
            setState(prev => ({ ...prev, isPaused: false }));
        };

        // Standard event handler
        utterance.current.onboundary = (event) => {
            const current = event.charIndex;
            setState(prev => ({
                ...prev,
                progress: text.length > 0 ? current / text.length : 0,
                // Simple word extraction based on index
                currentWord: text.substring(current, text.indexOf(' ', current) > -1 ? text.indexOf(' ', current) : undefined)
            }));
        };

        synth.current.speak(utterance.current);
    }, []);

    const pause = useCallback(() => {
        if (synth.current?.speaking && !synth.current.paused) {
            synth.current.pause();
        }
    }, []);

    const resume = useCallback(() => {
        if (synth.current?.paused) {
            synth.current.resume();
        }
    }, []);

    const stop = useCallback(() => {
        if (synth.current) {
            synth.current.cancel();
            setState(prev => ({ ...prev, isPlaying: false, isPaused: false, progress: 0 }));
        }
    }, []);

    return {
        speak,
        pause,
        resume,
        stop,
        ...state
    };
};
