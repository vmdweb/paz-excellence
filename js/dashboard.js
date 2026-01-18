/**
 * Dashboard Module - Cloudinary JSON
 * Lê e gerencia tracks direto do JSON fixo no Cloudinary
 */

document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("dashboardContainer")) {
        initLogin();
        initNavigation();
        initUploadForm();
        initEditForm?.();
        initLogout();
    }

    if (typeof initCatalog === "function") {
        initCatalog();
    }
});

let dashCoverFile = null;
let dashAudioFile = null;
let currentSection = "upload";

/* ---------------------- LOGIN ---------------------- */
function showLoginScreen() {
    document.getElementById("passwordScreen").style.display = "flex";
    document.getElementById("dashboardContainer").style.display = "none";
}

function showDashboard() {
    document.getElementById("passwordScreen").style.display = "none";
    document.getElementById("dashboardContainer").style.display = "flex";
}

function initLogin() {
    const usernameInput = document.getElementById("usernameInput");
    const passwordInput = document.getElementById("passwordInput");
    const passwordSubmit = document.getElementById("passwordSubmit");
    const passwordError = document.getElementById("passwordError");

    passwordSubmit?.addEventListener("click", attemptLogin);
    passwordInput?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") attemptLogin();
    });

    function attemptLogin() {
        if (authenticate(usernameInput.value, passwordInput.value)) {
            showDashboard();
            usernameInput.value = "";
            passwordInput.value = "";
            passwordError.textContent = "";
        } else {
            passwordError.textContent = "Incorrect username or password";
            passwordInput.value = "";
            passwordInput.focus();
        }
    }
}

function initLogout() {
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        if (confirm("Are you sure you want to logout?")) {
            logout();
            window.location.href = "dashboard.html";
        }
    });
}

/* ---------------------- NAV ---------------------- */
function initNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const titles = { upload: "Upload Tracks", catalog: "Manage Catalog", calendar: "Shows Calendar" };

    navItems.forEach((item) => {
        item.addEventListener("click", async () => {
            const section = item.dataset.section;
            currentSection = section;

            navItems.forEach((nav) => nav.classList.remove("active"));
            item.classList.add("active");

            document.querySelectorAll(".content-section").forEach((sec) => sec.classList.remove("active"));
            document.getElementById(`${section}Section`).classList.add("active");

            document.getElementById("contentTitle").textContent = titles[section] || section;

            if (section === "catalog") await loadCatalog();
            else if (section === "calendar") await loadShowsList();
        });
    });
}

/* ---------------------- UPLOAD ---------------------- */
function initUploadForm() {
    const coverInput = document.getElementById("dashCoverInput");
    const audioInput = document.getElementById("dashAudioInput");
    const form = document.getElementById("dashboardUploadForm");
    const coverPreview = document.getElementById("dashCoverPreview");

    coverInput?.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith("image/")) return showDashError("dashCoverError", "Select a valid image");
        dashCoverFile = file;
        coverPreview.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Cover preview">`;
        hideDashError("dashCoverError");
    });

    audioInput?.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith("audio/")) return showDashError("dashAudioError", "Select a valid audio file");
        dashAudioFile = file;
        hideDashError("dashAudioError");
    });

    form?.addEventListener("submit", handleDashSubmit);
}

