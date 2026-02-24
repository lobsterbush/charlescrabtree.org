/**
 * Site chatbot for charlescrabtree.org
 * LLM-powered via Cloudflare Worker with local TF-IDF fallback.
 */

const WORKER_URL = 'https://crabtree-chatbot.YOUR_SUBDOMAIN.workers.dev';

class SiteChatbot {
    constructor() {
        this.isOpen = false;
        this.conversationHistory = []; // { role, content } for LLM context
        this.knowledge = null;
        this.publications = [];
        this.teaching = null;
        this.llmAvailable = true; // assume available, flip on first failure
        this.init();
    }

    async init() {
        await Promise.all([
            this.loadKnowledge(),
            this.loadPublications(),
            this.loadTeaching()
        ]);
        this.buildIDF();
        this.createChatWidget();
        this.attachEventListeners();
        this.addWelcomeMessage();
    }

    // ── Data Loading (for local fallback) ─────────────────────

    async loadKnowledge() {
        try {
            const r = await fetch('site-knowledge.json');
            this.knowledge = await r.json();
        } catch { this.knowledge = null; }
    }

    async loadPublications() {
        try {
            const r = await fetch('publications.json');
            const d = await r.json();
            this.publications = d.publications || [];
        } catch { this.publications = []; }
    }

    async loadTeaching() {
        try {
            const r = await fetch('teaching.json');
            this.teaching = await r.json();
        } catch { this.teaching = null; }
    }

    // ── TF-IDF Fallback Engine ────────────────────────────────

    buildIDF() {
        this.docFreq = {};
        const N = this.publications.length || 1;
        this.publications.forEach(pub => {
            const tokens = new Set(this.tokenize(
                `${pub.title} ${pub.journal} ${(pub.keywords || []).join(' ')} ${(pub.authors || []).join(' ')}`
            ));
            tokens.forEach(t => { this.docFreq[t] = (this.docFreq[t] || 0) + 1; });
        });
        this.idf = {};
        for (const [term, df] of Object.entries(this.docFreq)) {
            this.idf[term] = Math.log(N / df);
        }
    }

    tokenize(text) {
        return text.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .split(/\s+/)
            .filter(w => w.length >= 2 && !STOP_WORDS.has(w));
    }

    scorePub(pub, queryTokens) {
        const pubText = `${pub.title} ${(pub.keywords || []).join(' ')}`.toLowerCase();
        const titleText = pub.title.toLowerCase();
        let score = 0;
        queryTokens.forEach(qt => {
            if (pubText.includes(qt)) {
                const tf = (pubText.match(new RegExp(qt, 'g')) || []).length;
                const idf = this.idf[qt] || 2;
                score += tf * idf;
                if (titleText.includes(qt)) score += idf * 1.5;
            }
        });
        return score;
    }

