// app.js - Full Interactive Logic for vibe.mytokencost.com (Release-Ready with Social Sharing Intents)

// Unified State Management (Persistent across workspace switches)
const state = {
    activeWorkspace: 'code', // 'code' or 'media'
    activeTab: 'calculator',  // 'calculator', 'compactor', 'localfirst', 'cheatsheet', 'auditor' (code)
                             // 'vision', 'svgopt', 'multimodal' (media)
    
    // Calculator Parameters
    selectedModel: 'sonnet',
    modelLimit: 200000,
    filesCount: 50,
    promptsPerHour: 20,
    agentLookup: true,
    agentTerminal: true,

    // Vision Parameters
    imageWidth: 1024,
    imageHeight: 768,
    visionModel: 'gpt4o', 
    visionDetail: 'high',  

    // Multimodal & Video Storyboard Parameters
    audioDuration: 60, // seconds
    videoDuration: 10, // seconds
    videoFps: 1,       // frames per second
    videoModel: 'sora2', // 'sora2', 'kling3', 'runway4', 'veo'
    videoRetryMultiplier: 1.5,
};

// Initializers & Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Parse any shared URL configurations on startup
    parseUrlParameters();

    // Setup active Workspace and Tab routing
    setWorkspace(state.activeWorkspace);
    switchTab(state.activeTab);
    
    // Run initial data bindings
    updateCalculator();
    updateLocalWizard();
    generateRules();
    updateVisionCalculations();
    updateMultimodalCalculations();

    // Attach Event Listeners to prompt compactor
    const compactorInput = document.getElementById('compactor-input');
    if (compactorInput) {
        compactorInput.addEventListener('input', compactPrompt);
    }
    compactPrompt(); 
});

// ================= DYNAMIC ROUTING & SOCIAL SHARING ENGINE =================

// Parses URL pathnames and query terms on load to recreate exact user diagnostic state
function parseUrlParameters() {
    const path = window.location.pathname.toLowerCase().replace('/', '');
    const searchParams = new URLSearchParams(window.location.search);

    const codeTabs = ['calculator', 'compactor', 'localfirst', 'cheatsheet', 'auditor'];
    const mediaTabs = ['vision', 'svgopt', 'multimodal'];

    if (codeTabs.includes(path)) {
        state.activeWorkspace = 'code';
        state.activeTab = path;
    } else if (mediaTabs.includes(path)) {
        state.activeWorkspace = 'media';
        state.activeTab = path;
    }

    if (searchParams.has('model')) state.selectedModel = searchParams.get('model');
    if (searchParams.has('files')) state.filesCount = parseInt(searchParams.get('files'));
    if (searchParams.has('prompts')) state.promptsPerHour = parseInt(searchParams.get('prompts'));
    if (searchParams.has('lookup')) state.agentLookup = searchParams.get('lookup') === 'true';
    if (searchParams.has('terminal')) state.agentTerminal = searchParams.get('terminal') === 'true';

    if (searchParams.has('w')) state.imageWidth = parseInt(searchParams.get('w'));
    if (searchParams.has('h')) state.imageHeight = parseInt(searchParams.get('h'));
    if (searchParams.has('vmodel')) state.visionModel = searchParams.get('vmodel');
    if (searchParams.has('vdetail')) state.visionDetail = searchParams.get('vdetail');
    if (searchParams.has('audio')) state.audioDuration = parseInt(searchParams.get('audio'));
    if (searchParams.has('video')) state.videoDuration = parseInt(searchParams.get('video'));
    if (searchParams.has('fps')) state.videoFps = parseInt(searchParams.get('fps'));
    if (searchParams.has('vidmodel')) state.videoModel = searchParams.get('vidmodel');

    syncStateToDom();
}

function syncStateToDom() {
    if (state.selectedModel === 'sonnet') state.modelLimit = 200000;
    if (state.selectedModel === 'gpt4o') state.modelLimit = 120000;
    if (state.selectedModel === 'cheapor') state.modelLimit = 1000000;

    const lookupCheck = document.getElementById('agent-multi-file');
    const terminalCheck = document.getElementById('agent-terminal');
    if (lookupCheck) lookupCheck.checked = state.agentLookup;
    if (terminalCheck) terminalCheck.checked = state.agentTerminal;

    const filesSlider = document.getElementById('files-slider');
    const promptsSlider = document.getElementById('prompts-slider');
    if (filesSlider) filesSlider.value = state.filesCount;
    if (promptsSlider) promptsSlider.value = state.promptsPerHour;

    const wSlider = document.getElementById('vision-width-slider');
    const hSlider = document.getElementById('vision-height-slider');
    if (wSlider) wSlider.value = state.imageWidth;
    if (hSlider) hSlider.value = state.imageHeight;

    const audioSlider = document.getElementById('multimodal-audio-slider');
    const videoSlider = document.getElementById('multimodal-video-slider');
    const fpsSlider = document.getElementById('multimodal-fps-slider');
    if (audioSlider) audioSlider.value = state.audioDuration;
    if (videoSlider) videoSlider.value = state.videoDuration;
    if (fpsSlider) fpsSlider.value = state.videoFps;

    const vModelSelect = document.getElementById('vision-model');
    const vDetailSelect = document.getElementById('vision-detail');
    if (vModelSelect) vModelSelect.value = state.visionModel;
    if (vDetailSelect) vDetailSelect.value = state.visionDetail;
}

function syncStateToUrl() {
    const url = new URL(window.location.origin);
    url.pathname = '/' + state.activeTab;

    if (state.activeWorkspace === 'code') {
        url.searchParams.set('model', state.selectedModel);
        url.searchParams.set('files', state.filesCount);
        url.searchParams.set('prompts', state.promptsPerHour);
        url.searchParams.set('lookup', state.agentLookup);
        url.searchParams.set('terminal', state.agentTerminal);
    } else {
        if (state.activeTab === 'vision') {
            url.searchParams.set('w', state.imageWidth);
            url.searchParams.set('h', state.imageHeight);
            url.searchParams.set('vmodel', state.visionModel);
            url.searchParams.set('vdetail', state.visionDetail);
        } else if (state.activeTab === 'multimodal') {
            url.searchParams.set('audio', state.audioDuration);
            url.searchParams.set('video', state.videoDuration);
            url.searchParams.set('fps', state.videoFps);
            url.searchParams.set('vidmodel', state.videoModel);
        }
    }
    window.history.replaceState({}, '', url.toString());
}

