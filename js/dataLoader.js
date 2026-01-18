/**
 * Data Loader Module
 * Loads tracks from Cloudinary JSON
 * Uses localStorage only as fallback
 */

const TRACKS_URL =
  "https://res.cloudinary.com/dodnqnyof/raw/upload/v1768675088/tracks_yvlriw.json";

let tracksData = [];

/**
 * Load all tracks (Cloudinary JSON + fallback localStorage)
 * @returns {Promise<Array>}
 */
async function loadTracks() {
  try {
    const response = await fetch('data/tracks-db.json');
const tracks = await response.json();
tracksData = tracks;
return tracksData;

  } catch (error) {
    console.warn("Cloudinary failed, using localStorage", error);

    const uploadedTracks = getUploadedTracks();
    tracksData = applyTrackOrder(uploadedTracks);

    return tracksData;
  }
}

/**
 * Apply saved ordering
 */
function applyTrackOrder(tracks) {
  try {
    const order = localStorage.getItem("trackOrder");
    if (!order) return tracks;

    const orderArray = JSON.parse(order);
    if (!Array.isArray(orderArray)) return tracks;

    const map = new Map(tracks.map(t => [t.id, t]));
    const ordered = [];

    orderArray.forEach(id => {
      if (map.has(id)) {
        ordered.push(map.get(id));
        map.delete(id);
      }
    });

    return [...ordered, ...map.values()];
  } catch {
    return tracks;
  }
}

/**
 * Fallback local tracks
 */
function getUploadedTracks() {
  try {
    const stored = localStorage.getItem("uploadedTracks");
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
