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

### V4.0: Audio Synthesis (Restored)
- **Status:** Active.
- **Features:**
    - **TTS Engine:** Utilize `window.speechSynthesis`.
    - **Controls:** Play, Pause, Resume, Stop.
    - **Visualizer:** CSS-based animated audio waveform.
    - **Voice Selector:** Sidebar configuration.

## Current Plan
1.  **Done:** Restore Audio UI components in `index.html`.
2.  **Done:** Restore Audio logic in `main.js`.
3.  **Done:** Restore Audio styles in `style.css`.
4.  **Done:** Add "Pause" and "Resume" functionality.