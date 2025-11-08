class Characters {
    constructor(scene) {
        this.scene = scene;
        this.characters = {};
        this.createCharacters();
    }
    
    createCharacters() {
        // Create Alice (sender)
        this.characters.alice = this.createCharacter('alice', 0x3b82f6, -8, 2, 0);
        
        // Create Bob (receiver)
        this.characters.bob = this.createCharacter('bob', 0x22c55e, 8, 2, 0);
        
        // Create Hacker (antagonist)
        this.characters.hacker = this.createCharacter('hacker', 0xdc2626, 0, -2, 2);
        this.characters.hacker.visible = false; // Hidden initially
        
        // Add labels
        this.addCharacterLabels();
    }
    
    createCharacter(name, color, x, y, z) {
        const group = new THREE.Group();
        
        // Body (cylinder)
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        
        // Head (sphere)
        const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
        const headMaterial = new THREE.MeshLambertMaterial({ color: color });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.5;
        
        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.15, 1.55, 0.25);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.15, 1.55, 0.25);
        
        // Character-specific features
        if (name === 'hacker') {
            // Add hood/hat for hacker
            const hatGeometry = new THREE.ConeGeometry(0.5, 0.3, 8);
            const hatMaterial = new THREE.MeshLambertMaterial({ color: 0x1f2937 });
            const hat = new THREE.Mesh(hatGeometry, hatMaterial);
            hat.position.y = 1.9;
            group.add(hat);
            
            // Red glowing eyes for hacker
            leftEye.material.color.setHex(0xff0000);
            rightEye.material.color.setHex(0xff0000);
            leftEye.material.emissive.setHex(0x330000);
            rightEye.material.emissive.setHex(0x330000);
        }
        
        // Assemble character
        group.add(body);
        group.add(head);
        group.add(leftEye);
        group.add(rightEye);
        
        // Position character
        group.position.set(x, y, z);
        
        // Add to scene
        this.scene.add(group);
        
        return group;
    }
    
    addCharacterLabels() {
        // Create text labels using CSS3D or simple geometry
        const loader = new THREE.FontLoader();
        
        // For now, use simple text geometry approximation with boxes
        this.createTextLabel('Alice', this.characters.alice.position.x, this.characters.alice.position.y + 2.5, this.characters.alice.position.z, 0x3b82f6);
        this.createTextLabel('Bob', this.characters.bob.position.x, this.characters.bob.position.y + 2.5, this.characters.bob.position.z, 0x22c55e);
        this.createTextLabel('Hacker', this.characters.hacker.position.x, this.characters.hacker.position.y + 2.5, this.characters.hacker.position.z, 0xdc2626);
    }
    
    createTextLabel(text, x, y, z, color) {
        // Create a simple text representation using boxes
        const textGroup = new THREE.Group();
        
        // Background panel
        const panelGeometry = new THREE.PlaneGeometry(1.5, 0.4);
        const panelMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x000000, 
            transparent: true, 
            opacity: 0.7 
        });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        
        // Border
        const borderGeometry = new THREE.EdgesGeometry(panelGeometry);
        const borderMaterial = new THREE.LineBasicMaterial({ color: color });
        const border = new THREE.LineSegments(borderGeometry, borderMaterial);
        
        textGroup.add(panel);
        textGroup.add(border);
        textGroup.position.set(x, y, z);
        
        // Make label always face camera
        textGroup.lookAt(0, y, 10);
        
        this.scene.add(textGroup);
        
        // Store reference
        if (text === 'Hacker') {
            textGroup.visible = false;
            this.hackerLabel = textGroup;
        }
    }
    
    animateCharacter(characterName, animation) {
        const character = this.characters[characterName];
        if (!character) return;
        
        switch (animation) {
            case 'wave':
                gsap.to(character.rotation, {
                    duration: 0.5,
                    z: 0.3,
                    yoyo: true,
                    repeat: 3,
                    ease: "power2.inOut"
                });
                break;
                
            case 'alert':
                gsap.to(character.scale, {
                    duration: 0.1,
                    x: 1.2,
                    y: 1.2,
                    z: 1.2,
                    yoyo: true,
                    repeat: 5,
                    ease: "power2.inOut"
                });
                break;
                
            case 'hide':
                gsap.to(character.scale, {
                    duration: 0.5,
                    x: 0,
                    y: 0,
                    z: 0,
                    ease: "power2.inOut"
                });
                break;
                
            case 'show':
                character.visible = true;
                if (this.hackerLabel && characterName === 'hacker') {
                    this.hackerLabel.visible = true;
                }
                gsap.fromTo(character.scale, 
                    { x: 0, y: 0, z: 0 },
                    { 
                        duration: 0.5,
                        x: 1,
                        y: 1,
                        z: 1,
                        ease: "back.out(1.7)"
                    }
                );
                break;
        }
    }
    
    getCharacter(name) {
        return this.characters[name];
    }
    
    resetCharacters() {
        Object.values(this.characters).forEach(character => {
            character.visible = true;
            character.scale.set(1, 1, 1);
            character.rotation.set(0, 0, 0);
        });
        
        // Hide hacker initially
        this.characters.hacker.visible = false;
        if (this.hackerLabel) {
            this.hackerLabel.visible = false;
        }
    }
}

// Export for use in other modules
window.Characters = Characters;