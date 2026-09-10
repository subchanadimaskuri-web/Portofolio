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
// 2. GALERI SLIDER & LIGHTBOX
// ==========================================
const mediaList = [
  "Slide 1.mp4", "Slide 2.mp4", "Slide 3.mp4", "Slide 4.mp4", 
  "Slide 5.mp4", "Slide 5.jpeg", "Slide 5a.mp4", "Slide 5b.mp4", 
  "Slide 6a.jpeg", "Slide 6b.jpg", "Slide 7.jpg", "Slide 8.jpg", 
  "Slide 9.mp4", "Slide 10.jpeg", "Slide 11.jpg", "Slide 12.jpg", 
  "Slide 13.jpeg", "Slide 14.jpeg"
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
        let srcPath = `Tentang%20Saya/Galeri/${encodeURIComponent(fileName)}`;

        let itemWrapper = document.createElement('div');
        itemWrapper.style.cursor = "pointer";
        
        let isVideo = fileName.toLowerCase().endsWith('.mp4');
        let element = document.createElement(isVideo ? 'video' : 'img');
        element.src = srcPath; 
        element.className = 'slide-item';
        
        if(isVideo) {
            element.muted = true; element.autoplay = true;
            element.loop = true; element.playsInline = true; 
        }
        
        itemWrapper.appendChild(element); 
        sliderWrapper.appendChild(itemWrapper);

        itemWrapper.addEventListener('click', () => {
            lightboxContent.innerHTML = '';
            let mediaUtuh = document.createElement(isVideo ? 'video' : 'img');
            mediaUtuh.src = srcPath; 
            mediaUtuh.className = 'lightbox-media';
            
            if(isVideo) { 
                mediaUtuh.controls = true; mediaUtuh.autoplay = true; 
            }
            lightboxContent.appendChild(mediaUtuh); 
            lightbox.classList.add('active');
        });
    }
}

if(closeLightbox && lightbox) {
    closeLightbox.addEventListener('click', () => { lightbox.classList.remove('active'); lightboxContent.innerHTML = ''; });
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) { lightbox.classList.remove('active'); lightboxContent.innerHTML = ''; }});
}

document.querySelector('.right-arrow')?.addEventListener('click', () => { if (mediaList.length > 0) { currentIndex = (currentIndex + 1) % mediaList.length; renderSlider(); }});
document.querySelector('.left-arrow')?.addEventListener('click', () => { if (mediaList.length > 0) { currentIndex = (currentIndex - 1 + mediaList.length) % mediaList.length; renderSlider(); }});
document.addEventListener('DOMContentLoaded', () => { renderSlider(); });

// ==========================================
// 3. FITUR AI CHATBOT (OTAK AI)
// ==========================================
const aiWidget = document.getElementById('aiWidget');
const aiInput = document.getElementById('aiInput');
const aiBackdrop = document.getElementById('aiBackdrop');
const closeAiBtn = document.getElementById('closeAiBtn');
const aiChatArea = document.getElementById('aiChatArea');
const sendAiBtn = document.getElementById('sendAiBtn');
const API_KEY = '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'; 
let conversationHistory = [];
const MAX_HISTORY_LENGTH = 7; 

async function bangunIngatanAI() {
   let systemPromptBase = `Anda adalah "Subchan AI", representasi intelektual dan asisten virtual pihak ketiga untuk portofolio Subchan Adi Maskuri. Audiens Anda adalah rekruter Human Capital (HC), Organizational Development (OD), dan profesional perusahaan.

KARAKTER & GAYA BAHASA:
1. Ringkas & Konversasional: Jawab maksimal 2-3 paragraf pendek. Gunakan bahasa yang mengalir dan hindari format tabel.
2. Fokus Praktis: Jangan sebutkan nama tokoh (seperti Foucault, Lacan) kecuali ditanya spesifik. Ekstrak "solusi HR/operasional"-nya saja dengan bahasa membumi.
3. Objektif: Bersikaplah sebagai negosiator objektif yang berpijak pada fakta operasional.
4. Interaktif: Akhiri dengan satu pertanyaan balik yang relevan.

ATURAN KOGNISI:
1. Fakta personal mutlak harus dari JSON di bawah.
2. Batasan Privasi: Jika ditanya ekspektasi gaji/privasi, arahkan kontak langsung.
3. Kesiapan Karir: Tunjukkan Subchan antusias memulai dari Entry-Level/Staf Admin HR sebagai fondasi memahami operasional dasar (Ground Truth).
4. Arahkan interaksi web: "Anda dapat melihat detailnya di bagian 'Pendidikan & Sertifikasi'", "Silakan klik judul pekerjaan", dll.

=== MEMORI DATABASE JSON ===
`;

    const daftarJson = [
        'Tentang%20Saya/cerita-saya/grub1.json',
        'Tentang%20Saya/cerita-saya/grub2.json',
        'Tentang%20Saya/cerita-saya/grub3.json',
        'Tentang%20Saya/cerita-saya/grub4.json'
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
        if (jumlahBerhasil === 0) console.warn("🚨 AI gagal memuat file JSON.");
    } catch (error) { console.error("Gagal membangun ingatan AI:", error); }
}
document.addEventListener('DOMContentLoaded', () => { bangunIngatanAI(); });

// Controls AI Widget
function bukaAiLayarPenuh() { if (aiWidget) aiWidget.classList.add('fullscreen-mode'); if (aiBackdrop) aiBackdrop.classList.add('active'); }
function tutupAiLayarPenuh() { if (aiWidget) aiWidget.classList.remove('fullscreen-mode'); if (aiBackdrop) aiBackdrop.classList.remove('active'); }

