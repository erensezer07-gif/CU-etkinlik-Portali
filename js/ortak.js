/*
  ortak.js
  Tüm sayfalarda çalışan ortak işlevler:
  - Header ve footer dinamik olarak HTML'e eklenir
  - Aktif sayfa menüde vurgulanır
  - Mobilde hamburger menü
  - Sayfa kaydırıldığında header'a gölge
  - "Yukarı dön" butonu
  - Etkinlik kartı HTML üretici (tüm sayfalarda kullanılır)
*/

// ---------- Kategori Yardımcıları ----------

/**
 * Kategori ismini CSS sınıfına çevirir.
 * "Film Gösterimi" → "film-gosterimi"
 */
function kategoriCssSinifi(kategori) {
  return (
    'kategori-' +
    kategori
      .toLocaleLowerCase('tr-TR')
      .replace(/ö/g, 'o')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/ı/g, 'i')
      .replace(/\s+/g, '-')
  );
}

/**
 * Kategoriye göre emoji döndürür.
 */
function kategoriEmoji(kategori) {
  const haritalar = {
    Konser: '🎵',
    Tiyatro: '🎭',
    Konferans: '🎤',
    Seminer: '📚',
    Spor: '⚽',
    Atölye: '🔧',
    Festival: '🎉',
    Söyleşi: '💬',
    Sergi: '🖼️',
    'Film Gösterimi': '🎬',
    Mezuniyet: '🎓',
  };
  return haritalar[kategori] || '📅';
}

/**
 * Kategoriye göre Unsplash görsel URL'i döndürür.
 * Her etkinlik kendi ID'siyle benzersiz ama tutarlı bir görsel alır.
 */
function kategoriGorselUrl(kategori, id) {
  return `https://images.unsplash.com/photo-${kategoriGorselSeedleri(kategori, id)}?w=800&h=450&fit=crop&q=80`;
}

/**
 * Her kategori için sabit, güzel Unsplash fotoğraf ID'leri.
 */
function kategoriGorselSeedleri(kategori, etkinlikId) {
  const gorselHavuzu = {
    'Konser': [
      '1470229722913-7c0e2dbbafd3',  // concert crowd
      '1501386761578-0a55d938ea84',  // live concert
      '1514525253161-7a46d19cd819',  // stage lights
    ],
    'Tiyatro': [
      '1503095396549-807759245b35',  // theater stage
      '1507003211169-0a1dd7228f2d',  // theater seats
      '1547153760-18fc86324498',     // drama performance
    ],
    'Konferans': [
      '1540575467063-178a50c2df87',  // conference
      '1475721027785-f74eccf877e2',  // speaker podium
      '1591115765373-5207764f72e7',  // tech conference
    ],
    'Seminer': [
      '1524178232363-1fb2b075b655',  // classroom seminar
      '1552664730-d307ca884978',     // workshop setting
      '1558618666-fcd25c85f82e',     // career workshop
    ],
    'Spor': [
      '1461896836934-ffe607ba8211',  // sports field
      '1574629810360-7efbbe195018',  // football match
      '1526232761682-d26e03ac148e',  // basketball
    ],
    'Atölye': [
      '1581783898377-1c85bf937427',  // maker workshop
      '1518770660439-4636190af475',  // hands-on work
      '1504384308090-c894fdcc538d',  // creative lab
    ],
    'Festival': [
      '1533174072545-7a4b6ad7a6c3',  // outdoor festival
      '1506157786151-b8491531f063',  // festival crowd
      '1492684223066-81342ee5ff30',  // celebration
    ],
    'Söyleşi': [
      '1481627834876-b7833e8f5570',  // library discussion
      '1507003211169-0a1dd7228f2d',  // conversation
      '1529070538774-1acc8f667e6e',  // book talk
    ],
    'Sergi': [
      '1531243269054-5ebf6f34081e',  // art gallery
      '1544967082-d9d25d867d66',     // exhibition
      '1518998053901-5348d3961a04',  // museum
    ],
    'Film Gösterimi': [
      '1489599849927-2ee91cede3ba',  // cinema
      '1536440136628-849c177e76a1',  // movie theater
      '1478720568477-152d9b164e26',  // film screen
    ],
    'Mezuniyet': [
      '1523050854058-8df90110c9f1',  // graduation
      '1627556704302-624286467c65',  // graduation caps
      '1541339907198-e08756dedf3f',  // university ceremony
    ],
  };
  const havuz = gorselHavuzu[kategori] || gorselHavuzu['Konser'];
  const index = (etkinlikId - 1) % havuz.length;
  return havuz[index];
}

