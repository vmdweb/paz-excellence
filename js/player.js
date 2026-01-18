/**
 * Player Module
 * Handles audio playback, waveform visualization, and track loading
 * Waveform is rendered using WaveSurfer.js
 */

let wavesurfer = null;
let currentTrack = null;
let audioElement = null;

// Make wavesurfer globally accessible
window.wavesurfer = null;

/**
 * Initialize player and waveform
 */
async function initPlayer() {
    audioElement = document.getElementById('audioElement');
    
    if (!audioElement) {
        console.error('Audio element not found');
        return;
    }
    
    const waveformContainer = document.getElementById('waveform');
    if (!waveformContainer) {
        console.error('Waveform container not found');
        return;
    }
    
    wavesurfer = WaveSurfer.create({
        container: waveformContainer,
        waveColor: 'rgba(255, 255, 255, 0.2)',
        progressColor: 'rgba(255, 255, 255, 1)',
        cursorColor: 'rgba(255, 255, 255, 0.8)',
        barWidth: 3,
        barRadius: 2,
        barGap: 2,
        height: 100,
        normalize: true,
        backend: 'MediaElement',
        media: audioElement,
        mediaControls: false,
        interact: true,
        cursorWidth: 2,
        fillParent: true
    });
    
    window.wavesurfer = wavesurfer;

    wavesurfer.on('ready', () => {
        console.log('Waveform ready');
        updateTimeDisplay();
    });

    wavesurfer.on('play', () => {
        updatePlayPauseButton(true);
        updateLogoRotation(true);
        startTimeUpdate();
    });

    wavesurfer.on('pause', () => {
        updatePlayPauseButton(false);
        updateLogoRotation(false);
        stopTimeUpdate();
    });

    wavesurfer.on('finish', () => {
        updatePlayPauseButton(false);
        updateLogoRotation(false);
        stopTimeUpdate();
    });

    wavesurfer.on('timeupdate', () => {
        updateTimeDisplay();
    });
    
    // Ensure progress updates during playback
    wavesurfer.on('audioprocess', () => {
        // Progress is handled automatically by WaveSurfer
    });

    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (!wavesurfer) {
                console.error('Play button: wavesurfer not initialized');
                return;
            }
            
            if (wavesurfer.isPlaying()) {
                wavesurfer.pause();
            } else {
                if (!currentTrack) {
                    console.warn('Play button: no track loaded');
                    return;
                }
                
                // Try to play - if not ready, it will wait
                wavesurfer.play().catch(err => {
                    console.error('Error playing audio:', err);
                });
            }
        });
    }
}

/**
 * Play a track immediately
 * Stops current playback, loads track, and starts playback
 * @param {Object} track - Track object with cover, audio, title, artists
 */
function playTrack(track) {
    console.log('playTrack called with:', track);
    
    if (!track || !wavesurfer) {
        console.error('playTrack: track or wavesurfer missing', { track, wavesurfer });
        return;
    }

    if (!track.audio) {
        console.error('playTrack: track.audio is missing', track);
        return;
    }

    // Always stop and clear current playback first
    console.log('Stopping current playback');
    if (wavesurfer.isPlaying()) {
        wavesurfer.pause();
    }
    wavesurfer.stop();
    wavesurfer.empty();
    
    // Small delay to ensure cleanup
    setTimeout(() => {
        // Update global track state
        currentTrack = track;

        // Update UI (shared logic)
        updateTrackUI(track);
        
        // Reset UI state
        updatePlayPauseButton(false);
        updateLogoRotation(false);
        updateTimeDisplay();
        
        // Load new audio source and start playback
        try {
            console.log('Loading track audio:', track.audio);
            wavesurfer.load(track.audio);
            
            // Start playback when ready
            const startPlayback = () => {
                console.log('Track ready, starting playback');
                if (wavesurfer && !wavesurfer.isPlaying()) {
                    wavesurfer.play().catch(err => {
                        console.error('Error playing:', err);
                    });
                }
            };
            
            // Use ready event
            wavesurfer.once('ready', startPlayback);
        } catch (error) {
            console.error('Error loading track:', error);
        }
    }, 50);
}

/**
 * Load a track into the player (without auto-play)
 * Updates background, cover, metadata, and waveform
 * @param {Object} track - Track object with cover, audio, title, artists
 */
function loadTrack(track) {
    if (!track || !wavesurfer) {
        console.error('loadTrack: track or wavesurfer missing', { track, wavesurfer });
        return;
    }

    if (!track.audio) {
        console.error('loadTrack: track.audio is missing', track);
        return;
    }

    // Stop and clear current playback
    if (wavesurfer.isPlaying()) {
        wavesurfer.pause();
    }
    wavesurfer.stop();
    wavesurfer.empty();

    // Update global track state
    currentTrack = track;

    // Update UI (shared logic)
    updateTrackUI(track);
    
    // Reset UI state
    updatePlayPauseButton(false);
    updateLogoRotation(false);
    updateTimeDisplay();
    
    // Load new audio source
    try {
        console.log('Loading track:', track.title, 'Audio URL:', track.audio);
        wavesurfer.load(track.audio);
        
        // Listen for errors
        wavesurfer.once('error', (error) => {
            console.error('Error loading audio:', error);
            alert('Error loading audio. Please check the audio URL.');
        });
    } catch (error) {
        console.error('Error in loadTrack:', error);
        alert('Error loading track: ' + error.message);
    }
}

