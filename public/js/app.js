class DreamFrameApp {
    constructor() {
        this.currentPage = 'landing';
        this.eegSimulator = null;
        this.dreamVisuals = null;
        this.metaphorGenerator = null;
        this.consentGiven = false;
        
        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.showPage('landing');
        
        // Initialize components
        this.metaphorGenerator = new MetaphorGenerator();
        
        console.log('DreamFrame initialized');
    }

    setupEventListeners() {
        // Landing page
        const startBtn = document.getElementById('start-session-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.showConsentModal());
        }

        // Consent modal
        const consentCheck = document.getElementById('consent-check');
        const acceptBtn = document.getElementById('accept-btn');
        const declineBtn = document.getElementById('decline-btn');

        if (consentCheck) {
            consentCheck.addEventListener('change', (e) => {
                acceptBtn.disabled = !e.target.checked;
            });
        }

        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => this.handleConsentAccept());
        }

        if (declineBtn) {
            declineBtn.addEventListener('click', () => this.handleConsentDecline());
        }

        // Dream session event listeners
        const endSessionBtn = document.getElementById('end-session-btn');
        const generateBtn = document.getElementById('generate-metaphor-btn');
        const videoBtn = document.getElementById('generate-video-btn');
        const toggleBtn = document.getElementById('toggle-view-btn');
        const regenerateBtn = document.getElementById('regenerate-video-btn');
        const topicInput = document.getElementById('dream-topic');

        if (endSessionBtn) {
            endSessionBtn.addEventListener('click', () => this.endSession());
        }

        if (generateBtn) {
            generateBtn.addEventListener('click', this.generateDreamMetaphor.bind(this));
        }

        if (videoBtn) {
            videoBtn.addEventListener('click', this.generateDreamVideo.bind(this));
        }

        if (toggleBtn) {
            toggleBtn.addEventListener('click', this.toggleView.bind(this));
        }

        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', this.generateDreamVideo.bind(this));
        }

        if (topicInput) {
            topicInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.generateDreamMetaphor();
                }
            });
        }

        // Break suggestion modal
        const continueBtn = document.getElementById('continue-session-btn');
        const breakBtn = document.getElementById('take-break-btn');

        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.hideBreakModal());
        }

        if (breakBtn) {
            breakBtn.addEventListener('click', () => this.takeBreak());
        }
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(pageId === 'landing' ? 'landing-page' : pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
        }
    }

    showConsentModal() {
        const modal = document.getElementById('consent-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideConsentModal() {
        const modal = document.getElementById('consent-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    handleConsentAccept() {
        this.consentGiven = true;
        this.hideConsentModal();
        this.startDreamSession();
    }

    handleConsentDecline() {
        this.hideConsentModal();
        // Could show a message about why consent is needed
        console.log('User declined consent');
    }

    async startDreamSession() {
        this.showPage('dream-session');
        
        // Initialize EEG simulator
        this.eegSimulator = new EEGSimulator();
        
        // Set up EEG event listeners
        this.eegSimulator.onStatusChange((status, message) => {
            this.updateEEGStatus(status, message);
        });

        this.eegSimulator.onDrowsinessDetected(() => {
            this.showBreakSuggestion();
        });

        // Initialize 3D visuals
        console.log('Initializing DreamVisuals...');
        this.dreamVisuals = new DreamVisuals('dream-canvas');
        
        if (!this.dreamVisuals.renderer) {
            console.error('Failed to initialize 3D renderer');
            this.show3DError();
            return;
        }
        
        // Start EEG monitoring
        this.eegSimulator.start();
        
        // Generate initial ambient visualization
        await this.generateInitialVisualization();
        
        console.log('Dream session started');
    }

    async generateInitialVisualization() {
        try {
            const initialMetaphor = await this.metaphorGenerator.generateMetaphor('consciousness awakening');
            this.dreamVisuals.generateVisualsFromMetaphor(initialMetaphor);
            this.updateMetaphorDisplay(initialMetaphor);
        } catch (error) {
            console.error('Error generating initial visualization:', error);
            // Fallback to default visualization
            this.dreamVisuals.generateVisualsFromMetaphor('floating through clouds of dreams');
        }
    }

    async generateDreamMetaphor() {
        const topicInput = document.getElementById('dream-topic');
        const generateBtn = document.getElementById('generate-metaphor-btn');
        
        if (!topicInput || !generateBtn) return;
        
        const topic = topicInput.value.trim();
        if (!topic) {
            this.showError('Please enter a dream topic');
            return;
        }

        try {
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';
            this.showLoading(true);

            // Validate topic (simple validation)
            const validatedTopic = topic.length > 0 && topic.length <= 50 ? topic : null;
            if (!validatedTopic) {
                throw new Error('Topic must be between 1-50 characters');
            }

            // Generate metaphor
            let metaphor;
            if (this.metaphorGenerator) {
                metaphor = await this.metaphorGenerator.generateMetaphor(validatedTopic);
            } else {
                metaphor = `dreaming of ${validatedTopic} in a world of infinite possibilities`;
            }
            
            // Update display
            this.updateMetaphorDisplay(metaphor);
            
            // Generate 3D visualization
            if (this.dreamVisuals) {
                this.dreamVisuals.generateVisualsFromMetaphor(metaphor);
            }
            
            // Clear input
            topicInput.value = '';
            
            console.log('Generated visualization for:', validatedTopic);
            
        } catch (error) {
            console.error('Error generating dream visualization:', error);
            this.showError('Failed to generate dream visualization. Please try again.');
        } finally {
            this.showLoading(false);
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Dream';
        }
    }

    updateMetaphorDisplay(metaphor) {
        const display = document.getElementById('current-metaphor');
        if (display) {
            display.textContent = metaphor;
            
            // Add fade-in animation
            display.style.opacity = '0';
            setTimeout(() => {
                display.style.opacity = '1';
            }, 100);
        }
    }

    async generateDreamVideo() {
        const topicInput = document.getElementById('dream-topic');
        const videoBtn = document.getElementById('generate-video-btn');
        const videoStatus = document.getElementById('video-status');
        
        if (!topicInput || !videoBtn || !videoStatus) return;
        
        const topic = topicInput.value.trim();
        if (!topic) {
            this.showVideoStatus('Please enter a dream topic first', 'error');
            return;
        }

        try {
            videoBtn.disabled = true;
            videoBtn.textContent = 'Generating...';
            this.showVideoStatus('Generating AI video... This may take 30-60 seconds', 'loading');

            // Get current metaphor or generate one
            let metaphor = document.getElementById('current-metaphor')?.textContent;
            if (!metaphor || metaphor === 'Enter a topic to generate your dream metaphor...') {
                if (this.metaphorGenerator) {
                    metaphor = await this.metaphorGenerator.generateMetaphor(topic);
                    this.updateMetaphorDisplay(metaphor);
                } else {
                    metaphor = `dreaming of ${topic} in a world of infinite possibilities`;
                }
            }

            const response = await fetch('/generate-video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ topic, metaphor })
            });

            const data = await response.json();

            if (data.success && data.videoUrl) {
                this.displayVideo(data.videoUrl);
                this.showVideoStatus('Video generated successfully!', 'success');
            } else {
                throw new Error(data.error || 'Failed to generate video');
            }

        } catch (error) {
            console.error('Error generating video:', error);
            this.showVideoStatus(`Video generation failed: ${error.message}. Showing 3D visualization instead.`, 'error');
        } finally {
            videoBtn.disabled = false;
            videoBtn.textContent = 'Generate AI Video';
        }
    }

    displayVideo(videoUrl) {
        const videoContainer = document.getElementById('dream-video-container');
        const video = document.getElementById('dream-video');
        const canvas = document.getElementById('dream-canvas');
        
        if (videoContainer && video && canvas) {
            video.src = videoUrl;
            videoContainer.style.display = 'flex';
            canvas.style.display = 'none';
            
            // Update toggle button text
            const toggleBtn = document.getElementById('toggle-view-btn');
            if (toggleBtn) {
                toggleBtn.textContent = 'Switch to 3D View';
            }
        }
    }

    toggleView() {
        const videoContainer = document.getElementById('dream-video-container');
        const canvas = document.getElementById('dream-canvas');
        const toggleBtn = document.getElementById('toggle-view-btn');
        
        if (videoContainer && canvas && toggleBtn) {
            if (videoContainer.style.display === 'none') {
                videoContainer.style.display = 'flex';
                canvas.style.display = 'none';
                toggleBtn.textContent = 'Switch to 3D View';
            } else {
                videoContainer.style.display = 'none';
                canvas.style.display = 'block';
                toggleBtn.textContent = 'Switch to Video View';
            }
        }
    }

    showVideoStatus(message, type) {
        const videoStatus = document.getElementById('video-status');
        if (videoStatus) {
            videoStatus.textContent = message;
            videoStatus.className = `video-status ${type}`;
            
            if (type === 'success' || type === 'error') {
                setTimeout(() => {
                    videoStatus.style.display = 'none';
                }, 5000);
            }
        }
    }

    updateEEGStatus(status, message) {
        const indicator = document.getElementById('eeg-indicator');
        const statusText = document.getElementById('eeg-status-text');
        
        if (indicator) {
            indicator.className = 'status-indicator';
            switch (status) {
                case 'active':
                    indicator.style.backgroundColor = '#4caf50';
                    break;
                case 'drowsy':
                    indicator.style.backgroundColor = '#ff9800';
                    break;
                case 'inactive':
                    indicator.style.backgroundColor = '#f44336';
                    break;
            }
        }
        
        if (statusText) {
            statusText.textContent = message;
        }
    }

    showBreakSuggestion() {
        const modal = document.getElementById('break-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideBreakModal() {
        const modal = document.getElementById('break-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    takeBreak() {
        this.hideBreakModal();
        this.endSession();
        
        // Show a nice break message
        setTimeout(() => {
            alert('Take your time to rest. Click "Start Dream Session" when you\'re ready to continue.');
        }, 500);
    }

    endSession() {
        // Stop EEG simulation
        if (this.eegSimulator) {
            this.eegSimulator.stop();
            this.eegSimulator = null;
        }

        // Clean up 3D visuals
        if (this.dreamVisuals) {
            this.dreamVisuals.dispose();
            this.dreamVisuals = null;
        }

        // Return to landing page
        this.showPage('landing');
        
        console.log('Dream session ended');
    }

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            if (show) {
                overlay.classList.add('active');
            } else {
                overlay.classList.remove('active');
            }
        }
    }

    show3DError() {
        const display = document.getElementById('current-metaphor');
        if (display) {
            display.innerHTML = `
                <div style="color: #ff6b6b; text-align: center;">
                    <h3>3D Graphics Issue</h3>
                    <p>Unable to initialize 3D visuals. Check browser console for details.</p>
                    <p>Try refreshing the page or using Chrome/Firefox.</p>
                </div>
            `;
        }
    }

    // Utility method to suggest random topics
    suggestRandomTopic() {
        const suggestions = this.metaphorGenerator.getSuggestions();
        const randomTopic = suggestions[Math.floor(Math.random() * suggestions.length)];
        
        const topicInput = document.getElementById('dream-topic');
        if (topicInput) {
            topicInput.value = randomTopic;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dreamFrameApp = new DreamFrameApp();
    
    // Add some helpful console commands for development
    console.log('DreamFrame loaded! Try these commands:');
    console.log('dreamFrameApp.suggestRandomTopic() - Get a random topic suggestion');
    console.log('dreamFrameApp.eegSimulator?.simulateState("drowsy") - Simulate drowsiness');
});
