/**
 * @file main.js
 * @description Core logic for HOMES: Neural Deck.
 * @author EngThi
 * @version 5.2.6
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- CONFIGURATION OBJECT ---
    const CONFIG = {
        // Opção 1: Uso Direto (requer API Key no input)
        API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent',
        
        // Opção 2: Backend Seguro (usado se não houver API Key)
        FUNCTIONS_URL: {
            // IDX-PROVIDED SECURE URLS FOR EMULATOR
            SCRIPT: 'https://5002-firebase-homes-prompt-manager-1767267273628.cluster-hlmk2l2htragyudeyf6f3tzsi6.cloudworkstations.dev/homes-prompt-manager/us-central1/gerarRoteiro',
            VISUALS: 'https://5002-firebase-homes-prompt-manager-1767267273628.cluster-hlmk2l2htragyudeyf6f3tzsi6.cloudworkstations.dev/homes-prompt-manager/us-central1/gerarPrompts'
            
            // PRODUCTION URLS
            // SCRIPT: 'https://us-central1-homes-prompt-manager.cloudfunctions.net/gerarRoteiro',
            // VISUALS: 'https://us-central1-homes-prompt-manager.cloudfunctions.net/gerarPrompts'
        },
        
        MAX_HISTORY: 20,
        TTS: {
            DEFAULT_RATE: 1.1,
            DEFAULT_PITCH: 1.0,
            CHUNK_LIMIT: 200,
            MOBILE_DELAY: 100
        },
        PERSONAS: {
            default: "Você é um roteirista profissional de canais Dark (Faceless). Seu estilo é envolvente, direto e curioso.",
            dramatic: "Você é um roteirista de tragédias e dramas intensos. Use pausas, suspense e uma linguagem emotiva para criar um clima de tensão e antecipação.",
            scientific: "Você é um divulgador científico. Explique o tema de forma clara, precisa e baseada em fatos, como se estivesse apresentando um documentário.",
            funny: "Você é um comediante e roteirista de stand-up. Aborde o tema com ironia, sarcasmo e piadas inesperadas, buscando um final engraçado."
        },
        PROMPTS: {
            SCRIPT: (topic, persona = 'default') => `
Função: ${CONFIG.PERSONAS[persona]}
Objetivo: Criar um roteiro de vídeo curto (aprox. 60s) sobre: \"${topic}\".
Formato Obrigatório:
- Apenas o texto da narração (o que será falado).
- NÃO inclua timestamps (ex: 0:00).
- NÃO inclua instruções visuais ou sonoras (ex: [Sound], [Cut to]).
- NÃO inclua rótulos de personagem (ex: Narrador:).
- Use pontuação adequada para pausas dramáticas.
Idioma: Português do Brasil.`,
            VISUALS: (script) => `
Contexto: Tenho este roteiro de vídeo: \"${script}\"
Tarefa: Crie 5 prompts de imagem detalhados e artísticos para o Midjourney/DALL-E que ilustrem as cenas principais deste roteiro.
Estilo: Cyberpunk, Cinematic, Photorealistic, 8k.
Formato: Apenas a lista dos 5 prompts, em Inglês, sem introduções.`
        },
        CLEANING_REGEX: {
            META: /\[[\s\S]*?\]/g,
            PARENS: /\([\s\S]*?\)/g,
            LABELS: /(?:NARRATOR|VOICE OVER|VO|SCRIPT|Text Overlay|B-ROLL|SOUND):/gi,
            TIMESTAMPS: /\d{1,2}:\d{2}(?:-\d{1,2}:\d{2})?/g,
            SYMBOLS: /[^a-zA-Z0-9À-ÿ\s.,?!:;]/g
        }
    };

    // DOM Elements
    const apiKeyInput = document.getElementById('apiKeyInput');
    const topicInput = document.getElementById('topicInput');
    const generateBtn = document.getElementById('generateBtn');
    const outputSection = document.getElementById('outputSection');
    const resultArea = document.getElementById('resultArea');
    const copyBtn = document.getElementById('copyBtn');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const voiceSelect = document.getElementById('voiceSelect'); 
    
    // New Controls (V5.1)
    const rateInput = document.getElementById('rateInput');
    const pitchInput = document.getElementById('pitchInput');
    const rateValue = document.getElementById('rateValue');
    const pitchValue = document.getElementById('pitchValue');
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadZipBtn = document.getElementById('downloadZipBtn'); // New ZIP Btn
    const visualBtn = document.getElementById('visualBtn');
    const visualSection = document.getElementById('visualSection');
    const visualContent = document.getElementById('visualContent');
    const copyVisualsBtn = document.getElementById('copyVisualsBtn');
    const personaSelect = document.getElementById('personaSelect'); // Persona Selector
    
    // Audio Elements
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resumeBtn = document.getElementById('resumeBtn');
    const stopBtn = document.getElementById('stopBtn');
    const visualizer = document.getElementById('visualizer');
    const toastNotification = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');

    // State Management
    let history = JSON.parse(localStorage.getItem('homes_history')) || [];
    let currentUtterance = null;
    let voices = [];
    let isPaused = false;
    let speechQueue = [];
    let isSpeakingQueue = false;
    let lastChunk = ""; // Store last chunk for resume fallback
    let originalTextForHighlight = ""; // Stores the cleaned text for highlighting
    let currentHighlightIndex = 0; // Tracks the start index of the current spoken chunk in originalTextForHighlight

    // Web Audio API Visualizer State
    let audioContext;
    let analyser;
    let visualizerDataArray;
    let visualizerRequestAnimationFrameId;
    let oscillator;
    let gainNode;
    

    // --- PERSISTENCE (V5.2) ---
    
    /**
     * Saves user audio preferences and selected voice to localStorage.
     */
    function savePreferences() {
        const prefs = {
            rate: rateInput.value,
            pitch: pitchInput.value,
            voiceURI: voices[voiceSelect.value]?.voiceURI
        };
        localStorage.setItem('homes_prefs', JSON.stringify(prefs));
    }

    /**
     * Loads and applies saved preferences from localStorage.
     */
    function loadPreferences() {
        const saved = localStorage.getItem('homes_prefs');
        if (!saved) return;
        
        try {
            const prefs = JSON.parse(saved);
            
            if (prefs.rate) {
                rateInput.value = prefs.rate;
                rateValue.textContent = prefs.rate;
            }
            if (prefs.pitch) {
                pitchInput.value = prefs.pitch;
                pitchValue.textContent = prefs.pitch;
            }
            
            if (prefs.voiceURI && voices.length > 0) {
                const index = voices.findIndex(v => v.voiceURI === prefs.voiceURI);
                if (index !== -1) {
                    voiceSelect.value = index;
                }
            }
        } catch (e) {
            console.warn("Failed to load preferences", e);
        }
    }

    // --- INITIALIZATION & EVENTS ---

    function showToast(message, type = 'info') {
        toastMessage.textContent = message;
        toastNotification.className = 'toast'; // Reset classes
        toastNotification.classList.add('show');
        if (type === 'error') {
            toastNotification.classList.add('error');
        }
        
        setTimeout(() => {
            toastNotification.classList.remove('show');
        }, 3000);
    }

    function populateVoiceList() {
        voices = window.speechSynthesis.getVoices();
        voiceSelect.innerHTML = '';
        
        if (voices.length === 0) {
            setTimeout(populateVoiceList, 100);
            return;
        }

        const ptVoices = voices.filter(v => v.lang.includes('pt'));
        const otherVoices = voices.filter(v => !v.lang.includes('pt'));
        const sortedVoices = [...ptVoices, ...otherVoices];
        
        voices.forEach((voice, i) => {
            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            option.value = i;
            
            if (voice.lang === 'pt-BR' || voice.lang === 'pt_BR') {
                if (!voiceSelect.value) option.selected = true;
            }
            
            voiceSelect.appendChild(option);
        });
        
        loadPreferences();
    }

    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    rateInput.addEventListener('input', () => {
        rateValue.textContent = rateInput.value;
        savePreferences();
    });
    
    pitchInput.addEventListener('input', () => {
        pitchValue.textContent = pitchInput.value;
        savePreferences();
    });
    
    voiceSelect.addEventListener('change', savePreferences);

    // --- EVENT LISTENERS ---

    generateBtn.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        const topic = topicInput.value.trim();

        if (!topic) {
            showToast('Por favor, insira um Tópico para o roteiro.', 'error');
            return;
        }
        
        if (!apiKey && !CONFIG.FUNCTIONS_URL.SCRIPT) {
            showToast('Insira sua API Key ou configure um endpoint de backend.', 'error');
            return;
        }

        generateBtn.disabled = true;
        generateBtn.textContent = 'PROCESSANDO...';
        generateBtn.classList.add('processing');
        outputSection.classList.add('hidden');
        stopSpeaking();

        const selectedPersona = personaSelect.value;
        const prompt = CONFIG.PROMPTS.SCRIPT(topic, selectedPersona);

        try {
            let scriptText;

            if (apiKey) {
                // MODE 1: Direct API Call (Client-side)
                const response = await fetch(`${CONFIG.API_URL}?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ role: "user", parts: [{ text: prompt }] }],
                        generationConfig: {
                            maxOutputTokens: 8192,
                        },
                        tools: [{ googleSearch: {} }]
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    throw new Error(errorData?.error?.message || `Erro na API: ${response.status}`);
                }

                const data = await response.json();
                scriptText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            } else {
                // MODE 2: Secure Backend Call (Firebase)
                const response = await fetch(CONFIG.FUNCTIONS_URL.SCRIPT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        topic: topic, 
                        persona: selectedPersona 
                    })
                });

                if (!response.ok) throw new Error(`Erro no Backend: ${response.status}`);

                const data = await response.json();
                if (!data.success) throw new Error(data.message || 'Erro desconhecido no backend.');
                scriptText = data.content; 
            }
            
            if (!scriptText) throw new Error('A IA retornou uma resposta vazia.');

            resultArea.value = scriptText;
            outputSection.classList.remove('hidden');
            
            visualSection.classList.add('hidden');
            visualContent.textContent = '';
            visualBtn.classList.remove('hidden');
            
            addToHistory(topic, scriptText);

        } catch (error) {
            showToast(`Erro: ${error.message}`, 'error');
            console.error(error);
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'PROCESSAR ROTEIRO';
            generateBtn.classList.remove('processing');
        }
    });

    copyBtn.addEventListener('click', () => {
        resultArea.select();
        document.execCommand('copy');
        const originalText = copyBtn.innerText;
        copyBtn.innerText = 'COPIADO!';
        setTimeout(() => copyBtn.innerText = originalText, 2000);
    });

    // --- NEW FEATURES V5.1 ---

    downloadBtn.addEventListener('click', () => {
        if (!resultArea.value) {
            showToast("Nenhum roteiro gerado para baixar.", "error");
            return;
        };
        const blob = new Blob([resultArea.value], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `neural_deck_script_${Date.now()}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    });

    downloadZipBtn.addEventListener('click', async () => {
        if (!resultArea.value) {
            showToast("Nenhum roteiro gerado para baixar.", "error");
            return;
        }

        const zip = new JSZip();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        zip.file("01_roteiro_narracao.txt", resultArea.value);

        if (visualContent.textContent && !visualSection.classList.contains('hidden')) {
            zip.file("02_prompts_midjourney.txt", visualContent.textContent);
        }

        const info = `
PROJECT METADATA
----------------
TOPIC: ${topicInput.value}
DATE: ${new Date().toLocaleString()}
VOICE_SPEED: ${rateInput.value}
VOICE_PITCH: ${pitchInput.value}
GENERATED_BY: HOMES Neural Deck v5.2
        `.trim();
        zip.file("03_info_producao.txt", info);

        try {
            downloadZipBtn.textContent = "COMPACTANDO...";
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `HOMES_PROJECT_${timestamp}.zip`);
        } catch (e) {
            console.error(e);
            showToast("Erro ao criar ZIP: " + e.message, "error");
        } finally {
            downloadZipBtn.textContent = "📦 ZIP";
        }
    });

    visualBtn.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        const currentScript = resultArea.value;

        if (!currentScript) return;

        visualBtn.disabled = true;
        visualBtn.textContent = 'ANALISANDO CENA...';
        visualBtn.classList.add('processing');

        try {
            let visuals;

            if (apiKey) {
                // MODE 1: Direct API Call
                const prompt = CONFIG.PROMPTS.VISUALS(currentScript);
                const response = await fetch(`${CONFIG.API_URL}?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ role: "user", parts: [{ text: prompt }] }],
                        generationConfig: {
                           maxOutputTokens: 8192,
                        }
                    })
                });

                const data = await response.json();
                visuals = data.candidates?.[0]?.content?.parts?.[0]?.text;

            } else {
                // MODE 2: Backend Firebase
                const response = await fetch(CONFIG.FUNCTIONS_URL.VISUALS, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        script: currentScript 
                    })
                });

                if (!response.ok) throw new Error(`Erro no Backend: ${response.status}`);

                const data = await response.json();
                if (!data.success) throw new Error(data.message || 'Erro desconhecido no backend.');
                visuals = data.content;
            }

            visualContent.textContent = visuals || "Falha ao gerar visuais.";
            visualSection.classList.remove('hidden');
            visualSection.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            showToast('Erro ao gerar visuais: ' + error.message, 'error');
        } finally {
            visualBtn.disabled = false;
            visualBtn.textContent = '👁️ EXTRAIR PROMPTS VISUAIS';
            visualBtn.classList.remove('processing');
        }
    });

    copyVisualsBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(visualContent.textContent);
        const original = copyVisualsBtn.innerText;
        copyVisualsBtn.innerText = 'COPIADO!';
        setTimeout(() => copyVisualsBtn.innerText = original, 2000);
    });

    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Apagar todo o histórico local?')) {
            history = [];
            saveHistory();
            renderHistory();
        }
    });

    // Audio Controls
    playBtn.addEventListener('click', () => {
        if (resultArea.value) speakText(resultArea.value);
    });

    pauseBtn.addEventListener('click', () => {
        window.speechSynthesis.cancel();
        isPaused = true;
        isSpeakingQueue = false;
        if (lastChunk) {
            speechQueue.unshift(lastChunk);
        }
        updateAudioUI('paused');
    });

    resumeBtn.addEventListener('click', () => {
        if (isPaused) {
            isPaused = false;
            isSpeakingQueue = true;
            playNextChunk();
        } else {
            if (resultArea.value) speakText(resultArea.value);
        }
    });

    stopBtn.addEventListener('click', stopSpeaking);

    // Initial Render
    renderHistory();

    function speakText(text) {
        stopSpeaking();
        isPaused = false;

        let processedText = text
            .replace(CONFIG.CLEANING_REGEX.META, '') 
            .replace(CONFIG.CLEANING_REGEX.PARENS, '') 
            .replace(CONFIG.CLEANING_REGEX.TIMESTAMPS, '')
            .replace(CONFIG.CLEANING_REGEX.LABELS, '') 
            .replace(/---/g, ''); 

        let cleanText = processedText.replace(CONFIG.CLEANING_REGEX.SYMBOLS, ' ');
        cleanText = cleanText.replace(/\s+/g, ' ').trim();

        if (!cleanText || cleanText.length < 2) {
            console.warn("Clean text too short for TTS.");
            return;
        }

        originalTextForHighlight = cleanText;
        currentHighlightIndex = 0;

        const sentences = cleanText.split(/(?<=[.?!])\s+/);
        speechQueue = [];

        sentences.forEach(sentence => {
            sentence = sentence.trim();
            if (sentence.length === 0) return;

            if (sentence.length < CONFIG.TTS.CHUNK_LIMIT) {
                speechQueue.push(sentence);
            } else {
                const subChunks = sentence.match(new RegExp(`.{1,${CONFIG.TTS.CHUNK_LIMIT-20}}(?:\\s|$)`, 'g')) || [sentence];
                subChunks.forEach(sub => speechQueue.push(sub.trim()));
            }
        });
        
        isSpeakingQueue = true;
        playNextChunk();
    }

    function playNextChunk() {
        if (!isSpeakingQueue || speechQueue.length === 0) {
            stopSpeaking();
            return;
        }

        const chunk = speechQueue.shift();
        lastChunk = chunk;
        
        if (!chunk || chunk.length < 2) {
            playNextChunk();
            return;
        }

        currentUtterance = new SpeechSynthesisUtterance(chunk);
        currentUtterance.lang = 'pt-BR';

        const startIndex = originalTextForHighlight.indexOf(chunk, currentHighlightIndex);
        if (startIndex !== -1) {
            const endIndex = startIndex + chunk.length;
            resultArea.focus();
            resultArea.setSelectionRange(startIndex, endIndex);
            currentHighlightIndex = endIndex + (originalTextForHighlight.substring(endIndex).match(/^\s*/)?.[0]?.length || 0);

            const lineHeight = parseInt(getComputedStyle(resultArea).lineHeight);
            const scrollOffset = resultArea.scrollTop;
            const elementOffset = resultArea.scrollHeight * (startIndex / originalTextForHighlight.length);
            
            if (elementOffset < scrollOffset || elementOffset > scrollOffset + resultArea.clientHeight) {
                 resultArea.scrollTop = elementOffset - resultArea.clientHeight / 2;
            }
        } else {
            resultArea.setSelectionRange(0, 0);
            currentHighlightIndex = 0;
        }

        const selectedVoiceIndex = voiceSelect.value;
        if (selectedVoiceIndex !== "" && voices[selectedVoiceIndex]) {
            currentUtterance.voice = voices[selectedVoiceIndex];
        } else {
            const ptVoice = voices.find(v => v.lang.includes('pt'));
            if (ptVoice) currentUtterance.voice = ptVoice;
        }
        
        currentUtterance.rate = parseFloat(rateInput.value) || CONFIG.TTS.DEFAULT_RATE;
        currentUtterance.pitch = parseFloat(pitchInput.value) || CONFIG.TTS.DEFAULT_PITCH;
        currentUtterance.volume = 1.0;

        currentUtterance.onstart = () => updateAudioUI('playing');
        currentUtterance.onend = () => { if (isSpeakingQueue) playNextChunk(); };

        currentUtterance.onerror = (e) => {
            if (e.error === 'interrupted' || e.error === 'canceled' || (e.error === 'synthesis-failed' && isPaused)) {
                return;
            }
            if (isSpeakingQueue && speechQueue.length > 0) {
                window.speechSynthesis.cancel();
                setTimeout(() => playNextChunk(), 200);
            } else {
                if (!isPaused) stopSpeaking();
            }
        };

        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
            setTimeout(() => {
                if (!isPaused && isSpeakingQueue) window.speechSynthesis.speak(currentUtterance);
            }, CONFIG.TTS.MOBILE_DELAY);
        } else {
            window.speechSynthesis.speak(currentUtterance);
        }
    }

    function stopSpeaking() {
        window.speechSynthesis.cancel();
        isPaused = false;
        isSpeakingQueue = false;
        speechQueue = [];
        resultArea.setSelectionRange(0, 0);
        currentHighlightIndex = 0;
        updateAudioUI('stopped');
    }

    function updateAudioUI(state) {
        playBtn.classList.add('hidden');
        pauseBtn.classList.add('hidden');
        resumeBtn.classList.add('hidden');
        stopBtn.classList.add('hidden');
        visualizer.classList.add('hidden');

        if (state === 'playing') {
            pauseBtn.classList.remove('hidden');
            stopBtn.classList.remove('hidden');
            visualizer.classList.remove('hidden');
        } else if (state === 'paused') {
            resumeBtn.classList.remove('hidden');
            stopBtn.classList.remove('hidden');
        } else { // stopped
            playBtn.classList.remove('hidden');
        }
    }

    // --- HISTORY SYSTEM ---

    function addToHistory(topic, script) {
        const timestamp = new Date().toLocaleTimeString();
        const newItem = { topic, script, timestamp };
        history.unshift(newItem);
        if (history.length > CONFIG.MAX_HISTORY) history.pop();
        saveHistory();
        renderHistory();
    }

    function saveHistory() {
        localStorage.setItem('homes_history', JSON.stringify(history));
    }

    function renderHistory() {
        historyList.innerHTML = '';
        
        if (history.length === 0) {
            historyList.innerHTML = '<li class="history-item placeholder">Nenhum item no histórico.</li>';
            return;
        }

        history.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'history-item';
            
            li.innerHTML = `
                <div class="history-content">
                    <strong>${item.topic}</strong><br>
                    <span style="font-size:0.6rem">${item.timestamp}</span>
                </div>
                <button class="mini-play-btn" title="Reproduzir agora">▶</button>
            `;
            
            li.onclick = (e) => {
                if (e.target.closest('.mini-play-btn')) return;
                loadHistoryItem(index);
            };

            const miniPlayBtn = li.querySelector('.mini-play-btn');
            miniPlayBtn.onclick = (e) => {
                e.stopPropagation();
                playHistoryItem(index);
            };

            historyList.appendChild(li);
        });
    }

    function loadHistoryItem(index, shouldStopAudio = true) {
        if (shouldStopAudio) {
            stopSpeaking();
        }

        const item = history[index];
        resultArea.value = item.script;
        outputSection.classList.remove('hidden');
        playBtn.classList.remove('hidden');
        
        document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
        if (document.querySelectorAll('.history-item')[index]) {
            document.querySelectorAll('.history-item')[index].classList.add('active');
        }
    }

    function playHistoryItem(index) {
        loadHistoryItem(index, false);
        
        const item = history[index];
        if(item && item.script) {
            speakText(item.script);
        }
    }
});
