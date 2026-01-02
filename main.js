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

    // --- INITIALIZATION ---
    renderHistory();
    checkApiKey();

    outputSection.classList.add('hidden'); // Start hidden until generation or history load

    // --- EVENT LISTENERS ---

    apiKeyInput.addEventListener('change', () => {
        if(apiKeyInput.value) localStorage.setItem('homes_api_key', apiKeyInput.value);
    });
    
    // Save voice preference
    voiceSelect.addEventListener('change', () => {
        localStorage.setItem('homes_voice_pref', voiceSelect.value);
    });

    generateBtn.addEventListener('click', handleGeneration);

    copyBtn.addEventListener('click', () => {
        resultArea.select();
        document.execCommand('copy');
        const originalText = copyBtn.innerText;
        copyBtn.innerText = "COPIADO!";
        setTimeout(() => copyBtn.innerText = originalText, 2000);
    });

    clearHistoryBtn.addEventListener('click', () => {
        if(confirm('Tem certeza que deseja apagar toda a memória?')) {
            history = [];
            saveHistory();
            renderHistory();
            outputSection.classList.add('hidden');
        }
    });

    // Audio Controls
    playBtn.addEventListener('click', () => {
        const text = resultArea.value;
        if(!text) return;
        speakText(text);
    });

    pauseBtn.addEventListener('click', () => {
        if(window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            isPaused = true;
            updateAudioUI('paused');
        }
    });

    resumeBtn.addEventListener('click', () => {
        if(window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            isPaused = false;
            updateAudioUI('playing');
        }
    });

    stopBtn.addEventListener('click', stopSpeaking);

    // --- CORE FUNCTIONS ---

    function checkApiKey() {
        const savedKey = localStorage.getItem('homes_api_key');
        if (savedKey) apiKeyInput.value = savedKey;
    }

    async function handleGeneration() {
        const topic = topicInput.value;
        const apiKey = apiKeyInput.value;

        if (!apiKey) return alert("ERRO DE ACESSO: API Key necessária para conexão neural.");
        if (!topic) return alert("ERRO DE DADOS: Insira um tema para processar.");

        setLoadingState(true);
        resultArea.value = "/// INICIANDO PROTOCOLO NEURAL...\n/// AGUARDANDO RESPOSTA DO NÚCLEO (GEMINI-2.5-FLASH)...";
        outputSection.classList.remove('hidden');
        
        // Hide audio controls during generation
        updateAudioUI('stopped'); // Ensure reset
        playBtn.classList.add('hidden'); // Force hide play until done

        const systemPrompt = constructPrompt(topic);

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: systemPrompt }] }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Falha na conexão com o servidor');
            }

            const data = await response.json();
            const generatedText = data.candidates[0].content.parts[0].text;

            resultArea.value = generatedText;
            addToHistory(topic, generatedText);
            
            // Show play button
            playBtn.classList.remove('hidden');

        } catch (error) {
            console.error(error);
            resultArea.value = `/// ERRO CRÍTICO NO SISTEMA ///\n\nDetalhes: ${error.message}`;
        } finally {
            setLoadingState(false);
        }
    }

    function constructPrompt(topic) {
        return `
[ROLE]: You are a Senior YouTube Scriptwriter for High-Retention Faceless Channels.
[TOPIC]: ${topic}

[OBJECTIVE]: Create a viral video script (8-10 minutes) optimized for retention and CTR.

[STRUCTURE REQUIREMENTS]:
1. THE HOOK (0:00-0:30):
   - Start with a visual paradox or a bold statement immediately.
   - No "Welcome back to the channel". Jump straight into the action.
   - Open a "Loop" that will only be closed at the end.

2. THE BODY (Modular Blocks):
   - Break content into 3-4 distinct sub-topics.
   - Use simple language (Grade 6 level).
   - Insert a "Pattern Interrupt" (joke, weird fact, sound effect cue) every 45 seconds.

3. ESTHETIC CUES (For Editor):
   - [B-ROLL]: Suggest specific stock footage or motion graphics for each paragraph.
   - [SOUND]: Suggest SFX (whooshes, risers, hits).

4. TONE:
   - Mysterious, energetic, yet professional.
   - "Absolute Cinema" vibe.

[OUTPUT FORMAT]:
- Provide the full script in Markdown.
- Highlight specific keywords for on-screen text overlays.
`;
    }

    function setLoadingState(isLoading) {
        if (isLoading) {
            generateBtn.innerText = "ESTABELECENDO CONEXÃO...";
            generateBtn.disabled = true;
        } else {
            generateBtn.innerText = "PROCESSAR ROTEIRO";
            generateBtn.disabled = false;
        }
    }

    // --- AUDIO SYSTEM ---
    
    function populateVoices() {
        voices = window.speechSynthesis.getVoices();
        voiceSelect.innerHTML = '';
        
        if(voices.length === 0) {
            const option = document.createElement('option');
            option.textContent = "Carregando vozes...";
            voiceSelect.appendChild(option);
            return;
        }

        voices.forEach((voice, i) => {
            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            option.value = i;
            voiceSelect.appendChild(option);
        });

        // Restore preference
        const savedVoice = localStorage.getItem('homes_voice_pref');
        if(savedVoice) {
            voiceSelect.value = savedVoice;
        }
    }
    
    populateVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoices;
    }

    function speakText(text) {
        // Stop any current speech
        window.speechSynthesis.cancel();
        isPaused = false;

        // Clean text (remove Markdown * and # for smoother reading)
        const cleanText = text.replace(/[*#]/g, '');

        currentUtterance = new SpeechSynthesisUtterance(cleanText);
        
        // Set selected voice
        const selectedVoiceIndex = voiceSelect.value;
        if (voices[selectedVoiceIndex]) {
            currentUtterance.voice = voices[selectedVoiceIndex];
        } else {
             currentUtterance.lang = 'pt-BR'; // Fallback
        }
        
        currentUtterance.rate = 1.1;

        // Visualizer Sync
        currentUtterance.onstart = () => {
            updateAudioUI('playing');
        };

        currentUtterance.onend = stopSpeaking;
        currentUtterance.onerror = (e) => {
            console.error('Speech error:', e.error);
            stopSpeaking();
        };

        window.speechSynthesis.speak(currentUtterance);
    }

    function stopSpeaking() {
        window.speechSynthesis.cancel();
        isPaused = false;
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