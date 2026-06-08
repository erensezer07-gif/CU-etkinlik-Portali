/*
  katilim-formu.js
  Detay sayfası modal formunun doğrulama ve gönderim mantığı.
  Gerçek gönderim yoktur — başarılı validasyon sonrası yeşil mesaj gösterilir.
*/

function katilimFormuKur(etkinlik, modalKapatCagrisi) {
  const form = document.getElementById('katilimFormu');
  if (!form) return;

  const basariAlani = document.getElementById('formBasariMesaji');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Önceki hataları temizle
    form.querySelectorAll('.form-hata').forEach((el) => (el.textContent = ''));
    form.querySelectorAll('.form-kontrol').forEach((el) => el.classList.remove('hatali'));

    const dogrulamaSonucu = formuDogrula();
    if (!dogrulamaSonucu.gecerli) {
      hatalariGoster(dogrulamaSonucu.hatalar);
      return;
    }

    // Başarılı gönderim (simülasyon)
    basariAlani.textContent = `✅ Başvurunuz alındı! "${etkinlik.baslik}" etkinliği için kayıt yaptırdınız. Onay e-postası gönderilecektir.`;
    basariAlani.classList.remove('gizle');
    form.querySelector('button[type="submit"]').disabled = true;

    setTimeout(() => {
      if (typeof modalKapatCagrisi === 'function') {
        modalKapatCagrisi();
      }
      // Sıfırla
      form.reset();
      basariAlani.classList.add('gizle');
      form.querySelector('button[type="submit"]').disabled = false;
    }, 3000);
  });
}

function formuDogrula() {
  const hatalar = {};

  const adSoyad = document.getElementById('adSoyad').value.trim();
  if (adSoyad.length < 3) {
    hatalar.adSoyad = 'Ad soyad en az 3 karakter olmalı.';
  }

  const eposta = document.getElementById('eposta').value.trim();
  const epostaRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!eposta) {
    hatalar.eposta = 'E-posta zorunludur.';
  } else if (!epostaRegex.test(eposta)) {
    hatalar.eposta = 'Geçerli bir e-posta adresi girin.';
  }

  const telefon = document.getElementById('telefon').value.trim();
  if (telefon) {
    const sadeceSayi = telefon.replace(/\D/g, '');
    if (sadeceSayi.length < 10 || sadeceSayi.length > 11) {
      hatalar.telefon = 'Telefon 10 veya 11 haneli olmalı.';
    }
  }

  const bolum = document.getElementById('bolum').value;
  if (!bolum) {
    hatalar.bolum = 'Lütfen bir bölüm seçin.';
  }

  const kisiSayisi = parseInt(document.getElementById('kisiSayisi').value, 10);
  if (isNaN(kisiSayisi) || kisiSayisi < 1 || kisiSayisi > 5) {
    hatalar.kisiSayisi = 'Katılımcı sayısı 1 ile 5 arasında olmalı.';
  }

  return {
    gecerli: Object.keys(hatalar).length === 0,
    hatalar,
  };
}

function hatalariGoster(hatalar) {
  Object.keys(hatalar).forEach((alan) => {
    const hataElementi = document.getElementById(alan + 'Hata');
    const inputElementi = document.getElementById(alan);
    if (hataElementi) hataElementi.textContent = hatalar[alan];
    if (inputElementi) inputElementi.classList.add('hatali');
  });
  // İlk hatalı inputa odaklan
  const ilkHataAlani = Object.keys(hatalar)[0];
  if (ilkHataAlani) {
    const el = document.getElementById(ilkHataAlani);
    if (el) el.focus();
  }
}
