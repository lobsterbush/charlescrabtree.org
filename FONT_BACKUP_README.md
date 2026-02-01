# Font Configuration Backup

**Backup Date:** 2026-02-01
**Purpose:** Backup before changing site fonts

## Current Font Configuration

### Google Fonts (Web Fonts)
The site currently uses Google Fonts loaded via CDN:

**Fonts:**
- **IBM Plex Mono** (weights: 400, 500, 600, 700)
- **Space Grotesk** (weights: 400, 500, 600, 700)

**Google Fonts Link (in all HTML files):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### CSS Variables (styles.css)
```css
--font-mono: 'IBM Plex Mono', 'SF Mono', monospace;
--font-sans: 'Space Grotesk', system-ui, sans-serif;
```

## Backup Files Created

1. **styles.css.backup** - Complete backup of styles.css
   - Contains all CSS including font definitions
   - Located: `/Users/f00421k/Documents/GitHub/personal-site/styles.css.backup`

## Files Using Font References

All HTML files include the Google Fonts link in their `<head>` section:
- index.html
- collaboration.html
- coauthors.html
- colophon.html
- course-evaluations.html
- dartmouth-teaching.html
- media.html
- publications.html
- research.html
- students.html
- teaching-assistant.html
- teaching.html
- universities.html

## To Revert to Original Fonts

If you need to restore the original font configuration:

1. **Restore CSS file:**
   ```bash
   cp styles.css.backup styles.css
   ```

2. **Restore Google Fonts links in HTML files (if removed):**
   Add these lines to the `<head>` section of each HTML file:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
   ```

3. **Verify CSS variables in styles.css:**
   ```css
   --font-mono: 'IBM Plex Mono', 'SF Mono', monospace;
   --font-sans: 'Space Grotesk', system-ui, sans-serif;
   ```

## Notes

- The original fonts are web fonts loaded from Google Fonts CDN
- Fallback fonts are included: 'SF Mono', monospace for mono and system-ui, sans-serif for sans
- Font weights used: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
