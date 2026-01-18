/**
 * Playlist Module
 * Handles playlist rendering and track selection
 * Public UI only - no upload functionality
 */

let currentActiveIndex = -1;

/**
 * Initialize and render playlist
 */
async function initPlaylist() {
    const tracks = await loadTracks();
    const playlist = document.getElementById('playlist');
    
    if (tracks.length === 0) {
        const emptyText = typeof t === 'function' ? t('noTracksAvailable') : 'No tracks available';
        playlist.innerHTML = `<div style="padding: 24px; color: rgba(255, 255, 255, 0.5);">${emptyText}</div>`;
        return;
    }

    playlist.innerHTML = '';
    
    tracks.forEach((track, index) => {
        const item = createPlaylistItem(track, index);
        playlist.appendChild(item);
    });

    if (tracks.length > 0) {
        loadTrack(tracks[0]);
        setActiveTrack(0);
    }
}

function createPlaylistItem(track, index) {
    const item = document.createElement('div');
    item.className = 'playlist-item';
    item.dataset.index = index;

    const cover = document.createElement('div');
    cover.className = 'playlist-item-cover';
    const coverImg = document.createElement('img');
    coverImg.src = track.cover;
    coverImg.alt = track.title;
    cover.appendChild(coverImg);

    const info = document.createElement('div');
    info.className = 'playlist-item-info';
    
    const title = document.createElement('div');
    title.className = 'playlist-item-title';
    title.textContent = track.title;
    
    const artists = document.createElement('div');
    artists.className = 'playlist-item-artists';
    artists.textContent = formatArtists(track);

    info.appendChild(title);
    info.appendChild(artists);

    item.appendChild(cover);
    item.appendChild(info);

    item.addEventListener('click', () => {
        if (typeof playTrack === 'function') {
            playTrack(track);
        } else if (typeof loadTrack === 'function') {
            loadTrack(track);
        }
        setActiveTrack(index);
    });

    return item;
}

function setActiveTrack(index) {
    const items = document.querySelectorAll('.playlist-item');
    items.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    currentActiveIndex = index;
}

function formatArtists(track) {
    if (!track || !track.artists || track.artists.length === 0) {
        return '';
    }
    
    const mainArtist = track.artists[0];
    const featArtist = track.featArtist || (track.artists.length > 1 ? track.artists[1] : null);
    
    if (featArtist && featArtist !== mainArtist) {
        return `${mainArtist} feat. ${featArtist}`;
    }
    
    return track.artists.join(', ');
}

async function refreshPlaylist() {
    await initPlaylist();
}

window.refreshPlaylist = refreshPlaylist;

document.addEventListener('DOMContentLoaded', async () => {
    await initPlayer();
    await initPlaylist();
    initCatalog();
    initShows();
    initContact();
    
    const showsBtn = document.getElementById('showsBtn');
    if (showsBtn) {
        showsBtn.addEventListener('click', openShows);
    }
    
    const catalogBtn = document.getElementById('catalogBtn');
    if (catalogBtn) {
        catalogBtn.addEventListener('click', openCatalog);
    }
    
    const contactBtn = document.getElementById('contactBtn');
    if (contactBtn) {
        contactBtn.addEventListener('click', openContact);
    }
    
    window.addEventListener('tracksUpdated', async () => {
        await refreshPlaylist();
        if (typeof refreshCatalog === 'function') {
            refreshCatalog();
        }
    });
});