/**
 * Bir etkinlik için öncelikli görsel URL'i döndürür.
 * Kategoriye göre gerçekçi görsel döndürür.
 */
function etkinlikGorselUrl(etkinlik) {
  if (etkinlik.gorsel) return etkinlik.gorsel;
  return `https://images.unsplash.com/photo-${kategoriGorselSeedleri(etkinlik.kategori, etkinlik.id)}?w=800&h=450&fit=crop&q=80`;
}

/**
 * Yerel görsel yoksa devreye girecek uzak yedek görsel URL'i.
 */
function etkinlikGorselYedek(etkinlik) {
  return `https://picsum.photos/seed/scu-etkinlik-${etkinlik.id}/800/450`;
}

// ---------- Tarih Yardımcıları ----------

const AYLAR_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const AYLAR_KISA = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

const GUNLER_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

function tariheFormatla(tarihMetin) {
  const d = new Date(tarihMetin);
  const gun = d.getDate();
  const ay = AYLAR_TR[d.getMonth()];
  const yil = d.getFullYear();
  const haftaGun = GUNLER_TR[d.getDay()];
  return `${gun} ${ay} ${yil}, ${haftaGun}`;
}

function tariheKisaFormatla(tarihMetin) {
  const d = new Date(tarihMetin);
  return { gun: d.getDate(), ay: AYLAR_KISA[d.getMonth()] };
}

/**
 * Etkinliğin durumunu döndürür: 'gecmis', 'bugun', 'gelecek'
 */
function etkinlikDurumu(tarihMetin) {
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  const etkinlikTarihi = new Date(tarihMetin);
  etkinlikTarihi.setHours(0, 0, 0, 0);
  if (etkinlikTarihi.getTime() === bugun.getTime()) return 'bugun';
  if (etkinlikTarihi < bugun) return 'gecmis';
  return 'gelecek';
}

// ---------- Doluluk ----------

function dolulukYuzdesi(dolu, toplam) {
  if (!toplam || toplam === 0) return 0;
  return Math.min(100, Math.round((dolu / toplam) * 100));
}

function dolulukRenkSinifi(yuzde) {
  if (yuzde >= 80) return 'yuksek';
  if (yuzde >= 50) return 'orta';
  return 'dusuk';
}

// ---------- Etkinlik Kartı HTML Üreticisi ----------

/**
 * Bir etkinlik için tam kart HTML'i döndürür.
 */
function etkinlikKartiHtml(etkinlik) {
  const tarihKisa = tariheKisaFormatla(etkinlik.tarih);
  const kategoriSinifi = kategoriCssSinifi(etkinlik.kategori);
  const gorselUrl = etkinlikGorselUrl(etkinlik);
  const gorselYedek = etkinlikGorselYedek(etkinlik);
  const durum = etkinlikDurumu(etkinlik.tarih);
  const yuzde = dolulukYuzdesi(etkinlik.kontenjan_dolu, etkinlik.kontenjan_toplam);
  const dolulukSinifi = dolulukRenkSinifi(yuzde);

  let durumBadgeHtml = '';
  if (durum === 'gecmis') {
    durumBadgeHtml = '<span class="badge badge-tamamlandi">Tamamlandı</span>';
  } else if (durum === 'bugun') {
    durumBadgeHtml = '<span class="badge badge-bugun">Bugün!</span>';
  }

  const dolulukSatirHtml = `
    <div class="doluluk-sari">
      <span>👥</span>
      <span class="doluluk-metin">${etkinlik.kontenjan_dolu}/${etkinlik.kontenjan_toplam}</span>
      <div class="doluluk-cubugu">
        <div class="doluluk-dolgu ${dolulukSinifi}" style="width:${yuzde}%"></div>
      </div>
    </div>`;

  return `
    <article class="etkinlik-karti reveal-kart">
      <div class="kart-gorsel ${kategoriSinifi}" style="background: ${etkinlik.gorsel_gradient};">
        <img src="${gorselUrl}" alt="${etkinlik.baslik}" class="kart-resim" loading="lazy" onerror="this.onerror=null;this.src='${gorselYedek}'">
        <div class="kart-ust-sol">
          <span class="badge badge-kategori">${etkinlik.kategori}</span>
        </div>
        <div class="kart-ust-sag">
          <div class="badge badge-tarih">
            <span class="gun">${tarihKisa.gun}</span>
            <span class="ay">${tarihKisa.ay}</span>
          </div>
        </div>
      </div>
      <div class="kart-icerik">
        <h3>${etkinlik.baslik}</h3>
        <div class="kart-bilgi-satir"><span class="ikon-emoji">📅</span> ${tariheFormatla(etkinlik.tarih)}</div>
        <div class="kart-bilgi-satir"><span class="ikon-emoji">⏰</span> ${etkinlik.saat_baslangic} - ${etkinlik.saat_bitis}</div>
        <div class="kart-bilgi-satir"><span class="ikon-emoji">📍</span> ${etkinlik.mekan}</div>
        ${dolulukSatirHtml}
        <p class="kart-aciklama">${etkinlik.aciklama_kisa}</p>
        <div class="kart-alt">
          ${durumBadgeHtml || '<span></span>'}
          <a href="etkinlik-detay.html?id=${etkinlik.id}" class="kart-detay-link">Detayları Gör →</a>
        </div>
      </div>
    </article>
  `;
}

