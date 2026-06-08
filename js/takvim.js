/*
  takvim.js
  Takvim sayfası mantığı.
  - Takvim grid'inde etkinlik olan günlerde emoji/kategori marker'ları
  - Tıklama ile profesyonel detay paneli
  - Yaklaşan etkinliklerde en yakın tarihlisi öne çıkar
*/

let mevcutTarih = new Date();
// Güvenli ay değiştirme için tarihi ayın 1'ine sabitleyelim
mevcutTarih.setDate(1);

document.addEventListener('DOMContentLoaded', () => {
  sayfaKurulumu('takvim.html');
  
  const seciliGunBaslik = document.getElementById('seciliGunBaslik');
  if(seciliGunBaslik) {
    seciliGunBaslik.className = 'secili-gun-baslik bos-gun';
    seciliGunBaslik.innerHTML = `
      <h3>📅 Bir gün seçin</h3>
      <p>Etkinlik olan günlere tıklayarak o günün etkinliklerini görüntüleyin.</p>
    `;
  }
  
  etkinlikleriYukle().then(() => {
    takvimiOlustur();
    yaklasanEtkinlikleriYukle();
    // Otomatik olarak en yakın etkinliğin olduğu günü seç
    enYakinEtkinlikGunuSec();
  }).catch(hata => {
    console.error("Etkinlikler yüklenirken hata oluştu:", hata);
    document.getElementById('takvimGrid').innerHTML = '<div class="hata-mesaji">Etkinlikler yüklenemedi.</div>';
    document.getElementById('yaklasanListe').innerHTML = '<div class="hata-mesaji">Yaklaşan etkinlikler yüklenemedi.</div>';
  });

  const oncekiAyButon = document.getElementById('oncekiAyButon');
  if(oncekiAyButon) {
    oncekiAyButon.addEventListener('click', () => {
      mevcutTarih.setMonth(mevcutTarih.getMonth() - 1);
      takvimiOlustur();
    });
  }

  const sonrakiAyButon = document.getElementById('sonrakiAyButon');
  if(sonrakiAyButon) {
    sonrakiAyButon.addEventListener('click', () => {
      mevcutTarih.setMonth(mevcutTarih.getMonth() + 1);
      takvimiOlustur();
    });
  }

  const bugunButon = document.getElementById('bugunButon');
  if(bugunButon) {
    bugunButon.addEventListener('click', () => {
      mevcutTarih = new Date();
      mevcutTarih.setDate(1);
      takvimiOlustur();
      
      const seciliBaslik = document.getElementById('seciliGunBaslik');
      const seciliListe = document.getElementById('seciliGunListe');
      if (seciliBaslik) {
        seciliBaslik.className = 'secili-gun-baslik bos-gun';
        seciliBaslik.innerHTML = `
          <h3>📅 Bir gün seçin</h3>
          <p>Etkinlik olan günlere tıklayarak o günün etkinliklerini görüntüleyin.</p>
        `;
      }
      if (seciliListe) {
        seciliListe.innerHTML = '';
      }
    });
  }
});

/**
 * Kategorinin CSS marker sınıfını döndürür.
 */
function kategoriMarkerSinifi(kategori) {
  return 'marker-' +
    kategori
      .toLocaleLowerCase('tr-TR')
      .replace(/ö/g, 'o')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/ı/g, 'i')
      .replace(/\s+/g, '-');
}

/**
 * En yakın etkinliğin olduğu günü otomatik olarak seçer.
 */
function enYakinEtkinlikGunuSec() {
  const yil = mevcutTarih.getFullYear();
  const ay = mevcutTarih.getMonth();
  const bugun = new Date();
  bugun.setHours(0,0,0,0);
  
  const ayinEtkinlikleri = tariheGoreEtkinlikler(yil, ay);
  
  // Bugünden sonraki en yakın etkinliği bul
  const gelecekEtkinlikler = ayinEtkinlikleri
    .filter(e => new Date(e.tarih) >= bugun)
    .sort((a, b) => new Date(a.tarih) - new Date(b.tarih));
  
  if (gelecekEtkinlikler.length > 0) {
    const enYakin = gelecekEtkinlikler[0];
    const enYakinTarih = new Date(enYakin.tarih);
    const gun = enYakinTarih.getDate();
    
    // O güne ait tüm etkinlikleri bul
    const gununEtkinlikleri = ayinEtkinlikleri.filter(e => {
      const d = new Date(e.tarih);
      return d.getDate() === gun;
    });
    
    // O günün hücresini bul ve aktif yap
    const tümGunler = document.querySelectorAll('.takvim-gun:not(.gecmis-ay):not(.gelecek-ay)');
    tümGunler.forEach(hucre => {
      const sayiEl = hucre.querySelector('.gun-sayi');
      if (sayiEl && parseInt(sayiEl.textContent) === gun) {
        hucre.classList.add('aktif');
        gununEtkinlikleriniGoster(gun, ay, yil, gununEtkinlikleri);
      }
    });
  }
}

