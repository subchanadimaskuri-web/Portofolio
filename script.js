// ==========================================
// 1. KONTROL AUDIO PLAYER (PERKENALAN)
// ==========================================
const audio = document.getElementById('perkenalanAudio');
const playBtn = document.getElementById('playBtn'); 

if(playBtn && audio) {
  playBtn.addEventListener('click', function() {
      if(audio.paused) {
          audio.play(); 
          playBtn.className = 'fa-solid fa-circle-pause'; 
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

// JALUR FOLDER BARU (Sesuai dengan struktur bersarang Anda)
const folderName = "Tentang Saya/Galeri";

// Menggunakan encodeURI agar spasi pada "Tentang Saya" aman dibaca server
const apiUrl = encodeURI(`https://api.github.com/repos/${githubUser}/${githubRepo}/contents/${folderName}`);

let mediaList = [];
let currentIndex = 0;

async function muatGaleriOtomatis() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error("Gagal memuat galeri! Pastikan jalur folder benar.");
            return;
        }

        mediaList = data
            .filter(item => item.type === "file")
            .map(item => item.name)
            .filter(name => name.match(/\.(jpg|jpeg|png|mp4)$/i));

        if (mediaList.length > 0) {
            renderSlider();
        }
    } catch (error) {
        console.error("Gagal mengambil data dari GitHub:", error);
    }
}

function renderSlider() {
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const rightArrow = document.querySelector('.fa-angles-right');
    if (!sliderWrapper || !rightArrow) return;
    
    document.querySelectorAll('.slide-img').forEach(el => el.remove());
    const jumlahTampil = Math.min(3, mediaList.length);

    for(let i = 0; i < jumlahTampil; i++) {
        let mediaIndex = (currentIndex + i) % mediaList.length;
        
        // Membentuk jalur lengkap: "Tentang Saya/Galeri/NamaFile.jpg"
        let filename = "Tentang Saya/Galeri/" + mediaList[mediaIndex]; 
        let element;
        
        if(filename.toLowerCase().endsWith('.mp4')) {
            element = document.createElement('video');
            element.src = filename;
            element.controls = true; 
        } else {
            element = document.createElement('img');
            element.src = filename;
        }
        
        element.className = 'slide-img';
        sliderWrapper.insertBefore(element, rightArrow);
    }
}

const rightArrowBtn = document.querySelector('.fa-angles-right');
if (rightArrowBtn) {
    rightArrowBtn.addEventListener('click', () => {
        if (mediaList.length > 0) {
            currentIndex = (currentIndex + 1) % mediaList.length;
            renderSlider();
        }
    });
}

const leftArrowBtn = document.querySelector('.fa-angles-left');
if (leftArrowBtn) {
    leftArrowBtn.addEventListener('click', () => {
        if (mediaList.length > 0) {
            currentIndex = (currentIndex - 1 + mediaList.length) % mediaList.length;
            renderSlider();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    muatGaleriOtomatis();
});
