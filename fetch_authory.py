#!/usr/bin/env python3
"""
Fetch public writing from Authory RSS feed and generate writing.json
Run this script periodically to update the writing page with latest articles
"""

import feedparser
import json
from datetime import datetime
import re

def clean_html(text):
    """Remove HTML tags from text"""
    if not text:
        return ""
    clean = re.compile('<.*?>')
    return re.sub(clean, '', text).strip()

def fetch_authory_articles(rss_url="https://authory.com/cdcrabtree/rss"):
    """Fetch articles from Authory RSS feed"""
    print(f"Fetching articles from {rss_url}...")
    
    feed = feedparser.parse(rss_url)
    
    if feed.bozo:
        print(f"Warning: Feed parsing issue - {feed.bozo_exception}")
    
    articles = []
    
    for entry in feed.entries[:20]:  # Get up to 20 most recent articles
        # Parse date
        pub_date = entry.get('published_parsed') or entry.get('updated_parsed')
        if pub_date:
            date_str = datetime(*pub_date[:6]).strftime("%Y")
        else:
            date_str = "Recent"
        
        # Extract outlet from link or use a default
        outlet = "Publication"
        if 'link' in entry:
            link = entry.link
            if 'washingtonpost.com' in link:
                outlet = "The Washington Post"
            elif 'nytimes.com' in link:
                outlet = "The New York Times"
            elif 'theatlantic.com' in link:
                outlet = "The Atlantic"
            elif 'foreignaffairs.com' in link:
                outlet = "Foreign Affairs"
            elif 'politico.com' in link:
                outlet = "POLITICO"
            elif 'conversation.com' in link:
                outlet = "The Conversation"
            elif 'asia.nikkei.com' in link:
                outlet = "Nikkei Asia"
            elif 'theguardian.com' in link:
                outlet = "The Guardian"
            elif 'slate.com' in link:
                outlet = "Slate"
            elif 'vox.com' in link:
                outlet = "Vox"
            # Add more outlets as needed
        
        # Extract summary/excerpt
        summary = clean_html(entry.get('summary', ''))
        if len(summary) > 200:
            summary = summary[:197] + "..."
        
        # Extract tags (if available)
        tags = []
        if 'tags' in entry:
            tags = [tag.term for tag in entry.tags[:3]]
        
        article = {
            "title": entry.get('title', 'Untitled'),
            "url": entry.get('link', '#'),
            "date": date_str,
            "outlet": outlet,
            "excerpt": summary,
            "tags": tags
        }
        
        articles.append(article)
    
    print(f"Fetched {len(articles)} articles")
    return articles

def save_to_json(articles, output_file="writing.json"):
    """Save articles to JSON file"""
    data = {
        "updated": datetime.now().isoformat(),
        "articles": articles
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Saved {len(articles)} articles to {output_file}")

def get_fallback_articles():
    """Fallback articles if RSS feed fails"""
    return [
        {
            "title": "View All My Public Writing",
            "url": "https://authory.com/cdcrabtree",
            "date": "Current",
            "outlet": "Authory Portfolio",
            "excerpt": "Visit my Authory profile to see all of my public writing and commentary on politics, research, discrimination, and social science methods.",
            "tags": ["All Writing"]
        }
    ]

def main():
    try:
        articles = fetch_authory_articles()
        
        # If no articles fetched, use fallback
        if not articles or len(articles) == 0:
            print("No articles from RSS, using fallback...")
            articles = get_fallback_articles()
        
        save_to_json(articles)
        print("✓ Successfully updated writing content")
    except Exception as e:
        print(f"✗ Error: {e}")
        print("Using fallback articles...")
        articles = get_fallback_articles()
        save_to_json(articles)
    
    return 0

if __name__ == "__main__":
    exit(main())
