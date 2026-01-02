# HOMES: Neural Deck 🎬

> **The Ultimate Command Center for Faceless YouTube Channels.**
> *Powered by Google Gemini 2.5 Flash.*

![Project Status](https://img.shields.io/badge/Status-Stable_v5.2-00ff9d?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Vanilla_JS_|_CSS3-000000?style=for-the-badge)

**HOMES: Neural Deck** is a specialized, cyberpunk-themed web application designed to automate the scripting process for high-retention video content. It replaces generic AI prompts with a sophisticated "Prompt Engineering" pipeline, connecting directly to Google's Gemini API to generate viral-ready scripts in seconds.

## ✨ Key Features (v5.2)

### 🧠 Neural Core
*   **Gemini 2.5 Integration:** Blazing-fast generation of narration-focused scripts.
*   **Visual Core:** Automatically generates 5 detailed Midjourney/DALL-E image prompts based on your script context.

### 🗣️ Advanced Audio (TTS)
*   **Neural Voice Engine:** Native Text-to-Speech with "Sanitized" text processing for maximum stability on mobile.
*   **Full Control:** Adjust **Speed (Rate)** and **Pitch** via neon sliders.
*   **Queue-Based Playback:** Robust Pause/Resume system that never loses its place, even on iOS/Android.
*   **Visualizer:** Real-time audio waveform simulation.

### 📦 Production Ready
*   **ZIP Export:** Download a complete production package containing:
    *   `01_roteiro_narracao.txt` (Clean script)
    *   `02_prompts_midjourney.txt` (Visual assets commands)
    *   `03_info_producao.txt` (Metadata & Settings)
*   **Memory Banks:** Local storage history with instant playback.
*   **User Persistence:** Automatically saves your preferred Voice, Speed, and Pitch settings.

### 🎨 Cyberpunk UI
*   **Immersive Design:** Dark mode, neon accents, and pulse animations.
*   **Mobile Optimized:** Touch-friendly buttons (44px+) and responsive grid layout.

## 🚀 How to Use

### 1. Setup
1.  Get your **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/).
2.  Open the App (`index.html`).
3.  Paste your key in the **ACCESS TOKEN** field (sidebar).

### 2. Generate
1.  Type a video topic (e.g., *"The Mystery of the Pyramids"*).
2.  Click **PROCESSAR ROTEIRO**.
3.  *Optional:* Click **EXTRAIR PROMPTS VISUAIS** to get AI image commands.

### 3. Export
*   Adjust the Voice Speed/Pitch sliders to your liking.
*   Click **📦 ZIP** to download your entire project package.

## 🛠️ Tech Stack

*   **Core:** HTML5, CSS3 (Variables + Flexbox/Grid), Vanilla JavaScript (ES6+).
*   **Libraries:** `JSZip`, `FileSaver.js` (for client-side zipping).
*   **AI Model:** Google Gemini 2.5 Flash (via REST API).
*   **Storage:** `window.localStorage`.
*   **Audio:** `window.speechSynthesis` API (Sanitized & Queued).

## 📦 Deployment

This project is static-ready. You can deploy it instantly on:
*   [Vercel](https://vercel.com)
*   [Netlify](https://netlify.com)
*   [GitHub Pages](https://pages.github.com)

---
*Developed by EngThi for the Hack Club Winter Hardware Wonderland.*