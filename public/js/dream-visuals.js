class DreamVisuals {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        
        if (!this.canvas) {
            console.error('Canvas element not found:', canvasId);
            return;
        }

        // Check WebGL support
        if (!this.checkWebGLSupport()) {
            console.error('WebGL not supported');
            this.showWebGLError();
            return;
        }

        try {
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
            
            this.setupRenderer();
            this.setupLighting();
            this.setupCamera();
            
            this.dreamObjects = [];
            this.particles = null;
            this.currentMetaphor = null;
            this.animationId = null;
            
            // Bind resize handler
            window.addEventListener('resize', () => this.onWindowResize());
            
            this.startRenderLoop();
            
            console.log('DreamVisuals initialized successfully');
        } catch (error) {
            console.error('Error initializing DreamVisuals:', error);
            this.showInitError(error);
        }
    }

    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
        } catch (e) {
            return false;
        }
    }

    showWebGLError() {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.8); color: white; padding: 20px;
            border-radius: 10px; text-align: center; z-index: 1000;
        `;
        errorDiv.innerHTML = `
            <h3>WebGL Not Supported</h3>
            <p>Your browser doesn't support WebGL, which is required for 3D visuals.</p>
            <p>Please use a modern browser like Chrome, Firefox, or Safari.</p>
        `;
        document.body.appendChild(errorDiv);
    }

    showInitError(error) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: rgba(255, 100, 0, 0.8); color: white; padding: 20px;
            border-radius: 10px; text-align: center; z-index: 1000;
        `;
        errorDiv.innerHTML = `
            <h3>3D Initialization Error</h3>
            <p>Failed to initialize 3D graphics: ${error.message}</p>
            <p>Try refreshing the page or using a different browser.</p>
        `;
        document.body.appendChild(errorDiv);
    }

    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight - 80);
        this.renderer.setClearColor(0x001122, 1.0); // Slightly lighter background
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        console.log('Renderer setup complete, size:', window.innerWidth, 'x', window.innerHeight - 80);
    }

    setupLighting() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404080, 0.6); // Increased brightness
        this.scene.add(ambientLight);

        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0x64b5f6, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Point lights for atmosphere
        const pointLight1 = new THREE.PointLight(0x42a5f5, 0.5, 50);
        pointLight1.position.set(-10, 5, -10);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x1e88e5, 0.3, 30);
        pointLight2.position.set(10, -5, 10);
        this.scene.add(pointLight2);
    }

    setupCamera() {
        this.camera.position.set(0, 5, 15);
        this.camera.lookAt(0, 0, 0);
        
        // Camera setup complete
        console.log('Camera positioned at:', this.camera.position);
        
        // Add orbit controls for interaction
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.maxDistance = 50;
            this.controls.minDistance = 5;
        } else {
            console.warn('OrbitControls not loaded, using basic camera');
        }
    }

    createParticleSystem() {
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Random positions in a sphere
            const radius = Math.random() * 25 + 5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.cos(phi);
            positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
            
            // Dream-like colors
            const color = new THREE.Color();
            color.setHSL(Math.random() * 0.3 + 0.5, 0.7, 0.5 + Math.random() * 0.3);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    parseMetaphor(metaphor) {
        const keywords = {
            // Light and energy
            'light': { type: 'light', intensity: 0.8, color: 0xffffff },
            'sunlight': { type: 'light', intensity: 1.0, color: 0xffd700 },
            'moonlight': { type: 'light', intensity: 0.4, color: 0xc0c0ff },
            'starlight': { type: 'light', intensity: 0.6, color: 0xffffff },
            'glow': { type: 'glow', intensity: 0.6, color: 0x64b5f6 },
            'radiant': { type: 'glow', intensity: 0.8, color: 0xffaa00 },
            'luminous': { type: 'glow', intensity: 0.7, color: 0x00ffff },
            'glowing': { type: 'glow', intensity: 0.7, color: 0x00ff88 },
            
            // Nature elements
            'leaves': { type: 'organic', shape: 'leaf', count: 20, color: 0x32cd32 },
            'flowers': { type: 'organic', shape: 'flower', count: 15, color: 0xff69b4 },
            'trees': { type: 'organic', shape: 'tree', count: 5, color: 0x8b4513 },
            'forest': { type: 'organic', shape: 'tree', count: 10, color: 0x228b22 },
            'ocean': { type: 'fluid', movement: 'wave', color: 0x006994 },
            'water': { type: 'fluid', movement: 'flow', color: 0x4169e1 },
            'waves': { type: 'fluid', movement: 'wave', color: 0x00bfff },
            'clouds': { type: 'soft', movement: 'drift', color: 0xf0f8ff },
            'butterfly': { type: 'organic', shape: 'wing', color: 0xff6347 },
            'wings': { type: 'organic', shape: 'wing', color: 0xffa500 },
            'mountain': { type: 'geometric', shape: 'peak', color: 0x696969 },
            'peaks': { type: 'geometric', shape: 'peak', color: 0x708090 },
            
            // Abstract concepts
            'painting': { type: 'artistic', effect: 'brush', color: 0xff4500 },
            'dancing': { type: 'motion', pattern: 'dance', color: 0xff1493 },
            'floating': { type: 'motion', pattern: 'float', color: 0x87ceeb },
            'flowing': { type: 'motion', pattern: 'flow', color: 0x20b2aa },
            'weaving': { type: 'artistic', effect: 'weave', color: 0xdaa520 },
            'crystalline': { type: 'geometric', shape: 'crystal', color: 0x00ffff },
            'crystal': { type: 'geometric', shape: 'crystal', color: 0x00ced1 },
            'ethereal': { type: 'atmospheric', opacity: 0.3, color: 0xe6e6fa },
            'dreaming': { type: 'atmospheric', opacity: 0.4, color: 0x9370db },
            'dreams': { type: 'atmospheric', opacity: 0.4, color: 0x8a2be2 },
            
            // Colors
            'golden': { type: 'color', value: 0xffd700 },
            'silver': { type: 'color', value: 0xc0c0c0 },
            'blue': { type: 'color', value: 0x4169e1 },
            'purple': { type: 'color', value: 0x9370db },
            'green': { type: 'color', value: 0x32cd32 },
            'red': { type: 'color', value: 0xff0000 },
            'orange': { type: 'color', value: 0xffa500 },
            'pink': { type: 'color', value: 0xffc0cb },
            'white': { type: 'color', value: 0xffffff },
            
            // Specific topics
            'photosynthesis': { type: 'organic', shape: 'leaf', color: 0x32cd32 },
            'music': { type: 'motion', pattern: 'wave', color: 0x9370db },
            'fire': { type: 'light', intensity: 1.0, color: 0xff4500 },
            'ice': { type: 'geometric', shape: 'crystal', color: 0x87ceeb },
            'rainbow': { type: 'light', intensity: 0.8, color: 0xff69b4 }
        };
        
        const words = metaphor.toLowerCase().split(/\s+/);
        const elements = [];
        
        words.forEach(word => {
            if (keywords[word]) {
                elements.push({ word, ...keywords[word] });
            }
        });
        
        return elements.length > 0 ? elements : [{ type: 'default', word: 'dream' }];
    }

    generateVisualsFromMetaphor(metaphor) {
        this.clearDreamObjects();
        this.currentMetaphor = metaphor;
        
        const elements = this.parseMetaphor(metaphor);
        console.log('Parsed metaphor elements:', elements);
        
        elements.forEach((element, index) => {
            setTimeout(() => {
                this.createElementVisual(element, index);
            }, index * 500); // Stagger creation for dramatic effect
        });
        
        // Always create particle system for ambiance
        if (!this.particles) {
            this.createParticleSystem();
        }
        
        // Clear any test objects before adding dream visuals
        this.clearTestObjects();
        
        this.updateParticleColors(elements);
    }

    clearTestObjects() {
        // Remove test cube
        if (this.testCube) {
            this.scene.remove(this.testCube);
            this.testCube = null;
        }
        
        // Remove visibility indicator
        if (this.visibilityIndicator) {
            this.scene.remove(this.visibilityIndicator);
            this.visibilityIndicator = null;
        }
        
        console.log('Cleared test objects for dream visuals');
    }

    createElementVisual(element, index) {
        let mesh;
        const position = this.getRandomPosition(index);
        
        switch (element.type) {
            case 'organic':
                mesh = this.createOrganicShape(element);
                break;
            case 'geometric':
                mesh = this.createGeometricShape(element);
                break;
            case 'fluid':
                mesh = this.createFluidShape(element);
                break;
            case 'light':
                mesh = this.createLightSource(element);
                break;
            case 'glow':
                mesh = this.createGlowingObject(element);
                break;
            default:
                mesh = this.createDefaultDreamObject();
        }
        
        if (mesh) {
            mesh.position.copy(position);
            mesh.userData = { element, creationTime: Date.now() };
            this.scene.add(mesh);
            this.dreamObjects.push(mesh);
            
            console.log('Added dream object:', element.type, 'at position:', position);
            
            // Add entrance animation
            this.animateEntrance(mesh);
        }
    }

    createOrganicShape(element) {
        let geometry, material;
        
        // Create different shapes based on element properties
        if (element.shape === 'wing') {
            geometry = new THREE.ConeGeometry(2, 4, 8);
            material = new THREE.MeshPhongMaterial({
                color: element.color || 0xffa500,
                transparent: true,
                opacity: 0.8,
                shininess: 100
            });
        } else if (element.shape === 'leaf') {
            geometry = new THREE.PlaneGeometry(3, 5);
            material = new THREE.MeshPhongMaterial({
                color: element.color || 0x32cd32,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });
        } else {
            // Default organic shape
            geometry = new THREE.SphereGeometry(2.5, 16, 12);
            material = new THREE.MeshPhongMaterial({
                color: element.color || 0x32cd32,
                transparent: true,
                opacity: 0.8,
                shininess: 50
            });
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Deform for organic look
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += (Math.random() - 0.5) * 0.3;
            positions[i + 1] += (Math.random() - 0.5) * 0.3;
            positions[i + 2] += (Math.random() - 0.5) * 0.3;
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        
        return mesh;
    }

    createGeometricShape(element) {
        let geometry;
        
        if (element.shape === 'crystal') {
            geometry = new THREE.OctahedronGeometry(3);
        } else if (element.shape === 'peak') {
            geometry = new THREE.ConeGeometry(2, 6, 8);
        } else {
            geometry = new THREE.IcosahedronGeometry(2.5, 1);
        }
        
        const material = new THREE.MeshPhongMaterial({
            color: element.color || 0x64b5f6,
            transparent: true,
            opacity: 0.8,
            shininess: 100,
            wireframe: false
        });
        
        return new THREE.Mesh(geometry, material);
    }

    createFluidShape(element) {
        const geometry = new THREE.PlaneGeometry(3, 3, 10, 10);
        const material = new THREE.MeshPhongMaterial({
            color: element.color || 0x42a5f5,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Add wave-like deformation
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 2] = Math.sin(positions[i] * 2) * Math.cos(positions[i + 1] * 2) * 0.2;
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        
        return mesh;
    }

    createLightSource(element) {
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: element.color || 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Add point light
        const light = new THREE.PointLight(element.color || 0xffffff, element.intensity || 0.5, 20);
        mesh.add(light);
        
        return mesh;
    }

    createGlowingObject(element) {
        const geometry = new THREE.IcosahedronGeometry(1, 1);
        const material = new THREE.MeshPhongMaterial({
            color: element.color || 0x64b5f6,
            transparent: true,
            opacity: 0.7,
            emissive: element.color || 0x64b5f6,
            emissiveIntensity: 0.2
        });
        
        return new THREE.Mesh(geometry, material);
    }

    createDefaultDreamObject() {
        const geometry = new THREE.TorusGeometry(4, 1.5, 16, 32); // Much larger
        const material = new THREE.MeshBasicMaterial({
            color: 0x64b5f6,
            transparent: false,
            wireframe: false
        });
        
        return new THREE.Mesh(geometry, material);
    }

    getRandomPosition(index) {
        const angle = (index / 5) * Math.PI * 2;
        const radius = 3 + Math.random() * 5;
        const height = (Math.random() - 0.5) * 4;
        
        return new THREE.Vector3(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );
    }

    animateEntrance(mesh) {
        const startScale = 0.1;
        mesh.scale.setScalar(startScale);
        
        const animate = () => {
            const targetScale = 1;
            const currentScale = mesh.scale.x;
            const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.05);
            
            mesh.scale.setScalar(newScale);
            
            if (Math.abs(newScale - targetScale) > 0.01) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    updateParticleColors(elements) {
        if (!this.particles) return;
        
        const colors = this.particles.geometry.attributes.color.array;
        const dominantColor = elements.length > 0 && elements[0].color ? 
            new THREE.Color(elements[0].color) : 
            new THREE.Color(0x64b5f6);
        
        for (let i = 0; i < colors.length; i += 3) {
            const variation = new THREE.Color(dominantColor);
            variation.offsetHSL((Math.random() - 0.5) * 0.2, 0, (Math.random() - 0.5) * 0.3);
            
            colors[i] = variation.r;
            colors[i + 1] = variation.g;
            colors[i + 2] = variation.b;
        }
        
        this.particles.geometry.attributes.color.needsUpdate = true;
    }

    clearDreamObjects() {
        this.dreamObjects.forEach(obj => {
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
        this.dreamObjects = [];
    }

    animate() {
        const time = Date.now() * 0.001;
        
        // No test cube animation needed
        
        // Animate dream objects
        this.dreamObjects.forEach((obj, index) => {
            const element = obj.userData.element;
            
            // Rotation
            obj.rotation.x += 0.01;
            obj.rotation.y += 0.005;
            
            // Floating motion
            obj.position.y += Math.sin(time + index) * 0.01;
            
            // Pulsing for glowing objects
            if (element.type === 'glow' || element.type === 'light') {
                const scale = 1 + Math.sin(time * 2 + index) * 0.1;
                obj.scale.setScalar(scale);
            }
        });
        
        // Animate particles
        if (this.particles) {
            this.particles.rotation.y += 0.002;
            
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(time + i * 0.01) * 0.01;
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
    }

    startRenderLoop() {
        const render = () => {
            this.animationId = requestAnimationFrame(render);
            this.animate();
            this.renderer.render(this.scene, this.camera);
        };
        render();
    }

    stopRenderLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / (window.innerHeight - 80);
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight - 80);
    }

    dispose() {
        this.stopRenderLoop();
        this.clearDreamObjects();
        
        if (this.particles) {
            this.scene.remove(this.particles);
            this.particles.geometry.dispose();
            this.particles.material.dispose();
        }
        
        this.renderer.dispose();
    }
}

// Export for use in other modules
window.DreamVisuals = DreamVisuals;
