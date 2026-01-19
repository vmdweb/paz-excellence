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
    
    // Garantir que a URL da imagem está correta e adicionar cache-busting se necessário
    let coverUrl = track.cover;
    if (coverUrl && !coverUrl.startsWith('blob:') && !coverUrl.includes('?')) {
        coverUrl += '?t=' + Date.now();
    }
    
    coverImg.src = coverUrl || '';
    coverImg.alt = track.title || '';
    
    // Error handling para imagens que não carregam
    coverImg.onerror = function() {
        this.style.display = 'none';
        cover.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    };
    
    coverImg.onload = function() {
        this.style.opacity = '1';
    };
    
    coverImg.style.opacity = '0';
    coverImg.style.transition = 'opacity 0.3s ease';
    
    cover.appendChild(coverImg);

    const info = document.createElement('div');
    info.className = 'playlist-item-info';
    
    const title = document.createElement('div');
    title.className = 'playlist-item-title';
    title.textContent = track.title || '';
    
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
    
    // Escutar evento tracksUpdated (mesma aba)
    window.addEventListener('tracksUpdated', async () => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f538aeba-5d1a-4433-b1bf-60e9cc7a1e35',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'playlist.js:131',message:'tracksUpdated event RECEIVED',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        await refreshPlaylist();
        if (typeof refreshCatalog === 'function') {
            refreshCatalog();
        }
    });
    
    // Escutar mudanças no localStorage (outras abas)
    window.addEventListener('storage', async (e) => {
        if (e.key === 'tracksLastUpdated') {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/f538aeba-5d1a-4433-b1bf-60e9cc7a1e35',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'playlist.js:140',message:'storage event RECEIVED (cross-tab)',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            await refreshPlaylist();
            if (typeof refreshCatalog === 'function') {
                refreshCatalog();
            }
        }
    });
    
    // Polling como fallback adicional (verifica a cada 5 segundos se há novas tracks)
    let lastTrackCount = 0;
    setInterval(async () => {
        const tracks = await loadTracks();
        if (tracks.length !== lastTrackCount) {
            lastTrackCount = tracks.length;
            await refreshPlaylist();
            if (typeof refreshCatalog === 'function') {
                refreshCatalog();
            }
        }
    }, 5000);
});
