/*
  ana-sayfa.js
  Ana sayfa (index.html) mantığı:
  - Etkinlikleri yükle
  - Öne çıkanları ve istatistikleri göster
  - Kategori filtreleri, arama ve sıralama
  - Grid/Liste görünümü toggle
  - "Daha Fazla Göster" ile sayfalama
*/

// Durum yönetimi
const durum = {
  seciliKategoriler: [],
  aramaMetni: '',
  siralamaTuru: 'tarih-yakin',
  gorunum: 'grid', // 'grid' veya 'liste'
  gosterilenSayi: 9,
  adimSayisi: 9,
};

document.addEventListener('DOMContentLoaded', async () => {
  sayfaKurulumu('index.html');

  try {
    await etkinlikleriYukle();
    istatistikleriGoster();
    oneCikanlariGoster();
    kategoriFiltreleriniOlustur();
    etkinlikleriGuncelle();
    etkilesimleriBagla();
  } catch (hata) {
    console.error('Ana sayfa yükleme hatası:', hata);
    const liste = document.getElementById('etkinlikListesi');
    if (liste) {
      liste.innerHTML = '<div class="bulunamadi"><div class="emoji-buyuk">⚠️</div><h3>Etkinlikler yüklenemedi</h3><p>Lütfen sayfayı yenileyin veya JSON dosyasının doğru konumda olduğundan emin olun.</p></div>';
    }
  }
});

// ---------- İstatistikler ----------
function istatistikleriGoster() {
  const tumu = tumEtkinlikleriGetir();
  document.getElementById('statEtkinlik').textContent = tumu.length;

  const bugun = new Date();
  const buAySayi = tumu.filter((e) => {
    const t = new Date(e.tarih);
    return t.getMonth() === bugun.getMonth() && t.getFullYear() === bugun.getFullYear();
  }).length;
  document.getElementById('statBuAy').textContent = buAySayi;

  const mekanlar = new Set(tumu.map((e) => e.mekan));
  document.getElementById('statMekan').textContent = mekanlar.size;
}

// ---------- Öne Çıkanlar ----------
function oneCikanlariGoster() {
  const alan = document.getElementById('oneCikanAlan');
  const one = oneCikanEtkinlikler().slice(0, 3);
  if (one.length === 0) {
    alan.innerHTML = '<p class="yukleniyor">Öne çıkan etkinlik bulunamadı.</p>';
    return;
  }
  alan.innerHTML = one.map((e) => etkinlikKartiHtml(e)).join('');
  kartlariGozlemle();
}

// ---------- Kategori Filtreleri ----------
function kategoriFiltreleriniOlustur() {
  const alan = document.getElementById('kategoriFiltreleri');
  const kategoriler = kategorileriGetir();

  const tumuButonu = `<button class="kategori-buton aktif" data-kategori="__tumu__">🎯 Tümü</button>`;
  const digerler = kategoriler
    .map((k) => `<button class="kategori-buton" data-kategori="${k}">${kategoriEmoji(k)} ${k}</button>`)
    .join('');

  alan.innerHTML = tumuButonu + digerler;

  alan.querySelectorAll('.kategori-buton').forEach((btn) => {
    btn.addEventListener('click', () => kategoriTiklandi(btn));
  });
}

function kategoriTiklandi(buton) {
  const kategori = buton.dataset.kategori;
  const alan = document.getElementById('kategoriFiltreleri');

  if (kategori === '__tumu__') {
    durum.seciliKategoriler = [];
    alan.querySelectorAll('.kategori-buton').forEach((b) => b.classList.remove('aktif'));
    buton.classList.add('aktif');
  } else {
    // "Tümü" butonunu kapat
    const tumuBtn = alan.querySelector('[data-kategori="__tumu__"]');
    if (tumuBtn) tumuBtn.classList.remove('aktif');

    // Çoklu seçim toggle
    if (durum.seciliKategoriler.includes(kategori)) {
      durum.seciliKategoriler = durum.seciliKategoriler.filter((k) => k !== kategori);
      buton.classList.remove('aktif');
    } else {
      durum.seciliKategoriler.push(kategori);
      buton.classList.add('aktif');
    }

    // Hiçbiri seçili değilse "Tümü"yü aktif et
    if (durum.seciliKategoriler.length === 0 && tumuBtn) {
      tumuBtn.classList.add('aktif');
    }
  }

  durum.gosterilenSayi = durum.adimSayisi;
  etkinlikleriGuncelle();
}

