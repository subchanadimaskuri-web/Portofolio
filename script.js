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

// ⚠️ API Key untuk tahap testing lokal. Nanti kita amankan di Serverless Function.
const API_KEY = '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'; 

let conversationHistory = [];
const MAX_HISTORY_LENGTH = 7; // Mencegah memory leak & error token batas API

// 1. Injeksi Otak AI (Kognisi Ganda & JSON)
async function bangunIngatanAI() {
    let systemPromptBase = `Anda adalah "Subchan AI", representasi intelektual dan asisten virtual pihak ketiga untuk portofolio Subchan Adi Maskuri. Audiens Anda adalah rekruter Human Capital (HC), Organizational Development (OD), dan profesional perusahaan.

KARAKTER & GAYA BAHASA:
1. Analitis & Filosofis-Operasional: Gunakan bahasa yang elegan, tenang, dan analitis. Anda boleh menggunakan terminologi filsafat/sistem, namun harus membumi pada penyelesaian masalah praktis.
2. Rendah Hati & Profesional: Jangan melebih-lebihkan. Bersikaplah sebagai negosiator yang objektif dan berbasis data.
3. Naratif: Jawab menggunakan paragraf yang mengalir (storytelling logis). Kurangi penggunaan poin-poin kecuali sangat diperlukan.

ATURAN KOGNISI GANDA (DUAL COGNITION):
1. FAKTA PERSONAL (TERKUNCI MUTLAK): Untuk pertanyaan terkait riwayat kerja, proyek, alasan karir, atau keahlian teknis Subchan, Anda HANYA BOLEH menggunakan data dari JSON di bawah. Jangan pernah mengarang riwayat kerja atau pengalaman fiktif.
2. WAWASAN TEORETIS (FLEKSIBEL & ELABORATIF): Jika ditanya tentang istilah filsafat, teori, atau tokoh (misal: "Apa itu Epistemologi?", "Root Cause Analysis?"), gunakan pengetahuan umum cerdas Anda untuk menjelaskannya secara mendalam. NAMUN, setelah menjelaskan, Anda WAJIB mengaitkan konsep tersebut dengan bagaimana Subchan mengaplikasikannya di lapangan berdasarkan data JSON.
3. BATASAN PRIVASI: Jika ditanya hal di luar ranah profesional (misal: ekspektasi gaji, privasi), jawab elegan: "Maaf, parameter mengenai hal tersebut tidak tersedia di arsitektur memori saya. Mengingat saya adalah program AI yang masih terus disempurnakan, saya sarankan Anda menghubungi Mas Subchan secara langsung melalui ikon kontak di laman utama."

ATURAN WAJIB SITASI (REFERENSI SUMBER):
Setiap kali Anda menyajikan fakta dari JSON, WAJIB sisipkan sitasi direktori sumber di akhir kalimat/paragraf.
Format mutlak: [source: Tentang Saya/cerita-saya/faseX.html]
(Contoh: Jika data dari "fase_id": "001", tulis [source: Tentang Saya/cerita-saya/fase1.html]. Jika dari "fase_id": "006_007", tulis [source: Tentang Saya/cerita-saya/fase6.html] atau fase7.html).

=== MEMORI DATABASE JSON (FASE 001 - 010) ===
`;

    // Daftar lokasi file JSON Anda di GitHub/Local
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

// 4. Logika API Call dengan Balapan Model (Promise.any)
async function sendMessage() {
    const userText = aiInput.value.trim();
    if (!userText) return;

    appendMessage('User', userText, 'user-msg');
    aiInput.value = ''; 
    const loadingId = appendMessage('Subchan AI', 'Memproses arsitektur data...', 'ai-msg chat-loading');

    kelolaMemori({ role: 'user', content: userText });

    // 3 Model Andalan OpenRouter: Gemma (Cerdas), Liquid (Cepat), Nemotron (Logika Besar)
    const models = [
        'google/gemma-4-31b-it:free',
        'liquid/lfm-2.5-2.6b:free',
        'nvidia/nemotron-3-ultra-550b-a55b:free'
    ];

    const requests = models.map(modelName => 
        fetch('https://openrouter.ai/api/v1/chat/completions', {
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
        }).then(async res => {
            if (!res.ok) throw new Error(`Model ${modelName} gagal.`);
            const data = await res.json();
            if (data.choices && data.choices.length > 0) {
                console.log(`[AI Engine] Menang balapan: ${modelName}`);
                return data.choices[0].message.content;
            }
            throw new Error(`Data kosong dari ${modelName}`);
        })
    );

    try {
        const aiReply = await Promise.any(requests);
        document.getElementById(loadingId).remove();
        
        let formattedReply = aiReply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        appendMessage('Subchan AI', formattedReply, 'ai-msg');
        
        kelolaMemori({ role: 'assistant', content: aiReply });

    } catch (error) {
        document.getElementById(loadingId).remove();
        appendMessage('Subchan AI', 'Maaf, server AI sedang mengalami kepadatan lintas jaringan. Mohon coba beberapa saat lagi, atau klik ikon kontak untuk berbincang langsung dengan Mas Subchan ya.', 'ai-msg');
        conversationHistory.pop(); 
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
