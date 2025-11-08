class SecurityControls {
    constructor(scene, audioManager) {
        this.scene = scene;
        this.audioManager = audioManager;
        this.controls = {};
        this.createSecurityControls();
    }
    
    createSecurityControls() {
        // Create visual representations of security controls
        this.controls = {
            encryption: this.createEncryptionControl(),
            authentication: this.createAuthenticationControl(),
            integrity: this.createIntegrityControl(),
            network: this.createNetworkControl(),
            endpoint: this.createEndpointControl()
        };
        
        // Initially hide all controls
        Object.values(this.controls).forEach(control => {
            control.visible = false;
        });
    }
    
    createEncryptionControl() {
        const group = new THREE.Group();
        
        // Create lock icon
        const lockGeometry = new THREE.BoxGeometry(0.4, 0.6, 0.2);
        const lockMaterial = new THREE.MeshLambertMaterial({ color: 0x3b82f6 });
        const lock = new THREE.Mesh(lockGeometry, lockMaterial);
        
        // Lock shackle
        const shackleGeometry = new THREE.TorusGeometry(0.25, 0.05, 8, 16, Math.PI);
        const shackleMaterial = new THREE.MeshLambertMaterial({ color: 0x3b82f6 });
        const shackle = new THREE.Mesh(shackleGeometry, shackleMaterial);
        shackle.position.y = 0.4;
        shackle.rotation.x = Math.PI;
        
        group.add(lock);
        group.add(shackle);
        group.position.set(-4, 3, 0);
        
        this.scene.add(group);
        return group;
    }
    
    createAuthenticationControl() {
        const group = new THREE.Group();
        
        // Create fingerprint icon (simplified)
        const fingerprintGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
        const fingerprintMaterial = new THREE.MeshLambertMaterial({ color: 0x8b5cf6 });
        const fingerprint = new THREE.Mesh(fingerprintGeometry, fingerprintMaterial);
        
        // Add rings for fingerprint pattern
        for (let i = 1; i <= 3; i++) {
            const ringGeometry = new THREE.TorusGeometry(0.1 * i, 0.02, 8, 16);
            const ringMaterial = new THREE.MeshLambertMaterial({ color: 0x8b5cf6 });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = 0.06;
            fingerprint.add(ring);
        }
        
        group.add(fingerprint);
        group.position.set(-2, 3, 0);
        
        this.scene.add(group);
        return group;
    }
    
    createIntegrityControl() {
        const group = new THREE.Group();
        
        // Create signature stamp
        const stampGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 8);
        const stampMaterial = new THREE.MeshLambertMaterial({ color: 0x22c55e });
        const stamp = new THREE.Mesh(stampGeometry, stampMaterial);
        
        // Add handle
        const handleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8);
        const handleMaterial = new THREE.MeshLambertMaterial({ color: 0x16a34a });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.y = 0.35;
        
        group.add(stamp);
        group.add(handle);
        group.position.set(0, 3, 0);
        
        this.scene.add(group);
        return group;
    }
    
    createNetworkControl() {
        const group = new THREE.Group();
        
        // Create shield/firewall
        const shieldGeometry = new THREE.ConeGeometry(0.5, 0.8, 6);
        const shieldMaterial = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
        const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
        shield.rotation.x = Math.PI;
        
        // Add radar rings
        for (let i = 1; i <= 2; i++) {
            const radarGeometry = new THREE.TorusGeometry(0.3 * i, 0.02, 8, 16);
            const radarMaterial = new THREE.MeshLambertMaterial({ 
                color: 0xf59e0b,
                transparent: true,
                opacity: 0.5
            });
            const radar = new THREE.Mesh(radarGeometry, radarMaterial);
            radar.rotation.x = Math.PI / 2;
            shield.add(radar);
        }
        
        group.add(shield);
        group.position.set(2, 3, 0);
        
        this.scene.add(group);
        return group;
    }
    
    createEndpointControl() {
        const group = new THREE.Group();
        
        // Create gear icon
        const gearGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 8);
        const gearMaterial = new THREE.MeshLambertMaterial({ color: 0x64748b });
        const gear = new THREE.Mesh(gearGeometry, gearMaterial);
        
        // Add gear teeth
        for (let i = 0; i < 8; i++) {
            const toothGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.1);
            const toothMaterial = new THREE.MeshLambertMaterial({ color: 0x64748b });
            const tooth = new THREE.Mesh(toothGeometry, toothMaterial);
            
            const angle = (i / 8) * Math.PI * 2;
            tooth.position.x = Math.cos(angle) * 0.45;
            tooth.position.z = Math.sin(angle) * 0.45;
            
            gear.add(tooth);
        }
        
        group.add(gear);
        group.position.set(4, 3, 0);
        
        this.scene.add(group);
        return group;
    }
    
    activateControl(controlName, onCompleteCallback) {
        const control = this.controls[controlName];
        if (!control) return;
        
        // Show control
        control.visible = true;
        
        // Play defense sound
        if (this.audioManager) {
            this.audioManager.play('defense');
        }
        
        // Animate control activation
        gsap.fromTo(control.scale,
            { x: 0, y: 0, z: 0 },
            {
                duration: 0.5,
                x: 1.5,
                y: 1.5,
                z: 1.5,
                ease: "back.out(1.7)",
                onComplete: () => {
                    // Add glow effect
                    this.addGlowEffect(control);
                    
                    // Update UI
                    this.updateControlStatus(controlName, 'active');
                    
                    if (onCompleteCallback) onCompleteCallback();
                }
            }
        );
        
        // Rotation animation
        gsap.to(control.rotation, {
            duration: 2,
            y: Math.PI * 2,
            ease: "none",
            repeat: -1
        });
    }
    
    addGlowEffect(control) {
        // Add glowing outline
        const glowGeometry = control.children[0].geometry.clone();
        const glowMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.scale.set(1.2, 1.2, 1.2);
        control.add(glow);
        
        // Pulsing animation
        gsap.to(glow.material, {
            duration: 1,
            opacity: 0.1,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
        });
    }
    
    updateControlStatus(controlName, status) {
        const statusElement = document.getElementById(`${controlName}-status`);
        if (statusElement) {
            switch (status) {
                case 'active':
                    statusElement.textContent = '🔄';
                    break;
                case 'completed':
                    statusElement.textContent = '✅';
                    break;
                default:
                    statusElement.textContent = '⏳';
            }
        }
        
        // Update control item class
        const controlItem = document.querySelector(`[data-control="${controlName}"]`);
        if (controlItem) {
            controlItem.classList.add(status);
        }
    }
    
    demonstrateDefense(controlName, messagePacket, hackerCharacter, onCompleteCallback) {
        switch (controlName) {
            case 'encryption':
                this.demonstrateEncryption(messagePacket, hackerCharacter, onCompleteCallback);
                break;
            case 'authentication':
                this.demonstrateAuthentication(messagePacket, hackerCharacter, onCompleteCallback);
                break;
            case 'integrity':
                this.demonstrateIntegrity(messagePacket, hackerCharacter, onCompleteCallback);
                break;
            case 'network':
                this.demonstrateNetworkDefense(messagePacket, hackerCharacter, onCompleteCallback);
                break;
            case 'endpoint':
                this.demonstrateEndpointSecurity(messagePacket, hackerCharacter, onCompleteCallback);
                break;
        }
    }
    
    demonstrateEncryption(messagePacket, hackerCharacter, onCompleteCallback) {
        // Create encryption envelope around message
        const envelopeGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.4);
        const envelopeMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.7
        });
        const envelope = new THREE.Mesh(envelopeGeometry, envelopeMaterial);
        envelope.position.copy(messagePacket.position);
        
        this.scene.add(envelope);
        
        // Animate hacker bouncing off
        gsap.to(hackerCharacter.position, {
            duration: 0.3,
            x: hackerCharacter.position.x - 1,
            yoyo: true,
            repeat: 1,
            ease: "power2.out",
            onComplete: () => {
                this.updateControlStatus('encryption', 'completed');
                if (onCompleteCallback) onCompleteCallback();
            }
        });
        
        // Remove envelope after demonstration
        setTimeout(() => {
            this.scene.remove(envelope);
        }, 2000);
    }
    
    demonstrateAuthentication(messagePacket, hackerCharacter, onCompleteCallback) {
        // Show authentication challenge
        const challengeGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const challengeMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.8
        });
        const challenge = new THREE.Mesh(challengeGeometry, challengeMaterial);
        challenge.position.set(6, 2.5, 0); // Near Bob
        
        this.scene.add(challenge);
        
        // Animate authentication failure for hacker
        gsap.to(challenge.scale, {
            duration: 0.5,
            x: 0,
            y: 0,
            z: 0,
            delay: 1,
            onComplete: () => {
                this.scene.remove(challenge);
                this.updateControlStatus('authentication', 'completed');
                if (onCompleteCallback) onCompleteCallback();
            }
        });
    }
    
    demonstrateIntegrity(messagePacket, hackerCharacter, onCompleteCallback) {
        // Show signature verification
        const signatureGeometry = new THREE.RingGeometry(0.2, 0.4, 16);
        const signatureMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x22c55e,
            transparent: true,
            opacity: 0.8
        });
        const signature = new THREE.Mesh(signatureMaterial, signatureMaterial);
        signature.position.copy(messagePacket.position);
        signature.position.y += 0.5;
        
        this.scene.add(signature);
        
        // Animate signature validation
        gsap.to(signature.rotation, {
            duration: 1,
            z: Math.PI * 2,
            onComplete: () => {
                this.scene.remove(signature);
                this.updateControlStatus('integrity', 'completed');
                if (onCompleteCallback) onCompleteCallback();
            }
        });
    }
    
    demonstrateNetworkDefense(messagePacket, hackerCharacter, onCompleteCallback) {
        // Create firewall barrier
        const barrierGeometry = new THREE.PlaneGeometry(2, 3);
        const barrierMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xf59e0b,
            transparent: true,
            opacity: 0.6
        });
        const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
        barrier.position.set(1, 1, 0);
        
        this.scene.add(barrier);
        
        // Animate hacker being blocked
        gsap.to(hackerCharacter.position, {
            duration: 0.5,
            z: hackerCharacter.position.z - 2,
            onComplete: () => {
                this.scene.remove(barrier);
                this.updateControlStatus('network', 'completed');
                if (onCompleteCallback) onCompleteCallback();
            }
        });
    }
    
    demonstrateEndpointSecurity(messagePacket, hackerCharacter, onCompleteCallback) {
        // Show security update
        const updateGeometry = new THREE.OctahedronGeometry(0.3);
        const updateMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x64748b,
            transparent: true,
            opacity: 0.8
        });
        const update = new THREE.Mesh(updateGeometry, updateMaterial);
        update.position.set(8, 3, 0); // Near Bob
        
        this.scene.add(update);
        
        // Animate hacker fading away
        gsap.to(hackerCharacter.material.opacity, {
            duration: 1,
            opacity: 0,
            onComplete: () => {
                this.scene.remove(update);
                this.updateControlStatus('endpoint', 'completed');
                if (onCompleteCallback) onCompleteCallback();
            }
        });
    }
    
    resetControls() {
        Object.values(this.controls).forEach(control => {
            control.visible = false;
            control.scale.set(1, 1, 1);
            control.rotation.set(0, 0, 0);
            gsap.killTweensOf(control.scale);
            gsap.killTweensOf(control.rotation);
            
            // Remove glow effects
            const glowElements = control.children.filter(child => 
                child.material && child.material.transparent && child.material.opacity < 1
            );
            glowElements.forEach(glow => control.remove(glow));
        });
        
        // Reset UI status
        ['encryption', 'authentication', 'integrity', 'network', 'endpoint'].forEach(controlName => {
            this.updateControlStatus(controlName, 'pending');
            const controlItem = document.querySelector(`[data-control="${controlName}"]`);
            if (controlItem) {
                controlItem.classList.remove('active', 'completed');
            }
        });
    }
}

// Export for use in other modules
window.SecurityControls = SecurityControls;