# Deployment Checklist

Before deploying, ensure these files and features work correctly.

## ✅ Required Files

Make sure ALL these files are uploaded/committed:

### HTML Files
- [ ] `index.html`
- [ ] `research.html`
- [ ] `publications.html`
- [ ] `teaching.html`
- [ ] `writing.html`
- [ ] `collaboration.html`
- [ ] `students.html`

### JavaScript Files
- [ ] `script.js` (navigation, animations)
- [ ] `chatbot.js` (chatbot functionality)
- [ ] `maps.js` (interactive maps)

### JSON Data Files
- [ ] `publications.json` (chatbot needs this)
- [ ] `teaching.json` (chatbot needs this)
- [ ] `writing.json` (writing page needs this)

### CSS
- [ ] `styles.css`

### Images
- [ ] `me-square.jpg` (your photo)
- [ ] `images/` folder (if you have one with teaching/collaboration photos)

### Data Files (for maps)
- [ ] `data/collaboration_universities_coords_corrected.csv`
- [ ] `data/visited_universities_coords.csv`
- [ ] `data/places_lived_coords.csv`

## ✅ Chatbot Integration

The chatbot will work automatically once deployed because:

1. **All required files are included:**
   - `chatbot.js` - the chatbot code
   - `publications.json` - data for publication searches
   - `teaching.json` - data for teaching queries

2. **Already integrated in all HTML pages:**
   - Check: Every `.html` file has `<script src="chatbot.js"></script>` before `</body>`
   - The chatbot loads automatically on page load

3. **No external dependencies:**
   - Everything runs client-side (in the browser)
   - No API keys or backend needed

**To verify after deployment:**
```
1. Visit your deployed site
2. Look for blue circle button in bottom-right
3. Click it - chatbot panel should open
4. Try: "Show me papers on discrimination"
5. Try: "What courses has Charles taught?"
```

## ✅ Authory Writing Integration

The writing page will work because:

1. **JSON file is generated:**
   - `writing.json` contains your 20 latest articles from RSS
   - This file is static and can be served by any host

2. **Writing page loads the JSON:**
   - `writing.html` has JavaScript that fetches `writing.json`
   - Works on any web server (GitHub Pages, Netlify, etc.)

3. **No CORS issues when deployed:**
   - CORS (Cross-Origin) issues only happen with `file://` protocol
   - Once on a real web server (`https://`), JSON loading works fine

**To verify after deployment:**
```
1. Visit https://yoursite.com/writing.html
2. Should see 20 article cards with:
   - Title (clickable)
   - Date
   - Outlet (The Diplomat, Japan Times, etc.)
   - Excerpt
```

## ✅ Updating Writing Content After Deployment

### Option A: Manual Updates
```bash
# On your computer
cd /Users/f00421k/Documents/GitHub/personal-site
python3 fetch_authory.py
git add writing.json
git commit -m "Update writing"
git push
```

### Option B: Automatic Updates (GitHub Actions)
Create `.github/workflows/update-writing.yml`:

```yaml
name: Update Writing Daily
on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6am UTC
  workflow_dispatch:  # Manual trigger button

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.x'
      
      - name: Install feedparser
        run: pip install feedparser
      
      - name: Fetch latest articles
        run: python3 fetch_authory.py
      
      - name: Commit changes
        run: |
          git config user.name "GitHub Action"
          git config user.email "action@github.com"
          git add writing.json
          git diff --quiet && git diff --staged --quiet || git commit -m "Update writing content from Authory"
          git push
```

This will automatically update your writing content daily!

## ✅ Testing Checklist After Deployment

### Homepage
- [ ] Photo displays
- [ ] Affiliation cards show
- [ ] Links work
- [ ] Chatbot appears (bottom-right blue circle)

### Writing Page
- [ ] Articles load (not "Unable to load")
- [ ] All 20 articles display
- [ ] Clicking article titles opens in new tab
- [ ] Outlets display correctly

### Interactive Maps
- [ ] Collaboration map loads (collaboration.html)
- [ ] Visited universities map loads (collaboration.html)
- [ ] Places lived map loads (index.html)
- [ ] Markers appear with pulse animation
- [ ] Clicking markers shows popups
- [ ] Hover effects work on markers
- [ ] Maps are responsive on mobile

### Chatbot
- [ ] Blue circle button appears bottom-right
- [ ] Clicking opens panel
- [ ] Can type and send messages
- [ ] Try: "papers on discrimination" - should list publications
- [ ] Try: "teaching" - should describe courses
- [ ] Try: "contact" - should give email

### All Pages
- [ ] Navigation works
- [ ] Mobile menu works
- [ ] Footer links work
- [ ] No console errors (press F12, check Console tab)

## 🐛 Troubleshooting

### Chatbot not appearing
**Check:**
- View page source, search for `<script src="chatbot.js"></script>`
- Open browser console (F12), look for errors
- Verify `chatbot.js`, `publications.json`, `teaching.json` all uploaded

**Fix:**
- Make sure all three files are in the root directory
- Hard refresh: Cmd+Shift+R (Chrome) or Cmd+Option+R (Safari)

### Writing page shows "Unable to load articles"
**Check:**
- Verify `writing.json` exists in root directory
- Open browser console (F12), look for errors
- Try opening `https://yoursite.com/writing.json` directly

**Fix:**
- Ensure `writing.json` is uploaded
- Run `python3 fetch_authory.py` to regenerate
- Hard refresh the page

### Maps not loading or showing
**Check:**
- Verify CSV files exist in `data/` directory
- Check browser console for JavaScript errors
- Ensure Leaflet.js CSS and JS loaded from CDN
- Try opening `https://yoursite.com/data/collaboration_universities_coords_corrected.csv` directly

**Fix:**
- Make sure all CSV files are in `data/` folder
- Verify `maps.js` is uploaded to root directory
- Check that Leaflet CDN links are in HTML `<head>` and before `</body>`
- Hard refresh: Cmd+Shift+R (Chrome) or Cmd+Option+R (Safari)

### Articles are old/outdated
**Fix:**
```bash
python3 fetch_authory.py
git add writing.json
git commit -m "Update articles"
git push
```

## 📝 Regular Maintenance

**Weekly/Monthly:**
1. Update writing content: `python3 fetch_authory.py`
2. Check that chatbot still works
3. Test on mobile devices

**When you publish new articles:**
1. Run `python3 fetch_authory.py`
2. Commit and push changes
3. Changes appear in ~1-5 minutes (depending on host)

## 🎯 Quick Deploy Commands

**First time (GitHub Pages):**
```bash
cd /Users/f00421k/Documents/GitHub/personal-site
git init
git add .
git commit -m "Initial deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
# Then enable GitHub Pages in repository settings
```

**Updates:**
```bash
python3 fetch_authory.py  # Update writing
git add .
git commit -m "Update content"
git push
```

## ✨ You're Ready!

Everything is configured to work once deployed. The chatbot and Authory integrations are fully client-side and will work on any static hosting platform.
