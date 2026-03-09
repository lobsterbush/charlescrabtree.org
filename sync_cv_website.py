#!/usr/bin/env python3
"""
Sync CV (LaTeX) to personal website HTML pages.

Parses c_crabtree_cv.tex and working-papers.tex, then updates marked regions
in publications.html, research.html, and media.html. Designed to run hourly
via launchd.

Usage:
    python3 sync_cv_website.py            # full sync + git push
    python3 sync_cv_website.py --dry-run  # preview changes only
"""

import argparse
import logging
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

CV_PATH = Path("/Users/f00421k/Dropbox/cv/c_crabtree_cv.tex")
WORKING_PAPERS_PATH = Path("/Users/f00421k/Dropbox/cv/working-papers.tex")
REPO_PATH = Path("/Users/f00421k/Documents/GitHub/personal-site")

PUBLICATIONS_HTML = REPO_PATH / "publications.html"
RESEARCH_HTML = REPO_PATH / "research.html"
MEDIA_HTML = REPO_PATH / "media.html"

BACKUP_DIR = Path("/tmp/cv-sync-backup")
LOG_PATH = Path.home() / "Library" / "Logs" / "cv-sync.log"

MEDIA_SCHOLARSHIP_COUNT = 10

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

LOG_PATH.parent.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_PATH),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# LaTeX helpers
# ---------------------------------------------------------------------------


def read_cv() -> str:
    """Read the CV and inline \\input{working-papers}."""
    content = CV_PATH.read_text(encoding="utf-8")
    if WORKING_PAPERS_PATH.exists():
        wp = WORKING_PAPERS_PATH.read_text(encoding="utf-8")
        content = content.replace(r"\input{working-papers}", wp)
    return content


def extract_items(block: str) -> list[str]:
    """Split an etaremune block into individual \\item texts."""
    # Strip \end{etaremune} so it doesn't leak into the last item
    block = re.sub(r"\\end\{etaremune\}", "", block)
    # Remove full-line LaTeX comments (lines starting with %)
    block = re.sub(r"(?m)^%.*$", "", block)
    items = re.split(r"\\item\s+", block)
    # First element is preamble before the first \item
    return [i.strip() for i in items[1:] if i.strip()]


def latex_to_html(text: str) -> str:
    """Convert common LaTeX markup to HTML."""
    # Remove line-continuation comments  \\  %*  etc
    text = re.sub(r"\\\\\s*%\*?", "", text)
    # Remove \dotind lines (award notes etc.)
    text = re.sub(r"\\dotind\s+.*", "", text)
    # Remove \\  line breaks
    text = re.sub(r"\\\\", "", text)
    # Bold author:  {\bf Name} -> <strong>Name</strong>
    text = re.sub(r"\{\\bf\s+([^}]+)\}", r"<strong>\1</strong>", text)
    # Italic:  \textit{X} -> <em>X</em>
    text = re.sub(r"\\textit\{([^}]+)\}", r"<em>\1</em>", text)
    # Monospace:  \texttt{X} -> <code>X</code>
    text = re.sub(r"\\texttt\{([^}]+)\}", r"<code>\1</code>", text)
    # Hyperlinks:  \href{url}{text} -> <a href="url" target="_blank">text</a>
    text = re.sub(
        r"\\href\{([^}]+)\}\{([^}]+)\}",
        r'<a href="\1" target="_blank">\2</a>',
        text,
    )
    # Malformed href (missing \href prefix):  ``{url}{title}''
    text = re.sub(
        r"[`\u201c]*\{(https?://[^}]+)\}\{([^}]+)\}['\u201d]*",
        r'<a href="\1" target="_blank">\2</a>',
        text,
    )
    # Student marker:  $^{*}$  -> *
    text = re.sub(r"\$\^\{\*\}\$", "*", text)
    # Ellipsis
    text = text.replace(r"\ldots", "…")
    # En-dash
    text = text.replace("--", "–")
    # Approx
    text = re.sub(r"\$\\approx\$", "≈", text)
    # LaTeX quotes  `` '' -> " "
    text = re.sub(r"``", "\u201c", text)
    text = re.sub(r"''", "\u201d", text)
    # \& -> &
    text = text.replace(r"\&", "&amp;")
    # Remaining braces
    text = text.replace("{", "").replace("}", "")
    # Footnote-style annotations  $^*$ {\footnotesize ...}
    text = re.sub(r"\$\^\*\$\s*\\footnotesize\s+.*", "", text)
    # Clean up multiple spaces
    text = re.sub(r"  +", " ", text)
    return text.strip()


