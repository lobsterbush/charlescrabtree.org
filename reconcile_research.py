#!/usr/bin/env python3
"""
Reconcile working-papers.tex with research.html
Identifies discrepancies, missing papers, and generates update report
"""

import re
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from difflib import SequenceMatcher
from html import unescape


@dataclass
class Paper:
    """Represents a research paper"""
    title: str
    authors: str
    section: str
    source: str  # 'latex' or 'html'
    url: Optional[str] = None
    raw_text: str = ""
    
    def similarity(self, other: 'Paper') -> float:
        """Calculate title similarity with another paper"""
        return SequenceMatcher(None, self.title.lower(), other.title.lower()).ratio()


class LaTeXParser:
    """Parse working-papers.tex file"""
    
    def __init__(self, filepath: Path):
        self.filepath = filepath
        self.content = filepath.read_text(encoding='utf-8')
    
    def clean_latex(self, text: str) -> str:
        """Remove LaTeX formatting"""
        # Remove bold formatting
        text = re.sub(r'\\textbf\{([^}]+)\}', r'\1', text)
        text = re.sub(r'\{\\bf ([^}]+)\}', r'\1', text)
        
        # Remove student markers
        text = re.sub(r'\$\^?\{?\*\}?\$', '', text)
        
        # Remove italic
        text = re.sub(r'\\textit\{([^}]+)\}', r'\1', text)
        
        # Clean up whitespace
        text = ' '.join(text.split())
        
        return text.strip()
    
    def extract_url(self, text: str) -> Optional[str]:
        """Extract URL from LaTeX href commands"""
        match = re.search(r'\\href\{([^}]+)\}', text)
        return match.group(1) if match else None
    
    def parse(self) -> List[Paper]:
        """Parse all papers from LaTeX file"""
        papers = []
        
        # Define sections to parse
        sections = {
            'Manuscripts Under Review': r'\\subsection\*\{Manuscripts Under Review\}(.*?)(?=\\subsection\*|\\end\{etaremune\})',
            'Books in Progress': r'\\subsection\*\{Books in Progress\}(.*?)(?=\\subsection\*|\\end\{etaremune\})',
            'Select Working Papers and Projects': r'\\subsection\*\{Select Working Papers and Projects\}(.*?)(?=\\subsection\*|\\end\{etaremune\}|%)',
            "Schrödinger's Manuscripts": r"\\subsection\*\{Schrödinger's Manuscripts\}(.*?)(?=\\subsection\*|\\end\{etaremune\})"
        }
        
        for section_name, pattern in sections.items():
            match = re.search(pattern, self.content, re.DOTALL)
            if not match:
                continue
            
            section_content = match.group(1)
            
            # Extract individual items
            items = re.findall(r'\\item\s+(.+?)(?=\\item|\\end\{etaremune\}|$)', section_content, re.DOTALL)
            
            for item in items:
                # Skip commented items
                if item.strip().startswith('%'):
                    continue
                
                raw_text = item.strip()
                
                # Extract URL if present
                url = self.extract_url(raw_text)
                
                # Clean the text
                cleaned = self.clean_latex(raw_text)
                
                # Split into authors and title
                # Pattern: Authors. "Title" or Authors. Title
                match = re.match(r'([^.]+(?:\.\s+[^."]+)*?)\.\s+["""]?([^"""]+)["""]?\.?', cleaned)
                
                if match:
                    authors = match.group(1).strip()
                    title = match.group(2).strip().rstrip('."')
                else:
                    # Fallback: everything is the title
                    authors = ""
                    title = cleaned.strip()
                
                papers.append(Paper(
                    title=title,
                    authors=authors,
                    section=section_name,
                    source='latex',
                    url=url,
                    raw_text=raw_text
                ))
        
        return papers


