# Interactive Maps

Beautiful, minimal interactive maps powered by Leaflet.js with sleek black markers and smooth animations.

## 🗺️ Maps on the Site

### 1. Collaboration Map
**Location:** `collaboration.html`  
**Data:** `data/collaboration_universities_coords_corrected.csv`

Shows 72 universities worldwide where your collaborators are affiliated. Click any marker to see:
- University name
- Number of collaborators
- List of all collaborators at that institution

### 2. Visited Universities Map
**Location:** `collaboration.html`  
**Data:** `data/visited_universities_coords.csv`

Displays 105 universities you've visited for conferences, talks, and workshops. Each marker shows:
- University name
- Full location (city, state/country)

### 3. Places Lived Map
**Location:** `index.html` (homepage)  
**Data:** `data/places_lived_coords.csv`

Shows 31 cities you've lived in around the world.

## ✨ Features

### Design
- **Sleek black markers** with three-layer design (pulse, outer ring, inner dot)
- **Smooth animations** - markers fade in sequentially for a cool reveal effect
- **Pulse animation** - subtle expanding rings that continuously animate
- **Hover effects** - markers grow and intensify when you hover over them
- **Clean basemap** - Uses CartoDB Positron tiles for a minimal, professional look

### Interactions
- **Click markers** to see detailed popups
- **Hover** for visual feedback
- **Zoom** in/out with mouse wheel (after clicking map)
- **Pan** by dragging
- **Mobile-friendly** touch gestures

### Popups
- Modern rounded design with subtle shadows
- Clean typography using your site's Space Grotesk font
- Badges showing counts (e.g., "5 collaborators")
- Scrollable lists for long content
- Custom scrollbars matching the design

## 🎨 Styling Details

### Markers
- **Small** (8px outer) - Used for visited universities
- **Medium** (10px outer) - Used for collaborations
- **Large** (12px outer) - Used for places lived

Each marker has:
- Black solid inner circle (#000000)
- Semi-transparent outer ring (rgba(0,0,0,0.3))
- Pulsing animation ring (rgba(0,0,0,0.15))

### Map Container
- 500px height on desktop
- 400px height on mobile
- Rounded corners (12px radius)
- Subtle shadow that intensifies on hover
- Smooth transitions

### Colors
Black-focused palette:
- Markers: Pure black (#000000)
- Popup headers: Black (#000)
- Secondary text: Dark gray (#444, #666)
- Borders: Transparent black (rgba(0,0,0,0.08))

## 🔧 Technical Details

### Dependencies
- **Leaflet.js** v1.9.4 (loaded from CDN)
- **CartoDB Basemap** tiles
- Custom JavaScript in `maps.js`
- Custom CSS in `styles.css` (lines 2051-2292)

### Files
```
maps.js                                          # Main map initialization
styles.css                                       # Map styling and animations
data/
  ├── collaboration_universities_coords_corrected.csv
  ├── visited_universities_coords.csv
  └── places_lived_coords.csv
```

### Performance
- Markers fade in sequentially (staggered timing)
- 10ms delay per marker (collaboration)
- 8ms delay per marker (universities)
- 15ms delay per marker (places)
- Lazy loading - maps only initialize when DOM is ready

## 📝 Adding New Locations

### Collaboration Universities
Edit `data/collaboration_universities_coords_corrected.csv`:
```csv
Institution,Latitude,Longitude,Collaborators
Harvard,42.377,-71.1167,John Doe; Jane Smith
```

### Visited Universities
Edit `data/visited_universities_coords.csv`:
```csv
University,Location,Latitude,Longitude
MIT,"Cambridge, MA, USA",42.3601,-71.0942
```

### Places Lived
Edit `data/places_lived_coords.csv`:
```csv
place,lat,lon
"Boston, MA",42.3601,-71.0589
```

**Important:** Use quotes around values containing commas!

After editing, changes appear immediately on page refresh. No rebuild needed.

## 🎯 Design Philosophy

Following Tufte's principles:
- **Minimal chrome** - Clean basemap, no unnecessary UI elements
- **Data-first** - Markers are the focus
- **High data density** - Can show 100+ locations clearly
- **Clear hierarchy** - Markers → popups → details
- **Aesthetic simplicity** - Black and white with subtle animations

## 🔄 Customization

### Change Marker Colors
In `maps.js`, modify the `createBlackMarker()` function:
```javascript
background: #000000;  // Change to any color
```

### Adjust Animation Speed
Change the delay multipliers in each init function:
```javascript
setTimeout(() => { ... }, delayIndex * 10);  // Increase for slower
```

### Change Map Style
In `createStyledMap()`, swap the tile URL:
```javascript
// Dark mode
'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'

// Satellite
'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
```

## 🐛 Troubleshooting

### Maps not appearing
1. Check browser console for errors
2. Verify CSV files exist in `data/` directory
3. Ensure Leaflet CSS and JS loaded (check Network tab)
4. Try hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### Markers not visible
- Check CSV latitude/longitude values are valid numbers
- Ensure coordinates are in decimal format (not DMS)
- Verify CSV headers match expected format

### Slow performance
- Reduce animation delays in `maps.js`
- Remove pulse animation by commenting out `.marker-pulse-outer` in CSS
- Use marker clustering for maps with 200+ markers

### Popup content cut off
Adjust max height in `styles.css`:
```css
.map-popup-list {
    max-height: 300px;  /* Increase from 200px */
}
```

## 📱 Mobile Optimization

Maps automatically adapt to mobile:
- 400px height (vs 500px desktop)
- Smaller text in popups
- Touch-friendly zoom/pan
- Simplified animations

## 🚀 Future Enhancements

Potential additions:
- **Marker clustering** for dense areas
- **Search/filter** functionality
- **Statistics overlay** (e.g., "Visited 32 countries")
- **Timeline slider** for places lived
- **Heatmap layer** for concentration visualization
- **Export to image** button
- **Fullscreen mode**

## 📄 License

Maps use:
- Leaflet.js (BSD-2-Clause)
- OpenStreetMap data (ODbL)
- CartoDB basemap tiles (CC BY 3.0)

---

*Last updated: 2026-01-18*
