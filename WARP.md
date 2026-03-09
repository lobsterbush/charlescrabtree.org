# Project Rules for charlescrabtree.org

## Overview
Personal academic website for Charles Crabtree built with vanilla HTML, CSS, and JavaScript.

## Recent Updates (March 2026)
- **Homepage rewrite**: Conversational tone, "Social scientist" tagline, removed Wu-Tang reference, added Fundamental Needs Lab link. Kept all core content (personal background, publications, media, editorial roles, fieldwork regions).
- **Typography modernization**: Replaced Space Grotesk + IBM Plex Mono with Plus Jakarta Sans + JetBrains Mono across all pages and CSS. Reduced monospace usage — mono kept only for stats, dates, footer copyright.
- **Open Graph metadata**: Added og:title, og:description, og:image, og:url, og:type, and Twitter Card tags to all 14 HTML pages.
- **Dead CSS cleanup**: Removed ~280 lines of unused chatbot styles from `styles.css`. Fixed hardcoded `Space Grotesk` in `.map-popup` to use `var(--font-sans)`.
- **404 page**: Created `404.html` with site nav, friendly message, and back-to-home link for GitHub Pages.
- **Colophon moved**: Removed Colophon from nav and mobile menu across all pages; remains as footer link only.
- **Media page**: Added Profiles section (Boston Globe, Asahi Shimbun interviews). Restructured page layout.
- **Press packet**: Created `crabtree-press-packet.zip` at `/Users/f00421k/Dropbox/me/` with bio docx and headshot.
- **Altmetric badges**: Added Altmetric donut badges to `publications.html` — auto-detected from DOI links via inline JS.
- **Publications page**: Added forthcoming PNAS Nexus article ("Can AI Help Reduce Prejudice?") and updated Japan Forum article title/DOI.
- **What's New widget**: Collapsible cutout tab hanging under the nav on all 14 pages. Collapsed by default; expands to show Latest updates and Upcoming Talks & Presentations in a two-column grid. Content loaded from `updates.json` and `calendar-config.js`.
- **Site utilities refactor**: Search (🔍) and dark mode (🌙) toggles live in the nav bar (injected by `site-utilities.js`). What's New is a separate standalone widget below the nav. Removed consolidated tab-bar approach.

## Key Files
- **CV source**: `/Users/f00421k/Dropbox/cv/c_crabtree_cv.tex` (LaTeX)
- **Publications page**: `publications.html` - all journal articles with Altmetric badges
- **Media page**: `media.html` - displays public scholarship, profiles, podcast, media appearances, media coverage
- **404 page**: `404.html` - custom GitHub Pages 404
- **Sync script**: `update_recent_scholarship.py` - extracts entries from CV and updates media.html
- **Site utilities**: `site-utilities.js` - injects search and dark mode toggles into nav
- **What's New JS**: `whats-new.js` - toggle behavior and content rendering for the widget
- **Widget data**: `updates.json` - latest updates content; `calendar-config.js` - upcoming talks

## CV-to-Website Sync
The `update_recent_scholarship.py` script automatically syncs the 5 most recent public scholarship entries from the CV to the media page:
- Run manually: `python3 update_recent_scholarship.py`
- Auto-trigger: Install `com.crabtree.update-scholarship.plist` to watch CV file

## Conventions

### HTML Structure
- All pages share the same nav, mobile menu, and footer structure
- Footer contains Connect links (ORCID, Google Scholar, Academia.edu, LinkedIn, etc.)
- Use `<em>` tags for outlet/publication names
- Collapsible sections use `year-section` class with `year-header` and `year-content` divs

### Styling
- CSS version: `styles.css?v=21`
- Fonts: Plus Jakarta Sans (headings/body), JetBrains Mono (code/stats/dates)
- Font weights loaded: 400, 600, 700 (Jakarta Sans); 400, 600 (JetBrains Mono)
- Follow existing indentation and formatting patterns
- All pages have Open Graph and Twitter Card meta tags

### What's New Widget
- Fixed-position cutout tab under nav: `.wn-widget` with `.wn-toggle` button
- Collapsed by default (`collapsed` class); toggle expands two-column panel
- `.wn-toggle` has cutout styling (background blur, border, border-radius 0 0 4px 4px, box-shadow)
- When expanded, `.wn-widget:not(.collapsed)` gets full-width background; toggle loses cutout styling
- Nav order: Research, Publications, Teaching, Media, Collaboration, Students, CV, 🔍 (search), 🌙 (dark mode)
- Search and dark mode are injected into `.nav-links` by `site-utilities.js` (search after CV, dark mode at end)
- Hero/page padding includes `+ 18px` offset for the hanging tab

### Altmetric Badges
- Inline JS at bottom of `publications.html` auto-detects DOIs from `doi.org/` links
- Creates `<div class="altmetric-embed">` elements with `data-badge-type="donut"`
- Embed script loaded in `<head>` via `https://d1bxh8uas1mnw7.cloudfront.net/assets/embed.js`
- `_altmetric_embed_init()` called after badge injection to re-scan DOM
- `data-hide-no-mentions="true"` hides badges for papers without Altmetric data
- Badge images scaled to 48px with `border-radius: 50%`

### Media Coverage Section
- All outlet names should be italicized with `<em>` tags
- List is comma-separated, alphabetized where practical
- NPR format: `NPR's <em>All Things Considered</em>`

### Git Commits
- Always include `Co-Authored-By: Oz <oz-agent@warp.dev>` for AI-assisted commits
- Keep commits atomic and descriptive

## Do NOT
- Add Authory links (removed from site)
- Create duplicate closing `</div>` tags in year-section structures
- Commit without testing changes locally first