class HTMLParser:
    """Parse research.html file"""
    
    def __init__(self, filepath: Path):
        self.filepath = filepath
        self.content = filepath.read_text(encoding='utf-8')
    
    def clean_html(self, text: str) -> str:
        """Remove HTML tags and decode entities"""
        # Remove links but keep text
        text = re.sub(r'<a[^>]*>([^<]+)</a>', r'\1', text)
        
        # Remove strong/em tags
        text = re.sub(r'</?(?:strong|em)>', '', text)
        
        # Decode HTML entities
        text = unescape(text)
        
        # Clean up whitespace
        text = ' '.join(text.split())
        
        return text.strip()
    
    def extract_url(self, text: str) -> Optional[str]:
        """Extract URL from HTML anchor tag"""
        match = re.search(r'<a[^>]+href="([^"]+)"', text)
        return match.group(1) if match else None
    
    def parse(self) -> List[Paper]:
        """Parse all papers from HTML file"""
        papers = []
        
        # Extract "Under Review" section
        under_review_match = re.search(
            r'<h3 class="year-title">Under Review</h3>.*?<div class="year-content-inner">(.*?)</div>\s*</div>\s*</div>',
            self.content,
            re.DOTALL
        )
        
        if under_review_match:
            section_content = under_review_match.group(1)
            items = re.findall(r'<p>(?:\d+\.\s+)?(.+?)</p>', section_content)
            
            for item in items:
                raw_text = item.strip()
                url = self.extract_url(raw_text)
                cleaned = self.clean_html(raw_text)
                
                # Parse authors and title
                match = re.match(r'([^.]+(?:\.\s+[^."]+)*?)\.\s+["""]?([^"""]+)["""]?\.?', cleaned)
                
                if match:
                    authors = match.group(1).strip()
                    title = match.group(2).strip().rstrip('."')
                else:
                    authors = ""
                    title = cleaned.strip()
                
                papers.append(Paper(
                    title=title,
                    authors=authors,
                    section='Under Review',
                    source='html',
                    url=url,
                    raw_text=raw_text
                ))
        
        # Extract "Works in Progress" section
        wip_match = re.search(
            r'<h3 class="year-title">Works in Progress</h3>.*?<div class="year-content-inner">(.*?)</div>\s*</div>\s*</div>',
            self.content,
            re.DOTALL
        )
        
        if wip_match:
            section_content = wip_match.group(1)
            
            # Extract all list items
            items = re.findall(r'<li>(.+?)</li>', section_content)
            
            for item in items:
                raw_text = item.strip()
                url = self.extract_url(raw_text)
                cleaned = self.clean_html(raw_text)
                
                # Parse authors and title
                match = re.match(r'([^.]+(?:\.\s+[^."]+)*?)\.\s+["""]?([^"""]+)["""]?\.?', cleaned)
                
                if match:
                    authors = match.group(1).strip()
                    title = match.group(2).strip().rstrip('."')
                else:
                    authors = ""
                    title = cleaned.strip()
                
                papers.append(Paper(
                    title=title,
                    authors=authors,
                    section='Works in Progress',
                    source='html',
                    url=url,
                    raw_text=raw_text
                ))
        
        return papers


class Reconciler:
    """Reconcile papers between LaTeX and HTML sources"""
    
    def __init__(self, latex_papers: List[Paper], html_papers: List[Paper]):
        self.latex_papers = latex_papers
        self.html_papers = html_papers
        self.similarity_threshold = 0.85
    
    def find_match(self, paper: Paper, candidates: List[Paper]) -> Optional[Paper]:
        """Find best matching paper from candidates"""
        best_match = None
        best_score = 0
        
        for candidate in candidates:
            score = paper.similarity(candidate)
            if score > best_score and score >= self.similarity_threshold:
                best_score = score
                best_match = candidate
        
        return best_match
    
    def reconcile(self) -> Dict:
        """Perform reconciliation and return results"""
        results = {
            'in_latex_not_html': [],
            'in_html_not_latex': [],
            'in_both': [],
            'potential_duplicates_latex': [],
            'potential_duplicates_html': []
        }
        
        matched_html = set()
        matched_latex = set()
        
        # Find papers in LaTeX
        for latex_paper in self.latex_papers:
            match = self.find_match(latex_paper, self.html_papers)
            
            if match:
                matched_html.add(id(match))
                matched_latex.add(id(latex_paper))
                results['in_both'].append((latex_paper, match))
            else:
                results['in_latex_not_html'].append(latex_paper)
        
        # Find papers in HTML but not in LaTeX
        for html_paper in self.html_papers:
            if id(html_paper) not in matched_html:
                results['in_html_not_latex'].append(html_paper)
        
        # Check for potential duplicates within LaTeX
        for i, paper1 in enumerate(self.latex_papers):
            for paper2 in self.latex_papers[i+1:]:
                if paper1.similarity(paper2) >= self.similarity_threshold:
                    results['potential_duplicates_latex'].append((paper1, paper2))
        
        # Check for potential duplicates within HTML
        for i, paper1 in enumerate(self.html_papers):
            for paper2 in self.html_papers[i+1:]:
                if paper1.similarity(paper2) >= self.similarity_threshold:
                    results['potential_duplicates_html'].append((paper1, paper2))
        
        return results


