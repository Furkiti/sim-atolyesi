# Sim Atölyesi

**[Oyunu aç](https://furkiti.github.io/sim-atolyesi/?v=6)**

GitHub Pages üzerinde, giriş gerektirmeden çalışan 3B sim sanatı prototipi.

Kâğıda bir kez dokun: cımbız bir kenarı tutar ve sarı parçayı yavaşça kıvırarak soyar. Aynı rengin ayrı parçaları sırayla açılır; örneğin mavi, üç ayrı parçadır. Kontrastlı, taralı yapışkan tek tek ortaya çıkar. Raftaki şişe boyanacak alanın biraz üstüne sim bırakır. Dudak gibi küçük ayrıntılara daha küçük bir doz dökülür. Parmağını yığından başlatıp simi eksik alanlara taşı. Sadece dökmek alanı boyamaz; simin yapışması için fırçanın tanelere temas etmesi gerekir. Boş fırça boya oluşturmaz. Fırçalanan sim incelip yanlara yayılır; parmak kalkınca yeniden dolu bir yığın gibi şişmez. Gerekirse **+ Sim** ile açık kalan bölgeye ekle.

Kaplanan alan, aralıksız ve doygun bir sim yüzeyi olur. On bir renkle Batman/Joker çiziminin tamamı ve kırmızı arka plan boyanabilir. Renk tamamlanınca **Akış** düzeni kâğıdın iki yanını tutup oluk gibi büker. Fazlalıklar ortada toplanır ve aşağıdaki kutuya yerçekimiyle düşer; son tane boşalmadan kâğıt geri açılmaz. Ardından sıradaki rengi açar. **Kenar** ve **Şerit** düzenlerinde geçişi sen yönetebilirsin. Düşen parçalar ekran dışına çıkana kadar çizilir.

Referans videodan alınan gerçek fırça ve döküş sesleri ilk dokunuşla açılır; ayarlardan kapatılabilir. İlk parmak hareketi yönetir; ikinci parmak devralmaz. Oyun alanında zoom ve sayfa kaydırma kapalıdır.

Otomatik rötuş yalnızca kaynak resimde en fazla 8 piksel (Titiz ayarda 2 piksel) ve toplam alanın %0,02’si kaldığında uygulanır. Küçük ayrıntılarda tam kaplama gerekir; görünür boşluklar boyanmaz. Parmak kalkınca renk ilerler. **Sonraki renk** düğmesi de kullanılabilir. Tamamlanmış renkleri tekrar yapmadan dönmek için `?devam=4` gibi bir bağlantı dördüncü renkten başlatır ve önceki üç rengi tamamlanmış olarak çizer.

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

Ayarlar oyunu sıfırlamaz ve tarayıcıda saklanır. İlerleme sayfa yenilenince sıfırlanır. CPU ölçümleri GPU süresi değildir. Telefonda gölgeleri kapatmak ve çözünürlüğü azaltmak yükü düşürür.

## İki bölüm

**Gotham**: mevcut 11 renkli poster. **[Ay Bahçesi](https://furkiti.github.io/sim-atolyesi/?v=6&bolum=ay-bahcesi)**: bu oyun için kodla çizilmiş, ay ve çiçeklerin arasında bir tilki; 8 renk. Ayarlardan bölüm seçilir; eser bitince diğer bölüme geçilebilir. `?bolum=ay-bahcesi&devam=6` o bölümün altıncı renginden başlar. Bölüm değiştirmek mevcut çalışmayı yeniden başlatır.

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
