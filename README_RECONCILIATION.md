# Research Papers Reconciliation Script

This script reconciles your LaTeX CV (`working-papers.tex`) with your HTML research page (`research.html`) to identify discrepancies.

## Usage

Run the script from anywhere:

```bash
python3 /Users/f00421k/Documents/GitHub/personal-site/reconcile_research.py
```

Or from the personal-site directory:

```bash
./reconcile_research.py
```

## Output

The script generates `reconciliation_report.md` which includes:

1. **Summary statistics** - Quick overview of matched/unmatched papers
2. **Papers in LaTeX but missing from HTML** - Papers you need to add to your website
3. **Papers in HTML but missing from LaTeX** - Papers that might need updating in your CV
4. **Potential duplicates** - Papers that appear multiple times (with similarity scores)
5. **Section mapping analysis** - Shows how LaTeX sections map to HTML sections

## What to Look For

### Key Metrics

- **Papers in both sources**: Should be most of your papers
- **Papers in LaTeX only**: New papers in your CV that need to be added to HTML
- **Papers in HTML only**: Either old papers or parsing issues
- **Potential duplicates**: Papers listed multiple times (check for actual duplicates vs. parsing issues)

### Section Mappings

The report shows how papers move between sections:
- `Manuscripts Under Review` → `Under Review` (direct mapping)
- `Select Working Papers and Projects` → `Works in Progress` (direct mapping)
- `Books in Progress` → typically goes to HTML but not currently listed
- `Schrödinger's Manuscripts` → special category, may need manual handling

## Current Known Issues

1. **Title parsing**: The regex sometimes truncates titles at periods in author names (e.g., "S. Michael Gaddis")
2. **Author name variations**: Small differences in formatting can affect matching
3. **Student markers**: The `$^{*}$` notation in LaTeX is removed but may affect matching

## Automated Usage

You can automate this check by:

### 1. Cron Job (Run Daily)

Add to your crontab (`crontab -e`):

```bash
# Run reconciliation check daily at 9 AM
0 9 * * * /usr/bin/python3 /Users/f00421k/Documents/GitHub/personal-site/reconcile_research.py > /tmp/reconcile.log 2>&1
```

### 2. Git Pre-commit Hook

Create `.git/hooks/pre-commit` in your personal-site repo:

```bash
#!/bin/bash
python3 /Users/f00421k/Documents/GitHub/personal-site/reconcile_research.py
if [ $? -ne 0 ]; then
    echo "Reconciliation check failed!"
    exit 1
fi
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

### 3. Manual Reminder

Simply run it whenever you update your CV:

```bash
cd /Users/f00421k/Documents/GitHub/personal-site
./reconcile_research.py
open reconciliation_report.md
```

## Interpreting Results

### Good Signs
- High match rate (>80% of papers in both sources)
- Few duplicates
- Clear section mappings

### Red Flags
- Many papers in LaTeX only → Website is outdated
- Many papers in HTML only → Possible parsing errors or removed papers
- Many duplicates in HTML → Check for copy-paste errors in HTML

## Customization

Edit the script to:
- Adjust `similarity_threshold` (default: 0.85) in the `Reconciler` class
- Add new sections to parse
- Change output format
- Add auto-update functionality

## Files

- `reconcile_research.py` - Main script
- `reconciliation_report.md` - Generated report (regenerated each run)
- Source files:
  - `/Users/f00421k/Dropbox/cv/working-papers.tex`
  - `/Users/f00421k/Documents/GitHub/personal-site/research.html`
