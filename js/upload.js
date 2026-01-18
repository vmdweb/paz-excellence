/**
 * Upload Module - Netlify Functions + Cloudinary
 */

let coverFile = null;
let audioFile = null;

document.addEventListener("DOMContentLoaded", () => {
  const coverInput = document.getElementById("dashCoverInput");
  const audioInput = document.getElementById("dashAudioInput");
  const uploadForm = document.getElementById("dashboardUploadForm");
  const coverPreview = document.getElementById("dashCoverPreview");

  if (coverInput) {
    coverInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file || !file.type.startsWith("image/")) return alert("Select a valid image");
      coverFile = file;
      if (coverPreview) coverPreview.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Cover preview">`;
    });
  }

  if (audioInput) {
    audioInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file || !file.type.startsWith("audio/")) return alert("Select a valid audio file");
      audioFile = file;
    });
  }

  if (uploadForm) uploadForm.addEventListener("submit", handleSubmit);
});

async function handleSubmit(e) {
  e.preventDefault();

  const title = document.getElementById("dashTrackTitle").value.trim();
  const artist = document.getElementById("dashTrackArtist").value.trim();
  const featArtist = document.getElementById("dashTrackFeat").value.trim();
  const country = document.getElementById("dashTrackCountry").value.trim();

  if (!title || !artist || !country || !coverFile || !audioFile) {
    return alert("Fill all required fields and select cover/audio files.");
  }

  try {
    const formData = new FormData();
    formData.append("cover", coverFile);
    formData.append("audio", audioFile);
    formData.append("title", title);
    formData.append("artist", artist);
    if (featArtist) formData.append("featArtist", featArtist);
    formData.append("country", country);

    const res = await fetch("/.netlify/functions/uploadTrack", {
      method: "POST",
      body: formData
    });

    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();

    // Atualiza localStorage com a track
    let tracks = JSON.parse(localStorage.getItem("uploadedTracks") || "[]");
    const maxId = Math.max(0, ...tracks.map(t => t.id || 0));
    const newTrack = {
      id: maxId + 1,
      title,
      artists: featArtist ? [artist, featArtist] : [artist],
      cover: data.coverUrl,
      audio: data.audioUrl,
      country,
      createdAt: new Date().toISOString()
    };
    tracks.push(newTrack);
    localStorage.setItem("uploadedTracks", JSON.stringify(tracks));

    alert("Track uploaded successfully!");
    document.getElementById("dashboardUploadForm").reset();
    if (document.getElementById("dashCoverPreview")) document.getElementById("dashCoverPreview").innerHTML = "";
    coverFile = null;
    audioFile = null;

  } catch (err) {
    console.error(err);
    alert("Error uploading track: " + err.message);
  }
}
