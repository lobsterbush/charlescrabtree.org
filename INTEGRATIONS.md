# Site Integrations

This document describes all external integrations and automated systems used on the personal website.

## 🤖 Chatbot Integration

### Overview
AI-powered chatbot that answers questions about research, publications, and teaching.

### Components
- **JavaScript:** `chatbot.js`
- **Data Sources:** 
  - `publications.json` - All publications and working papers
  - `teaching.json` - Complete course information
- **UI Location:** Bottom-right floating button (blue → green on hover)

### Features
- Searches publications by keyword, author, topic
- Provides teaching history and course details
- Answers general questions about research interests
- Contact information
- Fully client-side (no backend required)

### Maintenance
Data files are static. Update manually when needed:
- Edit `publications.json` when new papers published
- Edit `teaching.json` when teaching new courses

### Technical Details
- No API keys required
- Works on all static hosting platforms
- Loads automatically on every page
- Mobile responsive

---

## 📝 Authory Writing Integration

### Overview
Automatically displays latest articles from public writing portfolio.

### Components
- **Page:** `writing.html`
- **Data:** `writing.json` (auto-generated)
- **Update Script:** `fetch_authory.py`
- **Workflow:** `.github/workflows/update-writing.yml`

### Data Source
**RSS Feed:** https://authory.com/cdcrabtree/rss

### Automatic Updates
- **Frequency:** Daily at 6am UTC (10pm PST / 1am EST)
- **Method:** GitHub Actions workflow
- **Process:**
  1. Workflow runs `fetch_authory.py`
  2. Script fetches latest 20 articles from RSS
  3. Updates `writing.json` with article data
  4. Commits and pushes changes if new content found
  5. Hosting platform auto-deploys updated site

### Manual Updates
```bash
python3 fetch_authory.py
git add writing.json
git commit -m "Update writing"
git push
```

### Article Data Captured
- Title
- Publication date
- Outlet (The Diplomat, Japan Times, etc.)
- Link to article
- Excerpt/description

### Setup Requirements
1. Python 3 with `feedparser` library
2. GitHub Actions enabled with write permissions
3. RSS feed must be publicly accessible

### Maintenance
- Monitor Actions tab for workflow success/failures
- RSS feed updates automatically when new articles published on Authory
- No manual intervention needed unless workflow fails

---

## 🗺️ Interactive Maps

### Overview
Beautiful interactive maps with sleek black markers, pulse animations, and smooth reveals.

**Full Documentation:** See [MAPS.md](MAPS.md) for complete details.

### Maps Implemented

#### 1. Collaboration Map (`collaboration.html`)
- **Data:** `data/collaboration_universities_coords_corrected.csv`
- **Shows:** 72 universities where collaborators are affiliated
- **Features:** Black markers (medium size), sequential fade-in, collaborator count badges

#### 2. Visited Universities Map (`collaboration.html`)
- **Data:** `data/visited_universities_coords.csv`
- **Shows:** 105 universities visited for talks, conferences, workshops
- **Features:** Black markers (small size), staggered animations

#### 3. Places Lived Map (`index.html`)
- **Data:** `data/places_lived_coords.csv`
- **Shows:** 31 cities lived in worldwide
- **Features:** Black markers (large size)

### Key Features
- **Sleek Design:** Pure black markers with 3-layer design (pulse, ring, dot)
- **Animations:** Sequential fade-in, continuous pulse, hover effects
- **Clean Basemap:** CartoDB Positron tiles for minimal look
- **Professional Popups:** Modern cards with badges and scrollable lists
- **Mobile Optimized:** Touch gestures, responsive sizing

### Technology Stack
- **Library:** Leaflet.js v1.9.4
- **Tiles:** CartoDB Positron (light, minimal)
- **Data Format:** CSV files with coordinates
- **Rendering:** Client-side JavaScript (`maps.js`)
- **Styling:** Custom CSS with animations (`styles.css`)

### Quick Updates
Edit CSV files in `data/` directory:
```csv
# Collaboration
Institution,Latitude,Longitude,Collaborators
Harvard,42.377,-71.1167,John Doe; Jane Smith

# Visited Universities  
University,Location,Latitude,Longitude
MIT,"Cambridge, MA, USA",42.3601,-71.0942

# Places Lived
place,lat,lon
"Boston, MA",42.3601,-71.0589
```

