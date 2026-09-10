// ==========================================
// 7. SISTEM FILTER RUBRIK PORTOFOLIO
// ==========================================
const filterButtons = document.querySelectorAll('.filter-btn');
const filterableItems = document.querySelectorAll('.filterable-item');

if (filterButtons.length > 0 && filterableItems.length > 0) {
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // 1. Pindahkan status aktif ke tombol yang diklik
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // 2. Ambil nilai kategori yang dipilih
      const filterValue = btn.getAttribute('data-filter');

      // 3. Tampilkan/Sembunyikan kartu proyek & jurnal secara instan
      filterableItems.forEach(item => {
        if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
          item.classList.remove('hide-item');
        } else {
          item.classList.add('hide-item');
        }
      });
    });
  });
}
