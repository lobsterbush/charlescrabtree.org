# Automated Public Scholarship Sync

This system automatically extracts the 5 most recent public scholarship entries from your CV and displays them on the media page.

## Components

1. **`update_recent_scholarship.py`** - Python script that:
   - Parses `/Users/f00421k/Dropbox/cv/c_crabtree_cv.tex`
   - Extracts the last 5 entries from "Select Essays, Opinion Editorials, and Public Scholarship"
   - Converts LaTeX to HTML (handles `\href`, `\textit`, author formatting)
   - Updates `media.html` with a collapsible "Recent Public Scholarship" section
   - Commits and pushes changes to GitHub

2. **`com.crabtree.update-scholarship.plist`** - LaunchAgent that watches the CV file and triggers updates on save

## Installation

```bash
# Copy the launch agent
cp /Users/f00421k/Documents/GitHub/personal-site/com.crabtree.update-scholarship.plist ~/Library/LaunchAgents/

# Load it
launchctl load ~/Library/LaunchAgents/com.crabtree.update-scholarship.plist
```

## Usage

### Manual Run
```bash
python3 /Users/f00421k/Documents/GitHub/personal-site/update_recent_scholarship.py
```

### Check Scheduled Job Status
```bash
launchctl list | grep crabtree
```

### View Logs
```bash
# Standard output
tail -f /Users/f00421k/Documents/GitHub/personal-site/logs/scholarship-update.log

# Errors
tail -f /Users/f00421k/Documents/GitHub/personal-site/logs/scholarship-update-error.log
```

### Stop/Start File Watcher
```bash
# Stop
launchctl unload ~/Library/LaunchAgents/com.crabtree.update-scholarship.plist

# Start
launchctl load ~/Library/LaunchAgents/com.crabtree.update-scholarship.plist
```

## How It Works

1. The LaunchAgent watches `/Users/f00421k/Dropbox/cv/c_crabtree_cv.tex`
2. When you save the CV file, the script runs automatically
3. It extracts the 5 most recent public scholarship entries
4. Converts LaTeX formatting to HTML with proper links and outlet names
5. Updates the media page's "Recent Public Scholarship" collapsible section
6. If changes are detected, commits and pushes to GitHub

## Maintenance

The script is idempotent - running it multiple times without CV changes won't create duplicate commits.

To change the number of entries displayed, edit `update_recent_scholarship.py`:
```python
entries = extract_public_scholarship(CV_PATH, num_entries=5)  # Change 5 to desired number
```

## Troubleshooting

If entries aren't updating:
1. Check the logs in `/Users/f00421k/Documents/GitHub/personal-site/logs/`
2. Verify the CV path is correct: `/Users/f00421k/Dropbox/cv/c_crabtree_cv.tex`
3. Ensure the "Select Essays, Opinion Editorials, and Public Scholarship" section exists in the CV
4. Run manually to see detailed output
