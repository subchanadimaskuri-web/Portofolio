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
// 3. FITUR AI CHATBOT - METODE HYBRID JSON RAG & DUAL COGNITION
// ==========================================
const aiWidget = document.getElementById('aiWidget');
const aiInput = document.getElementById('aiInput');
const aiBackdrop = document.getElementById('aiBackdrop');
const closeAiBtn = document.getElementById('closeAiBtn');
const aiChatArea = document.getElementById('aiChatArea');
const sendAiBtn = document.getElementById('sendAiBtn');

// ⚠️ API Key dipertahankan sesuai instruksi.
const API_KEY = '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'; 

let conversationHistory = [];
const MAX_HISTORY_LENGTH = 7; // Mencegah memory leak & error token batas API

// 1. Injeksi Otak AI (Kognisi Ganda & Aturan UI)
async function bangunIngatanAI() {
    let systemPromptBase = `Anda adalah "Subchan AI", representasi intelektual dan asisten virtual pihak ketiga untuk portofolio Subchan Adi Maskuri. Audiens Anda adalah rekruter Human Capital (HC), Organizational Development (OD), dan profesional perusahaan.

KARAKTER & GAYA BAHASA:
1. Analitis & Filosofis-Operasional: Gunakan bahasa yang elegan, tenang, dan analitis. Boleh gunakan terminologi filsafat/sistem, namun harus membumi pada penyelesaian masalah praktis.
2. Rendah Hati & Profesional: Jangan melebih-lebihkan (overselling). Bersikaplah sebagai negosiator objektif berbasis data.
3. Naratif: Jawab menggunakan paragraf yang mengalir (storytelling logis). Kurangi penggunaan poin-poin kecuali sangat diperlukan.

ATURAN KOGNISI GANDA (DUAL COGNITION):
1. FAKTA PERSONAL (TERKUNCI MUTLAK): Untuk riwayat kerja, proyek, alasan karir, atau keahlian teknis Subchan, Anda HANYA BOLEH menggunakan data JSON di bawah. Jangan pernah mengarang riwayat kerja fiktif.
2. WAWASAN TEORETIS (FLEKSIBEL): Jika ditanya istilah filsafat/teori (misal: "Apa itu Epistemologi?"), jelaskan secara cerdas, LALU kaitkan dengan bagaimana Subchan mengaplikasikannya di lapangan berdasarkan data.
3. BATASAN PRIVASI: Jika ditanya hal privasi atau ekspektasi gaji, jawab: "Maaf, parameter tersebut tidak tersedia di memori saya. Silakan hubungi Mas Subchan secara langsung melalui ikon kontak (Email/LinkedIn/WhatsApp) di laman utama."

ATURAN NAVIGASI UI & CALL-TO-ACTION (PENTING!):
Anda DILARANG KERAS mencetak sumber file statis (seperti [source: fase1.html]). Sebagai gantinya, Anda WAJIB mengarahkan audiens untuk berinteraksi dengan website ini secara natural di dalam jawaban Anda:
- Jika membahas Pendidikan/Sertifikasi (SMKN 1 Sigi, UIN, BNSP): "Anda dapat melihat detailnya di bagian 'Pendidikan & Sertifikasi' pada web ini."
- Jika membahas Pengalaman Kerja (CV. Mangkuraja, PT. Mangkuraja, dll): "Silakan klik judul pekerjaan tersebut di bagian 'Riwayat Pekerjaan' untuk membuka rincian tugas dan portofolio PDF-nya."
- Jika membahas Proyek/Karya Tambahan: "Anda dapat melihat hasil nyata dari proyek ini di tab menu 'Portofolio' atau 'Epustaka & Podcast' di bagian atas halaman."

=== MEMORI DATABASE JSON (FASE 001 - 010) ===
`;

    const daftarJson = [
        'Tentang%20Saya/cerita-saya/grub1.json',
        'Tentang%20Saya/cerita-saya/grub2.json',
        'Tentang%20Saya/cerita-saya/grub3.json'
    ];

    try {
        const responses = await Promise.all(daftarJson.map(path => fetch(path)));
        let jumlahBerhasil = 0;

        for (let res of responses) {
            if (res.ok) {
                const jsonData = await res.json();
                systemPromptBase += JSON.stringify(jsonData, null, 2) + "\n\n"; 
                jumlahBerhasil++;
            }
        }
        
        conversationHistory = [{ role: 'system', content: systemPromptBase }];
        
        if (jumlahBerhasil === 0) {
            alert("🚨 GAWAT: AI gagal memuat file JSON (grub1-3). Pastikan path foldernya benar.");
        } else {
            console.log(`[Sistem AI] Berhasil menyuntikkan ${jumlahBerhasil} file JSON ke memori.`);
        }

    } catch (error) {
        console.error("Gagal membangun ingatan AI:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => { bangunIngatanAI(); });

// 2. UI Controls AI Widget
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

// 3. Manajemen Memori Obrolan
function kelolaMemori(pesanBaru) {
    conversationHistory.push(pesanBaru);
    if (conversationHistory.length > MAX_HISTORY_LENGTH + 1) {
        conversationHistory.splice(1, 2); 
    }
}

// 4. Logika API Call (Metode Sequential Fallback / Hemat Token)
async function sendMessage() {
    const userText = aiInput.value.trim();
    if (!userText) return;

    appendMessage('User', userText, 'user-msg');
    aiInput.value = ''; 
    const loadingId = appendMessage('Subchan AI', 'Memproses arsitektur data...', 'ai-msg chat-loading');

    kelolaMemori({ role: 'user', content: userText });

    // Daftar 3 Model Terandal (Dicoba satu per satu berurutan)
    const models = [
        'nvidia/nemotron-3-ultra-550b-a55b:free',
        'google/gemma-2-9b-it:free',
        'liquid/lfm-2.5-2.6b:free'
    ];

    let success = false;
    let aiReply = "";

    for (let i = 0; i < models.length; i++) {
        let modelName = models[i];
        
        try {
            // Animasi Loading Dinamis (Berubah Teks Jika Pindah Server)
            if (i > 0) {
                document.getElementById(loadingId).innerHTML = `<em>Server penuh, mengalihkan ke model cadangan (${i+1}/3)...</em>`;
            } else {
                document.getElementById(loadingId).innerHTML = `<em>Menelusuri database rekam jejak...</em>`;
            }

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'HTTP-Referer': 'https://subchanadimaskuri-web.github.io/', 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: modelName, 
                    messages: conversationHistory,
                    temperature: 0.4 // Keseimbangan antara akurasi JSON & keluwesan filosofis
                })
            });

            if (!response.ok) throw new Error(`Server ${modelName} sibuk/menolak.`);
            
            const data = await response.json();
            if (data.choices && data.choices.length > 0) {
                aiReply = data.choices[0].message.content;
                success = true;
                console.log(`[AI Engine] Berhasil menggunakan model: ${modelName}`);
                break; // Keluar dari loop pencarian model karena sudah sukses
            }
        } catch (error) {
            console.warn(`[AI Engine] Model ${modelName} gagal, mencoba jalur berikutnya...`);
        }
    }

    // Menghapus elemen loading setelah proses selesai (sukses/gagal)
    document.getElementById(loadingId).remove();

    if (success) {
        let formattedReply = aiReply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
        appendMessage('Subchan AI', formattedReply, 'ai-msg');
        kelolaMemori({ role: 'assistant', content: aiReply });
    } else {
        appendMessage('Subchan AI', 'Maaf, seluruh jaringan server AI sedang mengalami kepadatan tinggi. Mohon coba beberapa saat lagi, atau klik ikon kontak untuk berbincang langsung dengan Mas Subchan ya.', 'ai-msg');
        conversationHistory.pop(); // Hapus pesan agar user bisa mencoba lagi tanpa error bertumpuk
    }
}

function appendMessage(sender, text, className) {
    const msgDiv = document.createElement('div');
    const msgId = 'msg-' + Date.now();
    msgDiv.id = msgId;
    msgDiv.className = `chat-message ${className}`;
    
    if(sender === 'User') { msgDiv.innerHTML = `${text}`; } 
    else { msgDiv.innerHTML = `<strong>${sender}:</strong><br>${text}`; }
    
    if (aiChatArea) {
        aiChatArea.appendChild(msgDiv);
        setTimeout(() => { aiChatArea.scrollTop = aiChatArea.scrollHeight; }, 100);
    }
    return msgId;
}

if (sendAiBtn) sendAiBtn.addEventListener('click', sendMessage);
if (aiInput) aiInput.addEventListener('keypress', function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }});

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
