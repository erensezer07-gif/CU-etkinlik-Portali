/*
  etkinlik-verileri.js
  Etkinlik JSON verisini yükleyen ve tüm sayfalara servis eden modül.
  Fetch ile veri/etkinlikler.json dosyasını okur, belleğe alır ve
  kategori bazlı filtreleme, arama, sıralama gibi yardımcı fonksiyonlar sunar.
*/

// Tüm etkinlikler burada saklanır (yükleme tamamlandıktan sonra)
let tumEtkinliklerCache = [];
let yuklemeSozu = null;

/**
 * etkinlikler.json dosyasını fetch ile yükler ve belleğe alır.
 * Tekrar çağrıldığında cache'ten döner.
 */
function etkinlikleriYukle() {
  if (yuklemeSozu) {
    return yuklemeSozu;
  }

  yuklemeSozu = fetch('veri/etkinlikler.json')
    .then((cevap) => {
      if (!cevap.ok) {
        throw new Error('Etkinlik verileri yüklenemedi: ' + cevap.status);
      }
      return cevap.json();
    })
    .then((veri) => {
      tumEtkinliklerCache = veri;
      return veri;
    })
    .catch((hata) => {
      console.error('Etkinlik yükleme hatası:', hata);
      yuklemeSozu = null;
      throw hata;
    });

  return yuklemeSozu;
}

/**
 * Yüklenmiş tüm etkinlikleri döndürür.
 */
function tumEtkinlikleriGetir() {
  return [...tumEtkinliklerCache];
}

/**
 * ID'ye göre tek bir etkinliği döndürür.
 */
function etkinlikGetirById(id) {
  const sayisalId = Number(id);
  return tumEtkinliklerCache.find((e) => e.id === sayisalId) || null;
}

/**
 * Gelişmiş filtre: kategori dizisi, arama metni, tarih aralığı.
 * Boş parametreler filtre uygulamaz.
 */
function etkinlikFiltrele({ kategoriler = [], aramaMetni = '', tarihBaslangic = null, tarihBitis = null } = {}) {
  let sonuc = [...tumEtkinliklerCache];

  // Kategori filtresi (çoklu seçim)
  if (kategoriler && kategoriler.length > 0) {
    sonuc = sonuc.filter((e) => kategoriler.includes(e.kategori));
  }

  // Arama filtresi — başlık, açıklama ve etiketlerde arar
  if (aramaMetni && aramaMetni.trim() !== '') {
    const arama = aramaMetni.toLocaleLowerCase('tr-TR').trim();
    sonuc = sonuc.filter((e) => {
      const baslik = (e.baslik || '').toLocaleLowerCase('tr-TR');
      const kisa = (e.aciklama_kisa || '').toLocaleLowerCase('tr-TR');
      const uzun = (e.aciklama_uzun || '').toLocaleLowerCase('tr-TR');
      const mekan = (e.mekan || '').toLocaleLowerCase('tr-TR');
      const sanatci = (e.konusmaci_sanatci || '').toLocaleLowerCase('tr-TR');
      const etiketler = (e.etiketler || []).join(' ').toLocaleLowerCase('tr-TR');
      return (
        baslik.includes(arama) ||
        kisa.includes(arama) ||
        uzun.includes(arama) ||
        mekan.includes(arama) ||
        sanatci.includes(arama) ||
        etiketler.includes(arama)
      );
    });
  }

  // Tarih aralığı filtresi
  if (tarihBaslangic) {
    sonuc = sonuc.filter((e) => e.tarih >= tarihBaslangic);
  }
  if (tarihBitis) {
    sonuc = sonuc.filter((e) => e.tarih <= tarihBitis);
  }

  return sonuc;
}

/**
 * Tüm benzersiz kategorileri döndürür.
 */
function kategorileriGetir() {
  const set = new Set(tumEtkinliklerCache.map((e) => e.kategori));
  return Array.from(set);
}

/**
 * Öne çıkan etkinlikleri döndürür.
 */
function oneCikanEtkinlikler() {
  return tumEtkinliklerCache.filter((e) => e.one_cikan === true);
}

/**
 * Bugünden itibaren en yakın N etkinliği döndürür.
 */
function yaklasanEtkinlikler(adet = 5) {
  const bugun = yeniTarih();
  return tumEtkinliklerCache
    .filter((e) => new Date(e.tarih) >= bugun)
    .sort((a, b) => new Date(a.tarih) - new Date(b.tarih))
    .slice(0, adet);
}

/**
 * Belirli yıl ve aydaki etkinlikleri döndürür.
 */
function tariheGoreEtkinlikler(yil, ay) {
  return tumEtkinliklerCache.filter((e) => {
    const tarih = new Date(e.tarih);
    return tarih.getFullYear() === yil && tarih.getMonth() === ay;
  });
}

/**
 * Verilen listeyi sıralar.
 * Sıralama türleri: 'tarih-yakin', 'tarih-uzak', 'isim-az', 'kategori'
 */
function etkinlikleriSirala(liste, sıralamaTuru) {
  const kopya = [...liste];
  switch (sıralamaTuru) {
    case 'tarih-yakin':
      return kopya.sort((a, b) => new Date(a.tarih) - new Date(b.tarih));
    case 'tarih-uzak':
      return kopya.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
    case 'isim-az':
      return kopya.sort((a, b) => a.baslik.localeCompare(b.baslik, 'tr'));
    case 'kategori':
      return kopya.sort((a, b) => a.kategori.localeCompare(b.kategori, 'tr'));
    default:
      return kopya;
  }
}

/**
 * Aynı kategorideki benzer etkinlikleri döndürür (kendisi hariç).
 */
function benzerEtkinlikler(etkinlik, adet = 3) {
  return tumEtkinliklerCache
    .filter((e) => e.kategori === etkinlik.kategori && e.id !== etkinlik.id)
    .slice(0, adet);
}

/**
 * Bugünün tarihini saat bilgisi olmadan döndürür.
 */
function yeniTarih() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
