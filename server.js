const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// AI Metaphor Generator endpoint
app.post('/metaphor', async (req, res) => {
    try {
        const { topic } = req.body;
        
        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        // Try different AI APIs in order of preference
        let metaphor = null;
        
        // 1. Try Hugging Face API (Free)
        if (process.env.HUGGINGFACE_API_KEY && !metaphor) {
            try {
                metaphor = await generateHuggingFaceMetaphor(topic);
                console.log('Generated metaphor using Hugging Face');
            } catch (error) {
                console.error('Hugging Face API error:', error.message);
            }
        }
        
        // 2. Try Cohere API (Free tier)
        if (process.env.COHERE_API_KEY && !metaphor) {
            try {
                metaphor = await generateCohereMetaphor(topic);
                console.log('Generated metaphor using Cohere');
            } catch (error) {
                console.error('Cohere API error:', error.message);
            }
        }

        // 3. Try OpenAI API (Paid)
        if (process.env.OPENAI_API_KEY && !metaphor) {
            try {
                const { OpenAI } = require('openai');
                const openai = new OpenAI({
                    apiKey: process.env.OPENAI_API_KEY
                });

                const completion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [{
                        role: "system",
                        content: "You are a dream metaphor generator. Create beautiful, dreamlike metaphors for any given topic. Keep responses to 1-2 sentences, poetic and visual."
                    }, {
                        role: "user",
                        content: `Create a dreamlike metaphor for: ${topic}`
                    }],
                    max_tokens: 100,
                    temperature: 0.8
                });

                metaphor = completion.choices[0].message.content.trim();
                console.log('Generated metaphor using OpenAI');
            } catch (error) {
                console.error('OpenAI API error:', error.message);
            }
        }
        
        // 4. Fallback to rule-based generation
        if (!metaphor) {
            metaphor = generateRuleBasedMetaphor(topic);
            console.log('Generated metaphor using fallback rules');
        }

        res.json({ metaphor, topic });
    } catch (error) {
        console.error('Error generating metaphor:', error);
        
        // Fallback to rule-based generation on error
        const fallbackMetaphor = generateRuleBasedMetaphor(req.body.topic);
        res.json({ metaphor: fallbackMetaphor, topic: req.body.topic });
    }
});

// Rule-based metaphor generator as fallback
function generateRuleBasedMetaphor(topic) {
    const dreamElements = [
        'floating through clouds of',
        'dancing with shadows of',
        'swimming in oceans of',
        'flying through forests of',
        'painting with light from',
        'weaving dreams with threads of',
        'sculpting reality from',
        'breathing life into whispers of'
    ];
    
    const visualElements = [
        'golden starlight',
        'silver moonbeams',
        'crystalline dewdrops',
        'ethereal mist',
        'luminous particles',
        'flowing energy',
        'shimmering essence',
        'radiant fragments'
    ];
    
    const dreamElement = dreamElements[Math.floor(Math.random() * dreamElements.length)];
    const visualElement = visualElements[Math.floor(Math.random() * visualElements.length)];
    
    return `${dreamElement} ${topic}, where ${visualElement} transforms into living poetry of the subconscious mind.`;
}

