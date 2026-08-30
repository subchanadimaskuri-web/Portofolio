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
// 3. FITUR AI CHATBOT - METODE FULL-CONTEXT & AUTO-FALLBACK
// ==========================================
const aiWidget = document.getElementById('aiWidget');
const aiInput = document.getElementById('aiInput');
const aiBackdrop = document.getElementById('aiBackdrop');
const closeAiBtn = document.getElementById('closeAiBtn');
const aiChatArea = document.getElementById('aiChatArea');
const sendAiBtn = document.getElementById('sendAiBtn');

const API_KEY = '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'; 

let conversationHistory = [];

// 1. Konsep "Buku Panduan" dari Prompt Engineer
let SYSTEM_PROMPT = `Kamu adalah 'Subchan AI', agen asisten di portofolio Subchan Adi Maskuri.

PERANMU SEBAGAI PUSTAKAWAN & HR:
Di bawah instruksi ini, terdapat "Buku Panduan Rekam Jejak Subchan". Setiap kali rekruter bertanya, tugasmu adalah MENCARI, MEMBACA, dan MENYINTESIS informasi HANYA dari Buku Panduan tersebut.

ATURAN MENJAWAB:
1. Pahami makna tersirat dari pertanyaan rekruter dan hubungkan dengan cerita di Buku Panduan.
2. Jelaskan benang merah perjalanan Subchan menuju minat utamanya: Human Capital & Organizational Development.
3. Jawab HANYA berdasarkan Buku Panduan. Jika tidak ada di buku, katakan dengan sopan: "Maaf, catatan mengenai hal tersebut tidak ada di memori saya. Silakan hubungi Mas Subchan langsung via ikon kontak."
4. Jawab dengan asyik, terstruktur (gunakan poin-poin), dan tidak bertele-tele.
5. [WAJIB] Di akhir jawaban, sebutkan dari Bab/Fase mana kamu membaca informasi tersebut.

==================================================
📖 BUKU PANDUAN REKAM JEJAK SUBCHAN:
==================================================
`;

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

// 2. Memuat seluruh isi file dan menjadikannya SATU BUKU UTUH
async function bangunIngatanAI() {
    let isiBukuPanduan = "";
    
    for (let path of daftarFaseCerita) {
        try {
            const response = await fetch(encodeURI(path)); 
            if (response.ok) {
                const teks = await response.text();
                let namaFile = path.split('/').pop(); 
                let namaFase = namaFile.replace('.txt', '').replace(/fase/i, 'Fase ');
                
                // Menggabungkan setiap teks dengan judul Bab-nya
                isiBukuPanduan += `\n\n--- BAB: ${namaFase} ---\n${teks.trim()}`;
            } else {
                console.warn("Gagal fetch file:", path);
            }
        } catch (error) {
            console.error("Network error:", path, error);
        }
    }
    
    // Menyuntikkan seluruh buku ke dalam sistem otak AI
    SYSTEM_PROMPT += isiBukuPanduan;
    conversationHistory = [{ role: 'system', content: SYSTEM_PROMPT }];
    console.log("[Sistem AI] Buku Panduan berhasil dimuat penuh ke dalam memori.");
}

document.addEventListener('DOMContentLoaded', () => { 
    bangunIngatanAI(); 
});

// UI Controls
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

// 3. Logika API Call dengan Auto-Fallback Loop
async function sendMessage() {
    const userText = aiInput.value.trim();
    if (!userText) return;

    appendMessage('User', userText, 'user-msg');
    aiInput.value = ''; 

    const loadingId = appendMessage('Subchan AI', 'Sebentar, menganalisis rekam jejak secara menyeluruh...', 'ai-msg chat-loading');

    // Menambahkan pertanyaan user ke riwayat obrolan
    conversationHistory.push({ role: 'user', content: userText });

    // Daftar Prioritas Model AI (Gratis, Memori Besar, & Stabil)
    const daftarModelPrioritas = [
        'nvidia/nemotron-3-ultra-550b-a55b:free', // Prioritas 1: Memori super besar (1M), sangat cerdas
        'liquid/lfm-2.5-2.6b:free',                      // Prioritas 2: Cepat dan stabil
        'openrouter/free'             // Prioritas 3: Cadangan paling tangguh
    ];

    let success = false;
    let aiReply = "";

    // Loop Auto-Fallback (Mencari server yang tidak sibuk)
    for (let modelName of daftarModelPrioritas) {
        try {
            console.log(`[AI Agent] Mengirim request ke server: ${modelName}...`);
            
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'HTTP-Referer': 'https://subchanadimaskuri-web.github.io/', 
                    'X-Title': 'Portofolio Subchan', 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: modelName, 
                    messages: conversationHistory 
                })
            });

            const data = await response.json();

            // Jika ada respons dan tidak error (server merespons dengan baik)
            if (data.choices && data.choices.length > 0) {
                aiReply = data.choices[0].message.content;
                success = true;
                console.log(`[AI Agent] Berhasil mendapatkan respons dari: ${modelName}`);
                break; // Hentikan loop pencarian model, kita sudah dapat jawaban!
            } else {
                throw new Error("Server mengembalikan error atau sibuk.");
            }
        } catch (error) {
            console.warn(`[AI Agent] Server ${modelName} sibuk/gagal. Otomatis beralih ke model cadangan...`);
        }
    }

    // Menghapus animasi "Sebentar, menganalisis..."
    document.getElementById(loadingId).remove();

    if (success) {
        // Tampilkan jawaban
        aiReply = aiReply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        appendMessage('Subchan AI', aiReply, 'ai-msg');
        
        // Simpan jawaban ke riwayat agar AI tidak amnesia untuk pertanyaan berikutnya
        conversationHistory.push({ role: 'assistant', content: aiReply });
    } else {
        // Jika SEMUA (ketiga) model server sedang down/sibuk
        appendMessage('Subchan AI', 'Maaf, server AI di seluruh jaringan sedang mengalami kepadatan tinggi. Mohon coba beberapa saat lagi, atau klik ikon kontak untuk berbincang langsung dengan Mas Subchan ya.', 'ai-msg');
        
        // Hapus pesan user dari riwayat agar tidak bertumpuk error
        conversationHistory.pop(); 
    }
}

function appendMessage(sender, text, className) {
    const msgDiv = document.createElement('div');
    const msgId = 'msg-' + Date.now();
    msgDiv.id = msgId;
    msgDiv.className = `chat-message ${className}`;
    
    if(sender === 'User') {
        msgDiv.innerHTML = `${text}`;
    } else {
        msgDiv.innerHTML = `<strong>${sender}:</strong><br>${text}`;
    }
    
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
