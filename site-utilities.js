// Site Utilities - All Interactive Features
// ==========================================

// Back to Top Button
class BackToTop {
    constructor() {
        this.button = null;
        this.init();
    }

    init() {
        this.createButton();
        this.attachListeners();
    }

    createButton() {
        const button = document.createElement('button');
        button.id = 'back-to-top';
        button.setAttribute('aria-label', 'Back to top');
        button.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
        `;
        document.body.appendChild(button);
        this.button = button;
    }

    attachListeners() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                this.button.classList.add('visible');
            } else {
                this.button.classList.remove('visible');
            }
        });

        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Reading Progress Bar
class ReadingProgress {
    constructor() {
        this.bar = null;
        this.init();
    }

    init() {
        this.createBar();
        this.attachListeners();
    }

    createBar() {
        const bar = document.createElement('div');
        bar.id = 'reading-progress';
        document.body.appendChild(bar);
        this.bar = bar;
    }

    attachListeners() {
        window.addEventListener('scroll', () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.scrollY;
            const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
            this.bar.style.width = `${Math.min(progress, 100)}%`;
        });
    }
}

// Dark Mode Toggle
class DarkMode {
    constructor() {
        this.init();
    }

    init() {
        // Check for saved preference or system preference
        const savedMode = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedMode === 'enabled' || (!savedMode && prefersDark)) {
            document.body.classList.add('dark-mode');
        }

        this.createToggle();
        this.attachListeners();
    }

    createToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'dark-mode-toggle';
        toggle.setAttribute('aria-label', 'Toggle dark mode');
        toggle.innerHTML = `
            <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <svg class="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
        `;

        // Add to nav
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            navLinks.appendChild(toggle);
        }
    }

    attachListeners() {
        document.querySelector('.dark-mode-toggle')?.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
        });

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('darkMode')) {
                document.body.classList.toggle('dark-mode', e.matches);
            }
        });
    }
}

// Toast Notifications
class Toast {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        this.container = container;
    }

    show(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>${message}</span>
        `;
        this.container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, duration);
    }
}

// Share Functionality
class ShareButton {
    constructor(selector) {
        this.buttons = document.querySelectorAll(selector);
        this.toast = new Toast();
        this.init();
    }

    init() {
        this.buttons.forEach(button => {
            button.addEventListener('click', () => this.share(button));
        });
    }

    async share(button) {
        const url = button.dataset.url || window.location.href;
        const title = button.dataset.title || document.title;
        const text = button.dataset.text || '';

        // Try native share API first
        if (navigator.share) {
            try {
                await navigator.share({ title, text, url });
                return;
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Share failed:', error);
                }
            }
        }

        // Fallback to clipboard
        try {
            await navigator.clipboard.writeText(url);
            this.toast.show('Link copied to clipboard!');
        } catch (error) {
            console.error('Copy failed:', error);
            this.toast.show('Could not copy link', 2000);
        }
    }
}

// Modal System
class ModalSystem {
    constructor() {
        this.activeModal = null;
        this.init();
    }

    init() {
        // Create modal template
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3></h3>
                        <button class="modal-close" aria-label="Close modal">×</button>
                    </div>
                    <div class="modal-body"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        this.modal = document.querySelector('.modal-overlay');
        this.attachListeners();
    }

    attachListeners() {
        // Close on overlay click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Close button
        this.modal.querySelector('.modal-close').addEventListener('click', () => {
            this.close();
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.close();
            }
        });
    }

    open(title, content) {
        this.modal.querySelector('.modal-header h3').textContent = title;
        this.modal.querySelector('.modal-body').innerHTML = content;
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.activeModal = true;
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.activeModal = false;
    }
}

// Hover Preview System
class HoverPreview {
    constructor() {
        this.init();
    }