# ---------------------------------------------------------------------------
# Section extractors
# ---------------------------------------------------------------------------


def extract_journal_articles_by_year(cv: str) -> dict[str, list[str]]:
    """Return {year_label: [html_item, ...]} for journal articles."""
    # Find the Journal Articles section
    sec_match = re.search(
        r"\\subsection\*\{Journal Articles\}(.*?)(?=\\subsection\*\{|\\section\*\{)",
        cv,
        re.DOTALL,
    )
    if not sec_match:
        log.error("Could not find Journal Articles section")
        return {}

    section = sec_match.group(1)
    year_groups: dict[str, list[str]] = {}

    # Split by \subsubsection*{Year}
    parts = re.split(r"\\subsubsection\*\{([^}]+)\}", section)
    # parts[0] is preamble, then alternating: year_label, content
    for i in range(1, len(parts), 2):
        year_label = parts[i].strip()
        block = parts[i + 1] if i + 1 < len(parts) else ""
        # Extract etaremune block
        eta_match = re.search(
            r"\\begin\{etaremune\}.*?(\\item.*?)\\end\{etaremune\}",
            block,
            re.DOTALL,
        )
        if not eta_match:
            continue
        items = extract_items(eta_match.group(0))
        year_groups[year_label] = [latex_to_html(it) for it in items]

    return year_groups


def extract_other_publications(cv: str) -> dict[str, list[str]]:
    """Extract non-journal publication sections (Japanese, Law, Book Chapters, etc.)."""
    sections: dict[str, list[str]] = {}

    patterns = [
        ("Japanese Journal Article", r"\\subsection\*\{Japanese Journal Article\}"),
        ("Law Review Article", r"\\subsection\*\{Law Review Article\}"),
        ("Book Chapters", r"\\subsection\*\{Book Chapters\}"),
        ("Other Publications", r"\\subsection\*\{Other Publications\}"),
        ("Edited Volumes & Symposia", r"\\subsection\*\{Edited Volumes and Symposia\}"),
    ]

    for label, pattern in patterns:
        match = re.search(
            pattern + r"(.*?)(?=\\subsection\*\{|\\section\*\{)",
            cv,
            re.DOTALL,
        )
        if not match:
            continue
        block = match.group(1)
        eta_match = re.search(
            r"\\begin\{etaremune\}.*?(\\item.*?)\\end\{etaremune\}",
            block,
            re.DOTALL,
        )
        if not eta_match:
            continue
        items = extract_items(eta_match.group(0))
        sections[label] = [latex_to_html(it) for it in items]

    return sections


def extract_revisions_requested(cv: str) -> list[str]:
    """Extract R&R papers."""
    match = re.search(
        r"\\subsection\*\{Revisions Requested\}(.*?)(?=\\subsection\*\{|\\section\*\{)",
        cv,
        re.DOTALL,
    )
    if not match:
        return []
    block = match.group(1)
    eta_match = re.search(
        r"\\begin\{etaremune\}.*?(\\item.*?)\\end\{etaremune\}",
        block,
        re.DOTALL,
    )
    if not eta_match:
        return []
    return [latex_to_html(it) for it in extract_items(eta_match.group(0))]


def extract_under_review(cv: str) -> list[str]:
    """Extract manuscripts under review."""
    match = re.search(
        r"\\subsection\*\{Manuscripts Under Review\}(.*?)(?=\\subsection\*\{|\\section\*\{)",
        cv,
        re.DOTALL,
    )
    if not match:
        return []
    block = match.group(1)
    eta_match = re.search(
        r"\\begin\{etaremune\}.*?(\\item.*?)\\end\{etaremune\}",
        block,
        re.DOTALL,
    )
    if not eta_match:
        return []
    return [latex_to_html(it) for it in extract_items(eta_match.group(0))]


