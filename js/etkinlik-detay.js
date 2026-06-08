/*
  etkinlik-detay.js
  Detay sayfası mantığı:
  - URL'den ?id= parametresini oku
  - İlgili etkinliği bul ve sayfada göster
  - Benzer etkinlikleri listele
  - Katılım formu modalını aç/kapat
*/

document.addEventListener('DOMContentLoaded', async () => {
  sayfaKurulumu('');

  try {
    await etkinlikleriYukle();
    const parametreler = new URLSearchParams(window.location.search);
    const id = parametreler.get('id');

    if (!id) {
      etkinlikBulunamadiGoster();
      return;
    }

    const etkinlik = etkinlikGetirById(id);
    if (!etkinlik) {
      etkinlikBulunamadiGoster();
      return;
    }

    detayiCiz(etkinlik);
    modalKurulumu(etkinlik);
  } catch (hata) {
    console.error('Detay yükleme hatası:', hata);
    etkinlikBulunamadiGoster();
  }
});

function etkinlikBulunamadiGoster() {
  document.getElementById('detayAlan').innerHTML = `
    <div class="kapsayici">
      <div class="bulunamadi">
        <div class="emoji-buyuk">🤔</div>
        <h3>Etkinlik bulunamadı</h3>
        <p>Aradığınız etkinlik sistemimizde yer almıyor olabilir.</p>
        <a href="index.html" class="buton buton-ana">Ana Sayfaya Dön</a>
      </div>
    </div>
  `;
}