    searchPublications(query, limit = 5) {
        const tokens = this.tokenize(query);
        if (tokens.length === 0) return [];
        return this.publications
            .map(pub => ({ pub, score: this.scorePub(pub, tokens) }))
            .filter(s => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    generateLocalResponse(query) {
        const q = query.toLowerCase();
        const k = this.knowledge;

        if (/^(hi|hello|hey|g'day|greetings|howdy)\b/.test(q))
            return `Hi! I can help you explore Charles's research, publications, teaching, and more. What are you curious about?`;
        if (/\b(contact|email|reach|get in touch)\b/.test(q))
            return `📧 Email: ${k?.bio?.email}\n🔬 [Google Scholar](${k?.bio?.scholar})\n📄 [Download CV](${k?.bio?.cv})`;
        if (/\b(cv|resume|curriculum vitae)\b/.test(q))
            return `You can [download Charles's CV here](${k?.bio?.cv}).`;
        if (/\b(who|about|background|bio)\b/.test(q))
            return `**${k?.bio?.name}** — ${k?.bio?.title} at ${k?.bio?.institution}, and ${k?.bio?.secondary}.\n\n${k?.bio?.summary}\n\n[Read the full bio →](index.html)`;
        if (/\b(research|interests?|work on|focus|area)\b/.test(q)) {
            const areas = (k?.research_areas || []).map(a => `**${a.area}**: ${a.description}`).join('\n\n');
            return `Charles's research spans several areas:\n\n${areas}\n\n[View working papers →](research.html)`;
        }
        if (/\b(teach|course|class)\b/.test(q)) {
            const current = (k?.teaching?.current || []).map(c => `• ${c}`).join('\n');
            return `**Current teaching:**\n${current}\n\n[Full teaching page →](teaching.html)`;
        }
        if (/\b(student|advise|thesis|phd|supervis)\b/.test(q))
            return `Charles actively works with students — ${k?.students?.publications_with_undergrads} papers with undergrads, ${k?.students?.theses_advised} theses advised.\n\n[Students page →](students.html)`;
        if (/\b(collaborat|coauthor|workshop)\b/.test(q))
            return `${k?.collaboration?.coauthors}. Workshops: APOSS, JPOSS, VWAR.\n\n[Collaboration page →](collaboration.html)`;
        if (/\b(media|interview|press|podcast)\b/.test(q))
            return `Charles writes for public audiences and provides expert commentary.\n\n[Media page →](media.html)`;

        // Default: try publication search
        const results = this.searchPublications(query);
        if (results.length > 0) {
            const items = results.map((r, i) =>
                `${i + 1}. **"${r.pub.title}"** — *${r.pub.journal}* (${r.pub.year})`
            ).join('\n\n');
            return `Found ${results.length} relevant publication${results.length > 1 ? 's' : ''}:\n\n${items}\n\n[Browse all publications →](publications.html)`;
        }

        return `I'm not sure about that. You can explore [research](research.html), [publications](publications.html), [teaching](teaching.html), or [contact Charles directly](mailto:${k?.bio?.email}).`;
    }

    // ── Markdown → HTML ───────────────────────────────────────

    renderMarkdown(text) {
        return text
            // Bold
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            // Line breaks (double newline → paragraph break, single → <br>)
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>');
    }

    // ── LLM Streaming ─────────────────────────────────────────

    async streamFromLLM(query, messageEl) {
        this.conversationHistory.push({ role: 'user', content: query });

        try {
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: this.conversationHistory }),
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || !trimmed.startsWith('data: ')) continue;
                    const data = trimmed.slice(6);
                    if (data === '[DONE]') break;
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.content) {
                            fullResponse += parsed.content;
                            messageEl.innerHTML = this.renderMarkdown(fullResponse);
                            // Auto-scroll
                            const container = document.getElementById('chatbot-messages');
                            container.scrollTop = container.scrollHeight;
                        }
                    } catch { /* skip */ }
                }
            }

            // Save assistant response to history
            this.conversationHistory.push({ role: 'assistant', content: fullResponse });

            // Trim history if it gets long
            if (this.conversationHistory.length > 20) {
                this.conversationHistory = this.conversationHistory.slice(-16);
            }

            return true;
        } catch (e) {
            console.warn('LLM unavailable, using fallback:', e.message);
            this.llmAvailable = false;
            return false;
        }
    }

    // ── UI ────────────────────────────────────────────────────

    createChatWidget() {
        const widget = document.createElement('div');
        widget.innerHTML = `
            <div id="chatbot-container">
                <button id="chatbot-toggle" aria-label="Ask about research, teaching, or publications">
                    <svg class="chatbot-icon-open" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <svg class="chatbot-icon-close" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                
                <div id="chatbot-panel" class="chatbot-hidden">
                    <div class="chatbot-header">
                        <div class="chatbot-title">
                            <h3>Ask about Charles</h3>
                            <p>Research · Publications · Teaching</p>
                        </div>
                        <button id="chatbot-close" aria-label="Close chat">×</button>
                    </div>
                    
                    <div id="chatbot-messages"></div>
                    
                    <div class="chatbot-input-container">
                        <input 
                            type="text" 
                            id="chatbot-input" 
                            placeholder="Ask anything..."
                            aria-label="Chat message input"
                        />
                        <button id="chatbot-send" aria-label="Send message">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="chatbot-suggestions">
                        <button class="suggestion-btn" data-query="What does Charles research?">Research areas</button>
                        <button class="suggestion-btn" data-query="Tell me about papers on discrimination">Discrimination</button>
                        <button class="suggestion-btn" data-query="What courses has Charles taught?">Teaching</button>
                        <button class="suggestion-btn" data-query="How can I contact Charles?">Contact</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(widget);
    }

    attachEventListeners() {
        document.getElementById('chatbot-toggle').addEventListener('click', () => this.toggleChat());
        document.getElementById('chatbot-close').addEventListener('click', () => this.toggleChat());
        document.getElementById('chatbot-send').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.getElementById('chatbot-input').value = e.target.dataset.query;
                this.sendMessage();
            });
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const panel = document.getElementById('chatbot-panel');
        const toggle = document.getElementById('chatbot-toggle');
        const iconOpen = toggle.querySelector('.chatbot-icon-open');
        const iconClose = toggle.querySelector('.chatbot-icon-close');
        
        if (this.isOpen) {
            panel.classList.remove('chatbot-hidden');
            toggle.classList.add('active');
            iconOpen.style.display = 'none';
            iconClose.style.display = 'block';
            document.getElementById('chatbot-input').focus();
        } else {
            panel.classList.add('chatbot-hidden');
            toggle.classList.remove('active');
            iconOpen.style.display = 'block';
            iconClose.style.display = 'none';
        }
    }

    addWelcomeMessage() {
        this.addMessage(
            `Hi! I'm an AI assistant for Charles Crabtree's site. Ask me about his **research**, **publications**, **teaching**, **students**, **media**, or anything else. What would you like to know?`,
            'bot'
        );
    }

    async sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        if (!message) return;

        // Show user message
        this.addMessage(message, 'user');
        input.value = '';
        input.disabled = true;
        document.getElementById('chatbot-send').disabled = true;

        // Create bot message container for streaming
        const container = document.getElementById('chatbot-messages');
        const botDiv = document.createElement('div');
        botDiv.className = 'chatbot-message bot-message';

        if (this.llmAvailable) {
            // Show typing indicator, then replace with stream
            botDiv.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
            container.appendChild(botDiv);
            container.scrollTop = container.scrollHeight;

            const success = await this.streamFromLLM(message, botDiv);
            if (!success) {
                // Fallback to local
                const local = this.generateLocalResponse(message);
                botDiv.innerHTML = this.renderMarkdown(local);
            }
        } else {
            // Directly use local fallback
            const local = this.generateLocalResponse(message);
            botDiv.innerHTML = this.renderMarkdown(local);
            container.appendChild(botDiv);
        }

        container.scrollTop = container.scrollHeight;
        input.disabled = false;
        document.getElementById('chatbot-send').disabled = false;
        input.focus();
    }

    addMessage(content, type) {
        const container = document.getElementById('chatbot-messages');
        const div = document.createElement('div');
        div.className = `chatbot-message ${type}-message`;
        div.innerHTML = this.renderMarkdown(content);
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }
}

// ── Stop words for TF-IDF ─────────────────────────────────────

const STOP_WORDS = new Set([
    'the','and','for','are','but','not','you','all','can','her','was','one','our',
    'out','has','had','its','with','this','that','from','they','been','have','many',
    'some','them','than','each','make','like','into','over','such','after','also',
    'how','who','what','when','where','which','about','their','would','there','could',
    'other','more','very','most','does','did','paper','papers','article','articles',
    'study','studies','show','shows','find','finds','evidence','using','based','new',
    'charles','crabtree'
]);

// ── Initialize ────────────────────────────────────────────────

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new SiteChatbot());
} else {
    new SiteChatbot();
}
