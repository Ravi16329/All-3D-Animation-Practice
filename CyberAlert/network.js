class Network {
    constructor(scene) {
        this.scene = scene;
        this.nodes = [];
        this.connections = [];
        this.messagePacket = null;
        this.createNetwork();
    }
    
    createNetwork() {
        this.createNetworkNodes();
        this.createConnections();
        this.createMessagePacket();
    }
    
    createNetworkNodes() {
        // Define network topology - nodes between Alice and Bob
        const nodePositions = [
            { x: -6, y: 0, z: 0, type: 'router' },
            { x: -3, y: 1, z: -1, type: 'server' },
            { x: 0, y: 0, z: 0, type: 'switch' },
            { x: 3, y: -1, z: 1, type: 'wifi' },
            { x: 6, y: 0, z: 0, type: 'router' }
        ];
        
        nodePositions.forEach((pos, index) => {
            const node = this.createNetworkNode(pos.type, pos.x, pos.y, pos.z);
            node.userData = { 
                id: index, 
                type: pos.type,
                isCompromised: false 
            };
            this.nodes.push(node);
            this.scene.add(node);
        });
    }
    
    createNetworkNode(type, x, y, z) {
        const group = new THREE.Group();
        
        // Base geometry varies by type
        let geometry, material;
        
        switch (type) {
            case 'router':
                geometry = new THREE.BoxGeometry(0.8, 0.4, 0.6);
                material = new THREE.MeshLambertMaterial({ color: 0x64748b });
                break;
            case 'server':
                geometry = new THREE.BoxGeometry(0.6, 1.2, 0.8);
                material = new THREE.MeshLambertMaterial({ color: 0x475569 });
                break;
            case 'switch':
                geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 8);
                material = new THREE.MeshLambertMaterial({ color: 0x6b7280 });
                break;
            case 'wifi':
                geometry = new THREE.ConeGeometry(0.4, 0.8, 6);
                material = new THREE.MeshLambertMaterial({ color: 0x7c3aed });
                break;
            default:
                geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
                material = new THREE.MeshLambertMaterial({ color: 0x64748b });
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
        
        // Add status light
        const lightGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const lightMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x22c55e,
            emissive: 0x004400
        });
        const statusLight = new THREE.Mesh(lightGeometry, lightMaterial);
        statusLight.position.y = geometry.parameters ? geometry.parameters.height/2 + 0.15 : 0.4;
        group.add(statusLight);
        
        // Store reference to status light
        group.userData.statusLight = statusLight;
        
        group.position.set(x, y, z);
        return group;
    }
    
    createConnections() {
        // Create lines between adjacent nodes
        for (let i = 0; i < this.nodes.length - 1; i++) {
            const startNode = this.nodes[i];
            const endNode = this.nodes[i + 1];
            
            const connection = this.createConnection(startNode.position, endNode.position);
            this.connections.push(connection);
            this.scene.add(connection);
        }
    }
    
    createConnection(startPos, endPos) {
        const points = [
            new THREE.Vector3(startPos.x, startPos.y, startPos.z),
            new THREE.Vector3(endPos.x, endPos.y, endPos.z)
        ];
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.6
        });
        
        const line = new THREE.Line(geometry, material);
        line.userData = { isActive: false };
        
        return line;
    }
    
    createMessagePacket() {
        // Create glowing message packet
        const geometry = new THREE.SphereGeometry(0.2, 16, 16);
        const material = new THREE.MeshLambertMaterial({ 
            color: 0xfbbf24,
            emissive: 0x332200
        });
        
        this.messagePacket = new THREE.Mesh(geometry, material);
        
        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const glowMaterial = new THREE.MeshLambertMaterial({
            color: 0xfbbf24,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.messagePacket.add(glow);
        
        // Position at Alice initially
        this.messagePacket.position.set(-8, 2.5, 0);
        this.messagePacket.visible = false;
        
        this.scene.add(this.messagePacket);
    }
    
    animateMessageTravel(onHopCallback, onCompleteCallback) {
        if (!this.messagePacket) return;
        
        this.messagePacket.visible = true;
        
        // Create path: Alice -> nodes -> Bob
        const path = [
            { x: -8, y: 2.5, z: 0 }, // Alice
            ...this.nodes.map(node => ({ 
                x: node.position.x, 
                y: node.position.y + 0.8, 
                z: node.position.z 
            })),
            { x: 8, y: 2.5, z: 0 } // Bob
        ];
        
        let currentHop = 0;
        
        const animateToNextHop = () => {
            if (currentHop >= path.length - 1) {
                if (onCompleteCallback) onCompleteCallback();
                return;
            }
            
            const nextPos = path[currentHop + 1];
            
            // Highlight current connection
            if (currentHop < this.connections.length) {
                this.highlightConnection(currentHop, true);
            }
            
            gsap.to(this.messagePacket.position, {
                duration: 1,
                x: nextPos.x,
                y: nextPos.y,
                z: nextPos.z,
                ease: "power2.inOut",
                onComplete: () => {
                    // Unhighlight connection
                    if (currentHop < this.connections.length) {
                        this.highlightConnection(currentHop, false);
                    }
                    
                    if (onHopCallback) onHopCallback(currentHop);
                    currentHop++;
                    
                    setTimeout(animateToNextHop, 300);
                }
            });
            
            // Bounce effect
            gsap.to(this.messagePacket.scale, {
                duration: 0.1,
                x: 1.3,
                y: 1.3,
                z: 1.3,
                yoyo: true,
                repeat: 1,
                ease: "power2.inOut"
            });
        };
        
        animateToNextHop();
    }
    
    highlightConnection(index, highlight) {
        if (index >= 0 && index < this.connections.length) {
            const connection = this.connections[index];
            connection.material.color.setHex(highlight ? 0xfbbf24 : 0x3b82f6);
            connection.material.opacity = highlight ? 1 : 0.6;
            connection.userData.isActive = highlight;
        }
    }
    
    compromiseNode(nodeIndex) {
        if (nodeIndex >= 0 && nodeIndex < this.nodes.length) {
            const node = this.nodes[nodeIndex];
            const statusLight = node.userData.statusLight;
            
            // Change status light to red
            statusLight.material.color.setHex(0xdc2626);
            statusLight.material.emissive.setHex(0x440000);
            
            // Add warning animation
            gsap.to(statusLight.scale, {
                duration: 0.2,
                x: 1.5,
                y: 1.5,
                z: 1.5,
                yoyo: true,
                repeat: -1,
                ease: "power2.inOut"
            });
            
            node.userData.isCompromised = true;
        }
    }
    
    interceptMessage(nodeIndex, onInterceptCallback) {
        if (nodeIndex >= 0 && nodeIndex < this.nodes.length) {
            const node = this.nodes[nodeIndex];
            
            // Stop message at this node
            gsap.killTweensOf(this.messagePacket.position);
            
            // Move message to compromised node
            gsap.to(this.messagePacket.position, {
                duration: 0.5,
                x: node.position.x,
                y: node.position.y + 0.8,
                z: node.position.z,
                ease: "power2.inOut",
                onComplete: () => {
                    // Change message color to indicate compromise
                    this.messagePacket.material.color.setHex(0xdc2626);
                    this.messagePacket.material.emissive.setHex(0x440000);
                    
                    if (onInterceptCallback) onInterceptCallback();
                }
            });
        }
    }
    
    resetNetwork() {
        // Reset all nodes
        this.nodes.forEach(node => {
            const statusLight = node.userData.statusLight;
            statusLight.material.color.setHex(0x22c55e);
            statusLight.material.emissive.setHex(0x004400);
            statusLight.scale.set(1, 1, 1);
            gsap.killTweensOf(statusLight.scale);
            node.userData.isCompromised = false;
        });
        
        // Reset connections
        this.connections.forEach(connection => {
            connection.material.color.setHex(0x3b82f6);
            connection.material.opacity = 0.6;
            connection.userData.isActive = false;
        });
        
        // Reset message packet
        if (this.messagePacket) {
            this.messagePacket.position.set(-8, 2.5, 0);
            this.messagePacket.material.color.setHex(0xfbbf24);
            this.messagePacket.material.emissive.setHex(0x332200);
            this.messagePacket.visible = false;
            this.messagePacket.scale.set(1, 1, 1);
            gsap.killTweensOf(this.messagePacket.position);
            gsap.killTweensOf(this.messagePacket.scale);
        }
    }
    
    getMessagePacket() {
        return this.messagePacket;
    }
    
    getNodes() {
        return this.nodes;
    }
}

// Export for use in other modules
window.Network = Network;