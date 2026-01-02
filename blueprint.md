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

### V4.1: Audio Refinement (Current)
- **Goal:** Improve User Experience with customizable audio settings.
- **Features:**
    - **Voice Selector:** Dropdown menu in the sidebar to choose from available system voices.
    - **Persistence:** Save user's voice preference to `localStorage`.

## Current Plan
1.  **Done:** Modify UI (`index.html`) to include voice selector.
2.  **Done:** Update logic (`main.js`) to populate voices and handle selection.
3.  **Done:** Style (`style.css`) the new dropdown to match the theme.