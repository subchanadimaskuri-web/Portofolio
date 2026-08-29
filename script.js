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
// 3. FITUR AI CHATBOT - METODE CLIENT-SIDE RAG (FINAL MASTERPIECE)
// ==========================================
const aiWidget = document.getElementById('aiWidget');
const aiInput = document.getElementById('aiInput');
const aiBackdrop = document.getElementById('aiBackdrop');
const closeAiBtn = document.getElementById('closeAiBtn');
const aiChatArea = document.getElementById('aiChatArea');
const sendAiBtn = document.getElementById('sendAiBtn');

const API_KEY = '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'; 

// Database internal untuk menampung memori (RAG)
let knowledgeBase = []; 
let conversationHistory = [];

// 1. Prompt Masterpiece dari Prompt Engineer
const SYSTEM_PROMPT_BASE = `Kamu adalah 'Subchan AI', agen digital dan asisten representatif di web portofolio Subchan Adi Maskuri. 

FILOSOFI PORTFOLIO:
Web ini adalah bentuk perlawanan terhadap reduksi kapasitas manusia di selembar CV. Tugasmu adalah mendemonstrasikan kompleksitas, multidimensi keahlian, dan kedalaman analitis Subchan kepada para rekruter. 

SUDUT PANDANG & KARAKTER (MINDSET HR PROFESIONAL):
1. Posisikan dirimu sebagai pihak ketiga (agen Subchan).
2. Kamu memiliki insting analitis seorang HR Profesional. Jelaskan perjalanan Subchan (baik itu pengalaman organisasi kampus, operasional lapangan, hingga eksplorasi mandiri) sebagai sebuah garis lurus yang logis menuju minat utamanya: Human Capital dan Organizational Development (Pengembangan Organisasi). 
3. Jangan memaksa mencocok-cocokkan setiap hal dengan HR jika tidak relevan, tapi tonjolkan "Transferable Skills"-nya (contoh: kemampuan analisis sistem, tata kelola data, dan pemahaman tata laku manusia).
4. Jawab dengan terstruktur, tajam, komprehensif, dan tidak bertele-tele. Gunakan poin-poin (bullet points) untuk memecah informasi kompleks.

ATURAN MENJAWAB (RAG SYSTEM):
1. Jawab HANYA berdasarkan "KONTEKS CERITA" yang diberikan. 
2. Sintesiskan informasi dari konteks tersebut untuk menyoroti 'Dampak' (Impact) dan 'Proses Berpikir' Subchan.
3. [SANGAT PENTING - RUJUKAN SUMBER]: Di setiap akhir jawabanmu, kamu WAJIB menyebutkan dari fase mana informasi tersebut kamu ambil (berdasarkan tag [Fase X] pada konteks). Gunakan kalimat elegan seperti: "Informasi ini disarikan dari rekam jejak Subchan pada Fase X dan Fase Y." 
4. Jika pertanyaan di luar konteks atau membutuhkan diskusi lebih dalam, jawab dengan jujur bahwa datanya belum ada di memori saat ini, lalu arahkan rekruter dengan kalimat penutup: "Untuk mengeksplorasi topik ini lebih jauh, saya sangat menyarankan Anda menghubungi Subchan secara langsung melalui ikon media komunikasi di halaman utama."`;

// 2. Daftar File (Pastikan huruf besar/kecil sesuai di GitHub)
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

// 3. Mesin Indexing: Membaca, Memecah Cerita & Menempelkan Tag [Fase X]
async function bangunIngatanAI() {
    for (let path of daftarFaseCerita) {
        try {
            const response = await fetch(encodeURI(path)); 
            if (response.ok) {
                const teks = await response.text();
                const paragrafArray = teks.split(/\n\s*\n/); 
                
                // Mengambil nama fase dari nama file (misal: "fase1.txt" jadi "Fase 1")
                let namaFile = path.split('/').pop(); 
                let namaFase = namaFile.replace('.txt', '').replace(/fase/i, 'Fase ');

                paragrafArray.forEach(paragraf => {
                    if(paragraf.trim().length > 50) { 
                        // Menyimpan teks sekaligus sumber fasenya (KTP)
                        knowledgeBase.push({ teks: paragraf.trim(), sumber: namaFase });
                    }
                });
            } else {
                console.warn("Gagal fetch file (Cek penulisan path):", path);
            }
        } catch (error) {
            console.error("Network error saat membaca file:", path, error);
        }
    }
    console.log(`[RAG System] Berhasil memuat ${knowledgeBase.length} potongan memori cerita.`);
    
    // Inisiasi awal riwayat chat
    conversationHistory = [{ role: 'system', content: SYSTEM_PROMPT_BASE }];
}

