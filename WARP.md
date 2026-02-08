# Project Rules for charlescrabtree.org

## Overview
Personal academic website for Charles Crabtree built with vanilla HTML, CSS, and JavaScript.

## Key Files
- **CV source**: `/Users/f00421k/Dropbox/cv/c_crabtree_cv.tex` (LaTeX)
- **Media page**: `media.html` - displays public scholarship, podcast, media appearances, media coverage
- **Sync script**: `update_recent_scholarship.py` - extracts entries from CV and updates media.html

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
- CSS version: `styles.css?v=6`
- Fonts: Space Grotesk (headings), IBM Plex Mono (code)
- Follow existing indentation and formatting patterns

### Media Coverage Section
- All outlet names should be italicized with `<em>` tags
- List is comma-separated, alphabetized where practical
- NPR format: `NPR's <em>All Things Considered</em>`

### Git Commits
- Always include `Co-Authored-By: Warp <agent@warp.dev>` for AI-assisted commits
- Keep commits atomic and descriptive

## Do NOT
- Add Authory links (removed from site)
- Create duplicate closing `</div>` tags in year-section structures
- Commit without testing changes locally first
