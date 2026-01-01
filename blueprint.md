# Project Blueprint: HOMES: Neural Deck

## Overview
A web-based command center for automating audiovisual content architecture. Designed for "Faceless" YouTube channels, it helps users generate optimized video scripts and prompts using a "Cyberpunk" aesthetic interface.

## Project History & Features
### Initial Setup
- **Core UI:** Dark mode "Cyberpunk" interface built with vanilla HTML/CSS.
- **Functionality:** Input field, simulated processing, output display.

### V2.0: API Integration
- **Status:** Complete.
- **Features:**
    - Real-time connection to Google Gemini API (`gemini-2.5-flash`).
    - Secure API Key input.
    - Error handling for API requests.

### V3.0: Persistence & Refinement (Current)
- **Goal:** Add local storage for scripts and refine the generation logic.
- **New Features:**
    - **History/Library:** A sidebar or section to view previously generated scripts (saved in `localStorage`).
    - **Prompt Optimization:** Tweaking the system prompt for even better visual cues and retention mechanics.
    - **UI/UX:** Better layout to accommodate the history list.

## Current Plan
1.  **Modify UI:** Add a "History" sidebar to `index.html`.
2.  **Update Logic:** 
    - Save generated scripts to `localStorage`.
    - Function to load clicked history items into the main view.
    - Refine the system prompt in `main.js`.
3.  **Style:** Update `style.css` to handle the new layout (grid/flex).
