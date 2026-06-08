/*
  hakkimizda.js
  Hakkımızda sayfası mantığı:
  - Ortak sayfa kurulumu (header, footer, hamburger, scroll gölgesi)
  - Intersection Observer ile kartların kademeli fade-in görünümü
  - İstatistik sayaçlarının animasyonlu artırılması (0 → hedef değer)

  NOT: Döküman kuralları gereği inline script yasaktır. Bu nedenle
  hakkimizda.html içindeki tüm JavaScript mantığı bu dosyaya taşınmıştır.
*/

document.addEventListener('DOMContentLoaded', () => {
  sayfaKurulumu('hakkimizda.html');

  kartlariGozlemle();
  istatistikSayaclariniKur();
});

/**
 * .reveal-kart sınıflı tüm kartları görünüm alanına girdiklerinde
 * .gorunur sınıfıyla yumuşakça gösterir.
 */
function kartlariGozlemle() {
  const kartlar = document.querySelectorAll('.reveal-kart');
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
 * İstatistik sayaçlarının (data-hedef) değerini 0'dan hedefine
 * yumuşakça animasyonla artırır. Her sayaç görünüm alanına girdiğinde
 * tek seferlik tetiklenir.
 */
function istatistikSayaclariniKur() {
  const sayaclar = document.querySelectorAll('.istatistik-sayi');
  if (sayaclar.length === 0) return;

  const gozlemci = new IntersectionObserver((girisler) => {
    girisler.forEach((giris) => {
      if (giris.isIntersecting) {
        const eleman = giris.target;
        const hedef = parseInt(eleman.dataset.hedef, 10);
        sayacAnimasyonu(eleman, hedef);
        gozlemci.unobserve(eleman);
      }
    });
  }, { threshold: 0.5 });

  sayaclar.forEach((s) => gozlemci.observe(s));
}

/**
 * Verilen elemanın içeriğini 0'dan hedef değere kadar animasyonla artırır.
 * Büyük sayılarda (>=1000) Türkçe sayı formatı kullanılır.
 */
function sayacAnimasyonu(eleman, hedef) {
  const sure = 2000;
  const adimSayisi = 60;
  const adimSuresi = sure / adimSayisi;
  const artis = hedef / adimSayisi;
  let mevcut = 0;

  const zamanlayici = setInterval(() => {
    mevcut += artis;
    if (mevcut >= hedef) {
      mevcut = hedef;
      clearInterval(zamanlayici);
    }

    if (hedef >= 1000) {
      eleman.textContent = Math.floor(mevcut).toLocaleString('tr-TR') + '+';
    } else {
      eleman.textContent = Math.floor(mevcut) + '+';
    }
  }, adimSuresi);
}
