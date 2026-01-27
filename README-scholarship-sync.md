# Automated Public Scholarship Sync

This system automatically extracts the 5 most recent public scholarship entries from your CV and displays them in a collapsible section on the media page.

## Components

1. **`update_recent_scholarship.py`** - Python script that:
   - Parses `/Users/f00421k/Dropbox/cv/c_crabtree_cv.tex`
   - Extracts the last 5 entries from "Select Essays, Opinion Editorials, and Public Scholarship"
   - Converts LaTeX to HTML
   - Updates `media.html` with a collapsible "Recent Public Scholarship" section
   - Commits and pushes changes to GitHub

2. **`org.charlescrabtree.scholarship-update.plist`** - LaunchAgent that runs the script daily at 9:00 AM

## Usage

### Manual Run
```bash
cd /Users/f00421k/Documents/GitHub/personal-site
python3 update_recent_scholarship.py
```

### Check Scheduled Job Status
```bash
launchctl list | grep scholarship
```

### View Logs
```bash
# Standard output
tail -f ~/Library/Logs/scholarship-update.log

# Errors
tail -f ~/Library/Logs/scholarship-update-error.log
```

### Stop/Start Scheduled Job
```bash
# Stop
launchctl unload ~/Library/LaunchAgents/org.charlescrabtree.scholarship-update.plist

# Start
launchctl load ~/Library/LaunchAgents/org.charlescrabtree.scholarship-update.plist
```

## How It Works

1. Every day at 9 AM, the script runs automatically
2. It reads your CV and extracts the 5 most recent public scholarship entries
3. Converts LaTeX formatting to clean HTML links
4. Updates the media page with a collapsible `<details>` section
5. If changes are detected, commits with message "Update recent public scholarship from CV"
6. Pushes to GitHub automatically

## Maintenance

The script is idempotent - running it multiple times without CV changes won't create duplicate commits. It only commits and pushes when the extracted content differs from what's on the media page.

If you need to change the number of entries displayed, edit line 196 in `update_recent_scholarship.py`:
```python
entries = extract_public_scholarship(CV_PATH, num_entries=5)  # Change 5 to desired number
```

## Troubleshooting

If entries aren't updating:
1. Check the logs for errors
2. Verify the CV path is correct: `/Users/f00421k/Dropbox/cv/c_crabtree_cv.tex`
3. Ensure the "Select Essays, Opinion Editorials, and Public Scholarship" section exists in the CV
4. Run manually to see detailed output
