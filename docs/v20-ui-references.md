# v20 · Sakin stüdyo, gezilebilir sergi

5 Kasım 2026. Bu çalışma, kullanıcının iki ekran görüntüsündeki alan kaybı, kalabalık kontrol dili ve kesilen bölüm geçişi üzerine yapıldı.

## Araştırılan referanslar

- [Google Arts & Culture · Pocket Gallery](https://artsandculture.google.com/project/pocket-gallery): gerçek koleksiyonlara girilen üç boyutlu sergiler. Buradan aldığımız tasarım ilkesi: eserler menü kartlarına dönüşmeden aynı duvarın parçaları olarak kalsın; gezinme bir kamera hareketi olsun. Bu, kendi tasarım yorumumuzdur.
- [National Videogame Museum × ustwo · Monument Valley: The Trilogy](https://thenvm.org/monument-valley-the-trilogy/): mimari, görsel sanat ve sakin ses dünyasının birlikte ele alındığı resmî sergi. Buradan aldığımız tasarım ilkesi: boşluk ve hareket, oyunun geri bildiriminin parçası olsun; baskın arayüz yüzeyleri eserin önüne geçmesin. Kaynak belirli bir HUD düzeni önermiyor; burada yaptığımız çıkarım bize ait.

Referansların sanatını, ikonlarını veya ekranlarını kopyalamadık. [Üç özgün yerleşim taslağı](v20-reference-board.html) bu araştırmanın uygulanabilir seçeneklerini gösteriyor.

## Üç yön ve uygulanan seçim

| Yön | Oyun ekranı | Sergi | Karar |
| --- | --- | --- | --- |
| A · Sakin stüdyo | Serif bölüm adı, çıplak çizgi ikonlar, küçük renk ilerlemesi, tek satır ipucu | Kum rengi duvar, aralıklı ince çerçeveler, küçük eser künyesi | Oyuna uygulandı |
| B · Müze bileti | Bölüm numarası ve küçük etiket, daha grafik tipografi | Dikey küratör etiketi, numaralı eser sırası | Karşılaştırma taslağı |
| C · Alet çekmecesi | Alt köşede tek açılır araç düğmesi | Daha yakın eser, altta kayan film şeridi | Karşılaştırma taslağı; kâğıt alanını tükettiği için seçilmedi |

## Uygulama

Üstteki marka ve altı kaplık raf kaldırıldı. Bölüm adı sol üstte; renk/sıra bilgisi ve sergi/ayar ikonları sağda. İkonların dokunma alanları görünür çizimlerinden büyük. Alt yardım kartının beyaz kutusu kaldırıldı; ilerleme çizgisi ve kısa ipucu bırakıldı. Basılı tutma desteği, hız seçenekleri ve tüm görüntü ayarları korunuyor.

Tek kap, bir elin tuttuğu biçimde sağ üstte ekran dışından girer. Gerçek ağız konumu sim kaynağıdır; boşaldıktan sonra ekran dışına döner. Kâğıt yukarı alındı; dış çizgi kâğıt büküldüğünde onunla bükülür.

Sergi, açık altı bölümün sonlu yatay sırasıdır. İlk eserin solunda sahte çerçeve yoktur. Tamamlanan eserler kaydedilmiş gerçek görüntüleriyle, henüz tamamlanmayanlar bulanık önizlemeyle görünür. Parmakla sürükleme, ok tuşları, ok düğmeleri ve altı küçük konum düğmesi aynı sırayı kontrol eder. Oyun sürerken sergiye girip geri dönmek mevcut boyayı korur.

Yeni bölüme girişte sonraki maskeler önceden yüklenir. Kamera hedef tabloya kayar, içine yaklaşır; aynı WebGL sahnesinde yeni kâğıda açılır. Belge, renderer ve ses bağlamı yeniden oluşturulmaz. Kamera geçişi oyun hızından bağımsızdır. Kullanıcının azaltılmış hareket tercihi de dikkate alınır.

## Performans yaklaşımı

Sim sayısı, çözünürlük, üç boyutlu parça geometrisi, ışık, gölge ve parıltı azaltılmadı. Aynı görüntünün hesaplama ve aktarım maliyeti azaltıldı:

1. Basılı akışın yoğunluk/yükseklik ızgarası, hızlandırılmış alt adımların her birinde değil, görüntü karesi başına bir kez yenilenir. Paket yolları ve yapışma birebir korunur.
2. Bağlanmış veya dökülmüş paketler aktif akış listesinden çıkarılır; sonlu sim kayıtları korunur.
3. Tüm sim kapasitesi yerine yalnızca görünen örnek matrisleri GPU'ya aktarılır.
4. Renk ve parıltı tohumları yalnızca örnek sırası/renk değiştiğinde aktarılır.
5. Canlı kaplama, tam boy iki canvas dokusunu her kare yeniden göndermek yerine mevcut 120×160 yapışma ızgarasından shader içinde oluşturulur. Çizgi sanatı üstte korunur. Renk bitişi ve PNG/JPEG dışa aktarma aynı tam çözünürlüklü CPU bake yolunu kullanır. Bu iki doku + temas ızgarasının değişen kaplama karesindeki aktarımı 3.916.800 bayttan 76.800 bayta iner (yaklaşık %98). Renk başlangıcındaki tek seferlik maskeler/glitter yüklemesi ve hareketli sim örnekleri bu hesaba dahil değildir.
6. Hareketli simin merkezine uygulanan aynı bükme dönüşümü GPU vertex shaderına taşındı. Parçanın geometrisi, normal yönü, rengi ve parıltısı korunur; JavaScript her sim için eğri trigonometrisi ve geçici nesne üretmez. Dökülen parçalar dünyadaki mevcut fizik yolunu kullanır.

`node scripts/benchmark-hold.mjs` v19 etiketiyle CPU karşılaştırmasını tekrarlar. [Ham sonuçlar](handoff/v20-cpu-benchmark.json). Bunlar fiziksel iPhone FPS ölçümü değildir. Gerçek cihazdaki GPU/termal sınırlar hâlâ cihazda ölçülmelidir; ayarlardaki canlı panel korunmuştur.

## Ölçüm ve doğrulama

Node v22 CPU karşılaştırmasında (5 koşunun ortancası, aynı sayıda gerçek paket):

| Yoğunluk / hız | v19 CPU ms | v20 CPU ms | Hareketli örnek aktarımı v19 → v20 |
| --- | --- | --- | --- |
| 1× yoğunluk / 1x | 6,36 | 6,14 | 3,84 → 2,20 MB |
| 1× yoğunluk / 4x | 7,30 | 6,04 | 3,84 → 1,41 MB |
| 8× yoğunluk / 1x | 22,80 | 21,03 | 8,26 → 8,07 MB |
| 8× yoğunluk / 4x | 35,78 | 31,38 | 8,26 → 7,29 MB |

Bu mikro ölçüm kaplama canvas işini, WebGL renderını ve GPU sürelerini içermez; GPU’ya taşınan eğrinin yalnızca CPU kazancını gösterir. Tek başına telefon FPS sonucu olarak yorumlanmamalıdır.

119 otomatik test; son renkten tam kaplama/bükme/galeri; 8× yoğunluk ve iki sıra; gerçek sürükleme ile sonraki tablo; aynı oturum kimliğiyle Barcelona’ya giriş mobil tarayıcı görünümünde doğrulandı. Fiziksel telefon FPS ölçümü hâlâ kullanıcı cihazında yapılmalı.
