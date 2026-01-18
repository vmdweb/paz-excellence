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
    try {
        // URL do JSON que você envia para o Cloudinary
        const cloudinaryJsonUrl = "https://res.cloudinary.com/dodnqnyof/raw/upload/tracks_yvlriw.json";

        const response = await fetch(cloudinaryJsonUrl);
        if (!response.ok) {
            throw new Error('Failed to load tracks from Cloudinary');
        }

        const tracks = await response.json();
        tracksData = Array.isArray(tracks) ? tracks : [];
        return tracksData;

    } catch (error) {
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
