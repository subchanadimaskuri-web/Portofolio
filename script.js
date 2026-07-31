// ==========================================
// 1. KONTROL AUDIO PLAYER INTERAKTIF
// ==========================================
const audio = document.getElementById('perkenalanAudio');
const playBtn = document.getElementById('playBtn');
const seekSlider = document.getElementById('seekSlider');
const currentTimeLabel = document.getElementById('currentTime');
const durationTimeLabel = document.getElementById('durationTime');

// Fungsi mengubah detik menjadi format menit:detik (00:00)
function formatTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    if (sec < 10) sec = `0${sec}`;
    return `${min}:${sec}`;
}

if (audio && playBtn && seekSlider) {
    // Saat data lagu termuat, ambil total durasinya
    audio.addEventListener('loadedmetadata', () => {
        seekSlider.max = audio.duration;
        durationTimeLabel.textContent = formatTime(audio.duration);
    });

    // Saat lagu berjalan, titik slider ikut bergerak
    audio.addEventListener('timeupdate', () => {
        seekSlider.value = audio.currentTime;
        currentTimeLabel.textContent = formatTime(audio.currentTime);
    });

    // Saat pengguna menggeser titik slider
    seekSlider.addEventListener('input', () => {
        audio.currentTime = seekSlider.value;
    });

    // Tombol Play / Pause
    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().then(() => {
                playBtn.className = 'fa-solid fa-circle-pause';
            }).catch(err => alert("Audio gagal diputar."));
        } else {
            audio.pause();
            playBtn.className = 'fa-regular fa-circle-play';
        }
    });

    // Reset tombol saat lagu selesai
    audio.addEventListener('ended', () => {
        playBtn.className = 'fa-regular fa-circle-play';
        seekSlider.value = 0;
        audio.currentTime = 0;
    });
}

// ==========================================
// 2. SLIDER GALERI (DENGAN FITUR FULLSCREEN)
// ==========================================
const githubUser = "subchanadimaskuri-web";
const githubRepo = "Portofolio";
const folderPath = "Tentang Saya/Galeri";

const apiUrl = `https://api.github.com/repos/${githubUser}/${githubRepo}/contents/${encodeURIComponent(folderPath).replace(/%2F/g, '/')}`;
let mediaList = [];
let currentIndex = 0;

async function muatGaleriOtomatis() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Gagal mengambil data");
        const data = await response.json();
        
        if (!Array.isArray(data)) return;

        mediaList = data
            .filter(item => item.type === "file")
            .map(item => item.name)
            .filter(name => name.match(/\.(jpg|jpeg|png|mp4)$/i));

        if (mediaList.length > 0) renderSlider();
    } catch (error) { console.error(error); }
}

function renderSlider() {
    const sliderWrapper = document.getElementById('sliderWrapper');
    if (!sliderWrapper) return;
    sliderWrapper.innerHTML = ''; 

    // Tampilkan maksimal 3 media (Di HP bisa di-swipe semua)
    const isMobile = window.innerWidth <= 768;
    const jumlahTampil = isMobile ? mediaList.length : Math.min(3, mediaList.length);

    for (let i = 0; i < jumlahTampil; i++) {
        let mediaIndex = (currentIndex + i) % mediaList.length;
        let fileName = mediaList[mediaIndex];
        let srcPath = `Tentang%20Saya/Galeri/${encodeURIComponent(fileName)}`;

        // VIDEO (Klik untuk Fullscreen)
        if (fileName.toLowerCase().endsWith('.mp4')) {
            let element = document.createElement('video');
            element.src = srcPath;
            element.className = 'slide-item';
            element.title = "Klik untuk putar layar penuh";
            element.style.cursor = "pointer";
            
            // Sembunyikan kontrol saat masih di dalam kotak agar rapi
            element.controls = false; 

            element.addEventListener('click', () => {
                // Minta layar penuh
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.webkitRequestFullscreen) { /* Safari */
                    element.webkitRequestFullscreen();
                }
                
                // Munculkan tombol kontrol dan putar
                element.controls = true; 
                element.play();
            });

            // Saat pengguna keluar dari layar penuh, video distop & dirapikan lagi
            element.addEventListener('fullscreenchange', () => {
                if (!document.fullscreenElement) {
                    element.pause();
                    element.controls = false;
                }
            });

            sliderWrapper.appendChild(element);
        } 
        // GAMBAR (Klik untuk Buka Tab Baru)
        else {
            let linkWrapper = document.createElement('a');
            linkWrapper.href = srcPath;
            linkWrapper.target = "_blank"; 

            let element = document.createElement('img');
            element.src = srcPath;
            element.alt = "Galeri";
            element.className = 'slide-item';

            linkWrapper.appendChild(element);
            sliderWrapper.appendChild(linkWrapper);
        }
    }
}

const rightArrow = document.querySelector('.right-arrow');
const leftArrow = document.querySelector('.left-arrow');

if (rightArrow) {
    rightArrow.addEventListener('click', () => {
        if (mediaList.length > 0) { currentIndex = (currentIndex + 1) % mediaList.length; renderSlider(); }
    });
}
if (leftArrow) {
    leftArrow.addEventListener('click', () => {
        if (mediaList.length > 0) { currentIndex = (currentIndex - 1 + mediaList.length) % mediaList.length; renderSlider(); }
    });
}

document.addEventListener('DOMContentLoaded', () => { muatGaleriOtomatis(); });
