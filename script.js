const API_URL = "https://script.google.com/macros/s/AKfycbxsvh5he87Ok5vx1clkxnFSwnCfzJIKDZ6XmnSGZWLMfo29j7ffHJqjS5nGi5tnfqQ/exec";

async function fetchDriveData() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    console.log("Data Google Drive Terhubung:", data);
    return data;
  } catch (error) {
    console.error("Gagal memuat data dari Google Drive:", error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const data = await fetchDriveData();
  
  // Indikator Koneksi Berhasil
  const statusEls = document.querySelectorAll('.drive-status');
  statusEls.forEach(el => {
    el.innerHTML = `<p style="font-family: sans-serif; font-size: 13px; color: #16a34a;">✅ Terhubung ke Google Drive! Siap menampilkan file.</p>`;
  });
});
