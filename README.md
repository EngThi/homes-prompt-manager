# HOMES: Neural Deck 🎬

> **The Ultimate Command Center for Faceless YouTube Channels.**
> *Powered by Google Gemini 2.5 Flash.*

![Project Status](https://img.shields.io/badge/Status-Stable_v1.0.0-00ff9d?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Vanilla_JS_|_CSS3-000000?style=for-the-badge)

**HOMES: Neural Deck** is a specialized, cyberpunk-themed web application designed to automate the scripting process for high-retention video content. It replaces generic AI prompts with a sophisticated "Prompt Engineering" pipeline, connecting directly to Google's Gemini API to generate viral-ready scripts in seconds.

## ✨ Key Features (v1.0.0)

*   **🧠 Neural Uplink (Gemini API):** Direct integration with Google's `gemini-2.5-flash` model for blazing-fast, high-quality script generation.
*   **💾 Memory Banks (Local History):** Never lose a genius idea. All generated scripts are automatically saved to your browser's local storage and accessible via the sidebar.
*   **🗣️ Neural Voice (TTS):** Native Text-to-Speech engine with a real-time audio visualizer to "proof-hear" your scripts before recording.
*   **🎨 Cyberpunk UI:** A fully immersive, dark-mode interface designed for flow state and focus.
*   **🔒 Privacy First:** Your API Key is stored locally in your browser, never on our servers.

## 🚀 How to Use

### 1. Setup
You don't need to install anything! Just open the `index.html` file in your browser or deploy it.

1.  Get your **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/).
2.  Open the App.
3.  Paste your key in the **ACCESS TOKEN** field (sidebar).

### 2. Generate
1.  Type a video topic (e.g., *"The Mystery of the Pyramids"* or *"Quantum Computing Explained"*).
2.  Click **PROCESSAR ROTEIRO**.
3.  Watch the AI craft a script with Hooks, B-Roll suggestions, and Pattern Interrupts.

### 3. Review
*   Use the **Play Audio** button to listen to the script.
*   Click **Copy** to transfer it to your teleprompter or editor.
*   Check the **Memory Banks** sidebar to revisit previous scripts.

## 🛠️ Tech Stack

*   **Core:** HTML5, CSS3 (Variables + Flexbox), Vanilla JavaScript (ES6+).
*   **AI Model:** Google Gemini 2.5 Flash (via REST API).
*   **Storage:** `window.localStorage`.
*   **Audio:** `window.speechSynthesis` API.

## 📦 Deployment

This project is static-ready. You can deploy it instantly on:
*   [Vercel](https://vercel.com)
*   [Netlify](https://netlify.com)
*   [GitHub Pages](https://pages.github.com)

---
*Developed by EngThi for the Hack Club Winter Hardware Wonderland.*
