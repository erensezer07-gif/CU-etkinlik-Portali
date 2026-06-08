# Sivas Cumhuriyet Üniversitesi — Etkinlik Portalı

Sivas Cumhuriyet Üniversitesi kampüsünde düzenlenen etkinlikleri
listeleyen, filtreleyen ve takvim üzerinde gösteren web uygulaması.

## Teknolojiler
- HTML5
- CSS3 (Flexbox, Grid, CSS Variables, Media Queries)
- Vanilla JavaScript (ES6+)
- Google Fonts (Merriweather + Inter)

## Kurulum
1. Proje klasörünü bilgisayarınıza indirin
2. Herhangi bir code editöründe açın (VS Code önerilir)
3. `index.html` dosyasını tarayıcıda açın
   - ÖNEMLİ: JSON dosyası fetch ile yüklendiği için
     doğrudan dosya olarak açmak yerine bir local server kullanın:
   - VS Code: "Live Server" eklentisini kurun → sağ tıklayıp "Open with Live Server"
   - Veya terminalde: `python -m http.server 8000` → tarayıcıda localhost:8000

## Sayfa Yapısı
- `index.html` → Ana Sayfa (etkinlik listesi, arama, filtreleme)
- `etkinlik-detay.html` → Etkinlik Detay (dinamik içerik, katılım formu)
- `takvim.html` → Takvim Görünümü (aylık takvim)
- `hakkimizda.html` → Hakkımızda (portal ve üniversite bilgisi)

## Hazırlayan
- Ad Soyad: [Öğrenci Adı Soyadı]
- Bölüm: [Bölüm Adı]
- Ders: [Ders Adı]
- Dönem: 2024-2025 Bahar
