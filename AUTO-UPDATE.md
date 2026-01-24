# Automatic Content Updates

Your site is configured to automatically update content from external sources.

## 📝 What Gets Updated Automatically

### Writing Content (from Authory RSS)
- **Source:** https://authory.com/cdcrabtree/rss
- **File:** `writing.json`
- **Schedule:** Daily at 6am UTC (10pm PST / 1am EST)
- **Workflow:** `.github/workflows/update-writing.yml`

## 🔧 How It Works

When you push your site to GitHub:

1. **GitHub Actions** runs the workflow daily
2. It executes `fetch_authory.py` to pull your latest articles
3. If new articles are found, it updates `writing.json`
4. Changes are automatically committed and pushed
5. Your hosting platform (GitHub Pages/Netlify/Vercel) redeploys automatically

## ✅ Setup Instructions

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit with auto-update workflow"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Enable GitHub Actions (if needed)
- Go to your repository on GitHub
- Click **Settings** → **Actions** → **General**
- Under "Workflow permissions", select **Read and write permissions**
- Click **Save**

### 3. Test Manual Trigger
- Go to **Actions** tab in your GitHub repo
- Click **Update Writing Content**
- Click **Run workflow** → **Run workflow**
- Watch it run (takes ~30 seconds)
- Check the **Code** tab to see if `writing.json` was updated

## 📊 Monitoring Updates

### View Update History
- Go to **Actions** tab in your repo
- Click **Update Writing Content**
- See all past runs (successes, failures, timing)

### Check Latest Run
```bash
# View commit history to see auto-updates
git log --oneline --grep="Auto-update"
```

### Manual Update (when needed)
```bash
# Run locally and push
python3 fetch_authory.py
git add writing.json
git commit -m "Manual update: writing content"
git push
```

Or click **Run workflow** in the Actions tab.

## 🔄 Update Frequency

**Current:** Daily at 6am UTC

**To change frequency**, edit `.github/workflows/update-writing.yml`:

```yaml
on:
  schedule:
    - cron: '0 */12 * * *'  # Every 12 hours
    # or
    - cron: '0 6 * * 1'     # Weekly on Mondays
    # or
    - cron: '0 6 1 * *'     # Monthly on the 1st
```

[Cron schedule reference](https://crontab.guru/)

## 🎯 Adding More Auto-Updates

### Example: Auto-update publications from Crossref

Create `.github/workflows/update-publications.yml`:

```yaml
name: Update Publications

on:
  schedule:
    - cron: '0 6 1 * *'  # Monthly
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.x'
      
      - name: Install dependencies
        run: pip install requests
      
      - name: Update publications
        run: python3 fetch_publications.py
      
      - name: Commit changes
        run: |
          git config user.name "GitHub Action"
          git config user.email "action@github.com"
          git add publications.json
          git diff --staged --quiet || git commit -m "Auto-update: Publications"
          git push
```

Then create `fetch_publications.py` to fetch from Crossref API.

## 🐛 Troubleshooting

### Workflow not running
**Check:**
- Is the repo on GitHub?
- Are GitHub Actions enabled?
- Does the workflow file have correct YAML syntax?

**Fix:**
```bash
# Validate YAML syntax
cat .github/workflows/update-writing.yml

# Test locally first
python3 fetch_authory.py
```

### Permission denied when pushing
**Fix:**
1. Go to repo **Settings** → **Actions** → **General**
2. Under "Workflow permissions", select **Read and write permissions**
3. Click **Save**

### Workflow fails
**Check the logs:**
1. Go to **Actions** tab
2. Click the failed run
3. Click on the job to see error details

**Common issues:**
- Missing `feedparser`: Fixed by `pip install feedparser` step
- RSS feed down: Temporary - will work on next run
- Git push fails: Check workflow permissions

## ℹ️ Manual Control

You can always:
- **Disable auto-updates:** Delete `.github/workflows/update-writing.yml`
- **Pause temporarily:** In Actions tab, click workflow → **...** → **Disable workflow**
- **Update manually:** Just run `python3 fetch_authory.py` and push

## 🚀 Benefits

1. **Always fresh:** Your writing page shows latest articles without manual updates
2. **Zero maintenance:** Set it and forget it
3. **Full history:** Git tracks every update
4. **Easy rollback:** `git revert` if something goes wrong
5. **Manual override:** Can still update manually anytime