class ReportGenerator:
    """Generate reconciliation report"""
    
    def __init__(self, results: Dict):
        self.results = results
    
    def generate_markdown(self) -> str:
        """Generate markdown report"""
        lines = ["# Research Papers Reconciliation Report\n"]
        
        # Summary
        lines.append("## Summary\n")
        lines.append(f"- Papers in both sources: {len(self.results['in_both'])}")
        lines.append(f"- Papers in LaTeX only: {len(self.results['in_latex_not_html'])}")
        lines.append(f"- Papers in HTML only: {len(self.results['in_html_not_latex'])}")
        lines.append(f"- Potential duplicates in LaTeX: {len(self.results['potential_duplicates_latex'])}")
        lines.append(f"- Potential duplicates in HTML: {len(self.results['potential_duplicates_html'])}\n")
        
        # Papers in LaTeX but not HTML
        if self.results['in_latex_not_html']:
            lines.append("## Papers in LaTeX but Missing from HTML\n")
            for paper in self.results['in_latex_not_html']:
                lines.append(f"### {paper.title}")
                lines.append(f"- **Authors:** {paper.authors}")
                lines.append(f"- **Section in LaTeX:** {paper.section}")
                if paper.url:
                    lines.append(f"- **URL:** {paper.url}")
                lines.append(f"- **Raw LaTeX:** `{paper.raw_text[:100]}...`\n")
        
        # Papers in HTML but not LaTeX
        if self.results['in_html_not_latex']:
            lines.append("## Papers in HTML but Missing from LaTeX\n")
            for paper in self.results['in_html_not_latex']:
                lines.append(f"### {paper.title}")
                lines.append(f"- **Authors:** {paper.authors}")
                lines.append(f"- **Section in HTML:** {paper.section}")
                if paper.url:
                    lines.append(f"- **URL:** {paper.url}\n")
        
        # Potential duplicates
        if self.results['potential_duplicates_latex']:
            lines.append("## Potential Duplicates in LaTeX\n")
            for paper1, paper2 in self.results['potential_duplicates_latex']:
                lines.append(f"### Similar papers (similarity: {paper1.similarity(paper2):.2%})")
                lines.append(f"1. {paper1.title} ({paper1.section})")
                lines.append(f"2. {paper2.title} ({paper2.section})\n")
        
        if self.results['potential_duplicates_html']:
            lines.append("## Potential Duplicates in HTML\n")
            for paper1, paper2 in self.results['potential_duplicates_html']:
                lines.append(f"### Similar papers (similarity: {paper1.similarity(paper2):.2%})")
                lines.append(f"1. {paper1.title} ({paper1.section})")
                lines.append(f"2. {paper2.title} ({paper2.section})\n")
        
        # Section mapping analysis
        lines.append("## Section Mapping Analysis\n")
        section_map = {}
        for latex_paper, html_paper in self.results['in_both']:
            key = (latex_paper.section, html_paper.section)
            section_map[key] = section_map.get(key, 0) + 1
        
        for (latex_sec, html_sec), count in sorted(section_map.items(), key=lambda x: -x[1]):
            lines.append(f"- {latex_sec} → {html_sec}: {count} papers")
        
        return "\n".join(lines)


def main():
    """Main reconciliation workflow"""
    # File paths
    latex_file = Path("/Users/f00421k/Dropbox/cv/working-papers.tex")
    html_file = Path("/Users/f00421k/Documents/GitHub/personal-site/research.html")
    output_file = Path("/Users/f00421k/Documents/GitHub/personal-site/reconciliation_report.md")
    
    print("Parsing LaTeX file...")
    latex_parser = LaTeXParser(latex_file)
    latex_papers = latex_parser.parse()
    print(f"Found {len(latex_papers)} papers in LaTeX")
    
    print("\nParsing HTML file...")
    html_parser = HTMLParser(html_file)
    html_papers = html_parser.parse()
    print(f"Found {len(html_papers)} papers in HTML")
    
    print("\nReconciling...")
    reconciler = Reconciler(latex_papers, html_papers)
    results = reconciler.reconcile()
    
    print("\nGenerating report...")
    generator = ReportGenerator(results)
    report = generator.generate_markdown()
    
    # Write report
    output_file.write_text(report, encoding='utf-8')
    print(f"\nReport written to: {output_file}")
    
    # Print summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Papers in both sources: {len(results['in_both'])}")
    print(f"Papers in LaTeX only: {len(results['in_latex_not_html'])}")
    print(f"Papers in HTML only: {len(results['in_html_not_latex'])}")
    print(f"Potential duplicates in LaTeX: {len(results['potential_duplicates_latex'])}")
    print(f"Potential duplicates in HTML: {len(results['potential_duplicates_html'])}")


if __name__ == "__main__":
    main()
