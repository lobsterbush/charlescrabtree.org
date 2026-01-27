#!/usr/bin/env python3
"""
Extract recent public scholarship from CV and update media page.
Runs daily to keep website in sync with CV.
"""

import re
import subprocess
from pathlib import Path
from datetime import datetime


CV_PATH = Path("/Users/f00421k/Dropbox/cv/c_crabtree_cv.tex")
MEDIA_PAGE = Path("/Users/f00421k/Documents/GitHub/personal-site/media.html")
REPO_PATH = Path("/Users/f00421k/Documents/GitHub/personal-site")


def extract_public_scholarship(cv_path, num_entries=5):
    """Extract the last N entries from the public scholarship section."""
    with open(cv_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the public scholarship section
    pattern = r'\\subsection\*\{Select Essays, Opinion Editorials, and Public Scholarship\}.*?\\begin\{etaremune\}\[start=\d+\](.*?)\\end\{etaremune\}'
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
    
    # Extract URL and title
    href_pattern = r'\\href\{([^}]+)\}\{([^}]+)\}'
    href_match = re.search(href_pattern, entry)
    
    if not href_match:
        return None
    
    url = href_match.group(1)
    title = href_match.group(2)
    
    # Extract outlet
    outlet_pattern = r'\\textit\{([^}]+)\}'
    outlet_match = re.search(outlet_pattern, entry)
    outlet = outlet_match.group(1) if outlet_match else "Unknown"
    
    return {
        'authors': authors,
        'date': date,
        'url': url,
        'title': title,
        'outlet': outlet
    }


def generate_html(entries):
    """Generate HTML for the collapsible section."""
    html_items = []
    
    for entry in entries:
        parsed = parse_latex_entry(entry)
        if not parsed:
            continue
        
        # Format: "Title" - Outlet (Date)
        html = f'<li><a href="{parsed["url"]}" target="_blank">{parsed["title"]}</a> - <em>{parsed["outlet"]}</em> ({parsed["date"]})</li>'
        html_items.append(html)
    
    if not html_items:
        return ""
    
    items_html = '\n                    '.join(html_items)
    
    collapsible_html = f"""
                <details style="margin-top: 1.5rem;">
                    <summary style="cursor: pointer; font-weight: 600; color: var(--text-primary); margin-bottom: 0.75rem;">Recent Public Scholarship</summary>
                    <ul class="pub-list" style="margin-top: 0.75rem;">
                    {items_html}
                    </ul>
                </details>"""
    
    return collapsible_html


def update_media_page(html_content):
    """Update the media page with the new scholarship section."""
    with open(MEDIA_PAGE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the insertion point (after the Public Writing paragraph)
    # Look for the paragraph that ends with "Times Higher Education</em>."
    insertion_pattern = r'(<p>I write for general audiences.*?<em>Times Higher Education</em>\.</p>)'
    
    match = re.search(insertion_pattern, content, re.DOTALL)
    if not match:
        raise ValueError("Could not find insertion point in media.html")
    
    # Remove any existing scholarship section first
    content = re.sub(
        r'\s*<details[^>]*>.*?<summary[^>]*>Recent Public Scholarship</summary>.*?</details>',
        '',
        content,
        flags=re.DOTALL
    )
    
    # Insert the new content after the Public Writing paragraph
    new_content = content.replace(
        match.group(1),
        match.group(1) + html_content
    )
    
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
        subprocess.run(['git', 'add', 'media.html'], cwd=REPO_PATH, check=True)
        
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
        entries = extract_public_scholarship(CV_PATH, num_entries=5)
        print(f"Found {len(entries)} recent entries")
        
        # Generate HTML
        print("Generating HTML...")
        html = generate_html(entries)
        
        if not html:
            print("No valid entries found")
            return
        
        # Update media page
        print("Updating media.html...")
        changed = update_media_page(html)
        
        if not changed:
            print("No changes needed - media page already up to date")
            return
        
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
