# v18 · Yan yana çerçeveli galeri

Son renk temizlendikten sonra kâğıda üç boyutlu koyu ahşap çerçeve, ince altın iç şerit ve açık renk bir iç kenar eklenir. Kamera 1,65 saniyede hafif çapraz bir açıya geçer. Önceki tamamlanmış eser solda, sonraki bölümün bulanık önizlemesi sağda aynı boydaki çerçevelerde, biraz daha geride durur. Telefonda komşuların iç kenarları görünür; geniş ekranda galeri daha fazla açılır.

`completionLayout` dış çerçeveyi, başlık ve alt eylem alanlarının arasına sığdırır. `galleryCamera` hafif yatay açı ve güvenli alanları birlikte hesaplar. Ana çerçeve, komşu çerçeveler, gölge ve efektler Three.js sahnesinde gerçek geometridir. Normal oyun kamerası değişmez. Tekrar oynandığında galeri gizlenir ve çalışma kamerası geri gelir.

## Tamamlanma geçmişi

`GalleryHistory`, yalnızca bölüm gerçekten tamamlanınca boyalı kâğıttan alınan 480×640 JPEG’i kaydeder. En son altı farklı açık bölüm tutulur. Aynı bölümü yeniden bitirmek kaydını yeniler; solda önceki farklı eser gösterilir. Veri bu tarayıcının localStorage alanındadır, sunucuya gönderilmez. Bozuk veri, kapalı bölüm kimliği ve görsel olmayan kaynaklar kullanılmaz. Depolama kapalı veya doluysa oyun devam eder.

Eski sürümlerde geçmiş tutulmuyordu. Bu nedenle ilk v18 tamamlamasında soldaki çerçeve boştur; henüz tamamlanmamış bir bölüm bitmiş gibi gösterilmez. Sonraki tamamlamada gerçek önceki eser yerini alır.

## Sonraki bölüm ve performans

Sağdaki resim, Yeni bölüm düğmesinin hedefiyle aynı açık bölüm kaydından gelir. Önizleme yalnızca bir kez 75×100 boyutunda CPU üzerinde üç geçişli kutu bulanıklığıyla hazırlanır. Safari canvas filtre desteğine veya her karede çalışan bir blur işlemine bağlı değildir. Çerçeve geometrileri ve malzemeler paylaşılır; iki küçük görsel dışında ek büyük doku yoktur. Bitişte malzeme fiziği durmaya devam eder.

Paylaşma ve indirme, önceki sürümdeki gibi 1200×1600 temiz kâğıt görselini verir; galeri ve arayüz export içine alınmaz.

## Kontroller

- `npm run build` başarılı; `npm test`: 109 test başarılı.
- Altı ekran/güvenli kenar birleşiminde dış çerçevenin köşeleri gerçek açılı kamera ile projekte edilir; başlık ve eylemlerle çakışmadığı, telefonda yan çerçevelerin göründüğü kontrol edilir.
- Geçmişin bölüm geçişi sonrasında geri gelmesi, tekrarın kayıtları çoğaltmaması, altı kayıt sınırı, bozuk/depolanamayan veriler ve bulanıklığın keskin kaynağı değiştirmemesi doğrulanır.
- Tarayıcıda iki bölümün son rengi arayüzden tamamlanır; ilk boş çerçeve, ardından gerçek önceki tablo, bulanık sonraki tablo ve Yeni bölüm hedefi kontrol edilir. Fiziksel telefon testi değildir.

Yerel arayüz doğrulaması tamamlandı: Gotham son renk → Barcelona son renk → Mor Portre geçişleri oynandı. Barcelona bitişinde önceki `gotham`, sonraki `mor-portre` ve kayıt sayısı 2 doğrulandı. Mobil ve geniş ekran kanıtları Git dışında `qa/v18-gallery-mobile.png` ve `qa/v18-gallery-desktop.png` dosyalarındadır.
