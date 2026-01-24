# Authory Integration Notes

## Challenge
Direct client-side scraping of Authory profile is not feasible due to:
- CORS (Cross-Origin Resource Sharing) restrictions
- Dynamic JavaScript content loading
- Authory's site structure

## Solutions

### Option 1: Manual Updates (Current Implementation)
- Link directly to Authory profile for complete collection
- Manually feature select recent pieces in publications.html
- **Status**: ✅ Implemented

### Option 2: Server-Side Scraping (Future Enhancement)
Create a backend service (Node.js, Python, etc.) that:
1. Fetches from Authory periodically
2. Extracts recent op-eds
3. Serves as JSON endpoint
4. Client-side JavaScript fetches from your endpoint

Example Python script structure:
```python
import requests
from bs4 import BeautifulSoup
import json

def fetch_authory_articles():
    url = "https://authory.com/cdcrabtree"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Parse article data
    articles = []
    # ... parsing logic ...
    
    with open('recent-opeds.json', 'w') as f:
        json.dump(articles, f)
```

### Option 3: RSS Feed (If Available)
Check if Authory provides RSS feeds for profiles

### Option 4: Authory API (If Available)
Contact Authory to see if they offer an API for profile data

## Current Implementation
The publications.html page now features:
- Prominent link to full Authory profile
- Description of media appearances
- Reference to major outlets
- Clean, professional presentation

Users can click through to see the complete, always-current collection on Authory.
