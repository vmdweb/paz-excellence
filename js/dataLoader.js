/**
 * Data Loader Module
 * Loads tracks from Cloudinary JSON
 */

let tracksData = [];

/**
 * Load all tracks from Cloudinary JSON
 * @returns {Promise<Array>} Array of track objects
 */
async function loadTracks() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f538aeba-5d1a-4433-b1bf-60e9cc7a1e35',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dataLoader.js:12',message:'loadTracks ENTRY',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    try {
        // URL do JSON que você envia para o Cloudinary (adiciona cache-busting para evitar cache)
        const cloudinaryJsonUrl = "https://res.cloudinary.com/dodnqnyof/raw/upload/tracks_yvlriw.json?t=" + Date.now();

        const response = await fetch(cloudinaryJsonUrl);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f538aeba-5d1a-4433-b1bf-60e9cc7a1e35',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dataLoader.js:18',message:'loadTracks FETCH RESPONSE',data:{ok:response.ok,status:response.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        
        if (!response.ok) {
            throw new Error('Failed to load tracks from Cloudinary');
        }

        const tracks = await response.json();
        tracksData = Array.isArray(tracks) ? tracks : [];
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f538aeba-5d1a-4433-b1bf-60e9cc7a1e35',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dataLoader.js:23',message:'loadTracks SUCCESS',data:{tracksCount:tracksData.length,firstTrackId:tracksData[0]?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        
        return tracksData;

    } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f538aeba-5d1a-4433-b1bf-60e9cc7a1e35',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dataLoader.js:27',message:'loadTracks ERROR',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        console.error('Error loading tracks:', error);
        tracksData = [];
        return tracksData;
    }
}

/**
 * Get cached tracks
 */
function getTracksData() {
    return tracksData;
}
