// Publications Search and Filter System
class PublicationsSearch {
    constructor() {
        this.publications = [];
        this.filteredPublications = [];
        this.activeFilters = {
            search: '',
            years: [],
            journals: [],
            authors: [],
            topics: []
        };
        this.init();
    }

    async init() {
        await this.loadPublications();
        this.buildSearchUI();
        this.attachEventListeners();
        this.extractFilterOptions();
        this.buildTagCloud();
    }

    async loadPublications() {
        try {
            const response = await fetch('publications.json');
            const data = await response.json();
            this.publications = data.publications;
            this.filteredPublications = [...this.publications];
        } catch (error) {
            console.error('Failed to load publications:', error);
        }
    }

    buildSearchUI() {
        const container = document.querySelector('.section h2');
        if (!container || container.textContent !== 'Select journal articles') return;

        const searchHTML = `
            <div class="publications-search-container">
                <div class="search-header">
                    <div class="search-box-wrapper">
                        <input 
                            type="text" 
                            id="pub-search" 
                            placeholder="Search publications by title, author, keyword..." 
                            aria-label="Search publications"
                        />
                        <button id="clear-search" aria-label="Clear search">×</button>
                    </div>
                    <button id="toggle-filters" class="filter-toggle">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="4" y1="21" x2="4" y2="14"></line>
                            <line x1="4" y1="10" x2="4" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12" y2="3"></line>
                            <line x1="20" y1="21" x2="20" y2="16"></line>
                            <line x1="20" y1="12" x2="20" y2="3"></line>
                            <line x1="1" y1="14" x2="7" y2="14"></line>
                            <line x1="9" y1="8" x2="15" y2="8"></line>
                            <line x1="17" y1="16" x2="23" y2="16"></line>
                        </svg>
                        Filters
                    </button>
                </div>

                <div id="filter-panel" class="filter-panel hidden">
                    <div class="filter-group">
                        <h4>Year Range</h4>
                        <div class="year-range-inputs">
                            <input type="number" id="year-from" placeholder="From" min="2000" max="2025" />
                            <span>—</span>
                            <input type="number" id="year-to" placeholder="To" min="2000" max="2025" />
                        </div>
                    </div>

                    <div class="filter-group">
                        <h4>Select Journals</h4>
                        <div id="journal-filters" class="filter-checkboxes"></div>
                    </div>

                    <div class="filter-group">
                        <h4>Co-authors</h4>
                        <input 
                            type="text" 
                            id="author-search" 
                            placeholder="Search authors..." 
                            class="filter-search"
                        />
                        <div id="author-filters" class="filter-checkboxes"></div>
                    </div>

                    <div class="filter-actions">
                        <button id="apply-filters" class="btn-primary">Apply Filters</button>
                        <button id="reset-filters" class="btn-secondary">Reset All</button>
                    </div>
                </div>

                <div class="search-results-info">
                    <span id="results-count">Showing all ${this.publications.length} publications</span>
                    <div id="active-filters" class="active-filters"></div>
                </div>

                <div id="topic-cloud" class="topic-cloud"></div>
            </div>
        `;

        container.insertAdjacentHTML('afterend', searchHTML);
    }

    extractFilterOptions() {
        // Extract unique journals
        this.journals = [...new Set(this.publications.map(p => p.journal))].sort();
        
        // Extract unique authors (excluding "Charles Crabtree")
        const allAuthors = new Set();
        this.publications.forEach(pub => {
            pub.authors.forEach(author => {
                if (author !== 'Charles Crabtree') {
                    allAuthors.add(author);
                }
            });
        });
        this.authors = [...allAuthors].sort();

        // Extract topics with frequency
        const topicFreq = {};
        this.publications.forEach(pub => {
            pub.keywords.forEach(keyword => {
                topicFreq[keyword] = (topicFreq[keyword] || 0) + 1;
            });
        });
        this.topics = Object.entries(topicFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 30); // Top 30 topics

        this.populateFilterLists();
    }

    populateFilterLists() {
        // Populate journals
        const journalContainer = document.getElementById('journal-filters');
        if (journalContainer) {
            this.journals.slice(0, 15).forEach(journal => {
                const label = document.createElement('label');
                label.innerHTML = `
                    <input type="checkbox" value="${journal}" class="journal-filter">
                    <span>${journal}</span>
                `;
                journalContainer.appendChild(label);
            });
        }

        // Populate authors
        const authorContainer = document.getElementById('author-filters');
        if (authorContainer) {
            this.authors.slice(0, 20).forEach(author => {
                const label = document.createElement('label');
                label.innerHTML = `
                    <input type="checkbox" value="${author}" class="author-filter">
                    <span>${author}</span>
                `;
                authorContainer.appendChild(label);
            });
        }
    }

