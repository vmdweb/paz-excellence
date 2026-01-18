/**
 * Data Loader Module
 * Handles loading tracks from JSON file and localStorage
 * Merges static tracks with user-uploaded tracks
 * Applies track ordering
 */

let tracksData = [];

/**
 * Load all tracks (JSON + uploaded from localStorage)
 * @returns {Promise<Array>} Array of track objects
 */
async function loadTracks() {
    try {
        const response = await fetch('data/tracks.json');
        if (!response.ok) {
            throw new Error('Failed to load tracks');
        }
        const jsonTracks = await response.json();
        
        const uploadedTracks = getUploadedTracks();
        const allTracks = [...jsonTracks, ...uploadedTracks];
        
        const orderedTracks = applyTrackOrder(allTracks);
        tracksData = orderedTracks;
        return tracksData;
    } catch (error) {
        console.error('Error loading tracks:', error);
        const uploadedTracks = getUploadedTracks();
        const orderedTracks = applyTrackOrder(uploadedTracks);
        tracksData = orderedTracks;
        return tracksData;
    }
}

function applyTrackOrder(tracks) {
    try {
        const order = localStorage.getItem('trackOrder');
        if (!order) {
            return tracks;
        }
        
        const orderArray = JSON.parse(order);
        if (!Array.isArray(orderArray) || orderArray.length === 0) {
            return tracks;
        }
        
        const trackMap = new Map(tracks.map(t => [t.id, t]));
        const ordered = [];
        const unordered = [];
        
        orderArray.forEach(id => {
            const track = trackMap.get(id);
            if (track) {
                ordered.push(track);
                trackMap.delete(id);
            }
        });
        
        trackMap.forEach(track => {
            unordered.push(track);
        });
        
        return [...ordered, ...unordered];
    } catch (error) {
        console.error('Error applying track order:', error);
        return tracks;
    }
}

function getUploadedTracks() {
    try {
        const stored = localStorage.getItem('uploadedTracks');
        if (stored) {
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : [];
        }
    } catch (error) {
        console.error('Error loading uploaded tracks:', error);
    }
    return [];
}