    init() {
        // Add link preview tooltips
        document.querySelectorAll('a[href^="http"]').forEach(link => {
            const url = new URL(link.href);
            link.setAttribute('title', `Visit ${url.hostname}`);
        });

        // Publication hover previews (if abstracts are available)
        this.setupPublicationPreviews();
    }

    setupPublicationPreviews() {
        document.querySelectorAll('.pub-list li').forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(0, 102, 204, 0.05)';
            });
            item.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
            });
        });
    }
}

// Expand/Collapse All for Year Sections
class ExpandCollapseAll {
    constructor() {
        this.init();
    }

    init() {
        // Find pages with year sections
        const yearSections = document.querySelectorAll('.year-section');
        if (yearSections.length === 0) return;

        // Create control buttons
        const firstSection = document.querySelector('.section h2');
        if (!firstSection) return;

        const controlsHTML = `
            <div class="expand-collapse-controls">
                <button id="expand-all" class="control-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="7 13 12 18 17 13"></polyline>
                        <polyline points="7 6 12 11 17 6"></polyline>
                    </svg>
                    Expand All
                </button>
                <button id="collapse-all" class="control-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="17 11 12 6 7 11"></polyline>
                        <polyline points="17 18 12 13 7 18"></polyline>
                    </svg>
                    Collapse All
                </button>
            </div>
        `;

        firstSection.insertAdjacentHTML('afterend', controlsHTML);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .expand-collapse-controls {
                display: flex;
                gap: 0.75rem;
                margin: 1.5rem 0;
            }
            .control-btn {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.625rem 1rem;
                background: white;
                border: 1px solid rgba(0, 102, 204, 0.2);
                border-radius: 8px;
                font-family: var(--font-sans);
                font-size: 0.875rem;
                color: var(--accent);
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .control-btn:hover {
                background: var(--accent);
                color: white;
                border-color: var(--accent);
            }
        `;
        document.head.appendChild(style);

        // Attach event listeners
        document.getElementById('expand-all')?.addEventListener('click', () => {
            yearSections.forEach(section => section.classList.add('expanded'));
        });

        document.getElementById('collapse-all')?.addEventListener('click', () => {
            yearSections.forEach(section => section.classList.remove('expanded'));
        });
    }
}

// Site Search
class SiteSearch {
    constructor() {
        this.pages = [
            { title: 'Home', url: 'index.html', keywords: 'charles crabtree political scientist research discrimination' },
            { title: 'Research', url: 'research.html', keywords: 'working papers manuscripts research projects discrimination class' },
            { title: 'Publications', url: 'publications.html', keywords: 'publications articles journals papers peer-reviewed' },
            { title: 'Teaching', url: 'teaching.html', keywords: 'teaching courses balticsbaltic leap dartmouth quantitative' },
            { title: 'Media', url: 'media.html', keywords: 'media writing op-eds public authory' },
            { title: 'Collaboration', url: 'collaboration.html', keywords: 'collaboration coauthors workshops aposs jposs vwar' },
            { title: 'Students', url: 'students.html', keywords: 'students advising thesis independent study' },
            { title: 'Universities', url: 'universities.html', keywords: 'universities visited conferences talks' }
        ];
        this.init();
    }

    init() {
        this.createSearchUI();
        this.attachListeners();
    }

    createSearchUI() {
        // Add search toggle to nav
        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) return;

        const searchToggle = document.createElement('button');
        searchToggle.className = 'search-toggle';
        searchToggle.setAttribute('aria-label', 'Search site');
        searchToggle.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
            </svg>
        `;
        navLinks.insertBefore(searchToggle, navLinks.querySelector('.nav-cta'));

        // Create search overlay
        const searchOverlay = document.createElement('div');
        searchOverlay.className = 'search-overlay';
        searchOverlay.innerHTML = `
            <div class="search-modal">
                <div class="search-input-wrapper">
                    <input type="text" 
                           class="search-input" 
                           placeholder="Search the site..." 
                           aria-label="Search input">
                </div>
                <div class="search-results">
                    <div class="search-instructions">
                        Type to search across all pages
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(searchOverlay);

        this.overlay = searchOverlay;
        this.input = searchOverlay.querySelector('.search-input');
        this.resultsContainer = searchOverlay.querySelector('.search-results');
    }

    attachListeners() {
        // Open search
        document.querySelector('.search-toggle')?.addEventListener('click', () => {
            this.open();
        });

        // Close on overlay click
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
                this.close();
            }
            // Open search with Cmd+K or Ctrl+K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.open();
            }
        });

        // Search on input
        this.input.addEventListener('input', (e) => {
            this.search(e.target.value);
        });
    }

    open() {
        this.overlay.classList.add('active');
        this.input.focus();
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.overlay.classList.remove('active');
        this.input.value = '';
        this.resultsContainer.innerHTML = '<div class="search-instructions">Type to search across all pages</div>';
        document.body.style.overflow = '';
    }

    search(query) {
        if (!query.trim()) {
            this.resultsContainer.innerHTML = '<div class="search-instructions">Type to search across all pages</div>';
            return;
        }

        const results = this.pages.filter(page => {
            const searchText = `${page.title} ${page.keywords}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        });

