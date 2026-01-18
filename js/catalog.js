/* ------------------- Catalog Module (Safe Init) ------------------- */

let catalogOverlay = null;
let catalogContent = null;

let artistOverlay = null;
let artistTracksContainer = null;
let currentLetterFilter = "all";

/* ---------- INIT ---------- */
function initCatalog() {
    catalogOverlay = document.getElementById("catalogOverlay");
    catalogContent = document.getElementById("catalogContent");

    // Se não existir (ex: dashboard), não faz nada
    if (!catalogOverlay || !catalogContent) return;

    const closeBtn = document.getElementById("catalogClose");
    closeBtn?.addEventListener("click", closeCatalog);

    catalogOverlay.addEventListener("click", (e) => {
        if (e.target === catalogOverlay) closeCatalog();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && catalogOverlay.classList.contains("active")) {
            closeCatalog();
        }
    });

    initArtistOverlay();
}

function openCatalog() {
    if (!catalogOverlay || !catalogContent) return;
    currentLetterFilter = "all";
    buildCatalog();
    catalogOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeCatalog() {
    if (!catalogOverlay) return;
    catalogOverlay.classList.remove("active");
    document.body.style.overflow = "";
}

/* ---------- BUILD ---------- */
async function buildCatalog() {
    if (!catalogContent) return;

    const tracks = await loadTracks();
    if (!tracks.length) {
        catalogContent.innerHTML = "<div>No tracks available</div>";
        return;
    }

    const artistMap = new Map();

    tracks.forEach(track => {
        track.artists?.join(", ").forEach(a => {
            if (!artistMap.has(a)) artistMap.set(a, []);
            artistMap.get(a).push(track);
        });
    });

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let html = `<div class="catalog-letters">`;

    letters.forEach(l => {
        html += `<button class="catalog-letter-btn ${currentLetterFilter === l ? "active" : ""}" data-letter="${l}">${l}</button>`;
    });
    html += `<button class="catalog-letter-btn ${currentLetterFilter === "all" ? "active" : ""}" data-letter="all">All</button>`;
    html += `</div><div class="catalog-grid">`;

    letters.forEach(letter => {
        if (currentLetterFilter !== "all" && currentLetterFilter !== letter) return;
        const artists = [...artistMap.keys()].filter(a => a[0].toUpperCase() === letter);
        if (!artists.length) return;

        html += `<div><h3>${letter}</h3><ul>`;
        artists.forEach(a => {
            html += `<li><a href="#" data-artist="${a}">${a}</a></li>`;
        });
        html += `</ul></div>`;
    });

    html += `</div>`;
    catalogContent.innerHTML = html;

    catalogContent.querySelectorAll("[data-letter]").forEach(btn => {
        btn.onclick = () => {
            currentLetterFilter = btn.dataset.letter;
            buildCatalog();
        };
    });

    catalogContent.querySelectorAll("[data-artist]").forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            openArtistTracks(link.dataset.artist, artistMap.get(link.dataset.artist));
        };
    });
}

/* ---------- ARTIST ---------- */
function initArtistOverlay() {
    artistOverlay = document.getElementById("artistOverlay");
    artistTracksContainer = document.getElementById("artistTracks");
    if (!artistOverlay || !artistTracksContainer) return;

    document.getElementById("artistClose")?.addEventListener("click", closeArtistTracks);
}

function openArtistTracks(name, tracks) {
    if (!artistOverlay || !artistTracksContainer) return;
    document.getElementById("artistTitle").textContent = name;

    artistTracksContainer.innerHTML = tracks.map(t => `
        <div>
            <img src="${t.cover}">
            <span>${t.title}</span>
            <button onclick='window.playTrack(${JSON.stringify(t)})'>▶</button>
        </div>
    `).join("");

    artistOverlay.classList.add("active");
}

function closeArtistTracks() {
    artistOverlay?.classList.remove("active");
}

window.refreshCatalog = buildCatalog;
