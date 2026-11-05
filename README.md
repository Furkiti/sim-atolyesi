> v20: Sade stüdyo, ekran dışından gelen tek kap, kaydırılabilir altı eserlik sergi ve aynı WebGL sahnesinde tabloya girerek bölüm geçişi. [Araştırma ve teknik notlar](docs/v20-ui-references.md) · [Üç UI yönü](docs/v20-reference-board.html).

# Sim Atölyesi

**[Oyunu aç](https://furkiti.github.io/sim-atolyesi/?v=20&mod=basili)**

GitHub Pages üzerinde, giriş gerektirmeden çalışan 3B sim sanatı prototipi.

**Claude ile devam:** önce [CLAUDE.md](CLAUDE.md), ardından [ayrıntılı devir belgesi](docs/CLAUDE_HANDOFF.md). Kayıt noktası: `v19-handoff`.

Kâğıda bir kez dokun: cımbız bir kenarı tutar ve sarı parçayı yavaşça kıvırarak soyar. Aynı rengin ayrı parçaları sırayla açılır; örneğin mavi, üç ayrı parçadır. Kontrastlı, taralı yapışkan tek tek ortaya çıkar. Raftaki şişe boyanacak alanın biraz üstüne sim bırakır. Dudak gibi küçük ayrıntılara daha küçük bir doz dökülür. Parmağını yığından başlatıp simi eksik alanlara taşı. Fırça modunda sadece dökmek alanı boyamaz; simin yapışması için fırçanın tanelere temas etmesi gerekir. Boş fırça boya oluşturmaz. Fırçalanan sim incelip yanlara yayılır; parmak kalkınca yeniden dolu bir yığın gibi şişmez. Gerekirse **+ Sim** ile açık kalan bölgeye ekle.

Kaplanan alan, aralıksız ve doygun bir sim yüzeyi olur. On bir renkle Batman/Joker çiziminin tamamı ve kırmızı arka plan boyanabilir. Renk tamamlanınca **Akış** düzeni kâğıdın iki yanını tutup oluk gibi büker. Fazlalıklar ortada toplanır ve aşağıdaki kutuya yerçekimiyle düşer; son tane boşalmadan kâğıt geri açılmaz. Ardından sıradaki rengi açar. **Kenar** ve **Şerit** düzenlerinde geçişi sen yönetebilirsin. Düşen parçalar ekran dışına çıkana kadar çizilir.

Referans videodan alınan gerçek fırça ve döküş sesleri ilk dokunuşla açılır; ayarlardan kapatılabilir. İlk parmak hareketi yönetir; ikinci parmak devralmaz. Oyun alanında zoom ve sayfa kaydırma kapalıdır.

Otomatik rötuş yalnızca kaynak resimde en fazla 8 piksel (Titiz ayarda 2 piksel) ve toplam alanın %0,02’si kaldığında uygulanır. Küçük ayrıntılarda tam kaplama gerekir; görünür boşluklar boyanmaz. Parmak kalkınca renk ilerler. **Sonraki renk** düğmesi de kullanılabilir. Tamamlanmış renkleri tekrar yapmadan dönmek için `?devam=4` gibi bir bağlantı dördüncü renkten başlatır ve önceki üç rengi tamamlanmış olarak çizer.

## Oyun hızı

⚙ → **Hissiyat → Oyun hızı**: **1x, 1.25x, 1.5x, 1.75x, 2x, 3x, 4x**. Varsayılan 1x; seçim anında uygulanır ve bu tarayıcıda hatırlanır. Soyma, döküş, sim akışı, temizleme ve renk/bitiş geçişleri birlikte hızlanır. Fırça hareketin, düğmeler ve FPS ölçümü gerçek zamanda kalır. [Uygulama ve doğrulama](docs/v19-game-speed.md).

## Telefonu eğerek oyna

**[Eğim modunu aç](https://furkiti.github.io/sim-atolyesi/?v=8&mod=egim)**. Hareketi aç düğmesine dokun, tarayıcı isterse hareket iznini ver. İlk tuttuğun duruş düz kabul edilir. Telefonu sağa/sola, ileri/geri eğerek simi taşı; yapışkana değen yüzey taneleri fırça gerektirmeden tutunur. Düz say ile konumu yeniden sıfırlayabilirsin. Hassasiyet ayarlardan değişir.

Bu deney Hissiyat sekmesindeki Nasıl oynayalım? alanından seçilir. Sensörsüz ekran denemesi de bulunur ve ayrı etiketlenir. Fırça moduna dönünce fırçasız yapışma kapanır. [v8 izin, fizik ve doğrulama notları](docs/v8-phone-tilt.md).

## v7 · Cömert malzeme

Varsayılan Referans akış boyanacak parçaya göre tek yığın, adacıklar veya büyük üst bant seçer. Bol yığın / Adacıklar / Üstten şelale ayrı seçilebilir. Büyük ilk döküş yaklaşık 32–40 bin paket; 48 bin paketlik kapasite dolarsa + Sim önce fazlayı kutuya boşaltır, sonra yeniden döker. Ek döküş eksik alanın üstünü hedefler.

Merkezdeki sim artık uzun fırça hareketinde daha iyi taşınır. Yüksek kalan gevşek malzeme sırtı ve temas gölgesi görünür; bırakınca malzeme çoğalmaz. Kâğıt hafif esneyebilir veya yan kenarından tutularak elle eğilebilir. Kamera zoom yapmaz. [v7 uygulama ve uzun test notları](docs/v7-generous-material.md).

## Sağ üstteki ⚙ ayarlar

- Akış / Kenar / Şerit arayüzleri ve otomatik renk geçişi.
- **Hissiyat masası**: Kadife / Doğal / Akışkan. Mevcut yığını kaybetmeden dene.
- Ayrı hareketlilik, fırça tepkisi, genişlik ve tane boyutu ayarları.
- Yuvarlak / Yassı / Yelpaze fırça; Cam kavanoz / İnce şişe / Geniş kâse.
- Yayılan akış / İnce şerit / Üç dalga döküş. Doz aynı kalır.
- Mavi gri / Koyu petrol / Kraft yapışkan; beyaz ve ten renginin okunurluğu.
- En fazla 8 veya 2 piksel son rötuş toleransı.
- Sonraki döküş için %75–175 sim miktarı.
- Ekonomik / Dengeli / Yüksek / Özel profilleri.
- Anlık çözünürlük, gölge, parıltı, yansıma, yığın, hareketli ışık ve 30/45/60 FPS sınırı.
- FPS, kare süresi, simülasyon/çizim CPU süresi, hareketli tane sayısı, çizim çağrısı, üçgen, çözünürlük ve destekleyen tarayıcılarda JS belleği.

Hissiyat / Bölümler / Görüntü & FPS sekmeleri bulunur. Görüntü ve hissiyat ayarları oyunu sıfırlamaz ve tarayıcıda saklanır. İlerleme sayfa yenilenince sıfırlanır. CPU ölçümleri GPU süresi değildir. Telefonda gölgeleri kapatmak ve çözünürlüğü azaltmak yükü düşürür.

## Altı açık bölüm

**Gotham (Batman & Joker)**: 11 renk. **Barcelona**: 7 renk. **Mor Portre** ve **Naruto**: 8’er renk. **Şapkalı Portre**: 9 renk. **Afro Çocuk**: 8 renk. ⚙ → Bölümler ekranından seçilir. Ay Bahçesi, Çilekli Kedi, Boba Molası ve Kurbağa Pastanesi kapalıdır; eski bağlantıları Gotham’a yönelir. Kaynakları yeniden açılabilmeleri için korunur.

Tüm açık bölümler basılı tutma, fırça ve eğim modlarında bulunur. [İlk üç referans bölüm](docs/v14-reference-levels.md). [Şapkalı Portre ve Afro Çocuk kaynakları](docs/v17-two-reference-levels.md).

## Eser tamamlanınca

Poster çerçevelenir; kamera 1,65 saniyelik hareketle hafif çapraz bir galeri görünümüne geçer. Ortada yeni eser, solda son tamamladığın farklı eserin bir kısmı, sağda sıradaki bölümün bulanık tablosu görünür. **Yeni bölüm**, sağdaki önizlemenin bölümünü açar. Tamamlanan altı farklı eserin küçük görselleri bu tarayıcıda saklanır; eski sürümlerde geçmiş tutulmadığından ilk tamamlamada soldaki çerçeve boştur.

Oyun araçları çekilir. Paylaş ve Yeni bölüm alt kenarda, kaydet ve tekrar üst köşelerde durur. Paylaş desteklenen cihazlarda 1200×1600 PNG ile sistem paylaşım ekranını açar. Kaydet ve desteklenmeyen tarayıcılardaki paylaşım aynı temiz PNG’yi indirir; çerçeveler, arayüz ve efektler dosyaya eklenmez.

Düğmeler basınca esner; seçimler ve ayar paneli yumuşak geçişler kullanır. Sistem hareket azaltma tercihi açıkken dekoratif hareketler kapanır. [Galeri ve doğrulama notları](docs/v18-gallery.md).

## Geliştirme

```sh
npm ci
npm test
npm run build
npm run dev
```

Yerel geliştirme adresi: http://localhost:4173

Three.js/WebGL; sonlu malzeme, yığın basıncı, gerçek şişe ağzı, rulo maskesi ve ortak kâğıt bükülmesi. Yapışmış simler tek yüzeyde birikir; hareketli malzeme ayrı simüle edilir. [v4 uygulama ve ölçüm notları](docs/v4-material-and-mobile.md).

Şablon ve sesler prototip için kullanıcı tarafından sağlanan referans videolardan çıkarılmıştır. Gerçek zamanlı model sadeleştirilmiştir; tek tek fırça kıllarının katı cisim fiziği çözülmez.

`main` dalına push, `.github/workflows/pages.yml` üzerinden Pages yayını başlatır. Yayın paketi yalnızca `index.html`, `style.css`, derlenmiş `game.js`, `assets/` ve `audio/` içerir. Kaynak değişikliğinden sonra derlemeyi de commit etmek gerekir; çalışma zamanı için CDN gerekmez.

[v6 hissiyat ve doğrulama notları](docs/v6-feel-lab.md). Ay Bahçesi kaynak çizimi `scripts/build-garden.py` ile yeniden üretilebilir (Pillow ve numpy gerekir); çalışma zamanında Python gerekmez.
