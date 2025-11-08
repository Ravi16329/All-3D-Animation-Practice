class CybersecurityApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.characters = null;
        this.network = null;
        this.securityControls = null;
        this.audioManager = null;
        this.scriptManager = null;
        
        this.isAnimating = false;
        this.currentAnimation = null;
        
        this.init();
    }
    
    init() {
        this.setupScene();
        this.setupLighting();
        this.setupCamera();
        this.setupRenderer();
        
        // Initialize managers
        this.audioManager = new AudioManager();
        this.scriptManager = new ScriptManager();
        
        // Initialize 3D components
        this.characters = new Characters(this.scene);
        this.network = new Network(this.scene);
        this.securityControls = new SecurityControls(this.scene, this.audioManager);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start render loop
        this.animate();
        
        // Hide loading screen
        this.hideLoadingScreen();
        
        // Initialize UI
        this.scriptManager.updateUI();
        
        // Make app globally accessible
        window.cybersecurityApp = this;
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0f172a);
        
        // Add fog for depth
        this.scene.fog = new THREE.Fog(0x0f172a, 10, 50);
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Fill light
        const fillLight = new THREE.DirectionalLight(0x3b82f6, 0.3);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);
        
        // Rim light
        const rimLight = new THREE.DirectionalLight(0x8b5cf6, 0.2);
        rimLight.position.set(0, 5, -10);
        this.scene.add(rimLight);
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 12);
        this.camera.lookAt(0, 0, 0);
    }
    
    setupRenderer() {
        const canvas = document.getElementById('three-canvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Keyboard controls
        window.addEventListener('keydown', (event) => this.onKeyDown(event));
        
        // Mouse controls for camera (optional)
        this.setupCameraControls();
    }
    
    setupCameraControls() {
        let isMouseDown = false;
        let mouseX = 0;
        let mouseY = 0;
        
        const canvas = this.renderer.domElement;
        
        canvas.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        canvas.addEventListener('mousemove', (event) => {
            if (!isMouseDown) return;
            
            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;
            
            // Rotate camera around scene
            const spherical = new THREE.Spherical();
            spherical.setFromVector3(this.camera.position);
            
            spherical.theta -= deltaX * 0.01;
            spherical.phi += deltaY * 0.01;
            
            // Limit vertical rotation
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
            
            this.camera.position.setFromSpherical(spherical);
            this.camera.lookAt(0, 0, 0);
            
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        canvas.addEventListener('mouseup', () => {
            isMouseDown = false;
        });
        
        // Zoom with mouse wheel
        canvas.addEventListener('wheel', (event) => {
            const zoomSpeed = 0.1;
            const direction = event.deltaY > 0 ? 1 : -1;
            
            this.camera.position.multiplyScalar(1 + direction * zoomSpeed);
            
            // Limit zoom
            const distance = this.camera.position.length();
            if (distance < 5) {
                this.camera.position.normalize().multiplyScalar(5);
            } else if (distance > 25) {
                this.camera.position.normalize().multiplyScalar(25);
            }
        });
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    onKeyDown(event) {
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                this.scriptManager.togglePlayPause();
                break;
            case 'KeyR':
                this.scriptManager.restart();
                break;
            case 'KeyM':
                this.scriptManager.toggleMute();
                break;
            case 'ArrowLeft':
                this.scriptManager.previousScene();
                this.onSceneChange(this.scriptManager.getCurrentScene());
                break;
            case 'ArrowRight':
                this.scriptManager.nextScene();
                this.onSceneChange(this.scriptManager.getCurrentScene());
                break;
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update any ongoing animations
        this.updateAnimations();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    updateAnimations() {
        // Add any per-frame animation updates here
        // For example, rotating elements, particle systems, etc.
        
        // Gentle camera sway if not manually controlled
        if (!this.isAnimating) {
            const time = Date.now() * 0.0005;
            this.camera.position.x += Math.sin(time) * 0.01;
            this.camera.position.y += Math.cos(time * 0.7) * 0.005;
            this.camera.lookAt(0, 0, 0);
        }
    }
    
    onSceneChange(scene) {
        if (!scene) return;
        
        console.log('Scene changed to:', scene.id);
        
        // Handle scene-specific animations
        switch (scene.id) {
            case 'hook':
                this.animateHookScene();
                break;
            case 'travel':
                this.animateTravelScene();
                break;
            case 'intercept':
                this.animateInterceptScene();
                break;
            case 'consequences':
                this.animateConsequencesScene();
                break;
            case 'defense-encryption':
                this.animateDefenseScene('encryption');
                break;
            case 'defense-authentication':
                this.animateDefenseScene('authentication');
                break;
            case 'defense-integrity':
                this.animateDefenseScene('integrity');
                break;
            case 'defense-network':
                this.animateDefenseScene('network');
                break;
            case 'defense-endpoint':
                this.animateDefenseScene('endpoint');
                break;
            case 'wrap':
                this.animateWrapScene();
                break;
        }
    }
    
    animateHookScene() {
        // Introduce characters
        this.characters.animateCharacter('alice', 'wave');
        setTimeout(() => {
            this.characters.animateCharacter('bob', 'wave');
        }, 1000);
        
        // Camera focus on characters
        gsap.to(this.camera.position, {
            duration: 2,
            x: 0,
            y: 3,
            z: 15,
            ease: "power2.inOut"
        });
    }
    
    animateTravelScene() {
        // Start message travel animation
        this.network.animateMessageTravel(
            (hopIndex) => {
                // Play hop sound
                this.audioManager.play('messageHop');
            },
            () => {
                console.log('Message travel complete');
            }
        );
        
        // Camera follows message
        gsap.to(this.camera.position, {
            duration: 3,
            x: 2,
            y: 2,
            z: 10,
            ease: "power2.inOut"
        });
    }
    
    animateInterceptScene() {
        // Show hacker
        this.characters.animateCharacter('hacker', 'show');
        
        // Compromise a network node
        setTimeout(() => {
            this.network.compromiseNode(2); // Middle node
            this.audioManager.play('intercept');
        }, 1000);
        
        // Intercept message
        setTimeout(() => {
            this.network.interceptMessage(2, () => {
                this.characters.animateCharacter('alice', 'alert');
                this.characters.animateCharacter('bob', 'alert');
            });
        }, 2000);
    }
    
    animateConsequencesScene() {
        // Show rapid visual consequences
        const consequences = [
            { text: 'Data Leak', color: 0xdc2626, position: { x: -3, y: 3, z: 0 } },
            { text: 'Identity Theft', color: 0xea580c, position: { x: 0, y: 4, z: 0 } },
            { text: 'Ransomware', color: 0x7c2d12, position: { x: 3, y: 3, z: 0 } }
        ];
        
        consequences.forEach((consequence, index) => {
            setTimeout(() => {
                this.showConsequenceAlert(consequence);
            }, index * 500);
        });
    }
    
    showConsequenceAlert(consequence) {
        // Create warning icon
        const geometry = new THREE.OctahedronGeometry(0.3);
        const material = new THREE.MeshLambertMaterial({ 
            color: consequence.color,
            emissive: consequence.color,
            emissiveIntensity: 0.3
        });
        const alert = new THREE.Mesh(geometry, material);
        alert.position.set(consequence.position.x, consequence.position.y, consequence.position.z);
        
        this.scene.add(alert);
        
        // Animate alert
        gsap.fromTo(alert.scale,
            { x: 0, y: 0, z: 0 },
            {
                duration: 0.5,
                x: 1,
                y: 1,
                z: 1,
                ease: "back.out(1.7)"
            }
        );
        
        // Remove after animation
        setTimeout(() => {
            this.scene.remove(alert);
        }, 3000);
    }
    
    animateDefenseScene(controlName) {
        // Activate security control
        this.securityControls.activateControl(controlName, () => {
            // Demonstrate defense
            this.securityControls.demonstrateDefense(
                controlName,
                this.network.getMessagePacket(),
                this.characters.getCharacter('hacker'),
                () => {
                    console.log(`${controlName} defense demonstrated`);
                }
            );
        });
    }
    
    animateWrapScene() {
        // Show all security controls active
        ['encryption', 'authentication', 'integrity', 'network', 'endpoint'].forEach((control, index) => {
            setTimeout(() => {
                this.securityControls.activateControl(control);
            }, index * 200);
        });
        
        // Animate successful message delivery
        setTimeout(() => {
            const messagePacket = this.network.getMessagePacket();
            if (messagePacket) {
                gsap.to(messagePacket.position, {
                    duration: 2,
                    x: 8,
                    y: 2.5,
                    z: 0,
                    ease: "power2.inOut",
                    onComplete: () => {
                        this.audioManager.play('success');
                        this.characters.animateCharacter('bob', 'wave');
                    }
                });
            }
        }, 2000);
        
        // Final camera position
        gsap.to(this.camera.position, {
            duration: 3,
            x: 0,
            y: 8,
            z: 20,
            ease: "power2.inOut"
        });
    }
    
    resetAnimation() {
        // Reset all components
        this.characters.resetCharacters();
        this.network.resetNetwork();
        this.securityControls.resetControls();
        
        // Reset camera
        gsap.to(this.camera.position, {
            duration: 1,
            x: 0,
            y: 5,
            z: 12,
            ease: "power2.inOut"
        });
        
        this.isAnimating = false;
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 1000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CybersecurityApp();
});