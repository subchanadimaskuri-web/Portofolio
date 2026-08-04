// ==========================================
// 1. KONTROL AUDIO PLAYER
// ==========================================
const audio = document.getElementById('perkenalanAudio');
const playBtn = document.getElementById('playBtn');
const seekSlider = document.getElementById('seekSlider');
const currentTimeLabel = document.getElementById('currentTime');
const durationTimeLabel = document.getElementById('durationTime');

function formatTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    if (sec < 10) sec = `0${sec}`;
    return `${min}:${sec}`;
}

if (audio && playBtn && seekSlider) {
    audio.addEventListener('loadedmetadata', () => { seekSlider.max = audio.duration; durationTimeLabel.textContent = formatTime(audio.duration); });
    audio.addEventListener('timeupdate', () => { seekSlider.value = audio.currentTime; currentTimeLabel.textContent = formatTime(audio.currentTime); });
    seekSlider.addEventListener('input', () => { audio.currentTime = seekSlider.value; });
    playBtn.addEventListener('click', () => {
        if (audio.paused) { audio.play().then(() => playBtn.className = 'fa-solid fa-circle-pause'); } 
        else { audio.pause(); playBtn.className = 'fa-regular fa-circle-play'; }
    });
    audio.addEventListener('ended', () => { playBtn.className = 'fa-regular fa-circle-play'; seekSlider.value = 0; audio.currentTime = 0; });
}

// ==========================================
// 2. GALERI SLIDER & LIGHTBOX (FOTO & VIDEO)
// ==========================================
const apiUrl = `https://api.github.com/repos/subchanadimaskuri-web/Portofolio/contents/Tentang%20Saya/Galeri`;
let mediaList = []; let currentIndex = 0;
const lightbox = document.getElementById('lightbox'), lightboxContent = document.getElementById('lightboxContent'), closeLightbox = document.querySelector('.close-lightbox');

async function muatGaleriOtomatis() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) return;
        const data = await response.json();
        mediaList = data.filter(i => i.type === "file").map(i => i.name).filter(n => n.match(/\.(jpg|jpeg|png|mp4)$/i));
        if (mediaList.length > 0) renderSlider();
    } catch (e) { console.error(e); }
}

function renderSlider() {
    const sliderWrapper = document.getElementById('sliderWrapper');
    if (!sliderWrapper) return;
    sliderWrapper.innerHTML = ''; 
    const jumlahTampil = window.innerWidth <= 768 ? mediaList.length : Math.min(3, mediaList.length);

    for (let i = 0; i < jumlahTampil; i++) {
        let mediaIndex = (currentIndex + i) % mediaList.length;
        let fileName = mediaList[mediaIndex];
        let srcPath = `Tentang%20Saya/Galeri/${encodeURIComponent(fileName)}`;

        let itemWrapper = document.createElement('div');
        itemWrapper.style.cursor = "pointer";
        let element = document.createElement(fileName.toLowerCase().endsWith('.mp4') ? 'video' : 'img');
        element.src = srcPath; element.className = 'slide-item';
        if(element.tagName === 'VIDEO') element.muted = true;
        itemWrapper.appendChild(element); sliderWrapper.appendChild(itemWrapper);

        itemWrapper.addEventListener('click', () => {
            lightboxContent.innerHTML = '';
            let mediaUtuh = document.createElement(fileName.toLowerCase().endsWith('.mp4') ? 'video' : 'img');
            mediaUtuh.src = srcPath; mediaUtuh.className = 'lightbox-media';
            if(mediaUtuh.tagName === 'VIDEO') { mediaUtuh.controls = true; mediaUtuh.autoplay = true; }
            lightboxContent.appendChild(mediaUtuh); lightbox.classList.add('active');
        });
    }
}

if(closeLightbox && lightbox) {
    closeLightbox.addEventListener('click', () => { lightbox.classList.remove('active'); lightboxContent.innerHTML = ''; });
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) { lightbox.classList.remove('active'); lightboxContent.innerHTML = ''; }});
}
document.querySelector('.right-arrow')?.addEventListener('click', () => { if (mediaList.length > 0) { currentIndex = (currentIndex + 1) % mediaList.length; renderSlider(); }});
document.querySelector('.left-arrow')?.addEventListener('click', () => { if (mediaList.length > 0) { currentIndex = (currentIndex - 1 + mediaList.length) % mediaList.length; renderSlider(); }});
document.addEventListener('DOMContentLoaded', () => { muatGaleriOtomatis(); });

// ==========================================
// 3. FITUR AI LAYAR PENUH
// ==========================================
const aiWidget = document.getElementById('aiWidget');
const aiInput = document.getElementById('aiInput');
const aiBackdrop = document.getElementById('aiBackdrop');
const closeAiBtn = document.getElementById('closeAiBtn');

function bukaAiLayarPenuh() {
    if (aiWidget) aiWidget.classList.add('fullscreen-mode');
    if (aiBackdrop) aiBackdrop.classList.add('active');
}
function tutupAiLayarPenuh() {
    if (aiWidget) aiWidget.classList.remove('fullscreen-mode');
    if (aiBackdrop) aiBackdrop.classList.remove('active');
}
if (aiInput) {
    aiInput.addEventListener('focus', bukaAiLayarPenuh);
    aiInput.addEventListener('click', bukaAiLayarPenuh);
}
if (closeAiBtn) closeAiBtn.addEventListener('click', tutupAiLayarPenuh);
if (aiBackdrop) aiBackdrop.addEventListener('click', tutupAiLayarPenuh);


// ==========================================
// 4. FITUR POPUP PDF RIWAYAT PEKERJAAN
// ==========================================
const jobLinks = document.querySelectorAll('.job-title-link');

jobLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // Mencegah layar scroll mendadak ke atas
        
        // Mengambil nama file PDF dari atribut data-pdf di HTML
        const pdfFile = link.getAttribute('data-pdf');

        if (lightbox && lightboxContent && pdfFile) {
            lightboxContent.innerHTML = `
                <iframe src="${encodeURI(pdfFile)}" class="pdf-viewer"></iframe>
            `;
            lightbox.classList.add('active'); // Tampilkan Layar Gelap
        }
    });
});