if (aiInput) aiInput.addEventListener('focus', bukaAiLayarPenuh);
const aiInputWrapper = document.getElementById('aiInputWrapper');
if (aiInputWrapper) aiInputWrapper.addEventListener('click', bukaAiLayarPenuh);
if (closeAiBtn) closeAiBtn.addEventListener('click', tutupAiLayarPenuh);
if (aiBackdrop) aiBackdrop.addEventListener('click', tutupAiLayarPenuh);

function kelolaMemori(pesanBaru) {
    conversationHistory.push(pesanBaru);
    if (conversationHistory.length > MAX_HISTORY_LENGTH + 1) conversationHistory.splice(1, 2); 
}

async function sendMessage() {
    const userText = aiInput.value.trim();
    if (!userText) return;
    appendMessage('User', userText, 'user-msg');
    aiInput.value = ''; 
    const loadingId = appendMessage('Subchan AI', 'Memproses arsitektur data...', 'ai-msg chat-loading');
    kelolaMemori({ role: 'user', content: userText });

    const models = ['nvidia/nemotron-3-ultra-550b-a55b:free', 'google/gemma-2-9b-it:free', 'thinkingmachines/inkling-small:free'];
    let success = false;
    let aiReply = "";

    for (let i = 0; i < models.length; i++) {
        let modelName = models[i];
        try {
            if (i > 0) document.getElementById(loadingId).innerHTML = `<em>Server penuh, mengalihkan (${i+1}/3)...</em>`;
            else document.getElementById(loadingId).innerHTML = `<em>Menelusuri rekam jejak...</em>`;

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${API_KEY}`, 'HTTP-Referer': 'https://subchanadimaskuri-web.github.io/', 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: modelName, messages: conversationHistory, temperature: 0.4 })
            });

            if (!response.ok) throw new Error(`Server menolak.`);
            const data = await response.json();
            if (data.choices && data.choices.length > 0) { aiReply = data.choices[0].message.content; success = true; break; }
        } catch (error) { console.warn(`Model ${modelName} gagal...`); }
    }
    document.getElementById(loadingId).remove();
    if (success) {
        let formattedReply = aiReply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
        appendMessage('Subchan AI', formattedReply, 'ai-msg');
        kelolaMemori({ role: 'assistant', content: aiReply });
    } else {
        appendMessage('Subchan AI', 'Maaf, jaringan server AI sibuk. Mohon coba sesaat lagi.', 'ai-msg');
        conversationHistory.pop(); 
    }
}

function appendMessage(sender, text, className) {
    const msgDiv = document.createElement('div');
    const msgId = 'msg-' + Date.now();
    msgDiv.id = msgId; msgDiv.className = `chat-message ${className}`;
    if(sender === 'User') { msgDiv.innerHTML = `${text}`; } else { msgDiv.innerHTML = `<strong>${sender}:</strong><br>${text}`; }
    if (aiChatArea) { aiChatArea.appendChild(msgDiv); setTimeout(() => { aiChatArea.scrollTop = aiChatArea.scrollHeight; }, 100); }
    return msgId;
}
if (sendAiBtn) sendAiBtn.addEventListener('click', sendMessage);
if (aiInput) aiInput.addEventListener('keypress', function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }});

// ==========================================
// 4. POPUP PDF RIWAYAT PEKERJAAN
// ==========================================
document.querySelectorAll('.job-title-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pdfFile = link.getAttribute('data-pdf');
        if (lightbox && lightboxContent && pdfFile) {
            lightboxContent.innerHTML = `<iframe src="${encodeURI(pdfFile)}#toolbar=0" class="pdf-viewer"></iframe>`;
            lightbox.classList.add('active'); 
        }
    });
});

// ==========================================
// 5. MODAL MATRIKS KOMPETENSI (TAB)
// ==========================================
const btnOpenModal = document.getElementById('openCompetencyModal');
const btnCloseModal = document.getElementById('closeCompetencyModal');
const competencyModal = document.getElementById('competencyModal');
const competencyOverlay = document.getElementById('competencyOverlay');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

if (btnOpenModal && competencyModal && competencyOverlay) {
  btnOpenModal.addEventListener('click', () => { competencyModal.classList.add('active'); competencyOverlay.classList.add('active'); document.body.style.overflow = 'hidden'; });
  const closeModal = () => { competencyModal.classList.remove('active'); competencyOverlay.classList.remove('active'); document.body.style.overflow = ''; };
  btnCloseModal.addEventListener('click', closeModal);
  competencyOverlay.addEventListener('click', closeModal);
}
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active')); tabContents.forEach(c => c.classList.remove('active'));
    btn.classList.add('active'); document.getElementById(btn.getAttribute('data-target')).classList.add('active');
  });
});

// ==========================================
// 6. LOGIKA ACCORDION (TAB 3)
// ==========================================
document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', function() {
    const activeHeader = document.querySelector('.accordion-header.active');
    if (activeHeader && activeHeader !== this) {
      activeHeader.classList.remove('active');
      activeHeader.nextElementSibling.style.maxHeight = null;
    }
    this.classList.toggle('active');
    const body = this.nextElementSibling;
    if (this.classList.contains('active')) { body.style.maxHeight = body.scrollHeight + "px"; } 
    else { body.style.maxHeight = null; }
  });
});

// ==========================================
// 7. SISTEM FILTER RUBRIK PORTOFOLIO
// ==========================================
const filterBtns = document.querySelectorAll('.filter-btn');
const filterItems = document.querySelectorAll('.filterable-item');

if (filterBtns.length > 0 && filterItems.length > 0) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filterValue = btn.getAttribute('data-filter');
      
      filterItems.forEach(item => {
        if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
          item.classList.remove('hide-item');
        } else {
          item.classList.add('hide-item');
        }
      });
    });
  });
}