function takvimiOlustur() {
  const yil = mevcutTarih.getFullYear();
  const ay = mevcutTarih.getMonth();
  
  const baslik = document.getElementById('takvimBaslik');
  if(baslik) {
    baslik.textContent = `${AYLAR_TR[ay]} ${yil}`;
  }
  
  const grid = document.getElementById('takvimGrid');
  if(!grid) return;
  grid.innerHTML = '';
  
  const ilkGunDate = new Date(yil, ay, 1);
  const sonGunDate = new Date(yil, ay + 1, 0);
  
  let ilkGunHaftaninGunu = ilkGunDate.getDay() - 1;
  if(ilkGunHaftaninGunu < 0) ilkGunHaftaninGunu = 6;
  
  const gunSayisi = sonGunDate.getDate();
  const oncekiAySonGun = new Date(yil, ay, 0).getDate();
  
  // Önceki ay günleri
  for (let i = 0; i < ilkGunHaftaninGunu; i++) {
    const gunSayisiGosterim = oncekiAySonGun - ilkGunHaftaninGunu + 1 + i;
    const hucre = document.createElement('div');
    hucre.className = 'takvim-gun gecmis-ay';
    hucre.innerHTML = `<span class="gun-sayi">${gunSayisiGosterim}</span>`;
    grid.appendChild(hucre);
  }
  
  const bugunDate = new Date();
  
  const ayinEtkinlikleri = tariheGoreEtkinlikler(yil, ay);
  
  // Bu ayın günleri
  for (let i = 1; i <= gunSayisi; i++) {
    const hucre = document.createElement('div');
    hucre.className = 'takvim-gun';
    
    // Bugün kontrolü
    if (yil === bugunDate.getFullYear() && ay === bugunDate.getMonth() && i === bugunDate.getDate()) {
      hucre.classList.add('bugun');
    }
    
    // JS'de aylar 0 endekslidir
    const gununEtkinlikleri = ayinEtkinlikleri.filter(e => {
        const d = new Date(e.tarih);
        return d.getDate() === i && d.getMonth() === ay && d.getFullYear() === yil;
    });
    
    hucre.innerHTML = `<span class="gun-sayi">${i}</span>`;
    
    if (gununEtkinlikleri.length > 0) {
      hucre.classList.add('etkinlik-var');
      const markerAlani = document.createElement('div');
      markerAlani.className = 'gun-noktalar';
      
      const maxGosterilecek = 2;
      for(let j = 0; j < Math.min(gununEtkinlikleri.length, maxGosterilecek); j++) {
         const etkinlik = gununEtkinlikleri[j];
         const marker = document.createElement('div');
         const sinif = kategoriMarkerSinifi(etkinlik.kategori);
         marker.className = `etkinlik-marker ${sinif}`;
         marker.textContent = kategoriEmoji(etkinlik.kategori);
         marker.title = etkinlik.baslik;
         markerAlani.appendChild(marker);
      }
      
      if(gununEtkinlikleri.length > maxGosterilecek) {
         const extra = document.createElement('span');
         extra.className = 'etkinlik-coklu-marker';
         extra.textContent = `+${gununEtkinlikleri.length - maxGosterilecek}`;
         markerAlani.appendChild(extra);
      }
      hucre.appendChild(markerAlani);
    }
    
    hucre.addEventListener('click', () => {
      document.querySelectorAll('.takvim-gun.aktif').forEach(el => el.classList.remove('aktif'));
      hucre.classList.add('aktif');
      gununEtkinlikleriniGoster(i, ay, yil, gununEtkinlikleri);
    });
    
    grid.appendChild(hucre);
  }
  
  // Gelecek ay günleri (Satırı tamamlamak için)
  const toplamHucre = ilkGunHaftaninGunu + gunSayisi;
  const kalanHucreler = 42 - toplamHucre;
  const ekHucreKadar = (toplamHucre > 35) ? kalanHucreler : (35 - toplamHucre);
  
  for (let i = 1; i <= ekHucreKadar; i++) {
    const hucre = document.createElement('div');
    hucre.className = 'takvim-gun gelecek-ay';
    hucre.innerHTML = `<span class="gun-sayi">${i}</span>`;
    grid.appendChild(hucre);
  }
}

/**
 * Profesyonel etkinlik detay panelini gösterir.
 */