/**
 * Update track UI elements (shared between loadTrack and playTrack)
 */
function updateTrackUI(track) {

    const backgroundImage = document.getElementById('backgroundImage');
    const playerTitle = document.getElementById('playerTitle');
    const playerArtists = document.getElementById('playerArtists');

    if (backgroundImage) {
        backgroundImage.style.backgroundImage = `url(${track.cover})`;
    }

    if (playerTitle) {
        playerTitle.textContent = track.title || '';
    }

    // Update Now Playing header
    const nowPlayingTitle = document.getElementById('nowPlayingTitle');
    const nowPlayingArtist = document.getElementById('nowPlayingArtist');
    if (nowPlayingTitle) {
        nowPlayingTitle.textContent = track.title || '—';
    }
    if (nowPlayingArtist) {
        const artistDisplay = formatArtists(track);
        nowPlayingArtist.textContent = artistDisplay || '—';
    }

    const playerArtistMain = document.getElementById('playerArtistMain');
    const playerArtistFeat = document.getElementById('playerArtistFeat');
    const playerFeat = document.getElementById('playerFeat');
    
    if (playerArtists && playerArtistMain) {
        const mainArtist = track.artists && track.artists.length > 0 ? track.artists[0] : null;
        const featArtist = track.featArtist || (track.artists && track.artists.length > 1 ? track.artists[1] : null);
        
        if (mainArtist) {
            playerArtistMain.textContent = mainArtist;
            playerArtistMain.style.display = 'inline';
            playerArtistMain.onclick = (e) => {
                e.preventDefault();
                if (typeof loadTracks === 'function') {
                    loadTracks().then(allTracks => {
                        const artistTracks = allTracks.filter(t => {
                            const tMainArtist = t.artists && t.artists.length > 0 ? t.artists[0] : null;
                            const tFeatArtist = t.featArtist || (t.artists && t.artists.length > 1 ? t.artists[1] : null);
                            return tMainArtist === mainArtist || tFeatArtist === mainArtist;
                        });
                        
                        if (artistTracks.length > 0 && (typeof window.openArtistTracks === 'function' || typeof openArtistTracks === 'function')) {
                            const openFn = window.openArtistTracks || openArtistTracks;
                            openFn(mainArtist, artistTracks);
                        }
                    });
                }
            };
        } else {
            playerArtistMain.style.display = 'none';
        }
        
        if (featArtist && featArtist !== mainArtist) {
            playerFeat.style.display = 'inline';
            playerArtistFeat.textContent = featArtist;
            playerArtistFeat.style.display = 'inline';
            playerArtistFeat.onclick = (e) => {
                e.preventDefault();
                if (typeof loadTracks === 'function') {
                    loadTracks().then(allTracks => {
                        const artistTracks = allTracks.filter(t => {
                            const tMainArtist = t.artists && t.artists.length > 0 ? t.artists[0] : null;
                            const tFeatArtist = t.featArtist || (t.artists && t.artists.length > 1 ? t.artists[1] : null);
                            return tMainArtist === featArtist || tFeatArtist === featArtist;
                        });
                        
                        if (artistTracks.length > 0 && (typeof window.openArtistTracks === 'function' || typeof openArtistTracks === 'function')) {
                            const openFn = window.openArtistTracks || openArtistTracks;
                            openFn(featArtist, artistTracks);
                        }
                    });
                }
            };
        } else {
            playerFeat.style.display = 'none';
            playerArtistFeat.style.display = 'none';
        }
    }
}

function updatePlayPauseButton(isPlaying) {
    const playIcon = window.currentPlayIcon || document.querySelector('.play-icon');
    const pauseIcon = window.currentPauseIcon || document.querySelector('.pause-icon');

    if (playIcon && pauseIcon) {
        if (isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }
}

function updateLogoRotation(isPlaying) {
    const playerLogo = document.getElementById('playerLogo');
    if (playerLogo) {
        if (isPlaying) {
            playerLogo.classList.add('playing');
            playerLogo.classList.remove('paused');
        } else {
            playerLogo.classList.remove('playing');
            playerLogo.classList.add('paused');
        }
    }
}

function getCurrentTrack() {
    return currentTrack;
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

let timeUpdateInterval = null;

/**
 * Update time display (current / total)
 */
function updateTimeDisplay() {
    if (!wavesurfer) return;
    
    const currentTimeEl = document.getElementById('playerTimeCurrent');
    const totalTimeEl = document.getElementById('playerTimeTotal');
    
    if (currentTimeEl) {
        const current = wavesurfer.getCurrentTime();
        currentTimeEl.textContent = formatTime(current);
    }
    
    if (totalTimeEl) {
        const duration = wavesurfer.getDuration();
        if (duration && isFinite(duration)) {
            totalTimeEl.textContent = formatTime(duration);
        }
    }
}

/**
 * Format seconds to MM:SS
 */
function formatTime(seconds) {
    if (!seconds || !isFinite(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Start time update interval
 */
function startTimeUpdate() {
    if (timeUpdateInterval) return;
    timeUpdateInterval = setInterval(() => {
        updateTimeDisplay();
    }, 100);
}

/**
 * Stop time update interval
 */
function stopTimeUpdate() {
    if (timeUpdateInterval) {
        clearInterval(timeUpdateInterval);
        timeUpdateInterval = null;
    }
}

// Make functions globally accessible
window.playTrack = playTrack;
window.loadTrack = loadTrack;