function detayiCiz(etkinlik) {
  const gorselUrl = etkinlikGorselUrl(etkinlik);
  const gorselYedek = etkinlikGorselYedek(etkinlik);
  const durum = etkinlikDurumu(etkinlik.tarih);
  const yuzde = dolulukYuzdesi(etkinlik.kontenjan_dolu, etkinlik.kontenjan_toplam);
  const dolulukSinifi = dolulukRenkSinifi(yuzde);

  const programHtml = (etkinlik.program || [])
    .map((p) => `
      <div class="program-satir">
        <span class="program-saat">${p.saat}</span>
        <span class="program-baslik">${p.baslik}</span>
      </div>
    `)
    .join('');

  const etiketlerHtml = (etkinlik.etiketler || [])
    .map((e) => `<span class="etiket">#${e}</span>`)
    .join('');

  const konusmaciBolumu = etkinlik.konusmaci_sanatci
    ? `
      <section class="detay-bolum">
        <h2>Konuşmacı / Sanatçı</h2>
        <p>${etkinlik.konusmaci_sanatci}</p>
      </section>
    `
    : '';

  let durumUyari = '';
  if (durum === 'gecmis') {
    durumUyari = '<span class="badge badge-tamamlandi" style="margin-left:.5rem;">Tamamlandı</span>';
  } else if (durum === 'bugun') {
    durumUyari = '<span class="badge badge-bugun" style="margin-left:.5rem;">Bugün!</span>';
  }

  document.getElementById('detayAlan').innerHTML = `
    <section class="detay-hero" style="background: ${etkinlik.gorsel_gradient};">
      <img src="${gorselUrl}" alt="${etkinlik.baslik}" class="detay-hero-resim" onerror="this.onerror=null;this.src='${gorselYedek}'" />
      <div class="detay-hero-icerik kapsayici">
        <nav class="breadcrumb" aria-label="breadcrumb">
          <ol>
            <li><a href="index.html">Ana Sayfa</a></li>
            <li><a href="index.html">Etkinlikler</a></li>
            <li>${etkinlik.baslik}</li>
          </ol>
        </nav>
        <span class="hero-kategori-badge">${etkinlik.kategori}</span>
        <h1>${etkinlik.baslik} ${durumUyari}</h1>
        <div class="hero-tarih">
          <span>📅 ${tariheFormatla(etkinlik.tarih)}</span>
          <span>⏰ ${etkinlik.saat_baslangic} - ${etkinlik.saat_bitis}</span>
        </div>
      </div>
    </section>

    <section class="kapsayici">
      <div class="detay-ana">
        <!-- Sol Sütun -->
        <div class="detay-bolumler">
          <section class="detay-bolum">
            <h2>Etkinlik Hakkında</h2>
            <div class="detay-aciklama">
              ${(etkinlik.aciklama_uzun || '').split(/\n\n+/).map((p) => `<p>${p.trim()}</p>`).join('')}
            </div>
          </section>

          ${etkinlik.program && etkinlik.program.length > 0 ? `
            <section class="detay-bolum">
              <h2>Program</h2>
              <div class="program-liste">${programHtml}</div>
            </section>
          ` : ''}

          ${konusmaciBolumu}

          ${etiketlerHtml ? `
            <section class="detay-bolum">
              <h2>Etiketler</h2>
              <div class="etiketler">${etiketlerHtml}</div>
            </section>
          ` : ''}
        </div>

        <!-- Sağ Sütun — Bilgi Kartı -->
        <aside class="bilgi-karti">
          <div class="bilgi-satir">
            <span class="bilgi-ikon">📅</span>
            <div>
              <span class="bilgi-baslik">Tarih</span>
              <span class="bilgi-deger">${tariheFormatla(etkinlik.tarih)}</span>
            </div>
          </div>
          <div class="bilgi-satir">
            <span class="bilgi-ikon">⏰</span>
            <div>
              <span class="bilgi-baslik">Saat</span>
              <span class="bilgi-deger">${etkinlik.saat_baslangic} - ${etkinlik.saat_bitis}</span>
            </div>
          </div>
          <div class="bilgi-satir">
            <span class="bilgi-ikon">📍</span>
            <div>
              <span class="bilgi-baslik">Mekan</span>
              <span class="bilgi-deger">${etkinlik.mekan}</span>
            </div>
          </div>
          <div class="bilgi-satir">
            <span class="bilgi-ikon">🏛️</span>
            <div>
              <span class="bilgi-baslik">Kampüs</span>
              <span class="bilgi-deger">${etkinlik.kampus}</span>
            </div>
          </div>
          <div class="bilgi-satir">
            <span class="bilgi-ikon">👥</span>
            <div style="flex:1;">
              <span class="bilgi-baslik">Kontenjan</span>
              <span class="bilgi-deger">${etkinlik.kontenjan_dolu} / ${etkinlik.kontenjan_toplam}</span>
              <div class="doluluk-cubugu" style="margin-top:.4rem;">
                <div class="doluluk-dolgu ${dolulukSinifi}" style="width:${yuzde}%"></div>
              </div>
            </div>
          </div>
          <div class="bilgi-satir">
            <span class="bilgi-ikon">💰</span>
            <div>
              <span class="bilgi-baslik">Ücret</span>
              <span class="bilgi-deger">${etkinlik.ucret}</span>
            </div>
          </div>
          <div class="bilgi-satir">
            <span class="bilgi-ikon">🏷️</span>
            <div>
              <span class="bilgi-baslik">Kategori</span>
              <span class="bilgi-deger">${etkinlik.kategori}</span>
            </div>
          </div>
          <div class="bilgi-satir">
            <span class="bilgi-ikon">📞</span>
            <div>
              <span class="bilgi-baslik">İletişim</span>
              <span class="bilgi-deger">${etkinlik.iletisim_telefon}<br><small>${etkinlik.iletisim_email}</small></span>
            </div>
          </div>
          <div class="bilgi-satir">
            <span class="bilgi-ikon">🗂️</span>
            <div>
              <span class="bilgi-baslik">Düzenleyen</span>
              <span class="bilgi-deger">${etkinlik.duzenleyen}</span>
            </div>
          </div>
          <button class="buton buton-ana buton-buyuk" id="katilimAcButon">📝 Katılım Formu</button>
        </aside>
      </div>
    </section>

    <section class="benzer-bolum">
      <div class="kapsayici">
        <h2 class="bolum-baslik">Benzer Etkinlikler</h2>
        <div class="benzer-liste" id="benzerListe"></div>
      </div>
    </section>
  `;

  // Benzer etkinlikleri doldur
  const benzerler = benzerEtkinlikler(etkinlik, 3);
  const benzerAlan = document.getElementById('benzerListe');
  if (benzerler.length === 0) {
    benzerAlan.innerHTML = '<p class="yukleniyor">Bu kategoride başka etkinlik yok.</p>';
  } else {
    benzerAlan.innerHTML = benzerler.map((b) => etkinlikKartiHtml(b)).join('');
    kartlariGozlemle();
  }

  // Sayfa başlığını güncelle
  document.title = `${etkinlik.baslik} — SCÜ Etkinlik Portalı`;
}

function modalKurulumu(etkinlik) {
  const modal = document.getElementById('katilimModal');
  const acButon = document.getElementById('katilimAcButon');
  const kapatButon = document.getElementById('modalKapatButon');

  if (!modal || !acButon) return;

  const modalAc = () => {
    modal.classList.add('aktif');
    document.body.style.overflow = 'hidden';
    const ilkInput = modal.querySelector('input, select, textarea');
    if (ilkInput) ilkInput.focus();
  };

  const modalKapat = () => {
    modal.classList.remove('aktif');
    document.body.style.overflow = '';
  };

  acButon.addEventListener('click', modalAc);
  kapatButon.addEventListener('click', modalKapat);

  // Dış alana tıklama
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modalKapat();
  });

  // ESC tuşu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('aktif')) {
      modalKapat();
    }
  });

  // Formu kur (katilim-formu.js'teki fonksiyonu çağırır)
  if (typeof katilimFormuKur === 'function') {
    katilimFormuKur(etkinlik, modalKapat);
  }
}
