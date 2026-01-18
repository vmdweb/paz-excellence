/**
 * Dashboard Module - Cloudinary JSON
 * Upload de tracks e leitura do catálogo
 */

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("dashboardContainer")) {
      initLogin();
      initNavigation();
      initUploadForm();
      initLogout();
    }
  
    if (typeof initCatalog === "function") {
      initCatalog();
    }
  });
  
  let dashCoverFile = null;
  let dashAudioFile = null;
  
  /* ---------------- LOGIN ---------------- */
  
  function showDashboard() {
    document.getElementById("passwordScreen").style.display = "none";
    document.getElementById("dashboardContainer").style.display = "flex";
  }
  
  function initLogin() {
    const usernameInput = document.getElementById("usernameInput");
    const passwordInput = document.getElementById("passwordInput");
    const submitBtn = document.getElementById("passwordSubmit");
    const errorBox = document.getElementById("passwordError");
  
    submitBtn?.addEventListener("click", attemptLogin);
    passwordInput?.addEventListener("keypress", e => {
      if (e.key === "Enter") attemptLogin();
    });
  
    function attemptLogin() {
      if (authenticate(usernameInput.value, passwordInput.value)) {
        showDashboard();
        errorBox.textContent = "";
      } else {
        errorBox.textContent = "Incorrect username or password";
      }
    }
  }
  
  /* ---------------- LOGOUT ---------------- */
  
  function initLogout() {
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
      localStorage.removeItem("dashboardAuth");
      location.reload();
    });
  }
  
  /* ---------------- NAVIGATION ---------------- */
  
  function initNavigation() {
    document.querySelectorAll(".nav-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const section = btn.dataset.section;
  
        document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
  
        document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));
        document.getElementById(section + "Section")?.classList.add("active");
  
        document.getElementById("contentTitle").textContent =
          btn.querySelector(".nav-label")?.textContent || "";
      });
    });
  }
  
  /* ---------------- UPLOAD FORM ---------------- */
  
  function initUploadForm() {
    const form = document.getElementById("dashboardUploadForm");
    const coverInput = document.getElementById("dashCoverInput");
    const audioInput = document.getElementById("dashAudioInput");
    const preview = document.getElementById("dashCoverPreview");
  
    coverInput?.addEventListener("change", e => {
      dashCoverFile = e.target.files[0];
      if (dashCoverFile) {
        preview.innerHTML = `<img src="${URL.createObjectURL(dashCoverFile)}">`;
      }
    });
  
    audioInput?.addEventListener("change", e => {
      dashAudioFile = e.target.files[0];
    });
  
    form?.addEventListener("submit", handleDashSubmit);
  }
  
  async function handleDashSubmit(e) {
    e.preventDefault();
  
    const title = document.getElementById("dashTrackTitle")?.value.trim();
    const artist = document.getElementById("dashTrackArtist")?.value.trim();
    const feat = document.getElementById("dashTrackFeat")?.value.trim();
    const country = document.getElementById("dashTrackCountry")?.value;
  
    if (!title || !artist || !country || !dashCoverFile || !dashAudioFile) {
      alert("Fill all required fields");
      return;
    }
  
    const btn = document.getElementById("uploadSubmitBtn");
    btn.disabled = true;
    btn.textContent = "Uploading...";
  
    try {
      // Upload para Cloudinary
      const coverUrl = await uploadToCloudinary(dashCoverFile, "image", "covers_unsigned");
      const audioUrl = await uploadToCloudinary(dashAudioFile, "video", "audio_unsigned");
  
      // Pegar JSON existente
      let tracks = [];
      try {
        const r = await fetch("https://res.cloudinary.com/dodnqnyof/raw/upload/tracks_yvlriw.json");
        if (r.ok) tracks = await r.json();
      } catch {}
  
      const newTrack = {
        id: Date.now(),
        title,
        artists: feat ? [artist, feat] : [artist],
        cover: coverUrl,
        audio: audioUrl,
        country,
        createdAt: new Date().toISOString()
      };
  
      tracks.push(newTrack);
  
      // Atualizar JSON no Cloudinary
      await uploadJSONToCloudinary(tracks, "tracks_yvlriw");
  
      alert("Track uploaded!");
      document.getElementById("dashboardUploadForm").reset();
      document.getElementById("dashCoverPreview").innerHTML = "";
      dashCoverFile = null;
      dashAudioFile = null;
  
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = "Upload Track";
    }
  }
  
  /* ---------------- CLOUDINARY HELPERS ---------------- */
  
  async function uploadToCloudinary(file, type, preset) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", preset);
  
    const res = await fetch(`https://api.cloudinary.com/v1_1/dodnqnyof/${type}/upload`, {
      method: "POST",
      body: fd
    });
  
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message);
    return data.secure_url;
  }
  
  async function uploadJSONToCloudinary(json, publicId) {
    const fd = new FormData();
    fd.append("file", new Blob([JSON.stringify(json, null, 2)], { type: "application/json" }));
    fd.append("upload_preset", "json_unsigned");
    fd.append("public_id", publicId);
    fd.append("resource_type", "raw");
  
    const res = await fetch("https://api.cloudinary.com/v1_1/dodnqnyof/raw/upload", {
      method: "POST",
      body: fd
    });
  
    if (!res.ok) throw new Error("JSON upload failed");
  }
  