// ---------- Header / Footer HTML ----------

function headerHtml(aktifSayfa) {
  const linkler = [
    { yol: 'index.html', ad: 'Ana Sayfa' },
    { yol: 'takvim.html', ad: 'Takvim' },
    { yol: 'hakkimizda.html', ad: 'Hakkımızda' },
  ];

  const navLinkleri = linkler
    .map((l) => `<li><a href="${l.yol}" class="${l.yol === aktifSayfa ? 'aktif' : ''}">${l.ad}</a></li>`)
    .join('');

  return `
    <header class="ana-header" id="anaHeader">
      <div class="header-icerik">
        <a href="index.html" class="logo-alan" aria-label="Anasayfa">
          <img src="gorseller/logo/cumhuriyet-logo.png" alt="Sivas Cumhuriyet Üniversitesi" class="logo-img" />
          <span class="logo-yazi">
            <span class="logo-baslik">Sivas Cumhuriyet Üniversitesi</span>
            <span class="logo-alt-baslik">Etkinlik Portalı</span>
          </span>
        </a>
        <button class="hamburger-buton" id="hamburgerButon" aria-label="Menüyü aç/kapa" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
        <nav class="ana-navigasyon" id="anaNavigasyon">
          <ul class="nav-liste">${navLinkleri}</ul>
        </nav>
      </div>
    </header>
  `;
}

function footerHtml() {
  return `
    <footer class="ana-footer">
      <div class="footer-icerik">
        <div class="footer-sutun">
          <div class="footer-logo-alan">
            <img src="gorseller/logo/cumhuriyet-logo.png" alt="Sivas Cumhuriyet Üniversitesi" class="logo-img logo-img-footer" />
            <span class="logo-yazi">
              <span class="logo-baslik">Sivas Cumhuriyet Üniversitesi</span>
              <span class="logo-alt-baslik">Etkinlik Portalı</span>
            </span>
          </div>
          <p>Kampüsümüzde düzenlenen tüm etkinlikleri keşfedin, filtreleyin ve takvim üzerinde görüntüleyin. "Gelenekten Geleceğe" sloganıyla ilerleyen üniversitemizin sosyal ve kültürel hayatı burada.</p>
          <div class="sosyal-ikonlar">
            <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg></a>
            <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2zm0 5.6a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4zm5.4-.2a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/></svg></a>
            <a href="#" aria-label="Twitter"><svg viewBox="0 0 24 24"><path d="M22 5.8c-.7.3-1.5.5-2.4.6.9-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1-1.5-1.6-4-1.7-5.7-.2-1 1-1.5 2.4-1.2 3.8-3.3-.2-6.2-1.7-8.2-4.3-1.1 1.9-.5 4.3 1.3 5.5-.6 0-1.2-.2-1.8-.4 0 2 1.4 3.7 3.3 4.1-.6.2-1.2.2-1.8.1.5 1.6 2 2.8 3.8 2.8-1.4 1.1-3.2 1.7-5 1.7-.3 0-.6 0-.9-.1 2 1.2 4.2 1.9 6.5 1.9 7.8 0 12-6.5 12-12.2v-.5c.8-.6 1.5-1.3 2-2.2z"/></svg></a>
            <a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24"><path d="M21.6 7.2s-.2-1.4-.8-2c-.7-.8-1.6-.8-2-.9C15.9 4 12 4 12 4s-3.9 0-6.8.3c-.4.1-1.3.1-2 .9-.6.6-.8 2-.8 2S2 8.8 2 10.5v1.6c0 1.7.2 3.3.2 3.3s.2 1.4.8 2c.7.8 1.7.8 2.1.9 1.5.1 6.4.3 6.4.3s3.9 0 6.8-.3c.4-.1 1.3-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.3v-1.6c0-1.7-.2-3.3-.2-3.3zM9.9 14V8.5l5.1 2.8-5.1 2.7z"/></svg></a>
          </div>
        </div>
        <div class="footer-sutun">
          <h4>Hızlı Bağlantılar</h4>
          <ul>
            <li><a href="index.html">Ana Sayfa</a></li>
            <li><a href="takvim.html">Takvim</a></li>
            <li><a href="hakkimizda.html">Hakkımızda</a></li>
            <li><a href="https://www.cumhuriyet.edu.tr" target="_blank" rel="noopener">Cumhuriyet Üniversitesi Resmi Site</a></li>
          </ul>
        </div>
        <div class="footer-sutun">
          <h4>İletişim</h4>
          <div class="footer-iletisim-satir">
            <span>📍</span>
            <span>Sivas Cumhuriyet Üniversitesi 58140 Kampüs/Sivas</span>
          </div>
          <div class="footer-iletisim-satir">
            <span>📞</span>
            <span>0346 487 19 00</span>
          </div>
          <div class="footer-iletisim-satir">
            <span>✉️</span>
            <span>sks@cumhuriyet.edu.tr</span>
          </div>
        </div>
      </div>
      <div class="footer-alt">
        © 2026 Sivas Cumhuriyet Üniversitesi Etkinlik Portalı — Üniversite dersi projesidir.
      </div>
    </footer>
  `;
}