Changes appear immediately on page refresh.

### Performance
- Staggered marker loading (10-15ms delays)
- Smooth CSS animations
- Optimized for 100+ markers
- Mobile-responsive (400px height)

---

## 📊 Analytics (If Implemented)

### Recommended: Plausible Analytics
- Privacy-friendly
- No cookies required
- Lightweight script
- GDPR compliant

**Setup:**
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

---

## 🔄 Content Update Workflows

### Current Automated Workflows

#### Writing Content Updates
- **File:** `.github/workflows/update-writing.yml`
- **Trigger:** Daily cron job + manual dispatch
- **Updates:** `writing.json`

### Potential Future Workflows

#### Publication Updates from Crossref
Could auto-fetch publication metrics (citations, etc.) from Crossref API monthly.

#### Google Scholar Citations
Could fetch citation counts from Google Scholar.

#### CV Sync
Could auto-update publications list from CV LaTeX source.

---

## 🚀 Deployment Integrations

### GitHub Pages
- **Auto-deploy:** On push to `main` branch
- **URL:** `https://username.github.io/repo-name`
- **Custom domain:** Configure in Settings → Pages

### Netlify
- **Auto-deploy:** On push to `main` branch
- **Build command:** None needed (static site)
- **Publish directory:** `/` (root)
- **Custom domain:** Configure in Domain Settings

### Vercel
- **Auto-deploy:** On push to `main` branch
- **Framework:** None (static)
- **Root directory:** `.`
- **Custom domain:** Configure in Project Settings

All platforms support:
- Automatic HTTPS
- CDN distribution
- Custom domains
- Branch previews

---

## 🔐 Security & Privacy

### Current Status
- No user tracking beyond basic server logs
- No cookies used
- No personal data collected
- All integrations client-side
- No backend database

### Best Practices
- RSS feed URL is public (intended)
- Data files in public repo (intended - no sensitive info)
- No API keys in repository
- GitHub Actions secrets not needed (public data only)

---

## 🐛 Troubleshooting

### Chatbot Not Appearing
1. Check browser console (F12) for errors
2. Verify `chatbot.js`, `publications.json`, `teaching.json` exist
3. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Writing Page Shows No Articles
1. Check `writing.json` exists and is valid JSON
2. Check GitHub Actions workflow ran successfully
3. Verify RSS feed is accessible: https://authory.com/cdcrabtree/rss
4. Run `python3 fetch_authory.py` manually to test

### Maps Not Loading
1. Check browser console for JavaScript errors
2. Verify CSV files exist in `data/` directory
3. Check internet connection (maps require external tiles)
4. Verify Leaflet.js CDN is accessible

### GitHub Actions Workflow Failing
1. Go to Actions tab in repository
2. Click failed workflow run
3. Review error logs
4. Common fixes:
   - Enable workflow write permissions in repo settings
   - Check Python dependencies installed correctly
   - Verify RSS feed is accessible

---

## 📈 Future Integration Ideas

### Potential Additions
- **Blog RSS Integration:** Auto-pull blog posts if you start a blog
- **Twitter/Social Feed:** Display recent social media posts
- **Google Scholar Metrics:** Auto-update citation counts
- **GitHub Activity:** Show recent repository activity
- **Calendar Integration:** Display upcoming talks/conferences
- **Newsletter Signup:** Embedded form for mailing list
- **Contact Form:** Alternative to email with spam protection
- **Search Functionality:** Full-site search across all content

### Implementation Considerations
Each addition should:
- Maintain site performance
- Respect user privacy
- Work without JavaScript when possible
- Be accessible and mobile-friendly
- Have fallback if external service fails

---

## 📚 Documentation Links

- [Leaflet.js Documentation](https://leafletjs.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Authory Help Center](https://help.authory.com/)
- [RSS Feed Specification](https://www.rssboard.org/rss-specification)

---

## ✅ Integration Checklist

Before deploying:

- [ ] Chatbot appears on all pages
- [ ] Writing page loads articles
- [ ] All three maps render correctly
- [ ] GitHub Actions workflow enabled
- [ ] Workflow write permissions enabled
- [ ] All CSV data files present
- [ ] All JSON data files present
- [ ] Mobile responsive testing complete
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Links all work (no 404s)

---

*Last updated: 2026-01-18*
