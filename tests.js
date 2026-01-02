/**
 * @file tests.js
 * @description Unit tests for HOMES: Neural Deck core logic.
 * Run with Node.js to verify text processing and sanitation rules.
 */

// --- MOCK CONFIG FROM MAIN.JS ---
const CONFIG = {
    CLEANING_REGEX: {
        META: /\[[\s\S]*?\]/g,
        PARENS: /\([\s\S]*?\)/g,
        LABELS: /(?:NARRATOR|VOICE OVER|VO|SCRIPT|Text Overlay|B-ROLL|SOUND):/gi,
        // New: Explicitly remove timestamps like 0:00 or 00:00
        TIMESTAMPS: /\d{1,2}:\d{2}(?:-\d{1,2}:\d{2})?/g,
        SYMBOLS: /[^a-zA-Z0-9À-ÿ\s.,?!:;]/g
    }
};

// --- LOGIC TO TEST ---
function sanitizeText(text) {
    let processedText = text
        .replace(CONFIG.CLEANING_REGEX.META, '') 
        .replace(CONFIG.CLEANING_REGEX.PARENS, '') 
        .replace(CONFIG.CLEANING_REGEX.TIMESTAMPS, '') // Apply timestamp removal
        .replace(CONFIG.CLEANING_REGEX.LABELS, '') 
        .replace(/---/g, ''); 

    let cleanText = processedText.replace(CONFIG.CLEANING_REGEX.SYMBOLS, ' ');
    return cleanText.replace(/\s+/g, ' ').trim();
}

// --- TEST SUITE ---
const tests = [
    {
        name: "Remove Timestamps",
        input: "Olá mundo (0:00-0:30)",
        expected: "Olá mundo"
    },
    {
        name: "Remove Sound Cues",
        input: "[SOUND: Explosion] Tudo ficou escuro.",
        expected: "Tudo ficou escuro."
    },
    {
        name: "Remove Narrator Labels",
        input: "NARRATOR: Bem vindos. VOICE OVER: Ao futuro.",
        expected: "Bem vindos. Ao futuro."
    },
    {
        name: "Remove Weird Symbols",
        input: "Olá @#%&* mundo!",
        expected: "Olá mundo!"
    },
    {
        name: "Complex Scenario",
        input: "[INTRO] (0:00) NARRATOR: Teste final --- Fim.",
        expected: "Teste final Fim."
    }
];

// --- RUNNER ---
console.log("🚀 RUNNING HOMES UNIT TESTS...\n");
let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
    const result = sanitizeText(test.input);
    if (result === test.expected) {
        console.log(`✅ Test ${index + 1}: ${test.name} PASSED`);
        passed++;
    } else {
        console.error(`❌ Test ${index + 1}: ${test.name} FAILED`);
        console.error(`   Expected: "${test.expected}"`);
        console.error(`   Got:      "${result}"`);
        failed++;
    }
});

console.log(`\n🏁 RESULTS: ${passed} Passed, ${failed} Failed.`);

if (failed > 0) process.exit(1);