// ---------- Ortak Sayfa Kurulumu ----------

function sayfaKurulumu(aktifSayfa) {
  // Header'ı sayfanın başına ekle
  const headerYuvasi = document.getElementById('headerYuvasi');
  if (headerYuvasi) {
    headerYuvasi.innerHTML = headerHtml(aktifSayfa);
  }

  // Footer'ı sayfanın sonuna ekle
  const footerYuvasi = document.getElementById('footerYuvasi');
  if (footerYuvasi) {
    footerYuvasi.innerHTML = footerHtml();
  }

  // Hamburger menü davranışı
  const hamburger = document.getElementById('hamburgerButon');
  const navigasyon = document.getElementById('anaNavigasyon');
  if (hamburger && navigasyon) {
    hamburger.addEventListener('click', () => {
      const acik = navigasyon.classList.toggle('acik');
      hamburger.classList.toggle('aktif', acik);
      hamburger.setAttribute('aria-expanded', acik ? 'true' : 'false');
    });
  }

  // Header scroll gölgesi
  const header = document.getElementById('anaHeader');
  if (header) {
    const scrollDinleyici = () => {
      header.classList.toggle('golgeli', window.scrollY > 10);
    };
    window.addEventListener('scroll', scrollDinleyici, { passive: true });
    scrollDinleyici();
  }

  // Yukarı dön butonu
  yukariDonButonuKur();
}

function yukariDonButonuKur() {
  const buton = document.createElement('button');
  buton.className = 'yukari-don';
  buton.setAttribute('aria-label', 'Sayfa başına dön');
  buton.innerHTML = '↑';
  document.body.appendChild(buton);

  window.addEventListener('scroll', () => {
    buton.classList.toggle('gorunur', window.scrollY > 400);
  }, { passive: true });

  buton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/**
 * .reveal-kart sınıflı (henüz .gorunur almamış) tüm kartları görünüm
 * alanına girdiklerinde yumuşakça gösterir. Birden çok kez çağrılabilir;
 * önceden gözlenen kartlar unobserve edildiği için yeniden render edilen
 * listelerde de güvenle çalışır.
 */
function kartlariGozlemle(secici = '.reveal-kart:not(.gorunur)') {
  const kartlar = document.querySelectorAll(secici);
  if (kartlar.length === 0) return;

  const gozlemci = new IntersectionObserver((girisler) => {
    girisler.forEach((giris) => {
      if (giris.isIntersecting) {
        giris.target.classList.add('gorunur');
        gozlemci.unobserve(giris.target);
      }
    });
  }, { threshold: 0.15 });

  kartlar.forEach((k) => gozlemci.observe(k));
}

/**
 * Input debounce yardımcısı.
 */
function debounce(fn, gecikme = 300) {
  let zamanlayici;
  return function (...argumanlar) {
    clearTimeout(zamanlayici);
    zamanlayici = setTimeout(() => fn.apply(this, argumanlar), gecikme);
  };
}
