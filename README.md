# DreamFrame

A 3D dream visualization platform that combines EEG simulation, AI-generated metaphors, and immersive WebXR visuals to create dreamlike experiences.

## Features

- **🧠 EEG Simulation**: Local brainwave monitoring with alpha/theta signal generation
- **🎨 AI Metaphor Generation**: Transform topics into poetic dream narratives using OpenAI API
- **🌌 3D Visuals**: Immersive Three.js-powered dream landscapes with WebXR support
- **🔒 Privacy-First**: All EEG data is simulated locally, no personal data transmitted
- **😴 Comfort Design**: Automatic break suggestions based on drowsiness detection

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone or download the project:
```bash
cd /Users/deeksha/CascadeProjects/DreamFrame
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Set up OpenAI API:
```bash
# Create .env file
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

4. Start the server:
```bash
npm start
```

5. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

### Starting a Dream Session

1. **Landing Page**: Click "Start Dream Session"
2. **Consent Modal**: Review privacy statement and check consent box
3. **Dream Session**: Enter topics to generate 3D dream visualizations

### EEG Simulation

The app simulates brainwave patterns:
- **Alpha waves (8-12 Hz)**: Relaxed, awake state
- **Theta waves (4-8 Hz)**: Drowsy, meditative state
- **Drowsiness Detection**: Triggers break suggestion after 30+ seconds

### Metaphor Generation

Enter any topic to generate dreamlike metaphors:
- **With OpenAI**: Rich, contextual metaphors using GPT-3.5
- **Fallback Mode**: Rule-based generation when API unavailable

Example topics:
- "photosynthesis" → "Sunlight painting leaves with golden strokes of life"
- "ocean waves" → "Dancing with shadows of endless blue, where crystalline dewdrops weave dreams"

### 3D Visualization

Metaphors are parsed and mapped to visual elements:
- **Light keywords** → Glowing particles and light sources
- **Nature keywords** → Organic shapes and flowing forms  
- **Motion keywords** → Animated transformations
- **Color keywords** → Dynamic color schemes

## Architecture

### Backend (`server.js`)
- Express.js server with CORS support
- `/metaphor` API endpoint for AI generation
- Fallback rule-based metaphor system
- Health check endpoint

### Frontend Structure
```
public/
├── index.html          # Main HTML structure
├── css/
│   └── styles.css      # Responsive styling with gradients
└── js/
    ├── app.js          # Main application controller
    ├── eeg-simulation.js    # Brainwave simulation
    ├── dream-visuals.js     # Three.js 3D rendering
    └── metaphor-generator.js # API client with caching
```

### Key Components

#### EEG Simulator (`eeg-simulation.js`)
- Generates realistic alpha/theta wave patterns
- Drowsiness detection algorithm
- Status callbacks for UI updates
- Configurable thresholds and noise levels

#### Dream Visuals (`dream-visuals.js`)
- Three.js scene management
- Metaphor parsing and visual mapping
- Particle systems and lighting
- WebXR-ready rendering pipeline

#### Metaphor Generator (`metaphor-generator.js`)
- OpenAI API integration with fallbacks
- Client-side caching (LRU, 50 items)
- Input validation and sanitization
- Batch generation capabilities

## Privacy & Security

### Data Handling
- **EEG Data**: Simulated locally, never transmitted
- **User Input**: Validated and sanitized before processing
- **API Keys**: Environment variables, not hardcoded
- **No Tracking**: No analytics or user data collection

### Consent System
- Explicit consent required before EEG simulation
- Clear privacy statement with bullet points
- User can decline and return to landing page
- Session data is temporary and cleared on exit

## Comfort-First Design

### Break Suggestions
- Monitors for prolonged drowsiness (>30 seconds)
- Non-intrusive modal with gentle messaging
- Options to continue or take a break
- Automatic session cleanup on break

### User Experience
- Smooth page transitions with CSS animations
- Responsive design for mobile and desktop
- Loading states for async operations
- Error handling with user-friendly messages

## Development

### Running in Development Mode
```bash
npm run dev  # Uses nodemon for auto-restart
```

### Environment Variables
```bash
PORT=3000                    # Server port (default: 3000)
OPENAI_API_KEY=sk-...       # Optional: OpenAI API key
```

### API Endpoints

#### POST `/metaphor`
Generate a dreamlike metaphor for a given topic.

**Request:**
```json
{
  "topic": "photosynthesis"
}
```

**Response:**
```json
{
  "metaphor": "Sunlight painting leaves with golden strokes of life",
  "topic": "photosynthesis"
}
```

#### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Browser Compatibility

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+
- **WebXR Support**: Chrome/Edge with WebXR flag enabled
- **Three.js**: Uses CDN version r128 for stability
- **ES6 Features**: Classes, async/await, modules

## Troubleshooting

### Common Issues

**Server won't start:**
- Check Node.js version: `node --version`
- Install dependencies: `npm install`
- Check port availability: `lsof -i :3000`

**3D visuals not loading:**
- Ensure WebGL is enabled in browser
- Check browser console for Three.js errors
- Try refreshing the page

**Metaphor generation fails:**
- Check network connection
- Verify OpenAI API key (if using)
- Fallback system should activate automatically

**EEG simulation not working:**
- Check browser console for JavaScript errors
- Ensure consent was given properly
- Try ending and restarting session

## Contributing

### Code Style
- Use ES6+ features
- Follow existing naming conventions
- Add comments for complex algorithms
- Test both API and fallback modes

### Adding New Visual Elements
1. Extend `parseMetaphor()` in `dream-visuals.js`
2. Add new creation methods (e.g., `createNewShape()`)
3. Update animation loop if needed
4. Test with various metaphor inputs

## License

MIT License - Feel free to use and modify for your projects.

## Acknowledgments

- **Three.js** for 3D rendering capabilities
- **OpenAI** for metaphor generation API
- **Express.js** for server framework
- **WebXR** community for immersive web standards