async function handleDashSubmit(e) {
    e.preventDefault();
    if (!validateDashForm()) return;

    const title = document.getElementById("dashTrackTitle").value.trim();
    const artist = document.getElementById("dashTrackArtist").value.trim();
    const featArtist = document.getElementById("dashTrackFeat").value.trim();
    const country = document.getElementById("dashTrackCountry").value;
    const curatorNotes = document.getElementById("dashCuratorNotes").value.trim();
    const releaseDate = document.getElementById("dashReleaseDate").value;

    const submitBtn = document.getElementById("uploadSubmitBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Uploading...";

    try {
        // upload cover/audio
        const coverUrl = await uploadToCloudinary(dashCoverFile, "image", "covers_unsigned");
        const audioUrl = await uploadToCloudinary(dashAudioFile, "video", "audio_unsigned");

        // carregar JSON do Cloudinary
        let tracks = [];
        try {
            const res = await fetch("https://res.cloudinary.com/dodnqnyof/raw/upload/v1768675088/tracks_yvlriw.json");
            if (res.ok) tracks = await res.json();
        } catch {}

        // adicionar nova track
        const maxId = Math.max(0, ...tracks.map((t) => t.id || 0));
        const newTrack = {
            id: maxId + 1,
            title,
            artists: featArtist ? [artist, featArtist] : [artist],
            cover: coverUrl,
            audio: audioUrl,
            country,
            curatorNotes,
            releaseDate,
            createdAt: new Date().toISOString(),
        };
        if (featArtist) newTrack.featArtist = featArtist;
        tracks.push(newTrack);

        // subir JSON atualizado
        await uploadJSONToCloudinary(tracks, "tracks_yvlriw");

        // fallback localStorage
        localStorage.setItem("uploadedTracks", JSON.stringify(tracks));
        alert("Track uploaded successfully!");

        // reset
        document.getElementById("dashboardUploadForm").reset();
        document.getElementById("dashCoverPreview").innerHTML = "";
        dashCoverFile = null;
        dashAudioFile = null;
    } catch (err) {
        console.error(err);
        alert("Upload failed: " + err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Upload Track";
    }
}

function validateDashForm() {
    let valid = true;
    if (!document.getElementById("dashTrackTitle").value.trim()) { showDashError("dashTitleError", "Title required"); valid = false; }
    if (!document.getElementById("dashTrackArtist").value.trim()) { showDashError("dashArtistError", "Artist required"); valid = false; }
    if (!document.getElementById("dashTrackCountry").value) { showDashError("dashCountryError", "Country required"); valid = false; }
    if (!dashCoverFile) { showDashError("dashCoverError", "Cover required"); valid = false; }
    if (!dashAudioFile) { showDashError("dashAudioError", "Audio required"); valid = false; }
    return valid;
}

function showDashError(fieldId, msg) { const el = document.getElementById(fieldId); if (el) { el.textContent = msg; el.classList.add("show"); } }
function hideDashError(fieldId) { const el = document.getElementById(fieldId); if (el) el.classList.remove("show"); }

/* ---------------------- CATALOG ---------------------- */
async function loadCatalog() {
    const catalogList = document.getElementById("catalogList");
    const trackCount = document.getElementById("trackCount");
    if (!catalogList) return;
    catalogList.innerHTML = "<div class='loading'>Loading tracks...</div>";

    let tracks = [];
    try { tracks = await loadTracks(); } catch {}

    trackCount.textContent = `${tracks.length} track${tracks.length !== 1 ? "s" : ""}`;
    if (tracks.length === 0) { catalogList.innerHTML = "<div>No tracks</div>"; return; }

    catalogList.innerHTML = "";
    tracks.forEach((track) => {
        const item = document.createElement("div");
        item.className = "catalog-item";
        item.innerHTML = `
            <img src="${track.cover}" alt="${track.title}">
            <p>${track.title} - ${track.artists.join(", ")}</p>
            <audio controls src="${track.audio}"></audio>
        `;
        catalogList.appendChild(item);
    });
}

/* ---------------------- CLOUDINARY UPLOAD HELPERS ---------------------- */
async function uploadToCloudinary(file, type, preset) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", preset);
    const url = `https://api.cloudinary.com/v1_1/dodnqnyof/${type}/upload`;
    const res = await fetch(url, { method: "POST", body: fd });
    if (!res.ok) throw new Error((await res.json()).error?.message || "Cloudinary upload error");
    const data = await res.json();
    return data.secure_url;
}

async function uploadJSONToCloudinary(jsonData, publicId) {
    const fd = new FormData();
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
    fd.append("file", blob, "tracks.json");
    fd.append("upload_preset", "json_unsigned");
    fd.append("public_id", publicId);
    fd.append("resource_type", "raw");

    const url = `https://api.cloudinary.com/v1_1/dodnqnyof/raw/upload`;
    const res = await fetch(url, { method: "POST", body: fd });
    if (!res.ok) throw new Error((await res.json()).error?.message || "JSON upload error");
    const data = await res.json();
    return data.secure_url;
}

/* ---------------------- LOAD TRACKS ---------------------- */
async function loadTracks() {
    try {
        const res = await fetch("https://res.cloudinary.com/dodnqnyof/raw/upload/v1768675088/tracks_yvlriw.json");
        if (!res.ok) return [];
        return await res.json();
    } catch { return []; }
}
