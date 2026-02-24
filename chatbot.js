/**
 * Site chatbot for charlescrabtree.org
 * Phase 1: Client-side intent classification + TF-IDF publication search + rich HTML responses
 */
class SiteChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.knowledge = null;
        this.publications = [];
        this.teaching = null;
        this.lastIntent = null;
        this.lastResults = [];
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

    // ── Data Loading ─────────────────────────────────────────

    async loadKnowledge() {
        try {
            const r = await fetch('site-knowledge.json');
            this.knowledge = await r.json();
        } catch (e) {
            console.warn('Knowledge base not loaded:', e);
        }
    }

    async loadPublications() {
        try {
            const r = await fetch('publications.json');
            const d = await r.json();
            this.publications = d.publications || [];
        } catch (e) {
            console.warn('Publications not loaded:', e);
            this.publications = [];
        }
    }

    async loadTeaching() {
        try {
            const r = await fetch('teaching.json');
            this.teaching = await r.json();
        } catch (e) {
            this.teaching = null;
        }
    }

    // ── TF-IDF Index ─────────────────────────────────────────

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
            .filter(w => w.length >= 2 && !this.stopWords.has(w));
    }

    get stopWords() {
        return new Set([
            'the','and','for','are','but','not','you','all','can','her','was','one','our',
            'out','has','had','its','with','this','that','from','they','been','have','many',
            'some','them','than','each','make','like','into','over','such','after','also',
            'how','who','what','when','where','which','about','their','would','there','could',
            'other','more','very','most','does','did','paper','papers','article','articles',
            'study','studies','show','shows','find','finds','evidence','using','based','new',
            'charles','crabtree'
        ]);
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
        const scored = this.publications
            .map(pub => ({ pub, score: this.scorePub(pub, tokens) }))
            .filter(s => s.score > 0)
            .sort((a, b) => b.score - a.score);
        return scored.slice(0, limit);
    }

    // ── Intent Classification ────────────────────────────────

    classifyIntent(query) {
        const q = query.toLowerCase();

        if (/^(hi|hello|hey|g'day|greetings|howdy)\b/.test(q))
            return 'greeting';
        if (/tell me more|more about that|expand|elaborate|go on|continue/.test(q))
            return 'followup';
        if (/\b(contact|email|reach|get in touch)\b/.test(q))
            return 'contact';
        if (/\b(cv|resume|curriculum vitae)\b/.test(q))
            return 'cv';
        if (/\b(teach|course|class|lecture|baltic|leap|evaluat)\b/.test(q))
            return 'teaching';
        if (/\b(student|advise|thesis|phd|letter|recommend|supervis)\b/.test(q))
            return 'students';
        if (/\b(collaborat|coauthor|co-author|workshop|aposs|jposs|vwar|work with)\b/.test(q))
            return 'collaboration';
        if (/\b(media|interview|news|press|public writ|oped|op-ed|journalist|podcast)\b/.test(q))
            return 'media';
        if (/\b(paper|publication|journal|publish|discrimination|race|gender|immigrant|class|poverty|disability|experiment|japan|asia|human rights|censorship|surveillance|voting|election|authoritarian|ai\b|machine learn|social media)\b/.test(q))
            return 'publications';
        if (/\b(research|interests?|work on|focus|area)\b/.test(q))
            return 'research';
        if (/\b(who|about|background|bio|where|position|role|department)\b/.test(q))
            return 'bio';
        if (/\b(page|navigate|find|section|site|website)\b/.test(q))
            return 'navigation';

        return 'publications';
    }

    // ── Response Generation ──────────────────────────────────

    generateResponse(query) {
        const intent = this.classifyIntent(query);
        this.lastIntent = intent;
        const k = this.knowledge;

        switch (intent) {
            case 'greeting':
                return this.rich(`Hi! I can help you explore Charles's research, publications, teaching, and more. What are you curious about?`);

            case 'followup':
                return this.handleFollowup();

            case 'contact':
                return this.rich(`
                    <strong>Contact Charles:</strong><br>
                    📧 <a href="mailto:${k?.bio?.email}">${k?.bio?.email}</a><br>
                    🔬 <a href="${k?.bio?.scholar}" target="_blank">Google Scholar</a><br>
                    🆔 <a href="https://orcid.org/${k?.bio?.orcid}" target="_blank">ORCID</a><br>
                    📄 <a href="${k?.bio?.cv}" target="_blank">Download CV</a>
                `);

            case 'cv':
                return this.rich(`You can <a href="${k?.bio?.cv}" target="_blank">download Charles's CV here</a>.`);

            case 'bio':
                return this.rich(`
                    <strong>${k?.bio?.name}</strong> — ${k?.bio?.title} at ${k?.bio?.institution}, and ${k?.bio?.secondary}.<br><br>
                    ${k?.bio?.summary}<br><br>
                    ${k?.bio?.editorial_roles}<br><br>
                    <a href="index.html">Read the full bio →</a>
                `);

            case 'research': return this.handleResearch();
            case 'publications': return this.handlePublications(query);
            case 'teaching': return this.handleTeaching(query);
            case 'students': return this.handleStudents();
            case 'collaboration': return this.handleCollaboration();
            case 'media': return this.handleMedia();
            case 'navigation': return this.handleNavigation(query);
            default: return this.handlePublications(query);
        }
    }

    handleResearch() {
        const areas = this.knowledge?.research_areas || [];
        const list = areas.map(a => `<strong>${a.area}</strong>: ${a.description}`).join('<br><br>');
        return this.rich(`
            Charles's research spans several areas:<br><br>
            ${list}<br><br>
            Ask about specific topics for publications. <a href="research.html">View working papers →</a>
        `);
    }

    handlePublications(query) {
        const results = this.searchPublications(query);
        if (results.length === 0) {
            return this.rich(`
                I couldn't find publications matching that. Try topics like <em>discrimination</em>, <em>Japan</em>, <em>race</em>, <em>gender</em>, <em>AI</em>, <em>human rights</em>, or <em>immigration</em>.<br><br>
                <a href="publications.html">Browse all ${this.publications.length} publications →</a>
            `);
        }
        this.lastResults = results;
        const items = results.map((r, i) =>
            `${i + 1}. <strong>"${r.pub.title}"</strong><br><em>${r.pub.journal}</em> (${r.pub.year})`
        ).join('<br><br>');
        const more = this.publications.length > results.length
            ? `<br><br><a href="publications.html">See all ${this.publications.length} publications →</a>`
            : '';
        return this.rich(`Found ${results.length} relevant publication${results.length > 1 ? 's' : ''}:<br><br>${items}${more}`);
    }

    handleTeaching(query) {
        const q = query.toLowerCase();
        const t = this.teaching;
        const k = this.knowledge?.teaching;

        if (/baltic|leap|foreign/.test(q) && t?.programs?.baltic_leap) {
            const p = t.programs.baltic_leap;
            return this.rich(`
                <strong>${p.name}</strong><br>
                ${p.description}<br><br>
                Student feedback: <em>"${p.student_feedback[0]}"</em><br><br>
                <a href="teaching.html">Learn more →</a>
            `);
        }

        if (t?.courses) {
            const tokens = this.tokenize(q);
            const match = t.courses.find(c => {
                const text = `${c.title} ${c.description} ${c.keywords.join(' ')}`.toLowerCase();
                return tokens.some(tok => text.includes(tok));
            });
            if (match) {
                const evals = match.evaluations
                    ? Object.entries(match.evaluations).map(([term, ev]) =>
                        `${term}: ${ev.course_quality} quality, ${ev.teaching_effectiveness} effectiveness`
                    ).join('<br>')
                    : '';
                return this.rich(`
                    <strong>${match.title}</strong> (${match.institution})<br>
                    ${match.description}
                    ${evals ? `<br><br><strong>Evaluations:</strong><br>${evals}` : ''}<br><br>
                    <a href="teaching.html">Full teaching page →</a>
                `);
            }
        }

        const current = k?.current?.map(c => `• ${c}`).join('<br>') || '';
        const past = k?.past_highlights?.map(c => `• ${c}`).join('<br>') || '';
        return this.rich(`
            <strong>Current teaching:</strong><br>${current}<br><br>
            <strong>Highlights:</strong><br>${past}<br><br>
            <a href="teaching.html">Full teaching page →</a>
        `);
    }

    handleStudents() {
        const s = this.knowledge?.students;
        return this.rich(`
            Charles actively works with students:<br><br>
            • Published <strong>${s?.publications_with_undergrads} papers with undergrads</strong> and ${s?.publications_with_grad_students} with grad students<br>
            • Advised <strong>${s?.theses_advised} theses</strong> at Dartmouth<br>
            • Supervises PhD students at Monash in: ${s?.phd_areas}<br><br>
            📝 <a href="${s?.letter_form}" target="_blank">Request a letter</a><br>
            📅 <a href="${s?.scheduling}" target="_blank">Schedule a meeting</a><br><br>
            <a href="students.html">Students page →</a>
        `);
    }

    handleCollaboration() {
        const c = this.knowledge?.collaboration;
        const workshops = c?.workshops_founded?.map(w => `• ${w}`).join('<br>') || '';
        return this.rich(`
            Charles has <strong>${c?.coauthors}</strong> and has organized ${c?.conferences_organized}.<br><br>
            <strong>Workshops founded:</strong><br>${workshops}<br><br>
            Erdős number: <strong>${c?.erdos_number}</strong><br><br>
            <a href="collaboration.html">Collaboration page →</a> · <a href="coauthors.html">View coauthors →</a>
        `);
    }

    handleMedia() {
        const m = this.knowledge?.media;
        return this.rich(`
            Charles writes for public audiences and provides expert commentary.<br><br>
            <strong>Public writing in:</strong> ${m?.public_writing_outlets}<br><br>
            <strong>Featured in:</strong> ${m?.outlets_featured_in}<br><br>
            <strong>Recent topics:</strong> ${m?.recent_topics}<br><br>
            <a href="media.html">Media page →</a>
        `);
    }

    handleNavigation(query) {
        const pages = this.knowledge?.pages || {};
        const q = query.toLowerCase();
        for (const [page, desc] of Object.entries(pages)) {
            const words = desc.toLowerCase().split(/\s+/);
            if (words.some(w => q.includes(w) && w.length > 3)) {
                return this.rich(`Try the <a href="${page}"><strong>${page.replace('.html', '')}</strong></a> page: ${desc}`);
            }
        }
        const links = Object.entries(pages)
            .map(([p, d]) => `• <a href="${p}">${p.replace('.html', '')}</a> — ${d}`)
            .join('<br>');
        return this.rich(`Here are all the pages on this site:<br><br>${links}`);
    }

    handleFollowup() {
        if (this.lastResults.length > 0) {
            const extra = this.lastResults.map(r => {
                const authors = (r.pub.authors || []).join(', ');
                const kw = (r.pub.keywords || []).join(', ');
                return `<strong>${r.pub.title}</strong><br>Authors: ${authors}<br>Keywords: <em>${kw}</em>`;
            }).join('<br><br>');
            return this.rich(extra);
        }
        return this.rich(`Could you be more specific? I can tell you about research areas, publications, teaching, collaboration, media, or contact details.`);
    }

    rich(content) {
        return { html: true, content: content.trim() };
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
                        <button class="suggestion-btn" data-query="Papers on discrimination">Discrimination</button>
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
        this.addMessage({
            html: true,
            content: `Hi! I can help you explore Charles Crabtree's <strong>research</strong>, <strong>publications</strong>, <strong>teaching</strong>, and more. What would you like to know?`
        }, 'bot');
    }

    sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        if (!message) return;

        this.addMessage(message, 'user');
        input.value = '';
        this.showTyping();

        setTimeout(() => {
            this.hideTyping();
            const response = this.generateResponse(message);
            this.addMessage(response, 'bot');
        }, 400 + Math.random() * 400);
    }

    addMessage(content, type) {
        const container = document.getElementById('chatbot-messages');
        const div = document.createElement('div');
        div.className = `chatbot-message ${type}-message`;

        if (typeof content === 'object' && content.html) {
            div.innerHTML = content.content;
        } else {
            div.textContent = content;
        }

        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    showTyping() {
        const container = document.getElementById('chatbot-messages');
        const div = document.createElement('div');
        div.className = 'chatbot-message bot-message typing-indicator';
        div.id = 'chatbot-typing';
        div.innerHTML = '<span></span><span></span><span></span>';
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    hideTyping() {
        const el = document.getElementById('chatbot-typing');
        if (el) el.remove();
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new SiteChatbot());
} else {
    new SiteChatbot();
}
