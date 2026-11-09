# Sim Atölyesi oyun modu denemeleri

10 Kasım 2026 · v37

## Üç oynanışın karşılaştırması

| Mod | Oyuncunun kararı | Denemede gördüğüm | Üründeki yeri |
| --- | --- | --- | --- |
| Sim Püskürtücü | Şişeyi seç, beş yuvayı kullan, alt sıraya ulaşan renkleri sırala. | Gotham'ın dokuz şeridi bitti. Gece siyahı kapalı bir şeridi beklerken 50'de kaldı. Şerit açılınca aynı şişe devreye girdi. Farklı temas stilleri çalışırken tablo bitip sergiye geçildi. | Tek elle oynanan ana bulmaca için ilk aday. Sayacın düşmesi ve sıranın açılması bir sonraki hamleyi görünür kılıyor. |
| Basılı tut ve yönlendir | Kâğıtta hedefi seç, fazla simi farklı yöne sürükle. | Gotham'ın siyah renginde aynı simleri üst, alt ve yan bölgeler arasında taşıdım. %98 eşiği geçilince temizlik başladı. Geç aşamada siyah simle koyu yapışkanı ayırmak zorlaştı. Açık bölgelerin üzerinde kontrastlı halkalar ekledim. | Kâğıt, sim ve doğrudan dokunma ilişkisini en iyi veren rahat atölye modu. |
| Telefon eğimi | Yığını cihazın açısıyla yönlendir ve ne kadar eğeceğine karar ver. | Gotham'ın dudak bölgesini ekran eğimiyle %98,3'e taşıdım. Yığının yapışkanla teması ve kenara giden tanecikler ayrı sayıldı. Ek döküş artık en büyük açık yamaya yakın başlıyor. | Malzemeyi yönlendirme hissi güçlü bir alternatif. İlk oyun için sensör erişimi ve oyuncunun telefonu tutuşu ek bir adım getiriyor. [Hareket izni](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static) |

Bu denemeye göre ilk oyun ve kısa seanslar için **Sim Püskürtücü**, daha uzun ve serbest oturumlar için **Dokunduğun Yere Akıt** en güçlü ikili. Eğimi fiziksel etkileşim isteyen oyuncuya seçenek olarak sunardım. Bu bir ürün hipotezi. Üç modun oyuncu tutma verisi ve fiziksel iPhone ölçümü henüz yok.

## Pazar ve referanslar

- Gönderilen This is Blast reklamında alt panel beş koyu yuva ve dört sütun numaralı şişeden oluşuyor. Mor şişe bir süre 22 atışla bekliyor ve siyah şişe ikinci yuvaya girip ateş ediyor. Bizde bu düzeni özgün şişe çizimleriyle kurdum. Resim silinerek açılmak yerine her temasla gerçek sim rengini kazanıyor. Bekleyen şişe geri alınabiliyor ve tamamlanan şerit kaydediliyor. [This is Blast!](https://apps.apple.com/us/app/this-is-blast/id6738323233)
- Pixel Flow tek dokunuşla aynı renge ateş etme, sonlu mühimmat ve beş bekleme yeri üzerine kurulu. Food Hunt sırayı kısıtlı yuvalarla anlamlı kılıyor. Bizde sıra, resmin alttan yukarı açılan bölgelerinden geliyor. [Pixel Flow!](https://apps.apple.com/us/app/pixel-flow/id6751056652) · [Food Hunt](https://apps.apple.com/us/app/food-hunt-pixel-puzzle/id6769314786)
- Sand Blocks, akan malzemeyi eşleşen şekle taşımanın kendi başına bulmaca olabileceğini gösteren yakın bir referans. Baktığım ücretsiz iPhone bulmaca listelerinde Food Hunt Türkiye'de 3. sıradaydı ve Sand Blocks ABD'de ilk 10'daydı. Sıralamalar anlık mağaza gözlemidir. [Sand Blocks](https://apps.apple.com/us/app/sand-blocks-drop-puzzle/id6757140488) · [Türkiye listesi](https://apps.apple.com/tr/iphone/charts/7012?chart=top-free&l=tr) · [ABD listesi](https://apps.apple.com/us/iphone/charts/7012?chart=top-free)

## Görsel denemeler ve maliyet

- **Kristal** küçük parlak kesitler ve kısa çarpma kıvılcımları kullanıyor. **Işık halkası** temas noktasından yayılan sıcak bir halka bırakıyor. **Yumuşak sis** daha geniş bir taneli huzme ve daha kısa, daha sakin bir temas izi kullanıyor. Üçünü aynı Gotham turunda değiştirdim.
- **Hafif nabız** ve **Belirgin hat** yalnızca açık yapışkanın üstüne uygulanıyor. İlerleme yüksekken en çok yedi ayrı yama işaretleniyor. İpucu yalnızca oyun sırasında çiziliyor ve kayıt görseline girmiyor.
- Püskürtme tek bir WebGL nokta grubunda çiziliyor. Uçuşu ve hafif sıçramayı shader hesaplıyor. Yüzeyde yerleşen renkler 120 × 160 hücrelik durum dokusunda tutuluyor. Oyunda yüz binlerce ayrı uçuş nesnesi açılmıyor. [Three.js Points](https://threejs.org/docs/pages/Points.html) · [ShaderMaterial](https://threejs.org/docs/pages/ShaderMaterial.html) · [WebGL çizim gruplama](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#batch_draw_calls)

Telefon boyutuna ayarlanmış masaüstü tarayıcısındaki örneklerde, Gotham püskürtme sırasında yaklaşık 60 FPS ve 0,1–0,2 ms simülasyon CPU süresi gösterdi. Yoğun basılı tutma örneğinde 8,2 ms simülasyon ve 2,5 ms çizim CPU süresi görüldü. Dudak bölgesinin ekran eğimi denemesinde 60 FPS görüldü. Bunlar farklı yoğunluklardaki gözlemler. Fiziksel cihaz veya GPU karşılaştırması yapılmadı.