// AI Video Generation endpoint
app.post('/generate-video', async (req, res) => {
    try {
        const { topic, metaphor } = req.body;
        
        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        // Create video prompt from topic and metaphor
        const videoPrompt = metaphor || `Dreamy, ethereal visualization of ${topic}, floating particles, soft lighting, cinematic, 4K`;
        
        let videoResult = null;
        
        // 1. Try Runway ML API (Best quality)
        if (process.env.RUNWAY_API_KEY && !videoResult) {
            try {
                videoResult = await generateRunwayVideo(videoPrompt);
                console.log('Generated video using Runway ML');
            } catch (error) {
                console.error('Runway ML API error:', error.message);
            }
        }
        
        // 2. Try Pika Labs API
        if (process.env.PIKA_API_KEY && !videoResult) {
            try {
                videoResult = await generatePikaVideo(videoPrompt);
                console.log('Generated video using Pika Labs');
            } catch (error) {
                console.error('Pika Labs API error:', error.message);
            }
        }
        
        // 3. Try Stable Video Diffusion via Hugging Face
        if (process.env.HUGGINGFACE_API_KEY && !videoResult) {
            try {
                videoResult = await generateStableVideo(videoPrompt);
                console.log('Generated video using Stable Video Diffusion');
            } catch (error) {
                console.error('Stable Video API error:', error.message);
            }
        }
        
        // 4. Fallback to procedural video generation
        if (!videoResult) {
            videoResult = {
                status: 'fallback',
                message: 'AI video generation not available, using 3D visualization',
                videoUrl: null,
                prompt: videoPrompt
            };
            console.log('Using 3D visualization fallback for video');
        }

        res.json({ 
            ...videoResult, 
            topic, 
            prompt: videoPrompt 
        });
        
    } catch (error) {
        console.error('Error generating video:', error);
        res.status(500).json({ 
            error: 'Video generation failed',
            fallback: true,
            message: 'Using 3D visualization instead'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Hugging Face API function
async function generateHuggingFaceMetaphor(topic) {
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: `Create a dreamlike metaphor for ${topic}:`,
            parameters: {
                max_length: 100,
                temperature: 0.8,
                do_sample: true
            }
        })
    });
    
    if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data[0]?.generated_text?.replace(`Create a dreamlike metaphor for ${topic}:`, '').trim() || 
           `Floating through clouds of ${topic}, where starlight weaves dreams into reality.`;
}

// Cohere API function
async function generateCohereMetaphor(topic) {
    const { cohere } = require('cohere-ai');
    cohere.init(process.env.COHERE_API_KEY);
    
    const response = await cohere.generate({
        model: 'command-light',
        prompt: `Create a beautiful, dreamlike metaphor for "${topic}". Make it poetic and visual, 1-2 sentences:`,
        max_tokens: 80,
        temperature: 0.8
    });
    
    return response.body.generations[0].text.trim();
}

// Runway ML API function
async function generateRunwayVideo(prompt) {
    const response = await fetch('https://api.runwayml.com/v1/generate', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: prompt,
            model: 'runway-ml/stable-video',
            duration: 4,
            resolution: '512x512',
            fps: 24
        })
    });
    
    if (!response.ok) {
        throw new Error(`Runway ML API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
        status: 'success',
        videoUrl: data.video_url,
        taskId: data.task_id,
        provider: 'runway'
    };
}

// Pika Labs API function
async function generatePikaVideo(prompt) {
    const response = await fetch('https://api.pika.art/generate', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.PIKA_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            prompt: prompt,
            style: 'cinematic',
            duration: 3,
            aspect_ratio: '16:9'
        })
    });
    
    if (!response.ok) {
        throw new Error(`Pika Labs API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
        status: 'success',
        videoUrl: data.result_url,
        taskId: data.id,
        provider: 'pika'
    };
}

// Stable Video Diffusion via Hugging Face
async function generateStableVideo(prompt) {
    const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-video-diffusion-img2vid-xt', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                num_frames: 25,
                fps: 6,
                motion_bucket_id: 127
            }
        })
    });
    
    if (!response.ok) {
        throw new Error(`Stable Video API error: ${response.status}`);
    }
    
    const videoBlob = await response.blob();
    const videoUrl = URL.createObjectURL(videoBlob);
    
    return {
        status: 'success',
        videoUrl: videoUrl,
        provider: 'stable-video',
        format: 'mp4'
    };
}

app.listen(PORT, () => {
    console.log(`DreamFrame server running on http://localhost:${PORT}`);
    
    // Check which APIs are configured
    const textApis = [];
    const videoApis = [];
    
    if (process.env.HUGGINGFACE_API_KEY) {
        textApis.push('Hugging Face (Free)');
        videoApis.push('Stable Video (Free)');
    }
    if (process.env.COHERE_API_KEY) textApis.push('Cohere (Free)');
    if (process.env.OPENAI_API_KEY) textApis.push('OpenAI (Paid)');
    if (process.env.RUNWAY_API_KEY) videoApis.push('Runway ML (Free tier)');
    if (process.env.PIKA_API_KEY) videoApis.push('Pika Labs (Free tier)');
    
    console.log('Text APIs:', textApis.length > 0 ? textApis.join(', ') : 'Fallback only');
    console.log('Video APIs:', videoApis.length > 0 ? videoApis.join(', ') : 'None configured');
});
