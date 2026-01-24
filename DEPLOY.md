# Deploying Your Personal Website

Your site is a static website (HTML, CSS, JavaScript) that can be deployed to various platforms for free.

## Option 1: GitHub Pages (Recommended - Free & Easy)

### Setup Steps:

1. **Create a GitHub repository**
   ```bash
   cd /Users/f00421k/Documents/GitHub/personal-site
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub**
   ```bash
   # Create a new repo at github.com, then:
   git remote add origin https://github.com/YOUR_USERNAME/personal-site.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click "Settings" → "Pages"
   - Under "Source", select "main" branch
   - Click "Save"
   - Your site will be live at: `https://YOUR_USERNAME.github.io/personal-site/`

4. **Custom Domain (Optional)**
   - Buy a domain (e.g., charlescrabtree.com)
   - In GitHub Pages settings, add your custom domain
   - Update your domain's DNS settings to point to GitHub Pages

### Updating Your Site:
```bash
# Update writing content
python3 fetch_authory.py

# Commit and push changes
git add .
git commit -m "Update content"
git push
```

## Option 2: Netlify (Free, Automatic Deploys)

1. **Sign up at netlify.com**
2. **Deploy from GitHub**
   - Connect your GitHub account
   - Select your repository
   - Deploy settings:
     - Build command: (leave empty)
     - Publish directory: (leave as root)
3. **Your site will be live immediately**
   - Gets a free subdomain: `yoursite.netlify.app`
   - Can add custom domain

### Auto-update Writing Content:
Create `.github/workflows/update-writing.yml`:
```yaml
name: Update Writing
on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6am
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.x'
      - name: Install dependencies
        run: pip install feedparser
      - name: Fetch articles
        run: python3 fetch_authory.py
      - name: Commit changes
        run: |
          git config user.name "GitHub Action"
          git config user.email "action@github.com"
          git add writing.json
          git diff --quiet && git diff --staged --quiet || git commit -m "Update writing content"
          git push
```

## Option 3: Vercel (Free, Fast)

1. **Sign up at vercel.com**
2. **Import from GitHub**
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"
3. **Live immediately** at `yoursite.vercel.app`

## Option 4: Traditional Web Hosting

If you have traditional web hosting (Bluehost, DreamHost, etc.):

1. **Upload via FTP/SFTP**
   ```bash
   # All files in /Users/f00421k/Documents/GitHub/personal-site
   # Upload to your web host's public_html or www directory
   ```

2. **Files to upload:**
   - All `.html` files (index, research, publications, teaching, writing, collaboration, students)
   - `styles.css`
   - `script.js`
   - `chatbot.js`
   - `maps.js`
   - `writing.json`
   - `publications.json`
   - `teaching.json`
   - `me-square.jpg`
   - `images/` folder (if you have one)
   - `data/` folder with all CSV files:
     - `collaboration_universities_coords_corrected.csv`
     - `visited_universities_coords.csv`
     - `places_lived_coords.csv`

## Recommended: GitHub Pages

**Why?**
- ✅ Free forever
- ✅ Custom domain support
- ✅ HTTPS included
- ✅ Version control built-in
- ✅ Easy updates (just push to GitHub)
- ✅ Can automate content updates with GitHub Actions

## After Deployment

1. **Test your site** thoroughly:
   - Check that chatbot appears (bottom-right corner)
   - Verify writing page loads articles
   - Confirm all 3 maps load with black markers:
     - Collaboration map (collaboration.html)
     - Visited universities map (collaboration.html)
     - Places lived map (index.html)
   - Test on mobile devices

2. **Update writing content** regularly:
   ```bash
   python3 fetch_authory.py
   git add writing.json
   git commit -m "Update writing"
   git push
   ```

3. **Add new map locations** as needed:
   - Edit CSV files in `data/` directory
   - Commit and push changes

4. **Monitor**: Check Google Search Console for SEO

## Need Help?

- GitHub Pages: https://pages.github.com/
- Netlify: https://docs.netlify.com/
- Vercel: https://vercel.com/docs
