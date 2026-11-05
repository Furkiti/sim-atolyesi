# Sim Atölyesi — Claude başlangıç notu

Bu repo mevcut, çalışan oyundur. Devam etmeden önce **[docs/CLAUDE_HANDOFF.md](docs/CLAUDE_HANDOFF.md)** dosyasını oku; güncel ürün davranışı, mimari, kararlar, testler ve yayın adımları orada.

## Mevcut checkpoint

- Canlı oyun: https://furkiti.github.io/sim-atolyesi/?v=21&mod=basili
- Repo: https://github.com/Furkiti/sim-atolyesi
- Güncel geliştirme: v21 — temiz/kolay kaydırılan ve sırayla açılan sergi; daha net cımbız ve hızlı küçük soyma; üç basılı döküş yerleşimi; rastgele artıklar, huni–kavanoz ve isteğe bağlı son vuruş. Ayrıntı: [docs/v21-feel-and-gallery.md](docs/v21-feel-and-gallery.md).
- Önceki sabit nokta: `v19-handoff` Git etiketi. Bu etiket tarihsel v19 sürümüdür.
- Kaynak proje bu klasördür; derlenmiş giriş `game.js`, asıl uygulama `src/main.js`.
- Son doğrulama: `npm run build` başarılı, 129 test başarılı; mobil bitiş, gerçek sergi sürükleme, 8× yoğunluk ve aynı belge içinde bölüm geçişi denendi.

## Çalıştırma

```sh
npm ci
npm run dev
```

http://localhost:4173 — ESM/Three.js/WebGL. Geliştirmede `game.js` paketlenmiş olarak kullanılır; kaynak değişince `npm run build` çalıştırıp sayfayı yenile.

```sh
npm run build
npm test
```

## Korunacak kararlar

- Kullanıcı Türkçe konuşuyor ve telefonu üzerinden, ChatGPT gerektirmeyen GitHub Pages bağlantısından deniyor. Rutin uygulama kararlarında sürekli teyit isteyerek işi bölme.
- Sim sonlu malzemedir. Fırça boş alana boya basmamalı; sim bırakınca çoğalmamalı.
- Basılı tut modu bilinçli olarak yönlendirilmiş bir akıştır; tam serbest fizik gibi yeniden yazılması istenmiş değil.
- Görünür eksikleri otomatik boyama. Son rötuş toleransı çok düşüktür.
- Katalogda altı bölüm var; oyuncu ilkinden sırayla açar. Kapatılan dört eski bölümü kendiliğinden açma.
- Çalışma kamerası sabittir; sergi, geri dönüş ve tablonun içine girerek bölüm geçişinde hareket eder. İlk parmak kontrol eder; ikinci parmak devralmaz.
- Oyun hızı 1x–4x’tir. Hızı çarptıktan sonra fiziği küçük adımlara böl; FPS ve fırça hareketlerini tekrar tekrar hızlandırma.
- Bitişte ortadaki posteri kapatan modal ekleme. Altı açık bölüm tek sergi sırasında bulunur. Bitmiş eserler gerçek kayıttan, bitmemiş/kilitliler bulanık önizlemeden gelir; ilk eserin soluna sahte çerçeve koyma. Yeni bölümü sayfa yükleyerek açma.
- Kaynak değiştiyse derlenmiş `game.js` ve üretilen dosyaları da commit et. Pages iş akışı sunucuda derleme yapmaz.
- `game.js`, `src/reference-levels.js`, `src/peel-pieces.js` üretilir; bunları ana düzenleme noktası yapma.
- `docs/v*.md` tarihsel notlardır. Güncel davranış için devir belgesi ve kod önceliklidir.

Görsel araştırma ve kararlar: [docs/v20-ui-references.md](docs/v20-ui-references.md). Üç özgün yön: [docs/v20-reference-board.html](docs/v20-reference-board.html). Mikro CPU ölçümü: `node scripts/benchmark-hold.mjs`.

- `extraFinish` son dokunuşu sonraki boşaltma için açıp kapatır. Mevcut gevşek paketler tutulup bırakılır; kaplama değişmez, yeni tane yaratılmaz.
- `holdPlacement`: `sheet` klasik, `width` hedef genişliğinde üst şerit, `local` ayrı parçaların üstünde ayrı şeritlerdir.
- Artık simin boyutunu `dust` bayrağıyla küçültme; seçilen boyutu izler.
