// What's New widget — loads latest updates and upcoming schedule
document.addEventListener('DOMContentLoaded', () => {
    loadLatestUpdates();
    loadUpcomingEvents();
});

// --- Latest Updates (from updates.json) ---
async function loadLatestUpdates() {
    const container = document.getElementById('latest-updates');
    if (!container) return;

    try {
        const resp = await fetch('updates.json');
        if (!resp.ok) throw new Error('Failed to load updates');
        const data = await resp.json();

        let html = '';

        // Publications
        if (data.publications && data.publications.length > 0) {
            html += '<h4 class="wn-subheading">Recent Publications</h4>';
            data.publications.forEach(pub => {
                const badge = pub.status === 'Forthcoming'
                    ? '<span class="wn-badge wn-badge-forthcoming">Forthcoming</span>'
                    : '';
                const link = pub.url
                    ? `<a href="${pub.url}" target="_blank" class="wn-item-title">${pub.title}</a>`
                    : `<span class="wn-item-title">${pub.title}</span>`;
                html += `<div class="wn-item">
                    ${link}
                    <span class="wn-item-meta"><em>${pub.journal}</em> ${badge}</span>
                </div>`;
            });
        }

        // Media
        if (data.media && data.media.length > 0) {
            html += '<h4 class="wn-subheading">Recent Commentary</h4>';
            data.media.forEach(m => {
                html += `<div class="wn-item">
                    <a href="${m.url}" target="_blank" class="wn-item-title">${m.title}</a>
                    <span class="wn-item-meta"><em>${m.outlet}</em> · ${m.date}</span>
                </div>`;
            });
        }

        container.innerHTML = html || '<p class="wn-empty">No recent updates.</p>';
    } catch (err) {
        container.innerHTML = '<p class="wn-empty">Unable to load updates.</p>';
    }
}

// --- Upcoming Events (from Google Calendar) ---
async function loadUpcomingEvents() {
    const container = document.getElementById('upcoming-events');
    if (!container || typeof CALENDAR_CONFIG === 'undefined') return;

    const { apiKey, calendarId, maxResults } = CALENDAR_CONFIG;
    const now = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`
        + `?key=${apiKey}&timeMin=${now}&maxResults=${maxResults}`
        + `&singleEvents=true&orderBy=startTime`;

    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('Calendar API error');
        const data = await resp.json();

        if (!data.items || data.items.length === 0) {
            container.innerHTML = '<p class="wn-empty">No upcoming events scheduled.</p>';
            return;
        }

        let html = '';
        data.items.forEach(event => {
            const title = event.summary || 'Untitled event';
            const location = event.location || '';
            const description = event.description || '';

            // Format date
            let dateStr = '';
            if (event.start.dateTime) {
                const d = new Date(event.start.dateTime);
                dateStr = d.toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric'
                });
                const timeStr = d.toLocaleTimeString('en-US', {
                    hour: 'numeric', minute: '2-digit'
                });
                dateStr += ` · ${timeStr}`;
            } else if (event.start.date) {
                const d = new Date(event.start.date + 'T00:00:00');
                dateStr = d.toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric'
                });
            }

            html += `<div class="wn-event">
                <span class="wn-event-date">${dateStr}</span>
                <span class="wn-event-title">${title}</span>
                ${location ? `<span class="wn-event-location">${location}</span>` : ''}
            </div>`;
        });

        container.innerHTML = html;
    } catch (err) {
        container.innerHTML = '<p class="wn-empty">Unable to load schedule.</p>';
    }
}
