# v28 — Sergi ve hissiyat

%100 kaplamadan sonra otomatik bitiş korunur. Eski modlar ve kullanıcı kayıtları korunur; yeni modlar ayrı seçeneklerdir.

## Düzeltilen geçişler

- **Devam et / Oyuna dön / mevcut tabloya dokun:** yeni eser girişindeki aynı çerçeve saydamlaşması ve kamera yaklaşması kullanılır. `beginEntry` null resimle mevcut oyunu korur; yeniden başlamaz, eski bir poster resmi üstüne konmaz.
- Serbest sim, yığın, düşen sim ve masa taneleri `workOpacity` ve ortak shader uniformuyla yavaşça gizlenir/görünür. Sergide fizik ve stoklar korunarak durur. Matris sayısı, malzeme miktarı veya tane boyutu fade için değiştirilmez.
- Çerçevenin normal sergiye açılma görünürlüğü de kademelidir; tam görünürken opak derinlik davranışı korunur.
- Yeni bölümün ilk Sand/maskesi, sim dokusu ve soyulacak katmanları kamera başlamadan hazırlanır. Aynı galeri verisi yeniden konumlandırılırken altı tablo dokusu/geometrisi tekrar üretilmez. Giriş resmi de hareketten önce GPU'ya yüklenir, kaplama/çerçeve shader'ı hazırlanır. Geçici keskin giriş resmi sonrasında bulanık galeri önizlemesinin yerine kalmaz. Aynı canvas, renderer ve oturum devam eder.
- Temizlikte eski basılı tut pozu artık yeni renk kağıdına taşınmaz. Son dokunuş → düzleşme pozu önceki hareketten kesintisiz başlar ve sıfıra yumuşar.

## Ses

Sergi/geçiş/bitmiş ekranı oyun sesinden ayrı bir ses sahnesidir. Fırça/dökme döngüsü durdurulur; geri dönerken gerekiyorsa dökme yeniden başlar. Sayfa gizlenince ses susar. `GalleryMusic`, Web Audio OfflineAudioContext ile özgün, hafif bir dört akorlu ambient döngü hazırlar; ana animasyon iş parçacığında milyonlarca örnek hesaplamaz. Sergide açılıp oyunda yumuşakça söner. Görüntü & FPS → **Sergi müziği** ve genel Ses düğmesiyle kapatılabilir. Tarayıcının normal ilk etkileşim ses kuralı geçerlidir.

## Yeni seçenekler

| Ayar | Davranış |
| --- | --- |
| Hissiyat → Döküş yerleşimi → **Yerel · birleşik şerit** | Yükseklik farkı ≤72 ve yatay boşluk ≤36 olan yakın yerel kaynaklar tek bir sürekli şişe geçişine birleşir. Gereksiz alt kaynaklar yine elenir. Ayrı yükseklikteki uzak parçalar ayrı kalır. Seçilen bir/iki sıra korunur. Barcelona bordo üst parçaları tek şerit olur. |
| Görüntü & FPS → Tablo parıltısı → **Işıltılı** | Yapışmış kaplamada ve bitmiş komşu sergi eserlerinde aralıklı daha güçlü mikro parlamalar ve yumuşak ışık geçişi. Boş yapışkan/koruyucu kağıda eklenmez; serbest tanelerin davranışını değiştirmez. Ana Parıltı efektleri kapalıysa devre dışıdır. |
| Hissiyat → Son dokunuş açık → Tarz → **Rastgele hareketler** | Her boşaltmada none/fold/tap/left/right/diagonal/lift/sweep arasında seçim. Ek hareket olmaması da olası. En fazla mevcut küçük toz bütçesi tutulur; yeni tane yaratılmaz. Sola/sağa/çapraza çıkışlar gerçek ilgili kenardan çıkar. Üst tutuş ve tek elle süpürme mevcut el modellerini kullanır. |

Yeni varsayılanlar: `finishStyle:tap`, `posterShine:classic`, `galleryMusic:true`; son dokunuş varsayılan kapalı kalır. `holdPresetVersion:22` değişmez. Ayarları değiştirdikten sonra **Bu rengi yeniden dene** ile yeni yerleşim hemen denenebilir.

## Doğrulama

- Build başarılı, **160 test başarılı**. Regresyonlar: kaynakların bütün 51 maskeyi bir/iki sıra mantığıyla beslemesi; Barcelona birleşik şerit; malzeme korunumu; bütün sekiz son dokunuş seçimi ve kenarları; çerçevenin devam yolunda kademeli sönmesi; sim fade'inin monotonluğu ve ses sahnesi ayrımı.
- Mobil boyutta gerçek UI ile sergiye çık/devam et, sim stoğu korunumu, basılı finalin %100→temizlik→sergi bitişi ve aynı oturumda Barcelona'ya geçiş denendi.
- Bu kontroller fiziksel iPhone FPS veya hoparlör dinleme ölçümü değildir. Kullanıcının bu mesajda söylediği yeni video henüz ekli değildir; mevcut kod, fotoğraf ve önceki davranışlar temel alındı.