def extract_books_in_progress(cv: str) -> list[str]:
    """Extract books in progress."""
    match = re.search(
        r"\\subsection\*\{Books in Progress\}(.*?)(?=\\subsection\*\{|\\section\*\{)",
        cv,
        re.DOTALL,
    )
    if not match:
        return []
    block = match.group(1)
    eta_match = re.search(
        r"\\begin\{etaremune\}.*?(\\item.*?)\\end\{etaremune\}",
        block,
        re.DOTALL,
    )
    if not eta_match:
        return []
    return [latex_to_html(it) for it in extract_items(eta_match.group(0))]


def extract_works_in_progress(cv: str) -> list[str]:
    """Extract select working papers/projects."""
    match = re.search(
        r"\\subsection\*\{Select Working Papers and Projects\}(.*?)(?=\\subsection\*\{|\\section\*\{)",
        cv,
        re.DOTALL,
    )
    if not match:
        return []
    block = match.group(1)
    eta_match = re.search(
        r"\\begin\{etaremune\}.*?(\\item.*?)\\end\{etaremune\}",
        block,
        re.DOTALL,
    )
    if not eta_match:
        return []
    return [latex_to_html(it) for it in extract_items(eta_match.group(0))]


def extract_public_scholarship(cv: str, num_entries: int = MEDIA_SCHOLARSHIP_COUNT) -> list[dict]:
    """Extract recent public scholarship entries as structured data."""
    match = re.search(
        r"\\subsection\*\{Public Scholarship and Commentary\}(.*?)(?=\\subsection\*\{|\\section\*\{)",
        cv,
        re.DOTALL,
    )
    if not match:
        return []
    block = match.group(1)
    eta_match = re.search(
        r"\\begin\{etaremune\}.*?(\\item.*?)\\end\{etaremune\}",
        block,
        re.DOTALL,
    )
    if not eta_match:
        return []
    raw_items = extract_items(eta_match.group(0))[:num_entries]

    entries = []
    for item in raw_items:
        # Extract date
        date_match = re.search(
            r"((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4})",
            item,
        )
        date_str = date_match.group(1) if date_match else ""

        # Extract URL and title from \href{url}{title}
        href_match = re.search(r"\\href\{([^}]+)\}\{([^}]+)\}", item)
        if not href_match:
            # Malformed: ``{url}{title}''
            href_match = re.search(r"\{(https?://[^}]+)\}\{([^}]+)\}", item)
        if href_match:
            url = href_match.group(1)
            title = href_match.group(2).rstrip(".")
        else:
            url = ""
            title = ""

        # Extract outlet from \textit{Outlet}
        outlet_matches = re.findall(r"\\textit\{([^}]+)\}", item)
        outlet = outlet_matches[-1] if outlet_matches else "Unknown"

        entries.append({
            "date": date_str,
            "url": url,
            "title": title,
            "outlet": outlet,
        })
    return entries


# ---------------------------------------------------------------------------
# HTML generators
# ---------------------------------------------------------------------------


def build_year_section(title: str, items: list[str], count_label: Optional[str] = None) -> str:
    """Build a collapsible year-section div."""
    n = len(items)
    if count_label is None:
        count_label = f"({n} {'publication' if n == 1 else 'publications'})"

    numbered = "\n".join(
        f"<p>{i + 1}. {item}</p>" for i, item in enumerate(items)
    )
    return f"""<div class="year-section">
    <div class="year-header">
        <div class="year-header-content">
            <h3 class="year-title">{title}</h3>
            <span class="year-count">{count_label}</span>
        </div>
        <span class="year-toggle">▼</span>
    </div>
    <div class="year-content">
        <div class="year-content-inner">
{numbered}
        </div>
    </div>
</div>"""


def build_publications_journal_html(year_groups: dict[str, list[str]]) -> str:
    """Build the full journal-articles chronological HTML."""
    blocks = []
    for year_label, items in year_groups.items():
        blocks.append(build_year_section(year_label, items))
    return "\n\n".join(blocks)


