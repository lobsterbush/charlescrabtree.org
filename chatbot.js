// Simple chatbot for querying Charles Crabtree's website
class SiteChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.publications = [];
        this.teaching = null;
        this.init();
    }

    async init() {
        await Promise.all([
            this.loadPublications(),
            this.loadTeaching()
        ]);
        this.createChatWidget();
        this.attachEventListeners();
        this.addWelcomeMessage();
    }

    async loadPublications() {
        try {
            const response = await fetch('publications.json');
            const data = await response.json();
            this.publications = data.publications;
            console.log(`Loaded ${this.publications.length} publications`);
        } catch (error) {
            console.error('Failed to load publications:', error);
            this.publications = this.getFallbackPublications();
        }
    }

    async loadTeaching() {
        try {
            const response = await fetch('teaching.json');
            this.teaching = await response.json();
            console.log(`Loaded teaching data with ${this.teaching.courses.length} courses`);
        } catch (error) {
            console.error('Failed to load teaching data:', error);
            this.teaching = null;
        }
    }

    createChatWidget() {
        const widget = document.createElement('div');
        widget.innerHTML = `
            <div id="chatbot-container">
                <button id="chatbot-toggle" aria-label="Ask about research, teaching, or publications">
                    <svg class="chatbot-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                </button>
                
                <div id="chatbot-panel" class="chatbot-hidden">
                    <div class="chatbot-header">
                        <div class="chatbot-title">
                            <h3>Ask about Charles</h3>
                            <p>I can help you find information on this site</p>
                        </div>
                        <button id="chatbot-close" aria-label="Close chat">×</button>
                    </div>
                    
                    <div id="chatbot-messages"></div>
                    
                    <div class="chatbot-input-container">
                        <input 
                            type="text" 
                            id="chatbot-input" 
                            placeholder="Ask about research, teaching, publications..."
                            aria-label="Chat message input"
                        />
                        <button id="chatbot-send" aria-label="Send message">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="chatbot-suggestions">
                        <button class="suggestion-btn" data-query="Show me papers on discrimination">Papers on discrimination</button>
                        <button class="suggestion-btn" data-query="What courses has Charles taught?">Teaching</button>
                        <button class="suggestion-btn" data-query="Papers about Japan">Japan research</button>
                        <button class="suggestion-btn" data-query="Baltic LEAP program">Baltic LEAP</button>
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

        // Suggestion buttons
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const query = e.target.dataset.query;
                document.getElementById('chatbot-input').value = query;
                this.sendMessage();
            });
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const panel = document.getElementById('chatbot-panel');
        const toggle = document.getElementById('chatbot-toggle');
        
        if (this.isOpen) {
            panel.classList.remove('chatbot-hidden');
            toggle.classList.add('active');
        } else {
            panel.classList.add('chatbot-hidden');
            toggle.classList.remove('active');
        }
    }

    addWelcomeMessage() {
        this.addMessage("Hi! I'm here to help you learn about Charles Crabtree's research, teaching, and work. What would you like to know?", 'bot');
    }

    sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addMessage(message, 'user');
        input.value = '';
        
        // Simulate thinking
        setTimeout(() => {
            const response = this.generateResponse(message);
            this.addMessage(response, 'bot');
        }, 500);
    }

    addMessage(text, type) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${type}-message`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    generateResponse(query) {
        const lowerQuery = query.toLowerCase();
        
        // Publication search queries
        if (lowerQuery.includes('paper') || lowerQuery.includes('article') || lowerQuery.includes('publication') || 
            lowerQuery.includes('discrimination') || lowerQuery.includes('race') || lowerQuery.includes('gender') ||
            lowerQuery.includes('experiment') || lowerQuery.includes('japan') || lowerQuery.includes('voting') ||
            lowerQuery.includes('email') && lowerQuery.includes('study')) {
            return this.searchPublications(query);
        }
        
        // Research-related queries
        if (lowerQuery.includes('research') || lowerQuery.includes('study') || lowerQuery.includes('studies')) {
            return "Charles studies intergroup relations and conflict, focusing on discrimination across race, ethnicity, class, disability, and nationality. His current work centers on class-based discrimination. You can also ask me about specific papers on topics like 'discrimination', 'Japan', 'voting', or 'gender'.";
        }
        
        // Teaching queries
        if (lowerQuery.includes('teach') || lowerQuery.includes('course') || lowerQuery.includes('class') || lowerQuery.includes('baltic') || lowerQuery.includes('student')) {
            return this.searchTeaching(query);
        }
        
        // Collaboration queries
        if (lowerQuery.includes('collaborat') || lowerQuery.includes('coauthor') || lowerQuery.includes('work with')) {
            return "Charles has collaborated with 170+ scholars worldwide. He founded APOSS, JPOSS, and co-founded VWAR - virtual workshops that democratize research feedback. Check the Collaboration page to see his network!";
        }
        
        // Contact queries
        if (lowerQuery.includes('contact') || lowerQuery.includes('reach')) {
            return "You can reach Charles at charles.crabtree@monash.edu. He's also on Google Scholar, ORCID, and ResearchGate. Find all contact links at the bottom of the homepage!";
        }
        
        // Students
        if (lowerQuery.includes('student') || lowerQuery.includes('advise') || lowerQuery.includes('thesis')) {
            return "Charles loves working with students! He's published 7 papers with undergrads and advised 10 theses. Visit the Students page if you're interested in working together or need a letter of recommendation.";
        }
        
        // Default response
        return "I can help you find information about Charles's research, teaching, publications, collaborators, and contact details. Try asking about specific topics like 'papers on discrimination' or 'research on Japan'!";
    }

    searchTeaching(query) {
        if (!this.teaching) {
            return "Charles teaches at Monash University and Korea University. He's taught courses on statistical analysis, experimental methods, and Baltic politics. Visit the Teaching page to learn more!";
        }

        const lowerQuery = query.toLowerCase();
        const queryWords = lowerQuery.split(' ').filter(word => word.length >= 3);

        // Search in courses
        const matchingCourses = this.teaching.courses.filter(course => {
            const searchText = `${course.title} ${course.description} ${course.keywords.join(' ')}`.toLowerCase();
            return queryWords.some(word => searchText.includes(word));
        });

        if (matchingCourses.length > 0) {
            let response = `Charles has taught ${matchingCourses.length} relevant course(s):\n\n`;
            matchingCourses.forEach(course => {
                response += `• ${course.title} at ${course.institution}: ${course.description}\n\n`;
            });
            return response + "Visit the Teaching page for more details and student evaluations!";
        }

        // Check for Baltic LEAP
        if (lowerQuery.includes('baltic') || lowerQuery.includes('leap') || lowerQuery.includes('foreign study')) {
            const leap = this.teaching.programs.baltic_leap;
            return `${leap.name} is a ${leap.description}\n\nStudent feedback: "${leap.student_feedback[0]}" Visit the Teaching page to learn more!`;
        }

        return "Charles teaches at Monash University and Korea University. He's taught Quantitative Political Analysis, Experiments in Politics, Baltic Politics, and co-directed the Honors Program at Dartmouth. He also co-founded the Baltic LEAP foreign study program. Visit the Teaching page for full details!";
    }

    searchPublications(query) {
        const lowerQuery = query.toLowerCase();
        const queryWords = lowerQuery.split(' ').filter(word => word.length >= 3);
        
        // Search for keywords in publications
        const matches = this.publications.filter(pub => {
            const searchText = `${pub.title} ${pub.journal} ${pub.keywords.join(' ')} ${pub.authors.join(' ')}`.toLowerCase();
            return queryWords.some(word => searchText.includes(word));
        });
        
        if (matches.length === 0) {
            return "I couldn't find publications matching that query. Try asking about topics like 'discrimination', 'Japan', 'voting', 'gender', 'human rights', 'experiments', or 'COVID'. Or visit the Publications page to browse all 72 papers!";
        }
        
        // Sort by relevance (count matching keywords)
        const scored = matches.map(pub => {
            const searchText = `${pub.title} ${pub.keywords.join(' ')}`.toLowerCase();
            const score = queryWords.filter(word => searchText.includes(word)).length;
            return { pub, score };
        }).sort((a, b) => b.score - a.score);
        
        if (matches.length > 5) {
            const topics = [...new Set(scored.slice(0, 5).flatMap(s => s.pub.keywords))]
                .slice(0, 4).join(', ');
            return `I found ${matches.length} papers related to ${topics}. Here are the most relevant:\n\n${this.formatPublications(scored.slice(0, 3).map(s => s.pub))}\n\nVisit the Publications page to see all results!`;
        }
        
        return `Found ${matches.length} relevant publication(s):\n\n${this.formatPublications(scored.map(s => s.pub))}`;
    }

    formatPublications(pubs) {
        return pubs.map((pub, i) => 
            `${i + 1}. "${pub.title}" in ${pub.journal} (${pub.year})`
        ).join('\n\n');
    }

    getFallbackPublications() {
        // Fallback publications in case JSON doesn't load
        return [
            {
                title: "Are Americans Less Likely to Reply to Emails from Black People Relative to White People?",
                journal: "PNAS",
                year: 2021,
                keywords: ["discrimination", "race", "racial bias", "email", "correspondence", "experiment"]
            },
            {
                title: "Patient Traits Shape Health-Care Stakeholders' Choices on How to Best Allocate Life-Saving Care",
                journal: "Nature Human Behaviour",
                year: 2022,
                keywords: ["healthcare", "discrimination", "allocation", "experiment", "medical"]
            },
            {
                title: "Do Street-Level Bureaucrats Discriminate Based on Religion?",
                journal: "Public Administration Review",
                year: 2021,
                keywords: ["discrimination", "religion", "Muslim", "atheist", "schools", "principals", "experiment"]
            },
            {
                title: "Geo-Political Rivalry and Anti-Immigrant Sentiment",
                journal: "American Political Science Review",
                year: 2025,
                keywords: ["immigration", "discrimination", "geopolitics", "experiment", "international"]
            },
            {
                title: "Ideology Justifies Morality: Political Beliefs Predict Moral Foundations",
                journal: "American Journal of Political Science",
                year: 2019,
                keywords: ["ideology", "morality", "politics", "beliefs", "psychology"]
            },
            {
                title: "Validated Names for Experimental Studies on Race and Ethnicity",
                journal: "Nature Scientific Data",
                year: 2023,
                keywords: ["methods", "race", "ethnicity", "names", "experiment", "measurement"]
            },
            {
                title: "Evade and Deceive? Citizen Responses to Surveillance",
                journal: "Journal of Politics",
                year: 2021,
                keywords: ["surveillance", "privacy", "authoritarian", "behavior", "experiment"]
            },
            {
                title: "It's Not Only What You Say, It's Also How You Say It: The Strategic Use of Campaign Sentiment",
                journal: "Journal of Politics",
                year: 2020,
                keywords: ["elections", "campaigns", "sentiment", "language", "voting"]
            },
            {
                title: "When Do Private Actors Engage in Censorship? Evidence from Russia",
                journal: "British Journal of Political Science",
                year: 2022,
                keywords: ["censorship", "Russia", "media", "authoritarian", "experiment"]
            },
            {
                title: "Women Use More Positive Language than Men: Candidates' Strategic Use of Emotive Language",
                journal: "Journal of Politics",
                year: "Forthcoming",
                keywords: ["gender", "elections", "language", "campaigns", "Japan"]
            },
            {
                title: "Do Voters Punish Women Politicians More?",
                journal: "American Politics Research",
                year: 2024,
                keywords: ["gender", "women", "voting", "elections", "discrimination"]
            },
            {
                title: "Field Research When There's Limited Access to the Field: Lessons from Japan",
                journal: "PS: Political Science & Politics",
                year: 2022,
                keywords: ["Japan", "methods", "fieldwork", "research", "pandemic"]
            },
            {
                title: "Building Community through Virtual Workshops",
                journal: "PS: Political Science & Politics",
                year: 2022,
                keywords: ["community", "diversity", "workshops", "inclusion", "virtual"]
            },
            {
                title: "Why the Public Supports the Human Rights of Prisoners and Asylum Seekers",
                journal: "Political Research Quarterly",
                year: 2023,
                keywords: ["human rights", "prisoners", "asylum", "experiment", "public opinion"]
            },
            {
                title: "Measuring Gender Role Attitudes in Japan",
                journal: "Socius",
                year: 2021,
                keywords: ["gender", "Japan", "attitudes", "measurement", "culture"]
            }
        ];
    }
}

// Initialize chatbot when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
} else {
    // DOM already loaded
    initChatbot();
}

function initChatbot() {
    console.log('Initializing chatbot...');
    try {
        const chatbot = new SiteChatbot();
        console.log('Chatbot initialized successfully');
        window.chatbot = chatbot; // Make accessible for debugging
    } catch (error) {
        console.error('Failed to initialize chatbot:', error);
    }
}
