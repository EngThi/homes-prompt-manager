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
- **Status:** Complete.
- **Features:**
    - **TTS Engine:** Utilize `window.speechSynthesis`.
    - **Controls:** Play, Pause, Resume, Stop.
    - **Visualizer:** CSS-based animated audio waveform.
    - **Voice Selector:** Sidebar configuration.
    - **History Playback:** Direct play button in memory items.

### V4.1: Mobile Responsiveness
- **Status:** Complete.
- **Features:**
    - **Layout:** Vertical stacking for screens < 768px.
    - **UX:** Touch-friendly buttons and scrollable body.

## Current Plan
1.  **Done:** Restore Audio UI components in `index.html`.
2.  **Done:** Restore Audio logic in `main.js`.
3.  **Done:** Restore Audio styles in `style.css`.
4.  **Done:** Add "Pause" and "Resume" functionality.
5.  **Done:** Add "Play" button to History items for direct playback.
6.  **Done:** Implement Responsive CSS for Mobile/Tablet devices.