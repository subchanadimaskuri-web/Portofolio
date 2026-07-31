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
    audio.addEventListener('loadedmetadata', () => {
        seekSlider.max = audio.duration;
        durationTimeLabel.textContent = formatTime(audio.duration);
    });
    audio.addEventListener('timeupdate', () => {
        seekSlider.value = audio.currentTime;
        currentTimeLabel.textContent = formatTime(audio.currentTime);
    });
    seekSlider.addEventListener('input', () => { audio.currentTime = seekSlider.value; });
    
    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().then(() => playBtn.className = 'fa-solid fa-circle-pause')
            .catch(err => alert("Audio gagal diputar."));
        } else {
            audio.pause();
            playBtn.className = 'fa-regular fa-circle-play';
        }
    });
    audio.addEventListener('ended', () => {
        playBtn.className = 'fa-regular fa-circle-play';
        seekSlider.value = 0; audio.currentTime = 0;
    });
}

// ==========================================
// 2. SLIDER, LIGHTBOX, & PICTURE-IN-PICTURE
// ==========================================
const githubUser = "subchanadimaskuri-web";
const githubRepo = "Portofolio";
const folderPath = "Tentang Saya/Galeri";
const apiUrl = `https://api.github.com/repos/${githubUser}/${githubRepo}/contents/${encodeURIComponent(folderPath).replace(/%2F/g, '/')}`;

let mediaList = [];
let currentIndex = 0;

const lightbox = document.getElementById('lightbox');
const lightboxContent = document.getElementById('lightboxContent');
const closeLightbox = document.querySelector('.close-lightbox');

async function muatGaleriOtomatis() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Gagal mengambil data");
        const data = await response.json();
        
        if (!Array.isArray(data)) return;
        mediaList = data.filter(item => item.type === "file").map(item => item.name).filter(name => name.match(/\.(jpg|jpeg|png|mp4)$/i));
        if (mediaList.length > 0) renderSlider();
    } catch (error) { console.error(error); }
}

function renderSlider() {
    const sliderWrapper = document.getElementById('sliderWrapper');
    if (!sliderWrapper) return;
    sliderWrapper.innerHTML = ''; 

    const isMobile = window.innerWidth <= 768;
    const jumlahTampil = isMobile ? mediaList.length : Math.min(3, mediaList.length);

    for (let i = 0; i < jumlahTampil; i++) {
        let mediaIndex = (currentIndex + i) % mediaList.length;
        let fileName = mediaList[mediaIndex];
        let srcPath = `Tentang%20Saya/Galeri/${encodeURIComponent(fileName)}`;

        let itemWrapper = document.createElement('div');
        itemWrapper.style.cursor = "pointer";

        if (fileName.toLowerCase().endsWith('.mp4')) {
            // JIKA VIDEO: Gunakan API Picture-in-Picture
            let element = document.createElement('video');
            element.src = srcPath;
            element.className = 'slide-item';
            element.controls = true; // Tetap munculkan tombol bawaan
            element.title = "Klik area video untuk Picture-in-Picture";
            
            // Perintah khusus untuk memicu PiP saat video diklik
            element.addEventListener('click', async (e) => {
                try {
                    if (document.pictureInPictureElement) {
                        await document.exitPictureInPicture();
                    } else {
                        await element.requestPictureInPicture();
                        element.play();
                    }
                } catch (error) {
                    console.log("Sistem PiP gagal dimuat atau belum didukung browser ini.");
                }
            });
            
            itemWrapper.appendChild(element);
            sliderWrapper.appendChild(itemWrapper);
            
        } else {
            // JIKA GAMBAR: Gunakan Lightbox (Pop-up Layar Gelap)
            let element = document.createElement('img');
            element.src = srcPath;
            element.className = 'slide-item';
            element.title = "Klik untuk perbesar gambar";
            
            itemWrapper.appendChild(element);
            sliderWrapper.appendChild(itemWrapper);

            itemWrapper.addEventListener('click', () => {
                if(lightbox && lightboxContent) {
                    lightboxContent.innerHTML = '';
                    let mediaUtuh = document.createElement('img');
                    mediaUtuh.src = srcPath;
                    mediaUtuh.className = 'lightbox-media';
                    lightboxContent.appendChild(mediaUtuh);
                    lightbox.classList.add('active');
                }
            });
        }
    }
}

if(closeLightbox && lightbox) {
    closeLightbox.addEventListener('click', () => { lightbox.classList.remove('active'); lightboxContent.innerHTML = ''; });
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) { lightbox.classList.remove('active'); lightboxContent.innerHTML = ''; }});
}

const rightArrow = document.querySelector('.right-arrow');
const leftArrow = document.querySelector('.left-arrow');
if (rightArrow) rightArrow.addEventListener('click', () => { if (mediaList.length > 0) { currentIndex = (currentIndex + 1) % mediaList.length; renderSlider(); }});
if (leftArrow) leftArrow.addEventListener('click', () => { if (mediaList.length > 0) { currentIndex = (currentIndex - 1 + mediaList.length) % mediaList.length; renderSlider(); }});

document.addEventListener('DOMContentLoaded', () => { muatGaleriOtomatis(); });