// ---------- Etkileşimler ----------
function etkilesimleriBagla() {
  // Sıralama
  document.getElementById('siralamaSecimi').addEventListener('change', (e) => {
    durum.siralamaTuru = e.target.value;
    etkinlikleriGuncelle();
  });

  // Görünüm
  document.getElementById('gridButon').addEventListener('click', () => gorunumDegistir('grid'));
  document.getElementById('listeButon').addEventListener('click', () => gorunumDegistir('liste'));

  // Daha Fazla
  document.getElementById('dahaFazlaButon').addEventListener('click', () => {
    durum.gosterilenSayi += durum.adimSayisi;
    etkinlikleriGuncelle();
  });
}

function gorunumDegistir(yeniGorunum) {
  durum.gorunum = yeniGorunum;
  document.getElementById('gridButon').classList.toggle('aktif', yeniGorunum === 'grid');
  document.getElementById('listeButon').classList.toggle('aktif', yeniGorunum === 'liste');
  const liste = document.getElementById('etkinlikListesi');
  liste.classList.toggle('liste-gorunum', yeniGorunum === 'liste');
}

// ---------- Filtrele + Sırala + Listele ----------
function etkinlikleriGuncelle() {
  let sonuclar = etkinlikFiltrele({
    kategoriler: durum.seciliKategoriler,
    aramaMetni: durum.aramaMetni,
  });

  sonuclar = etkinlikleriSirala(sonuclar, durum.siralamaTuru);

  const toplam = sonuclar.length;
  const liste = document.getElementById('etkinlikListesi');
  const dahaFazlaAlani = document.querySelector('.daha-fazla-alan');
  const sonucSayisi = document.getElementById('sonucSayisi');

  sonucSayisi.textContent = toplam > 0 ? `${toplam} etkinlik bulundu` : '';

  if (toplam === 0) {
    liste.classList.remove('liste-gorunum');
    liste.innerHTML = `
      <div class="bulunamadi" style="grid-column: 1 / -1;">
        <div class="emoji-buyuk">🔍</div>
        <h3>Aramanızla eşleşen etkinlik bulunamadı</h3>
        <p>Farklı bir arama terimi deneyin veya filtreleri temizleyin.</p>
        <button class="buton buton-ana" id="filtreleriTemizle">Filtreleri Temizle</button>
      </div>
    `;
    document.getElementById('filtreleriTemizle').addEventListener('click', filtreleriTemizle);
    dahaFazlaAlani.classList.add('gizle');
    aktifFiltreleriGoster();
    return;
  }

  const gosterilenler = sonuclar.slice(0, durum.gosterilenSayi);
  liste.classList.toggle('liste-gorunum', durum.gorunum === 'liste');
  liste.innerHTML = gosterilenler.map((e) => etkinlikKartiHtml(e)).join('');
  kartlariGozlemle();

  dahaFazlaAlani.classList.toggle('gizle', durum.gosterilenSayi >= toplam);
  aktifFiltreleriGoster();
}

function aktifFiltreleriGoster() {
  const alan = document.getElementById('aktifFiltreler');
  const etiketler = [];

  durum.seciliKategoriler.forEach((k) => {
    etiketler.push(`<span class="filtre-etiket">${k} <button data-kaldir-kategori="${k}" aria-label="${k} filtresini kaldır">×</button></span>`);
  });

  alan.innerHTML = etiketler.join('');

  alan.querySelectorAll('[data-kaldir-kategori]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const k = btn.dataset.kaldirKategori;
      durum.seciliKategoriler = durum.seciliKategoriler.filter((x) => x !== k);
      // İlgili butonu kapat
      const kategoriBtn = document.querySelector(`.kategori-buton[data-kategori="${k}"]`);
      if (kategoriBtn) kategoriBtn.classList.remove('aktif');
      if (durum.seciliKategoriler.length === 0) {
        const tumuBtn = document.querySelector('.kategori-buton[data-kategori="__tumu__"]');
        if (tumuBtn) tumuBtn.classList.add('aktif');
      }
      etkinlikleriGuncelle();
    });
  });
}

function filtreleriTemizle() {
  durum.seciliKategoriler = [];
  durum.aramaMetni = '';
  durum.gosterilenSayi = durum.adimSayisi;

  document.querySelectorAll('.kategori-buton').forEach((b) => b.classList.remove('aktif'));
  const tumuBtn = document.querySelector('.kategori-buton[data-kategori="__tumu__"]');
  if (tumuBtn) tumuBtn.classList.add('aktif');

  etkinlikleriGuncelle();
}
