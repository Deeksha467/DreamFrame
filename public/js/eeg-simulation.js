class EEGSimulator {
    constructor() {
        this.isActive = false;
        this.alphaWave = 0;
        this.thetaWave = 0;
        this.drowsinessThreshold = 0.7;
        this.drowsinessStartTime = null;
        this.drowsinessCallbacks = [];
        this.statusCallbacks = [];
        
        // Simulation parameters
        this.baseFrequency = 0.1;
        this.noiseLevel = 0.2;
        this.simulationInterval = null;
    }

    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.updateStatus('active', 'EEG Active - Monitoring brainwaves');
        
        // Start simulation loop
        this.simulationInterval = setInterval(() => {
            this.generateSignals();
            this.checkDrowsiness();
        }, 100); // Update every 100ms
        
        console.log('EEG Simulation started');
    }

    stop() {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.drowsinessStartTime = null;
        
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
        
        this.updateStatus('inactive', 'EEG Inactive');
        console.log('EEG Simulation stopped');
    }

    generateSignals() {
        const time = Date.now() / 1000;
        
        // Generate alpha waves (8-12 Hz) - relaxed, awake state
        const alphaBase = Math.sin(time * this.baseFrequency * 10) * 0.5 + 0.5;
        const alphaNoise = (Math.random() - 0.5) * this.noiseLevel;
        this.alphaWave = Math.max(0, Math.min(1, alphaBase + alphaNoise));
        
        // Generate theta waves (4-8 Hz) - drowsy, meditative state
        const thetaBase = Math.sin(time * this.baseFrequency * 6) * 0.5 + 0.5;
        const thetaNoise = (Math.random() - 0.5) * this.noiseLevel;
        this.thetaWave = Math.max(0, Math.min(1, thetaBase + thetaNoise));
        
        // Add some correlation - when tired, theta increases and alpha decreases
        const tirednessLevel = Math.sin(time * this.baseFrequency * 0.5) * 0.3 + 0.7;
        this.thetaWave = this.thetaWave * tirednessLevel;
        this.alphaWave = this.alphaWave * (2 - tirednessLevel);
        
        // Normalize values
        this.alphaWave = Math.max(0, Math.min(1, this.alphaWave));
        this.thetaWave = Math.max(0, Math.min(1, this.thetaWave));
    }

    checkDrowsiness() {
        const combinedSignal = (this.alphaWave + this.thetaWave) / 2;
        const isDrowsy = combinedSignal > this.drowsinessThreshold;
        
        if (isDrowsy) {
            if (!this.drowsinessStartTime) {
                this.drowsinessStartTime = Date.now();
                this.updateStatus('drowsy', 'Drowsiness detected');
            } else {
                const drowsinessTime = Date.now() - this.drowsinessStartTime;
                if (drowsinessTime > 30000) { // 30 seconds
                    this.onDrowsyDetected();
                    this.drowsinessStartTime = Date.now(); // Reset to avoid repeated triggers
                }
            }
        } else {
            if (this.drowsinessStartTime) {
                this.drowsinessStartTime = null;
                this.updateStatus('active', 'EEG Active - Monitoring brainwaves');
            }
        }
    }

    onDrowsyDetected() {
        console.log('Prolonged drowsiness detected');
        this.drowsinessCallbacks.forEach(callback => callback());
    }

    updateStatus(status, message) {
        this.statusCallbacks.forEach(callback => callback(status, message));
    }

    // Event listeners
    onDrowsinessDetected(callback) {
        this.drowsinessCallbacks.push(callback);
    }

    onStatusChange(callback) {
        this.statusCallbacks.push(callback);
    }

    // Get current signal values for visualization
    getSignals() {
        return {
            alpha: this.alphaWave,
            theta: this.thetaWave,
            combined: (this.alphaWave + this.thetaWave) / 2,
            isDrowsy: (this.alphaWave + this.thetaWave) / 2 > this.drowsinessThreshold
        };
    }

    // Simulate different states for testing
    simulateState(state) {
        switch(state) {
            case 'alert':
                this.alphaWave = 0.8;
                this.thetaWave = 0.2;
                break;
            case 'relaxed':
                this.alphaWave = 0.6;
                this.thetaWave = 0.4;
                break;
            case 'drowsy':
                this.alphaWave = 0.3;
                this.thetaWave = 0.9;
                break;
            case 'deep_relaxation':
                this.alphaWave = 0.2;
                this.thetaWave = 0.8;
                break;
        }
    }
}

// Export for use in other modules
window.EEGSimulator = EEGSimulator;
