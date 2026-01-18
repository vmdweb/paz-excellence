/**
 * Shows Module (Atualizado)
 * Janela flutuante centralizada para shows
 */

let showsOverlay = null;
let showsContent = null;

function initShows() {
    showsOverlay = document.getElementById('showsOverlay');
    showsContent = document.getElementById('showsContent'); // container interno para centralização

    const closeBtn = document.getElementById('showsClose');
    if (closeBtn) closeBtn.addEventListener('click', closeShows);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && showsOverlay && showsOverlay.classList.contains('active')) {
            closeShows();
        }
    });

    if (showsOverlay) {
        showsOverlay.addEventListener('click', (e) => {
            if (e.target === showsOverlay) closeShows();
        });
    }
}

function openShows() {
    if (!showsOverlay || !showsContent) return;

    buildShows();

    showsOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // animação de flutuação central
    if (showsContent) {
        showsContent.style.transform = 'scale(0.95)';
        setTimeout(() => {
            showsContent.style.transform = 'scale(1)';
            showsContent.style.transition = 'transform 0.3s ease';
        }, 10);
    }
}

function closeShows() {
    if (!showsOverlay) return;

    showsOverlay.classList.remove('active');
    document.body.style.overflow = '';

    if (showsContent) {
        showsContent.style.transform = '';
        showsContent.style.transition = '';
    }
}

/* ------------------- Shows Logic ------------------- */

function getShows() {
    try {
        const stored = localStorage.getItem('shows');
        if (stored) {
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : [];
        }
    } catch (error) {
        console.error('Error loading shows:', error);
    }
    return [];
}

function formatDateShort(dateString) {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
}

function buildShows() {
    if (!showsContent) return;

    const shows = getShows();
    if (!shows || shows.length === 0) {
        const emptyText = typeof t === 'function' ? t('noShowsScheduled') : 'No shows scheduled';
        showsContent.innerHTML = `<div class="shows-empty">${emptyText}</div>`;
        return;
    }

    const now = new Date();
    const upcoming = [];
    const past = [];

    shows.forEach(show => {
        const showDate = new Date(show.date);
        if (showDate >= now) upcoming.push(show);
        else past.push(show);
    });

    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
    past.sort((a, b) => new Date(b.date) - new Date(a.date));

    let html = '<div class="shows-list">';

    if (upcoming.length > 0) {
        html += '<div class="shows-section">';
        html += `<div class="shows-section-title">${typeof t === 'function' ? t('upcoming') : 'Upcoming'}</div>`;
        upcoming.forEach(show => html += createShowItem(show));
        html += '</div>';
    }

    if (past.length > 0) {
        html += '<div class="shows-section">';
        html += `<div class="shows-section-title">${typeof t === 'function' ? t('past') : 'Past'}</div>`;
        past.forEach(show => html += createShowItem(show));
        html += '</div>';
    }

    html += '</div>';
    showsContent.innerHTML = html;
}

function createShowItem(show) {
    const dateStr = formatDateShort(show.date);
    const location = show.city && show.country ? `${show.city}, ${show.country}` : show.city || show.country || '';

    let html = `
        <div class="shows-item">
            <div class="shows-date">${escapeHtml(dateStr)}</div>
            <div class="shows-details">
                <div class="shows-venue">${escapeHtml(show.venue || '')}</div>
                <div class="shows-location">${escapeHtml(location)}</div>
    `;

    if (show.link) {
        html += `<a href="${escapeHtml(show.link)}" target="_blank" rel="noopener noreferrer" class="shows-link">${escapeHtml(show.link)}</a>`;
    }

    html += `
            </div>
        </div>
    `;

    return html;
}

/* ------------------- Utilities ------------------- */

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make globally accessible
window.openShows = openShows;
window.closeShows = closeShows;