document.addEventListener('DOMContentLoaded', () => { 
    bangunIngatanAI(); 
});

// 4. Mesin Pencari untuk menyodorkan Tag ke AI
function cariKonteksRelevan(pertanyaanUser) {
    const kataKunci = pertanyaanUser.toLowerCase().replace(/[^\w\s]/gi, '').split(' ').filter(k => k.length > 2);
    
    let skorParagraf = knowledgeBase.map(item => {
        let skor = 0;
        let paragrafLower = item.teks.toLowerCase();
        
        kataKunci.forEach(kata => {
            if (paragrafLower.includes(kata)) {
                skor += 1; 
            }
        });
        return { teks: item.teks, sumber: item.sumber, skor: skor };
    });

    skorParagraf.sort((a, b) => b.skor - a.skor);
    const paragrafTerbaik = skorParagraf.slice(0, 5).filter(p => p.skor > 0);

    if (paragrafTerbaik.length === 0) return "Tidak ada data spesifik dari cerita terkait pertanyaan ini.";
    
    // Menyusun format yang dikirim ke AI: [Fase X]: Isi cerita...
    return paragrafTerbaik.map((p) => `[${p.sumber}]: ${p.teks}`).join("\n\n");
}

// 5. UI CONTROLS & GENERATION (API CALL)
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

    const loadingId = appendMessage('Subchan AI', 'Sebentar, mengecek memori cerita...', 'ai-msg chat-loading');

    // Menerapkan RAG: Ambil konteks yang relevan
    const konteksDitemukan = cariKonteksRelevan(userText);
    const promptDenganKonteks = `Pertanyaan User: ${userText}\n\nKONTEKS CERITA (Gunakan ini sebagai referensi utama):\n${konteksDitemukan}`;

    // TWEAK WEB DEV: Buat paket pesan sementara untuk dikirim ke API agar riwayat tidak bengkak
    let pesanUntukDikirim = [...conversationHistory];
    pesanUntukDikirim.push({ role: 'user', content: promptDenganKonteks });

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
                // Model default disetel ke Gemma 9B agar dijamin stabil dan gratis.
                // Jika ingin mencoba gemma-4-31b atau model lain, cukup ganti ID di bawah ini:
                model: 'nvidia/nemotron-3.5-content-safety:free', 
                messages: pesanUntukDikirim 
            })
        });

        const data = await response.json();
        document.getElementById(loadingId).remove();

        if (data.choices && data.choices.length > 0) {
            let aiReply = data.choices[0].message.content;
            aiReply = aiReply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
            appendMessage('Subchan AI', aiReply, 'ai-msg');
            
            // Simpan pertanyaan asli dan jawaban AI ke riwayat memori (tanpa teks konteks yang panjang)
            conversationHistory.push({ role: 'user', content: userText });
            conversationHistory.push({ role: 'assistant', content: aiReply });
            
            // Jaga agar memori tidak terlalu panjang (Maksimal simpan 10 percakapan terakhir)
            if (conversationHistory.length > 11) {
                conversationHistory.splice(1, 2); 
            }
        } else {
            appendMessage('Subchan AI', `Error API: ${data.error ? data.error.message : 'Unknown Error'}`, 'ai-msg');
        }
    } catch (error) {
        document.getElementById(loadingId).remove();
        appendMessage('Subchan AI', 'Koneksi terputus atau server sedang sibuk.', 'ai-msg');
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
