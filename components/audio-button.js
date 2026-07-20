const AudioButton = {
    init: function() {
        document.querySelectorAll('[data-role="audio-button"]').forEach(button => {
            if (button.dataset.audioBound) return;
            button.dataset.audioBound = 'true';

            button.addEventListener('click', () => {
                const src = button.getAttribute('data-audio-src');
                const rawVol = button.getAttribute('data-audio-volume');
                const volume = (rawVol !== null && !isNaN(parseFloat(rawVol))) ? parseFloat(rawVol) : 1.0;
                if (src) {
                    this.playSound(src, volume);
                }
            });
        });
    },

    playSound: function(src, volume = 1.0) {
        if (!src) return;

        // Force fallback immediately only if requested via 'synth:'
        if (src.startsWith('synth:')) {
            this.playSynthSound(src, volume);
            return;
        }

        // Perform a quick HEAD check to see if the file exists without downloading the full body
        fetch(src, { method: 'HEAD' })
            .then(res => {
                if (res.ok) {
                    // File exists, play it!
                    const audio = new Audio(src);
                    audio.volume = parseFloat(volume) || 1.0;
                    audio.play().catch(err => {
                        console.warn(`FrankUI: Autoplay restricted for "${src}". Falling back to synthesizer tone.`, err);
                        this.playSynthSound(src, volume);
                    });
                } else {
                    // File does not exist, show dialog error
                    if (typeof Dialog !== 'undefined') {
                        Dialog.create({
                            title: 'Audio File Missing',
                            content: `The audio file "${src}" does not exist on the server (HTTP Status ${res.status}).`,
                            color: 'alert',
                            closeButton: true
                        });
                    } else {
                        alert(`The audio file "${src}" does not exist.`);
                    }
                }
            })
            .catch(err => {
                // Network error or CORS issue, fall back to synthesized audio directly
                console.warn(`FrankUI: Network check failed for "${src}". Falling back to synthesizer tone.`, err);
                this.playSynthSound(src, volume);
            });
    },

    playSynthSound: function(type, volume = 1.0) {
        try {
            if (!window.FrankUI_AudioContext) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) return;
                window.FrankUI_AudioContext = new AudioContext();
            }
            const ctx = window.FrankUI_AudioContext;

            const startSound = () => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                const now = ctx.currentTime;
                gain.gain.setValueAtTime(0, now);
                
                if (type.includes('click')) {
                    // Short clean click tick
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(1200, now);
                    osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);
                    gain.gain.setValueAtTime(volume * 0.4, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                    osc.start(now);
                    osc.stop(now + 0.05);
                } else if (type.includes('success')) {
                    // Happy upward arpeggio
                    osc.type = 'triangle';
                    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
                    const step = 0.06;
                    
                    notes.forEach((freq, idx) => {
                        const time = now + (idx * step);
                        osc.frequency.setValueAtTime(freq, time);
                    });
                    
                    gain.gain.setValueAtTime(volume * 0.25, now);
                    gain.gain.setValueAtTime(volume * 0.25, now + 0.18);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
                    
                    osc.start(now);
                    osc.stop(now + 0.3);
                } else if (type.includes('notification')) {
                    // Pleasant dual chime (A5 -> F5)
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(880, now);
                    osc.frequency.setValueAtTime(698.46, now + 0.1);
                    
                    gain.gain.setValueAtTime(volume * 0.25, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                    
                    osc.start(now);
                    osc.stop(now + 0.32);
                } else {
                    // Short generic beep
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(440, now);
                    gain.gain.setValueAtTime(volume * 0.25, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                    osc.start(now);
                    osc.stop(now + 0.15);
                }
            };

            // Handle suspended state asynchronously
            if (ctx.state === 'suspended') {
                ctx.resume().then(startSound);
            } else {
                startSound();
            }
        } catch (e) {
            console.error('FrankUI Synth Sound failure:', e);
        }
    }
};

window.AudioButton = AudioButton;
// Add FrankUI method exposure compatibility
window.FrankUI = window.FrankUI || {};
window.FrankUI.playSound = function(src, volume) {
    AudioButton.playSound(src, volume);
};
