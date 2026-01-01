# Project Blueprint: HOMES: Neural Deck

## Overview
A web-based command center for automating audiovisual content architecture. Designed for "Faceless" YouTube channels, it helps users generate optimized video scripts and prompts using a "Cyberpunk" aesthetic interface.

## Project History & Features
### Initial Setup
- **Core UI:** Dark mode "Cyberpunk" interface.
- **Functionality:** Input field, simulated processing.

### V2.0: API Integration
- **Status:** Complete.
- **Features:** Google Gemini API (`gemini-2.5-flash`) integration.

### V3.0: Persistence & History
- **Status:** Complete.
- **Features:** Local storage history, sidebar layout, refined prompt.

### V4.0: Audio Synthesis (Current)
- **Goal:** Enable auditory review of scripts using native browser Text-to-Speech.
- **New Features:**
    - **TTS Engine:** Utilize `window.speechSynthesis`.
    - **Audio Controls:** Play/Stop buttons in the output interface.
    - **Visualizer:** CSS-based animated audio waveform simulation during playback.

## Current Plan
1.  **Modify UI:** Add audio controls and visualizer container to `outputSection` in `index.html`.
2.  **Update Logic:** Implement `playScript()` and `stopScript()` functions in `main.js`.
3.  **Style:** Add CSS animations for the audio visualizer in `style.css`.