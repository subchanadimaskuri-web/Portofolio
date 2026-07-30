// ==========================================
// 1. KONTROL AUDIO PLAYER (PERKENALAN)
// ==========================================
const audio = document.getElementById('perkenalanAudio');
const playBtn = document.querySelector('.fa-circle-play');

if(playBtn && audio) {
  playBtn.addEventListener('click', function() {
      if(audio.paused) {
          audio.play(); 
          playBtn.classList.remove('fa-regular', 'fa-circle-play');
          playBtn.classList.add('fa-solid', 'fa-circle-pause'); 
      } else {
          audio.pause(); 
          playBtn.classList.remove('fa-solid', 'fa-circle-pause');
          playBtn.classList.add('fa-regular', 'fa-circle-play'); 
      }
  });
}

// ==========================================
// 2. SLIDER GALERI OTOMATIS (GITHUB API)
// ==========================================
// Identitas Repositori GitHub Anda
const githubUser = "subchanadimaskuri-web";
const githubRepo = "Portofolio";
const folderName = "Galeri";

// Link API GitHub untuk membaca isi folder "Galeri"
const apiUrl = `https://api.github.com/repos/${githubUser}/${githubRepo}/contents/${folderName}`;

let mediaList = [];
let currentIndex = 0;

// Fungsi mengambil data file secara otomatis dari GitHub
async function muatGaleriOtomatis() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Saring HANYA file gambar (.jpg, .jpeg, .png) dan video (.mp4)
        mediaList = data
            .filter(item => item.type === "file")
            .map(item => item.name)
            .filter(name => name.match(/\.(jpg|jpeg|png|mp4)$/i));

        if (mediaList.length > 0) {
            renderSlider(); // Tampilkan ke web jika filenya ada
        } else {
            console.log("Tidak ada gambar/video di folder Galeri.");
        }
    } catch (error) {
        console.error("Gagal mengambil data dari GitHub:", error);
    }
}

// Fungsi menampilkan 3 kotak media ke layar
function renderSlider() {
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const rightArrow = document.querySelector('.fa-angles-right');
    
    // Bersihkan layar dari foto/video sebelumnya
    document.querySelectorAll('.slide-img').forEach(el => el.remove());
    
    // Batasi maksimal 3 media yang tampil bersamaan di layar
    const jumlahTampil = Math.min(3, mediaList.length);

    for(let i = 0; i < jumlahTampil; i++) {
        let mediaIndex = (currentIndex + i) % mediaList.length;
        // Arahkan jalurnya ke folder Galeri
        let filename = folderName + "/" + mediaList[mediaIndex]; 
        let element;
        
        // Cek jika file tersebut adalah video (MP4)
        if(filename.toLowerCase().endsWith('.mp4')) {
            element = document.createElement('video');
            element.src = filename;
            element.controls = true; // Munculkan tombol play video
        } 
        // Jika file berupa gambar
        else {
            element = document.createElement('img');
            element.src = filename;
        }
        
        element.className = 'slide-img';
        sliderWrapper.insertBefore(element, rightArrow);
    }
}

// Interaksi saat tombol Panah Kanan diklik
const rightArrowBtn = document.querySelector('.fa-angles-right');
if (rightArrowBtn) {
    rightArrowBtn.addEventListener('click', () => {
        if (mediaList.length > 0) {
            currentIndex = (currentIndex + 1) % mediaList.length;
            renderSlider();
        }
    });
}

// Interaksi saat tombol Panah Kiri diklik
const leftArrowBtn = document.querySelector('.fa-angles-left');
if (leftArrowBtn) {
    leftArrowBtn.addEventListener('click', () => {
        if (mediaList.length > 0) {
            currentIndex = (currentIndex - 1 + mediaList.length) % mediaList.length;
            renderSlider();
        }
    });
}

// Panggil fungsi pembacaan data otomatis ini tepat saat website dibuka
document.addEventListener('DOMContentLoaded', () => {
    muatGaleriOtomatis();
});
