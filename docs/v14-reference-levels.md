# v14 · Üç referans video bölümü

Kullanıcının sağladığı üç videodan ayrı oynanabilir şablonlar hazırlandı:

| Bölüm | Kimlik | Renk |
| --- | --- | --- |
| Barcelona | `barcelona` | 7 |
| Mor Portre | `mor-portre` | 8 |
| Naruto | `naruto` | 8 |

Çizimler videodaki kâğıdın perspektifi düzeltilerek renk bölgelerine ve çizgi katmanına ayrıldı. Kaynaklarda görünen hesaplar sırasıyla @SAND.ART95, @SAND.ART56 ve @FIRSTOFZEROONE. Ham videolar depoya eklenmedi. Portreye kişi kimliği atanmadı. Naruto videosunda kadraj dışında kalan sağ kol kenarı ve yaprak işareti şablon geometrisiyle tamamlandı. Sim dokusu ve kameranın parlamaları maskelere taşınmadı.

## Yeniden üretim

`art/reference-levels/` içindeki 600×800 indeksli renk katmanları, çizgi katmanları ve `catalog.json` kaynak kabul edilir. `scripts/build-reference-levels.mjs`, PNG renk maskelerini, çizgileri, bölüm önizlemelerini ve `src/reference-levels.js` alan/ilk döküş konumu verilerini üretir. Ardından mevcut soyma derleyicisi her rengin ayrı parçalarını oluşturur. `npm run build` tüm adımları çalıştırır; Python veya video dosyası gerekmez.

Sekiz bölümde toplam 66 renk vardır. Yeni maskeler kâğıdı boşluk ve çakışma bırakmadan böler; her renk için geçerli bir ilk döküş konumu ve ayrı soyma parçaları bulunur. Mevcut basılı tutma, fırça ve eğim mekanikleri korunur.

## Doğrulama

- `npm run build` başarılı.
- `npm test`: 103 test başarılı. Tüm bölümlerin renkleri, basılı tutma modunun en düşük yoğunluğu 0,5 ile tam kaplamaya ulaşır.
- Kaynak maske alanları, boyutlar, döküş noktaları, önizlemeler ve soyma parçaları otomatik doğrulanır.
- 390×844 tarayıcı görünümünde üç yeni bölümün son rengi gerçek arayüzden oynandı ve %100 kaplandı; bölüm seçicisinden geçiş kontrol edildi. Bu fiziksel telefon testi değildir.
- Yerel görsel kanıtlar: `qa/v14-barcelona-complete.png`, `qa/v14-portrait-complete.png`, `qa/v14-naruto-complete.png`, `qa/v14-level-selector.png` (QA dosyaları Git dışında).
