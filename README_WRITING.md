# Updating Public Writing Content

This site's Writing page dynamically loads articles from `writing.json`, which can be automatically updated from your Authory RSS feed.

## Quick Update

To refresh the writing content from Authory:

```bash
python3 fetch_authory.py
```

This will:
1. Fetch your latest articles from Authory RSS feed
2. Parse article titles, URLs, dates, outlets, and excerpts  
3. Save them to `writing.json`
4. The website will automatically display them on the Writing page

## Manual Updates

If you prefer to manually curate articles or the RSS feed isn't working, edit `writing.json` directly:

```json
{
  "updated": "2025-01-18T04:00:00",
  "articles": [
    {
      "title": "Article Title",
      "url": "https://outlet.com/article",
      "date": "2024",
      "outlet": "Publication Name",
      "excerpt": "Brief description of the article content...",
      "tags": ["Tag1", "Tag2"]
    }
  ]
}
```

## Automation

You can set up automatic updates using a cron job or GitHub Actions:

### Cron Job (runs daily at 6am)
```bash
0 6 * * * cd /path/to/personal-site && python3 fetch_authory.py
```

### GitHub Actions
Create `.github/workflows/update-writing.yml`:

```yaml
name: Update Writing Content
on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6am UTC
  workflow_dispatch:  # Manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.x'
      - name: Install dependencies
        run: pip install feedparser
      - name: Fetch articles
        run: python3 fetch_authory.py
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add writing.json
          git diff --quiet && git diff --staged --quiet || git commit -m "Update writing content from Authory"
          git push
```

## Troubleshooting

**Problem:** RSS feed not parsing  
**Solution:** The script includes fallback content. You can also manually edit `writing.json`

**Problem:** Articles not showing on website  
**Solution:** Check browser console for errors. Ensure `writing.json` is in the same directory as `writing.html`

**Problem:** Need to add more outlet detection  
**Solution:** Edit the `fetch_authory.py` script and add more URL patterns in the outlet detection section (lines 40-62)
