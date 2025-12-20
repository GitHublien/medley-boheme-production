const songsData = [
    { id: 1, title: "Stone", type: "Duo", credits: "Starmania (1978) — Michel Berger (musique), Luc Plamondon (paroles)", original: "France Gall / Fabienne Thibeault", artists: ["manon", "stephanie"] },
    { id: 2, title: "Les Uns contre les autres", type: "Duo", credits: "Starmania (1978) — Michel Berger (musique), Luc Plamondon (paroles)", original: "Fabienne Thibeault / France Gall", artists: ["manon", "stephanie"] },
    { id: 3, title: "Mon Amour", type: "Duo", credits: "Eurovision 2024 — Slimane (auteur-compositeur-interprète)", original: "Slimane", artists: ["alexis", "manon"] },
    { id: 4, title: "L'Hymne à l'Amour", type: "Trio", credits: "Édith Piaf (1950) — Marguerite Monnot (musique), Édith Piaf (paroles)", original: "Édith Piaf / Version Josh Groban", artists: ["mickael", "alexis", "stephanie"] },
    { id: 5, title: "Vivo Per Lei", type: "Duo", credits: "Andrea Bocelli (1995) — Mauro Mengali, Valerio Zelli (musique), Gatto Panceri (paroles)", original: "Andrea Bocelli & Hélène Ségara", artists: ["alexis", "stephanie"] },
    { id: 6, title: "Adagio", type: "Duo", credits: "Lara Fabian (1999) — Tomaso Albinoni (musique originale), adaptation Lara Fabian & Rick Allison", original: "Lara Fabian", artists: ["stephanie", "elie"] },
    { id: 7, title: "Con Te Partirò", type: "Duo", credits: "Andrea Bocelli (1995) — Francesco Sartori (musique), Lucio Quarantotto (paroles)", original: "Andrea Bocelli / Sarah Brightman", artists: ["mickael", "alexis"] },
    { id: 8, title: "Le Temps des Cathédrales", type: "Solo puis Ensemble", credits: "Notre-Dame de Paris (1998) — Riccardo Cocciante (musique), Luc Plamondon (paroles)", original: "Bruno Pelletier / Garou", artists: ["mickael", "tous"] },
    { id: 9, title: "Belle", type: "Trio", credits: "Notre-Dame de Paris (1998) — Riccardo Cocciante (musique), Luc Plamondon (paroles)", original: "Garou, Daniel Lavoie, Patrick Fiori", artists: ["elie", "mickael", "alexis"] },
    { id: 10, title: "Mon Frère", type: "Duo", credits: "Les Dix Commandements (2000) — Pascal Obispo (musique), Lionel Florence (paroles)", original: "Pascal Obispo & Garou", artists: ["mickael", "alexis"] },
    { id: 11, title: "Le Blues du Businessman", type: "Ensemble", credits: "Starmania (1978) — Michel Berger (musique), Luc Plamondon (paroles)", original: "Claude Dubois", artists: ["tous"] }
];

const artistNames = {
    manon: "Manon Bava",
    stephanie: "Stéphanie Guedj",
    mickael: "Mickaël Guedj",
    alexis: "Alexis Hoffmann",
    elie: "Patrick Elie Féré",
    tous: "Ensemble"
};

let songs = JSON.parse(JSON.stringify(songsData));
let editMode = false;
let currentSongId = null;
const audio = document.getElementById('bgMusic');

function loadData() {
    const saved = localStorage.getItem('boheme-medley-v3');
    if (saved) {
        try { songs = JSON.parse(saved); } 
        catch (e) { songs = JSON.parse(JSON.stringify(songsData)); }
    }
}

function saveData() {
    localStorage.setItem('boheme-medley-v3', JSON.stringify(songs));
    notify('Modifications sauvegardées ✓');
}

function notify(msg) {
    const el = document.getElementById('notification');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
}

function toggleEditMode() {
    editMode = !editMode;
    document.body.classList.toggle('edit-mode', editMode);
    document.getElementById('editBtn').classList.toggle('active', editMode);
    document.getElementById('editBtn').textContent = editMode ? '✓ Mode Édition' : '✎ Éditer';
    document.getElementById('presenterName').contentEditable = editMode;
    renderSetlist();
    if (editMode) notify('Mode édition activé');
}

