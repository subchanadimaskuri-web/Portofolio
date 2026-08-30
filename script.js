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
// 2. GALERI SLIDER & LIGHTBOX (VERSI AMAN & ANTI-LIMIT)
// ==========================================
// Daftar nama file persis sesuai yang ada di folder GitHub Anda
const mediaList = [
  "Slide 1.mp4",
  "Slide 2.mp4",
  "Slide 3.mp4",
  "Slide 4.mp4",
  "Slide 5.mp4",
  "Slide 5.jpeg",
  "Slide 5a.mp4",
  "Slide 5b.mp4",
  "Slide 6a.jpeg",
  "Slide 6b.jpg",
  "Slide 7.jpg",
  "Slide 8.jpg",
  "Slide 9.mp4",     // <--- Koma yang hilang sudah saya tambahkan!
  "Slide 10.jpeg",
  "Slide 11.jpg",
  "Slide 12.jpg",
  "Slide 13.jpeg",
  "Slide 14.jpeg"
];

let currentIndex = 0;
const lightbox = document.getElementById('lightbox'), 
      lightboxContent = document.getElementById('lightboxContent'), 
      closeLightbox = document.querySelector('.close-lightbox');

function renderSlider() {
    const sliderWrapper = document.getElementById('sliderWrapper');
    if (!sliderWrapper) return;
    sliderWrapper.innerHTML = ''; 
    const jumlahTampil = window.innerWidth <= 768 ? mediaList.length : Math.min(3, mediaList.length);

    for (let i = 0; i < jumlahTampil; i++) {
        let mediaIndex = (currentIndex + i) % mediaList.length;
        let fileName = mediaList[mediaIndex];
        
        // Menggunakan %20 untuk spasi agar aman di semua browser
        let srcPath = `Tentang%20Saya/Galeri/${encodeURIComponent(fileName)}`;

        let itemWrapper = document.createElement('div');
        itemWrapper.style.cursor = "pointer";
        
        let isVideo = fileName.toLowerCase().endsWith('.mp4');
        let element = document.createElement(isVideo ? 'video' : 'img');
        element.src = srcPath; 
        element.className = 'slide-item';
        
        // Konfigurasi Video di Slider (Berjalan otomatis, tanpa suara, diulang terus)
        if(isVideo) {
            element.muted = true;
            element.autoplay = true;
            element.loop = true;
            element.playsInline = true; // Penting untuk HP agar tidak otomatis full screen
        }
        
        itemWrapper.appendChild(element); 
        sliderWrapper.appendChild(itemWrapper);

        // Konfigurasi saat Foto/Video diklik (Layar Penuh / Lightbox)
        itemWrapper.addEventListener('click', () => {
            lightboxContent.innerHTML = '';
            let mediaUtuh = document.createElement(isVideo ? 'video' : 'img');
            mediaUtuh.src = srcPath; 
            mediaUtuh.className = 'lightbox-media';
            
            if(isVideo) { 
                mediaUtuh.controls = true; // Munculkan tombol play/pause & volume
                mediaUtuh.autoplay = true; 
            }
            lightboxContent.appendChild(mediaUtuh); 
            lightbox.classList.add('active');
        });
    }
}

if(closeLightbox && lightbox) {
    closeLightbox.addEventListener('click', () => { 
        lightbox.classList.remove('active'); 
        // Hapus isi lightbox saat ditutup agar video berhenti bersuara
        lightboxContent.innerHTML = ''; 
    });
    lightbox.addEventListener('click', (e) => { 
        if (e.target === lightbox) { 
            lightbox.classList.remove('active'); 
            lightboxContent.innerHTML = ''; 
        }
    });
}

document.querySelector('.right-arrow')?.addEventListener('click', () => { 
    if (mediaList.length > 0) { currentIndex = (currentIndex + 1) % mediaList.length; renderSlider(); }
});
document.querySelector('.left-arrow')?.addEventListener('click', () => { 
    if (mediaList.length > 0) { currentIndex = (currentIndex - 1 + mediaList.length) % mediaList.length; renderSlider(); }
});

