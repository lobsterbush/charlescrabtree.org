// Interactive Maps using Leaflet.js
// Loads CSV data and creates beautiful, interactive maps

// Helper function to parse CSV
function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let char of lines[i]) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim().replace(/^"|"$/g, ''));
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim().replace(/^"|"$/g, ''));
        
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        data.push(row);
    }
    
    return data;
}

// Create sleek black marker with pulse animation
function createBlackMarker(size = 'medium') {
    const sizes = {
        small: { outer: 8, inner: 4 },
        medium: { outer: 10, inner: 5 },
        large: { outer: 12, inner: 6 }
    };
    const s = sizes[size];
    
    return L.divIcon({
        className: 'custom-black-marker',
        html: `
            <div class="marker-pulse-outer" style="width: ${s.outer * 3}px; height: ${s.outer * 3}px;"></div>
            <div class="marker-outer" style="width: ${s.outer * 2}px; height: ${s.outer * 2}px;"></div>
            <div class="marker-inner" style="width: ${s.inner * 2}px; height: ${s.inner * 2}px;"></div>
        `,
        iconSize: [s.outer * 3, s.outer * 3],
        iconAnchor: [s.outer * 1.5, s.outer * 1.5]
    });
}

// Create base map with cool dark style
function createStyledMap(elementId, center, zoom) {
    const map = L.map(elementId, {
        center: center,
        zoom: zoom,
        minZoom: 2,
        maxZoom: 12,
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: false
    });
    
    // Use CartoDB Voyager labels_under for blue ocean with light grey borders
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap, © CartoDB',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);
    
    // Enable scroll zoom on click
    map.on('click', function() {
        map.scrollWheelZoom.enable();
    });
    
    map.on('mouseout', function() {
        map.scrollWheelZoom.disable();
    });
    
    // Add custom attribution
    L.control.attribution({
        position: 'bottomright',
        prefix: false
    }).addTo(map);
    
    return map;
}

// Initialize Collaboration Universities Map
function initCollaborationMap() {
    const mapElement = document.getElementById('collaboration-map');
    if (!mapElement) return;
    
    const map = createStyledMap('collaboration-map', [30, 0], 2);
    
    fetch('data/collaboration_universities_coords_corrected.csv')
        .then(response => response.text())
        .then(csvText => {
            const data = parseCSV(csvText);
            let delayIndex = 0;
            
            data.forEach(row => {
                const lat = parseFloat(row.Latitude);
                const lon = parseFloat(row.Longitude);
                
                if (isNaN(lat) || isNaN(lon)) return;
                
                // Stagger marker appearance for cool effect
                setTimeout(() => {
                    const marker = L.marker([lat, lon], {
                        icon: createBlackMarker('medium'),
                        opacity: 0
                    }).addTo(map);
                    
                    // Fade in animation
                    setTimeout(() => {
                        marker.setOpacity(1);
                    }, 50);
                    
                    const collaborators = row.Collaborators.split(';').map(c => c.trim()).join('<br>');
                    const collabCount = row.Collaborators.split(';').length;
                    
                    marker.bindPopup(`
                        <div class="map-popup">
                            <div class="map-popup-header">${row.Institution}</div>
                            <div class="map-popup-badge">${collabCount} collaborator${collabCount > 1 ? 's' : ''}</div>
                            <div class="map-popup-list">${collaborators}</div>
                        </div>
                    `, {
                        maxWidth: 300,
                        className: 'custom-popup'
                    });
                    
                    // Pulse effect on hover
                    marker.on('mouseover', function() {
                        this.getElement().classList.add('marker-hover');
                    });
                    marker.on('mouseout', function() {
                        this.getElement().classList.remove('marker-hover');
                    });
                }, delayIndex * 10);
                
                delayIndex++;
            });
        })
        .catch(error => console.error('Error loading collaboration map:', error));
}

// Initialize Visited Universities Map
function initVisitedUniversitiesMap() {
    const mapElement = document.getElementById('visited-universities-map');
    if (!mapElement) return;
    
    const map = createStyledMap('visited-universities-map', [30, 0], 2);
    
    fetch('data/visited_universities_coords.csv')
        .then(response => response.text())
        .then(csvText => {
            const data = parseCSV(csvText);
            let delayIndex = 0;
            
            data.forEach(row => {
                const lat = parseFloat(row.Latitude);
                const lon = parseFloat(row.Longitude);
                
                if (isNaN(lat) || isNaN(lon)) return;
                
                setTimeout(() => {
                    const marker = L.marker([lat, lon], {
                        icon: createBlackMarker('small'),
                        opacity: 0
                    }).addTo(map);
                    
                    setTimeout(() => {
                        marker.setOpacity(1);
                    }, 50);
                    
                    marker.bindPopup(`
                        <div class="map-popup">
                            <div class="map-popup-header">${row.University}</div>
                            <div class="map-popup-location">${row.Location}</div>
                        </div>
                    `, {
                        className: 'custom-popup'
                    });
                    
                    marker.on('mouseover', function() {
                        this.getElement().classList.add('marker-hover');
                    });
                    marker.on('mouseout', function() {
                        this.getElement().classList.remove('marker-hover');
                    });
                }, delayIndex * 8);
                
                delayIndex++;
            });
        })
        .catch(error => console.error('Error loading universities map:', error));
}

// Initialize Places Lived Map
function initPlacesLivedMap() {
    const mapElement = document.getElementById('places-lived-map');
    if (!mapElement) return;
    
    const map = createStyledMap('places-lived-map', [40, 10], 2);
    
    fetch('data/places_lived_coords.csv')
        .then(response => response.text())
        .then(csvText => {
            const data = parseCSV(csvText);
            let delayIndex = 0;
            
            data.forEach(row => {
                const lat = parseFloat(row.lat);
                const lon = parseFloat(row.lon);
                
                if (isNaN(lat) || isNaN(lon)) return;
                
                setTimeout(() => {
                    const marker = L.marker([lat, lon], {
                        icon: createBlackMarker('large'),
                        opacity: 0
                    }).addTo(map);
                    
                    setTimeout(() => {
                        marker.setOpacity(1);
                    }, 50);
                    
                    marker.bindPopup(`
                        <div class="map-popup">
                            <div class="map-popup-header">${row.place}</div>
                        </div>
                    `, {
                        className: 'custom-popup'
                    });
                    
                    marker.on('mouseover', function() {
                        this.getElement().classList.add('marker-hover');
                    });
                    marker.on('mouseout', function() {
                        this.getElement().classList.remove('marker-hover');
                    });
                }, delayIndex * 15);
                
                delayIndex++;
            });
        })
        .catch(error => console.error('Error loading places map:', error));
}

// Initialize all maps when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initCollaborationMap();
    initVisitedUniversitiesMap();
    initPlacesLivedMap();
});
