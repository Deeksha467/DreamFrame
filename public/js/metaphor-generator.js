class MetaphorGenerator {
    constructor() {
        this.isGenerating = false;
        this.cache = new Map();
        this.maxCacheSize = 50;
    }

    async generateMetaphor(topic) {
        if (this.isGenerating) {
            throw new Error('Already generating a metaphor');
        }

        // Check cache first
        if (this.cache.has(topic)) {
            return this.cache.get(topic);
        }

        this.isGenerating = true;

        try {
            const response = await fetch('/metaphor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ topic })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Cache the result
            this.addToCache(topic, data.metaphor);
            
            return data.metaphor;
        } catch (error) {
            console.error('Error generating metaphor:', error);
            
            // Fallback to client-side generation
            return this.generateClientSideMetaphor(topic);
        } finally {
            this.isGenerating = false;
        }
    }

    generateClientSideMetaphor(topic) {
        const dreamElements = [
            'floating through clouds of',
            'dancing with shadows of',
            'swimming in oceans of',
            'flying through forests of',
            'painting with light from',
            'weaving dreams with threads of',
            'sculpting reality from',
            'breathing life into whispers of',
            'walking through gardens of',
            'sailing on rivers of'
        ];
        
        const visualElements = [
            'golden starlight',
            'silver moonbeams',
            'crystalline dewdrops',
            'ethereal mist',
            'luminous particles',
            'flowing energy',
            'shimmering essence',
            'radiant fragments',
            'glowing embers',
            'prismatic reflections'
        ];

        const endings = [
            'where time becomes liquid poetry',
            'transforming into living symphony',
            'weaving tapestries of consciousness',
            'painting emotions across the void',
            'where thoughts bloom into reality',
            'creating bridges between worlds',
            'where silence speaks in colors',
            'dancing between dream and awakening'
        ];
        
        const dreamElement = dreamElements[Math.floor(Math.random() * dreamElements.length)];
        const visualElement = visualElements[Math.floor(Math.random() * visualElements.length)];
        const ending = endings[Math.floor(Math.random() * endings.length)];
        
        const metaphor = `${dreamElement} ${topic}, where ${visualElement} ${ending}.`;
        
        // Cache the fallback result too
        this.addToCache(topic, metaphor);
        
        return metaphor;
    }

    addToCache(topic, metaphor) {
        // Implement LRU cache behavior
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(topic, metaphor);
    }

    clearCache() {
        this.cache.clear();
    }

    getCacheSize() {
        return this.cache.size;
    }

    // Validate topic input
    validateTopic(topic) {
        if (!topic || typeof topic !== 'string') {
            throw new Error('Topic must be a non-empty string');
        }
        
        if (topic.length > 50) {
            throw new Error('Topic must be 50 characters or less');
        }
        
        // Basic sanitization
        return topic.trim().replace(/[<>]/g, '');
    }

    // Get suggestions for common dream topics
    getSuggestions() {
        return [
            'photosynthesis',
            'ocean waves',
            'mountain peaks',
            'city lights',
            'forest whispers',
            'starlight',
            'childhood memories',
            'music notes',
            'butterfly wings',
            'rainfall',
            'fire dancing',
            'crystal formations',
            'wind patterns',
            'flower blooming',
            'river flowing'
        ];
    }

    // Generate multiple metaphors for comparison
    async generateMultiple(topic, count = 3) {
        const metaphors = [];
        
        for (let i = 0; i < count; i++) {
            try {
                // Add slight variation to avoid identical results
                const variedTopic = i === 0 ? topic : `${topic} essence`;
                const metaphor = await this.generateMetaphor(variedTopic);
                metaphors.push(metaphor);
            } catch (error) {
                console.error(`Error generating metaphor ${i + 1}:`, error);
                metaphors.push(this.generateClientSideMetaphor(topic));
            }
        }
        
        return metaphors;
    }
}

// Export for use in other modules
window.MetaphorGenerator = MetaphorGenerator;
