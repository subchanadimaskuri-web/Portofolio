// ==========================================
// 1. KONTROL AUDIO PLAYER (PERKENALAN)
// ==========================================
const audio = document.getElementById('perkenalanAudio');
const playBtn = document.getElementById('playBtn');

if (playBtn && audio) {
  playBtn.addEventListener('click', function() {
    if (audio.paused) {
      audio.play().then(() => {
        playBtn.className = 'fa-solid fa-circle-pause';
      }).catch(err => {
        console.error("Gagal memutar audio:", err);
        alert("Audio tidak dapat diputar. Pastikan file 'Perkenalan.mp3' berada di dalam folder 'Tentang Saya'.");
      });
    } else {
      audio.pause();
      playBtn.className = 'fa-regular fa-circle-play';
    }
  });
}

// ==========================================
// 2. SLIDER GALERI OTOMATIS (GITHUB API)
// ==========================================
const githubUser = "subchanadimaskuri-web";
const githubRepo = "Portofolio";
const folderPath = "Tentang Saya/Galeri";

// URL Encoding khusus untuk API GitHub
const apiUrl = `https://api.github.com/repos/${githubUser}/${githubRepo}/contents/${encodeURIComponent(folderPath).replace(/%2F/g, '/')}`;

let mediaList = [];
let currentIndex = 0;

async function muatGaleriOtomatis() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP Status: ${response.status}`);
        }
        const data = await response.json();

        if (!Array.isArray(data)) return;

        // Menyaring file foto dan video MP4 saja
        mediaList = data
            .filter(item => item.type === "file")
            .map(item => item.name)
            .filter(name => name.match(/\.(jpg|jpeg|png|mp4)$/i));

        if (mediaList.length > 0) {
            renderSlider();
        }
    } catch (error) {
        console.error("Gagal mengambil data galeri dari GitHub:", error);
    }
}

function renderSlider() {
    const sliderWrapper = document.getElementById('sliderWrapper');
    if (!sliderWrapper) return;

    sliderWrapper.innerHTML = ''; // Bersihkan tampilan lama
    const jumlahTampil = Math.min(3, mediaList.length);

    for (let i = 0; i < jumlahTampil; i++) {
        let mediaIndex = (currentIndex + i) % mediaList.length;
        let fileName = mediaList[mediaIndex];
        
        // Membentuk jalur gambar yang aman dari spasi
        let srcPath = `Tentang%20Saya/Galeri/${encodeURIComponent(fileName)}`;

        let element;
        if (fileName.toLowerCase().endsWith('.mp4')) {
            element = document.createElement('video');
            element.src = srcPath;
            element.controls = true;
        } else {
            element = document.createElement('img');
            element.src = srcPath;
            element.alt = "Galeri";
        }

        element.className = 'slide-item';
        sliderWrapper.appendChild(element);
    }
}

// Tombol Geser Kanan & Kiri
const rightArrow = document.querySelector('.right-arrow');
const leftArrow = document.querySelector('.left-arrow');

if (rightArrow) {
    rightArrow.addEventListener('click', () => {
        if (mediaList.length > 0) {
            currentIndex = (currentIndex + 1) % mediaList.length;
            renderSlider();
        }
    });
}

if (leftArrow) {
    leftArrow.addEventListener('click', () => {
        if (mediaList.length > 0) {
            currentIndex = (currentIndex - 1 + mediaList.length) % mediaList.length;
            renderSlider();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    muatGaleriOtomatis();
});
