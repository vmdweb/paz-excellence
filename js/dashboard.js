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
  
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f538aeba-5d1a-4433-b1bf-60e9cc7a1e35',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.js:100',message:'handleDashSubmit ENTRY',data:{hasFiles:dashCoverFile&&dashAudioFile},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
  
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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/f538aeba-5d1a-4433-b1bf-60e9cc7a1e35',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.js:119',message:'coverUrl AFTER upload',data:{coverUrl,isBlob:coverUrl?.startsWith('blob:')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      const audioUrl = await uploadToCloudinary(dashAudioFile, "video", "audio_unsigned");
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/f538aeba-5d1a-4433-b1bf-60e9cc7a1e35',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.js:121',message:'audioUrl AFTER upload',data:{audioUrl,isBlob:audioUrl?.startsWith('blob:')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
  
      // Pegar JSON existente
      let tracks = [];
      try {
        const r = await fetch("https://res.cloudinary.com/dodnqnyof/raw/upload/tracks_yvlriw.json");
        if (r.ok) tracks = await r.json();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f538aeba-5d1a-4433-b1bf-60e9cc7a1e35',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.js:127',message:'tracks BEFORE push',data:{tracksCount:tracks.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/f538aeba-5d1a-4433-b1bf-60e9cc7a1e35',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.js:139',message:'tracks AFTER push BEFORE uploadJSON',data:{tracksCount:tracks.length,newTrack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
  
      // Atualizar JSON no Cloudinary
      await uploadJSONToCloudinary(tracks, "tracks_yvlriw");
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/f538aeba-5d1a-4433-b1bf-60e9cc7a1e35',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.js:142',message:'uploadJSONToCloudinary SUCCESS',data:{tracksCount:tracks.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Aguardar o Cloudinary processar o arquivo (pode levar alguns segundos)
      let verifyRes;
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        verifyRes = await fetch("https://res.cloudinary.com/dodnqnyof/raw/upload/tracks_yvlriw.json?t=" + Date.now());
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/f538aeba-5d1a-4433-b1bf-60e9cc7a1e35',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.js:147',message:'verify JSON after upload attempt ' + (i+1),data:{ok:verifyRes.ok,status:verifyRes.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        if (verifyRes.ok) break;
      }
  
      // Disparar evento para atualizar a index (se estiver na mesma aba)
      window.dispatchEvent(new CustomEvent('tracksUpdated'));
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/f538aeba-5d1a-4433-b1bf-60e9cc7a1e35',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.js:153',message:'tracksUpdated event DISPATCHED',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
  
      alert("Track uploaded!");
      document.getElementById("dashboardUploadForm").reset();
      document.getElementById("dashCoverPreview").innerHTML = "";
      dashCoverFile = null;
      dashAudioFile = null;
  
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/f538aeba-5d1a-4433-b1bf-60e9cc7a1e35',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.js:150',message:'handleDashSubmit ERROR',data:{error:err.message,stack:err.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error(err);
      alert("Upload failed: " + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = "Upload Track";
    }
  }
  
  /* ---------------- CLOUDINARY HELPERS ---------------- */
  
  async function uploadToCloudinary(file, type, preset) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f538aeba-5d1a-4433-b1bf-60e9cc7a1e35',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.js:161',message:'uploadToCloudinary ENTRY',data:{type,preset,fileName:file?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", preset);
  
    const res = await fetch(`https://api.cloudinary.com/v1_1/dodnqnyof/${type}/upload`, {
      method: "POST",
      body: fd
    });
  
    const data = await res.json();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f538aeba-5d1a-4433-b1bf-60e9cc7a1e35',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.js:171',message:'uploadToCloudinary RESPONSE',data:{ok:res.ok,status:res.status,secureUrl:data.secure_url,hasSecureUrl:!!data.secure_url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    if (!res.ok) throw new Error(data.error?.message);
    return data.secure_url;
  }
  
  async function uploadJSONToCloudinary(json, publicId) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f538aeba-5d1a-4433-b1bf-60e9cc7a1e35',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.js:220',message:'uploadJSONToCloudinary ENTRY',data:{publicId,jsonLength:json.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    const fd = new FormData();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    fd.append("file", blob, "tracks.json");
    fd.append("upload_preset", "json_unsigned");
    fd.append("public_id", publicId);
    fd.append("resource_type", "raw");
  
    const res = await fetch("https://api.cloudinary.com/v1_1/dodnqnyof/raw/upload", {
      method: "POST",
      body: fd
    });
  
    // #region agent log
    const resData = res.ok ? await res.json().catch(()=>({})) : {};
    fetch('http://127.0.0.1:7242/ingest/f538aeba-5d1a-4433-b1bf-60e9cc7a1e35',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.js:238',message:'uploadJSONToCloudinary RESPONSE',data:{ok:res.ok,status:res.status,responseData:resData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
  
    if (!res.ok) {
      const errorData = resData.error || {};
      throw new Error(errorData.message || "JSON upload failed");
    }
  }
  