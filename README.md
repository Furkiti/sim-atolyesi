# Sim Atölyesi

**[Oyunu aç](https://furkiti.github.io/sim-atolyesi/?v=3)**

Giriş gerektirmeyen, GitHub Pages üzerinde çalışan bir 3B sim sanatı oyunu prototipi.

## Oynanış

Herhangi bir oyun alanına bir kez dokun: sıradaki koruyucu kâğıt rulolanarak açılır. Üst raftaki ilgili kap yerinden kalkıp resmin merkezinin biraz üstüne sim döker. Fırça kendiliğinden etkinleşir. Parmağını simin içinden başlatıp taneleri açık bölgelere doğru it.

**Akış** düzeninde renk yeterince kaplanınca ve parmağın kalkınca oyun bir kez silkeler, sonraki kâğıdı açar ve yeni rengi döker. **Kenar** ve **Şerit** düzenlerinde varsayılan olarak sonraki renk düğmesini sen seçersin; düğme yine önce bir kez silkeler. Otomatik geçişi ayarlardan her düzende açıp kapatabilirsin.

Fırça yalnızca mevcut taneleri taşır; boş yerde renk üretmez. Ek sim yine merkez üstüne dökülür. İlk parmak hareketi yönetir; diğer parmaklar devralamaz. Sayfa kaydırması, çift dokunma ve pinch zoom oyun alanında kapalıdır. Ayar penceresinin içeriği kaydırılabilir.

## Sağ üstteki ⚙ ayarlar

- **Akış:** sade ekran; otomatik araç ve renk geçişleri.
- **Kenar:** çizimin yanında küçük araç düğmeleri.
- **Şerit:** altta küçük araç çubuğu ve kısa yönerge.
- **Hızlı / Detaylı:** %80 / %90 alan hedefi.
- **Sim miktarı:** sonraki döküş için %75–175. Standart doz ilk sürümden daha büyüktür.
- **Ekonomik / Dengeli / Yüksek / Özel** görüntü profilleri.
- Anında çözünürlük, gölge kalitesi, parıltı, metalik yansıma, yığın yüzeyi, hareketli ışık ve 30/45/60 FPS sınırı.
- FPS, kare süresi, simülasyon ve çizim CPU süreleri, görünür tane, çizim çağrısı, üçgen, render çözünürlüğü ve destekleyen tarayıcılarda JS belleği.

Görüntü ve düzen ayarları oyunu sıfırlamaz. Tercihler aynı tarayıcıda saklanır; resmin ilerlemesi sayfa yenilendiğinde sıfırlanır. Performans panelindeki CPU ölçümleri GPU süresi değildir.

## Uygulama

Three.js/WebGL; yerçekimi, sürtünme ve yığın basıncıyla çalışan sonlu taneler; metalik yüzeyler; kap ağzının dünya konumundan çıkan sim; silindire sarılan maske geometrisi. Silkeleme sırasında kâğıt yükselir; köşeleri zemin altına girmez. Kamera kadrajı mobil adres çubuğunun yüksekliği değiştiğinde yeniden hesaplanmaz.

Batman/Joker şablonu, prototip için sağlanan referans videodaki çizimden çıkarılmıştır. Model gerçek zamanlı çalışmak için sadeleştirilmiştir; tek tek fırça kıllarının katı cisim fiziği çözülmez.

## Geliştirme

```sh
npm ci
npm test
npm run build
npm run dev
```

http://localhost:4173

- `src/sand.js`: sonlu malzeme, yapışma, fırça, yığın ve silkeleme.
- `src/scene.js`: 3B sahne, kap / rulo animasyonları, kalite ayarları.
- `src/interaction.js`: ilk parmak sahipliği, aşama akışı, rulo/silkeleme geometrisi, FPS zamanlayıcısı.
- `src/settings.js`: doğrulanmış ve kalıcı tercihler, profiller, sim dozu.
- `src/main.js`: girdi, oyun ve ayar ekranı.
- `test/`: malzeme, çoklu dokunma, aşama tekrarları, zemin açıklığı, ayarlar ve FPS sınırı kontrolleri.

GitHub Pages `main` dalının kökünden yayınlar. Kaynak değişikliğinden sonra `npm run build` çalıştırıp derlenmiş `game.js` dosyasını kaynaklarla birlikte commit/push etmek gerekir. Çalışma zamanı kütüphaneleri pakete dahildir; Three.js için bir CDN bağlantısı gerekmez.