def build_publications_other_html(sections: dict[str, list[str]]) -> str:
    """Build the other scholarly publications HTML."""
    blocks = []
    for label, items in sections.items():
        blocks.append(build_year_section(label, items))
    return "\n\n".join(blocks)


def build_research_section_html(title: str, items: list[str], count_label: Optional[str] = None) -> str:
    """Build a single research year-section."""
    n = len(items)
    if count_label is None:
        count_label = f"({n} {'paper' if n == 1 else 'papers'})"
    return build_year_section(title, items, count_label)


def build_works_in_progress_html(items: list[str]) -> str:
    """Build works in progress as a flat numbered list."""
    return build_year_section(
        "Works in Progress",
        items,
        count_label=f"({len(items)} projects)",
    )


def build_media_scholarship_html(entries: list[dict]) -> str:
    """Build the recent public scholarship section."""
    n = len(entries)
    items_html = []
    for i, e in enumerate(entries, 1):
        if e["url"]:
            line = f'<p>{i}. <a href="{e["url"]}" target="_blank">{e["title"]}</a>. <em>{e["outlet"]}</em> ({e["date"]})</p>'
        else:
            line = f'<p>{i}. {e["title"]}. <em>{e["outlet"]}</em> ({e["date"]})</p>'
        items_html.append(line)

    inner = "\n".join(items_html)
    return f"""<div class="year-section">
    <div class="year-header">
        <div class="year-header-content">
            <h3 class="year-title">Recent Public Scholarship</h3>
            <span class="year-count">({n} recent {'piece' if n == 1 else 'pieces'})</span>
        </div>
        <span class="year-toggle">▼</span>
    </div>
    <div class="year-content">
        <div class="year-content-inner">
{inner}
        </div>
    </div>
</div>"""


# ---------------------------------------------------------------------------
# Marker replacement
# ---------------------------------------------------------------------------

MARKER_RE = re.compile(
    r"(<!-- CV-SYNC:(\S+) START -->)\n.*?\n(<!-- CV-SYNC:\2 END -->)",
    re.DOTALL,
)


def replace_marker(html: str, marker_name: str, new_content: str) -> str:
    """Replace content between CV-SYNC markers."""
    pattern = re.compile(
        rf"(<!-- CV-SYNC:{re.escape(marker_name)} START -->)\n.*?\n(<!-- CV-SYNC:{re.escape(marker_name)} END -->)",
        re.DOTALL,
    )

    def _replacer(m: re.Match) -> str:
        return f"{m.group(1)}\n{new_content}\n{m.group(2)}"

    new_html, count = pattern.subn(_replacer, html)
    if count == 0:
        log.warning("Marker %s not found", marker_name)
    return new_html


def validate_markers(html: str) -> bool:
    """Ensure all START markers have matching END markers."""
    starts = re.findall(r"<!-- CV-SYNC:(\S+) START -->", html)
    ends = re.findall(r"<!-- CV-SYNC:(\S+) END -->", html)
    if starts != ends:
        log.error("Unbalanced markers: starts=%s ends=%s", starts, ends)
        return False
    return True


# ---------------------------------------------------------------------------
# File I/O with backup
# ---------------------------------------------------------------------------


def backup_file(path: Path) -> None:
    """Copy file to backup directory."""
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    dest = BACKUP_DIR / f"{path.name}.{ts}"
    shutil.copy2(path, dest)
    log.info("Backed up %s -> %s", path.name, dest)


def write_if_changed(path: Path, new_content: str, dry_run: bool) -> bool:
    """Write file only if content differs. Returns True if changed."""
    old_content = path.read_text(encoding="utf-8")
    if old_content == new_content:
        log.info("No changes for %s", path.name)
        return False
    if dry_run:
        log.info("[DRY RUN] Would update %s", path.name)
        return True
    backup_file(path)
    path.write_text(new_content, encoding="utf-8")
    log.info("Updated %s", path.name)
    return True


# ---------------------------------------------------------------------------
# Git
# ---------------------------------------------------------------------------