// Langsung jalankan fungsi render saat halaman siap
document.addEventListener('DOMContentLoaded', () => { renderSlider(); });

// ==========================================
// 3. FITUR AI CHATBOT - FULL CONTEXT MEMORY (FINAL)
// ==========================================
const aiWidget = document.getElementById('aiWidget');
const aiInput = document.getElementById('aiInput');
const aiBackdrop = document.getElementById('aiBackdrop');
const closeAiBtn = document.getElementById('closeAiBtn');
const aiChatArea = document.getElementById('aiChatArea');
const sendAiBtn = document.getElementById('sendAiBtn');

const API_KEY = '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'; 
let conversationHistory = [];

// Prompt Karakter dari Prompt Engineer
let SYSTEM_PROMPT = `Kamu adalah 'Subchan AI', agen digital dan asisten representatif di web portofolio Subchan Adi Maskuri. 

FILOSOFI PORTFOLIO:
Web ini adalah bentuk perlawanan terhadap reduksi kapasitas manusia di selembar CV. Tugasmu mendemonstrasikan kompleksitas, multidimensi keahlian, dan kedalaman analitis Subchan kepada para rekruter. 

SUDUT PANDANG & KARAKTER (MINDSET HR PROFESIONAL):
1. Posisikan dirimu sebagai pihak ketiga (agen).
2. Miliki insting analitis HR Profesional. Jelaskan perjalanan Subchan sebagai garis lurus menuju minat utamanya: Human Capital dan Organizational Development (Pengembangan Organisasi). 
3. Tonjolkan "Transferable Skills" (kemampuan analisis sistem, tata kelola data, dan pemahaman tata laku manusia).
4. Jawab dengan terstruktur, komprehensif, tidak bertele-tele (gunakan poin-poin).
5. [SANGAT PENTING - RUJUKAN SUMBER]: Di akhir jawaban, WAJIB sebutkan dari fase mana informasi itu diambil (berdasarkan tag [Fase X] pada teks memori di bawah).
6. Jika pertanyaan di luar konteks memori di bawah, jawab jujur lalu arahkan rekruter menghubungi Subchan langsung melalui ikon di halaman utama.

MEMORI REKAM JEJAK SUBCHAN (Baca semua ini dan jadikan referensi mutlak):\n`;

const daftarFaseCerita = [
  "Portofolio/Tentang Saya/cerita-saya/fase1.txt",
  "Portofolio/Tentang Saya/cerita-saya/fase2.txt",
  "Portofolio/Tentang Saya/cerita-saya/fase3.txt",
  "Portofolio/Tentang Saya/cerita-saya/fase4.txt",
  "Portofolio/Tentang Saya/cerita-saya/fase5.txt",
  "Portofolio/Tentang Saya/cerita-saya/fase6.txt",
  "Portofolio/Tentang Saya/cerita-saya/fase7.txt",
  "Portofolio/Tentang Saya/cerita-saya/fase8.txt"
];

// 3A. MEMUAT SELURUH CERITA KE DALAM OTAK AI
async function bangunIngatanAI() {
    for (let path of daftarFaseCerita) {
        try {
            const response = await fetch(encodeURI(path)); 
            if (response.ok) {
                const teks = await response.text();
                // Ambil nomor fase untuk rujukan
                const namaFaseMatch = path.match(/fase\d+/i);
                const namaFase = namaFaseMatch ? namaFaseMatch[0].toUpperCase() : "CERITA UMUM";
                
                // Masukkan seluruh teks utuh ke dalam System Prompt
                SYSTEM_PROMPT += `\n\n--- [Sumber: ${namaFase}] ---\n${teks}\n`;
            } else {
                console.warn("Gagal membaca file (cek nama file/folder):", path);
            }
        } catch (error) {
            console.error("Gagal koneksi saat membaca file:", path);
        }
    }
    
    // Inisiasi memori chat dengan prompt raksasa ini
    conversationHistory = [{ role: 'system', content: SYSTEM_PROMPT }];
    console.log("Sistem Full Context Memory Berhasil Dimuat!");
}

