#!/usr/bin/env python3
"""
Extract recent public scholarship from CV and update media page.
Runs daily to keep website in sync with CV.
"""

import json
import re
import subprocess
from pathlib import Path
from datetime import datetime


CV_PATH = Path("/Users/f00421k/Dropbox/cv/c_crabtree_cv.tex")
MEDIA_PAGE = Path("/Users/f00421k/Documents/GitHub/personal-site/media.html")
UPDATES_JSON = Path("/Users/f00421k/Documents/GitHub/personal-site/updates.json")
REPO_PATH = Path("/Users/f00421k/Documents/GitHub/personal-site")


def extract_public_scholarship(cv_path, num_entries=5):
    """Extract the last N entries from the public scholarship section."""
    with open(cv_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the public scholarship section
    pattern = r'\\subsection\*\{Public Scholarship and Commentary\}.*?\\begin\{etaremune\}\[start=\d+\](.*?)\\end\{etaremune\}'
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        raise ValueError("Could not find public scholarship section in CV")
    
    section_content = match.group(1)
    
    # Extract individual items
    items = re.findall(r'\\item\s+(.*?)(?=\\item|\Z)', section_content, re.DOTALL)
    
    # Take the first N items (they're in reverse chronological order in the CV)
    recent_items = items[:num_entries]
    
    return recent_items


def parse_latex_entry(entry):
    """Parse a LaTeX entry into structured data."""
    # Clean up the entry
    entry = entry.strip()
    
    # Extract authors and date
    # Pattern: Authors. Date. ``\href{URL}{Title}.'' \textit{Outlet}.
    author_date_pattern = r'^(.*?)\.\s+([A-Z][a-z]+\s+\d+,\s+\d{4})\.'
    author_date_match = re.search(author_date_pattern, entry)
    
    if not author_date_match:
        return None
    
    authors = author_date_match.group(1)
    date = author_date_match.group(2)
    
    # Clean up authors (remove LaTeX formatting)
    authors = re.sub(r'\{\\bf\s+(.*?)\}', r'\1', authors)  # Remove bold
    authors = re.sub(r'\$\^\{\*\}\$', '', authors)  # Remove asterisk
    authors = re.sub(r'\\ldots', '...', authors)
    
    # Extract URL and title - handle both \href{url}{title} and malformed {url}{title}
    href_pattern = r'\\?href\{([^}]+)\}\{([^}]+)\}'
    href_match = re.search(href_pattern, entry)
    
    # Also try pattern without href for malformed entries like ``{url}{title}''
    if not href_match:
        alt_pattern = r"``\{([^}]+)\}\{([^}]+)\}''"
        href_match = re.search(alt_pattern, entry)
    
    if not href_match:
        return None
    
    url = href_match.group(1)
    title = href_match.group(2)
    
    # Clean title - remove trailing period if present
    title = title.rstrip('.')
    
    # Extract outlet - look for \textit{} after the title
    # First, find all textit patterns and take the last one (usually the outlet)
    outlet_matches = re.findall(r'\\textit\{([^}]+)\}', entry)
    if outlet_matches:
        outlet = outlet_matches[-1]  # Last textit is usually the outlet
    else:
        outlet = "Unknown"
    
    return {
        'authors': authors,
        'date': date,
        'url': url,
        'title': title,
        'outlet': outlet
    }


def extract_recent_publications(cv_path, num_entries=3):
    """Extract the most recent publications from the Forthcoming and latest year sections."""
    with open(cv_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find journal articles section
    section_pattern = r'\\subsection\*\{Journal Articles\}(.*?)(?=\\subsection\*|\\section\*|\Z)'
    section_match = re.search(section_pattern, content, re.DOTALL)
    if not section_match:
        return []

    section = section_match.group(1)

    # Extract all items across all subsections
    items = re.findall(r'\\item\s+(.*?)(?=\\item|\\end\{etaremune\})', section, re.DOTALL)

    results = []
    for item in items:
        item = item.strip()
        if not item or '\\dotind' == item[:7]:
            continue

        # Extract href URL and title
        href_match = re.search(r'\\href\{([^}]+)\}\{([^}]+)\}', item)
        # Extract journal from \textit{}
        journal_matches = re.findall(r'\\textit\{([^}]+)\}', item)
        # Filter out IF entries and common non-journal textit
        journals = [j for j in journal_matches if not j.startswith('IF:') and not j.startswith('In progress')]

        title = None
        url = None
        if href_match:
            url = href_match.group(1)
            title = href_match.group(2).rstrip('.')
        else:
            # Try to extract title from ``...'' pattern
            title_match = re.search(r"``([^']+)''", item)
            if title_match:
                title = title_match.group(1).rstrip('.')

        if not title:
            continue

        # Determine status
        status = 'Published'
        if 'Conditionally accepted' in item:
            status = 'Forthcoming'
        elif 'Forthcoming' in item or 'forthcoming' in item:
            status = 'Forthcoming'

        journal = journals[0] if journals else 'Unknown'

        results.append({
            'title': title,
            'url': url,
            'journal': journal,
            'status': status
        })

        if len(results) >= num_entries:
            break

    return results


def generate_updates_json(publications, media_entries):
    """Generate updates.json combining latest publications and media."""
    media_items = []
    for entry in media_entries[:3]:
        parsed = parse_latex_entry(entry)
        if parsed:
            media_items.append({
                'title': parsed['title'],
                'url': parsed['url'],
                'outlet': parsed['outlet'],
                'date': parsed['date']
            })

    data = {
        'publications': publications,
        'media': media_items,
        'generated': datetime.now().isoformat()
    }

    with open(UPDATES_JSON, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Generated updates.json with {len(publications)} publications and {len(media_items)} media pieces")


def generate_html(entries):
    """Generate HTML for the collapsible section."""
    html_items = []
    
    for i, entry in enumerate(entries, 1):
        parsed = parse_latex_entry(entry)
        if not parsed:
            continue
        
        # Format: numbered paragraph with link, outlet, and date
        html = f'<p>{i}. <a href="{parsed["url"]}" target="_blank">{parsed["title"]}</a>. <em>{parsed["outlet"]}</em> ({parsed["date"]})</p>'
        html_items.append(html)
    
    if not html_items:
        return ""
    
    items_html = '\n'.join(html_items)
    count = len(html_items)
    
    collapsible_html = f"""

<div class="year-section">
    <div class="year-header">
        <div class="year-header-content">
            <h3 class="year-title">Recent Public Scholarship</h3>
            <span class="year-count">({count} recent {'piece' if count == 1 else 'pieces'})</span>
        </div>
        <span class="year-toggle">▼</span>
    </div>
    <div class="year-content">
        <div class="year-content-inner">
{items_html}
        </div>
    </div>
</div>"""
    
    return collapsible_html


def update_media_page(html_content):
    """Update the media page with the new scholarship section."""
    with open(MEDIA_PAGE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Use CV-SYNC markers if present
    sync_pattern = r'<!-- CV-SYNC:media-scholarship START -->.*?<!-- CV-SYNC:media-scholarship END -->'
    sync_match = re.search(sync_pattern, content, re.DOTALL)
    
    if sync_match:
        replacement = f'<!-- CV-SYNC:media-scholarship START -->\n{html_content.strip()}\n<!-- CV-SYNC:media-scholarship END -->'
        new_content = content[:sync_match.start()] + replacement + content[sync_match.end():]
    else:
        # Fallback: insert after the Public Writing paragraph
        insertion_pattern = r'(<p>I write for general audiences.*?<em>Times Higher Education</em>\.</p>)'
        match = re.search(insertion_pattern, content, re.DOTALL)
        if not match:
            raise ValueError("Could not find insertion point in media.html")
        wrapped = f'\n<!-- CV-SYNC:media-scholarship START -->\n{html_content.strip()}\n<!-- CV-SYNC:media-scholarship END -->'
        new_content = content.replace(match.group(1), match.group(1) + wrapped)
    
    # Check if content actually changed
    if new_content == content:
        return False
    
    with open(MEDIA_PAGE, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return True


def git_commit_and_push():
    """Commit and push changes to GitHub."""
    try:
        # Change to repo directory
        subprocess.run(['git', 'add', 'media.html', 'updates.json'], cwd=REPO_PATH, check=True)
        
        # Check if there are changes to commit
        result = subprocess.run(
            ['git', 'diff', '--cached', '--quiet'],
            cwd=REPO_PATH,
            capture_output=True
        )
        
        if result.returncode == 0:
            # No changes
            print("No changes to commit")
            return False
        
        # Commit with message
        commit_message = f"Update recent public scholarship from CV\n\nCo-Authored-By: Warp <agent@warp.dev>"
        subprocess.run(
            ['git', 'commit', '-m', commit_message],
            cwd=REPO_PATH,
            check=True
        )
        
        # Push to GitHub
        subprocess.run(['git', 'push', 'origin', 'main'], cwd=REPO_PATH, check=True)
        
        print("Successfully committed and pushed changes")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"Git operation failed: {e}")
        return False


def main():
    """Main execution function."""
    try:
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Starting scholarship update...")
        
        # Extract entries from CV
        print("Extracting public scholarship from CV...")
        entries = extract_public_scholarship(CV_PATH, num_entries=10)
        print(f"Found {len(entries)} recent entries")
        
        # Generate HTML
        print("Generating HTML...")
        html = generate_html(entries)
        
        if not html:
            print("No valid entries found")
            return
        
        # Extract recent publications for updates.json
        print("Extracting recent publications...")
        publications = extract_recent_publications(CV_PATH, num_entries=3)
        print(f"Found {len(publications)} recent publications")

        # Generate updates.json
        print("Generating updates.json...")
        generate_updates_json(publications, entries)

        # Update media page
        print("Updating media.html...")
        changed = update_media_page(html)
        
        if not changed:
            print("No changes needed - media page already up to date")
        else:
            print("Media page updated")
        
        # Commit and push
        print("Committing and pushing to GitHub...")
        git_commit_and_push()
        
        print("Update complete!")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
