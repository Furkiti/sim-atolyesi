# v17 · İki yeni video bölümü

Kullanıcının sağladığı 4099e5c427c5447cba712114afe41f5c.mov ve c222b2dc3d55412d8d75babf04e9fef9.mov ayrı oynanabilir şablonlara dönüştürüldü.

| Bölüm | Kimlik | Renk sayısı |
| --- | --- | --- |
| Şapkalı Portre | sapkali-portre | 9 |
| Afro Çocuk | afro-cocuk | 8 |

İlk videoda mor şapka, turuncu dudak, yeşil kapüşon, gül kurusu ten, gümüş/beyaz ayrıntılar ve mavi/kırmızı fon var. Portreye kişi kimliği atanmadı. İkinci videoda büyük afro saçlar, kırmızı tişört, sarı şort, beyaz çoraplar, sıcak ten ve mavi ayakkabılar bulunuyor; arka plan sağda yeşil, solda pembe. Video son pembe döküş sırasında bittiğinden fonun kalan alanı aynı iki renkle tamamlandı.

Videolardaki hesap işaretleri sırasıyla @SAND.ART56 ve @GLITTERIA.SHOP. Ham videolar, eller ve filigranlar oyun dosyalarına eklenmedi. Kâğıdın perspektifi düzeltildi; fotoğrafın sim parlamaları ayrı renk adaları yapılmadı. İlk videoda kadraj dışında kalan kapüşon kenarı ve birkaç kumaş çizgisi şablon geometrisiyle tamamlandı. Şapkanın açık arka kısmı, beyaz çoraplar ve yüz çizgileri ayrı maskelerle netleştirildi.

600×800 indeksli kaynaklar `art/reference-levels/cap-*` ve `afro-*` dosyalarında; renk sıraları `catalog.json` içinde tutulur. Mevcut `npm run build` kaynakları, PNG maskelerini, bölüm kartlarını, alan ve döküş konumlarını ve ayrı soyma parçalarını yeniden üretir.

Altı bölüm açıktır: Gotham, Barcelona, Mor Portre, Naruto, Şapkalı Portre ve Afro Çocuk. Önceden kapatılan dört bölüm kapalı kalır. Açık bölümlerde toplam 51 renk bulunur. Yeni bölümler mevcut fırça/eğim/basılı tut modlarını ve v16 bitiş kutlamasını kullanır.

## Doğrulama

- `npm run build` başarılı; `npm test`: 105 test başarılı.
- Her yeni maske 600×800; renkler kâğıdı boşluksuz ve çakışmasız kaplar. Alan, döküş noktası, soyma parçaları ve önizlemeler doğrulanır.
- Basılı tutmanın en düşük sim yoğunluğunda bütün açık bölümlerin her rengi tam kaplamaya ulaşır.
- 390×844 tarayıcı görünümünde iki yeni bölümün son rengi arayüzden oynanır; %100 kaplama, kutlama ve sonraki bölüm geçişi kontrol edilir. Fiziksel telefon testi değildir.

Yerel arayüz kontrolü tamamlandı: iki bölümün son rengi %100 kaplandı ve kutlama açıldı; Şapkalı Portre → Afro Çocuk geçişi ve bölüm kartından Şapkalı Portre seçimi doğrulandı. Görsel kanıtlar Git dışında `qa/v17-cap-complete.png`, `qa/v17-afro-complete.png` ve `qa/v17-level-selector.png` dosyalarında.