def git_commit_and_push(changed_files: list[str], dry_run: bool) -> None:
    """Stage, commit, and push changed files."""
    if not changed_files:
        return
    if dry_run:
        log.info("[DRY RUN] Would commit and push: %s", changed_files)
        return

    for f in changed_files:
        subprocess.run(["git", "add", f], cwd=REPO_PATH, check=True)

    result = subprocess.run(
        ["git", "diff", "--cached", "--quiet"],
        cwd=REPO_PATH,
        capture_output=True,
    )
    if result.returncode == 0:
        log.info("No staged changes to commit")
        return

    msg = (
        "Sync website from CV\n\n"
        f"Updated: {', '.join(changed_files)}\n\n"
        "Co-Authored-By: Oz <oz-agent@warp.dev>"
    )
    subprocess.run(["git", "commit", "-m", msg], cwd=REPO_PATH, check=True)
    subprocess.run(["git", "push", "origin", "main"], cwd=REPO_PATH, check=True)
    log.info("Committed and pushed: %s", changed_files)


# ---------------------------------------------------------------------------
# Sync orchestration
# ---------------------------------------------------------------------------


def sync_publications(cv: str, dry_run: bool) -> bool:
    """Sync publications.html from CV."""
    html = PUBLICATIONS_HTML.read_text(encoding="utf-8")

    # Journal articles
    year_groups = extract_journal_articles_by_year(cv)
    if year_groups:
        journal_html = build_publications_journal_html(year_groups)
        html = replace_marker(html, "publications-journal", journal_html)

    # Other publications
    other = extract_other_publications(cv)
    if other:
        other_html = build_publications_other_html(other)
        html = replace_marker(html, "publications-other", other_html)

    if not validate_markers(html):
        log.error("Marker validation failed for publications.html — skipping")
        return False

    return write_if_changed(PUBLICATIONS_HTML, html, dry_run)


def sync_research(cv: str, dry_run: bool) -> bool:
    """Sync research.html from CV."""
    html = RESEARCH_HTML.read_text(encoding="utf-8")

    rr = extract_revisions_requested(cv)
    if rr:
        html = replace_marker(
            html,
            "research-rr",
            build_research_section_html("Revise and Resubmit", rr),
        )

    ur = extract_under_review(cv)
    if ur:
        html = replace_marker(
            html,
            "research-under-review",
            build_research_section_html("Under Review", ur),
        )

    books = extract_books_in_progress(cv)
    if books:
        html = replace_marker(
            html,
            "research-books",
            build_research_section_html("Books in Progress", books, f"({len(books)} {'book' if len(books) == 1 else 'books'})"),
        )

    works = extract_works_in_progress(cv)
    if works:
        html = replace_marker(
            html,
            "research-works",
            build_works_in_progress_html(works),
        )

    if not validate_markers(html):
        log.error("Marker validation failed for research.html — skipping")
        return False

    return write_if_changed(RESEARCH_HTML, html, dry_run)


def sync_media(cv: str, dry_run: bool) -> bool:
    """Sync media.html from CV."""
    html = MEDIA_HTML.read_text(encoding="utf-8")

    entries = extract_public_scholarship(cv, MEDIA_SCHOLARSHIP_COUNT)
    if entries:
        scholarship_html = build_media_scholarship_html(entries)
        html = replace_marker(html, "media-scholarship", scholarship_html)

    if not validate_markers(html):
        log.error("Marker validation failed for media.html — skipping")
        return False

    return write_if_changed(MEDIA_HTML, html, dry_run)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(description="Sync CV to website")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without modifying files",
    )
    args = parser.parse_args()

    log.info("=" * 60)
    log.info("CV-to-website sync started (dry_run=%s)", args.dry_run)

    if not CV_PATH.exists():
        log.error("CV not found at %s", CV_PATH)
        sys.exit(1)

    cv = read_cv()
    log.info("Read CV (%d chars)", len(cv))

    changed: list[str] = []

    if sync_publications(cv, args.dry_run):
        changed.append("publications.html")

    if sync_research(cv, args.dry_run):
        changed.append("research.html")

    if sync_media(cv, args.dry_run):
        changed.append("media.html")

    if changed:
        log.info("Changed files: %s", changed)
        git_commit_and_push(changed, args.dry_run)
    else:
        log.info("Everything up to date")

    log.info("Sync complete")


if __name__ == "__main__":
    main()