function gununEtkinlikleriniGoster(gun, ay, yil, etkinlikler) {
  const baslikAlan = document.getElementById('seciliGunBaslik');
  const listeAlan = document.getElementById('seciliGunListe');
  
  if(!baslikAlan || !listeAlan) return;
  
  listeAlan.innerHTML = '';
  
  const gunStr = `${gun} ${AYLAR_TR[ay]} ${yil}`;
  const tarihObj = new Date(yil, ay, gun);
  const haftaGunu = GUNLER_TR[tarihObj.getDay()];
  
  if (etkinlikler.length === 0) {
    baslikAlan.className = 'secili-gun-baslik bos-gun';
    baslikAlan.innerHTML = `
      <h3>📅 ${gunStr}, ${haftaGunu}</h3>
      <p>Bu tarihte planlanmış bir etkinlik bulunmuyor.</p>
    `;
    return;
  }
  
  baslikAlan.className = 'secili-gun-baslik';
  baslikAlan.innerHTML = `
    <h3>📅 ${gunStr}, ${haftaGunu}</h3>
    <p>${etkinlikler.length} etkinlik listeleniyor</p>
  `;
  
  etkinlikler.forEach((e, index) => {
    const kart = document.createElement('div');
    kart.className = 'gun-etkinlik-kart';
    kart.style.opacity = '0';
    kart.style.transform = 'translateY(12px)';
    
    // Kategori rengini al
    const kategoriRenk = kategoriRenkGetir(e.kategori);
    
    // Görsel URL
    const gorselUrl = etkinlikGorselUrl(e);
    const gorselYedek = etkinlikGorselYedek(e);
    
    kart.innerHTML = `
      <div class="kart-detay-gorsel">
        <img src="${gorselUrl}" alt="${e.baslik}" loading="lazy" onerror="this.onerror=null;this.src='${gorselYedek}'">
        <span class="kategori-badge-mini" style="background:${kategoriRenk}">${e.kategori}</span>
      </div>
      <div class="gun-etkinlik-icerik">
        <div class="gun-etkinlik-zaman-badge">
          <span>⏰</span> ${e.saat_baslangic} — ${e.saat_bitis}
        </div>
        <h4 class="gun-etkinlik-baslik">${e.baslik}</h4>
        <div class="gun-etkinlik-meta">
          <span>📍 ${e.mekan}</span>
          ${e.konusmaci_sanatci ? `<span>🎤 ${e.konusmaci_sanatci}</span>` : ''}
        </div>
        <p class="gun-etkinlik-aciklama">${e.aciklama_kisa}</p>
        <div class="gun-etkinlik-footer">
          <span class="gun-etkinlik-ucret">${e.ucret}</span>
          <a href="etkinlik-detay.html?id=${e.id}" class="gun-etkinlik-link">Detayları Gör →</a>
        </div>
      </div>
    `;
    listeAlan.appendChild(kart);
    
    // Animasyonlu giriş
    setTimeout(() => {
      kart.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      kart.style.opacity = '1';
      kart.style.transform = 'translateY(0)';
    }, 60 * index);
  });
}

/**
 * Kategoriye göre renk kodu döndürür.
 */
function kategoriRenkGetir(kategori) {
  const renkler = {
    'Konser': '#E63946',
    'Tiyatro': '#8338EC',
    'Konferans': '#1D3557',
    'Seminer': '#2A9D8F',
    'Spor': '#E76F51',
    'Atölye': '#F4A261',
    'Festival': '#E91E63',
    'Söyleşi': '#3F51B5',
    'Sergi': '#795548',
    'Film Gösterimi': '#455A64',
    'Mezuniyet': '#8B1A2B',
  };
  return renkler[kategori] || '#8B1A2B';
}

/**
 * Yaklaşan etkinlikleri profesyonel tasarımla yükler.
 * En yakın tarihlisi öne çıkar (spotlight).
 */
function yaklasanEtkinlikleriYukle() {
  const listeAlan = document.getElementById('yaklasanListe');
  if(!listeAlan) return;
  
  const etkinlikler = yaklasanEtkinlikler(5);
  listeAlan.innerHTML = '';
  
  if (etkinlikler.length === 0) {
    listeAlan.innerHTML = '<p class="orta-gri" style="text-align:center;padding:1rem;">Yakında planlanan etkinlik yok.</p>';
    return;
  }
  
  etkinlikler.forEach((e, index) => {
    const d = new Date(e.tarih);
    const gunStr = d.getDate();
    const ayStr = AYLAR_KISA[d.getMonth()];
    const kategoriRenk = kategoriRenkGetir(e.kategori);
    const gorselUrl = etkinlikGorselUrl(e);
    const gorselYedek = etkinlikGorselYedek(e);
    
    const kart = document.createElement('div');
    kart.className = 'yaklasan-kart solma-animasyonu gorunur';
    
    kart.innerHTML = `
      <a href="etkinlik-detay.html?id=${e.id}" class="yaklasan-link">
        ${index === 0 ? '<div class="yaklasan-spotlight">En Yakın Etkinlik</div>' : ''}
        <div class="yaklasan-icerik">
          <div class="yaklasan-tarih-kutu">
            <span class="gun">${gunStr}</span>
            <span class="ay">${ayStr}</span>
          </div>
          <div class="yaklasan-bilgi">
            <h4 class="yaklasan-baslik">${e.baslik}</h4>
            <p class="yaklasan-mekan">📍 ${e.mekan}</p>
            <span class="yaklasan-kategori-badge" style="background:${kategoriRenk}">${e.kategori}</span>
          </div>
          <img src="${gorselUrl}" alt="${e.baslik}" class="yaklasan-gorsel-mini" loading="lazy" onerror="this.onerror=null;this.src='${gorselYedek}'">
        </div>
      </a>
    `;
    listeAlan.appendChild(kart);
  });
}