        if (results.length === 0) {
            this.resultsContainer.innerHTML = '<div class="search-no-results">No results found</div>';
            return;
        }

        const resultsHTML = results.map(result => `
            <a href="${result.url}" class="search-result-item">
                <div class="search-result-title">${result.title}</div>
                <div class="search-result-page">${result.url}</div>
            </a>
        `).join('');

        this.resultsContainer.innerHTML = resultsHTML;

        // Close search on result click
        this.resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => this.close());
        });
    }
}

// Breadcrumbs
class Breadcrumbs {
    constructor() {
        this.init();
    }

    init() {
        // Don't show breadcrumbs on homepage or main nav pages
        const path = window.location.pathname;
        const noBreplacecrumbs = [
            'index.html',
            'research.html',
            'publications.html',
            'teaching.html',
            'media.html',
            'collaboration.html',
            'students.html'
        ];
        
        if (path === '/' || noBreplacecrumbs.some(page => path.endsWith(page))) {
            return;
        }

        this.createBreadcrumbs();
    }

    createBreadcrumbs() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '');
        
        // Page title mapping
        const pageTitles = {
            'research': 'Research',
            'publications': 'Publications',
            'teaching': 'Teaching',
            'media': 'Media',
            'collaboration': 'Collaboration',
            'students': 'Students',
            'universities': 'Universities',
            'colophon': 'Colophon'
        };

        const pageTitle = pageTitles[page] || page.charAt(0).toUpperCase() + page.slice(1);

        const breadcrumbHTML = `
            <nav class="breadcrumbs" aria-label="Breadcrumb">
                <ol class="breadcrumbs-list">
                    <li>
                        <a href="index.html">Home</a>
                    </li>
                    <li>
                        <span class="separator">/</span>
                    </li>
                    <li>
                        <span class="current">${pageTitle}</span>
                    </li>
                </ol>
            </nav>
        `;

        // Insert after nav
        const nav = document.querySelector('.nav');
        if (nav) {
            nav.insertAdjacentHTML('afterend', breadcrumbHTML);
        }
    }
}

// Smooth Scroll to Section with Offset
function smoothScrollTo(element) {
    const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'));
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - navHeight - 20;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

// Initialize all utilities
document.addEventListener('DOMContentLoaded', () => {
    new BackToTop();
    new Breadcrumbs();
    new SiteSearch();
    new ReadingProgress();
    new DarkMode();
    new HoverPreview();
    new ExpandCollapseAll();
    new ModalSystem();
    
    // Initialize toast as global
    window.siteToast = new Toast();
    
    // Initialize share buttons if they exist
    if (document.querySelector('.share-button')) {
        new ShareButton('.share-button');
    }

    console.log('Site utilities initialized');
});