    buildTagCloud() {
        const cloudContainer = document.getElementById('topic-cloud');
        if (!cloudContainer) return;

        const maxFreq = this.topics[0][1];
        const minFreq = this.topics[this.topics.length - 1][1];

        cloudContainer.innerHTML = '<h4>Topics</h4><div class="tag-cloud-items"></div>';
        const itemsContainer = cloudContainer.querySelector('.tag-cloud-items');

        this.topics.forEach(([topic, freq]) => {
            // Scale font size between 0.75rem and 1.5rem
            const scale = (freq - minFreq) / (maxFreq - minFreq);
            const fontSize = 0.75 + (scale * 0.75);
            
            const tag = document.createElement('button');
            tag.className = 'topic-tag';
            tag.textContent = topic;
            tag.style.fontSize = `${fontSize}rem`;
            tag.dataset.topic = topic;
            tag.setAttribute('aria-label', `Filter by ${topic} (${freq} publications)`);
            
            itemsContainer.appendChild(tag);
        });
    }

    attachEventListeners() {
        // Search box
        const searchInput = document.getElementById('pub-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.activeFilters.search = e.target.value.toLowerCase();
                this.debouncedFilter();
            });
        }

        // Clear search
        const clearBtn = document.getElementById('clear-search');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                this.activeFilters.search = '';
                this.filterPublications();
            });
        }

        // Toggle filters panel
        const toggleBtn = document.getElementById('toggle-filters');
        const filterPanel = document.getElementById('filter-panel');
        if (toggleBtn && filterPanel) {
            toggleBtn.addEventListener('click', () => {
                filterPanel.classList.toggle('hidden');
                toggleBtn.classList.toggle('active');
            });
        }

        // Apply filters button
        const applyBtn = document.getElementById('apply-filters');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applyFilters());
        }

        // Reset filters
        const resetBtn = document.getElementById('reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }

        // Topic tags
        const topicCloud = document.getElementById('topic-cloud');
        if (topicCloud) {
            topicCloud.addEventListener('click', (e) => {
                if (e.target.classList.contains('topic-tag')) {
                    e.target.classList.toggle('active');
                    this.toggleTopicFilter(e.target.dataset.topic);
                }
            });
        }

        // Author search
        const authorSearch = document.getElementById('author-search');
        if (authorSearch) {
            authorSearch.addEventListener('input', (e) => {
                this.filterAuthorList(e.target.value);
            });
        }
    }

    debouncedFilter = this.debounce(() => this.filterPublications(), 300);

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    applyFilters() {
        // Collect year filters
        const yearFrom = document.getElementById('year-from').value;
        const yearTo = document.getElementById('year-to').value;
        this.activeFilters.yearRange = { from: yearFrom, to: yearTo };

        // Collect journal filters
        const selectedJournals = Array.from(document.querySelectorAll('.journal-filter:checked'))
            .map(cb => cb.value);
        this.activeFilters.journals = selectedJournals;

        // Collect author filters
        const selectedAuthors = Array.from(document.querySelectorAll('.author-filter:checked'))
            .map(cb => cb.value);
        this.activeFilters.authors = selectedAuthors;

        this.filterPublications();
    }

    toggleTopicFilter(topic) {
        const index = this.activeFilters.topics.indexOf(topic);
        if (index > -1) {
            this.activeFilters.topics.splice(index, 1);
        } else {
            this.activeFilters.topics.push(topic);
        }
        this.filterPublications();
    }

    filterAuthorList(searchTerm) {
        const authorLabels = document.querySelectorAll('#author-filters label');
        const term = searchTerm.toLowerCase();
        
        authorLabels.forEach(label => {
            const authorName = label.textContent.toLowerCase();
            label.style.display = authorName.includes(term) ? 'flex' : 'none';
        });
    }

    filterPublications() {
        this.filteredPublications = this.publications.filter(pub => {
            // Search filter
            if (this.activeFilters.search) {
                const searchText = `${pub.title} ${pub.authors.join(' ')} ${pub.keywords.join(' ')}`.toLowerCase();
                if (!searchText.includes(this.activeFilters.search)) return false;
            }

            // Year range filter
            if (this.activeFilters.yearRange) {
                const { from, to } = this.activeFilters.yearRange;
                const year = parseInt(pub.year);
                if (from && year < parseInt(from)) return false;
                if (to && year > parseInt(to)) return false;
            }

            // Journal filter
            if (this.activeFilters.journals.length > 0) {
                if (!this.activeFilters.journals.includes(pub.journal)) return false;
            }

            // Author filter
            if (this.activeFilters.authors.length > 0) {
                const hasAuthor = this.activeFilters.authors.some(author => 
                    pub.authors.includes(author)
                );
                if (!hasAuthor) return false;
            }

            // Topic filter
            if (this.activeFilters.topics.length > 0) {
                const hasTopic = this.activeFilters.topics.some(topic =>
                    pub.keywords.includes(topic)
                );
                if (!hasTopic) return false;
            }

            return true;
        });

        this.updateResultsDisplay();
        this.updateActiveFiltersDisplay();
        this.highlightMatchingPublications();
    }

    updateResultsDisplay() {
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            const count = this.filteredPublications.length;
            const total = this.publications.length;
            resultsCount.textContent = count === total 
                ? `Showing all ${total} publications`
                : `Showing ${count} of ${total} publications`;
        }
    }

    updateActiveFiltersDisplay() {
        const container = document.getElementById('active-filters');
        if (!container) return;

        container.innerHTML = '';

        const addFilterBadge = (text, onRemove) => {
            const badge = document.createElement('span');
            badge.className = 'filter-badge';
            badge.innerHTML = `${text} <button aria-label="Remove filter">×</button>`;
            badge.querySelector('button').addEventListener('click', onRemove);
            container.appendChild(badge);
        };

        if (this.activeFilters.search) {
            addFilterBadge(`Search: "${this.activeFilters.search}"`, () => {
                document.getElementById('pub-search').value = '';
                this.activeFilters.search = '';
                this.filterPublications();
            });
        }

        this.activeFilters.journals.forEach(journal => {
            addFilterBadge(journal, () => {
                const checkbox = document.querySelector(`.journal-filter[value="${journal}"]`);
                if (checkbox) checkbox.checked = false;
                this.applyFilters();
            });
        });

        this.activeFilters.authors.forEach(author => {
            addFilterBadge(author, () => {
                const checkbox = document.querySelector(`.author-filter[value="${author}"]`);
                if (checkbox) checkbox.checked = false;
                this.applyFilters();
            });
        });

        this.activeFilters.topics.forEach(topic => {
            addFilterBadge(topic, () => {
                const tag = document.querySelector(`.topic-tag[data-topic="${topic}"]`);
                if (tag) tag.classList.remove('active');
                this.toggleTopicFilter(topic);
            });
        });
    }

    highlightMatchingPublications() {
        // Hide/show publications based on filter
        const pubList = document.querySelector('.pub-list');
        if (!pubList) return;

        const listItems = pubList.querySelectorAll('li');
        const filteredTitles = new Set(this.filteredPublications.map(p => p.title.toLowerCase()));

        listItems.forEach(item => {
            const linkText = item.textContent.toLowerCase();
            const matches = Array.from(filteredTitles).some(title => linkText.includes(title));
            item.style.display = matches ? 'block' : 'none';
        });
    }

    resetFilters() {
        // Clear all inputs
        document.getElementById('pub-search').value = '';
        document.getElementById('year-from').value = '';
        document.getElementById('year-to').value = '';
        document.getElementById('author-search').value = '';
        
        // Uncheck all checkboxes
        document.querySelectorAll('.journal-filter, .author-filter').forEach(cb => {
            cb.checked = false;
        });

        // Deactivate all topic tags
        document.querySelectorAll('.topic-tag').forEach(tag => {
            tag.classList.remove('active');
        });

        // Reset filters
        this.activeFilters = {
            search: '',
            years: [],
            journals: [],
            authors: [],
            topics: []
        };

        // Show all authors
        document.querySelectorAll('#author-filters label').forEach(label => {
            label.style.display = 'flex';
        });

        this.filterPublications();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.querySelector('.page-title')?.textContent === 'Publications') {
            window.pubSearch = new PublicationsSearch();
        }
    });
} else {
    if (document.querySelector('.page-title')?.textContent === 'Publications') {
        window.pubSearch = new PublicationsSearch();
    }
}
