document.addEventListener('DOMContentLoaded', () => {
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
    
    // Audio Elements
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resumeBtn = document.getElementById('resumeBtn');
    const stopBtn = document.getElementById('stopBtn');
    const visualizer = document.getElementById('visualizer');

    // State Management
    let history = JSON.parse(localStorage.getItem('homes_history')) || [];
    let currentUtterance = null;
    let voices = [];
    let isPaused = false;
    let speechQueue = [];
    let isSpeakingQueue = false;
    let lastChunk = ""; // Store last chunk for resume fallback

    // --- PERSISTENCE (V5.2) ---
    function savePreferences() {
        const prefs = {
            rate: rateInput.value,
            pitch: pitchInput.value,
            // Save the Voice Name/URI, not just the index (which can change)
            voiceURI: voices[voiceSelect.value]?.voiceURI
        };
        localStorage.setItem('homes_prefs', JSON.stringify(prefs));
    }

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
            
            // Restore voice by URI match (more robust than index)
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

    function populateVoiceList() {
        voices = window.speechSynthesis.getVoices();
        voiceSelect.innerHTML = '';
        
        if (voices.length === 0) {
            // Retry logic for mobile/chrome where voices load asynchronously
            setTimeout(populateVoiceList, 100);
            return;
        }

        // Sort voices to prioritize "Google Português" or generic Portuguese
        const ptVoices = voices.filter(v => v.lang.includes('pt'));
        const otherVoices = voices.filter(v => !v.lang.includes('pt'));
        const sortedVoices = [...ptVoices, ...otherVoices];

        // Map original indices back to the sorted list for correct selection? 
        // Simpler approach: just list them as they come but pre-select PT.
        
        voices.forEach((voice, i) => {
            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            option.value = i; // Use original index from 'voices' array
            
            if (voice.lang === 'pt-BR' || voice.lang === 'pt_BR') {
                if (!voiceSelect.value) option.selected = true;
            }
            
            voiceSelect.appendChild(option);
        });
        
        // Load saved settings AFTER populating voices
        loadPreferences();
    }

    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    // Slider Listeners
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

        if (!apiKey || !topic) {
            alert('Por favor, insira sua API Key e um Tópico.');
            return;
        }

        generateBtn.disabled = true;
        generateBtn.textContent = 'PROCESSANDO...';
        generateBtn.classList.add('processing'); // Add pulse effect
        outputSection.classList.add('hidden');
        stopSpeaking(); // Stop any audio

        const prompt = `
Função: Você é um roteirista profissional de canais Dark (Faceless).
Objetivo: Criar um roteiro de vídeo curto (aprox. 60s) sobre: "${topic}".
Formato Obrigatório:
- Apenas o texto da narração (o que será falado).
- NÃO inclua timestamps (ex: 0:00).
- NÃO inclua instruções visuais ou sonoras (ex: [Sound], [Cut to]).
- NÃO inclua rótulos de personagem (ex: Narrador:).
- Use pontuação adequada para pausas dramáticas.
- Estilo: Envolvente, direto e curioso.
Idioma: Português do Brasil.
`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!response.ok) throw new Error('Falha na conexão com a API.');

            const data = await response.json();
            
            if (data.error) throw new Error(data.error.message);
            
            let scriptText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!scriptText) throw new Error('Resposta vazia da IA.');

            resultArea.value = scriptText;
            outputSection.classList.remove('hidden');
            
            // Reset and show Visual Button
            visualSection.classList.add('hidden');
            visualContent.textContent = '';
            visualBtn.classList.remove('hidden');
            
            addToHistory(topic, scriptText);

        } catch (error) {
            alert(`Erro: ${error.message}`);
            console.error(error);
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'GERAR NEURAL DECK';
            generateBtn.classList.remove('processing'); // Remove pulse effect
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
        if (!resultArea.value) return;
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
            alert("Nenhum roteiro gerado para baixar.");
            return;
        }

        const zip = new JSZip();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        // 1. Script File
        zip.file("01_roteiro_narracao.txt", resultArea.value);

        // 2. Visual Prompts (if any)
        if (visualContent.textContent && !visualSection.classList.contains('hidden')) {
            zip.file("02_prompts_midjourney.txt", visualContent.textContent);
        }

        // 3. Production Info
        const info = `
PROJECT METADATA
----------------
TOPIC: ${topicInput.value}
DATE: ${new Date().toLocaleString()}
VOICE_SPEED: ${rateInput.value}
VOICE_PITCH: ${pitchInput.value}
GENERATED_BY: HOMES Neural Deck v5.1
        `.trim();
        zip.file("03_info_producao.txt", info);

        // Generate and Download
        try {
            downloadZipBtn.textContent = "COMPACTANDO...";
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `HOMES_PROJECT_${timestamp}.zip`);
        } catch (e) {
            console.error(e);
            alert("Erro ao criar ZIP: " + e.message);
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

        const prompt = `
Contexto: Tenho este roteiro de vídeo:
"${currentScript}"

Tarefa: Crie 5 prompts de imagem detalhados e artísticos para o Midjourney/DALL-E que ilustrem as cenas principais deste roteiro.
Estilo: Cyberpunk, Cinematic, Photorealistic, 8k.
Formato: Apenas a lista dos 5 prompts, em Inglês (para melhor compatibilidade), sem introduções.
`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            const visuals = data.candidates?.[0]?.content?.parts?.[0]?.text;

            visualContent.textContent = visuals || "Falha ao gerar visuais.";
            visualSection.classList.remove('hidden');
            // Scroll to visuals
            visualSection.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            alert('Erro ao gerar visuais: ' + error.message);
        } finally {
            visualBtn.disabled = false;
            visualBtn.textContent = '👁️ EXTRAIR PROMPTS VISUAIS (MIDJOURNEY)';
            visualBtn.classList.remove('processing');
        }
    });

    copyVisualsBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(visualContent.textContent);
        const original = copyVisualsBtn.innerText;
        copyVisualsBtn.innerText = 'DONE';
        setTimeout(() => copyVisualsBtn.innerText = original, 2000);
    });

    // -------------------------

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
        // Queue-based Pause:
        // 1. Stop actual audio to free up resources
        window.speechSynthesis.cancel();
        
        // 2. Mark state as paused
        isPaused = true;
        isSpeakingQueue = false; // Stop auto-advancing
        
        // 3. Put the current chunk back at the START of the queue
        // so it plays again from the beginning when resumed.
        if (lastChunk) {
            speechQueue.unshift(lastChunk);
        }
        
        updateAudioUI('paused');
    });

    resumeBtn.addEventListener('click', () => {
        // Queue-based Resume:
        if (isPaused) {
            isPaused = false;
            isSpeakingQueue = true; // Re-enable auto-advance
            
            // Just play whatever is at the head of the queue (which is our saved chunk)
            playNextChunk();
        } else {
            // If somehow queue is empty or stopped, restart
            if (resultArea.value) speakText(resultArea.value);
        }
    });

    stopBtn.addEventListener('click', stopSpeaking);

    // Initial Render
    renderHistory();

    function speakText(text) {
        // Stop any current speech and clear queue
        stopSpeaking();
        isPaused = false;

        // --- RADICAL SANITIZATION (ALLOW-LIST) ---
        // 1. First, remove known structural blocks (meta-data)
        let processedText = text
            .replace(/\[[\s\S]*?\]/g, '') // Remove [Square Brackets] content
            .replace(/\([\s\S]*?\)/g, '') // Remove (Parentheses) content
            .replace(/(?:NARRATOR|VOICE OVER|VO|SCRIPT|Text Overlay|B-ROLL|SOUND):/gi, '') // Remove labels
            .replace(/---/g, ''); // Remove separators

        // 2. Then, keep ONLY alphanumeric and basic punctuation
        // Allow: Portuguese letters (accents), numbers, spaces, and .,?!:;
        let cleanText = processedText.replace(/[^a-zA-Z0-9À-ÿ\s.,?!:;]/g, ' ');

        // 3. Normalize whitespace
        cleanText = cleanText.replace(/\s+/g, ' ').trim();

        console.log("Sanitized text for TTS:", cleanText.substring(0, 100) + "...");

        if (!cleanText || cleanText.length < 2) {
            console.warn("Texto limpo muito curto ou vazio.");
            return;
        }

        // --- AGGRESSIVE CHUNKING (HARD LIMIT) ---
        // Some mobile engines crash with chunks > 200-300 chars.
        // We will split by sentence, then check length.
        
        const sentences = cleanText.split(/(?<=[.?!])\s+/);
        speechQueue = [];

        sentences.forEach(sentence => {
            sentence = sentence.trim();
            if (sentence.length === 0) return;

            // If sentence is acceptable size, push it
            if (sentence.length < 200) {
                speechQueue.push(sentence);
            } else {
                // If still too long, hard split by comma or spaces
                const subChunks = sentence.match(/.{1,180}(?:\s|$)/g) || [sentence];
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
        lastChunk = chunk; // Save for resume fallback
        
        // Final sanity check on chunk
        if (!chunk || chunk.length < 2) {
            playNextChunk();
            return;
        }

        currentUtterance = new SpeechSynthesisUtterance(chunk);
        
        // Force language
        currentUtterance.lang = 'pt-BR';

        // Set selected voice explicitly
        const selectedVoiceIndex = voiceSelect.value;
        if (selectedVoiceIndex !== "" && voices[selectedVoiceIndex]) {
            currentUtterance.voice = voices[selectedVoiceIndex];
        } else {
            // Fallback: Try to find ANY pt-BR voice
            const ptVoice = voices.find(v => v.lang.includes('pt'));
            if (ptVoice) {
                currentUtterance.voice = ptVoice;
            }
        }
        
        currentUtterance.rate = parseFloat(rateInput.value) || 1.1;
        currentUtterance.pitch = parseFloat(pitchInput.value) || 1.0;
        currentUtterance.volume = 1.0;

        currentUtterance.onstart = () => {
            updateAudioUI('playing');
        };

        currentUtterance.onend = () => {
            if (isSpeakingQueue) {
                playNextChunk();
            }
        };

        currentUtterance.onerror = (e) => {
            // Check if this error is just a consequence of a manual cancel/pause
            if (e.error === 'interrupted' || e.error === 'canceled' || (e.error === 'synthesis-failed' && isPaused)) {
                console.warn('Speech handled interruption:', e.error);
                return;
            }

            console.error('Speech synthesis error:', e.error, e);
            // On mobile, sometimes a quick cancel/retry helps
            if (isSpeakingQueue && speechQueue.length > 0) {
                window.speechSynthesis.cancel();
                setTimeout(() => playNextChunk(), 200);
            } else {
                // If not pausing and it's a real error, then stop
                if (!isPaused) stopSpeaking();
            }
        };

        // On mobile, it's critical to cancel before speaking to clear any hung states
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
            setTimeout(() => {
                if (!isPaused && isSpeakingQueue) window.speechSynthesis.speak(currentUtterance);
            }, 100);
        } else {
            window.speechSynthesis.speak(currentUtterance);
        }
    }

    function stopSpeaking() {
        window.speechSynthesis.cancel();
        isPaused = false;
        isSpeakingQueue = false;
        speechQueue = [];
        updateAudioUI('stopped');
    }

    function updateAudioUI(state) {
        // Hide all first
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
        if (history.length > 20) history.pop();
        saveHistory();
        renderHistory();
    }

    function saveHistory() {
        localStorage.setItem('homes_history', JSON.stringify(history));
    }

    function renderHistory() {
        historyList.innerHTML = '';
        
        if (history.length === 0) {
            historyList.innerHTML = '<li class="history-item placeholder">Nenhum dado arquivado.</li>';
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
            
            // Load item on main click
            li.onclick = (e) => {
                if (e.target.closest('.mini-play-btn')) return;
                loadHistoryItem(index);
            };

            // Play item specifically
            const miniPlayBtn = li.querySelector('.mini-play-btn');
            miniPlayBtn.onclick = (e) => {
                e.stopPropagation();
                playHistoryItem(index);
            };

            historyList.appendChild(li);
        });
    }

    function loadHistoryItem(index, shouldStopAudio = true) {
        // Stop audio if playing (default behavior)
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
        // Load item visually but DO NOT stop audio yet, as speakText will handle the transition
        loadHistoryItem(index, false);
        
        const item = history[index];
        if(item && item.script) {
            // Call speakText immediately to preserve user gesture
            speakText(item.script);
        }
    }
});