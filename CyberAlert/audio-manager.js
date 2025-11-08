class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.isMuted = false;
        this.masterVolume = 0.3;
        
        this.initAudioContext();
        this.createSounds();
    }
    
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }
    
    createSounds() {
        // Create synthetic sounds using Web Audio API
        this.sounds = {
            messageHop: () => this.createTone(800, 0.1, 'sine'),
            intercept: () => this.createAlarm(),
            success: () => this.createSuccessSound(),
            defense: () => this.createDefenseSound(),
            transition: () => this.createTone(400, 0.2, 'triangle')
        };
    }
    
    createTone(frequency, duration, type = 'sine') {
        if (!this.audioContext || this.isMuted) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.1, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    createAlarm() {
        if (!this.audioContext || this.isMuted) return;
        
        // Create warning alarm sound
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.createTone(1000, 0.1, 'square');
                setTimeout(() => this.createTone(800, 0.1, 'square'), 100);
            }, i * 200);
        }
    }
    
    createSuccessSound() {
        if (!this.audioContext || this.isMuted) return;
        
        // Create ascending success sound
        const frequencies = [523, 659, 784]; // C, E, G
        frequencies.forEach((freq, index) => {
            setTimeout(() => this.createTone(freq, 0.2, 'sine'), index * 100);
        });
    }
    
    createDefenseSound() {
        if (!this.audioContext || this.isMuted) return;
        
        // Create shield activation sound
        this.createTone(600, 0.3, 'sawtooth');
    }
    
    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }
    
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
}

// Export for use in other modules
window.AudioManager = AudioManager;