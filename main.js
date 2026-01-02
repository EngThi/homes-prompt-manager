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
    let speechQueue = [];
    let isSpeakingQueue = false;

    // ... (rest of the code)

    function speakText(text) {
        // Stop any current speech and clear queue
        stopSpeaking();
        isPaused = false;

        // --- AGGRESSIVE CLEANING ---
        let cleanText = text
            // Remove text between brackets [] (e.g., [SOUND], [B-ROLL])
            .replace(/(\[.*?\])/g, '')
            // Remove text between parentheses () (e.g., (0:00-0:30))
            .replace(/(\([^)]*\))/g, '')
            // Remove Markdown headers (#, ##) and bold/italic (*, **)
            .replace(/[#*]/g, '')
            // Remove multiple newlines and extra spaces
            .replace(/\s+/g, ' ')
            .trim();

        if (!cleanText) {
            alert("Não há texto narrável neste roteiro.");
            return;
        }

        // --- ROBUST CHUNKING ---
        // Split by sentence delimiters (. ? ! : ;)
        // The regex looks for the delimiter followed by a space or end of string
        // This keeps the delimiter attached to the previous sentence
        const sentences = cleanText.match(/[^.?!:;]+[.?!:;]+/g) || [cleanText];
        
        // Filter out very short or empty chunks (noise)
        speechQueue = sentences.filter(s => s.trim().length > 1);
        
        isSpeakingQueue = true;
        playNextChunk();
    }

    function playNextChunk() {
        if (!isSpeakingQueue || speechQueue.length === 0) {
            stopSpeaking();
            return;
        }

        const chunk = speechQueue.shift();
        currentUtterance = new SpeechSynthesisUtterance(chunk);
        
        // Set selected voice
        const selectedVoiceIndex = voiceSelect.value;
        if (voices[selectedVoiceIndex]) {
            currentUtterance.voice = voices[selectedVoiceIndex];
        } else {
             currentUtterance.lang = 'pt-BR'; // Fallback
        }
        
        currentUtterance.rate = 1.1;

        currentUtterance.onstart = () => {
            updateAudioUI('playing');
        };

        currentUtterance.onend = () => {
            if (isSpeakingQueue && speechQueue.length > 0) {
                playNextChunk();
            } else {
                stopSpeaking();
            }
        };

        currentUtterance.onerror = (e) => {
            console.error('Speech error:', e.error);
            // Attempt to continue to next chunk even on error
            if (isSpeakingQueue && speechQueue.length > 0) {
                playNextChunk();
            } else {
                stopSpeaking();
            }
        };

        window.speechSynthesis.speak(currentUtterance);
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