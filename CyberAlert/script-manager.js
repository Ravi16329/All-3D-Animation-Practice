class ScriptManager {
    constructor() {
        this.scenes = [
            {
                id: 'hook',
                title: 'The Journey Begins',
                description: 'Understanding message transmission',
                dialogue: "Imagine sending a private message. It doesn't fly directly — it hops through many devices. Who might touch it?",
                duration: 15000 // 15 seconds
            },
            {
                id: 'travel',
                title: 'Network Traversal',
                description: 'Messages hop through network nodes',
                dialogue: "Every hop is a new risk. Routers, servers, public Wi-Fi — any one of them can be exploited.",
                duration: 15000 // 15 seconds
            },
            {
                id: 'intercept',
                title: 'The Attack',
                description: 'Hacker intercepts the message',
                dialogue: "Here's the attacker. They can read, alter, or replay the message.",
                duration: 15000 // 15 seconds
            },
            {
                id: 'consequences',
                title: 'Impact Assessment',
                description: 'Showing the potential damage',
                dialogue: "That single intercept can become identity theft, data leaks, or ransomware.",
                duration: 15000 // 15 seconds
            },
            {
                id: 'defense-encryption',
                title: 'Defense: Encryption',
                description: 'TLS encryption protects content',
                dialogue: "Encryption scrambles content — unreadable to eavesdroppers.",
                duration: 12000 // 12 seconds
            },
            {
                id: 'defense-authentication',
                title: 'Defense: Authentication',
                description: 'Multi-factor authentication',
                dialogue: "Strong authentication ensures only the rightful receiver reads it.",
                duration: 12000 // 12 seconds
            },
            {
                id: 'defense-integrity',
                title: 'Defense: Integrity',
                description: 'Digital signatures prevent tampering',
                dialogue: "Digital signatures prove messages weren't tampered with.",
                duration: 12000 // 12 seconds
            },
            {
                id: 'defense-network',
                title: 'Defense: Network Security',
                description: 'Firewalls and intrusion detection',
                dialogue: "Firewalls and IDS detect and stop suspicious traffic.",
                duration: 12000 // 12 seconds
            },
            {
                id: 'defense-endpoint',
                title: 'Defense: Endpoint Security',
                description: 'Device security and patching',
                dialogue: "Secure devices and timely patches remove hacker footholds.",
                duration: 12000 // 12 seconds
            },
            {
                id: 'wrap',
                title: 'Layered Security',
                description: 'Multiple defenses working together',
                dialogue: "Security isn't one thing — it's many layers. If you do these basics, you make intercepts much harder.",
                duration: 18000 // 18 seconds
            }
        ];
        
        this.currentSceneIndex = 0;
        this.isPlaying = false;
        this.startTime = 0;
        this.pausedTime = 0;
        
        this.subtitleElement = document.getElementById('subtitle-text');
        this.sceneTitleElement = document.getElementById('scene-title');
        this.sceneDescriptionElement = document.getElementById('scene-description');
        this.progressFillElement = document.getElementById('progress-fill');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Play/Pause button
        const playPauseBtn = document.getElementById('play-pause-btn');
        playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        
        // Restart button
        const restartBtn = document.getElementById('restart-btn');
        restartBtn.addEventListener('click', () => this.restart());
        
        // Mute button
        const muteBtn = document.getElementById('mute-btn');
        muteBtn.addEventListener('click', () => this.toggleMute());
    }
    
    getCurrentScene() {
        return this.scenes[this.currentSceneIndex];
    }
    
    updateUI() {
        const scene = this.getCurrentScene();
        
        // Update scene info
        this.sceneTitleElement.textContent = scene.title;
        this.sceneDescriptionElement.textContent = scene.description;
        
        // Show subtitle with animation
        this.showSubtitle(scene.dialogue);
        
        // Update progress bar
        const totalDuration = this.scenes.reduce((sum, s) => sum + s.duration, 0);
        const elapsedDuration = this.scenes.slice(0, this.currentSceneIndex)
            .reduce((sum, s) => sum + s.duration, 0);
        const progress = (elapsedDuration / totalDuration) * 100;
        this.progressFillElement.style.width = `${progress}%`;
        
        // Show security legend during defense scenes
        const securityLegend = document.getElementById('security-legend');
        if (scene.id.startsWith('defense-')) {
            securityLegend.style.display = 'block';
        } else if (scene.id === 'wrap') {
            // Keep it visible for wrap scene
        } else {
            securityLegend.style.display = 'none';
        }
    }
    
    showSubtitle(text) {
        // Hide current subtitle
        this.subtitleElement.classList.remove('show');
        
        setTimeout(() => {
            this.subtitleElement.textContent = text;
            this.subtitleElement.classList.add('show');
        }, 200);
    }
    
    nextScene() {
        if (this.currentSceneIndex < this.scenes.length - 1) {
            this.currentSceneIndex++;
            this.updateUI();
            return true;
        }
        return false; // End of presentation
    }
    
    previousScene() {
        if (this.currentSceneIndex > 0) {
            this.currentSceneIndex--;
            this.updateUI();
            return true;
        }
        return false;
    }
    
    goToScene(sceneIndex) {
        if (sceneIndex >= 0 && sceneIndex < this.scenes.length) {
            this.currentSceneIndex = sceneIndex;
            this.updateUI();
            return true;
        }
        return false;
    }
    
    play() {
        this.isPlaying = true;
        this.startTime = Date.now() - this.pausedTime;
        this.updatePlayPauseButton();
        
        // Start scene timer
        this.scheduleNextScene();
    }
    
    pause() {
        this.isPlaying = false;
        this.pausedTime = Date.now() - this.startTime;
        this.updatePlayPauseButton();
        
        // Clear any pending scene transitions
        if (this.sceneTimer) {
            clearTimeout(this.sceneTimer);
            this.sceneTimer = null;
        }
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    restart() {
        this.pause();
        this.currentSceneIndex = 0;
        this.pausedTime = 0;
        this.updateUI();
        
        // Notify main application to reset
        if (window.cybersecurityApp) {
            window.cybersecurityApp.resetAnimation();
        }
    }
    
    toggleMute() {
        const muteBtn = document.getElementById('mute-btn');
        if (window.audioManager) {
            const isMuted = window.audioManager.toggleMute();
            muteBtn.textContent = isMuted ? '🔇' : '🔊';
        }
    }
    
    updatePlayPauseButton() {
        const playIcon = document.querySelector('.play-icon');
        const pauseIcon = document.querySelector('.pause-icon');
        
        if (this.isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'inline';
        } else {
            playIcon.style.display = 'inline';
            pauseIcon.style.display = 'none';
        }
    }
    
    scheduleNextScene() {
        if (!this.isPlaying) return;
        
        const currentScene = this.getCurrentScene();
        const remainingTime = currentScene.duration - this.pausedTime;
        
        this.sceneTimer = setTimeout(() => {
            if (this.isPlaying) {
                const hasNext = this.nextScene();
                if (hasNext) {
                    this.pausedTime = 0; // Reset for next scene
                    
                    // Notify main application of scene change
                    if (window.cybersecurityApp) {
                        window.cybersecurityApp.onSceneChange(this.getCurrentScene());
                    }
                    
                    this.scheduleNextScene();
                } else {
                    // End of presentation
                    this.pause();
                    this.showCompletionMessage();
                }
            }
        }, remainingTime);
    }
    
    showCompletionMessage() {
        this.showSubtitle("Animation complete! Click restart to watch again or explore the interactive elements.");
        
        // Update scene info
        this.sceneTitleElement.textContent = "Complete";
        this.sceneDescriptionElement.textContent = "Thank you for watching! Share this with others to spread cybersecurity awareness.";
    }
    
    getSceneById(sceneId) {
        return this.scenes.find(scene => scene.id === sceneId);
    }
    
    getTotalDuration() {
        return this.scenes.reduce((sum, scene) => sum + scene.duration, 0);
    }
    
    getCurrentProgress() {
        const elapsedScenes = this.scenes.slice(0, this.currentSceneIndex);
        const elapsedTime = elapsedScenes.reduce((sum, scene) => sum + scene.duration, 0);
        const currentSceneProgress = this.isPlaying ? (Date.now() - this.startTime) : this.pausedTime;
        
        return (elapsedTime + currentSceneProgress) / this.getTotalDuration();
    }
}

// Export for use in other modules
window.ScriptManager = ScriptManager;