function renderSetlist() {
    const container = document.getElementById('setlist');
    container.innerHTML = songs.map((song, idx) => `
        <div class="song-card" data-song-id="${song.id}">
            <div class="song-number">${idx + 1}</div>
            <div class="song-header">
                <div class="song-title-wrap">
                    <div class="song-title ${editMode ? 'editable' : ''}" 
                         contenteditable="${editMode}" 
                         data-id="${song.id}"
                         onblur="updateField(${song.id}, 'title', this.textContent)">${formatTitle(song.title)}</div>
                    <div class="song-credits">${song.credits}</div>
                    <div class="song-original">Interprète original : ${song.original}</div>
                </div>
                <span class="song-type">${song.type}</span>
                <div class="song-controls">
                    <button class="move-btn" onclick="moveSong(${idx}, -1)" ${idx === 0 ? 'disabled' : ''}>↑</button>
                    <button class="move-btn" onclick="moveSong(${idx}, 1)" ${idx === songs.length - 1 ? 'disabled' : ''}>↓</button>
                </div>
            </div>
            <div class="song-artists-zone" data-song-id="${song.id}">
                ${song.artists.map(a => `
                    <span class="song-artist artist-tag" data-artist="${a}" draggable="true">
                        ${artistNames[a]}
                        <button class="remove-btn" onclick="removeArtist(${song.id}, '${a}')">×</button>
                    </span>
                `).join('')}
                <button class="add-artist-btn" onclick="openModal(${song.id})">+ Ajouter</button>
            </div>
        </div>
    `).join('');
    setupDragDrop();
}

function updateField(id, field, value) {
    const song = songs.find(s => s.id === id);
    if (song) song[field] = value.trim();
}

function moveSong(idx, dir) {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= songs.length) return;
    [songs[idx], songs[newIdx]] = [songs[newIdx], songs[idx]];
    renderSetlist();
}

function removeArtist(songId, artist) {
    const song = songs.find(s => s.id === songId);
    if (song) {
        song.artists = song.artists.filter(a => a !== artist);
        renderSetlist();
    }
}

function openModal(songId) {
    currentSongId = songId;
    const container = document.getElementById('modalArtists');
    container.innerHTML = Object.entries(artistNames).map(([key, name]) => 
        `<button class="modal-artist-btn" onclick="addArtist('${key}')">${name}</button>`
    ).join('');
    document.getElementById('modalOverlay').classList.add('show');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('show');
    currentSongId = null;
}

function addArtist(artist) {
    if (currentSongId) {
        const song = songs.find(s => s.id === currentSongId);
        if (song && !song.artists.includes(artist)) {
            song.artists.push(artist);
            renderSetlist();
        }
    }
    closeModal();
}

function showHelp() { document.getElementById('helpOverlay').classList.add('show'); }
function closeHelp() { document.getElementById('helpOverlay').classList.remove('show'); }

let draggedArtist = null;

function setupDragDrop() {
    // Create transparent drag image
    const dragImg = document.createElement('div');
    dragImg.style.width = '1px';
    dragImg.style.height = '1px';
    dragImg.style.opacity = '0';
    document.body.appendChild(dragImg);

    document.querySelectorAll('.artist-tag[draggable="true"]').forEach(el => {
        el.addEventListener('dragstart', e => {
            draggedArtist = e.target.dataset.artist;
            e.target.classList.add('dragging');
            // Use transparent drag image
            e.dataTransfer.setDragImage(dragImg, 0, 0);
        });
        el.addEventListener('dragend', e => {
            e.target.classList.remove('dragging');
            draggedArtist = null;
        });
    });

    document.querySelectorAll('.song-artists-zone').forEach(zone => {
        zone.addEventListener('dragover', e => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', e => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            if (draggedArtist) {
                const songId = parseInt(zone.dataset.songId);
                const song = songs.find(s => s.id === songId);
                if (song && !song.artists.includes(draggedArtist)) {
                    song.artists.push(draggedArtist);
                    renderSetlist();
                    notify(`${artistNames[draggedArtist]} ajouté`);
                }
            }
        });
    });
}

function resetAll() {
    if (confirm('Réinitialiser toutes les modifications ?')) {
        songs = JSON.parse(JSON.stringify(songsData));
        localStorage.removeItem('boheme-medley-v3');
        renderSetlist();
        notify('Réinitialisé');
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
}

// Format title with decorative drop cap
function formatTitle(title) {
    if (!title || title.length === 0) return title;
    const firstChar = title.charAt(0);
    const rest = title.slice(1);
    return `<span class="drop-cap">${firstChar}</span>${rest}`;
}

// Audio
function togglePlay() {
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const btn = document.getElementById('playBtn');
    
    if (audio.paused) {
        audio.play();
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        btn.classList.add('playing');
    } else {
        audio.pause();
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        btn.classList.remove('playing');
    }
}

function setVolume(val) { audio.volume = val; }

// Themes
document.querySelectorAll('.theme-dot').forEach(dot => {
    dot.addEventListener('click', () => {
        document.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        const theme = dot.dataset.theme;
        if (theme === 'classique') document.body.removeAttribute('data-theme');
        else document.body.setAttribute('data-theme', theme);
        localStorage.setItem('boheme-theme-v3', theme);
    });
});

// Load saved theme (default: sombre)
const savedTheme = localStorage.getItem('boheme-theme-v3') || 'sombre';
if (savedTheme !== 'classique') {
    document.body.setAttribute('data-theme', savedTheme);
}
document.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('active'));
document.querySelector(`.theme-dot[data-theme="${savedTheme}"]`)?.classList.add('active');

// Close modals on overlay click
document.getElementById('modalOverlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
document.getElementById('helpOverlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeHelp(); });

// Init
audio.volume = 0.5;
loadData();
renderSetlist();