function getShareUrl() {
    const url = new URL(window.location.origin);
    url.pathname = '/' + state.activeTab;

    if (state.activeWorkspace === 'code') {
        url.searchParams.set('model', state.selectedModel);
        url.searchParams.set('files', state.filesCount);
        url.searchParams.set('prompts', state.promptsPerHour);
        url.searchParams.set('lookup', state.agentLookup);
        url.searchParams.set('terminal', state.agentTerminal);
    } else {
        if (state.activeTab === 'vision') {
            url.searchParams.set('w', state.imageWidth);
            url.searchParams.set('h', state.imageHeight);
            url.searchParams.set('vmodel', state.visionModel);
            url.searchParams.set('vdetail', state.visionDetail);
        } else if (state.activeTab === 'multimodal') {
            url.searchParams.set('audio', state.audioDuration);
            url.searchParams.set('video', state.videoDuration);
            url.searchParams.set('fps', state.videoFps);
            url.searchParams.set('vidmodel', state.videoModel);
        }
    }
    return url.toString();
}

function copyShareUrl() {
    const url = getShareUrl();
    navigator.clipboard.writeText(url).then(() => {
        showToast("Dynamic sharing URL copied to clipboard!");
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// 2.7 Pre-populated native social media redirects for maximum attraction conversions
function shareToSocial(platform) {
    const url = getShareUrl();
    let text = "";

    // Generate high-converting text hooks based on the active tab
    if (state.activeTab === 'calculator') {
        text = `My agentic compile retries are costing me pricing overflows on Claude Sonnet! Checked my compounding token burn rate here:`;
    } else if (state.activeTab === 'compactor') {
        text = `Minified raw instructions context to cut LLM token bills by 45% and graded my Prompt Caching alignment index! Optimize code here:`;
    } else if (state.activeTab === 'localfirst') {
        text = `Cloud rate limit lockouts are real. I just mapped my host VRAM to compile a local Ollama fallback config. Build yours here:`;
    } else if (state.activeTab === 'cheatsheet') {
        text = `Just built custom workspace .cursorrules directives to stop runaway background agent costs. Generate your rule profiles:`;
    } else if (state.activeTab === 'vision') {
        text = `Measured high-detail image slice tiles for Claude and GPT vision models to avoid multimodal pricing tax! Count visual tiles here:`;
    } else if (state.activeTab === 'multimodal') {
        text = `Planned Gemini multi-modal audio/video tokens and Sora scene storyboard failures to curb budget leaks. Trace multimodal streams:`;
    } else {
        text = `Optimize LLM context indices, prompt caches, and visual asset allocations recursively. Trace token leaks here:`;
    }

    let shareUrl = "";
    if (platform === 'x') {
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=VibeCoding,LLM`;
    } else if (platform === 'linkedin') {
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    } else if (platform === 'reddit') {
        shareUrl = `https://www.reddit.com/submit?title=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    }

    if (shareUrl) {
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
        showToast(`Opening share draft on ${platform === 'x' ? 'X / Twitter' : platform === 'linkedin' ? 'LinkedIn' : 'Reddit'}!`);
    }
}

// Workspace Switcher
function setWorkspace(workspace) {
    state.activeWorkspace = workspace;
    
    const codeBtn = document.getElementById('ws-code-btn');
    const mediaBtn = document.getElementById('ws-media-btn');
    const badge = document.getElementById('workspace-badge');
    const title = document.getElementById('workspace-title');
    const desc = document.getElementById('workspace-desc');

    const codeSection = document.getElementById('workspace-code-section');
    const mediaSection = document.getElementById('workspace-media-section');

    if (workspace === 'code') {
        codeBtn.className = "flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 bg-indigo-600 text-white shadow-sm shadow-indigo-900/50";
        mediaBtn.className = "flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 text-slate-400 hover:text-slate-100";
        
        badge.innerHTML = "⚡ Code Workspace Active";
        badge.className = "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 mb-3 shadow-inner";
        title.innerHTML = "Vibe Coding Optimization Hub";
        title.className = "text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-indigo-200 to-indigo-400 bg-clip-text text-transparent";
        desc.innerHTML = `Vibe coding is magic until your context window hits the limit. Compress prompts, audit directories before querying agents, construct optimized <code class="code-font bg-slate-900 text-indigo-400 px-1 py-0.5 rounded">.cursorrules</code> files, or construct a hybrid local fallback architecture.`;

        codeSection.classList.remove('hidden');
        mediaSection.classList.add('hidden');
        
        renderTabs([
            { id: 'calculator', label: '📊 Burn Calculator', action: () => switchTab('calculator') },
            { id: 'compactor', label: '🗜 Prompt Compactor', action: () => switchTab('compactor') },
            { id: 'localfirst', label: '🔌 Local Fallback', action: () => switchTab('localfirst') },
            { id: 'cheatsheet', label: '🛡 .cursorrules Builder', action: () => switchTab('cheatsheet') },
            { id: 'auditor', label: '💻 Git Token Auditor', action: () => switchTab('auditor') },
        ]);
        switchTab(state.activeTab === 'vision' || state.activeTab === 'svgopt' || state.activeTab === 'multimodal' ? 'calculator' : state.activeTab);
    } else {
        codeBtn.className = "flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 text-slate-400 hover:text-slate-100";
        mediaBtn.className = "flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 bg-pink-600 text-white shadow-sm shadow-pink-900/50";
        
        badge.innerHTML = "🎨 Creative Media Studio Workspace";
        badge.className = "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs font-semibold text-pink-400 mb-3 shadow-inner";
        title.innerHTML = "Pixel & Visual Asset Optimizer";
        title.className = "text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-pink-200 to-rose-400 bg-clip-text text-transparent";
        desc.innerHTML = `Visual feeds drag hefty pricing taxes inside multi-modal models. Optimize SVGs recursively, compute pixel boundary tiles, and count video storyboard credits before querying premium agents.`;

        codeSection.classList.add('hidden');
        mediaSection.classList.remove('hidden');

        renderTabs([
            { id: 'vision', label: '👁 Vision Tile Estimator', action: () => switchTab('vision') },
            { id: 'svgopt', label: '🕸 SVG Optimizer', action: () => switchTab('svgopt') },
            { id: 'multimodal', label: '🎥 Multi-Modal & Video Planner', action: () => switchTab('multimodal') },
        ]);
        switchTab(state.activeTab !== 'vision' && state.activeTab !== 'svgopt' && state.activeTab !== 'multimodal' ? 'vision' : state.activeTab);
    }
}

// Sub-navigation Tab Renderer
function renderTabs(tabs) {
    const container = document.getElementById('tab-nav-container');
    container.innerHTML = '';
    
    tabs.forEach(tab => {
        const button = document.createElement('button');
        button.id = `tab-btn-${tab.id}`;
        button.innerHTML = tab.label;
        button.onclick = tab.action;
        button.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 text-slate-400 hover:text-slate-200 hover:bg-slate-900";
        container.appendChild(button);
    });
}

// Workspace Tab Routing
function switchTab(tabId) {
    state.activeTab = tabId;
    
    const codeSections = document.querySelectorAll('.content-section-code');
    const mediaSections = document.querySelectorAll('.content-section-media');
    
    codeSections.forEach(s => s.classList.add('hidden'));
    mediaSections.forEach(s => s.classList.add('hidden'));

    const targetSection = document.getElementById(`section-${tabId}`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }

    const allTabButtons = document.querySelectorAll('#tab-nav-container button');
    allTabButtons.forEach(btn => {
        const themeColor = state.activeWorkspace === 'code' 
            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
            : 'bg-pink-500/10 text-pink-400 border border-pink-500/20';
        if (btn.id === `tab-btn-${tabId}`) {
            btn.className = `px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${themeColor}`;
        } else {
            btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent";
        }
    });

    // Update URL pathname on tab routing changes
    syncStateToUrl();

    // Handle conditional bindings on tab switch
    if (tabId === 'vision') {
        updateVisionCalculations();
    } else if (tabId === 'multimodal') {
        updateMultimodalCalculations();
    }
}

// ================= CODE WORKSPACE LOGIC =================

// Model Selector Actions
function selectModel(modelId, limitValue) {
    state.selectedModel = modelId;
    state.modelLimit = limitValue;

    const cards = document.querySelectorAll('.model-card');
    cards.forEach(card => {
        card.className = "model-card border border-slate-800 bg-slate-900/60 p-3 rounded-xl cursor-pointer hover:border-slate-700 hover:bg-slate-800/20 transition-all flex flex-col justify-between h-24";
        const dot = card.querySelector('span[class*="bg-"]');
        if (dot) {
            dot.className = "h-2 w-2 rounded-full bg-slate-600";
        }
    });

    const targetLabel = event.currentTarget;
    targetLabel.className = "model-card border-2 border-indigo-500 bg-indigo-500/5 p-3 rounded-xl cursor-pointer hover:bg-slate-800/40 transition-all flex flex-col justify-between h-24";
    const activeDot = targetLabel.querySelector('span[class*="bg-"]');
    if (activeDot) {
        activeDot.className = "h-2 w-2 rounded-full bg-indigo-400 shadow-glow";
    }

    updateCalculator();
}

// 2.1 Compounding Token Burn Calculator Logic
function updateCalculator() {
    const filesSlider = document.getElementById('files-slider');
    const promptsSlider = document.getElementById('prompts-slider');
    const lookupCheck = document.getElementById('agent-multi-file');
    const terminalCheck = document.getElementById('agent-terminal');

    if (filesSlider) state.filesCount = parseInt(filesSlider.value);
    if (promptsSlider) state.promptsPerHour = parseInt(promptsSlider.value);
    if (lookupCheck) state.agentLookup = lookupCheck.checked;
    if (terminalCheck) state.agentTerminal = terminalCheck.checked;

    document.getElementById('files-val').innerText = `${state.filesCount} files`;
    document.getElementById('prompts-val').innerText = `${state.promptsPerHour} prompts`;

    // Mathematical Parameters
    const tokensPerFile = 1400; 
    const baseSystemRulesOverhead = 5000;
    const initialQueryTokens = 1000;
    const historyGrowthPerQuery = 750; // Every prompt appends previous input/output history

    // Size of codebase base payload (Tokens)
    const codebaseSize = state.filesCount * tokensPerFile;

    // Apply Agent Multipliers
    let agentMultiplier = 1.0;
    if (state.agentLookup) agentMultiplier += 0.25; // Crawls related file references

    // Effective query frequency (Terminal Compiler Loop triggers repeated retries)
    let effectiveQueries = state.promptsPerHour;
    if (state.agentTerminal) effectiveQueries = Math.round(effectiveQueries * 1.35);

    // Dynamic Compounding progression loop:
    let totalTokensPerHour = 0;
    let singlePayloadSize = 0;

    for (let i = 1; i <= effectiveQueries; i++) {
        const queryPayload = Math.round((codebaseSize * agentMultiplier) + baseSystemRulesOverhead + initialQueryTokens + (i * historyGrowthPerQuery));
        totalTokensPerHour += queryPayload;
        if (i === effectiveQueries) {
            singlePayloadSize = queryPayload; // Footprint of final prompt
        }
    }

    // 2026 Inference cost matrices per 1M tokens
    let pricePerMillion = 3.75;
    if (state.selectedModel === 'sonnet') pricePerMillion = 4.50;
    if (state.selectedModel === 'cheapor') pricePerMillion = 0.22;

    const hourlyCost = (totalTokensPerHour / 1000000) * pricePerMillion;

    // Lockout risk threshold visualizer
    const pctOfLimit = (totalTokensPerHour / state.modelLimit) * 100;
    const timeToLockoutMins = pctOfLimit > 100 ? (state.modelLimit / (totalTokensPerHour / 60)) : 60;

    // Render diagnostic metrics
    document.getElementById('tokens-per-hour').innerText = formatTokenCount(totalTokensPerHour);
    document.getElementById('prompt-size-calc').innerText = `${formatTokenCount(singlePayloadSize)} tokens`;
    document.getElementById('multiplier-calc').innerText = `${agentMultiplier.toFixed(2)}x`;
    document.getElementById('cost-calc').innerText = `$${hourlyCost.toFixed(2)}`;

    const limitPctText = document.getElementById('limit-pct');
    const limitBar = document.getElementById('limit-bar');
    const statusHeader = document.getElementById('status-header');
    const statusGlow = document.getElementById('status-glow');
    const statusIconBox = document.getElementById('status-icon-box');
    const lockoutText = document.getElementById('time-to-wall');

    limitPctText.innerText = `${pctOfLimit.toFixed(0)}% of Limit`;
    limitBar.style.width = `${Math.min(pctOfLimit, 100)}%`;

    if (pctOfLimit < 50) {
        // Safe (Deep Emerald Green)
        statusHeader.innerText = "Fluid Coding Zone";
        statusHeader.className = "text-xl font-extrabold text-emerald-400 tracking-tight";
        statusGlow.className = "absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl transition-colors duration-500";
        statusIconBox.className = "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
        statusIconBox.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>`;
        limitBar.className = "bg-emerald-500 h-full rounded-full transition-all duration-300";
        lockoutText.innerText = "No Lockout Risk";
        lockoutText.className = "block text-lg font-bold text-emerald-400 tracking-tight code-font";
    } else if (pctOfLimit >= 50 && pctOfLimit < 95) {
        // Warning (Amber Yellow)
        statusHeader.innerText = "Context Bleeding warning";
        statusHeader.className = "text-xl font-extrabold text-amber-400 tracking-tight";
        statusGlow.className = "absolute -top-12 -right-12 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl transition-colors duration-500";
        statusIconBox.className = "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-emerald-500/20";
        statusIconBox.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>`;
        limitBar.className = "bg-amber-500 h-full rounded-full transition-all duration-300";
        lockoutText.innerText = `~${timeToLockoutMins.toFixed(0)} Mins`;
        lockoutText.className = "block text-lg font-bold text-amber-400 tracking-tight code-font";
    } else {
        // Lockout Warning (Flashing Neon Red)
        statusHeader.innerText = "Dangerous Token Bleed";
        statusHeader.className = "text-xl font-extrabold text-rose-400 tracking-tight animate-pulse";
        statusGlow.className = "absolute -top-12 -right-12 h-32 w-32 rounded-full bg-rose-500/20 blur-3xl transition-colors duration-500";
        statusIconBox.className = "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-bounce";
        statusIconBox.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>`;
        limitBar.className = "bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-300 animate-pulse";
        lockoutText.innerText = `${timeToLockoutMins.toFixed(1)} Mins`;
        lockoutText.className = "block text-lg font-bold text-rose-400 tracking-tight code-font animate-pulse";
    }

    // Sync query states to URL live
    syncStateToUrl();
}

// Utility to format token numbers
function formatTokenCount(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'K';
    }
    return num;
}

// ================= PROMPT COMPACTOR CORE =================
function compactPrompt() {
    const input = document.getElementById('compactor-input').value;
    const outputField = document.getElementById('compactor-output');
    
    // Code Minification Engine (Strips block/inline comments and horizontal whitespaces)
    let compacted = input.replace(/\/\*[\s\S]*?\*\//g, ''); // /* Comments */
    compacted = compacted.replace(/\/\/.*$/gm, '');         // // Comments
    compacted = compacted.replace(/#.*$/gm, '');            // # Shell Comments
    compacted = compacted.replace(/\n\s*\n/g, '\n');        // Empty lines
    compacted = compacted.replace(/[ \t]+/g, ' ');          // Double tabs/spaces
    compacted = compacted.replace(/[ \t]+$/gm, '');         // Trailing spaces
    compacted = compacted.trim();

    outputField.value = compacted;

    // Telemetry Delta Calculations
    const origLen = input.length;
    const compLen = compacted.length;
    const origTokens = Math.round(origLen / 3.8);
    const compTokens = Math.round(compLen / 3.8);
    const tokensSaved = Math.max(0, origTokens - compTokens);

    const savingRatio = origLen > 0 ? ((origLen - compLen) / origLen) * 100 : 0;

    // 2026 Inference cost mappings per 1M tokens ($3.00 mixed rate)
    const financialSavings = (tokensSaved / 1000000) * 3.00;

    document.getElementById('compactor-reduction').innerText = `${savingRatio.toFixed(0)}% Saved`;
    document.getElementById('compactor-orig-tokens').innerText = `${origTokens.toLocaleString()} t`;
    document.getElementById('compactor-comp-tokens').innerText = `${compTokens.toLocaleString()} t`;
    
    // Inject pricing savings text dynamically to layout
    const savingsEl = document.getElementById('compactor-savings');
    if (savingsEl) {
        savingsEl.innerText = `$${financialSavings.toFixed(5)}`;
    }

    // 2.2 Cache Alignment Score Grader
    const lowInput = input.toLowerCase();
    const taskIndex = Math.max(lowInput.lastIndexOf('task:'), lowInput.lastIndexOf('todo:'), lowInput.lastIndexOf('refactor:'), lowInput.lastIndexOf('query:'));
    
    let cacheScore = 0;
    const badge = document.getElementById('cache-badge');
    const scoreText = document.getElementById('cache-score');

    if (taskIndex === -1) {
        cacheScore = 50; 
    } else {
        const relativePosition = taskIndex / input.length;
        cacheScore = Math.round(relativePosition * 100);
    }

    cacheScore = Math.max(10, Math.min(100, cacheScore));

    if (cacheScore >= 80) {
        badge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
        badge.innerText = "Cache Status: Fully Optimized";
        scoreText.className = "block text-base font-bold text-emerald-400 tracking-tight code-font";
    } else if (cacheScore >= 50 && cacheScore < 80) {
        badge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30";
        badge.innerText = "Cache Status: Partially Safe";
        scoreText.className = "block text-base font-bold text-amber-400 tracking-tight code-font";
    } else {
        badge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30";
        badge.innerText = "Cache Status: Invalid (Wastes Caches)";
        scoreText.className = "block text-base font-bold text-rose-400 tracking-tight code-font";
    }

    scoreText.innerText = `${cacheScore}% Score`;
}

// ================= LOCAL FALLBACK ARCHITECT =================
function updateLocalWizard() {
    const hardware = document.getElementById('local-hardware').value;
    const ide = document.getElementById('local-ide').value;

    let modelName = 'Qwen3.6-7B-Instruct';
    let speed = '~28 tok/sec';
    let vram = '6.2GB';
    let configPayload = '';

    // 2.3 2026 local hardware to open-weight LLM mapping arrays
    if (hardware === 'apple-m-max') {
        modelName = 'Qwen3-Coder-Next (Q4_K_M) / Kimi K2.6 (Ollama)';
        speed = '~38 tok/sec';
        vram = '24GB+ (Unified)';
    } else if (hardware === 'apple-m-base') {
        modelName = 'Qwen3.6-27B-Instruct (Q4_K_M)';
        speed = '~20 tok/sec';
        vram = '14.8GB (Unified)';
    } else if (hardware === 'nvidia-4090') {
        modelName = 'Qwen3-Coder-Next (Q8_0) / Kimi K2.6';
        speed = '~72 tok/sec';
        vram = '22.5GB (VRAM)';
    } else if (hardware === 'nvidia-mid') {
        modelName = 'Qwen3.6-27B-Instruct (Q8_0) / Devstral Small 2 (24B)';
        speed = '~45 tok/sec';
        vram = '15.2GB (VRAM)';
    } else if (hardware === 'cpu-only') {
        modelName = 'Qwen3.6-7B-Instruct (Q4_K_S) / Lightweight 8B';
        speed = '~12 tok/sec';
        vram = '5.8GB (RAM)';
    }

    // Config Exporters for Cline / Roo Code / Continue
    if (ide === 'continue') {
        configPayload = `{
  "models": [
    {
      "title": "Local Coder (${modelName.split(' ')[0]})",
      "provider": "ollama",
      "model": "${modelName.toLowerCase().split('-')[0].replace('(', '')}"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Autocomplete",
    "provider": "ollama",
    "model": "qwen3.6-coder:1.5b"
  },
  "customCommands": [
    {
      "name": "vibe-check",
      "prompt": "Evaluate code against prompt caching constraints. Exclude bloated subdirectories."
    }
  ]
}`;
    } else if (ide === 'cline') {
        configPayload = `To run locally in Cline / Roo Code:
1. Run: "ollama run ${modelName.toLowerCase().split('-')[0].replace('(', '')}"
2. Open extension API Providers settings panel.
3. Select "Ollama" from dropdown list.
4. Set Host Endpoint URL to: http://localhost:11434
5. Ensure Model matches: ${modelName.toLowerCase().split(' ')[0]}
6. Target allocation threshold: ${vram} memory footprint.`;
    } else {
        configPayload = `To route Cursor IDE infrastructure to localhost:
1. Open settings -> Models.
2. Under OpenAI API Override, enter: http://localhost:11434/v1
3. Set API Key to any dummy string (e.g. "local-key").
4. Under model selector toggle, add custom key:
   "${modelName.toLowerCase().split('-')[0].replace('(', '')}"
5. System drafting tasks now bypass subscription limitations.`;
    }

    document.getElementById('rec-model').innerText = modelName;
    document.getElementById('rec-speed').innerText = speed;
    document.getElementById('rec-vram').innerText = vram;
    document.getElementById('wizard-config-area').innerText = configPayload;
}

// ================= CONTEXT GUARD CHEAT SHEET =================
// 2.4 Context Guard .cursorrules Builder Config
function generateRules() {
    const enforceConcise = document.getElementById('rule-stop-search').checked; // concisely answer (strip fluff)
    const scopeFile = document.getElementById('rule-summarize').checked;        // Scope files (prevent reading whole repo)
    const checkPoint = document.getElementById('rule-dry-run').checked;       // checkpoint status summary files
    const diffOnly = document.getElementById('rule-diffs').checked;

    let rulesText = `# .cursorrules - Vibe Optimization configurations
# Minimizes context overheads and controls runaway token invoices

`;

    if (enforceConcise) {
        rulesText += `## Fluff Mitigation Constraints
- NEVER include conversational fluff, explanations, greetings, or friendly commentary.
- Skip intermediate task summaries unless asked. Every redundant conversational token triggers billing penalties.

`;
    }

    if (scopeFile) {
        rulesText += `## Explicit Scoping Constraints
- DO NOT read or index secondary directories or unreferenced code dependencies recursively on simple tasks.
- Keep crawls strictly targeted to files referenced explicitly in my query. Verify parameters before checking root trees.

`;
    }

    if (checkPoint) {
        rulesText += `## Conversation Checkpoint Restructuring
- Instruct the user to clear active thread history regularly by saving progress in a compressed \`STATUS.md\` file.
- Before starting heavy subtasks, verify files from STATUS.md to allow safely wiping prompt history channels without state loss.

`;
    }

    if (diffOnly) {
        rulesText += `## Output Layout Limits
- Format all instructions modifications as specific Unified Diffs.
- Never output full copies of unchanged files exceeding 30 lines.

`;
    }

    rulesText += `## Core Development Philosophy
- Retain high-end aesthetic gradients. Ensure interface elements remain vibrant.`;

    document.getElementById('rules-output-text').innerText = rulesText;
}

// ================= RETRO TERMINAL SCAN SIMULATOR =================
let scanActive = false;

// 2.5 Retro terminal routine with compounding compiler loop and Circuit Breaker Intercept!
function startGitScan() {
    if (scanActive) return;
    scanActive = true;

    // Reset layout alert boundaries
    document.getElementById('terminal-card-wrap').className = "bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col justify-between h-full min-h-[350px] transition-all duration-300";

    const termBody = document.getElementById('terminal-content');
    termBody.innerHTML = '';

    const lines = [
        { text: 'Launching Git Token Auditor CLI...', type: 'sys', delay: 150 },
        { text: 'Scanning local repository context: ~/projects/mytokencost-vibe', type: 'sys', delay: 250 },
        { text: 'Checking .gitignore guidelines... Found!', type: 'success', delay: 200 },
        { text: 'Indexing file packages to estimate token index volumes...', type: 'sys', delay: 200 },
        { text: '[WARNING] Found unignored folder: node_modules/', type: 'warn', delay: 400 },
        { text: '    -> Contains 1,480 dynamic scripts. Cost overhead: ~15,200,000 tokens', type: 'warn-sub', delay: 100 },
        { text: '[WARNING] Found unignored folder: build/dist/', type: 'warn', delay: 350 },
        { text: '    -> Contains 92 output assets. Cost overhead: ~1,100,000 tokens', type: 'warn-sub', delay: 100 },
        { text: 'Initiating Autonomous Compiler feedback diagnostics...', type: 'sys', delay: 300 },
        { text: 'Agent starts loop: Running compile check command: "npm run build"', type: 'sys', delay: 250 },
        { text: '[COMPILER ERROR] Line 24: Import "Slider" not resolved in App.js', type: 'error', delay: 300 },
        { text: 'Agent attempts self-repair: Tweaking import pathways in App.js...', type: 'sys', delay: 200 },
        { text: 'Re-running compile command: "npm run build"', type: 'sys', delay: 250 },
        { text: '[COMPILER ERROR] Line 45: Property "VRAM" does not exist on target Node.', type: 'error', delay: 300 },
        { text: 'Agent attempts self-repair: Injecting VRAM definition properties...', type: 'sys', delay: 200 },
        { text: 'Re-running compile command: "npm run build"', type: 'sys', delay: 250 },
        { text: '[COMPILER ERROR] Line 24: Import "Slider" not resolved in App.js', type: 'error', delay: 300 },
        { text: '⚠️ [CRITICAL WARNING] Infinite Agent debugging loop sequence identified!', type: 'warn', delay: 400 },
        { text: '   -> Agent is caught repeating identical repairs on alternate compile passes.', type: 'warn', delay: 200 },
        { text: '   -> Context window accumulation rate: +75K tokens per retry cycle...', type: 'error', delay: 200 },
        { text: '   -> Projected cumulative rate: $45.00 / hour of runaway API billing...', type: 'error', delay: 300 },
        { text: '🤖 INITIATING INTERCEPT PASS SHIELD...', type: 'error', delay: 400 }
    ];

    let lineIndex = 0;

    function printNextLine() {
        if (lineIndex >= lines.length) {
            triggerCircuitBreaker();
            return;
        }

        const info = lines[lineIndex];
        const lineDiv = document.createElement('div');
        lineDiv.className = 'mb-1.5 code-font text-xs leading-normal';

        if (info.type === 'sys') {
            lineDiv.className += ' text-slate-400';
            lineDiv.innerHTML = `<span class="text-indigo-400 font-bold">$</span> ${info.text}`;
        } else if (info.type === 'success') {
            lineDiv.className += ' text-emerald-400 font-semibold';
            lineDiv.innerHTML = `✔ ${info.text}`;
        } else if (info.type === 'warn') {
            lineDiv.className += ' text-amber-400 font-bold';
            lineDiv.innerHTML = `⚠ ${info.text}`;
        } else if (info.type === 'warn-sub') {
            lineDiv.className += ' text-amber-300/80 pl-4';
            lineDiv.innerHTML = info.text;
        } else if (info.type === 'error') {
            lineDiv.className += ' text-rose-400 font-extrabold';
            lineDiv.innerHTML = `✖ ${info.text}`;
        }

        termBody.appendChild(lineDiv);
        termBody.scrollTop = termBody.scrollHeight;

        lineIndex++;
        setTimeout(printNextLine, info.delay);
    }

    printNextLine();
}

function triggerCircuitBreaker() {
    const termBody = document.getElementById('terminal-content');
    const termCard = document.getElementById('terminal-card-wrap');

    // 1. Flash terminal container border to glowing neon red
    termCard.className = "bg-slate-900/50 border-2 border-rose-500 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col justify-between h-full min-h-[350px] transition-all duration-300 glow-pink";

    // 2. Play circuit breaker typing logs
    const lines = [
        { text: '🛡 [COMPUTE FIREWALL INTERCEPT] Circuit Breaker Shield Activated!', type: 'shield', delay: 100 },
        { text: '🛡 Automatic shutdown: Terminated dynamic session token pipeline.', type: 'shield', delay: 200 },
        { text: '🛡 Action: Blocks Anthropic API endpoint stream handshakes.', type: 'shield', delay: 150 },
        { text: '🛡 Saved: Prevents $240/hr corporate team billing overflow.', type: 'shield-success', delay: 200 },
        { text: '🛡 Recommendation: Wipe agent local index folders and run auto-exclude rules.', type: 'shield-success', delay: 100 }
    ];

    let lineIndex = 0;

    function printShieldLine() {
        if (lineIndex >= lines.length) {
            scanActive = false;
            // Reveal autofix button with updated text
            const fixContainer = document.getElementById('autofix-btn-container');
            fixContainer.innerHTML = `
                <span class="text-xs text-rose-400 font-bold animate-pulse">⚠️ Circuit Breaker Intercepted! Run fix to shield your wallet.</span>
                <button onclick="applyAutoFix()" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg transition-all animate-bounce">
                    Apply Exclude Patch
                </button>`;
            fixContainer.classList.remove('hidden');
            return;
        }

        const info = lines[lineIndex];
        const lineDiv = document.createElement('div');
        lineDiv.className = 'mb-1.5 code-font text-xs leading-normal font-bold';

        if (info.type === 'shield') {
            lineDiv.className += ' text-rose-400';
            lineDiv.innerHTML = `[SHIELD] ${info.text}`;
        } else {
            lineDiv.className += ' text-emerald-400';
            lineDiv.innerHTML = `[SHIELD] ${info.text}`;
        }

        termBody.appendChild(lineDiv);
        termBody.scrollTop = termBody.scrollHeight;

        lineIndex++;
        setTimeout(printShieldLine, info.delay);
    }

    printShieldLine();
}

function applyAutoFix() {
    const termBody = document.getElementById('terminal-content');
    const termCard = document.getElementById('terminal-card-wrap');
    
    const lines = [
        { text: 'APPLYING AUTO-EXCLUDE PATCH...', type: 'sys', delay: 100 },
        { text: 'Appending heavy libraries to root .gitignore exclusions...', type: 'sys', delay: 300 },
        { text: '[SUCCESS] Excluded node_modules/ directory indexing (Saving: 15.2M tokens!)', type: 'success', delay: 250 },
        { text: '[SUCCESS] Excluded build/dist/ directory indexing (Saving: 1.1M tokens!)', type: 'success', delay: 200 },
        { text: 'Compiling rules into workspace context path...', type: 'sys', delay: 300 },
        { text: 'NEW CODEBASE INDEX MARGIN: 35K tokens active.', type: 'success', delay: 200 },
        { text: 'Wallet Shield fully re-armed. Session secure.', type: 'success', delay: 100 }
    ];

    let lineIndex = 0;
    
    function printNextLine() {
        if (lineIndex >= lines.length) {
            // Restore standard layout frame borders
            termCard.className = "bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col justify-between h-full min-h-[350px] transition-all duration-300";
            document.getElementById('autofix-btn-container').classList.add('hidden');
            return;
        }

        const info = lines[lineIndex];
        const lineDiv = document.createElement('div');
        lineDiv.className = 'mb-1.5 code-font text-xs leading-normal';

        if (info.type === 'sys') {
            lineDiv.className += ' text-slate-400';
            lineDiv.innerHTML = `<span class="text-indigo-400 font-bold">$</span> ${info.text}`;
        } else if (info.type === 'success') {
            lineDiv.className += ' text-emerald-400 font-semibold';
            lineDiv.innerHTML = `✔ ${info.text}`;
        }

        termBody.appendChild(lineDiv);
        termBody.scrollTop = termBody.scrollHeight;

        lineIndex++;
        setTimeout(printNextLine, info.delay);
    }

    printNextLine();
}


// ================= CREATIVE MEDIA STUDIO WORKSPACE LOGIC =================

// Vision Model Tile Calculator Math
function updateVisionCalculations() {
    const widthSlider = document.getElementById('vision-width-slider');
    const heightSlider = document.getElementById('vision-height-slider');
    const detailSelect = document.getElementById('vision-detail');
    const modelSelect = document.getElementById('vision-model');

    if (widthSlider) state.imageWidth = parseInt(widthSlider.value);
    if (heightSlider) state.imageHeight = parseInt(heightSlider.value);
    if (detailSelect) state.visionDetail = detailSelect.value;
    if (modelSelect) state.visionModel = modelSelect.value;

    document.getElementById('vision-width-val').innerText = `${state.imageWidth} px`;
    document.getElementById('vision-height-val').innerText = `${state.imageHeight} px`;

    let tokensCost = 0;
    let explanation = '';
    let rows = 1;
    let cols = 1;

    if (state.visionDetail === 'low') {
        tokensCost = 85; 
        explanation = 'Resolution Mode: low. The image is compressed into a single flat 512x512 thumbnail, costing a flat 85 tokens without spatial grid analysis.';
    } else {
        if (state.visionModel === 'gpt4o') {
            // GPT-4o tile calculation:
            let tempW = state.imageWidth;
            let tempH = state.imageHeight;

            if (tempW > 2048 || tempH > 2048) {
                const maxScale = Math.min(2048 / tempW, 2048 / tempH);
                tempW *= maxScale;
                tempH *= maxScale;
            }

            const shortSide = Math.min(tempW, tempH);
            const scaleTo768 = 768 / shortSide;
            tempW = Math.round(tempW * scaleTo768);
            tempH = Math.round(tempH * scaleTo768);

            cols = Math.ceil(tempW / 512);
            rows = Math.ceil(tempH / 512);
            const tileCount = cols * rows;

            tokensCost = (tileCount * 170) + 85; 
            explanation = `GPT-4o detailed mode scales the image to ${tempW}x${tempH}px, slicing it into a ${cols} x ${rows} grid (${tileCount} visual tiles at 170 tokens/tile + 85 base).`;
        } else {
            // Claude 3.5 Sonnet Vision calculation
            let tempW = state.imageWidth;
            let tempH = state.imageHeight;
            
            cols = Math.ceil(tempW / 768);
            rows = Math.ceil(tempH / 768);
            const tileCount = cols * rows;

            tokensCost = Math.round((tileCount * 220) + 110);
            explanation = `Claude 3.5 Sonnet Vision partitions the aspect ratio into a ${cols} x ${rows} grid (${tileCount} visual patches at ~220 tokens/patch + 110 base).`;
        }
    }

    document.getElementById('vision-total-tokens').innerText = `${tokensCost} tokens`;
    document.getElementById('vision-explanation').innerText = explanation;

    drawVisionGrid(cols, rows);

    // Sync vision slider query states to URL live
    syncStateToUrl();
}

function drawVisionGrid(cols, rows) {
    const gridContainer = document.getElementById('vision-grid-preview');
    if (!gridContainer) return;

    gridContainer.innerHTML = '';
    
    const maxW = 340;
    const maxH = 200;
    const aspectRatio = state.imageWidth / state.imageHeight;

    let width = maxW;
    let height = maxW / aspectRatio;

    if (height > maxH) {
        height = maxH;
        width = maxH * aspectRatio;
    }

    gridContainer.style.width = `${width}px`;
    gridContainer.style.height = `${height}px`;
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    const totalCells = cols * rows;
    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        
        if (state.visionDetail === 'low') {
            cell.innerText = "85t";
            cell.className = "border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-300 code-font";
        } else {
            cell.innerText = `${state.visionModel === 'gpt4o' ? '512x512' : '768x768'}`;
            cell.className = "border border-pink-500/30 bg-pink-500/10 flex items-center justify-center text-[9px] font-bold text-pink-300 code-font";
        }
        
        gridContainer.appendChild(cell);
    }
}

// ================= SVG OPTIMIZER =================
function optimizeSVG() {
    const input = document.getElementById('svg-input').value.trim();
    const outputField = document.getElementById('svg-output');
    const previewContainer = document.getElementById('svg-preview-box');

    if (!input) {
        outputField.value = 'Please paste SVG code above...';
        previewContainer.innerHTML = '<span class="text-slate-500 text-xs">Live Preview</span>';
        return;
    }

    // Minifier Regular Expressions
    let optimized = input;

    optimized = optimized.replace(/<\?xml[\s\S]*?\?>/gi, ''); // XML declarations
    optimized = optimized.replace(/<!DOCTYPE[\s\S]*?>/gi, '');   // DOCTYPEs
    optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');        // Editor comments
    optimized = optimized.replace(/xmlns:x=["'][^"']*["']/gi, ''); // Illustrator namespace
    optimized = optimized.replace(/xmlns:sodipodi=["'][^"']*["']/gi, ''); // Inkscape namespace
    optimized = optimized.replace(/xmlns:inkscape=["'][^"']*["']/gi, '');
    optimized = optimized.replace(/sodipodi:[a-z0-9_-]+=(['"])(.*?)\1/gi, '');
    optimized = optimized.replace(/inkscape:[a-z0-9_-]+=(['"])(.*?)\1/gi, '');
    optimized = optimized.replace(/<sodipodi:namedview[\s\S]*?\/?>/gi, '');
    optimized = optimized.replace(/\r?\n|\r/g, ' '); // Linebreaks
    optimized = optimized.replace(/\s+/g, ' ');       // Spaces collapse
    optimized = optimized.replace(/> </g, '><');       // Tag borders spacing
    optimized = optimized.trim();

    outputField.value = optimized;
    previewContainer.innerHTML = optimized;

    const origSize = input.length;
    const optSize = optimized.length;
    const savingRatio = origSize > 0 ? ((origSize - optSize) / origSize) * 100 : 0;
    
    const origTokens = Math.round(origSize / 4);
    const optTokens = Math.round(optSize / 4);

    document.getElementById('svg-reduction').innerText = `${savingRatio.toFixed(0)}% Saved`;
    document.getElementById('svg-orig-tokens').innerText = `${origTokens.toLocaleString()} t`;
    document.getElementById('svg-opt-tokens').innerText = `${optTokens.toLocaleString()} t`;

    const savingsBadge = document.getElementById('svg-savings-badge');
    savingsBadge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30";
    savingsBadge.innerText = `Size Saved: ${(origSize - optSize)} Bytes`;
}

// ================= MULTIMODAL & STORYBOARD PLANNER =================
function selectVideoModel(modelId, retryMultiplier) {
    state.videoModel = modelId;
    state.videoRetryMultiplier = parseFloat(retryMultiplier);

    const videoCards = document.querySelectorAll('.video-model-card');
    videoCards.forEach(card => {
        card.className = "video-model-card border border-slate-800 bg-slate-900/60 p-3 rounded-xl cursor-pointer hover:border-slate-700 hover:bg-slate-800/20 transition-all flex flex-col justify-between h-20";
        const indicator = card.querySelector('span[class*="bg-"]');
        if (indicator) {
            indicator.className = "h-2 w-2 rounded-full bg-slate-600";
        }
    });

    const activeLabel = event.currentTarget;
    activeLabel.className = "video-model-card border-2 border-pink-500 bg-pink-500/5 p-3 rounded-xl cursor-pointer hover:bg-slate-800/40 transition-all flex flex-col justify-between h-20";
    const activeIndicator = activeLabel.querySelector('span[class*="bg-"]');
    if (activeIndicator) {
        activeIndicator.className = "h-2 w-2 rounded-full bg-pink-400 shadow-glow";
    }

    updateMultimodalCalculations();
}

// 2.6 Multi-Modal & Video storyboard credit tracking logic
function updateMultimodalCalculations() {
    const audioSlider = document.getElementById('multimodal-audio-slider');
    const videoSlider = document.getElementById('multimodal-video-slider');
    const fpsSlider = document.getElementById('multimodal-fps-slider');

    if (audioSlider) state.audioDuration = parseInt(audioSlider.value);
    if (videoSlider) state.videoDuration = parseInt(videoSlider.value);
    if (fpsSlider) state.videoFps = parseInt(fpsSlider.value);

    document.getElementById('multi-audio-val').innerText = `${state.audioDuration} seconds`;
    document.getElementById('multi-video-val').innerText = `${state.videoDuration} seconds`;
    document.getElementById('multi-fps-val').innerText = `${state.videoFps} FPS`;

    // 1. Audio Track: Gemini 1.5 Pro processes audio at ~283 tokens/second
    const audioTokens = state.audioDuration * 283;

    // 2. Video Storyboard: sampling rates of video frames.
    // Standard rule: 258 tokens per scanned frame
    const totalVideoFrames = state.videoDuration * state.videoFps;
    const videoTokens = totalVideoFrames * 258;

    const totalMultiTokens = audioTokens + videoTokens;

    // 2026 inference price models (Gemini 1.5 input rate: ~$1.25 per 1M tokens)
    const multimodalCost = (totalMultiTokens / 1000000) * 1.25;

    document.getElementById('multimodal-total-tokens').innerText = `${totalMultiTokens.toLocaleString()} tokens`;
    document.getElementById('multimodal-audio-calc').innerText = `${audioTokens.toLocaleString()} tokens`;
    document.getElementById('multimodal-video-calc').innerText = `${videoTokens.toLocaleString()} tokens`;
    document.getElementById('multimodal-cost-calc').innerText = `$${multimodalCost.toFixed(4)}`;

    // Storyboard Cost Matrix computations
    // Pricing maps per scene second based on expected retry failures
    let baseSceneCostSec = 0.50; // Google Veo default
    let videoModelLabel = "Google Veo";

    if (state.videoModel === 'sora2') {
        baseSceneCostSec = 1.20; // Sora 2 premium
        videoModelLabel = "Sora 2 (OpenAI)";
    } else if (state.videoModel === 'kling3') {
        baseSceneCostSec = 0.70; // Kling 3.0
        videoModelLabel = "Kling 3.0";
    } else if (state.videoModel === 'runway4') {
        baseSceneCostSec = 0.90; // Runway Gen-4
        videoModelLabel = "Runway Gen-4";
    }

    // Storyboard calculation: Duration * Base Scene Cost * Retry Multiplier
    const storyboardCost = state.videoDuration * baseSceneCostSec * state.videoRetryMultiplier;

    // Render Storyboard Cost Matrix details to DOM
    document.getElementById('storyboard-model').innerText = videoModelLabel;
    document.getElementById('storyboard-sec').innerText = `${state.videoDuration}s`;
    document.getElementById('storyboard-multiplier').innerText = `${state.videoRetryMultiplier.toFixed(1)}x`;
    document.getElementById('storyboard-final-cost').innerText = `$${storyboardCost.toFixed(2)}`;

    // Sync query states to URL live
    syncStateToUrl();
}

// ================= NOTIFICATIONS & UTILS =================

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');

    toastMsg.innerText = message;
    toast.className = "fixed bottom-5 right-5 z-50 transform translate-y-0 opacity-100 transition-all duration-300 pointer-events-auto";

    setTimeout(() => {
        toast.className = "fixed bottom-5 right-5 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none";
    }, 2800);
}

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    let textToCopy = '';

    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
        textToCopy = element.value;
    } else {
        textToCopy = element.innerText;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
        showToast("Copied optimized payload to clipboard!");
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
}