document.addEventListener('DOMContentLoaded', () => { bangunIngatanAI(); });

// 3B. UI CONTROLS & API CALL
function bukaAiLayarPenuh() {
    if (aiWidget) aiWidget.classList.add('fullscreen-mode');
    if (aiBackdrop) aiBackdrop.classList.add('active');
}
function tutupAiLayarPenuh() {
    if (aiWidget) aiWidget.classList.remove('fullscreen-mode');
    if (aiBackdrop) aiBackdrop.classList.remove('active');
}
if (aiInput) aiInput.addEventListener('focus', bukaAiLayarPenuh);
if (closeAiBtn) closeAiBtn.addEventListener('click', tutupAiLayarPenuh);
if (aiBackdrop) aiBackdrop.addEventListener('click', tutupAiLayarPenuh);

async function sendMessage() {
    const userText = aiInput.value.trim();
    if (!userText) return;

    appendMessage('User', userText, 'user-msg');
    aiInput.value = ''; 

    const loadingId = appendMessage('Subchan AI', 'Sebentar, menganalisis rekam jejak secara menyeluruh...', 'ai-msg chat-loading');

    // Langsung masukkan pertanyaan ke riwayat
    conversationHistory.push({ role: 'user', content: userText });

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': 'https://subchanadimaskuri-web.github.io/', 
                'X-Title': 'Portofolio Subchan', 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Menggunakan model valid dari OpenRouter dengan kapasitas 1 Juta Token
                model: 'nvidia/nemotron-3-ultra-550b-a55b:free', 
                messages: conversationHistory 
            })
        });

        const data = await response.json();
        document.getElementById(loadingId).remove();

        if (data.choices && data.choices.length > 0) {
            let aiReply = data.choices[0].message.content;
            aiReply = aiReply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
            appendMessage('Subchan AI', aiReply, 'ai-msg');
            
            // Simpan jawaban AI agar tidak amnesia
            conversationHistory.push({ role: 'assistant', content: data.choices[0].message.content });

            // Tweak Web Dev: Cegah payload membengkak. Sisakan Prompt Utama + 10 Chat Terakhir
            if (conversationHistory.length > 11) {
                // Menghapus elemen di index 1 dan 2 (Pertanyaan & Jawaban terlama), index 0 tetap aman
                conversationHistory.splice(1, 2); 
            }
        } else {
            // Rollback riwayat jika terjadi error agar tidak merusak logika memori
            conversationHistory.pop(); 
            appendMessage('Subchan AI', `Error API: ${data.error ? data.error.message : 'Unknown Error'}`, 'ai-msg');
        }
    } catch (error) {
        // Rollback riwayat
        conversationHistory.pop();
        document.getElementById(loadingId).remove();
        appendMessage('Subchan AI', 'Koneksi terputus atau server sedang penuh.', 'ai-msg');
    }
}

function appendMessage(sender, text, className) {
    const msgDiv = document.createElement('div');
    const msgId = 'msg-' + Date.now();
    msgDiv.id = msgId;
    msgDiv.className = `chat-message ${className}`;
    msgDiv.innerHTML = sender === 'User' ? text : `<strong>${sender}:</strong><br>${text}`;
    
    if (aiChatArea) {
        aiChatArea.appendChild(msgDiv);
        setTimeout(() => { aiChatArea.scrollTop = aiChatArea.scrollHeight; }, 100);
    }
    return msgId;
}

if (sendAiBtn) sendAiBtn.addEventListener('click', sendMessage);
if (aiInput) {
    aiInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
}

// ==========================================
// 4. FITUR POPUP PDF RIWAYAT PEKERJAAN
// ==========================================
const jobLinks = document.querySelectorAll('.job-title-link');
jobLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pdfFile = link.getAttribute('data-pdf');
        if (lightbox && lightboxContent && pdfFile) {
            lightboxContent.innerHTML = `<iframe src="${encodeURI(pdfFile)}#toolbar=0" class="pdf-viewer"></iframe>`;
            lightbox.classList.add('active'); 
        }
    });
});
