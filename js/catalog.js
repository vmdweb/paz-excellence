/* ------------------- Catalog Module (Flutuante e Filtrável) ------------------- */

let catalogOverlay = null;
let catalogContent = null;

let artistOverlay = null;
let artistTracksContainer = null;
let currentArtistTracks = null;
let currentLetterFilter = null;

function initCatalog() {
    catalogOverlay = document.getElementById('catalogOverlay');
    catalogContent = document.getElementById('catalogContent');

    const closeBtn = document.getElementById('catalogClose');
    if (closeBtn) closeBtn.addEventListener('click', closeCatalog);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && catalogOverlay.classList.contains('active')) {
            closeCatalog();
        }
    });

    catalogOverlay.addEventListener('click', (e) => {
        if (e.target === catalogOverlay) closeCatalog();
    });

    initArtistOverlay();
}

function openCatalog() {
    if (!catalogOverlay || !catalogContent) return;
    currentLetterFilter = 'all'; // mostra todos inicialmente
    buildCatalog();
    catalogOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCatalog() {
    if (!catalogOverlay) return;
    catalogOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

/* ------------------- Build Catalog ------------------- */

async function buildCatalog() {
    if (!catalogContent) return;

    const tracks = await loadTracks();
    if (!tracks || !tracks.length) {
        catalogContent.innerHTML = '<div class="catalog-empty">No tracks available</div>';
        return;
    }

    const artistMap = new Map();
    const trackSet = new Set();

    tracks.forEach(track => {
        const trackId = track.id;
        if (trackSet.has(trackId)) return;
        trackSet.add(trackId);

        const mainArtist = track.artists?.[0] || null;
        const featArtist = track.featArtist || track.artists?.[1] || null;

        if (mainArtist) {
            if (!artistMap.has(mainArtist)) artistMap.set(mainArtist, []);
            if (!artistMap.get(mainArtist).some(t => t.id === trackId)) artistMap.get(mainArtist).push(track);
        }
        if (featArtist && featArtist !== mainArtist) {
            if (!artistMap.has(featArtist)) artistMap.set(featArtist, []);
            if (!artistMap.get(featArtist).some(t => t.id === trackId)) artistMap.get(featArtist).push(track);
        }
    });

    const sortedArtists = Array.from(artistMap.keys()).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    const letterGroups = new Map();

    sortedArtists.forEach(artist => {
        const firstLetter = artist.charAt(0).toUpperCase();
        if (!letterGroups.has(firstLetter)) letterGroups.set(firstLetter, []);
        letterGroups.get(firstLetter).push(artist);
    });

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    // Letras filtro topo
    let html = '<div class="catalog-letters">';
    alphabet.forEach(letter => {
        html += `<button class="catalog-letter-btn${currentLetterFilter === letter ? ' active' : ''}" data-letter="${letter}">${letter}</button>`;
    });
    html += `<button class="catalog-letter-btn${currentLetterFilter === 'all' ? ' active' : ''}" data-letter="all">All</button>`;
    html += '</div>';

    // Grid de artistas filtrados
    html += '<div class="catalog-grid">';
    alphabet.forEach(letter => {
        if (currentLetterFilter && currentLetterFilter !== 'all' && currentLetterFilter !== letter) return;

        const artists = letterGroups.get(letter) || [];
        if (!artists.length) return;

        html += '<div class="catalog-letter-section">';
        html += `<div class="catalog-letter">${letter}</div>`;
        html += '<ul class="catalog-artists">';
        artists.forEach(artist => {
            html += `<li class="catalog-artist-item">
                <a href="#" class="catalog-artist-link" data-artist="${escapeHtml(artist)}">${escapeHtml(artist)}</a>
            </li>`;
        });
        html += '</ul></div>';
    });
    html += '</div>';

    catalogContent.innerHTML = html;

    // Letras filtragem
    catalogContent.querySelectorAll('.catalog-letter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentLetterFilter = btn.getAttribute('data-letter');
            buildCatalog();
        });
    });

    // Abrir artista
    catalogContent.querySelectorAll('.catalog-artist-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const artistName = link.getAttribute('data-artist');
            const artistTracks = artistMap.get(artistName);
            if (artistTracks?.length) openArtistTracks(artistName, artistTracks);
        });
    });
}

/* ------------------- Artist Overlay ------------------- */

function initArtistOverlay() {
    artistOverlay = document.getElementById('artistOverlay');
    artistTracksContainer = document.getElementById('artistTracks');

    const closeBtn = document.getElementById('artistClose');
    if (closeBtn) closeBtn.addEventListener('click', closeArtistTracks);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && artistOverlay?.classList.contains('active')) {
            closeArtistTracks();
        }
    });

    artistOverlay?.addEventListener('click', (e) => {
        if (e.target === artistOverlay) closeArtistTracks();
    });
}

function openArtistTracks(artistName, tracks) {
    if (!artistOverlay || !artistTracksContainer) return;

    currentArtistTracks = tracks;
    document.getElementById('artistTitle').textContent = artistName;

    buildArtistTracks(tracks);
    artistOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

window.openArtistTracks = openArtistTracks;

function closeArtistTracks() {
    if (!artistOverlay) return;
    artistOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

/* ------------------- Artist Tracks List ------------------- */

function buildArtistTracks(tracks) {
    if (!artistTracksContainer) return;
    if (!tracks.length) {
        artistTracksContainer.innerHTML = '<div class="artist-empty">No tracks available</div>';
        return;
    }

    let html = '<div class="artist-tracks-list">';
    tracks.forEach(track => {
        html += `
        <div class="artist-track-item">
            <img class="artist-track-cover" src="${escapeHtml(track.cover)}" alt="${escapeHtml(track.title)}">
            <div class="artist-track-info">
                <div class="artist-track-title">${escapeHtml(track.title)}</div>
                <div class="artist-track-artist">${escapeHtml(track.artists.join(', '))}</div>
            </div>
            <button class="artist-track-play-btn" data-track-id="${track.id}">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </button>
        </div>`;
    });
    html += '</div>';

    artistTracksContainer.innerHTML = html;

    artistTracksContainer.querySelectorAll('.artist-track-play-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            const track = tracks.find(t => t.id == btn.dataset.trackId);
            if (track && typeof window.playTrack === 'function') {
                window.playTrack(track);
                closeArtistTracks();
                closeCatalog();
            }
        });
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function refreshCatalog() { buildCatalog(); }
window.refreshCatalog = refreshCatalog;
